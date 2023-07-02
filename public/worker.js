/* eslint-disable prettier/prettier */

const API_KEY =
  "2c577907db56aff8faf35b8da454d0084214d293246bb1f6200c7d600a8e882c";
const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);
// Создание Broadcast Channel
const channel = new BroadcastChannel("websocket_channel");

self.addEventListener("connect", (e) => {
  const port = e.ports[0];
  port.onmessage = (event) => {
    const message = event.data;
    sendToWS(message);
  };
  socket.onmessage = function (event) {
    channel.postMessage(event.data);
  };
});
channel.onmessage = (event) => {
  const message = event.data;

  // Отправка сообщения через веб-сокет
  sendToWS(message);
};
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
