import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { api } from "../services/api.js";
import { decodeHTMLEntities } from "../utils/formatters.js";
import ToastNotification from "./ToastNotification";

// 🟢 SUBCOMPONENTE DE CELDA (DECODIFICA Y LIMPIA &nbsp;)
function CeldaBeneficio({ descuento, descripcion, onVerDetalles }) {
  const descripcionLimpia = descripcion
    ? decodeHTMLEntities(descripcion.replace(/<[^>]*>/g, ""))
        .replace(/&nbsp;/g, " ")
        .trim()
    : "";

  const descuentoLimpio = descuento
    ? decodeHTMLEntities(descuento)
        .replace(/&nbsp;/g, " ")
        .trim()
    : "";

  const textoCompleto = `${descuentoLimpio ? `${descuentoLimpio} - ` : ""}${descripcionLimpia}`;

  const LIMITE = 120;
  const esLargo = textoCompleto.length > LIMITE;
  const textoCorto = esLargo
    ? `${textoCompleto.substring(0, LIMITE)}...`
    : textoCompleto;

  return (
    <div>
      {descuentoLimpio && (
        <strong
          className="text-danger me-1 d-block"
          style={{ color: "#CC0000" }}
        >
          {descuentoLimpio}
        </strong>
      )}
      <span className="text-secondary extra-small lh-sm d-block">
        {descripcionLimpia
          ? descuentoLimpio && esLargo
            ? `${descripcionLimpia.substring(0, LIMITE)}...`
            : textoCorto
          : "Sin descripción"}
      </span>
      {esLargo && (
        <button
          type="button"
          className="btn btn-link p-0 extra-small text-danger fw-bold text-decoration-none mt-1"
          onClick={onVerDetalles}
        >
          <i className="bi bi-eye me-1"></i>Ver detalles completos
        </button>
      )}
    </div>
  );
}

