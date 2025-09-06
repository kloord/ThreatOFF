import React, { useEffect, useState } from "react";

export default function VistaPrevia() {
  const [preview, setPreview] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Solo hacemos fetch al endpoint que retorna JSON
    fetch("http://localhost:5000/vista-previa")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setPreview(data.preview);
          setColumns(data.columns);
        }
        setLoading(false);
      });
  }, []);

  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
      <h2 className="mb-4">Vista Previa del Archivo Procesado</h2>
      {/* El botón de descarga solo apunta al endpoint de descarga, no usa fetch */}
      <a
        href="http://localhost:5000/vista-previa/download"
        className="btn btn-success mb-4"
        target="_blank"
        rel="noopener noreferrer"
      >
        Descargar CSV Procesado
      </a>
      <div className="w-100" style={{ maxWidth: "900px" }}>
        {loading ? (
          <div className="text-center">Cargando vista previa...</div>
        ) : (
          <table className="table table-bordered table-striped">
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