import React from "react";
import { Link } from "react-router-dom";
import PatternBDemo from "../components/PatternBDemo";

const PatternBPage: React.FC = () => {
  return (
    <div className="minimal-pattern-b-page">
      <nav className="breadcrumb">
        <Link to="/">← Back to Home</Link>
      </nav>
      <PatternBDemo />
    </div>
  );
};

export default PatternBPage;
