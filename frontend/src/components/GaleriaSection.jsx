import React, { useState } from "react";
import { api } from "../services/api.js";
import ToastNotification from "./ToastNotification";

export default function GaleriaSection({ galeria = [], onReload }) {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("integracion");
  const [categoriaEtiqueta, setCategoriaEtiqueta] =
    useState("Integración Equipo");
  const [fecha, setFecha] = useState("");
  const [descripcion, setDescripcion] = useState("");

  // 🟢 NUEVO: Estado para almacenar la URL externa de fotos adicionales
  const [enlaceUrl, setEnlaceUrl] = useState("");

  // Manejo de múltiples fotos y selección de portada
  const [fotosAlbum, setFotosAlbum] = useState([]); // [{ url: '...', es_portada: true/false }]
  const [loading, setLoading] = useState(false);

  // Estado para el sistema de notificaciones Toast
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const mostrarAlerta = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3500);
  };

  const categoriasOpciones = [
    { value: "integracion", label: "Integración Equipo" },
    { value: "cumpleanos", label: "Cumpleaños del Mes" },
    { value: "capacitacion", label: "Capacitaciones" },
    { value: "corporativo", label: "Eventos Corporativos" },
    { value: "reconocimiento", label: "Reconocimientos" },
  ];

  const handleCategoriaChange = (e) => {
    const selectedVal = e.target.value;
    setCategoria(selectedVal);
    const item = categoriasOpciones.find((c) => c.value === selectedVal);
    if (item) setCategoriaEtiqueta(item.label);
  };

  const handleOpenNuevo = () => {
    setEditingId(null);
    setTitulo("");
    setCategoria("integracion");
    setCategoriaEtiqueta("Integración Equipo");
    setFecha(
      new Date().toLocaleDateString("es-ES", {
        month: "long",
        year: "numeric",
      }),
    );
    setDescripcion("");
    setEnlaceUrl(""); // 🟢 Limpiar campo de URL al crear nuevo
    setFotosAlbum([]);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setTitulo(item.titulo || "");
    setCategoria(item.categoria || "integracion");
    setCategoriaEtiqueta(item.categoria_etiqueta || "Integración Equipo");
    setFecha(item.fecha || "");
    setDescripcion(item.descripcion || "");
    setEnlaceUrl(item.enlace_url || item.url_externa || item.enlace || ""); // 🟢 Cargar URL existente

    // Mapeamos las fotos existentes asegurando conservar su url y su estado de portada
    const fotosMapeadas = (item.fotos || []).map((f) => ({
      url: f.url,
      es_portada: Boolean(f.es_portada),
    }));

    // Si por alguna razón el álbum no traía fotos pero sí una imagen suelta antigua, la agregamos como portada
    if (fotosMapeadas.length === 0 && item.imagen_portada) {
      fotosMapeadas.push({ url: item.imagen_portada, es_portada: true });
    }

    setFotosAlbum(fotosMapeadas);
    setShowModal(true);
  };

  const handleEliminar = async (id) => {
    if (!confirm("¿Deseas eliminar este registro de la galería?")) return;
    const ok = await api.eliminarGaleria(id);
    if (ok) {
      onReload();
      mostrarAlerta("Registro de galería eliminado correctamente.");
    } else {
      mostrarAlerta("Error al eliminar el registro.", "error");
    }
  };

  // Manejo de subida múltiple de archivos
  const handleArchivosSeleccionados = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setLoading(true);
    try {
      const nuevasFotos = [...fotosAlbum];

      for (const file of files) {
        const uploadRes = await api.uploadFile(file);
        if (uploadRes && uploadRes.url) {
          const esPrimera =
            nuevasFotos.length === 0 && !nuevasFotos.some((f) => f.es_portada);
          nuevasFotos.push({
            url: uploadRes.url,
            es_portada: esPrimera,
          });
        }
      }
      setFotosAlbum(nuevasFotos);
      mostrarAlerta(`${files.length} imagen(es) agregada(s) con éxito.`);
    } catch (err) {
      mostrarAlerta("Error al subir una o más imágenes.", "error");
    } finally {
      setLoading(false);
      e.target.value = null; // Limpiar input file
    }
  };

  // Marcar una foto como portada
  const handleMarcarPortada = (indexSeleccionado) => {
    const actualizadas = fotosAlbum.map((foto, index) => ({
      ...foto,
      es_portada: index === indexSeleccionado,
    }));
    setFotosAlbum(actualizadas);
  };

  // Eliminar una foto de la lista temporal del álbum
  const handleRemoverFoto = (indexRemover) => {
    const actualizadas = fotosAlbum.filter(
      (_, index) => index !== indexRemover,
    );

    if (fotosAlbum[indexRemover].es_portada && actualizadas.length > 0) {
      actualizadas[0].es_portada = true;
    }
    setFotosAlbum(actualizadas);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo.trim() || fotosAlbum.length === 0) {
      mostrarAlerta(
        "Completa el título y asegúrate de tener al menos una fotografía en el álbum.",
        "error",
      );
      return;
    }

    if (!fotosAlbum.some((f) => f.es_portada)) {
      fotosAlbum[0].es_portada = true;
    }

    setLoading(true);
    try {
      const payload = {
        titulo,
        categoria,
        categoria_etiqueta: categoriaEtiqueta,
        fecha: fecha || "Reciente",
        descripcion: descripcion || titulo,
        enlace_url: enlaceUrl.trim() || null, // 🟢 NUEVO CAMPO ENVIADO AL BACKEND
        fotos: fotosAlbum,
      };

      const ok = await api.guardarGaleria(payload, editingId);
      if (ok) {
        setShowModal(false);
        onReload();
        mostrarAlerta(
          editingId
            ? "Galería actualizada con éxito."
            : "Galería creada con éxito.",
        );
      } else {
        mostrarAlerta("Error al guardar en la galería.", "error");
      }
    } catch (err) {
      console.error(err);
      mostrarAlerta("Error de red al guardar el registro.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="fw-bold mb-0">Gestión de Galería de Eventos</h5>
          <p className="text-muted extra-small mb-0">
            Administra los álbumes y fotografías del personal.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm rounded-pill px-3 fw-semibold shadow-sm"
          onClick={handleOpenNuevo}
        >
          <i className="bi bi-images me-1"></i> Nueva Galería
        </button>
      </div>

      {/* GRID DE ÁLBUMES */}
      <div className="row g-3">
        {galeria.length === 0 ? (
          <div className="col-12 text-center text-muted py-4">
            No hay galerías registradas.
          </div>
        ) : (
          galeria.map((item) => {
            const portadaObj =
              (item.fotos || []).find((f) => f.es_portada) || item.fotos?.[0];
            const urlPortada = portadaObj ? portadaObj.url : "";

            return (
              <div className="col-md-4 col-lg-3" key={item.id}>
                <div className="card h-100 border-0 shadow-sm rounded-3 overflow-hidden position-relative">
                  <div
                    className="bg-light d-flex align-items-center justify-content-center overflow-hidden position-relative"
                    style={{ height: "150px" }}
                  >
                    <img
                      src={urlPortada}
                      alt={item.titulo}
                      className="w-100 h-100"
                      style={{ objectFit: "cover" }}
                    />
                    <span className="badge bg-dark bg-opacity-75 position-absolute top-0 end-0 m-2 extra-small">
                      <i className="bi bi-camera me-1"></i>
                      {item.fotos?.length || item.fotos_count || 1}
                    </span>
                  </div>
                  <div className="card-body p-2 d-flex flex-column justify-content-between">
                    <div>
                      <span className="badge bg-danger-subtle text-danger extra-small mb-1">
                        {item.categoria_etiqueta || item.categoria}
                      </span>
                      <h6 className="fw-bold text-dark mb-1 extra-small text-truncate">
                        {item.titulo}
                      </h6>
                      <small className="text-muted extra-small d-block">
                        <i className="bi bi-calendar3 me-1"></i>
                        {item.fecha}
                      </small>
                    </div>
                    <div className="d-flex justify-content-end gap-1 pt-2 border-top mt-2">
                      <button
                        type="button"
                        className="btn btn-xs btn-outline-primary rounded-circle"
                        title="Editar Galería"
                        onClick={() => handleEdit(item)}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        type="button"
                        className="btn btn-xs btn-outline-danger rounded-circle"
                        title="Eliminar Galería"
                        onClick={() => handleEliminar(item.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL CREAR / EDITAR REGISTRO */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold fs-6 text-primary">
                  <i
                    className={`bi ${editingId ? "bi-pencil-square" : "bi-plus-circle"} me-2`}
                  ></i>
                  {editingId
                    ? "Editar Álbum / Evento"
                    : "Crear Nuevo Álbum / Evento"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label extra-small fw-semibold">
                      Título del Evento
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      placeholder="Ej. Celebración Día del Empleado"
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label extra-small fw-semibold">
                        Categoría
                      </label>
                      <select
                        className="form-select form-select-sm"
                        value={categoria}
                        onChange={handleCategoriaChange}
                      >
                        {categoriasOpciones.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label extra-small fw-semibold">
                        Fecha Visible
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        placeholder="Ej. Mayo 2026"
                        required
                      />
                    </div>
                  </div>

                  {/* GESTIÓN DE FOTOGRAFÍAS MÚLTIPLES Y SELECCIÓN DE PORTADA */}
                  <div className="mb-3">
                    <label className="form-label extra-small fw-semibold d-block">
                      Fotografías del Álbum (Selecciona o arrastra varias
                      imágenes)
                    </label>
                    <div className="input-group input-group-sm mb-2">
                      <input
                        type="file"
                        className="form-control"
                        onChange={handleArchivosSeleccionados}
                        accept="image/*"
                        multiple
                      />
                    </div>
                    <small className="text-muted extra-small d-block mb-2">
                      Haz clic en <strong>"Marcar como Portada"</strong> en la
                      foto que deseas mostrar en la tarjeta principal del
                      portal.
                    </small>

                    {/* PREVIEW DE FOTOS CARGADAS */}
                    {fotosAlbum.length > 0 && (
                      <div
                        className="row g-2 p-2 bg-light rounded border"
                        style={{ maxHeight: "200px", overflowY: "auto" }}
                      >
                        {fotosAlbum.map((foto, index) => (
                          <div className="col-3 position-relative" key={index}>
                            <div
                              className={`card h-100 border ${foto.es_portada ? "border-primary border-2 shadow-sm" : "border-secondary"}`}
                            >
                              <img
                                src={foto.url}
                                alt={`Preview ${index}`}
                                className="w-100"
                                style={{ height: "80px", objectFit: "cover" }}
                              />
                              <div className="card-body p-1 text-center bg-white">
                                {foto.es_portada ? (
                                  <span className="badge bg-primary extra-small w-100 mb-1">
                                    Portada
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    className="btn btn-xxs btn-outline-primary w-100 mb-1 extra-small py-0"
                                    onClick={() => handleMarcarPortada(index)}
                                  >
                                    Hacer Portada
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className="btn btn-xxs btn-outline-danger w-100 extra-small py-0"
                                  onClick={() => handleRemoverFoto(index)}
                                >
                                  Quitar
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label extra-small fw-semibold">
                      Descripción del Evento
                    </label>
                    <textarea
                      className="form-control form-control-sm"
                      rows="3"
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      placeholder="Resumen del evento o actividad..."
                      required
                    ></textarea>
                  </div>

                  {/* 🟢 NUEVO: CAMPO PARA INSERTAR URL DE MÁS FOTOS */}
                  <div className="mb-3">
                    <label className="form-label extra-small fw-semibold d-flex align-items-center gap-1">
                      <i className="bi bi-link-45deg text-primary"></i> Enlace /
                      URL para ver más fotos (Opcional)
                    </label>
                    <input
                      type="url"
                      className="form-control form-control-sm"
                      value={enlaceUrl}
                      onChange={(e) => setEnlaceUrl(e.target.value)}
                      placeholder="https://drive.google.com/drive/folders/..."
                    />
                    <small className="text-muted extra-small d-block mt-1">
                      Ingresa el enlace a un álbum externo (Google Drive,
                      OneDrive, etc.) si deseas que los usuarios accedan a más
                      fotos.
                    </small>
                  </div>

                  <div className="d-flex justify-content-end pt-3 border-top">
                    <button
                      type="button"
                      className="btn btn-light rounded-pill px-3 btn-sm me-1"
                      onClick={() => setShowModal(false)}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary rounded-pill px-4 btn-sm fw-semibold shadow-sm"
                      disabled={loading || fotosAlbum.length === 0}
                    >
                      {loading
                        ? "Guardando..."
                        : editingId
                          ? "Actualizar Álbum"
                          : "Crear Galería"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notificación flotante Toast */}
      <ToastNotification
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
}
