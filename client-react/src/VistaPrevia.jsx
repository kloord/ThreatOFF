import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Download, BarChart3, AlertCircle } from "lucide-react";
import './theme.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function VistaPrevia() {
  const location = useLocation();
  const navigate = useNavigate();
  const eliminarDuplicados = location.state?.eliminarDuplicados;

  const [preview, setPreview] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [duplicadosMsg, setDuplicadosMsg] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/vista-previa`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setPreview(data.preview);
          setColumns(data.columns);
          if (
            eliminarDuplicados &&
            data.duplicados &&
            Array.isArray(data.duplicados) &&
            data.duplicados.length > 0
          ) {
            setDuplicadosMsg(
              `Se eliminaron ${data.duplicados.length} filas duplicadas`
            );
          } else {
            setDuplicadosMsg("");
          }
        }
        setLoading(false);
      });
  }, [eliminarDuplicados]);

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="page-content flex-center" style={{ flexDirection: 'column' }}>
          <div className="spinner" style={{ marginBottom: 'var(--spacing-lg)' }}></div>
          <p style={{ color: 'var(--color-text-secondary)' }}>Cargando vista previa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="page-content">
        {/* Header Section */}
        <div style={{ marginBottom: 'var(--spacing-2xl)', maxWidth: '1200px', margin: '0 auto var(--spacing-2xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-xl)', flexWrap: 'wrap', gap: 'var(--spacing-lg)' }}>
            <div>
              <h1 style={{ marginBottom: 'var(--spacing-md)' }}>Vista Previa del Archivo</h1>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: 0 }}>Primeras 5 filas procesadas</p>
            </div>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
              <button
                onClick={() => navigate("/")}
                className="btn btn-secondary"
                style={{ padding: '0.625rem 1.5rem' }}
              >
                <Home size={18} />
                Inicio
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="btn btn-primary"
                style={{ padding: '0.625rem 1.5rem' }}
              >
                <BarChart3 size={18} />
                Dashboard
              </button>
            </div>
          </div>

          {/* Buttons Row */}
          <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
            <a
              href={`${API_URL}/vista-previa/download`}
              className="btn btn-primary"
              target="_blank"
              rel="noopener noreferrer"
              style={{ flex: 1, minWidth: '200px', justifyContent: 'center' }}
            >
              <Download size={18} />
              Descargar Procesado
            </a>
          </div>

          {/* Alert */}
          {duplicadosMsg && (
            <div className="alert alert-warning" style={{ marginTop: 'var(--spacing-lg)' }}>
              <AlertCircle size={20} />
              <span>{duplicadosMsg}</span>
            </div>
          )}
        </div>

        {/* Table Section */}
        <div className="card" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ marginBottom: 0 }}>
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, idx) => (
                  <tr key={idx}>
                    {columns.map((col) => (
                      <td key={col}>{row[col]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}