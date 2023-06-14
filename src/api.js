/* eslint-disable prettier/prettier */
const API_KEY =
  "2c577907db56aff8faf35b8da454d0084214d293246bb1f6200c7d600a8e882c";
const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);
const AGGREGATE_INDEX = "5";
let incorrectTicker;
socket.addEventListener("message", (e) => {
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

// export function incorrectTickerIs() {
//   return incorrectTicker;
// }

function sendToWS(message) {
  const stringifyedMessage = JSON.stringify(message);
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifyedMessage);
    return;
  }
  socket.addEventListener(
    "open",
    () => {
      socket.send(stringifyedMessage);
    },
    { once: true }
  );
}

function subscribeToTickerOnWS(ticker) {
  sendToWS({
    action: "SubAdd",
    subs: [`5~CCCAGG~${ticker}~USD`],
  });
}

function unsubscribeFromTickerOnWS(ticker) {
  sendToWS({
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

window.incorrectTicker = incorrectTicker;
//dz
// 1. Подсветка красным некорректной валюты
// попробовать реализовать генерацию ошибки при вводе неправильного тиккера
// в файле .vue слушать через addEventListener эти ошибки и если будет такая поймана, то заменить класс на bg-red-100
// 2. Поддержка кросс-преобразования валют
// 3. Возможность работать в нескольких вкладках
