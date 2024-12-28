import React, { useState, useEffect } from "react";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";
import Editor from "@monaco-editor/react";

export default function CollaborativeEditor({ roomId, language }) {
  const [yText, setYText] = useState(null);
  const [yMap, setYMap] = useState(null);
  const [sharedContent, setSharedContent] = useState("");

  useEffect(() => {
    const ydoc = new Y.Doc();
    const provider = new WebsocketProvider("ws://localhost:4000", roomId, ydoc);

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
        // Update language state in parent component if needed
      }
    });

    if (!sharedMap.has("language")) {
      sharedMap.set("language", language);
    }

    return () => {
      provider.destroy();
    };
  }, [roomId, language]);

  const handleEditorChange = (value) => {
    if (yText && value !== undefined) {
      yText.delete(0, yText.length);
      yText.insert(0, value);
    }
  };

  return (
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
  );
}
