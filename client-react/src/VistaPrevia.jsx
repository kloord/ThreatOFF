import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home } from "lucide-react"; // Si tienes lucide-react instalado

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
              `Filas eliminadas (#): ${data.duplicados.join(", ")}`
            );
          } else {
            setDuplicadosMsg("");
          }
        }
        setLoading(false);
      });
  }, [eliminarDuplicados]);

  return (
    <div
      className="fileupload-center"
      style={{
        backgroundColor: '#fff',
        minHeight: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: '100px',
        paddingBottom: '100px',
        paddingLeft: '20px',
        paddingRight: '20px',
        boxSizing: 'border-box',
        overflowX: 'hidden'
      }}
    >
      <div
        className="card shadow-lg rounded-4 p-4 mb-4"
        style={{ maxWidth: "900px", margin: '0 auto' }}
      >
        <div className="d-flex align-items-center justify-content-center mb-2">
          <h2 className="mb-0 text-center" style={{ marginRight: "10px" }}>
            Vista Previa del Archivo Procesado
          </h2>
          <button
            className="btn btn-outline-primary d-flex align-items-center justify-content-center home-anim-btn"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "white",
              borderColor: "black",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onClick={() => navigate("/")}
            title="Ir al inicio"
          >
            <Home size={22} color="black" />
          </button>
        </div>
        {/* Centra el botón de descarga y el nuevo botón al Dashboard */}
        <div className="d-flex justify-content-center mb-1" style={{ gap: '12px' }}>
          <a
            href={`${API_URL}/vista-previa/download`}
            className="btn download-anim-btn"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: "#393E46",
              color: "#fff",
              fontSize: "0.95rem",
              padding: "8px 8px",
              borderRadius: "8px",
              border: "none",
              minWidth: "60px",
              width: "250px",
              minHeight: "32px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              textAlign: "center",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            Descargar Archivo Procesado
          </a>

          {/* Nuevo botón hacia /dashboard */}
          <button
            type="button"
            className="btn download-anim-btn"
            onClick={() => navigate("/dashboard")}
            style={{
              backgroundColor: "#2b6cb0",
              color: "#fff",
              fontSize: "0.95rem",
              padding: "8px 12px",
              borderRadius: "8px",
              border: "none",
              minWidth: "60px",
              width: "180px",
              minHeight: "32px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
            title="Ir al Dashboard"
          >
            Ir al Dashboard
          </button>
        </div>
        {duplicadosMsg && (
          <div
            className="alert text-center mt-2"
            role="alert"
            style={{
              backgroundColor: "rgba(128,128,128,0.3)",
              color: "#222",
              border: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              fontSize: "0.97rem",
              padding: "6px 10px",
            }}
          >
            {duplicadosMsg}
          </div>
        )}
      </div>
      <div
        className="w-100 d-flex justify-content-center"
        style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflowX: 'auto' }}
      >
        {loading ? (
          <div className="text-center">Cargando vista previa...</div>
        ) : (
          <div className="table-responsive" style={{ width: '100%' }}>
            <table
              className="table table-bordered table-striped"
              style={{ margin: 0, width: '100%' }}
            >
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
        )}
      </div>
      {/* Animación CSS para el botón */}
      <style>
        {`
          .home-anim-btn:hover {
            transform: scale(1.15) rotate(-10deg);
            box-shadow: 0 4px 16px rgba(0,0,0,0.15);
            border-color: #0d6efd;
          }
          .download-anim-btn:hover {
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