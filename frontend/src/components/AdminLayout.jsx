import React, { useState } from "react";
import PortalHeader from "./PortalHeader.jsx";

export default function AdminLayout({
  usuario,
  onLogout,
  onVolverPortal,
  metricas,
  comunicados,
  convenios,
  galeria,
  calendario,
  formatos,
  cajaAhorro, // 👈 1. Nueva prop para la caja de ahorro
  reacciones,
}) {
  const [seccionesAbiertas, setSeccionesAbiertas] = useState({
    comunicados: false,
    convenios: false,
    galeria: false,
    calendario: false,
    formatos: false,
    cajaAhorro: false, // 👈 2. Estado inicial del acordeón
    reacciones: false,
  });

  const toggleSeccion = (seccion) => {
    setSeccionesAbiertas((prev) => ({
      ...prev,
      [seccion]: !prev[seccion],
    }));
  };

  return (
    <div className="bg-light min-vh-100 pb-5">
      {/* HEADER CON BOTÓN 'VOLVER AL PORTAL' */}
      <PortalHeader
        usuario={usuario}
        onLogout={onLogout}
        onSwitchView={onVolverPortal}
        esAdminView={true}
      />

      <main className="container mt-4">
        {/* MÉTRICAS */}
        {metricas && <div className="mb-4">{metricas}</div>}

        {/* ACORDEÓN DE GESTIÓN */}
        <div className="d-flex flex-column gap-3">
          {comunicados && (
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div
                className="card-header bg-white p-3 d-flex justify-content-between align-items-center"
                onClick={() => toggleSeccion("comunicados")}
                style={{ cursor: "pointer" }}
              >
                <h6 className="fw-bold text-dark mb-0">
                  <i className="bi bi-megaphone-fill text-danger me-2"></i>{" "}
                  Gestión de Comunicados
                </h6>
                <i
                  className={`bi bi-chevron-${seccionesAbiertas.comunicados ? "up" : "down"} text-muted`}
                ></i>
              </div>
              {seccionesAbiertas.comunicados && (
                <div className="card-body bg-light border-top p-4">
                  {comunicados}
                </div>
              )}
            </div>
          )}

          {convenios && (
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div
                className="card-header bg-white p-3 d-flex justify-content-between align-items-center"
                onClick={() => toggleSeccion("convenios")}
                style={{ cursor: "pointer" }}
              >
                <h6 className="fw-bold text-dark mb-0">
                  <i className="bi bi-shop text-danger me-2"></i> Gestión de
                  Convenios
                </h6>
                <i
                  className={`bi bi-chevron-${seccionesAbiertas.convenios ? "up" : "down"} text-muted`}
                ></i>
              </div>
              {seccionesAbiertas.convenios && (
                <div className="card-body bg-light border-top p-4">
                  {convenios}
                </div>
              )}
            </div>
          )}

          {galeria && (
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div
                className="card-header bg-white p-3 d-flex justify-content-between align-items-center"
                onClick={() => toggleSeccion("galeria")}
                style={{ cursor: "pointer" }}
              >
                <h6 className="fw-bold text-dark mb-0">
                  <i className="bi bi-images text-danger me-2"></i> Gestión de
                  Galería
                </h6>
                <i
                  className={`bi bi-chevron-${seccionesAbiertas.galeria ? "up" : "down"} text-muted`}
                ></i>
              </div>
              {seccionesAbiertas.galeria && (
                <div className="card-body bg-light border-top p-4">
                  {galeria}
                </div>
              )}
            </div>
          )}

          {calendario && (
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div
                className="card-header bg-white p-3 d-flex justify-content-between align-items-center"
                onClick={() => toggleSeccion("calendario")}
                style={{ cursor: "pointer" }}
              >
                <h6 className="fw-bold text-dark mb-0">
                  <i className="bi bi-calendar-event text-danger me-2"></i>{" "}
                  Gestión de Calendario
                </h6>
                <i
                  className={`bi bi-chevron-${seccionesAbiertas.calendario ? "up" : "down"} text-muted`}
                ></i>
              </div>
              {seccionesAbiertas.calendario && (
                <div className="card-body bg-light border-top p-4">
                  {calendario}
                </div>
              )}
            </div>
          )}

          {formatos && (
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div
                className="card-header bg-white p-3 d-flex justify-content-between align-items-center"
                onClick={() => toggleSeccion("formatos")}
                style={{ cursor: "pointer" }}
              >
                <h6 className="fw-bold text-dark mb-0">
                  <i className="bi bi-file-earmark-text-fill text-danger me-2"></i>{" "}
                  Gestión de Formatos Corporativos
                </h6>
                <i
                  className={`bi bi-chevron-${seccionesAbiertas.formatos ? "up" : "down"} text-muted`}
                ></i>
              </div>
              {seccionesAbiertas.formatos && (
                <div className="card-body bg-light border-top p-4">
                  {formatos}
                </div>
              )}
            </div>
          )}

          {/* 🟢 3. NUEVA SECCIÓN: GESTIÓN DE CAJA DE AHORRO */}
          {cajaAhorro && (
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div
                className="card-header bg-white p-3 d-flex justify-content-between align-items-center"
                onClick={() => toggleSeccion("cajaAhorro")}
                style={{ cursor: "pointer" }}
              >
                <h6 className="fw-bold text-dark mb-0">
                  <i className="bi bi-piggy-bank-fill text-danger me-2"></i>{" "}
                  Gestión de Caja de Ahorro
                </h6>
                <i
                  className={`bi bi-chevron-${seccionesAbiertas.cajaAhorro ? "up" : "down"} text-muted`}
                ></i>
              </div>
              {seccionesAbiertas.cajaAhorro && (
                <div className="card-body bg-light border-top p-4">
                  {cajaAhorro}
                </div>
              )}
            </div>
          )}

          {reacciones && (
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div
                className="card-header bg-white p-3 d-flex justify-content-between align-items-center"
                onClick={() => toggleSeccion("reacciones")}
                style={{ cursor: "pointer" }}
              >
                <h6 className="fw-bold text-dark mb-0">
                  <i className="bi bi-heart-pulse-fill text-danger me-2"></i>{" "}
                  Reporte de Interacciones (Likes y Enterados)
                </h6>
                <i
                  className={`bi bi-chevron-${seccionesAbiertas.reacciones ? "up" : "down"} text-muted`}
                ></i>
              </div>
              {seccionesAbiertas.reacciones && (
                <div className="card-body bg-light border-top p-4">
                  {reacciones}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
