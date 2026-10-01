import React, { useState, useEffect } from "react";
import { api } from "../services/api.js";

export default function ReporteReaccionesSection() {
  const [reacciones, setReacciones] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState("todos"); // 'todos', 'like', 'enterado'
  const [cargando, setCargando] = useState(true);

  // 🟢 ESTADO PARA LA PAGINACIÓN
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 10;

  const cargarReacciones = async () => {
    setCargando(true);
    const data = await api.getReaccionesAdmin();
    setReacciones(Array.isArray(data) ? data : []);
    setCargando(false);
  };

  useEffect(() => {
    cargarReacciones();
  }, []);

  // Cada vez que cambie el filtro, regresamos a la página 1
  const handleFiltroChange = (nuevoFiltro) => {
    setFiltroTipo(nuevoFiltro);
    setPaginaActual(1);
  };

  // 1. Filtrar las reacciones según el tipo seleccionado
  const reaccionesFiltradas = reacciones.filter((r) => {
    if (filtroTipo === "todos") return true;
    return r.tipo_reaccion === filtroTipo;
  });

  // 2. Calcular los registros correspondientes a la página actual
  const indiceUltimoRegistro = paginaActual * registrosPorPagina;
  const indicePrimerRegistro = indiceUltimoRegistro - registrosPorPagina;
  const registrosPaginados = reaccionesFiltradas.slice(
    indicePrimerRegistro,
    indiceUltimoRegistro,
  );
  const totalPaginas = Math.ceil(
    reaccionesFiltradas.length / registrosPorPagina,
  );

  const irSiguientePagina = () => {
    if (paginaActual < totalPaginas) {
      setPaginaActual((prev) => prev + 1);
    }
  };

  const irPaginaAnterior = () => {
    if (paginaActual > 1) {
      setPaginaActual((prev) => prev - 1);
    }
  };

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Reporte de Interacciones</h4>
          <p className="text-muted small mb-0">
            Visualiza quiénes han dado Me Gusta y confirmado Enterado en los
            comunicados.
          </p>
        </div>
        <button
          className="btn btn-outline-danger btn-sm rounded-pill px-3"
          onClick={() => {
            cargarReacciones();
            setPaginaActual(1);
          }}
        >
          <i className="bi bi-arrow-clockwise me-1"></i> Actualizar
        </button>
      </div>

      {/* Filtros rápidos */}
      <div className="mb-3 d-flex gap-2">
        <button
          className={`btn btn-sm rounded-pill px-3 ${filtroTipo === "todos" ? "btn-danger" : "btn-light text-dark border"}`}
          onClick={() => handleFiltroChange("todos")}
        >
          Todas ({reacciones.length})
        </button>
        <button
          className={`btn btn-sm rounded-pill px-3 ${filtroTipo === "like" ? "btn-danger" : "btn-light text-dark border"}`}
          onClick={() => handleFiltroChange("like")}
        >
          <i className="bi bi-heart-fill me-1"></i> Me Gusta
        </button>
        <button
          className={`btn btn-sm rounded-pill px-3 ${filtroTipo === "enterado" ? "btn-success" : "btn-light text-dark border"}`}
          onClick={() => handleFiltroChange("enterado")}
        >
          <i className="bi bi-check2-circle me-1"></i> Enterados
        </button>
      </div>

      {/* Tabla de Resultados */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-3">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-uppercase extra-small text-muted fw-bold">
              <tr>
                <th className="ps-4">Colaborador</th>
                <th>Correo Corporativo</th>
                <th>Comunicado</th>
                <th>Interacción</th>
                <th className="pe-4 text-end">Fecha y Hora</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">
                    Cargando interacciones...
                  </td>
                </tr>
              ) : registrosPaginados.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">
                    No hay registros de interacciones.
                  </td>
                </tr>
              ) : (
                registrosPaginados.map((item) => (
                  <tr key={item.id}>
                    <td className="ps-4 fw-bold text-dark">
                      {item.usuario_nombre}
                    </td>
                    <td className="text-muted font-monospace small">
                      {item.usuario_email}
                    </td>
                    <td>
                      <span
                        className="text-dark fw-semibold text-truncate d-inline-block"
                        style={{ maxWidth: "250px" }}
                        title={item.comunicado_titulo}
                      >
                        {item.comunicado_titulo}
                      </span>
                    </td>
                    <td>
                      {item.tipo_reaccion === "like" ? (
                        <span className="badge bg-danger-subtle text-danger rounded-pill px-3 py-1">
                          <i className="bi bi-heart-fill me-1"></i> Me gusta
                        </span>
                      ) : (
                        <span className="badge bg-success-subtle text-success rounded-pill px-3 py-1">
                          <i className="bi bi-check-circle-fill me-1"></i>{" "}
                          Enterado
                        </span>
                      )}
                    </td>
                    <td className="pe-4 text-end text-muted small">
                      {item.creado_el}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🟢 CONTROLES DE PAGINACIÓN */}
      {!cargando && reaccionesFiltradas.length > registrosPorPagina && (
        <div className="d-flex justify-content-between align-items-center px-2">
          <small className="text-muted">
            Mostrando registros {indicePrimerRegistro + 1} al{" "}
            {Math.min(indiceUltimoRegistro, reaccionesFiltradas.length)} de{" "}
            {reaccionesFiltradas.length}
          </small>

          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary btn-sm rounded-pill px-3"
              onClick={irPaginaAnterior}
              disabled={paginaActual === 1}
            >
              <i className="bi bi-chevron-left me-1"></i> Anterior
            </button>

            <span className="align-self-center small fw-semibold text-muted px-2">
              Página {paginaActual} de {totalPaginas || 1}
            </span>

            <button
              className="btn btn-outline-danger btn-sm rounded-pill px-3"
              onClick={irSiguientePagina}
              disabled={paginaActual >= totalPaginas}
            >
              Siguiente <i className="bi bi-chevron-right ms-1"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
