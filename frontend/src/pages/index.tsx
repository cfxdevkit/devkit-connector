import React from "react";
import { Link } from "react-router-dom";

const HomePage: React.FC = () => {
  return (
    <div className="minimal-home">
      <div className="container">
        <header className="hero">
          <h1>Conflux Dual Wallet Demo</h1>
          <p className="subtitle">
            Minimal implementation showcasing Conflux eSpace (EVM-compatible)
            integration
          </p>
        </header>

        <div className="patterns-grid">
          <div className="pattern-card">
            <h2>Contract Demo</h2>
            <p>Direct contract interaction through server API</p>
            <ul>
              <li>Contract status monitoring</li>
              <li>Counter operations</li>
              <li>Simple API calls</li>
            </ul>
            <Link to="/pattern-a" className="primary-button">
              Try Contract Demo
            </Link>
          </div>

          <div className="pattern-card">
            <h2>Delegation Manager</h2>
            <p>Delegation management with guided interface</p>
            <ul>
              <li>Delegation wizard</li>
              <li>Counter operations</li>
              <li>Enhanced UX</li>
            </ul>
            <Link to="/pattern-b" className="primary-button">
              Try Delegation Manager
            </Link>
          </div>
        </div>

        <div className="features">
          <h2>Features</h2>
          <div className="features-grid">
            <div className="feature-item">
              <h3>🚀 Smart Contracts</h3>
              <p>DelegationManager and Counter contracts</p>
            </div>
            <div className="feature-item">
              <h3>📡 eSpace Support</h3>
              <p>Conflux eSpace (EVM-compatible) integration</p>
            </div>
            <div className="feature-item">
              <h3>🛠️ Node Management</h3>
              <p>Silent node wrapper with clean shutdown</p>
            </div>
            <div className="feature-item">
              <h3>🎨 Clean UI</h3>
              <p>Minimal, maintainable frontend components</p>
            </div>
          </div>
        </div>

        <footer className="footer">
          <p>Built with ❤️ for Conflux ecosystem</p>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;
