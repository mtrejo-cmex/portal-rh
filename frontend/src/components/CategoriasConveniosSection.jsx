import React, { useState, useRef, useEffect } from "react";
import { api } from "../services/api.js";
import ToastNotification from "./ToastNotification";

export default function CategoriasConveniosSection({
  categorias = [],
  onReload,
}) {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const inputRef = useRef(null);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // Enfocar automáticamente el input al abrir el modal
  useEffect(() => {
    if (showModal && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [showModal]);

  const mostrarAlerta = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3500);
  };

  const handleOpenNuevo = () => {
    setEditingId(null);
    setNombre("");
    setShowModal(true);
  };

  const handleOpenEditar = (cat) => {
    setEditingId(cat.id);
    setNombre(cat.nombre || "");
    setShowModal(true);
  };

  const confirmarEliminacion = async () => {
    if (!deleteTarget) return;

    try {
      const ok = await api.eliminarCategoriaConvenio(deleteTarget.id);
      if (ok) {
        onReload();
        mostrarAlerta("Categoría eliminada con éxito.");
      } else {
        mostrarAlerta(
          "No se pudo eliminar la categoría (puede tener convenios asociados).",
          "error",
        );
      }
    } catch (err) {
      console.error(err);
      mostrarAlerta("Error de red al eliminar la categoría.", "error");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      mostrarAlerta("El nombre de la categoría es obligatorio.", "error");
      return;
    }

    setLoading(true);
    try {
      const payload = { nombre: nombre.trim() };
      const ok = await api.guardarCategoriaConvenio(payload, editingId);
      if (ok) {
        setShowModal(false);
        onReload();
        mostrarAlerta(
          editingId
            ? "Categoría actualizada con éxito."
            : "Categoría creada con éxito.",
        );
      } else {
        mostrarAlerta("Error al guardar la categoría.", "error");
      }
    } catch (err) {
      console.error(err);
      mostrarAlerta("Error de red al procesar la categoría.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Filtrado dinámico en cliente
  const categoriasFiltradas = categorias.filter((cat) =>
    (cat.nombre || "").toLowerCase().includes(busqueda.toLowerCase()),
  );

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h5 className="fw-bold mb-0">Gestión de Categorías de Convenios</h5>
          <p className="text-muted extra-small mb-0">
            Organiza las clasificaciones para los convenios corporativos.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* Buscador Rápido */}
          <div className="input-group input-group-sm style={{ width: '220px' }}">
            <span className="input-group-text bg-light border-end-0">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control bg-light border-start-0 extra-small"
              placeholder="Buscar categoría..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="btn btn-danger btn-sm rounded-pill px-3 fw-semibold shadow-sm text-nowrap"
            onClick={handleOpenNuevo}
          >
            <i className="bi bi-folder-plus me-1"></i> Nueva Categoría
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle extra-small mb-0">
          <thead className="table-light">
            <tr>
              <th style={{ width: "10%" }}>ID</th>
              <th style={{ width: "70%" }}>Nombre de la Categoría</th>
              <th style={{ width: "20%" }} className="text-end">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {categoriasFiltradas.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center text-muted py-4">
                  <i className="bi bi-folder-x fs-3 d-block mb-1 text-secondary opacity-50"></i>
                  {busqueda
                    ? "No se encontraron categorías coincidentes."
                    : "No hay categorías registradas."}
                </td>
              </tr>
            ) : (
              categoriasFiltradas.map((cat) => (
                <tr key={cat.id}>
                  <td className="fw-bold text-muted">{cat.id}</td>
                  <td className="fw-semibold text-dark">
                    <span className="badge bg-light text-dark border px-2 py-1 me-2 fw-normal">
                      <i className="bi bi-tag-fill text-danger me-1"></i>
                      {cat.nombre}
                    </span>
                  </td>
                  <td className="text-end">
                    <div className="btn-group btn-group-sm">
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-xs px-2"
                        title="Editar Categoría"
                        onClick={() => handleOpenEditar(cat)}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-xs px-2"
                        title="Eliminar Categoría"
                        onClick={() => setDeleteTarget(cat)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL CREAR / EDITAR */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold fs-6 text-dark">
                  <i
                    className={`bi ${editingId ? "bi-pencil-square text-primary" : "bi-folder-plus text-danger"} me-2`}
                  ></i>
                  {editingId
                    ? "Editar Categoría de Convenios"
                    : "Nueva Categoría de Convenios"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label extra-small fw-semibold text-muted">
                      Nombre de la Categoría
                    </label>
                    <input
                      ref={inputRef}
                      type="text"
                      className="form-control form-control-sm rounded-3"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej. Salud y Bienestar, Educación, Entretenimiento"
                      required
                    />
                  </div>

                  <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                    <button
                      type="button"
                      className="btn btn-light rounded-pill px-3 btn-sm"
                      onClick={() => setShowModal(false)}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-danger rounded-pill px-4 btn-sm fw-semibold shadow-sm"
                      disabled={loading}
                    >
                      {loading
                        ? "Guardando..."
                        : editingId
                          ? "Actualizar Categoría"
                          : "Guardar Categoría"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR (Sustituto de confirm) */}
      {deleteTarget && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content rounded-4 border-0 shadow text-center p-3">
              <div className="modal-body">
                <i className="bi bi-exclamation-triangle-fill text-warning fs-1 d-block mb-2"></i>
                <h6 className="fw-bold text-dark mb-1">¿Eliminar categoría?</h6>
                <p className="extra-small text-muted mb-3">
                  Se eliminará <strong>"{deleteTarget.nombre}"</strong>. Si
                  tiene convenios asociados, la acción será rechazada.
                </p>
                <div className="d-flex justify-content-center gap-2">
                  <button
                    type="button"
                    className="btn btn-light btn-sm rounded-pill px-3 extra-small"
                    onClick={() => setDeleteTarget(null)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm rounded-pill px-3 extra-small fw-semibold"
                    onClick={confirmarEliminacion}
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastNotification
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
}
