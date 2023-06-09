const worker = new SharedWorker("./worker.js");
const channel = new BroadcastChannel("websocket_channel");
worker.port.start();
const AGGREGATE_INDEX = "5";
let btcPrice;
let listTickersToBTC = [];
let invalidTickers = [];
channel.addEventListener("message", (e) => {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    MESSAGE: message,
    TOSYMBOL: convertTo,
    PARAMETER: parameter,
  } = JSON.parse(e.data);
  let { PRICE: price } = JSON.parse(e.data);

  if (
    message === "INVALID_SUB" &&
    !invalidTickers.some((t) => t === parameter.split("~")[2])
  ) {
    const currentTicker = parameter.split("~")[2];
    worker.port.postMessage({
      action: "SubAdd",
      subs: [`5~CCCAGG~${currentTicker}~BTC`],
    });
    channel.addEventListener("message", (event) => {
      const {
        MESSAGE: messageTickerToBTC,
        PARAMETER: parameterTickerToBTC,
        PRICE: priceToBTC,
        FROMSYMBOL: ticker,
        TOSYMBOL: currency,
      } = JSON.parse(event.data);
      if (
        messageTickerToBTC === "INVALID_SUB" &&
        currentTicker === parameterTickerToBTC.split("~")[2] &&
        parameter.split("~")[3] === "BTC" &&
        !invalidTickers.some((t) => t === parameter.split("~")[2])
      ) {
        invalidTickers.push(currentTicker);

        window.dispatchEvent(
          new CustomEvent("socket error", { detail: parameter.split("~")[2] })
        );
      } else if (
        currentTicker === ticker &&
        currency === "BTC" &&
        priceToBTC !== undefined
      ) {
        if (!listTickersToBTC.some((t) => t.name === ticker)) {
          listTickersToBTC.push({ name: ticker, price: priceToBTC });
          subscribeToTickerOnWS("BTC");
        } else {
          listTickersToBTC.forEach((t) => {
            if (t.name === ticker) {
              t.price = priceToBTC;
            }
          });
        }
      }
    });
  } else if (type !== AGGREGATE_INDEX || price === undefined) {
    return;
  }
  // обнорвление цены тиккеров, которые конвертируются в BTC
  if (
    listTickersToBTC.some((t) => t.name === currency) &&
    convertTo === "BTC"
  ) {
    listTickersToBTC.forEach((t) => {
      if (t.name === currency) {
        t.price = price;
      }
    });
  }
  // обновление цены тиккеров, которые конвертируются в btc, согласно актуальной цене btc
  if (currency === "BTC") {
    btcPrice = price;
    if (listTickersToBTC.length !== 0) {
      listTickersToBTC.forEach((ticker) => {
        const newPriceToBTCTickers = ticker.price * btcPrice;
        const handlers = tickersHandlers.get(ticker.name) ?? [];
        handlers.forEach((fn) => fn(newPriceToBTCTickers));
      });
    }
  }
  if (convertTo === "BTC" && btcPrice && price) {
    price = price * btcPrice;
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
  worker.port.postMessage({
    action: "SubRemove",
    subs: [`5~CCCAGG~${ticker}~BTC`],
  });
}

export const subscribeToTickers = (ticker, callback) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, callback]);
  subscribeToTickerOnWS(ticker);
};

export const unsubscribeFromTickers = (ticker) => {
  tickersHandlers.delete(ticker);
  listTickersToBTC = listTickersToBTC.filter((t) => t.name !== ticker);
  invalidTickers = invalidTickers.filter((t) => t !== ticker);

  if (ticker === "BTC") {
    if (listTickersToBTC.length === 0) {
      unsubscribeFromTickerOnWS(ticker);
    }
  } else {
    unsubscribeFromTickerOnWS(ticker);
    if (listTickersToBTC.length === 0 && !tickersHandlers.has("BTC")) {
      unsubscribeFromTickerOnWS("BTC");
    }
  }
};
