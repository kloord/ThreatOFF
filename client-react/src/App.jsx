import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import FileUpload from "./FIleUpload.jsx";
import VistaPrevia from "./VistaPrevia.jsx";
import Dashboard from "./Dashboard.jsx"; // <-- nuevo import

function App() {
  const [contentHeight, setContentHeight] = useState('calc(100vh - 110px)');

  useEffect(() => {
    function update() {
      const nav = document.querySelector('nav');
      const footer = document.querySelector('footer');
      const navH = nav ? nav.offsetHeight : 0;
      const footH = footer ? footer.offsetHeight : 0;
      setContentHeight(`calc(100vh - ${navH}px - ${footH}px)`);
    }
    // run on mount and when fonts/images load
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <Router>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          width: "100%",
        }}
      >
        <div style={{ width: "100%", maxWidth: 1100, margin: "0 auto" }}>
          <nav
            className="navbar fixed-top bg-dark text-light"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              zIndex: 1000,
              backgroundColor: "#000",
              color: "#fff",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px" }}>
              <Link to="/" style={{ textDecoration: "none", color: "#fff", fontWeight: "bold", fontSize: "1.1rem" }}>
                ThreatOFF
                <span style={{ display: "block", fontSize: "0.6rem" }}>AFP Capital</span>
              </Link>
            </div>
          </nav>

          {/* Contenido principal con rutas */}
          {/* main content area sized to viewport minus navbar and footer */}
          <Routes>
            <Route
              path="/"
              element={
                <div style={{ height: contentHeight, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', width: '100%' }}>
                  <FileUpload />
                </div>
              }
            />
            <Route
              path="/vista-previa"
              element={
                <div style={{ minHeight: contentHeight, width: '100%', display: 'flex', alignItems: 'stretch', justifyContent: 'flex-start', overflowY: 'auto' }}>
                  <VistaPrevia />
                </div>
              }
            />
            <Route
              path="/dashboard"
              element={
                 <div style={{ minHeight: contentHeight, width: '100%', display: 'flex', alignItems: 'stretch', justifyContent: 'flex-start', overflowY: 'auto' }}>
                  <Dashboard />
                </div>
              }
            />
          </Routes>
        </div>

        {/* Footer fijo centrado */}
        <footer
          className="bg-black text-light px-5 py-3"
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100%",
            zIndex: 1000,
            backgroundColor: "#222",
            color: "#fff",
          }}
        >
          <div
            className="d-flex justify-content-center align-items-center w-100"
            style={{ gap: "60px" }}
          >
            <div>
              <a
                href="https://nvd.nist.gov/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-light text-decoration-none fw-semibold"
                style={{ display: "inline-block", textAlign: "center" }}
              >
                NVD<br />
                National Vulnerability Database
              </a>
            </div>
            <div>
              <a
                href="https://cve.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-light text-decoration-none fw-semibold"
                style={{ display: "inline-block", textAlign: "center" }}
              >
                CVE<br />
                Common Vulnerabilities and Exposures
              </a>
            </div>
            <div>
              <a
                href="https://attack.mitre.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-light text-decoration-none fw-semibold"
                style={{ display: "inline-block", textAlign: "center" }}
              >
                Mitre ATT&CK<br />
              </a>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;