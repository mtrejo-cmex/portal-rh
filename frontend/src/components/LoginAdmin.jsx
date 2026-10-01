import React, { useState } from "react";
import { api } from "../services/api.js";

export default function LoginAdmin({ onAdminLoginSuccess }) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🟢 Resuelve dinámicamente la ruta de /public/logo_01.png respetando la base URL
  const logoUrl = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/logo_01.png`;

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    if (!userId.trim() || !password) return;

    setLoading(true);
    setError("");

    try {
      const response = await api.loginAdmin(userId.trim(), password);
      const adminData = response.user || response;

      localStorage.setItem("admin_cmex", JSON.stringify(adminData));

      // ⏱️ Permitimos un breve tick (100ms) para que el navegador asimile
      // la cookie HttpOnly en el contexto de las futuras peticiones fetch.
      setTimeout(() => {
        onAdminLoginSuccess(adminData);
      }, 100);
    } catch (err) {
      console.error(err);
      setError(err.message || "Credenciales de administrador incorrectas.");
      setLoading(false); // Solo quitamos el loading si ocurrió un error
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-white py-5">
      <div className="container" style={{ maxWidth: "400px" }}>
        <div className="card shadow-lg border-0 rounded-4 overflow-hidden bg-white p-2">
          {/* LOGO Y ENCABEZADO SIN BORDES NI MARCOS */}
          <div className="p-4 text-center bg-white">
            <div className="mb-3 d-flex justify-content-center align-items-center">
              <img
                src={logoUrl}
                alt="Canon Logo"
                style={{
                  height: "48px",
                  objectFit: "contain",
                  mixBlendMode: "multiply", // 🟢 Fusiona el fondo de la imagen con el fondo blanco
                }}
                className="d-block"
              />
            </div>
            <h4
              className="fw-bold mb-1 text-dark text-uppercase"
              style={{
                letterSpacing: "1.5px",
                fontSize: "1.2rem",
                color: "#222",
              }}
            >
              Portal de administración
            </h4>
            <p className="extra-small text-muted mb-0 fw-semibold">
              Recursos Humanos — Canon Group
            </p>
          </div>

          {/* FORMULARIO DE ACCESO ADMIN */}
          <div className="card-body px-4 pt-1 pb-4">
            <p
              className="text-muted small text-center mb-4"
              style={{ fontSize: "0.85rem" }}
            >
              Acceso restringido para administradores de Recursos Humanos.
            </p>

            {error && (
              <div
                className="alert alert-danger py-2 small rounded-3 mb-3 d-flex align-items-center"
                role="alert"
              >
                <i className="bi bi-exclamation-triangle-fill me-2 fs-6"></i>
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleAdminSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold text-secondary extra-small mb-1">
                  Admin User ID
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <i className="bi bi-person-shield"></i>
                  </span>
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value.toUpperCase())}
                    placeholder="Ej. J02025"
                    className="form-control border-start-0 ps-0 text-uppercase fw-semibold bg-light"
                    required
                    disabled={loading}
                    autoFocus
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold text-secondary extra-small mb-1">
                  Contraseña de Red (AD) / Master
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="form-control border-start-0 ps-0 bg-light"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-danger w-100 py-2.5 fw-bold shadow-sm rounded-3 d-flex align-items-center justify-content-center gap-2 border-0"
                style={{ backgroundColor: "#CC0000" }}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    <span>Autenticando...</span>
                  </>
                ) : (
                  <>
                    <span>Iniciar Sesión Admin</span>
                    <i className="bi bi-box-arrow-in-right fs-5"></i>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* PIE DE PÁGINA */}
          <div className="card-footer bg-white border-0 text-center pb-3 pt-0">
            <span
              className="text-muted extra-small"
              style={{ fontSize: "0.72rem" }}
            >
              &copy; 2026 Canon Group. Todos los derechos reservados.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
