import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Loader2, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import 'bootstrap/dist/css/bootstrap.min.css';
import './theme.css';
import './FileUpload.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function FileUpload() {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    eliminarPuertos: false,
    quitarEspacios: false,
    eliminarDuplicados: false,
    cruzarInformacion: false,
  });

  const [secondFile, setSecondFile] = useState(null);
  const [fileA, setFileA] = useState(null);

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
    if (!fileA) {
      setMessage("Selecciona un archivo CSV");
      setStatus("error");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("file", fileA); // archivo principal
    if (filters.cruzarInformacion && secondFile) {
      formData.append("fileB", secondFile); // archivo secundario
    }
    Object.entries(filters).forEach(([key, value]) => {
      formData.append(key, value ? "true" : "false");
    });

    // Mostrar en consola lo que se envía
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
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
    <div className="page-wrapper">
      <div className="page-content">
  <div style={{ textAlign: 'center', margin: '0 auto var(--spacing-3xl)', maxWidth: '600px' }}>
          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <Upload size={48} color="var(--color-accent)" />
          </div>
          <h1 style={{ marginBottom: 'var(--spacing-md)' }}>Procesamiento de archivos CSV</h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--color-text-secondary)' }}>
            Carga tu archivo CSV para analizar, limpiar y visualizar vulnerabilidades
          </p>
        </div>

  <div className="grid" style={{ maxWidth: '1000px', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', width: '100%', margin: '0 auto' }}>
          <form className="card" style={{ display: 'flex', flexDirection: 'column' }} onSubmit={handleSubmit}>
            <div className="card-inner">
              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 'var(--spacing-sm)' }}></div>
                <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Archivo Principal</h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)' }}>Formato CSV estandarizado por el proveedor</p>
              </div>

              <div className="form-group">
                <label className="form-label">Selecciona tu archivo</label>
                <div style={{
                  border: '2px dashed var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--spacing-xl)',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all var(--transition-base)',
                  backgroundColor: fileA ? 'var(--color-accent-light)' : 'var(--color-bg-secondary)',
                  borderColor: fileA ? 'var(--color-accent)' : 'var(--color-border)',
                }}>
                  <input
                    type="file"
                    name="file"
                    accept=".csv"
                    onChange={(e) => setFileA(e.target.files[0])}
                    style={{ display: 'none' }}
                    id="file-input"
                  />
                  <label htmlFor="file-input" style={{ cursor: 'pointer', display: 'block' }}>
                    <Upload size={32} color="var(--color-accent)" style={{ marginBottom: 'var(--spacing-md)' }} />
                    <p style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                      {fileA ? fileA.name : 'Arrastra o haz clic para seleccionar'}
                    </p>
                    <small style={{ color: 'var(--color-text-tertiary)' }}>CSV hasta 5MB</small>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !fileA}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', fontWeight: '600', marginTop: 'var(--spacing-lg)' }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    Procesando...
                  </>
                ) : (
                  <>
                    Procesar CSV
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              {message && (
                <div className={`alert mt-lg ${status === "success" ? "alert-success" : "alert-error"}`} role="alert">
                  {status === "success" && <CheckCircle size={20} />}
                  {status === "error" && <XCircle size={20} />}
                  <span>{message}</span>
                </div>
              )}
            </div>
          </form>

          {filters.cruzarInformacion && (
            <div className="card">
              <div className="card-inner">
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 'var(--spacing-sm)' }}></div>
                  <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Archivo de Cruce</h3>
                  <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)' }}>Para relacionar con información adicional</p>
                </div>

                <div className="form-group">
                  <label className="form-label">Selecciona segundo archivo</label>
                  <div style={{
                    border: '2px dashed var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--spacing-xl)',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all var(--transition-base)',
                    backgroundColor: secondFile ? 'var(--color-accent-light)' : 'var(--color-bg-secondary)',
                    borderColor: secondFile ? 'var(--color-accent)' : 'var(--color-border)',
                  }}>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleSecondFileChange}
                      style={{ display: 'none' }}
                      id="file-input-2"
                    />
                    <label htmlFor="file-input-2" style={{ cursor: 'pointer', display: 'block' }}>
                      <Upload size={32} color="var(--color-accent)" style={{ marginBottom: 'var(--spacing-md)' }} />
                      <p style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                        {secondFile ? secondFile.name : 'Selecciona archivo'}
                      </p>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Seccion de filtros */}
  <div className="card" style={{ maxWidth: '1000px', width: '100%', margin: 'var(--spacing-3xl) auto 0' }}>
          <div className="card-inner">
            <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Opciones de Procesamiento</h3>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
              {/* Opciones de filtros */}
              <div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="eliminarPuertos"
                    id="eliminarPuertos"
                    checked={filters.eliminarPuertos}
                    onChange={handleFilterChange}
                  />
                  <label className="form-check-label" htmlFor="eliminarPuertos">
                    <strong>Limpiar recursos</strong>
                    <small style={{ display: 'block', marginTop: '0.25rem' }}>Elimina puertos y rutas</small>
                  </label>
                </div>
              </div>

              <div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="quitarEspacios"
                    id="quitarEspacios"
                    checked={filters.quitarEspacios}
                    onChange={handleFilterChange}
                  />
                  <label className="form-check-label" htmlFor="quitarEspacios">
                    <strong>Normalizar espacios</strong>
                    <small style={{ display: 'block', marginTop: '0.25rem' }}>Quita espacios redundantes</small>
                  </label>
                </div>
              </div>

              <div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="eliminarDuplicados"
                    id="eliminarDuplicados"
                    checked={filters.eliminarDuplicados}
                    onChange={handleFilterChange}
                  />
                  <label className="form-check-label" htmlFor="eliminarDuplicados">
                    <strong>Eliminar duplicados</strong>
                    <small style={{ display: 'block', marginTop: '0.25rem' }}>Filas idénticas</small>
                  </label>
                </div>
              </div>

              <div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="cruzarInformacion"
                    id="cruzarInformacion"
                    checked={filters.cruzarInformacion}
                    onChange={handleFilterChange}
                  />
                  <label className="form-check-label" htmlFor="cruzarInformacion">
                    <strong>Cruzar información</strong>
                    <small style={{ display: 'block', marginTop: '0.25rem' }}>Con segundo archivo</small>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}