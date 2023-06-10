/* eslint-disable prettier/prettier */
const API_KEY =
  "2c577907db56aff8faf35b8da454d0084214d293246bb1f6200c7d600a8e882c";

const tickersHandlers = new Map();
const loadTickers = () => {
  fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[
      ...tickersHandlers.keys(),
    ].join(",")}&tsyms=USD&api_key=${API_KEY}`
  )
    .then((res) => res.json())
    .then((rawData) => {
      const updatedPrices = Object.fromEntries(
        Object.entries(rawData).map(([key, value]) => [key, value.USD])
      );
      Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
        const handlers = tickersHandlers.get(currency) ?? [];
        handlers.forEach((fn) => fn(newPrice));
      });
    });
};
export const subscribeToTickers = (ticker, callback) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, callback]);
};

export const unsubscribeFromTickers = (ticker) => {
  tickersHandlers.delete(ticker);
};

setInterval(loadTickers, 5000);
window.tickers = tickersHandlers;
