import React, { useState } from "react";
import PortalHeader from "./PortalHeader.jsx";

export default function PortalGastosMedicos({
  gastosMedicos = [], // Lista completa de formatos enviada desde el padre
  onVolver,
  usuario,
  onSwitchView,
  onLogout,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  // 1. FILTRADO EXCLUSIVO PARA GASTOS MÉDICOS MAYORES
  const listaGastosMayores = gastosMedicos.filter(
    (item) => item?.categoria === "Gastos Médicos Mayores",
  );

  // Función para obtener ícono y color según extensión del archivo
  const getIconoExt = (ext = "") => {
    const extension = (ext || "").toUpperCase();
    if (extension === "PDF")
      return { icon: "bi-file-earmark-pdf-fill", color: "text-danger" };
    if (["DOC", "DOCX"].includes(extension))
      return { icon: "bi-file-earmark-word-fill", color: "text-primary" };
    if (["XLS", "XLSX", "CSV"].includes(extension))
      return { icon: "bi-file-earmark-excel-fill", color: "text-success" };
    if (["PPT", "PPTX"].includes(extension))
      return { icon: "bi-file-earmark-ppt-fill", color: "text-warning" };
    if (["ZIP", "RAR"].includes(extension))
      return { icon: "bi-file-earmark-zip-fill", color: "text-secondary" };
    return { icon: "bi-file-earmark-arrow-down-fill", color: "text-info" };
  };

  // Formatear peso en KB / MB
  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return null;
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Filtrado por buscador
  const formatosFiltrados = listaGastosMayores.filter((item) => {
    return (
      item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.descripcion &&
        item.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div className="bg-light min-vh-100 pb-5">
      <PortalHeader
        usuario={usuario}
        onSwitchView={onSwitchView}
        onLogout={onLogout}
      />

      <main className="container mb-5 pt-3">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-2 extra-small">
                <li className="breadcrumb-item">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onVolver();
                    }}
                    className="text-decoration-none text-danger fw-semibold d-inline-flex align-items-center gap-1"
                  >
                    <i className="bi bi-house-door-fill"></i>
                    <span>Inicio</span>
                  </a>
                </li>
                <li
                  className="breadcrumb-item active text-muted"
                  aria-current="page"
                >
                  Gastos Médicos Mayores
                </li>
              </ol>
            </nav>

            <h2 className="fw-bold text-dark mb-1">
              Seguro de Gastos Médicos Mayores
            </h2>
            <p className="text-muted small mb-0">
              En este apartado encontrarás la información de tu Seguro de Gastos
              Médicos Mayores, incluyendo la presentación con los principales
              beneficios y pasos a seguir, así como los{" "}
              <b>formatos necesarios para realizar tus trámites.</b> ¡Consulta
              los materiales y tenlos a la mano cuando los necesites!
            </p>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-light btn-sm rounded-pill px-3 fw-semibold text-dark border shadow-sm"
              onClick={onVolver}
            >
              <i className="bi bi-arrow-left text-danger me-1"></i> Volver al
              Portal
            </button>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-hospital-fill text-danger fs-5"></i>
              <h6 className="fw-bold text-dark mb-0">Formatos Oficiales</h6>
              <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill extra-small ms-1 fw-bold">
                {formatosFiltrados.length}{" "}
                {formatosFiltrados.length === 1 ? "documento" : "documentos"}
              </span>
            </div>

            <div style={{ maxWidth: "280px" }} className="w-100">
              <div className="input-group input-group-sm rounded-pill border overflow-hidden shadow-sm">
                <span className="input-group-text bg-white border-0 text-muted ps-3">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-0 ps-1 py-1 extra-small"
                  placeholder="Buscar formato o documento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoComplete="off"
                />
              </div>
            </div>
          </div>

          {formatosFiltrados.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-file-earmark-medical fs-2 d-block mb-2 text-danger"></i>
              No se encontraron formatos de Gastos Médicos Mayores.
            </div>
          ) : (
            <div className="row g-3 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4">
              {formatosFiltrados.map((item) => {
                const { icon, color } = getIconoExt(item.extension);
                const pesoFormateado = formatBytes(item.peso_bytes);

                return (
                  <div key={item.id} className="col d-flex">
                    <div className="card w-100 border-0 shadow-sm rounded-3 hover-elevate transition-all bg-white border">
                      <div className="card-body p-3 d-flex flex-column justify-content-between">
                        <div>
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <div
                              className="rounded-2 p-1.5 bg-light d-flex align-items-center justify-content-center"
                              style={{ width: "38px", height: "38px" }}
                            >
                              <i className={`bi ${icon} fs-4 ${color}`}></i>
                            </div>
                            <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-2 py-1 extra-small fw-bold">
                              Gastos Médicos Mayores
                            </span>
                          </div>

                          <h6
                            className="fw-bold text-dark mb-1 small lh-sm"
                            style={{
                              fontSize: "0.875rem",
                              display: "-webkit-box",
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                            title={item.titulo}
                          >
                            {item.titulo}
                          </h6>

                          {item.descripcion && (
                            <p
                              className="text-muted extra-small mb-2"
                              style={{
                                fontSize: "0.75rem",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {item.descripcion}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-top mt-3 d-flex justify-content-between align-items-center gap-1">
                          <small
                            className="text-muted extra-small text-truncate fw-semibold"
                            style={{ fontSize: "0.7rem" }}
                          >
                            {pesoFormateado
                              ? `${pesoFormateado} • ${item.extension}`
                              : item.extension || "PDF"}
                          </small>

                          <div className="d-flex align-items-center gap-1">
                            <a
                              href={item.archivo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-xs btn-light border rounded-pill px-2 py-1 extra-small fw-semibold text-dark d-inline-flex align-items-center gap-1"
                              title="Abrir vista previa"
                              style={{ fontSize: "0.7rem" }}
                            >
                              <i className="bi bi-box-arrow-up-right text-primary"></i>{" "}
                              Ver
                            </a>

                            <a
                              href={item.archivo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-xs btn-outline-danger rounded-pill px-2 py-1 extra-small fw-semibold d-inline-flex align-items-center gap-1"
                              download
                              title="Descargar archivo"
                              style={{ fontSize: "0.7rem" }}
                            >
                              <i className="bi bi-download"></i>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <footer className="text-center py-4 text-muted border-top bg-white">
        <div className="container">
          <p className="mb-0 extra-small">
            &copy; 2026 Canon Group. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
