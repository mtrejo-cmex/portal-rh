import React from "react";

export default function PortalHeader({
  usuario,
  onSwitchView,
  onLogout,
  esAdminView = false,
}) {
  // Validar si el usuario autenticado es el administrador asignado
  const esAdmin =
    usuario?.user_id?.toUpperCase() === "J02025" ||
    usuario?.rol === "super_admin";

  // Resolver la ruta respetando la subruta de base
  const logoUrl = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/logo_01.png`;

  return (
    <nav className="navbar navbar-custom py-2 mb-3 shadow-sm bg-white border-bottom">
      <div className="container d-flex align-items-center justify-content-between">
        <a
          className="navbar-brand d-flex align-items-center m-0 text-decoration-none"
          href={import.meta.env.BASE_URL}
        >
          <img
            src={logoUrl}
            alt="Canon Logo"
            height="42"
            className="d-inline-block align-text-top"
          />
          <span className="brand-text ms-2 fw-bold text-dark">
            CMEX mi portal RH
          </span>
        </a>

        <div className="d-flex align-items-center gap-3">
          {/* Nombre del colaborador autenticado */}
          {usuario?.nombre && (
            <span className="text-secondary extra-small">
              Hola, <strong className="text-dark">{usuario.nombre}</strong>
            </span>
          )}

          {/* SI ESTÁ EN EL ADMIN: Muestra 'VOLVER AL PORTAL' */}
          {esAdminView ? (
            <button
              onClick={onSwitchView}
              className="btn btn-outline-secondary btn-sm rounded-pill px-3 extra-small fw-semibold d-inline-flex align-items-center gap-1"
            >
              <i className="bi bi-arrow-left me-1"></i> VOLVER AL PORTAL
            </button>
          ) : (
            /* SI ESTÁ EN EL PORTAL PÚBLICO: Muestra 'PANEL ADMIN' */
            esAdmin && (
              <button
                onClick={onSwitchView}
                className="btn btn-outline-danger btn-sm rounded-pill px-3 extra-small fw-semibold d-inline-flex align-items-center gap-1"
              >
                <i className="bi bi-shield-lock me-1"></i> PANEL ADMIN
              </button>
            )
          )}

          {/* Botón de cerrar sesión */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="btn btn-link text-muted btn-sm extra-small text-decoration-none"
              title="Cerrar sesión"
            >
              <i className="bi bi-box-arrow-right me-1"></i> Salir
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
