import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidV4 } from "uuid";

function HomePage() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");

  const createNewRoom = () => {
    const newRoomId = uuidV4();
    navigate(`/room/${newRoomId}`);
  };

  const joinRoom = (e) => {
    e.preventDefault();
    if (roomId.trim()) {
      navigate(`/room/${roomId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
      <div className="bg-white bg-opacity-90 shadow-lg rounded-lg p-8 backdrop-filter backdrop-blur-lg transition-all duration-300 hover:shadow-xl">
        <h1 className="text-4xl font-extrabold text-center text-purple-600 mb-8">
          Collaborative Code Editor
        </h1>
        <button
          onClick={createNewRoom}
          className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-3 px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 mb-4"
        >
          Create New Room
        </button>
        <form onSubmit={joinRoom} className="mt-4">
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter Room ID"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
          />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-pink-500 to-red-600 text-white font-bold py-3 px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            Join Room
          </button>
        </form>
      </div>
    </div>
  );
}

export default HomePage;

