/* eslint-disable prettier/prettier */
const API_KEY =
  "2c577907db56aff8faf35b8da454d0084214d293246bb1f6200c7d600a8e882c";
let socket;
socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);

self.addEventListener("connect", (e) => {
  const port = e.ports[0];
  port.onmessage = (event) => {
    const message = event.data;
    sendToWS(message);
  };
  socket.onmessage = function (event) {
    port.postMessage(event.data);
  };
});
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

// const socket = new WebSocket(
//   `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
// );

// self.addEventListener("message", function (event) {
//   const message = event.data;
//   sendToWS(message);
// });

// function sendToWS(message) {
//   const stringifyedMessage = JSON.stringify(message);
//   if (socket.readyState === WebSocket.OPEN) {
//     socket.send(stringifyedMessage);
//     return;
//   }
//   socket.addEventListener(
//     "open",
//     () => {
//       socket.send(stringifyedMessage);
//     },
//     { once: true }
//   );
// }

// socket.onmessage = function (event) {
//   self.postMessage(event.data);
// };
