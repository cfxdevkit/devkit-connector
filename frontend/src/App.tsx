import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./styles/global.css";
import HomePage from "./pages/index.tsx";
import PatternAPage from "./pages/PatternA.tsx";
import PatternBPage from "./pages/PatternB.tsx";

const App: React.FC = () => {
  return (
    <Router>
      <div className="minimal-app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pattern-a" element={<PatternAPage />} />
          <Route path="/pattern-b" element={<PatternBPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
