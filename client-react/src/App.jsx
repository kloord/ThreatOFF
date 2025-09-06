import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FileUpload from "./FIleUpload.jsx";
import VistaPrevia from "./VistaPrevia.jsx";
import threatOffLogo from './assets/Fotos/ThreatOFF.png';

function App() {
  return (
    <Router>
      {/* Barra superior fija */}
      <nav
        className="navbar bg-black text-light px-4 py-3 d-flex align-items-center"
        style={{
          minHeight: '80px',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 1000,
          backgroundColor: '#000',
          color: '#fff',
        }}
      >
        <img src={threatOffLogo} alt="ThreatOFF Logo" style={{height: '64px', marginRight: '24px'}} />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontWeight: 'bold',
            fontSize: '1.5rem',
            lineHeight: '1.2',
            textAlign: 'center',
          }}
        >
          <span>ThreatOFF</span>
          <span style={{fontSize: '1.2rem', margin: '2px 0'}}>X</span>
          <span>AFP Capital</span>
        </div>
      </nav>
      {/* Contenido principal con rutas */}
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Routes>
          <Route path="/" element={<FileUpload />} />
          <Route path="/vista-previa" element={<VistaPrevia />} />
        </Routes>
      </div>
      {/* Footer fijo centrado */}
      <footer
        className="bg-black text-light px-5 py-3"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          zIndex: 1000,
          backgroundColor: '#222',
          color: '#fff',
        }}
      >
        <div
          className="d-flex justify-content-start align-items-center w-100"
          style={{ gap: '60px', marginLeft: '490px' }}
        >
          <div>
            <a
              href="https://nvd.nist.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-light text-decoration-none fw-semibold"
              style={{ display: 'inline-block', textAlign: 'center' }}
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
              style={{ display: 'inline-block', textAlign: 'center' }}
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
              style={{ display: 'inline-block', textAlign: 'center' }}
            >
              Mitre ATT&CK<br />
            </a>
          </div>
        </div>
      </footer>
    </Router>
  );
}

export default App;