export default function ConveniosSection({ onReload }) {
  const [conveniosAdmin, setConveniosAdmin] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  // ESTADO PARA VER DETALLES DEL CONVENIO EN UN MODAL GLOBAL
  const [detalleConvenioModal, setDetalleConvenioModal] = useState(null);

  // ESTADOS DE PAGINACIÓN
  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina, setElementosPorPagina] = useState(10);

  // Campos principales del convenio
  const [empresa, setEmpresa] = useState("");
  const [titulo, setTitulo] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [categoriasLista, setCategoriasLista] = useState([]);
  const [descuento, setDescuento] = useState("");
  const [sitioWeb, setSitioWeb] = useState("");
  const [codigo, setCodigo] = useState("");
  const [vigencia, setVigencia] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [condiciones, setCondiciones] = useState("");

  // 🟢 ESTADOS PARA GESTIÓN DEL LOGO
  const [logoUrl, setLogoUrl] = useState("");
  const [logoNuevo, setLogoNuevo] = useState(null);

  const [archivosNuevos, setArchivosNuevos] = useState([]);
  const [archivosExistentes, setArchivosExistentes] = useState([]);

  const [contactos, setContactos] = useState([
    { nombre: "", email: "", telefono: "", puesto: "" },
  ]);

  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "danger",
  });

  // Configuración de la barra de herramientas del Editor de Texto
  const modulesQuill = {
    toolbar: [
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["clean"],
    ],
  };

  // LÓGICA DE PAGINACIÓN
  const totalConvenios = conveniosAdmin.length;
  const totalPaginas = Math.ceil(totalConvenios / elementosPorPagina) || 1;
  const indiceUltimo = paginaActual * elementosPorPagina;
  const indicePrimer = indiceUltimo - elementosPorPagina;
  const conveniosPaginados = conveniosAdmin.slice(indicePrimer, indiceUltimo);

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  const handleCambioElementos = (e) => {
    setElementosPorPagina(Number(e.target.value));
    setPaginaActual(1);
  };

  const mostrarAlerta = (message, type = "danger") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "danger" });
    }, 3500);
  };

  const cargarDatosAdmin = async () => {
    try {
      const resConvenios = await api.getConveniosAdmin();
      if (resConvenios && Array.isArray(resConvenios)) {
        setConveniosAdmin(resConvenios);
      }

      const resCategorias = await api.getCategoriasConvenios();
      if (resCategorias && Array.isArray(resCategorias)) {
        setCategoriasLista(resCategorias);
        if (resCategorias.length > 0 && !categoriaId) {
          setCategoriaId(resCategorias[0].id);
        }
      }
    } catch (err) {
      console.error("Error al cargar datos de administración:", err);
    }
  };

  useEffect(() => {
    cargarDatosAdmin();
  }, []);

  const getNombreCategoria = (item) => {
    if (!item) return "Sin categoría";
    return item.categoria_rel?.nombre || "Sin categoría";
  };

  const handleAgregarContacto = () => {
    setContactos([
      ...contactos,
      { nombre: "", email: "", telefono: "", puesto: "" },
    ]);
  };

  const handleEliminarContacto = (index) => {
    if (contactos.length === 1) {
      mostrarAlerta("Debe haber al menos un contacto asignado.", "warning");
      return;
    }
    const nuevosContactos = contactos.filter((_, i) => i !== index);
    setContactos(nuevosContactos);
  };

  const handleContactoChange = (index, field, value) => {
    const nuevosContactos = [...contactos];
    nuevosContactos[index][field] = value;
    setContactos(nuevosContactos);
  };

  const handleOpenNuevo = () => {
    setEditId(null);
    setEmpresa("");
    setTitulo("");
    setCategoriaId(categoriasLista.length > 0 ? categoriasLista[0].id : "");
    setDescuento("");
    setSitioWeb("");
    setCodigo("");
    setVigencia("");
    setDescripcion("");
    setCondiciones("");
    setLogoUrl("");
    setLogoNuevo(null);
    setArchivosNuevos([]);
    setArchivosExistentes([]);
    setContactos([{ nombre: "", email: "", telefono: "", puesto: "" }]);
    setShowModal(true);
  };

  const handleOpenEditar = (item) => {
    setEditId(item.id);
    setEmpresa(item.empresa || "");
    setTitulo(item.titulo || "");
    setCategoriaId(
      item.categoria_id ||
        (categoriasLista.length > 0 ? categoriasLista[0].id : ""),
    );
    setDescuento(item.descuento || "");
    setSitioWeb(item.sitio_web || "");
    setCodigo(item.codigo_promocional || "");
    setVigencia(item.vigencia ? item.vigencia.split("T")[0] : "");
    setDescripcion(item.descripcion || "");
    setCondiciones(item.condiciones || "");
    setLogoUrl(item.logo_url || "");
    setLogoNuevo(null);
    setArchivosNuevos([]);

    try {
      const parsedArchivos = item.archivos_adjuntos
        ? JSON.parse(item.archivos_adjuntos)
        : [];
      setArchivosExistentes(parsedArchivos);
    } catch (e) {
      setArchivosExistentes([]);
    }

    if (
      item.contactos &&
      Array.isArray(item.contactos) &&
      item.contactos.length > 0
    ) {
      setContactos(
        item.contactos.map((c) => ({
          nombre: c.nombre || "",
          email: c.email || "",
          telefono: c.telefono || "",
          puesto: c.puesto || "",
        })),
      );
    } else {
      setContactos([
        {
          nombre: "",
          email: item.contacto_email || "",
          telefono: "",
          puesto: "",
        },
      ]);
    }

    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleEliminarArchivoExistente = (index) => {
    const filtrados = archivosExistentes.filter((_, i) => i !== index);
    setArchivosExistentes(filtrados);
  };

  const handleEliminar = async (id) => {
    if (!confirm("¿Deseas archivar este convenio?")) return;
    const ok = await api.eliminarConvenio(id);
    if (ok) {
      cargarDatosAdmin();
      if (onReload) onReload();
      mostrarAlerta("Convenio archivado correctamente.", "success");
    } else {
      mostrarAlerta("Error al archivar el convenio.", "danger");
    }
  };

  const handleReactivar = async (id) => {
    if (!confirm("¿Deseas reactivar este convenio?")) return;
    const ok = await api.reactivarConvenio(id);
    if (ok) {
      cargarDatosAdmin();
      if (onReload) onReload();
      mostrarAlerta("Convenio reactivado correctamente.", "success");
    } else {
      mostrarAlerta("Error al reactivar el convenio.", "danger");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!empresa.trim()) {
      mostrarAlerta("El nombre de la empresa es obligatorio.", "warning");
      return;
    }

    // Validar que la descripción no sea solo HTML vacío (<p><br></p>)
    const descLimpia = descripcion.replace(/<[^>]*>/g, "").trim();
    if (!descLimpia) {
      mostrarAlerta("La descripción del beneficio es obligatoria.", "warning");
      return;
    }

    const tieneContactoValido = contactos.some((c) => c.nombre.trim() !== "");
    if (!tieneContactoValido) {
      mostrarAlerta(
        "Debes ingresar al menos el nombre del contacto principal.",
        "warning",
      );
      return;
    }

    setLoading(true);
    try {
      // 🟢 1. PROCESAR LOGO SI SE SELECCIONÓ UNO NUEVO
      let finalLogoUrl = logoUrl;
      if (logoNuevo) {
        try {
          const uploadLogoRes = await api.uploadFile(logoNuevo);
          if (uploadLogoRes && uploadLogoRes.url) {
            finalLogoUrl = uploadLogoRes.url;
          }
        } catch (logoErr) {
          console.error("Error subiendo logo:", logoErr);
        }
      }

      // 🟢 2. PROCESAR FLYERS Y ADJUNTOS MULTIPLES
      let rutasFinales = [...archivosExistentes];
      if (archivosNuevos.length > 0) {
        for (const file of archivosNuevos) {
          try {
            const uploadRes = await api.uploadFile(file);
            if (uploadRes && uploadRes.url) {
              rutasFinales.push(uploadRes.url);
            }
          } catch (uploadErr) {
            console.error("Error subiendo archivo individual:", uploadErr);
          }
        }
      }

      const contactosFinales = contactos
        .filter((c) => c.nombre.trim() !== "")
        .map((c) => ({
          nombre: c.nombre.trim(),
          email: c.email.trim() || null,
          telefono: c.telefono.trim() || null,
          puesto: c.puesto.trim() || null,
        }));

      const payload = {
        empresa: empresa.trim(),
        titulo: titulo.trim() || null,
        categoria_id: categoriaId ? parseInt(categoriaId, 10) : null,
        descuento: descuento || null,
        sitio_web: sitioWeb || null,
        descripcion: descripcion,
        condiciones: condiciones || null,
        vigencia: vigencia || null,
        codigo_promocional: codigo || null,
        logo_url: finalLogoUrl || null,
        archivos_adjuntos: JSON.stringify(rutasFinales),
        destacado: false,
        estado: "activo",
        contactos: contactosFinales,
      };

      const ok = await api.guardarConvenio(payload, editId);
      if (ok) {
        setShowModal(false);
        cargarDatosAdmin();
        if (onReload) onReload();
        mostrarAlerta(
          editId
            ? "Convenio actualizado con éxito."
            : "Nuevo convenio registrado con éxito.",
          "success",
        );
      } else {
        mostrarAlerta("Error al guardar el convenio en el servidor.", "danger");
      }
    } catch (err) {
      console.error(err);
      mostrarAlerta("Error de red al guardar el convenio.", "danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
      {/* Encabezado Canon */}
      <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
        <div>
          <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
            <span
              className="d-inline-block rounded-square bg-danger"
              style={{ width: "4px", height: "20px" }}
            ></span>
            Gestión de Convenios Corporativos
          </h5>
          <p className="text-muted extra-small mb-0 ms-2">
            Administra los beneficios corporativos y contactos comerciales de
            Canon Group.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-danger btn-sm rounded-pill px-3 fw-bold shadow-sm d-flex align-items-center gap-1"
          style={{ backgroundColor: "#CC0000", borderColor: "#CC0000" }}
          onClick={handleOpenNuevo}
        >
          <i className="bi bi-plus-circle-fill"></i> Nuevo Convenio
        </button>
      </div>

      {/* Tabla Estilizada Paginada */}
      <div className="table-responsive">
        <table className="table table-hover align-middle extra-small mb-0 border">
          <thead className="table-light text-dark">
            <tr>
              <th style={{ width: "5%" }} className="text-center">
                ID
              </th>
              <th style={{ width: "20%" }}>Empresa / Título</th>
              <th style={{ width: "13%" }}>Categoría</th>
              <th style={{ width: "32%" }}>Descuento / Beneficio</th>
              <th style={{ width: "18%" }}>Contactos</th>
              <th style={{ width: "6%" }} className="text-center">
                Estado
              </th>
              <th style={{ width: "6%" }} className="text-end">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {totalConvenios === 0 ? (
              <tr>
                <td colSpan="7" className="text-center text-muted py-4">
                  No hay convenios registrados.
                </td>
              </tr>
            ) : (
              conveniosPaginados.map((item) => (
                <tr key={item.id}>
                  <td className="fw-bold text-secondary text-center">
                    {item.id}
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      {item.logo_url && (
                        <img
                          src={item.logo_url}
                          alt="Logo"
                          className="rounded border bg-light p-1"
                          style={{
                            width: "32px",
                            height: "32px",
                            objectFit: "contain",
                          }}
                        />
                      )}
                      <div>
                        <div className="fw-bold text-dark">
                          {decodeHTMLEntities(item.titulo || item.empresa)}
                        </div>
                        {item.titulo && (
                          <span className="text-muted extra-small d-block">
                            {decodeHTMLEntities(item.empresa)}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark border border-secondary-subtle px-2 py-1">
                      {getNombreCategoria(item)}
                    </span>
                  </td>

                  {/* CELDA DE BENEFICIO TRUNCADA CON ACTIVACIÓN DE MODAL */}
                  <td style={{ maxWidth: "350px" }}>
                    <CeldaBeneficio
                      descuento={item.descuento}
                      descripcion={item.descripcion}
                      onVerDetalles={() => setDetalleConvenioModal(item)}
                    />
                  </td>

                  <td>
                    {item.contactos && item.contactos.length > 0 ? (
                      <div className="extra-small">
                        {item.contactos.map((c, idx) => (
                          <div
                            key={idx}
                            className="mb-1 text-truncate"
                            style={{ maxWidth: "180px" }}
                          >
                            <i className="bi bi-person-badge-fill text-danger me-1"></i>
                            <strong>{c.nombre}</strong>
                            {c.email && (
                              <span className="text-muted d-block ms-3 extra-small">
                                {c.email}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted fst-italic">
                        Sin contacto
                      </span>
                    )}
                  </td>
                  <td className="text-center">
                    {item.estado === "archivado" ? (
                      <span className="badge bg-secondary rounded-pill">
                        Archivado
                      </span>
                    ) : (
                      <span className="badge bg-success rounded-pill">
                        Activo
                      </span>
                    )}
                  </td>
                  <td className="text-end">
                    <button
                      type="button"
                      className="btn btn-xs btn-outline-dark rounded-circle me-1"
                      title="Editar Convenio"
                      onClick={() => handleOpenEditar(item)}
                    >
                      <i className="bi bi-pencil-fill"></i>
                    </button>

                    {item.estado === "archivado" ? (
                      <button
                        type="button"
                        className="btn btn-xs btn-outline-success rounded-circle"
                        title="Reactivar Convenio"
                        onClick={() => handleReactivar(item.id)}
                      >
                        <i className="bi bi-arrow-counterclockwise"></i>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-xs btn-outline-danger rounded-circle"
                        title="Archivar Convenio"
                        onClick={() => handleEliminar(item.id)}
                      >
                        <i className="bi bi-trash-fill"></i>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PANEL INFERIOR DE CONTROLES DE PAGINACIÓN */}
      {totalConvenios > 0 && (
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 pt-3 mt-3 border-top">
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted extra-small fw-semibold">Mostrar:</span>
            <select
              className="form-select form-select-sm rounded-3 extra-small fw-bold border-secondary-subtle"
              style={{ width: "75px", cursor: "pointer" }}
              value={elementosPorPagina}
              onChange={handleCambioElementos}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-muted extra-small ms-1">
              Mostrando <strong>{indicePrimer + 1}</strong> -{" "}
              <strong>{Math.min(indiceUltimo, totalConvenios)}</strong> de{" "}
              <strong>{totalConvenios}</strong> convenios
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

      {/* Modal Estilo Canon */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
            <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
              <div className="modal-header bg-white border-bottom px-4 py-3">
                <h5 className="modal-title fw-bold fs-6 text-dark d-flex align-items-center gap-2">
                  <span
                    className="d-inline-block rounded-square bg-danger"
                    style={{ width: "4px", height: "18px" }}
                  ></span>
                  {editId
                    ? `Editando Convenio (ID #${editId})`
                    : "Registrar Nuevo Convenio Corporativo"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>

              <div className="modal-body p-4 bg-light-subtle">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <label className="form-label extra-small fw-bold text-secondary">
                        Empresa / Proveedor{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm border-secondary-subtle"
                        value={empresa}
                        onChange={(e) => setEmpresa(e.target.value)}
                        required
                        placeholder="Ej. Smart Fit"
                      />
                    </div>
                    <div className="col-md-5">
                      <label className="form-label extra-small fw-bold text-secondary">
                        Título del Convenio / Beneficio
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm border-secondary-subtle"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        placeholder="Ej. Plan Black sin costo de inscripción"
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label extra-small fw-bold text-secondary">
                        Categoría <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select form-select-sm border-secondary-subtle"
                        value={categoriaId}
                        onChange={(e) => setCategoriaId(e.target.value)}
                        required
                      >
                        {categoriasLista.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* CAMPO DESCUENTO MULTI-LÍNEA */}
                  <div className="mb-3">
                    <label className="form-label extra-small fw-bold text-secondary">
                      Descuento / Beneficio Resumido
                    </label>
                    <textarea
                      className="form-control form-control-sm border-secondary-subtle"
                      rows="2"
                      value={descuento}
                      onChange={(e) => setDescuento(e.target.value)}
                      maxLength={500}
                      placeholder="Ej. 15% de descuento en pago en efectivo, tarjeta de crédito o débito..."
                    ></textarea>
                    <div className="form-text extra-small text-muted text-end">
                      {descuento ? descuento.length : 0} / 500 caracteres máx.
                    </div>
                  </div>

                  {/* FILA CON CAMPOS SECUNDARIOS REORGANIZADOS */}
                  <div className="row g-2 mb-3">
                    <div className="col-md-5">
                      <label className="form-label extra-small fw-bold text-secondary">
                        Sitio Web / Enlace Corporativo
                      </label>
                      <input
                        type="url"
                        className="form-control form-control-sm border-secondary-subtle"
                        value={sitioWeb}
                        onChange={(e) => setSitioWeb(e.target.value)}
                        placeholder="https://empresa.com"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label extra-small fw-bold text-secondary">
                        Código Promocional
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm border-secondary-subtle"
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value)}
                        placeholder="Ej. CANON2026"
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label extra-small fw-bold text-secondary">
                        Vigencia
                      </label>
                      <input
                        type="date"
                        className="form-control form-control-sm border-secondary-subtle"
                        value={vigencia}
                        onChange={(e) => setVigencia(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* 🟢 NUEVA SECCIÓN: CAMPO DEDICADO PARA EL LOGO */}
                  <div className="mb-3 border rounded-3 p-3 bg-white shadow-sm">
                    <label className="form-label extra-small fw-bold text-secondary d-flex align-items-center gap-1 mb-2">
                      <i className="bi bi-image text-danger"></i> Logo de la
                      Empresa / Marca (PNG, JPG)
                    </label>

                    {logoUrl && !logoNuevo && (
                      <div
                        className="mb-2 d-flex align-items-center gap-2 bg-light p-2 rounded border"
                        style={{ maxWidth: "300px" }}
                      >
                        <img
                          src={logoUrl}
                          alt="Logo actual"
                          style={{
                            height: "40px",
                            maxWidth: "80px",
                            objectFit: "contain",
                          }}
                          className="rounded border bg-white p-1"
                        />
                        <div className="extra-small text-truncate flex-grow-1">
                          <span className="fw-bold d-block text-dark">
                            Logo actual
                          </span>
                          <span className="text-muted text-truncate d-block">
                            {logoUrl.split("/").pop()}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="btn btn-xs btn-outline-danger"
                          onClick={() => setLogoUrl("")}
                          title="Quitar logo"
                        >
                          &times;
                        </button>
                      </div>
                    )}

                    <input
                      type="file"
                      className="form-control form-control-sm border-secondary-subtle"
                      onChange={(e) => setLogoNuevo(e.target.files[0] || null)}
                      accept="image/*"
                    />
                    <div className="form-text extra-small text-muted mt-1">
                      Selecciona una imagen con fondo transparente (PNG) o sobre
                      fondo blanco para la tarjeta del convenio.
                    </div>
                  </div>

                  {/* SECCIÓN CONTACTOS */}
                  <div className="border rounded-3 p-3 bg-white shadow-sm mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                      <h6 className="fw-bold mb-0 text-dark extra-small d-flex align-items-center gap-1">
                        <i className="bi bi-people-fill text-danger"></i>
                        Contactos del Convenio{" "}
                        <span className="text-danger">*</span>
                      </h6>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-xs rounded-pill font-weight-bold"
                        onClick={handleAgregarContacto}
                      >
                        <i className="bi bi-person-plus-fill me-1"></i> Agregar
                        Contacto
                      </button>
                    </div>

                    {contactos.map((c, index) => (
                      <div
                        key={index}
                        className="row g-2 mb-2 pb-2 border-bottom align-items-center"
                      >
                        <div className="col-md-3">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Nombre Completo *"
                            value={c.nombre}
                            onChange={(e) =>
                              handleContactoChange(
                                index,
                                "nombre",
                                e.target.value,
                              )
                            }
                            required
                          />
                        </div>
                        <div className="col-md-3">
                          <input
                            type="email"
                            className="form-control form-control-sm"
                            placeholder="Correo Electrónico"
                            value={c.email}
                            onChange={(e) =>
                              handleContactoChange(
                                index,
                                "email",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="col-md-3">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Teléfono Directo"
                            value={c.telefono}
                            onChange={(e) =>
                              handleContactoChange(
                                index,
                                "telefono",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="col-md-2 col-10">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Puesto / Cargo"
                            value={c.puesto}
                            onChange={(e) =>
                              handleContactoChange(
                                index,
                                "puesto",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="col-md-1 col-2 text-end">
                          <button
                            type="button"
                            className="btn btn-xs btn-link text-danger p-0"
                            onClick={() => handleEliminarContacto(index)}
                            title="Quitar contacto"
                          >
                            <i className="bi bi-x-circle-fill fs-6"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* SECCIÓN DOCUMENTOS / FLYERS ADJUNTOS */}
                  <div className="mb-3 border rounded-3 p-3 bg-white shadow-sm">
                    <label className="form-label extra-small fw-bold text-secondary d-flex align-items-center gap-1 mb-2">
                      <i className="bi bi-paperclip text-danger"></i> Flyers o
                      Documentos Adjuntos (Múltiples)
                    </label>

                    {archivosExistentes.length > 0 && (
                      <div className="mb-3">
                        <small className="text-muted extra-small d-block mb-1 fw-bold">
                          Archivos actuales guardados:
                        </small>
                        <div className="d-flex flex-wrap gap-2">
                          {archivosExistentes.map((url, idx) => (
                            <div
                              key={idx}
                              className="position-relative border rounded p-1 bg-light d-flex align-items-center gap-2"
                              style={{ maxWidth: "200px" }}
                            >
                              <i className="bi bi-file-earmark-text text-secondary fs-5"></i>
                              <span
                                className="extra-small text-truncate"
                                style={{ maxWidth: "130px" }}
                              >
                                {url.split("/").pop()}
                              </span>
                              <button
                                type="button"
                                className="btn btn-xs btn-danger p-0 rounded-circle d-flex align-items-center justify-content-center"
                                style={{
                                  width: "18px",
                                  height: "18px",
                                  fontSize: "10px",
                                }}
                                onClick={() =>
                                  handleEliminarArchivoExistente(idx)
                                }
                                title="Eliminar archivo"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <input
                      type="file"
                      className="form-control form-control-sm border-secondary-subtle"
                      multiple
                      onChange={(e) =>
                        setArchivosNuevos(Array.from(e.target.files))
                      }
                      accept="image/*,.pdf,.doc,.docx"
                    />
                    <div className="form-text extra-small text-muted mt-1">
                      Puedes seleccionar varias imágenes o documentos PDF al
                      mismo tiempo manteniendo presionada la tecla Ctrl o Shift.
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label extra-small fw-bold text-secondary">
                      Descripción del Beneficio{" "}
                      <span className="text-danger">*</span>
                    </label>
                    <div className="bg-white rounded-3 overflow-hidden border">
                      <ReactQuill
                        theme="snow"
                        value={descripcion}
                        onChange={setDescripcion}
                        modules={modulesQuill}
                        placeholder="Escribe aquí los detalles del beneficio con formato (negritas, listas, etc.)..."
                        style={{ height: "160px", marginBottom: "45px" }}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label extra-small fw-bold text-secondary">
                      Condiciones y Términos
                    </label>
                    <textarea
                      className="form-control form-control-sm border-secondary-subtle"
                      rows="2"
                      value={condiciones}
                      onChange={(e) => setCondiciones(e.target.value)}
                      placeholder="Condiciones de aplicación..."
                    ></textarea>
                  </div>

                  <div className="d-flex justify-content-end pt-3 border-top gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary rounded-pill px-4 btn-sm fw-semibold"
                      onClick={handleCloseModal}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-danger rounded-pill px-4 btn-sm fw-bold shadow-sm"
                      style={{
                        backgroundColor: "#CC0000",
                        borderColor: "#CC0000",
                      }}
                      disabled={loading}
                    >
                      {loading
                        ? "Guardando..."
                        : editId
                          ? "Actualizar Convenio"
                          : "Registrar Convenio"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ÚNICO GLOBAL PARA VER DETALLES DEL BENEFICIO */}
      {detalleConvenioModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header bg-white border-bottom px-4 py-3">
                <h6 className="modal-title fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                  <span
                    className="d-inline-block rounded-square bg-danger"
                    style={{ width: "4px", height: "18px" }}
                  ></span>
                  Detalles del Descuento y Beneficio
                </h6>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setDetalleConvenioModal(null)}
                ></button>
              </div>
              <div className="modal-body p-4 bg-light-subtle">
                {detalleConvenioModal.descuento && (
                  <div className="mb-3 p-2 bg-danger-subtle text-danger rounded-3 border border-danger-subtle fw-bold extra-small">
                    <i className="bi bi-tag-fill me-1"></i> Descuento:{" "}
                    {detalleConvenioModal.descuento}
                  </div>
                )}
                <div
                  className="extra-small text-secondary lh-lg bg-white p-3 rounded-3 border shadow-sm"
                  style={{ maxHeight: "400px", overflowY: "auto" }}
                  dangerouslySetInnerHTML={{
                    __html: detalleConvenioModal.descripcion || "",
                  }}
                />
              </div>
              <div className="modal-footer border-0 pt-0 bg-light-subtle">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm rounded-pill px-4"
                  onClick={() => setDetalleConvenioModal(null)}
                >
                  Cerrar
                </button>
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
