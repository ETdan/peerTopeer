import React, { useState } from "react";

export default function RoomGenerator({ onRoomGenerated }) {
  const [generatedRoomId, setGeneratedRoomId] = useState("");

  const generateRoomId = () => {
    const newRoomId = Math.random().toString(36).substr(2, 9);
    setGeneratedRoomId(newRoomId);
    onRoomGenerated(newRoomId);
  };

  return (
    <div className="bg-white bg-opacity-90 shadow-lg rounded-lg p-6 backdrop-filter backdrop-blur-lg transition-all duration-300 hover:shadow-xl">
      <h2 className="text-3xl font-bold text-purple-600 mb-4">
        Start a Session
      </h2>
      <button
        className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-3 px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
        onClick={generateRoomId}
      >
        Generate Room ID
      </button>
      {generatedRoomId && (
        <div className="mt-6 p-4 bg-purple-100 rounded-lg">
          <p className="text-lg">
            Room ID:{" "}
            <span className="font-mono font-bold text-purple-700">
              {generatedRoomId}
            </span>
          </p>
          <button
            className="mt-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-full text-sm transition-colors duration-300"
            onClick={() => navigator.clipboard.writeText(generatedRoomId)}
          >
            Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
}
