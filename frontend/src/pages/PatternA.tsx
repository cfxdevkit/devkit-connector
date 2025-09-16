import React from "react";
import { Link } from "react-router-dom";
import PatternADemo from "../components/PatternADemo.tsx";

const PatternAPage: React.FC = () => {
  return (
    <div className="minimal-pattern-a-page">
      <nav className="breadcrumb">
        <Link to="/">← Back to Home</Link>
      </nav>
      <PatternADemo />
    </div>
  );
};

export default PatternAPage;
