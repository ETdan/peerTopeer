import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";
import Editor from "@monaco-editor/react";
import Peer from "peerjs";
import io from "socket.io-client";

function CollaborationRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [yText, setYText] = useState(null);
  const [yMap, setYMap] = useState(null);
  const [sharedContent, setSharedContent] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isConnected, setIsConnected] = useState(false);
  const [peers, setPeers] = useState({});
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const videoGridRef = useRef(null);
  const myVideoRef = useRef(null);
  const myPeerRef = useRef(null);
  const socketRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const initializeRoom = async () => {
      try {
        await initializeCollaboration();
        await initializeVideoChat();
        setIsLoading(false);
      } catch (err) {
        console.error("Error initializing room:", err);
        setError(`Failed to initialize the room: ${err.message}`);
        setIsLoading(false);
      }
    };

    initializeRoom();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (myPeerRef.current) {
        myPeerRef.current.destroy();
      }
    };
  }, [roomId]);

  const initializeCollaboration = () => {
    return new Promise((resolve, reject) => {
      try {
        const ydoc = new Y.Doc();
        const provider = new WebsocketProvider(
          "ws://localhost:4000",
          roomId,
          ydoc
        );

        provider.on("status", ({ status }) => {
          setIsConnected(status === "connected");
        });

        provider.on("connection-error", (event) => {
          reject(new Error(`WebSocket connection error: ${event.message}`));
        });

        const sharedText = ydoc.getText("shared-text");
        const sharedMap = ydoc.getMap("shared-meta");

        setYText(sharedText);
        setYMap(sharedMap);

        sharedText.observe(() => {
          setSharedContent(sharedText.toString());
        });

        sharedMap.observe((event) => {
          if (event.keysChanged.has("language")) {
            const updatedLanguage = sharedMap.get("language");
            setLanguage(updatedLanguage);
          }
        });

        if (!sharedMap.has("language")) {
          sharedMap.set("language", language);
        }

        resolve();
      } catch (err) {
        reject(err);
      }
    });
  };

  // const initializeVideoChat = () => {
  //   return new Promise((resolve, reject) => {
  //     try {
  //       socketRef.current = io("http://localhost:3001", {
  //         transports: ["websocket"],
  //       });

  //       myPeerRef.current = new Peer(5, {
  //         host: "/",
  //         port: "3001",
  //       });

  //       navigator.mediaDevices
  //         .getUserMedia({
  //           video: true,
  //           audio: true,
  //         })
  //         .then((stream) => {
  //           streamRef.current = stream;
  //           if (myVideoRef.current) {
  //             addVideoStream(myVideoRef.current, stream);
  //           }

  //           myPeerRef.current.on("call", (call) => {
  //             call.answer(stream);
  //             const video = document.createElement("video");
  //             call.on("stream", (userVideoStream) => {
  //               addVideoStream(video, userVideoStream);
  //             });
  //           });

  //           socketRef.current.on("user-connected", (userId) => {
  //             connectToNewUser(userId, stream);
  //           });

  //           myPeerRef.current.on("open", (id) => {
  //             socketRef.current.emit("join-room", roomId, id);
  //           });
  //           console.log("Connected to video chat");

  //           resolve();
  //         })
  //         .catch((err) => {
  //           if (err.name === "NotAllowedError") {
  //             console.error(
  //               "Permission denied for accessing media devices",
  //               err
  //             );
  //             reject(
  //               new Error("Permission denied for accessing media devices")
  //             );
  //           } else {
  //             console.error("Failed to get local stream", err);
  //             reject(
  //               new Error(`Failed to access media devices: ${err.message}`)
  //             );
  //           }
  //         });

  //       socketRef.current.on("user-disconnected", (userId) => {
  //         if (peers[userId]) {
  //           peers[userId].close();
  //           setPeers((prevPeers) => {
  //             const newPeers = { ...prevPeers };
  //             delete newPeers[userId];
  //             return newPeers;
  //           });
  //         }
  //       });

  //       myPeerRef.current.on("error", (err) => {
  //         console.error("PeerJS error:", err);
  //         reject(new Error(`PeerJS error: ${err.type}`));
  //       });

  //       socketRef.current.on("connect_error", (err) => {
  //         console.error("Socket.IO connection error:", err);
  //         reject(new Error(`Socket.IO connection error: ${err.message}`));
  //       });
  //     } catch (err) {
  //       reject(err);
  //     }
  //   });
  // };

  // //////////////////////////

  const initializeVideoChat = () => {
    return new Promise((resolve, reject) => {
      try {
        console.log("Initializing video chat");

        // Initialize Socket.IO

        socketRef.current = io("ws://localhost:3001", {
          transports: ["websocket", "polling"],
          withCredentials: false,
        });

        socketRef.current.on("connect", () => {
          console.log("Connected to Socket.IO server");
        });

        socketRef.current.on("connect_error", (err) => {
          console.error("Socket.IO connection error:", err);
        });

        // Handle Socket.IO connection errors
        socketRef.current.on("connect_error", (err) => {
          console.error("Socket.IO connection error:", err);
          reject(new Error(`Socket.IO connection error: ${err.message}`));
        });

        // Initialize PeerJS
        // myPeerRef.current = new Peer(roomId, {
        //   host: "localhost",
        //   port: 3001,
        //   path: "/peerjs",
        //   secure: false, // Use secure: true if running on HTTPS
        //   debug: 3,
        // });
        myPeerRef.current = new Peer(roomId, {
          host: "localhost",
          port: 3001, // Use the PeerJS server's port
          path: "/peerjs",
          secure: false, // Use true if running on HTTPS
          debug: 3,
        });

        // Handle PeerJS errors
        myPeerRef.current.on("error", (err) => {
          console.error("PeerJS error:", err);
          reject(new Error(`PeerJS error: ${err.type}`));
        });

        // Access user's media devices
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: true })
          .then((stream) => {
            streamRef.current = stream;

            if (myVideoRef.current) {
              addVideoStream(myVideoRef.current, stream);
            }

            // Handle incoming calls
            myPeerRef.current.on("call", (call) => {
              call.answer(stream);
              const video = document.createElement("video");
              call.on("stream", (userVideoStream) => {
                addVideoStream(video, userVideoStream);
              });
            });

            // Handle new user connections
            socketRef.current.on("user-connected", (userId) => {
              connectToNewUser(userId, stream);
            });

            // Emit room joining with Peer ID
            myPeerRef.current.on("open", (id) => {
              console.log("Peer ID:", id);
              socketRef.current.emit("join-room", roomId, id); // Emit join-room event
            });

            resolve();
          })
          .catch((err) => {
            console.error("Error accessing media devices:", err);
            reject(new Error(`Failed to access media devices: ${err.message}`));
          });

        // Handle user disconnections
        socketRef.current.on("user-disconnected", (userId) => {
          if (peers[userId]) {
            peers[userId].close();
            setPeers((prevPeers) => {
              const updatedPeers = { ...prevPeers };
              delete updatedPeers[userId];
              return updatedPeers;
            });
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  };

  const connectToNewUser = (userId, stream) => {
    const call = myPeerRef.current.call(userId, stream);
    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
      addVideoStream(video, userVideoStream);
    });
    call.on("close", () => {
      video.remove();
    });

    setPeers((prevPeers) => ({
      ...prevPeers,
      [userId]: call,
    }));
  };

  const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });
    if (videoGridRef.current) {
      videoGridRef.current.append(video);
    }
  };

  const handleEditorChange = (value) => {
    if (yText) {
      yText.delete(0, yText.length);
      yText.insert(0, value);
    }
  };

  const handleLanguageChange = (newLanguage) => {
    if (yMap) {
      yMap.set("language", newLanguage);
    }
    setLanguage(newLanguage);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
        <div className="bg-white bg-opacity-90 shadow-lg rounded-lg p-8 backdrop-filter backdrop-blur-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p>{error}</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Go Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-white mb-8 shadow-text">
          Collaborative Room: {roomId}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Video Chat Section */}
          <div className="bg-white bg-opacity-90 shadow-lg rounded-lg p-6 backdrop-filter backdrop-blur-lg">
            <h2 className="text-2xl font-bold text-purple-600 mb-4">
              Video Chat
            </h2>
            <div ref={videoGridRef} className="grid grid-cols-2 gap-4">
              <video
                ref={myVideoRef}
                className="w-full h-full object-cover rounded-lg"
                muted
              />
            </div>
          </div>

          {/* Code Editor Section */}
          <div className="bg-white bg-opacity-90 shadow-lg rounded-lg p-6 backdrop-filter backdrop-blur-lg">
            <h2 className="text-2xl font-bold text-pink-600 mb-4">
              Code Editor
            </h2>
            <div className="mb-4">
              <label
                htmlFor="language-select"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Select Language
              </label>
              <select
                id="language-select"
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="csharp">C#</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="cpp">C++</option>
                <option value="go">Go</option>
                <option value="ruby">Ruby</option>
                <option value="php">PHP</option>
                <option value="json">JSON</option>
                <option value="sql">SQL</option>
                <option value="xml">XML</option>
                <option value="yaml">YAML</option>
                <option value="markdown">Markdown</option>
                <option value="objective-c">Objective-C</option>
                <option value="swift">Swift</option>
                <option value="rust">Rust</option>
                <option value="kotlin">Kotlin</option>
                <option value="scala">Scala</option>
                <option value="lua">Lua</option>
                <option value="perl">Perl</option>
                <option value="bash">Bash</option>
                <option value="powershell">PowerShell</option>
                <option value="dockerfile">Dockerfile</option>
                <option value="graphql">GraphQL</option>
              </select>
            </div>

            {isConnected ? (
              <div className="border-2 border-indigo-200 rounded-lg overflow-hidden shadow-lg">
                <Editor
                  height="400px"
                  defaultValue={`// ${language}\n// Start coding here...`}
                  language={language}
                  value={sharedContent}
                  onChange={handleEditorChange}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: "on",
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    readOnly: false,
                    cursorStyle: "line",
                  }}
                />
              </div>
            ) : (
              <div className="text-center mt-4">
                <p className="text-red-600">Not connected. Please wait...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CollaborationRoom;
