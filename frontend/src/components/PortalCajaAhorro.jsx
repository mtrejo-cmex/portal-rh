import React, { useState } from "react";
import PortalHeader from "./PortalHeader.jsx";

export default function PortalCajaAhorro({
  onVolver,
  usuario,
  onSwitchView,
  onLogout,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas");

  // Documentos oficiales de la Caja de Ahorro
  const documentosCaja = [
    {
      id: "reglamento-caja",
      titulo: "Reglamento de Caja de Ahorro",
      descripcion:
        "Conoce las reglas de operación, porcentajes de aportación, periodos de ahorro y condiciones de retiro establecidas por la empresa.",
      categoria: "Normativa",
      extension: "PDF",
      peso_bytes: 1048576, // ~1 MB aproximado
      archivo_url:
        "https://drive.google.com/file/d/1stkhgPVF2LQAiRaGAKBLn9joQ87IydZZ/view?usp=drive_link", // Reemplaza con tu enlace real
    },
    {
      id: "solicitud-caja",
      titulo: "Formato de Solicitud de Inscripción",
      descripcion:
        "Descarga el formato oficial editable, completa tus datos personales, monto de aportación y entrégalo firmado a Recursos Humanos.",
      categoria: "Formatos",
      extension: "DOCX",
      peso_bytes: 512000, // ~500 KB aproximado
      archivo_url:
        "https://docs.google.com/document/d/1paW-n_Y9NGdvdlK_BTyf4rgtHEe16yFV/edit?usp=drive_link&ouid=110938826575393402259&rtpof=true&sd=true", // Reemplaza con tu enlace real
    },
  ];

  // Categorías disponibles para los botones de filtro superior
  const categoriasDisponibles = [
    "Todas",
    ...new Set(documentosCaja.map((f) => f.categoria || "General")),
  ];

  // Función para obtener ícono y color según extensión
  const getIconoExt = (ext = "") => {
    const extension = ext.toUpperCase();
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
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Filtrado de documentos
  const documentosFiltrados = documentosCaja.filter((item) => {
    const matchTerm =
      item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.descripcion &&
        item.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchCategoria =
      categoriaSeleccionada === "Todas" ||
      item.categoria === categoriaSeleccionada;

    return matchTerm && matchCategoria;
  });

  return (
    <div className="bg-light min-vh-100 pb-5">
      {/* HEADER CORPORATIVO REUTILIZABLE */}
      <PortalHeader
        usuario={usuario}
        onSwitchView={onSwitchView}
        onLogout={onLogout}
      />

      {/* CONTENIDO PRINCIPAL */}
      <main className="container mb-5 pt-3">
        {/* Encabezado de Página & Breadcrumbs */}
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
                  Caja de Ahorro
                </li>
              </ol>
            </nav>

            <h2 className="fw-bold text-dark mb-1">
              Caja de Ahorro Corporativa
            </h2>
            <p className="text-muted small mb-0">
              Consulta las normativas vigentes y descarga el formato oficial de
              solicitud de inscripción.
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

        {/* TARJETA PRINCIPAL DEL CONTENEDOR */}
        <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
          {/* BARRA DE FILTROS Y BÚSQUEDA */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom">
            {/* Filtros de Categoría */}
            <div className="d-flex flex-wrap gap-2">
              {categoriasDisponibles.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`btn btn-sm rounded-pill extra-small px-3 ${
                    categoriaSeleccionada === cat
                      ? "btn-outline-danger active fw-bold"
                      : "btn-outline-secondary"
                  }`}
                  onClick={() => setCategoriaSeleccionada(cat)}
                >
                  {cat === "Todas" ? "Todos los documentos" : cat}
                </button>
              ))}
            </div>

            {/* Buscador Tipo Píldora */}
            <div style={{ maxWidth: "280px" }} className="w-100">
              <div className="input-group input-group-sm rounded-pill border overflow-hidden shadow-sm">
                <span className="input-group-text bg-white border-0 text-muted ps-3">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-0 ps-1 py-1 extra-small"
                  placeholder="Buscar documento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoComplete="off"
                />
              </div>
            </div>
          </div>

          {/* GRID DE TARJETAS DE DOCUMENTOS */}
          {documentosFiltrados.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-folder2-open fs-2 d-block mb-2"></i>
              No se encontraron documentos coincidentes con tus criterios.
            </div>
          ) : (
            <div className="row g-3">
              {documentosFiltrados.map((item) => {
                const { icon, color } = getIconoExt(item.extension);
                return (
                  <div key={item.id} className="col-md-6 col-lg-6">
                    <div className="card h-100 border-0 shadow-sm rounded-4 hover-elevate transition-all bg-white">
                      <div className="card-body p-4 d-flex flex-column justify-content-between">
                        <div>
                          {/* ICONO Y BADGE */}
                          <div className="d-flex align-items-center justify-content-between mb-3">
                            <div
                              className="rounded-3 p-2 bg-light d-flex align-items-center justify-content-center"
                              style={{ width: "48px", height: "48px" }}
                            >
                              <i className={`bi ${icon} fs-2 ${color}`}></i>
                            </div>
                            <span className="badge bg-light text-dark border rounded-pill px-3 py-2 extra-small">
                              {item.categoria}
                            </span>
                          </div>

                          {/* TÍTULO Y DESCRIPCIÓN */}
                          <h6 className="fw-bold text-dark mb-2 lh-base">
                            {item.titulo}
                          </h6>
                          {item.descripcion && (
                            <p className="text-muted small mb-3 line-clamp-2">
                              {item.descripcion}
                            </p>
                          )}
                        </div>

                        {/* PIE DE TARJETA CON BOTONES DE ABRIR Y DESCARGAR */}
                        <div className="pt-3 border-top mt-3 d-flex justify-content-between align-items-center gap-2">
                          <small className="text-muted extra-small">
                            <i className="bi bi-hdd me-1"></i>
                            {formatBytes(item.peso_bytes)} &bull;{" "}
                            {item.extension}
                          </small>

                          <div className="d-flex align-items-center gap-1">
                            {/* Botón Abrir / Ver */}
                            <a
                              href={item.archivo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-light border rounded-pill px-2.5 extra-small fw-semibold text-dark d-inline-flex align-items-center gap-1"
                              title="Abrir vista previa del archivo"
                            >
                              <i className="bi bi-box-arrow-up-right text-primary"></i>{" "}
                              Abrir
                            </a>

                            {/* Botón Descargar */}
                            <a
                              href={item.archivo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-danger rounded-pill px-2.5 extra-small fw-semibold d-inline-flex align-items-center gap-1"
                              download
                              title="Descargar archivo"
                            >
                              <i className="bi bi-download"></i> Descargar
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

      {/* FOOTER CORPORATIVO */}
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
