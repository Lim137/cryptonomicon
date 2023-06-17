/* eslint-disable prettier/prettier */
// import { sendToWS } from "./worker";
const worker = new SharedWorker("./worker.js");
worker.port.start();
const AGGREGATE_INDEX = "5";
worker.port.addEventListener("message", (e) => {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    PRICE: price,
    MESSAGE: message,
    PARAMETER: parameter,
  } = JSON.parse(e.data);
  if (message === "INVALID_SUB") {
    window.dispatchEvent(
      new CustomEvent("socket error", { detail: parameter.split("~")[2] })
    );
  } else if (type !== AGGREGATE_INDEX || price === undefined) {
    return;
  }
  const handlers = tickersHandlers.get(currency) ?? [];
  handlers.forEach((fn) => fn(price));
});

const tickersHandlers = new Map();

function subscribeToTickerOnWS(ticker) {
  worker.port.postMessage({
    action: "SubAdd",
    subs: [`5~CCCAGG~${ticker}~USD`],
  });
}

function unsubscribeFromTickerOnWS(ticker) {
  worker.port.postMessage({
    action: "SubRemove",
    subs: [`5~CCCAGG~${ticker}~USD`],
  });
}

export const subscribeToTickers = (ticker, callback) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, callback]);
  subscribeToTickerOnWS(ticker);
};

export const unsubscribeFromTickers = (ticker) => {
  tickersHandlers.delete(ticker);
  unsubscribeFromTickerOnWS(ticker);
};

//dz
// 1. Подсветка красным некорректной валюты
// попробовать реализовать генерацию ошибки при вводе неправильного тиккера
// в файле .vue слушать через addEventListener эти ошибки и если будет такая поймана, то заменить класс на bg-red-100
// 2. Поддержка кросс-преобразования валют
// 3. Возможность работать в нескольких вкладках

//не коннектится к worker.js, а в тестовом проекте все коннектится
