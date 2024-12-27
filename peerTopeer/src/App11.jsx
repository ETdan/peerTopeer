import React, { useState, useEffect } from "react";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";
import Editor from "@monaco-editor/react";

function App() {
  const [roomId, setRoomId] = useState(""); // Room ID for collaboration
  const [generatedRoomId, setGeneratedRoomId] = useState(""); // For user-generated ID
  const [yText, setYText] = useState(null); // Y.js shared text object
  const [yMap, setYMap] = useState(null); // Y.js shared map for metadata
  const [sharedContent, setSharedContent] = useState(""); // Local shared content state
  const [language, setLanguage] = useState("javascript"); // Language for the editor
  const [isConnected, setIsConnected] = useState(false); // Connection status

  const initializeCollaboration = (room) => {
    const ydoc = new Y.Doc();
    const provider = new WebsocketProvider("ws://localhost:4000", room, ydoc);

    provider.on("status", ({ status }) => {
      setIsConnected(status === "connected");
    });

    const sharedText = ydoc.getText("shared-text");
    const sharedMap = ydoc.getMap("shared-meta");

    setYText(sharedText);
    setYMap(sharedMap);

    // Synchronize content and metadata without resetting
    sharedText.observe(() => {
      setSharedContent(sharedText.toString());
    });

    sharedMap.observe((event) => {
      if (event.keysChanged.has("language")) {
        const updatedLanguage = sharedMap.get("language");
        setLanguage(updatedLanguage);
      }
    });

    // Initialize language only if it doesn't exist
    if (!sharedMap.has("language")) {
      sharedMap.set("language", language); // Use current state
    }
  };

  const generateRoomId = () => {
    const newRoomId = Math.random().toString(36).substr(2, 9);
    setGeneratedRoomId(newRoomId);

    // Only initialize collaboration for the new room ID without affecting other state
    if (newRoomId !== roomId) {
      setRoomId(newRoomId);
      initializeCollaboration(newRoomId);
    }
  };

  // Join an existing room
  const joinRoom = () => {
    if (roomId.trim() !== "") {
      initializeCollaboration(roomId);
    }
  };

  // Update the shared content
  const handleEditorChange = (value) => {
    if (yText) {
      yText.delete(0, yText.length); // Clear the shared text
      yText.insert(0, value); // Update with the new content
    }
  };

  // Update the shared language in the Y.js map
  const handleLanguageChange = (newLanguage) => {
    if (yMap) {
      yMap.set("language", newLanguage);
    }
    setLanguage(newLanguage);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-extrabold text-center text-white mb-12 shadow-text">
          Real-Time Code Collaboration
        </h1>

        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Generate a Room */}
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
                    onClick={() =>
                      navigator.clipboard.writeText(generatedRoomId)
                    }
                  >
                    Copy to Clipboard
                  </button>
                </div>
              )}
            </div>

            {/* Join a Room */}
            <div className="bg-white bg-opacity-90 shadow-lg rounded-lg p-6 backdrop-filter backdrop-blur-lg transition-all duration-300 hover:shadow-xl">
              <h2 className="text-3xl font-bold text-pink-600 mb-4">
                Join a Session
              </h2>
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
          </div>

          <div className="bg-white bg-opacity-90 shadow-lg rounded-lg p-6 backdrop-filter backdrop-blur-lg">
            {/* Language Selector */}
            <div className="mb-6">
              <label
                htmlFor="language-select"
                className="block text-lg font-medium text-gray-700 mb-2"
              >
                Select Language
              </label>
              <select
                id="language-select"
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="block w-full px-4 py-3 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="csharp">C#</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
              </select>
            </div>

            {/* Editor for Collaboration */}
            {isConnected ? (
              <div className="mt-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Collaborative Editor
                </h2>
                <div className="border-4 border-indigo-200 rounded-lg overflow-hidden shadow-lg">
                  <Editor
                    height="600px"
                    defaultValue={`// ${language}\n// Start coding here...`}
                    language={language}
                    value={sharedContent}
                    onChange={handleEditorChange}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 16,
                      lineNumbers: "on",
                      roundedSelection: false,
                      scrollBeyondLastLine: false,
                      readOnly: false,
                      cursorStyle: "line",
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center mt-8">
                <h3 className="text-2xl font-semibold text-red-600">
                  Not Connected
                </h3>
                <p className="text-gray-600 mt-2">
                  Please ensure the connection is established to access the
                  editor.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
