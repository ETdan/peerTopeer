// import express from "express";
// import { createServer } from "http";
// import { Server } from "socket.io";
// import { ExpressPeerServer } from "peer";
// import cors from "cors";

// const app = express();
// const server = createServer(app);

// // Enable CORS for all routes
// app.use(cors());

// // Set up Socket.IO with CORS
// const io = new Server(server, {
//   cors: {
//     origin: "*", // Allow all origins
//     methods: ["GET", "POST"],
//   },
// });

// // Set up PeerJS server
// const peerServer = ExpressPeerServer(server, {
//   debug: true, // Enable debug logs
//   path: "/peerjs", // Endpoint for PeerJS

//   allow_discovery: true, // Allow peer discovery
// });
// app.use("/peerjs", peerServer);

// // Handle Socket.IO connections
// // io.on("connection", (socket) => {
// //   console.log("New client connected:", socket.id);

// //   socket.on("join-room", (roomId, id) => {
// //     console.log(`User ${id} joined room ${roomId}`);
// //     socket.join(roomId);

// //     socket.to(roomId).emit("user-connected", id);

// //     socket.on("disconnect", () => {
// //       console.log(`User ${id} disconnected`);
// //       socket.to(roomId).emit("user-disconnected", id);
// //     });
// //   });

// //   // Log Socket.IO errors
// //   socket.on("error", (err) => {
// //     console.error("Socket.IO error:", err);
// //   });
// // });

// // Start the server
// const PORT = 3001;
// server.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { ExpressPeerServer } from "peer";
import cors from "cors";

const app = express();
const server = createServer(app);

// Enable CORS for all routes
app.use(cors());

// Set up Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST"],
  },
});

// Handle Socket.IO connections
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("join-room", (roomId, id) => {
    console.log(`User ${id} joined room ${roomId}`);
    socket.join(roomId);

    // Notify other users in the room
    socket.to(roomId).emit("user-connected", id);

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User ${id} disconnected`);
      socket.to(roomId).emit("user-disconnected", id);
    });
  });

  // Log Socket.IO errors
  socket.on("error", (err) => {
    console.error("Socket.IO error:", err);
  });
});

// Start the Socket.IO server
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Socket.IO server is running on http://localhost:${PORT}`);
});

// Set up a separate PeerJS server
const peerApp = express();
const peerServer = createServer(peerApp);

const peerJsServer = ExpressPeerServer(peerServer, {
  debug: true,
  path: "/peerjs",
  allow_discovery: true,
});

peerApp.use("/peerjs", peerJsServer);

const PEER_PORT = 3002;
peerServer.listen(PEER_PORT, () => {
  console.log(`PeerJS server is running on http://localhost:${PEER_PORT}`);
});
