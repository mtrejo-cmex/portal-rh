import React, { useState } from "react";
import { api } from "../services/api";

export default function LoginColaborador({ onLoginSuccess }) {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const logoUrl = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/logo_01.png`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId.trim()) return;

    setLoading(true);
    setError("");

    try {
      const data = await api.loginColaborador(userId.trim());
      const userData = data.user || data;

      if (!userData) {
        throw new Error("No se recibieron datos del usuario.");
      }

      localStorage.setItem("usuario_cmex", JSON.stringify(userData));
      onLoginSuccess(userData);
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudo verificar el usuario en el sistema.");
      setLoading(false);
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
              Portal RH
            </h4>
            <p className="extra-small text-muted mb-0 fw-semibold">
              Acceso a Colaboradores
            </p>
          </div>

          {/* FORMULARIO DE ACCESO */}
          <div className="card-body px-4 pt-1 pb-4">
            <p
              className="text-muted small text-center mb-4"
              style={{ fontSize: "0.85rem" }}
            >
              Ingresa tu ID de usuario corporativo para continuar.
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

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="userId"
                  className="form-label fw-semibold text-secondary extra-small mb-1"
                >
                  User ID / Usuario Dominio
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <i className="bi bi-person-badge"></i>
                  </span>
                  <input
                    type="text"
                    id="userId"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value.toUpperCase())}
                    placeholder="Ej. J02000"
                    className="form-control border-start-0 ps-0 text-uppercase fw-semibold bg-light"
                    required
                    disabled={loading}
                    autoFocus
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
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar al Portal</span>
                    <i className="bi bi-arrow-right-short fs-5"></i>
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
