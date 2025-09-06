import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Loader2, CheckCircle, XCircle } from "lucide-react";
import 'bootstrap/dist/css/bootstrap.min.css';
import './FIleUpload.css';

export default function FileUpload() {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const file = e.target.file.files[0];
    if (!file) {
      setMessage("Selecciona un archivo CSV");
      setStatus("error");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setMessage(data.message);
      setStatus(data.status);
      setLoading(false);
      if (data.status === "success") {
        setTimeout(() => {
          navigate("/vista-previa");
        }, 2000);
      }
    } catch {
      setMessage("Error de conexión con el servidor");
      setStatus("error");
      setLoading(false);
    }
  };

  return (
    <div className="fileupload-center bg-light" style={{ minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div className="card shadow-lg rounded-4 p-4 w-100" style={{maxWidth: '480px'}}>
        {/* Header */}
        <div className="text-center mb-4">
          <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '64px', height: '64px'}}>
            <Upload style={{ width: '40px', height: '40px', color: '#000' }} />
          </div>
          <h1 className="h3 fw-bold mb-2" style={{ color: '#000' }}>Sube tu archivo CSV</h1>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3 align-items-center w-100">
          <input
            type="file"
            name="file"
            accept=".csv"
            className="form-control mb-1"
            style={{maxWidth: '300px'}}
          />
          <small className="text-muted mb-2" style={{marginTop: '-8px'}}>
            *Solo en formato CSV estandarizado por Deloitte
          </small>
          <button
            type="submit"
            disabled={loading}
            className={`btn w-100 fw-semibold d-flex align-items-center justify-content-center gap-2 ${loading ? 'disabled' : ''}`}
            style={{ backgroundColor: '#000', color: '#fff' }}
          >
            {loading && <Loader2 className="spinner-border spinner-border-sm me-2" style={{width: '20px', height: '20px'}} />}
            {loading ? "Cargando..." : "Subir CSV"}
          </button>
        </form>

        {/* Mensaje */}
        {message && (
          <div className={`mt-4 alert d-flex align-items-center justify-content-center gap-2 w-100 ${status === 'success' ? 'alert-success' : 'alert-danger'}`} role="alert">
            {status === "success" ? (
              <CheckCircle className="me-2" style={{width: '20px', height: '20px'}} />
            ) : (
              <XCircle className="me-2" style={{width: '20px', height: '20px'}} />
            )}
            <span>{message}</span>
          </div>
        )}
      </div>
    </div>
  );
}