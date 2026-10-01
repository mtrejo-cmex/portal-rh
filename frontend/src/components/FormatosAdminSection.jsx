import React, { useState, useMemo } from "react";
import { api } from "../services/api";

export default function FormatosAdminSection({ formatos = [], onReload }) {
  // 🛡️ Garantiza que la iteración siempre trabaje con un arreglo
  const listaFormatos = Array.isArray(formatos) ? formatos : [];

  // Estados del Formulario
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("Formatos de Solicitud");
  const [descripcion, setDescripcion] = useState("");
  const [archivoUrl, setArchivoUrl] = useState("");
  const [extension, setExtension] = useState("PDF");
  const [guardando, setGuardando] = useState(false);
  const [formatoEditandoId, setFormatoEditandoId] = useState(null);

  // 🔍 Estados para Filtros y Paginación (Máximo 10 registros por página)
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  const [paginaActual, setPaginaActual] = useState(1);
  const REGISTROS_POR_PAGINA = 10;

  // Categorías estáticas disponibles en el sistema (Actualizadas)
  const categoriasDisponibles = [
    "Formatos de Solicitud",
    "Gastos Médicos Mayores",
    "Gastos Médicos Menores",
    "Calendario",
    "Políticas y Manuales",
    "Prestaciones y Beneficios",
    "Guías y Procedimientos",
    "Recursos Humanos",
    "Plantillas / Fondos",
    "Beneficios",
    "Capacitación",
    "General",
  ];

  // Función para obtener ícono y color según extensión
  const getIconoExt = (ext = "") => {
    const extUpper = (ext || "").toUpperCase();
    if (extUpper === "PDF")
      return { icon: "bi-file-earmark-pdf-fill", color: "text-danger" };
    if (["DOC", "DOCX"].includes(extUpper))
      return { icon: "bi-file-earmark-word-fill", color: "text-primary" };
    if (["XLS", "XLSX", "CSV"].includes(extUpper))
      return { icon: "bi-file-earmark-excel-fill", color: "text-success" };
    if (["PPT", "PPTX"].includes(extUpper))
      return { icon: "bi-file-earmark-ppt-fill", color: "text-warning" };
    if (["ZIP", "RAR"].includes(extUpper))
      return { icon: "bi-file-earmark-zip-fill", color: "text-secondary" };
    return { icon: "bi-file-earmark-arrow-down-fill", color: "text-info" };
  };

  const limpiarFormulario = () => {
    setFormatoEditandoId(null);
    setTitulo("");
    setCategoria("Formatos de Solicitud");
    setDescripcion("");
    setArchivoUrl("");
    setExtension("PDF");
  };

  // Cargar datos en el formulario para editar
  const handleCargarEdicion = (item) => {
    if (!item) return;
    setFormatoEditandoId(item.id);
    setTitulo(item.titulo || "");
    setCategoria(item.categoria || "Formatos de Solicitud");
    setDescripcion(item.descripcion || "");
    setArchivoUrl(item.archivo_url || "");
    setExtension(item.extension ? item.extension.toUpperCase() : "PDF");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo.trim() || !archivoUrl.trim()) {
      alert("Por favor indica un título y la URL del archivo (Google Drive).");
      return;
    }

    const payload = {
      titulo: titulo.trim(),
      categoria: categoria,
      descripcion: descripcion.trim() || null,
      archivo_url: archivoUrl.trim(),
      extension: extension.toUpperCase(),
      peso_bytes: null,
      estado: "activo",
    };

    try {
      setGuardando(true);
      if (formatoEditandoId) {
        await api.actualizarFormato(formatoEditandoId, payload);
        alert("Formato / Documento actualizado con éxito.");
      } else {
        await api.crearFormato(payload);
        alert("Documento / Formato publicado con éxito.");
      }

      limpiarFormulario();
      if (onReload) onReload();
    } catch (err) {
      console.error("Error al guardar formato:", err);
      alert(
        `Error al ${formatoEditandoId ? "actualizar" : "publicar"} formato: ` +
          (err.message || "Error del servidor"),
      );
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id, tituloFormato) => {
    if (
      window.confirm(
        `¿Seguro que deseas eliminar el formato "${tituloFormato}"?`,
      )
    ) {
      try {
        await api.eliminarFormato(id);
        if (formatoEditandoId === id) {
          limpiarFormulario();
        }
        if (onReload) onReload();
      } catch (err) {
        alert("Error al eliminar formato: " + err.message);
      }
    }
  };

  // 🛠️ Lógica de filtrado en tiempo real
  const formatosFiltrados = useMemo(() => {
    return listaFormatos.filter((item) => {
      const matchBusqueda =
        item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.descripcion &&
          item.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCategoria =
        filtroCategoria === "Todas" || item.categoria === filtroCategoria;

      return matchBusqueda && matchCategoria;
    });
  }, [listaFormatos, searchTerm, filtroCategoria]);

  // 📄 Lógica de paginación
  const totalPaginas =
    Math.ceil(formatosFiltrados.length / REGISTROS_POR_PAGINA) || 1;
  const indiceInicial = (paginaActual - 1) * REGISTROS_POR_PAGINA;
  const formatosPaginados = formatosFiltrados.slice(
    indiceInicial,
    indiceInicial + REGISTROS_POR_PAGINA,
  );

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  return (
    <div className="p-2">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">
          <i
            className={`bi ${
              formatoEditandoId
                ? "bi-pencil-square text-warning"
                : "bi-google-drive text-success"
            } me-2`}
          ></i>
          {formatoEditandoId
            ? "Editar Formato o Documento Corporativo"
            : "Publicar Nuevo Formato o Documento Corporativo"}
        </h5>
        {formatoEditandoId && (
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary rounded-pill px-3"
            onClick={limpiarFormulario}
          >
            <i className="bi bi-x-circle me-1"></i> Cancelar Edición
          </button>
        )}
      </div>

      {/* FORMULARIO DE ALTA Y EDICIÓN */}
      <form
        onSubmit={handleSubmit}
        className={`bg-white p-4 rounded-4 shadow-sm mb-4 border-start border-4 ${
          formatoEditandoId ? "border-warning" : "border-danger"
        }`}
      >
        <div className="row g-3">
          <div className="col-md-7">
            <label className="form-label small fw-semibold">
              Título del Formato <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej. Formato de Solicitud de Vacaciones 2026"
              required
            />
          </div>

          <div className="col-md-5">
            <label className="form-label small fw-semibold">Categoría</label>
            <select
              className="form-select"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              {categoriasDisponibles.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-12">
            <label className="form-label small fw-semibold">
              Descripción u Observaciones
            </label>
            <textarea
              className="form-control"
              rows="2"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej. Formato obligatorio para solicitar días de vacaciones. Entregar firmado a RH."
            ></textarea>
          </div>

          <div className="col-md-9">
            <label className="form-label small fw-semibold">
              <i className="bi bi-link-45deg text-primary me-1"></i>
              URL del Archivo en Google Drive / Repositorio{" "}
              <span className="text-danger">*</span>
            </label>
            <input
              type="url"
              className="form-control"
              placeholder="https://drive.google.com/file/d/..."
              value={archivoUrl}
              onChange={(e) => setArchivoUrl(e.target.value)}
              required
            />
            <small className="text-muted extra-small d-block mt-1">
              Verifica que el enlace en Google Drive esté configurado con acceso
              público de lectura ("Cualquier persona con el enlace").
            </small>
          </div>

          <div className="col-md-3">
            <label className="form-label small fw-semibold">
              Tipo / Formato
            </label>
            <select
              className="form-select"
              value={extension}
              onChange={(e) => setExtension(e.target.value)}
            >
              <option value="PDF">PDF (.pdf)</option>
              <option value="DOCX">Word (.docx)</option>
              <option value="DOC">Word Antiguo (.doc)</option>
              <option value="XLSX">Excel (.xlsx)</option>
              <option value="XLS">Excel Antiguo (.xls)</option>
              <option value="PPTX">PowerPoint (.pptx)</option>
              <option value="JPG">Imagen (.jpg / .png)</option>
              <option value="ZIP">Comprimido (.zip / .rar)</option>
            </select>
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <button
            type="button"
            className="btn btn-outline-secondary rounded-pill px-4"
            onClick={limpiarFormulario}
            disabled={guardando}
          >
            {formatoEditandoId ? "Cancelar" : "Limpiar"}
          </button>

          <button
            type="submit"
            className={`btn ${
              formatoEditandoId ? "btn-warning" : "btn-danger"
            } rounded-pill fw-semibold px-4`}
            disabled={guardando}
          >
            {guardando ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                ></span>
                Guardando...
              </>
            ) : formatoEditandoId ? (
              <>
                <i className="bi bi-check-circle me-2"></i> Actualizar Formato
              </>
            ) : (
              <>
                <i className="bi bi-check-lg me-2"></i> Publicar Formato
              </>
            )}
          </button>
        </div>
      </form>

      {/* TABLA DE FORMATOS REGISTRADOS Y BARRA DE FILTROS */}
      <div className="bg-white p-4 rounded-4 shadow-sm">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 border-bottom pb-3">
          <h6 className="fw-bold mb-0">
            Documentos y Formatos Publicados ({formatosFiltrados.length})
          </h6>

          {/* CONTROLES DE FILTRO Y BÚSQUEDA */}
          <div
            className="d-flex flex-column flex-sm-row gap-2"
            style={{ maxWidth: "550px" }}
          >
            <select
              className="form-select form-select-sm rounded-pill"
              value={filtroCategoria}
              onChange={(e) => {
                setFiltroCategoria(e.target.value);
                setPaginaActual(1);
              }}
            >
              <option value="Todas">Todas las categorías</option>
              {categoriasDisponibles.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <div className="input-group input-group-sm rounded-pill border overflow-hidden">
              <span className="input-group-text bg-white border-0 text-muted ps-3">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-0 ps-1 py-1 extra-small"
                placeholder="Buscar formato..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPaginaActual(1);
                }}
              />
            </div>
          </div>
        </div>

        {formatosPaginados.length === 0 ? (
          <div className="text-center text-muted py-4">
            <i className="bi bi-folder-x fs-1 d-block mb-2 text-secondary"></i>
            No se encontraron formatos coincidentes con los criterios de
            búsqueda.
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "40px" }}>Tipo</th>
                    <th>Título</th>
                    <th>Categoría</th>
                    <th>Enlace</th>
                    <th>Fecha de Registro</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {formatosPaginados.map((item) => {
                    const { icon, color } = getIconoExt(item.extension);
                    const isEditingThis = formatoEditandoId === item.id;
                    const esCalendario = item.categoria === "Calendario";
                    const esGastosMayores =
                      item.categoria === "Gastos Médicos Mayores";

                    return (
                      <tr
                        key={item.id}
                        className={isEditingThis ? "table-warning" : ""}
                      >
                        <td className="text-center">
                          <i className={`bi ${icon} fs-4 ${color}`}></i>
                        </td>
                        <td>
                          <div className="fw-semibold text-dark">
                            {item.titulo}
                          </div>
                          {item.descripcion && (
                            <small
                              className="text-muted text-truncate d-block"
                              style={{ maxWidth: "350px" }}
                            >
                              {item.descripcion}
                            </small>
                          )}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              esCalendario || esGastosMayores
                                ? "bg-danger-subtle text-danger border border-danger-subtle fw-bold"
                                : "bg-light text-dark border"
                            }`}
                          >
                            {esCalendario && (
                              <i className="bi bi-calendar-event me-1"></i>
                            )}
                            {esGastosMayores && (
                              <i className="bi bi-hospital me-1"></i>
                            )}
                            {item.categoria}
                          </span>
                        </td>
                        <td>
                          <a
                            href={item.archivo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-truncate d-inline-block text-danger fw-semibold small"
                            style={{ maxWidth: "200px" }}
                            title={item.archivo_url}
                          >
                            <i className="bi bi-box-arrow-up-right me-1"></i>
                            Ver Enlace
                          </a>
                        </td>
                        <td>
                          <small className="text-muted">
                            {item.creado_el
                              ? new Date(item.creado_el).toLocaleDateString(
                                  "es-MX",
                                )
                              : "-"}
                          </small>
                        </td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-2">
                            <button
                              className="btn btn-sm btn-outline-warning border-0 rounded-circle"
                              onClick={() => handleCargarEdicion(item)}
                              title="Editar Formato"
                            >
                              <i className="bi bi-pencil-square"></i>
                            </button>

                            <a
                              href={item.archivo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-primary border-0 rounded-circle"
                              title="Abrir Enlace"
                            >
                              <i className="bi bi-box-arrow-up-right"></i>
                            </a>

                            <button
                              className="btn btn-sm btn-outline-danger border-0 rounded-circle"
                              onClick={() =>
                                handleEliminar(item.id, item.titulo)
                              }
                              title="Eliminar"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* CONTROLES DE PAGINACIÓN */}
            {totalPaginas > 1 && (
              <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                <small className="text-muted extra-small">
                  Mostrando del {indiceInicial + 1} al{" "}
                  {Math.min(
                    indiceInicial + REGISTROS_POR_PAGINA,
                    formatosFiltrados.length,
                  )}{" "}
                  de {formatosFiltrados.length} formatos
                </small>

                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary rounded-pill px-3 extra-small"
                    onClick={() => cambiarPagina(paginaActual - 1)}
                    disabled={paginaActual === 1}
                  >
                    <i className="bi bi-chevron-left me-1"></i> Anterior
                  </button>

                  <span className="extra-small fw-semibold text-muted px-2">
                    Página {paginaActual} de {totalPaginas}
                  </span>

                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger rounded-pill px-3 extra-small fw-semibold"
                    onClick={() => cambiarPagina(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                  >
                    Siguiente <i className="bi bi-chevron-right ms-1"></i>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
