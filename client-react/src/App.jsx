import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import FileUpload from "./FIleUpload.jsx";
import VistaPrevia from "./VistaPrevia.jsx";
import Dashboard from "./Dashboard.jsx";
import './theme.css';

function App() {

  return (
    <Router>
      <div style={{ display: "flex", flexDirection: "column", width: "100%", minHeight: "100vh" }}>
        <nav className="navbar-custom">
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', padding: '0 var(--spacing-lg)', width: '100%', gap: 'var(--spacing-xl)' }}>
            <Link to="/" className="navbar-brand">
              ThreatOFF
              <span style={{ fontSize: "0.6rem", display: "block", opacity: 0.8 }}>AFP Capital</span>
            </Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<FileUpload />} />
          <Route path="/vista-previa" element={<VistaPrevia />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>

          {/* Footer fijo */}
          <footer className="footer-custom">
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-3xl)', flexWrap: 'wrap' }}>
              <a
                href="https://nvd.nist.gov/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
              >
                NVD <br /> National Vulnerability Database
              </a>
              <a
                href="https://cve.org"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
              >
                CVE <br /> Common Vulnerabilities and Exposures
              </a>
              <a
                href="https://attack.mitre.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
              >
                Mitre ATT&CK
              </a>
            </div>
          </footer>

      </div>
    </Router>
  );
}

export default App;