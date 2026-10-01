import React, { useState, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import { api } from '../services/api.js';
import 'react-quill-new/dist/quill.snow.css';
import { decodeHTMLEntities } from '../utils/formatters.js';
import ToastNotification from './ToastNotification';

export default function ComunicadosSection({ comunicados = [], onReload }) {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState('Importante');
  const [fechaProg, setFechaProg] = useState('');
  const [contenido, setContenido] = useState('');
  const [enlaceUrl, setEnlaceUrl] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [imagenActual, setImagenActual] = useState('');
  const [documentoActual, setDocumentoActual] = useState('');
  const [loading, setLoading] = useState(false);

  // 🟢 ESTADOS DE PAGINACIÓN
  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina, setElementosPorPagina] = useState(10);

  // Referencia directa al input para evitar fallos de estado
  const enlaceRef = useRef(null);

  // Estado para alertas flotantes Toast
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
  });

  // Configuración de la barra de herramientas del Editor de Texto
  const modulesQuill = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['clean'],
    ],
  };

  // 🟢 LÓGICA DE PAGINACIÓN
  const totalComunicados = comunicados.length;
  const totalPaginas = Math.ceil(totalComunicados / elementosPorPagina) || 1;
  const indiceUltimo = paginaActual * elementosPorPagina;
  const indicePrimer = indiceUltimo - elementosPorPagina;
  const comunicadosPaginados = comunicados.slice(indicePrimer, indiceUltimo);

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  const handleCambioElementos = (e) => {
    setElementosPorPagina(Number(e.target.value));
    setPaginaActual(1);
  };

  const mostrarAlerta = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3500);
  };

  const handleOpenModal = () => {
    setEditingId(null);
    setTitulo('');
    setCategoria('Importante');
    setFechaProg('');
    setContenido('');
    setEnlaceUrl('');
    if (enlaceRef.current) enlaceRef.current.value = '';
    setArchivo(null);
    setImagenActual('');
    setDocumentoActual('');
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setTitulo(item.titulo || '');
    setCategoria(item.categoria || 'Importante');
    setEnlaceUrl(item.enlace_url || '');
    if (enlaceRef.current) enlaceRef.current.value = item.enlace_url || '';
    setImagenActual(item.imagen_url || '');
    setDocumentoActual(item.documento_url || '');

    if (item.fecha_publicacion) {
      try {
        const fechaObj = new Date(item.fecha_publicacion);
        const tzOffset = fechaObj.getTimezoneOffset() * 60000;
        const fechaLocalFormatted = new Date(fechaObj.getTime() - tzOffset)
          .toISOString()
          .slice(0, 16);
        setFechaProg(fechaLocalFormatted);
      } catch (e) {
        setFechaProg('');
      }
    } else {
      setFechaProg('');
    }

    // Cargar contenido HTML directamente en el editor Quill
    setContenido(item.contenido || '');
    setArchivo(null);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo.trim()) {
      mostrarAlerta('Por favor completa al menos el título.', 'error');
      return;
    }

    setLoading(true);
    try {
      let imagenUrlFinal = imagenActual;
      let documentoUrlFinal = documentoActual;

      if (archivo) {
        try {
          const uploadRes = await api.uploadFile(archivo);
          if (uploadRes && uploadRes.url) {
            const uploadedUrl = uploadRes.url;
            const esPdfFile = archivo.name.toLowerCase().endsWith('.pdf');

            if (esPdfFile) {
              documentoUrlFinal = uploadedUrl;
            } else {
              imagenUrlFinal = uploadedUrl;
            }
          }
        } catch (uploadErr) {
          mostrarAlerta(
            uploadErr.message || 'No se pudo subir el archivo.',
            'error'
          );
          setLoading(false);
          return;
        }
      }

      // Extraer texto plano para generar el resumen sin etiquetas HTML
      const textoPlano = contenido ? contenido.replace(/<[^>]*>/g, '').trim() : '';
      const fechaLimpia = fechaProg && fechaProg.trim() !== '' ? fechaProg : null;
      const valorEnlaceFinal = enlaceRef.current ? enlaceRef.current.value.trim() : enlaceUrl.trim();

      const payload = {
        titulo,
        categoria,
        enlace_url: valorEnlaceFinal !== '' ? valorEnlaceFinal : null,
        resumen: textoPlano ? textoPlano.substring(0, 90) + (textoPlano.length > 90 ? '...' : '') : null,
        contenido: contenido || null, // Guarda directamente el HTML formateado por Quill
        imagen_url: imagenUrlFinal || null,
        documento_url: documentoUrlFinal || null,
        fecha_publicacion: fechaLimpia,
      };

      const ok = await api.guardarComunicado(payload, editingId);
      if (ok) {
        setShowModal(false);
        onReload();
        mostrarAlerta(
          editingId
            ? 'Comunicado actualizado con éxito.'
            : 'Comunicado publicado con éxito.'
        );
      } else {
        mostrarAlerta('Error al guardar el comunicado en el servidor.', 'error');
      }
    } catch (err) {
      console.error(err);
      mostrarAlerta('Error de red al procesar el comunicado.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstado = async (id, nuevoEstado) => {
    const targetId = typeof id === 'object' && id !== null ? id.id : id;

    try {
      const ok = await api.cambiarEstadoComunicado(targetId, nuevoEstado);
      if (ok) {
        onReload();
        mostrarAlerta('Estado del comunicado actualizado con éxito.');
      } else {
        mostrarAlerta('Error al actualizar el estado del comunicado.', 'error');
      }
    } catch (err) {
      console.error("Error de red al cambiar estado:", err);
      mostrarAlerta('Error de red al cambiar el estado.', 'error');
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este comunicado de forma permanente?')) {
      try {
        const ok = await api.eliminarComunicado(id);
        if (ok) {
          onReload();
          mostrarAlerta('Comunicado eliminado correctamente.');
        } else {
          mostrarAlerta('No se pudo eliminar el comunicado.', 'error');
        }
      } catch (error) {
        console.error(error);
        mostrarAlerta('Error de red al intentar eliminar.', 'error');
      }
    }
  };

  return (
    <div className="container py-4">
      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="fw-bold mb-0">Gestión de Comunicados y Avisos</h5>
            <p className="text-muted extra-small mb-0">
              Monitorea publicaciones activas, programadas y archivadas.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-danger btn-sm rounded-pill px-3 fw-semibold shadow-sm"
            onClick={handleOpenModal}
          >
            <i className="bi bi-plus-circle me-1"></i> Crear Comunicado
          </button>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle extra-small mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: '5%' }}>ID</th>
                <th style={{ width: '28%' }}>Título</th>
                <th style={{ width: '12%' }}>Categoría</th>
                <th style={{ width: '15%' }}>Fecha Publicación</th>
                <th style={{ width: '10%' }}>Estado</th>
                <th style={{ width: '8%' }} className="text-center">Reacciones</th>
                <th style={{ width: '8%' }} className="text-center">Confirmaciones</th>
                <th style={{ width: '14%' }} className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {totalComunicados === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center text-muted py-3">
                    No hay comunicados registrados.
                  </td>
                </tr>
              ) : (
                comunicadosPaginados.map((item) => {
                  const fechaObj = item.fecha_publicacion ? new Date(item.fecha_publicacion) : null;
                  const fechaFormateada = fechaObj
                    ? fechaObj.toLocaleString('es-ES', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })
                    : 'Inmediata';

                  const ahora = new Date();
                  let badgeEstado = (
                    <span className="badge bg-success">Activo</span>
                  );

                  if (item.estado === 'archivado') {
                    badgeEstado = (
                      <span className="badge bg-secondary">Archivado</span>
                    );
                  } else if (item.estado === 'programado' || (fechaObj && fechaObj > ahora)) {
                    badgeEstado = (
                      <span className="badge bg-warning text-dark">
                        <i className="bi bi-clock me-1"></i>Programado
                      </span>
                    );
                  }

                  return (
                    <tr key={item.id}>
                      <td className="fw-bold text-muted">{item.id}</td>
                      <td className="fw-semibold text-dark">
                        {decodeHTMLEntities(item.titulo)}
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {item.categoria}
                        </span>
                      </td>
                      <td>{fechaFormateada}</td>
                      <td>{badgeEstado}</td>
                      <td className="text-center">
                        <i className="bi bi-heart-fill text-danger me-1"></i>
                        {item.likes || 0}
                      </td>
                      <td className="text-center">
                        <i className="bi bi-check-circle-fill text-success me-1"></i>
                        {item.confirmaciones || 0}
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-xs btn-outline-primary px-2"
                            title="Editar"
                            onClick={() => handleEdit(item)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          
                          {(item.estado === 'programado' || (fechaObj && fechaObj > ahora)) && (
                            <button
                              type="button"
                              className="btn btn-xs btn-outline-success px-2"
                              title="Publicar Ahora"
                              onClick={() => handleCambiarEstado(item.id, 'activo')}
                            >
                              <i className="bi bi-play-fill"></i>
                            </button>
                          )}

                          <button
                            type="button"
                            className="btn btn-xs btn-outline-secondary px-2"
                            title="Archivar"
                            onClick={() => handleCambiarEstado(item.id, 'archivado')}
                          >
                            <i className="bi bi-archive"></i>
                          </button>

                          <button
                            type="button"
                            className="btn btn-xs btn-outline-danger px-2"
                            title="Eliminar"
                            onClick={() => handleEliminar(item.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 🟢 PANEL INFERIOR DE CONTROLES DE PAGINACIÓN */}
        {totalComunicados > 0 && (
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 pt-3 mt-3 border-top">
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted extra-small fw-semibold">Mostrar:</span>
              <select
                className="form-select form-select-sm rounded-3 extra-small fw-bold border-secondary-subtle"
                style={{ width: '75px', cursor: 'pointer' }}
                value={elementosPorPagina}
                onChange={handleCambioElementos}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-muted extra-small ms-1">
                Mostrando <strong>{indicePrimer + 1}</strong> - <strong>{Math.min(indiceUltimo, totalComunicados)}</strong> de <strong>{totalComunicados}</strong> comunicados
              </span>
            </div>

            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm rounded-pill px-3 extra-small fw-semibold"
                onClick={() => cambiarPagina(paginaActual - 1)}
                disabled={paginaActual === 1}
              >
                <i className="bi bi-chevron-left me-1"></i> Anterior
              </button>

              <span className="extra-small fw-bold text-dark px-2">
                Pág. {paginaActual} de {totalPaginas}
              </span>

              <button
                type="button"
                className="btn btn-outline-danger btn-sm rounded-pill px-3 extra-small fw-semibold"
                onClick={() => cambiarPagina(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
              >
                Siguiente <i className="bi bi-chevron-right ms-1"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL CREAR / EDITAR */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
            <div className="modal-content rounded-4 border-0 shadow overflow-hidden">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold fs-6 text-danger">
                  <i className="bi bi-megaphone me-2"></i>
                  {editingId
                    ? 'Editar Comunicado'
                    : 'Publicar o Programar Comunicado'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label extra-small fw-semibold">
                      Título del aviso
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      required
                      placeholder="Ej. Campaña de Salud 2026 🏥"
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label extra-small fw-semibold">
                        Categoría
                      </label>
                      <select
                        className="form-select form-select-sm"
                        value={categoria}
                        onChange={(e) => setCategoria(e.target.value)}
                      >
                        <option value="Importante">Importante</option>
                        <option value="Comunicado">Comunicado</option>
                        <option value="Evento">Evento</option>
                        <option value="Salud">Salud y Bienestar</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label extra-small fw-semibold">
                        Programar publicación (Opcional)
                      </label>
                      <input
                        type="datetime-local"
                        className="form-control form-control-sm"
                        value={fechaProg}
                        onChange={(e) => setFechaProg(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* CAMPO DE ENLACE CON REF */}
                  <div className="mb-3">
                    <label className="form-label extra-small fw-semibold">
                      <i className="bi bi-link-45deg me-1 text-danger"></i> Enlace de Registro o Web Externa (Opcional)
                    </label>
                    <input
                      type="url"
                      ref={enlaceRef}
                      className="form-control form-control-sm"
                      defaultValue={enlaceUrl}
                      onChange={(e) => setEnlaceUrl(e.target.value)}
                      placeholder="https://ejemplo.com/registro-evento"
                    />
                    <div className="form-text extra-small text-muted">
                      Si el comunicado requiere un botón de registro, ingresa la URL completa aquí.
                    </div>
                  </div>

                  {/* SUBIDA DE ARCHIVOS */}
                  <div className="mb-3 p-3 bg-light rounded-3 border">
                    <label className="form-label extra-small fw-semibold text-dark mb-1">
                      <i className="bi bi-paperclip me-1 text-danger"></i>
                      Adjuntar Archivo o Banner (Opcional)
                    </label>

                    {imagenActual && !archivo && (
                      <div className="mb-2 d-flex align-items-center gap-2">
                        <img
                          src={
                            imagenActual.startsWith('http')
                              ? imagenActual
                              : `http://${window.location.hostname}:8001${imagenActual}`
                          }
                          alt="Banner actual"
                          style={{
                            height: '45px',
                            width: '45px',
                            objectFit: 'cover',
                          }}
                          className="rounded border"
                        />
                        <small className="text-muted extra-small">
                          Imagen actual conservada.
                        </small>
                      </div>
                    )}

                    {documentoActual && !archivo && (
                      <div className="mb-2 d-flex align-items-center gap-2 text-danger">
                        <i className="bi bi-file-earmark-pdf fs-4"></i>
                        <small className="fw-semibold extra-small">
                          Documento PDF adjunto conservado.
                        </small>
                      </div>
                    )}

                    <input
                      type="file"
                      className="form-control form-control-sm"
                      onChange={(e) => setArchivo(e.target.files[0])}
                      accept="image/*,.gif,.pdf"
                    />
                  </div>

                  {/* 🟢 EDITOR DE TEXTO ENRIQUECIDO REEMPLAZANDO AL TEXTAREA PLANO */}
                  <div className="mb-3">
                    <label className="form-label extra-small fw-semibold">
                      Contenido del Comunicado (Opcional)
                    </label>
                    <div className="bg-white rounded-3 overflow-hidden border">
                      <ReactQuill
                        theme="snow"
                        value={contenido}
                        onChange={setContenido}
                        modules={modulesQuill}
                        placeholder="Escribe aquí el contenido del comunicado con formato (negritas, listas, etc.)..."
                        style={{ height: '160px', marginBottom: '45px' }}
                      />
                    </div>
                  </div>

                  <div className="text-end pt-2">
                    <button
                      type="button"
                      className="btn btn-light rounded-pill px-3 btn-sm me-1"
                      onClick={handleCloseModal}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-danger rounded-pill px-4 btn-sm fw-semibold shadow-sm"
                      disabled={loading}
                    >
                      {loading
                        ? 'Guardando...'
                        : editingId
                          ? 'Actualizar Comunicado'
                          : 'Guardar Comunicado'}
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