const http = require("http");
const WebSocket = require("ws");
const { setupWSConnection } = require("y-websocket/bin/utils");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Y.js WebSocket Server is running.\n");
});

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws, req) => {
  setupWSConnection(ws, req);
});

server.listen(4000, () => {
  console.log(`WebSocket server is running on ws://localhost:4000`);
});
