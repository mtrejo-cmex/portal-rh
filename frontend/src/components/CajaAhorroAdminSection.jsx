import React, { useState } from "react";
import { api } from "../services/api.js";

export default function CajaAhorroAdminSection({ documentos = [], onReload }) {
  const [documentoEditando, setDocumentoEditando] = useState(null);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  const handleGuardar = async (e) => {
    e.preventDefault();
    try {
      const exito = await api.guardarCajaAhorro(
        documentoEditando,
        documentoEditando.id,
      );
      if (exito) {
        setMensaje({
          texto: "Documento actualizado correctamente.",
          tipo: "success",
        });
        setDocumentoEditando(null);
        if (onReload) onReload();
      } else {
        setMensaje({
          texto: "Error al actualizar el documento.",
          tipo: "danger",
        });
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      setMensaje({ texto: "Error de conexión.", tipo: "danger" });
    }
  };

  return (
    <div className="container-fluid py-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Gestión de Caja de Ahorro</h4>
          <p className="text-muted small mb-0">
            Actualiza los enlaces de Google Drive para el Reglamento y la
            Solicitud de Inscripción.
          </p>
        </div>
      </div>

      {mensaje.texto && (
        <div
          className={`alert alert-${mensaje.tipo} alert-dismissible fade show py-2 small`}
          role="alert"
        >
          {mensaje.texto}
          <button
            type="button"
            className="btn-close py-2"
            onClick={() => setMensaje({ texto: "", tipo: "" })}
          ></button>
        </div>
      )}

      <div className="row g-3">
        {documentos.map((item) => (
          <div key={item.id} className="col-md-6">
            <div className="card border-0 shadow-sm rounded-4 bg-white p-4 h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="badge bg-danger-subtle text-danger extra-small px-3 py-1 rounded-pill">
                    {item.extension}
                  </span>
                  <small className="text-muted extra-small">
                    ID: {item.id}
                  </small>
                </div>
                <h5 className="fw-bold text-dark mb-2">{item.titulo}</h5>
                <p className="text-muted small mb-3">{item.descripcion}</p>
                <div className="bg-light p-2 rounded-3 text-truncate mb-3 small text-secondary">
                  <i className="bi bi-link-45deg me-1"></i> {item.archivo_url}
                </div>
              </div>

              <div className="d-flex justify-content-end pt-3 border-top">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger rounded-pill px-4 fw-semibold extra-small d-flex align-items-center gap-1"
                  onClick={() => setDocumentoEditando({ ...item })}
                >
                  <i className="bi bi-pencil-square"></i> Editar Enlace / Datos
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE EDICIÓN */}
      {documentoEditando && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <form onSubmit={handleGuardar}>
                <div className="modal-header border-0 pb-0 pt-4 px-4">
                  <h5 className="modal-title fw-bold text-dark">
                    Editar Documento
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setDocumentoEditando(null)}
                  ></button>
                </div>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold extra-small text-muted">
                      Título
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm rounded-3"
                      value={documentoEditando.titulo}
                      onChange={(e) =>
                        setDocumentoEditando({
                          ...documentoEditando,
                          titulo: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold extra-small text-muted">
                      Descripción
                    </label>
                    <textarea
                      className="form-control form-control-sm rounded-3"
                      rows="3"
                      value={documentoEditando.descripcion || ""}
                      onChange={(e) =>
                        setDocumentoEditando({
                          ...documentoEditando,
                          descripcion: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold extra-small text-muted">
                      URL de Google Drive
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm rounded-3"
                      value={documentoEditando.archivo_url}
                      onChange={(e) =>
                        setDocumentoEditando({
                          ...documentoEditando,
                          archivo_url: e.target.value,
                        })
                      }
                      required
                    />
                    <div className="form-text text-muted extra-small mt-1">
                      Pega aquí el enlace de compartición de Google Drive.
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0 pb-4 px-4 justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-3 btn-sm fw-medium"
                    onClick={() => setDocumentoEditando(null)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-danger rounded-pill px-4 btn-sm fw-semibold"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
