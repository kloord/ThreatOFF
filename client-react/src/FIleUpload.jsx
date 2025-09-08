import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Loader2, CheckCircle, XCircle } from "lucide-react";
import 'bootstrap/dist/css/bootstrap.min.css';
import './FileUpload.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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

  const [showSecondForm, setShowSecondForm] = useState(false);
  const [secondFile, setSecondFile] = useState(null);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.checked,
    });
  };

  const handleSecondFileChange = (e) => {
    setSecondFile(e.target.files[0]);
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
      const res = await fetch(`${API_URL}/upload`, {
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
      {/* Contenedor principal en columna */}
      <div className="d-flex flex-column align-items-center justify-content-center w-100">
        {/* Formularios lado a lado */}
        <div className="d-flex flex-row align-items-start justify-content-center w-100 gap-4">
          {/* Formulario principal */}
          <form className="card shadow-lg rounded-4 p-4 w-100 mb-4" style={{ maxWidth: "400px" }} onSubmit={handleSubmit}>
            <div className="d-flex flex-column align-items-center mb-3">
              <Upload size={32} color="#393E46" className="mb-2" />
              <h5 className="fw-bold mb-0 text-center" style={{ color: '#000' }}>Subir archivo principal</h5>
            </div>
            <div className="mb-3">
              <input
                type="file"
                name="file"
                accept=".csv"
                className="form-control"
                onChange={(e) => setSecondFile(e.target.files[0])}
                style={{maxWidth: '300px'}}
              />
              <small className="text-muted" style={{marginTop: '-8px'}}>
                *Solo en formato CSV estandarizado por Deloitte
              </small>
            </div>
            {/* Botón de subir */}
            <button
              type="submit"
              disabled={loading}
              className={`btn w-100 fw-semibold d-flex align-items-center justify-content-center gap-2 upload-anim-btn ${loading ? 'disabled' : ''}`}
              style={{ backgroundColor: '#393E46', color: '#fff' }}
            >
              {loading && <Loader2 className="spinner-border spinner-border-sm me-2" style={{width: '20px', height: '20px'}} />}
              {loading ? "Cargando..." : "Subir CSV"}
            </button>
            {/* Mensaje de confirmación o error debajo del botón */}
            {message && (
              <div
                className={`alert mt-3 text-center ${status === "success" ? "alert-success" : "alert-danger"}`}
                role="alert"
                style={{
                  fontWeight: "bold",
                  fontSize: "1rem",
                  opacity: 0.95,
                }}
              >
                {status === "success" && <CheckCircle size={20} className="me-2" />}
                {status === "error" && <XCircle size={20} className="me-2" />}
                {message}
              </div>
            )}
          </form>

          {/* Formulario secundario, igual al principal */}
          {filters.cruzarInformacion && (
            <form className="card shadow-lg rounded-4 p-4 w-100 mb-4" style={{ maxWidth: "400px" }}>
              <h5 className="fw-bold mb-3" style={{ color: '#000' }}>Subir segundo archivo</h5>
              <div className="mb-3">
                <input
                  type="file"
                  className="form-control"
                  onChange={handleSecondFileChange}
                  accept=".csv"
                />
              </div>
            </form>
          )}
        </div>

        {/* Filtros centrados debajo de ambos formularios */}
        <div className="d-flex justify-content-center w-100 mt-4">
          <div className="card shadow-lg rounded-4 p-4" style={{maxWidth: '480px'}}>
            <h5 className="fw-bold mb-3" style={{ color: '#000' }}>Filtros de procesamiento</h5>
            <div className="mt-1 w-100">
              {/* ...otros filtros... */}
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

      {/* Animación CSS para el botón de subir */}
      <style>
        {`
          .upload-anim-btn:hover {
            background-color: #222831;
            color: #fff;
            transform: scale(1.08);
            box-shadow: 0 6px 24px rgba(57,62,70,0.18);
            transition: all 0.2s;
          }
        `}
      </style>
    </div>
  );
}