import React from 'react';

export default function MetricCards({ metricas }) {
  return (
    <div className="row g-3 mb-4">
      <div className="col-md-3">
        <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
          <span className="text-muted extra-small fw-semibold text-uppercase">
            Total Avisos
          </span>
          <h3 className="fw-bold text-dark my-1">
            {metricas.total_comunicados || 0}
          </h3>
          <span className="extra-small text-muted">
            <i className="bi bi-megaphone me-1"></i>En base de datos
          </span>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
          <span className="text-muted extra-small fw-semibold text-uppercase">
            Lecturas Confirmadas
          </span>
          <h3 className="fw-bold text-success my-1">
            {metricas.total_confirmaciones || 0}
          </h3>
          <span className="extra-small text-muted">
            <i className="bi bi-check2-all me-1 text-success"></i>"Enterado"
            acumulados
          </span>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
          <span className="text-muted extra-small fw-semibold text-uppercase">
            Reacciones Totales
          </span>
          <h3 className="fw-bold text-danger my-1">
            {metricas.total_likes || 0}
          </h3>
          <span className="extra-small text-muted">
            <i className="bi bi-heart-fill me-1 text-danger"></i>"Me gusta"
            recibidos
          </span>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
          <span className="text-muted extra-small fw-semibold text-uppercase">
            Convenios Activos
          </span>
          <h3 className="fw-bold text-primary my-1">
            {metricas.total_convenios_activos || metricas.total_convenios || 0}
          </h3>
          <span className="extra-small text-muted">
            <i className="bi bi-gift-fill me-1 text-primary"></i>Alianzas
            vigentes
          </span>
        </div>
      </div>
    </div>
  );
}
