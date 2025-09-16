import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./styles/global.css";
import { WalletProvider } from "./context/WalletContext";
import ErrorBoundary from "./components/ErrorBoundary";
import DevelopmentHelper from "./components/DevelopmentHelper";
import WalletTestPage from "./pages/WalletTestPage";
import HomePage from "./pages/index";
import PatternAPage from "./pages/PatternA";
import PatternBPage from "./pages/PatternB";

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <WalletProvider>
        <Router>
          <div className="minimal-app">
            <Routes>
              <Route path="/" element={<WalletTestPage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/pattern-a" element={<PatternAPage />} />
              <Route path="/pattern-b" element={<PatternBPage />} />
            </Routes>
          </div>
        </Router>
        <DevelopmentHelper />
      </WalletProvider>
    </ErrorBoundary>
  );
};

export default App;
