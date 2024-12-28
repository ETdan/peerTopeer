import React, { useState } from "react";

export default function RoomJoiner({ onRoomJoined }) {
  const [roomId, setRoomId] = useState("");

  const joinRoom = () => {
    if (roomId.trim() !== "") {
      onRoomJoined(roomId);
    }
  };

  return (
    <div className="bg-white bg-opacity-90 shadow-lg rounded-lg p-6 backdrop-filter backdrop-blur-lg transition-all duration-300 hover:shadow-xl">
      <h2 className="text-3xl font-bold text-pink-600 mb-4">Join a Session</h2>
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="flex-grow px-4 py-3 border-2 border-pink-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300"
        />
        <button
          className="bg-gradient-to-r from-pink-500 to-red-600 text-white font-bold py-3 px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          onClick={joinRoom}
        >
          Join Room
        </button>
      </div>
    </div>
  );
}
