import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function VistaPrevia() {
  const location = useLocation();
  const eliminarDuplicados = location.state?.eliminarDuplicados;

  const [preview, setPreview] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [duplicadosMsg, setDuplicadosMsg] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/vista-previa")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setPreview(data.preview);
          setColumns(data.columns);
          // Solo muestra el mensaje si el filtro fue seleccionado y hay duplicados
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
      className="fileupload-center bg-light"
      style={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="card shadow-lg rounded-4 p-4 w-100 mb-4"
        style={{ maxWidth: "900px" }}
      >
        <h2 className="mb-4 text-center">
          Vista Previa del Archivo Procesado
        </h2>
        <a
          href="http://localhost:5000/vista-previa/download"
          className="btn btn-success"
          target="_blank"
          rel="noopener noreferrer"
        >
          Descargar CSV Procesado
        </a>
        {/* Mensaje de duplicados solo si el filtro fue seleccionado */}
        {duplicadosMsg && (
          <div className="alert alert-info mt-3 text-center" role="alert">
            {duplicadosMsg}
          </div>
        )}
      </div>
      <div className="w-100 d-flex justify-content-center" style={{ maxWidth: "900px" }}>
        {loading ? (
          <div className="text-center">Cargando vista previa...</div>
        ) : (
          <table className="table table-bordered table-striped" style={{ margin: "0 auto" }}>
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
        )}
      </div>
    </div>
  );
}