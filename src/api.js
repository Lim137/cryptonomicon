/* eslint-disable prettier/prettier */
const API_KEY =
  "2c577907db56aff8faf35b8da454d0084214d293246bb1f6200c7d600a8e882c";
const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);
const AGGREGATE_INDEX = "5";
socket.addEventListener("message", (e) => {
  const { TYPE: type, FROMSYMBOL: currency, PRICE: price } = JSON.parse(e.data);
  if (type !== AGGREGATE_INDEX || price === undefined) {
    return;
  }
  const handlers = tickersHandlers.get(currency) ?? [];
  handlers.forEach((fn) => fn(price));
});

const tickersHandlers = new Map();

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

window.tickers = tickersHandlers;
