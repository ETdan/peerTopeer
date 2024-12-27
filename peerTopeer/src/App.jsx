import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./components/HomePage";
import CollaborationRoom from "./components/CollaborationRoom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/room/:roomId" element={<CollaborationRoom />} />
      </Routes>
    </Router>
  );
}

export default App;
