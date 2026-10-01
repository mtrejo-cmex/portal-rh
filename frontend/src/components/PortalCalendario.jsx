import React, { useState, useEffect } from "react";
import { api } from "../services/api.js";
import { decodeHTMLEntities } from "../utils/formatters.js";
import PortalHeader from "./PortalHeader.jsx";

export default function PortalCalendario({
  eventos: eventosProp,
  onVolver,
  usuario,
  onSwitchView,
  onLogout,
}) {
  // 🟢 Inicialización dinámica al primer día del mes actual en curso
  const [fechaActual, setFechaActual] = useState(() => {
    const ahora = new Date();
    return new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  });

  const [eventosAnio, setEventosAnio] = useState(eventosProp || []);
  const [cargando, setCargando] = useState(!eventosProp);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);

  // Estado para el filtro activo: 'todos', 'oficial', o 'canon'
  const [filtroTipo, setFiltroTipo] = useState("todos");

  useEffect(() => {
    if (!eventosProp) {
      const fetchCalendario = async () => {
        try {
          const res = await api.getCalendario();
          if (Array.isArray(res)) setEventosAnio(res);
        } catch (err) {
          console.error("Error al cargar el calendario público:", err);
        } finally {
          setCargando(false);
        }
      };
      fetchCalendario();
    } else {
      setEventosAnio(eventosProp);
      setCargando(false);
    }
  }, [eventosProp]);

  // Helper inteligente para limpiar texto
  const limpiarTexto = (texto, eventoTitulo = "") => {
    if (!texto) return "";
    let resultado = decodeHTMLEntities(texto);

    if (eventoTitulo.includes("Green Day") && resultado.includes("??")) {
      resultado = resultado.replace(/\?\?/g, "🌿");
    }

    return resultado.trim();
  };

  const formatearHorario = (hIni, hFin) => {
    if (!hIni) return null;
    const inicioStr = String(hIni).substring(0, 5);
    if (!hFin) return `${inicioStr} hrs`;
    const finStr = String(hFin).substring(0, 5);
    return `${inicioStr} - ${finStr} hrs`;
  };

  const formatearRangoFechas = (fIni, fFin) => {
    if (!fIni) return "";
    if (!fFin || fFin === fIni) return fIni;
    return `${fIni} al ${fFin}`;
  };

  const nombresMeses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const anio = fechaActual.getFullYear();
  const mes = fechaActual.getMonth();

  const cambiarMes = (delta) => setFechaActual(new Date(anio, mes + delta, 1));

  const primerDiaMes = new Date(anio, mes, 1);
  const ultimoDiaMes = new Date(anio, mes + 1, 0);

  let diaInicioSemana = primerDiaMes.getDay() - 1;
  if (diaInicioSemana === -1) diaInicioSemana = 6;

  const totalDiasMes = ultimoDiaMes.getDate();
  const celdas = [];
  for (let i = 0; i < diaInicioSemana; i++)
    celdas.push({ esOtroMes: true, num: "" });

  const hoy = new Date();

  // Filtrar los eventos según el botón seleccionado
  const eventosFiltrados = eventosAnio.filter((e) => {
    if (filtroTipo === "todos") return true;
    return e.tipo === filtroTipo;
  });

  // 🟢 Verificación de rango de fechas (fecha_inicio a fecha_fin)
  for (let d = 1; d <= totalDiasMes; d++) {
    const fechaString = `${anio}-${String(mes + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const evento = eventosFiltrados.find((e) => {
      const fIni = e.fecha_inicio || e.fecha || "";
      const fFin = e.fecha_fin || fIni;
      return fechaString >= fIni && fechaString <= fFin;
    });

    celdas.push({
      esOtroMes: false,
      num: d,
      evento,
      esHoy:
        hoy.getFullYear() === anio &&
        hoy.getMonth() === mes &&
        hoy.getDate() === d,
    });
  }

  const toggleFiltro = (tipo) => {
    setFiltroTipo((prev) => (prev === tipo ? "todos" : tipo));
  };

  return (
    <div className="bg-light min-vh-100 pb-5">
      {/* NAVBAR / HEADER CORPORATIVO REUTILIZABLE */}
      <PortalHeader
        usuario={usuario}
        onSwitchView={onSwitchView}
        onLogout={onLogout}
      />

      {/* BREADCRUMB & ACCIÓN VOLVER */}
      <div className="container mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0 extra-small">
              <li className="breadcrumb-item">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onVolver();
                  }}
                  className="text-decoration-none text-muted d-flex align-items-center gap-1 fw-semibold"
                >
                  <i className="bi bi-house-door-fill text-danger"></i> Inicio
                </a>
              </li>
              <li
                className="breadcrumb-item active text-danger fw-bold"
                aria-current="page"
              >
                Calendario Laboral
              </li>
            </ol>
          </nav>

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

      <main className="container mb-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h2 className="fw-bold text-dark mb-1">
              Calendario Laboral <span>{anio}</span>
            </h2>
            <p className="text-muted small mb-0">
              Planifica tus días de descanso, cursos y eventos oficiales.{" "}
              <span className="text-danger fw-semibold d-inline-block ms-1">
                <i className="bi bi-hand-index-thumb me-1"></i>Haz clic en
                cualquier evento para ver detalles.
              </span>
            </p>
          </div>

          {/* BOTONES DE FILTRO INTERACTIVOS */}
          <div className="d-flex flex-wrap gap-2 bg-white p-2 rounded-4 shadow-sm border">
            <button
              type="button"
              className={`badge border-0 px-3 py-2 rounded-pill extra-small transition-all ${
                filtroTipo === "oficial" ? "shadow" : "opacity-75"
              }`}
              style={{
                backgroundColor: "#28a745",
                color: "#fff",
                cursor: "pointer",
                transform:
                  filtroTipo === "oficial" ? "scale(1.05)" : "scale(1)",
              }}
              onClick={() => toggleFiltro("oficial")}
              title="Filtrar Festivos Oficiales"
            >
              <i
                className="bi bi-star-fill me-1 text-light"
                style={{ fontSize: "8px" }}
              ></i>{" "}
              FESTIVO OFICIAL
            </button>

            <button
              type="button"
              className={`badge border-0 px-3 py-2 rounded-pill extra-small transition-all ${
                filtroTipo === "canon" ? "shadow" : "opacity-75"
              }`}
              style={{
                backgroundColor: "#cc0000",
                color: "#fff",
                cursor: "pointer",
                transform: filtroTipo === "canon" ? "scale(1.05)" : "scale(1)",
              }}
              onClick={() => toggleFiltro("canon")}
              title="Filtrar Eventos Canon"
            >
              <i
                className="bi bi-circle-fill me-1"
                style={{ fontSize: "6px" }}
              ></i>{" "}
              CANON
            </button>

            {filtroTipo !== "todos" && (
              <button
                type="button"
                className="btn btn-link text-muted extra-small p-0 ms-2 text-decoration-none"
                onClick={() => setFiltroTipo("todos")}
              >
                <i className="bi bi-x-circle me-1"></i> Ver todos
              </button>
            )}
          </div>
        </div>

        {cargando ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger"></div>
          </div>
        ) : (
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
                <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                  <button
                    className="btn btn-light rounded-circle shadow-sm px-3 py-2"
                    onClick={() => cambiarMes(-1)}
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>
                  <h4 className="fw-bold text-dark mb-0">
                    {nombresMeses[mes]} {anio}
                  </h4>
                  <button
                    className="btn btn-light rounded-circle shadow-sm px-3 py-2"
                    onClick={() => cambiarMes(1)}
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </div>
                <div
                  className="d-grid text-center fw-bold text-muted extra-small mb-3"
                  style={{ gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}
                >
                  {["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"].map(
                    (d) => (
                      <div key={d}>{d}</div>
                    ),
                  )}
                </div>
                <div
                  className="d-grid gap-2 text-center"
                  style={{ gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}
                >
                  {celdas.map((celda, idx) => {
                    if (celda.esOtroMes)
                      return (
                        <div
                          key={idx}
                          className="dia-celda fuera-mes bg-light rounded-3"
                          style={{ minHeight: "75px", opacity: 0.3 }}
                        ></div>
                      );

                    const tipoEvento = celda.evento ? celda.evento.tipo : "";
                    const esFestivoOficial = tipoEvento === "oficial";
                    const horarioTexto = formatearHorario(
                      celda.evento?.hora_inicio,
                      celda.evento?.hora_fin,
                    );

                    // Determinación de colores corporativos Canon para celda y día actual
                    let cellBg = esFestivoOficial
                      ? "rgba(40, 167, 69, 0.12)"
                      : "#f8f9fa";
                    let cellBorder = esFestivoOficial
                      ? "1px solid #28a745"
                      : "1px solid #dee2e6";
                    let textColor = "text-dark";

                    if (celda.esHoy) {
                      cellBg = "rgba(204, 0, 0, 0.08)"; // Rojo corporativo Canon muy suave/transparente
                      cellBorder = "2px solid #CC0000"; // Borde rojo Canon fuerte
                      textColor = "text-danger fw-bold";
                    }

                    return (
                      <div
                        key={idx}
                        className={`dia-celda p-2 rounded-3 position-relative transition-all shadow-sm`}
                        style={{
                          height: "80px",
                          cursor: celda.evento ? "pointer" : "default",
                          backgroundColor: cellBg,
                          border: cellBorder,
                        }}
                        onClick={() =>
                          celda.evento && setEventoSeleccionado(celda.evento)
                        }
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          {esFestivoOficial && !celda.esHoy && (
                            <i
                              className="bi bi-star-fill text-success extra-small"
                              title="Día Festivo Oficial"
                            ></i>
                          )}
                          {celda.esHoy && (
                            <span
                              className="badge text-white extra-small py-0 px-1 fw-bold"
                              style={{
                                fontSize: "8px",
                                backgroundColor: "#CC0000",
                              }}
                            ></span>
                          )}
                          <span
                            className={`small text-end d-block fw-bold ${textColor} ${!esFestivoOficial && !celda.esHoy ? "w-100" : "ms-auto"}`}
                          >
                            {celda.num}
                          </span>
                        </div>

                        {celda.evento && (
                          <>
                            <div className="extra-small w-100 overflow-hidden my-auto mt-1">
                              <span
                                className={`badge w-100 text-truncate d-block py-1 text-white ${esFestivoOficial ? "fw-bold" : ""}`}
                                style={{
                                  fontSize: "9.5px",
                                  lineHeight: "1.2",
                                  backgroundColor: esFestivoOficial
                                    ? "#28a745"
                                    : "#cc0000",
                                }}
                              >
                                {esFestivoOficial && (
                                  <i
                                    className="bi bi-star-fill me-1 text-light"
                                    style={{ fontSize: "7px" }}
                                  ></i>
                                )}
                                {limpiarTexto(
                                  celda.evento.titulo,
                                  celda.evento.titulo,
                                )}
                              </span>
                            </div>
                            <div className="tooltip-personalizado text-start shadow-sm p-2 rounded-3">
                              <strong className="d-block text-white extra-small mb-1 lh-sm fw-bold">
                                {esFestivoOficial && (
                                  <i className="bi bi-star-fill text-light me-1"></i>
                                )}
                                {limpiarTexto(
                                  celda.evento.titulo,
                                  celda.evento.titulo,
                                )}
                              </strong>
                              {horarioTexto && (
                                <small className="d-block text-danger-subtle extra-small fw-semibold mt-1">
                                  <i className="bi bi-clock me-1 text-danger"></i>
                                  {horarioTexto}
                                </small>
                              )}
                              <div
                                className="border-top border-secondary-subtle pt-1 mt-2 text-white-50 extra-small d-flex align-items-center gap-1"
                                style={{ fontSize: "8.5px" }}
                              >
                                <i className="bi bi-cursor-fill text-danger"></i>{" "}
                                <span>
                                  Haz clic para ver información completa
                                </span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              {/* Tarjeta de Eventos del Mes */}
              <div className="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4">
                <h6 className="fw-bold text-dark mb-3">
                  <i className="bi bi-calendar-check text-danger me-2"></i>
                  Eventos de {nombresMeses[mes]} {anio}
                </h6>
                <div
                  className="d-flex flex-column gap-2"
                  style={{ maxHeight: "350px", overflowY: "auto" }}
                >
                  {eventosFiltrados.filter((e) => {
                    const fIni = e.fecha_inicio || e.fecha || "";
                    const [evAnio, evMes] = fIni.split("-");
                    return (
                      parseInt(evAnio) === anio && parseInt(evMes) === mes + 1
                    );
                  }).length === 0 ? (
                    <p className="text-muted extra-small mb-0 text-center py-3">
                      No hay eventos para este filtro en el mes.
                    </p>
                  ) : (
                    eventosFiltrados
                      .filter((e) => {
                        const fIni = e.fecha_inicio || e.fecha || "";
                        const [evAnio, evMes] = fIni.split("-");
                        return (
                          parseInt(evAnio) === anio &&
                          parseInt(evMes) === mes + 1
                        );
                      })
                      .map((e, i) => {
                        const esFestivo = e.tipo === "oficial";
                        return (
                          <div
                            key={i}
                            className={`p-2 rounded-3 d-flex align-items-center justify-content-between ${
                              esFestivo
                                ? "border border-success"
                                : "border bg-light"
                            }`}
                            style={{
                              cursor: "pointer",
                              backgroundColor: esFestivo
                                ? "rgba(40, 167, 69, 0.12)"
                                : undefined,
                            }}
                            onClick={() => setEventoSeleccionado(e)}
                          >
                            <div>
                              <strong className="d-block extra-small text-dark">
                                {esFestivo && (
                                  <i className="bi bi-star-fill text-success me-1"></i>
                                )}
                                {limpiarTexto(e.titulo, e.titulo)}
                              </strong>
                              <small className="text-muted extra-small d-block">
                                <i className="bi bi-calendar-event me-1 text-danger"></i>
                                {formatearRangoFechas(
                                  e.fecha_inicio || e.fecha,
                                  e.fecha_fin,
                                )}
                              </small>
                            </div>
                            <span
                              className="badge extra-small text-white"
                              style={{
                                backgroundColor: esFestivo
                                  ? "#28a745"
                                  : "#cc0000",
                              }}
                            >
                              {esFestivo ? "★ FESTIVO" : "CANON"}
                            </span>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL CON DETALLE Y SOPORTE PARA RANGO DE FECHAS Y ENLACE URL */}
      {eventoSeleccionado && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-0 bg-light pb-2">
                <span
                  className="badge px-3 py-2 rounded-pill extra-small text-white"
                  style={{
                    backgroundColor:
                      eventoSeleccionado.tipo === "oficial"
                        ? "#28a745"
                        : "#cc0000",
                  }}
                >
                  <i
                    className={`bi ${eventoSeleccionado.tipo === "oficial" ? "bi-star-fill text-light" : "bi-tag-fill"} me-1`}
                  ></i>
                  {eventoSeleccionado.tipo === "oficial"
                    ? "FESTIVO OFICIAL"
                    : "CANON"}
                </span>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEventoSeleccionado(null)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <h5 className="fw-bold text-dark mb-3">
                  {eventoSeleccionado.tipo === "oficial" && (
                    <i className="bi bi-star-fill text-success me-2"></i>
                  )}
                  {limpiarTexto(
                    eventoSeleccionado.titulo,
                    eventoSeleccionado.titulo,
                  )}
                </h5>

                {/* Rango de Fechas */}
                <div className="d-flex align-items-center gap-2 text-secondary extra-small mb-2">
                  <i className="bi bi-calendar3 fs-6 text-danger"></i>
                  <span className="fw-semibold">
                    Fecha:{" "}
                    <strong className="text-dark">
                      {formatearRangoFechas(
                        eventoSeleccionado.fecha_inicio ||
                          eventoSeleccionado.fecha,
                        eventoSeleccionado.fecha_fin,
                      )}
                    </strong>
                  </span>
                </div>

                {/* Horario */}
                {formatearHorario(
                  eventoSeleccionado.hora_inicio,
                  eventoSeleccionado.hora_fin,
                ) && (
                  <div className="d-flex align-items-center gap-2 text-secondary extra-small mb-3">
                    <i className="bi bi-clock fs-6 text-danger"></i>
                    <span className="fw-semibold">
                      Horario:{" "}
                      <strong className="text-dark">
                        {formatearHorario(
                          eventoSeleccionado.hora_inicio,
                          eventoSeleccionado.hora_fin,
                        )}
                      </strong>
                    </span>
                  </div>
                )}

                {/* Descripción multilínea */}
                {eventoSeleccionado.descripcion && (
                  <div className="bg-light p-3 rounded-3 border mt-3">
                    <h6 className="fw-bold extra-small text-dark mb-1">
                      <i className="bi bi-info-circle me-1 text-danger"></i>
                      Detalles:
                    </h6>
                    <p
                      className="extra-small text-muted mb-0 lh-base"
                      style={{ whiteSpace: "pre-line" }}
                    >
                      {limpiarTexto(
                        eventoSeleccionado.descripcion,
                        eventoSeleccionado.titulo,
                      )}
                    </p>
                  </div>
                )}

                {/* Botón Enlace URL del Evento */}
                {(eventoSeleccionado.enlace_url || eventoSeleccionado.url) && (
                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      className="btn rounded-pill px-4 fw-bold shadow-sm extra-small py-2 d-inline-flex align-items-center gap-2 border-0"
                      style={{ backgroundColor: "#CC0000", color: "#FFFFFF" }}
                      onClick={() => {
                        const enlace =
                          eventoSeleccionado.enlace_url ||
                          eventoSeleccionado.url;
                        const urlFinal = enlace.startsWith("http")
                          ? enlace
                          : `https://${enlace.trim()}`;
                        window.open(urlFinal, "_blank", "noopener,noreferrer");
                      }}
                    >
                      <i className="bi bi-box-arrow-up-right"></i> UNIRSE / VER
                      ENLACE DEL EVENTO
                    </button>
                  </div>
                )}
              </div>
              <div className="modal-footer border-0 pt-0 pb-3 pe-4">
                <button
                  className="btn btn-secondary btn-sm rounded-pill px-4 fw-semibold"
                  onClick={() => setEventoSeleccionado(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
