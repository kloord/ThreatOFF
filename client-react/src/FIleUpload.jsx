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

  // Estado para los filtros
  const [filters, setFilters] = useState({
    eliminarPuertos: false,
    quitarEspacios: false,
    eliminarDuplicados: false,
    cruzarInformacion: false,
  });

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.checked,
    });
  };

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
    // Agrega los filtros seleccionados al FormData
    Object.entries(filters).forEach(([key, value]) => {
      formData.append(key, value);
    });
    try {
      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      let extraMsg = "";
      // Elimina esta parte para que no muestre el mensaje aquí
      setMessage(data.message);
      setStatus(data.status);
      setLoading(false);
      if (data.status === "success") {
        setTimeout(() => {
          navigate("/vista-previa", { state: { eliminarDuplicados: filters.eliminarDuplicados } });
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
      <div className="d-flex flex-column align-items-center justify-content-center w-100">
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
              <span style={{whiteSpace: 'pre-line'}}>{message}</span>
            </div>
          )}
        </div>

        {/* Caja de filtros debajo */}
        <div className="card shadow-lg rounded-4 p-4 w-100 mt-4" style={{maxWidth: '480px'}}>
          <h5 className="fw-bold mb-3" style={{ color: '#000' }}>Filtros de procesamiento</h5>
          <div className="mt-1 w-100">
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                name="eliminarPuertos"
                id="eliminarPuertos"
                checked={filters.eliminarPuertos}
                onChange={handleFilterChange}
                style={{ borderColor: '#000' }}
              />
              <label className="form-check-label" htmlFor="eliminarPuertos">
                Eliminar puertos y rutas
              </label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                name="quitarEspacios"
                id="quitarEspacios"
                checked={filters.quitarEspacios}
                onChange={handleFilterChange}
                style={{ borderColor: '#000' }}
              />
              <label className="form-check-label" htmlFor="quitarEspacios">
                Quitar espacios redundantes (inicio y fin)
              </label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                name="eliminarDuplicados"
                id="eliminarDuplicados"
                checked={filters.eliminarDuplicados}
                onChange={handleFilterChange}
                style={{ borderColor: '#000' }}
              />
              <label className="form-check-label" htmlFor="eliminarDuplicados">
                Eliminar filas duplicadas
              </label>
            </div>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                name="cruzarInformacion"
                id="cruzarInformacion"
                checked={filters.cruzarInformacion}
                onChange={handleFilterChange}
                style={{ borderColor: '#000' }}
              />
              <label className="form-check-label" htmlFor="cruzarInformacion">
                Cruzar información
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}