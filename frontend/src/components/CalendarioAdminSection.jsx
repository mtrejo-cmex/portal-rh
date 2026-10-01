import React, { useState, useEffect } from "react";
import { api } from "../services/api.js";
import ToastNotification from "./ToastNotification";

export default function CalendarioAdminSection({
  eventos: eventosProp,
  onReload,
}) {
  const eventos = eventosProp || [];
  const [showForm, setShowForm] = useState(false);

  // Estados para identificar si estamos editando un evento existente
  const [editandoId, setEditandoId] = useState(null);

  // Estados de filtros rápidos
  const [filtroMes, setFiltroMes] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");

  // Estados del formulario de eventos
  const [titulo, setTitulo] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [tipo, setTipo] = useState("canon");
  const [descripcion, setDescripcion] = useState("");
  const [enlaceUrl, setEnlaceUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // 🟢 Estados específicos para la gestión del PDF y la Imagen de Orienta PAE
  const [archivoPae, setArchivoPae] = useState(null);
  const [archivoImagenPae, setArchivoImagenPae] = useState(null);
  const [urlPaeActual, setUrlPaeActual] = useState("");
  const [imagenPaeActual, setImagenPaeActual] = useState("");
  const [loadingPae, setLoadingPae] = useState(false);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const mostrarAlerta = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      3000,
    );
  };

  // Cargar la configuración actual de Orienta PAE al montar el componente
  useEffect(() => {
    const fetchPaeConfig = async () => {
      try {
        const res = await api.getPaeConfig();
        if (res) {
          if (res.url) setUrlPaeActual(res.url);
          if (res.imagen_url) setImagenPaeActual(res.imagen_url);
        }
      } catch (err) {
        console.error("Error al obtener la configuración de Orienta PAE:", err);
      }
    };
    fetchPaeConfig();
  }, []);

  // Manejar la subida del PDF y/o la Imagen de Orienta PAE
  const handleUploadPae = async (e) => {
    e.preventDefault();
    if (!archivoPae && !archivoImagenPae) {
      mostrarAlerta("Selecciona al menos un archivo (PDF o Imagen).", "error");
      return;
    }

    setLoadingPae(true);
    try {
      if (archivoImagenPae) {
        const resImg = await api.subirImagenCalendarioPae(archivoImagenPae);
        if (resImg && resImg.url) setImagenPaeActual(resImg.url);
      }
      if (archivoPae) {
        const resPdf = await api.subirCalendarioPae(archivoPae);
        if (resPdf && resPdf.url) setUrlPaeActual(resPdf.url);
      }

      setArchivoPae(null);
      setArchivoImagenPae(null);
      mostrarAlerta("Calendario Orienta PAE actualizado correctamente.");
    } catch (err) {
      console.error(err);
      mostrarAlerta(err.message || "Error al subir los archivos.", "error");
    } finally {
      setLoadingPae(false);
    }
  };

  // Limpiar formulario y restablecer estados de creación/edición
  const limpiarFormulario = () => {
    setTitulo("");
    setFechaInicio("");
    setFechaFin("");
    setHoraInicio("");
    setHoraFin("");
    setDescripcion("");
    setEnlaceUrl("");
    setTipo("canon");
    setEditandoId(null);
    setShowForm(false);
  };

  // Preparar formulario para editar un evento existente
  const iniciarEdicion = (ev) => {
    setEditandoId(ev.id || ev._id);
    setTitulo(ev.titulo || "");
    setFechaInicio(ev.fecha_inicio || ev.fecha || "");
    setFechaFin(ev.fecha_fin || "");

    const hInicio = ev.hora_inicio
      ? String(ev.hora_inicio).substring(0, 5)
      : "";
    const hFin = ev.hora_fin ? String(ev.hora_fin).substring(0, 5) : "";
    setHoraInicio(hInicio);
    setHoraFin(hFin);

    setTipo(ev.tipo || "canon");
    setDescripcion(ev.descripcion || "");
    setEnlaceUrl(ev.enlace_url || ev.url || "");
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const datosEvento = {
      titulo,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin || null,
      hora_inicio: horaInicio || null,
      hora_fin: horaFin || null,
      tipo,
      descripcion,
      enlace_url: enlaceUrl || null,
    };

    const res = await api.guardarEventoCalendario(datosEvento, editandoId);

    if (res) {
      mostrarAlerta(
        editandoId
          ? "Evento actualizado correctamente."
          : "Evento registrado correctamente.",
      );
      limpiarFormulario();
      onReload();
    } else {
      mostrarAlerta("Error al guardar el evento.", "error");
    }
    setLoading(false);
  };

  const eliminarEvento = async (id) => {
    if (!confirm("¿Eliminar este evento del calendario?")) return;
    const ok = await api.eliminarEventoCalendario(id);
    if (ok) {
      mostrarAlerta("Evento eliminado.");
      onReload();
    } else {
      mostrarAlerta("Error al eliminar.", "error");
    }
  };

  const formatearHorario = (hIni, hFin) => {
    if (!hIni) return "Todo el día";
    const inicioStr = String(hIni).substring(0, 5);
    if (!hFin) return `${inicioStr} hrs`;
    const finStr = String(hFin).substring(0, 5);
    return `${inicioStr} - ${finStr} hrs`;
  };

  const formatearRangoFechas = (fIni, fFin) => {
    if (!fIni) return "-";
    if (!fFin || fFin === fIni) return fIni;
    return `${fIni} al ${fFin}`;
  };

  const eventosFiltrados = eventos.filter((e) => {
    const fechaStr = e.fecha_inicio || e.fecha || "";
    const coincideMes = filtroMes ? fechaStr.startsWith(filtroMes) : true;
    const coincideTipo = filtroTipo ? e.tipo === filtroTipo : true;
    return coincideMes && coincideTipo;
  });

  return (
    <div className="card border-0 bg-transparent p-0">
      {/* 🟢 SECCIÓN GESTIÓN DE IMAGEN Y PDF ORIENTA PAE */}
      <div className="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4 border-start border-4 border-danger">
        <div className="d-flex flex-column gap-3">
          <div>
            <h6 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
              <i className="bi bi-file-earmark-pdf-fill text-danger fs-5"></i>{" "}
              Gestión Calendario Mensual Orienta PAE
            </h6>
            <p className="text-muted extra-small mb-0">
              Sube la <strong>Imagen de Vista Previa</strong> para el portal y
              el <strong>Archivo PDF</strong> que se abrirá al hacer clic.
            </p>
          </div>

          <form onSubmit={handleUploadPae} className="row g-3 align-items-end">
            <div className="col-md-5">
              <label className="form-label extra-small fw-bold text-muted">
                Imagen de Vista Previa
              </label>
              <input
                type="file"
                accept="image/*"
                className="form-control form-control-sm rounded-3"
                onChange={(e) => setArchivoImagenPae(e.target.files[0])}
              />
            </div>

            <div className="col-md-5">
              <label className="form-label extra-small fw-bold text-muted">
                Documento Calendario (PDF)
              </label>
              <input
                type="file"
                accept=".pdf"
                className="form-control form-control-sm rounded-3"
                onChange={(e) => setArchivoPae(e.target.files[0])}
              />
            </div>

            <div className="col-md-2 d-grid">
              <button
                type="submit"
                className="btn btn-sm btn-danger rounded-pill shadow-sm"
                disabled={loadingPae || (!archivoPae && !archivoImagenPae)}
              >
                <i className="bi bi-upload me-1"></i>{" "}
                {loadingPae ? "Guardando..." : "Actualizar"}
              </button>
            </div>
          </form>

          {(urlPaeActual || imagenPaeActual) && (
            <div className="d-flex gap-3 align-items-center pt-2 border-top extra-small">
              {imagenPaeActual && (
                <a
                  href={imagenPaeActual}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-danger fw-semibold"
                >
                  <i className="bi bi-image me-1"></i> Ver imagen actual
                </a>
              )}
              {urlPaeActual && (
                <a
                  href={urlPaeActual}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-danger fw-semibold"
                >
                  <i className="bi bi-file-pdf me-1"></i> Ver PDF actual
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <hr className="my-4 text-muted opacity-25" />

      {/* Cabecera unificada de Eventos */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
        <div>
          <h5 className="fw-bold text-dark mb-1">Gestión de Calendario</h5>
          <p className="text-muted extra-small mb-0">
            MONITOREA Y ADMINISTRA LOS DÍAS FESTIVOS, CURSOS Y EVENTOS
            OFICIALES.
          </p>
        </div>

        <div className="d-flex flex-wrap align-items-center gap-2">
          {/* Filtro por mes */}
          <select
            className="form-select form-select-sm rounded-pill px-3"
            style={{ width: "140px" }}
            value={filtroMes}
            onChange={(e) => setFiltroMes(e.target.value)}
          >
            <option value="">Todos los meses</option>
            <option value="2026-01">Enero</option>
            <option value="2026-02">Febrero</option>
            <option value="2026-03">Marzo</option>
            <option value="2026-04">Abril</option>
            <option value="2026-05">Mayo</option>
            <option value="2026-06">Junio</option>
            <option value="2026-07">Julio</option>
            <option value="2026-08">Agosto</option>
            <option value="2026-09">Septiembre</option>
            <option value="2026-10">Octubre</option>
            <option value="2026-11">Noviembre</option>
            <option value="2026-12">Diciembre</option>
          </select>

          {/* Filtro por tipo */}
          <select
            className="form-select form-select-sm rounded-pill px-3"
            style={{ width: "130px" }}
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            <option value="oficial">Oficial</option>
            <option value="canon">Canon</option>
          </select>

          <button
            className="btn btn-sm btn-danger rounded-pill px-3 shadow-sm d-flex align-items-center gap-1"
            onClick={() => {
              if (showForm) {
                limpiarFormulario();
              } else {
                setShowForm(true);
              }
            }}
          >
            <i
              className={`bi ${showForm ? "bi-x-circle" : "bi-calendar-plus"} me-1`}
            ></i>
            {showForm ? "Cancelar" : "Nuevo Evento"}
          </button>
        </div>
      </div>

      {/* Formulario de Creación / Edición */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="p-4 bg-white rounded-4 shadow-sm mb-4 border"
        >
          <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
            <span className="fw-bold extra-small text-danger text-uppercase">
              {editandoId
                ? "✏️ Editando Evento Existente"
                : "➕ Registrar Nuevo Evento"}
            </span>
          </div>
          <div className="row g-3">
            {/* Título del evento */}
            <div className="col-md-4">
              <label className="form-label extra-small fw-bold text-muted">
                Título del Evento
              </label>
              <input
                type="text"
                className="form-control form-control-sm rounded-3 shadow-none"
                placeholder="Ej. Taller de Liderazgo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
              />
            </div>

            {/* Fecha Inicio */}
            <div className="col-md-2">
              <label className="form-label extra-small fw-bold text-muted">
                Fecha Inicio
              </label>
              <input
                type="date"
                className="form-control form-control-sm rounded-3 shadow-none"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                required
              />
            </div>

            {/* Fecha Fin (Opcional) */}
            <div className="col-md-2">
              <label className="form-label extra-small fw-bold text-muted">
                Fecha Fin (Opcional)
              </label>
              <input
                type="date"
                className="form-control form-control-sm rounded-3 shadow-none"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>

            {/* HORARIOS OPCIONALES */}
            <div className="col-md-2">
              <label className="form-label extra-small fw-bold text-muted">
                Hora Inicio (Opcional)
              </label>
              <input
                type="time"
                className="form-control form-control-sm rounded-3 shadow-none"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
              />
            </div>

            <div className="col-md-2">
              <label className="form-label extra-small fw-bold text-muted">
                Hora Fin (Opcional)
              </label>
              <input
                type="time"
                className="form-control form-control-sm rounded-3 shadow-none"
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
              />
            </div>

            {/* Tipo de evento */}
            <div className="col-md-3">
              <label className="form-label extra-small fw-bold text-muted">
                Tipo
              </label>
              <select
                className="form-select form-select-sm rounded-3 shadow-none"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
              >
                <option value="canon">Canon</option>
                <option value="oficial">Oficial / Ley</option>
              </select>
            </div>

            {/* Enlace URL (Opcional) */}
            <div className="col-md-9">
              <label className="form-label extra-small fw-bold text-muted">
                Enlace URL del Evento (Opcional)
              </label>
              <input
                type="url"
                className="form-control form-control-sm rounded-3 shadow-none"
                placeholder="https://teams.microsoft.com/... o https://..."
                value={enlaceUrl}
                onChange={(e) => setEnlaceUrl(e.target.value)}
              />
            </div>

            {/* Descripción Multilínea */}
            <div className="col-12">
              <label className="form-label extra-small fw-bold text-muted">
                Descripción
              </label>
              <textarea
                className="form-control form-control-sm rounded-3 shadow-none"
                rows="3"
                placeholder="Detalles del evento, temario, sala o especificaciones..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              ></textarea>
            </div>

            <div className="col-12 mt-3 d-flex justify-content-end gap-2">
              {editandoId && (
                <button
                  type="button"
                  className="btn btn-light btn-sm rounded-pill px-4 border text-muted"
                  onClick={limpiarFormulario}
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                className="btn btn-danger btn-sm rounded-pill px-4 shadow-sm"
                disabled={loading}
              >
                {editandoId ? "Actualizar Cambios" : "Guardar Evento"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tabla con diseño unificado */}
      <div
        className="table-responsive bg-white rounded-4 border shadow-sm px-3"
        style={{ maxHeight: "380px", overflowY: "auto" }}
      >
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light sticky-top bg-white small text-muted">
            <tr>
              <th className="py-3">FECHA</th>
              <th className="py-3">HORARIO</th>
              <th className="py-3">TIPO</th>
              <th className="py-3">EVENTO</th>
              <th className="py-3">DESCRIPCIÓN</th>
              <th className="py-3 text-end">ACCIONES</th>
            </tr>
          </thead>
          <tbody className="extra-small">
            {eventosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4 text-muted small">
                  No se encontraron eventos registrados con estos filtros.
                </td>
              </tr>
            ) : (
              eventosFiltrados.map((ev) => {
                const idUnico = ev.id || ev._id;
                const enlace = ev.enlace_url || ev.url;
                return (
                  <tr key={idUnico}>
                    <td className="fw-semibold text-dark">
                      {formatearRangoFechas(
                        ev.fecha_inicio || ev.fecha,
                        ev.fecha_fin,
                      )}
                    </td>
                    <td className="text-muted fw-semibold">
                      <i className="bi bi-clock me-1 text-danger"></i>
                      {formatearHorario(ev.hora_inicio, ev.hora_fin)}
                    </td>
                    <td>
                      <span
                        className={`badge ${ev.tipo === "oficial" ? "bg-secondary" : "bg-danger"}`}
                      >
                        {(ev.tipo || "canon").toUpperCase()}
                      </span>
                    </td>
                    <td className="text-uppercase fw-bold text-dark">
                      {ev.titulo}
                    </td>
                    <td className="text-muted" style={{ maxWidth: "300px" }}>
                      <div className="text-truncate">
                        {ev.descripcion || "-"}
                      </div>
                      {enlace && (
                        <a
                          href={
                            enlace.startsWith("http")
                              ? enlace
                              : `https://${enlace}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-danger fw-semibold d-inline-flex align-items-center gap-1 extra-small text-decoration-none mt-1"
                        >
                          <i className="bi bi-link-45deg"></i> Ver Enlace ↗
                        </a>
                      )}
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-1">
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm px-2 py-1"
                          onClick={() => iniciarEdicion(ev)}
                          title="Editar evento"
                        >
                          <i className="bi bi-pencil fs-6"></i>
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm px-2 py-1"
                          onClick={() => eliminarEvento(idUnico)}
                          title="Eliminar evento"
                        >
                          <i className="bi bi-trash fs-6"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ToastNotification
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
}
