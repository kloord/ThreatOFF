import React from "react";

export default function VistaPrevia() {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
      <h2 className="mb-4">Vista Previa del Archivo Procesado</h2>
      <a
        href="http://localhost:5000/vista-previa"
        className="btn btn-success"
        target="_blank"
        rel="noopener noreferrer"
      >
        Descargar CSV Procesado
      </a>
      <p className="mt-3 text-muted">Haz clic en el botón para descargar el archivo procesado sin guardar en base de datos.</p>
    </div>
  );
}