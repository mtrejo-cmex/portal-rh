import React, { useState, useEffect } from "react";
import { api } from "../services/api.js";
import { decodeHTMLEntities } from "../utils/formatters.js";
import PortalOrientaPAE from "./PortalOrientaPAE.jsx";
import PortalNosotros from "./PortalNosotros.jsx";
import ToastNotification from "./ToastNotification.jsx";

export default function PortalPublic({
  comunicados = [],
  usuario,
  onReload,
  onOpenConvenios,
  onOpenCalendario,
  onOpenGaleria,
  onOpenOrienta,
  onOpenFormatos,
  onOpenCajaAhorro,
  onOpenGastosMedicos,
}) {
  const [listaComunicados, setListaComunicados] = useState(comunicados);
  const [searchTerm, setSearchTerm] = useState("");
  const [carruselIndex, setCarruselIndex] = useState(0);
  const [comunicadoSeleccionado, setComunicadoSeleccionado] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [vistaActual, setVistaActual] = useState("inicio");

  // Estado para el Modal Lightbox (Ampliar imagen del Calendario PAE)
  const [showModalPae, setShowModalPae] = useState(false);

  // Estados para PDF e Imagen de PAE
  const [urlPaeActual, setUrlPaeActual] = useState("");
  const [imagenPaeActual, setImagenPaeActual] = useState("");

  const [toastInfo, setToastInfo] = useState({
    show: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    setListaComunicados(comunicados);
  }, [comunicados]);

  // REACOMODO HARMONIOSO DE TARJETAS BENTO
  const bentoItems = [
    {
      id: "convenios",
      title: "Convenios Corporativos",
      desc: "Descuentos institucionales, servicios médicos y beneficios exclusivos.",
      icon: "bi-gift-fill",
      type: "card-large",
      badge: "EXCLUSIVO RH",
      accent: true,
      onClick: onOpenConvenios,
    },
    {
      id: "vacaciones",
      title: "Vacaciones & Permisos",
      desc: "",
      icon: "bi-umbrella-fill",
      type: "card-wide",
      badge: "MÁS USADO",
      href: "http://192.168.3.18/websiap/inicio.htm",
      target: "_blank",
    },
    {
      id: "calendario",
      title: "Calendario Laboral",
      desc: "Días festivos, eventos y fechas importantes.",
      icon: "bi-calendar3",
      type: "card-wide",
      badge: "EVENTOS RH",
      accent: true,
      onClick: onOpenCalendario,
    },
    {
      id: "learning",
      title: "Learning Zone",
      subtitle: "Capacitación y Cursos",
      icon: "bi-mortarboard-fill",
      type: "card-tall",
      accent: true,
      href: "https://lz.usa.canon.com/",
      target: "_blank",
    },
    {
      id: "orienta",
      title: "Orienta PAE",
      desc: "Apoyo emocional, médico y legal.",
      icon: "bi-person-heart",
      type: "card-tall",
      badge: "BIENESTAR",
      accent: true,
      onClick: () => {
        if (onOpenOrienta) onOpenOrienta();
        else setVistaActual("orienta");
      },
    },
    {
      id: "gastos-medicos",
      title: "Gastos Médicos Mayores",
      desc: "Pólizas MetLife, trámites y reembolsos.",
      icon: "bi-heart-pulse-fill",
      type: "card-large",
      badge: "SALUD & SEGUROS",
      accent: true,
      onClick: onOpenGastosMedicos,
    },
    {
      id: "desempeno",
      title: "Evaluación Desempeño",
      icon: "bi-diagram-3",
      type: "standard",
      href: "http://192.168.3.30/performanceappraisal/general_strategy/index",
      target: "_blank",
    },
    {
      id: "formatos",
      title: "Formatos",
      icon: "bi-file-earmark-check",
      type: "standard",
      onClick: onOpenFormatos,
    },
    {
      id: "nosotros",
      title: "Nosotros",
      icon: "bi-node-plus-fill",
      type: "standard",
      onClick: () => setVistaActual("nosotros"),
    },
    {
      id: "caja",
      title: "Caja de Ahorro",
      icon: "bi-piggy-bank-fill",
      type: "standard",
      onClick: onOpenCajaAhorro,
    },
    {
      id: "conducta",
      title: "Código Conducta",
      icon: "bi-shield-check",
      type: "standard",
      onClick: () => {
        const pdfUrl = `https://drive.google.com/file/d/1x6Hct2DcaHkuQ5n7p2FjL_ythYpDZAz2/view?usp=sharing`;
        window.open(pdfUrl, "_blank", "noopener,noreferrer");
      },
    },
    {
      id: "employee",
      title: "Employee",
      icon: "bi-people-fill",
      type: "standard",
      href: "http://192.168.3.30/employee/empleado/index",
      target: "_blank",
    },
    {
      id: "enlaces",
      title: "Enlaces",
      icon: "bi-link-45deg",
      type: "standard",
      href: "http://192.168.3.58:8080/cmex-web/",
      target: "_blank",
    },
    {
      id: "galeria",
      title: "Galería",
      icon: "bi-cake2",
      type: "standard",
      onClick: onOpenGaleria,
    },
  ];

  useEffect(() => {
    const fetchPaeConfig = async () => {
      try {
        if (api.getPaeConfig) {
          const res = await api.getPaeConfig();
          if (res) {
            if (res.url) setUrlPaeActual(res.url);
            if (res.imagen_url) setImagenPaeActual(res.imagen_url);
          }
        }
      } catch (err) {
        console.error("Error al obtener la configuración de Orienta PAE:", err);
      }
    };
    fetchPaeConfig();
  }, []);

  const bentoFiltrados = bentoItems.filter((item) => {
    if (!item) return false;
    const term = searchTerm.toLowerCase();
    return (
      item.title.toLowerCase().includes(term) ||
      (item.desc && item.desc.toLowerCase().includes(term)) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(term))
    );
  });

  const comunicadosFiltrados = listaComunicados.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.titulo.toLowerCase().includes(term) ||
      (item.categoria && item.categoria.toLowerCase().includes(term))
    );
  });

  const obtenerUrlArchivo = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const nombreArchivo = url.includes("/") ? url.split("/").pop() : url;
    return `${window.location.origin}/uploads/${nombreArchivo}`;
  };

  const obtenerUrlPae = (url) => {
    if (!url) return "";
    const nombreArchivo = url.includes("/")
      ? url.split("/").pop().split("?")[0]
      : url;
    return `http://192.168.3.35:8001/uploads/${nombreArchivo}?t=${Date.now()}`;
  };

  const limpiarTextoPlano = (texto, maxLen = 120) => {
    if (!texto) return "";
    let textoLimpio = "";
    if (typeof window !== "undefined") {
      try {
        const doc = new DOMParser().parseFromString(texto, "text/html");
        textoLimpio = doc.body.textContent || doc.body.innerText || "";
      } catch (e) {
        textoLimpio = texto.replace(/<[^>]*>/g, " ");
      }
    } else {
      textoLimpio = texto.replace(/<[^>]*>/g, " ");
    }

    textoLimpio = textoLimpio
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/[\u00A0\s]+/g, " ")
      .trim();

    if (maxLen && textoLimpio.length > maxLen) {
      return textoLimpio.substring(0, maxLen).trim() + "...";
    }
    return textoLimpio;
  };

  const moverCarrusel = (direccion) => {
    if (comunicadosFiltrados.length === 0) return;
    const maxIndex = comunicadosFiltrados.length - 1;
    setCarruselIndex((prevIndex) => {
      let nuevoIndex = prevIndex + direccion;
      if (nuevoIndex < 0) nuevoIndex = maxIndex;
      if (nuevoIndex > maxIndex) nuevoIndex = 0;
      return nuevoIndex;
    });
  };

  useEffect(() => {
    if (comunicadosFiltrados.length <= 1 || isPaused) return;
    const interval = setInterval(() => moverCarrusel(1), 10000);
    return () => clearInterval(interval);
  }, [comunicadosFiltrados.length, isPaused, carruselIndex]);

  const handleLike = async (e, id) => {
    e.stopPropagation();
    const idUsuario = usuario?.email || usuario?.user_id || usuario?.usuario_rh;
    if (!idUsuario) {
      alert("Debes ingresar con tu usuario RH para reaccionar.");
      return;
    }

    try {
      const res = await api.darLike(id, usuario);
      if (res && typeof res.likes === "number") {
        setListaComunicados((prevLista) =>
          prevLista.map((item) =>
            item.id === id ? { ...item, likes: res.likes } : item,
          ),
        );
        if (comunicadoSeleccionado && comunicadoSeleccionado.id === id) {
          setComunicadoSeleccionado((prev) => ({ ...prev, likes: res.likes }));
        }
      }
      if (onReload) onReload();
    } catch (error) {
      console.error("Error al procesar Me Gusta:", error);
    }
  };

  const handleConfirmar = async (e, id) => {
    e.stopPropagation();
    const idUsuario = usuario?.email || usuario?.user_id || usuario?.usuario_rh;
    if (!idUsuario) {
      setToastInfo({
        show: true,
        message: "Debes ingresar con tu usuario RH para confirmar.",
        type: "danger",
      });
      return;
    }

    try {
      const res = await api.confirmarLectura(id, usuario);
      if (res?.status === "already_confirmed") {
        setToastInfo({
          show: true,
          message: res.message || "Ya has confirmado la lectura anteriormente.",
          type: "info",
        });
      } else if (res && typeof res.confirmaciones === "number") {
        setToastInfo({
          show: true,
          message: "¡Gracias! Se ha registrado tu confirmación de lectura.",
          type: "success",
        });
        setListaComunicados((prevLista) =>
          prevLista.map((item) =>
            item.id === id
              ? { ...item, confirmaciones: res.confirmaciones }
              : item,
          ),
        );
        if (comunicadoSeleccionado && comunicadoSeleccionado.id === id) {
          setComunicadoSeleccionado((prev) => ({
            ...prev,
            confirmaciones: res.confirmaciones,
          }));
        }
        if (onReload) onReload();
      }
    } catch (error) {
      console.error("Error al confirmar lectura:", error);
      setToastInfo({
        show: true,
        message: "Error al registrar la confirmación.",
        type: "danger",
      });
    }
  };

  if (vistaActual === "orienta") {
    return <PortalOrientaPAE onVolver={() => setVistaActual("inicio")} />;
  }

  if (vistaActual === "nosotros") {
    return <PortalNosotros onVolver={() => setVistaActual("inicio")} />;
  }

  return (
    <main className="container mb-4 pt-3">
      <style>{`
        .comunicado-contenido-body img {
          max-width: 100% !important;
          height: auto !important;
          display: block;
          margin: 10px auto;
          border-radius: 8px;
          object-fit: contain;
        }
        .comunicado-contenido-body a {
          color: #CC0000 !important;
          text-decoration: underline !important;
          font-weight: 600;
        }
      `}</style>

      {/* HERO BANNER */}
      <section
        className="p-3 p-md-4 mb-4 rounded-4 shadow-sm position-relative overflow-hidden text-start"
        style={{
          background: "linear-gradient(135deg, #CC0000 0%, #660000 100%)",
          color: "#ffffff",
        }}
      >
        <div
          className="row align-items-center position-relative"
          style={{ zIndex: 1 }}
        >
          <div className="col-lg-8 text-start">
            <span
              className="px-3 py-1 rounded-pill mb-3 shadow-sm d-inline-flex align-items-center"
              style={{
                backgroundColor: "#ffffff",
                color: "#cc0000",
                fontSize: "0.68rem",
                fontWeight: 700,
              }}
            >
              PORTAL OFICIAL RH
            </span>
            <h1 className="fs-3 mb-2 text-start fw-black">
              Bienvenido a Mi Portal RH
            </h1>
            <p className="mb-0 text-start opacity-90 lh-base fs-6">
              El lugar donde encontrarás todo en un solo sitio. Mantente al día
              con los últimos eventos, comunicados y actualizaciones importantes
              de la empresa.
            </p>
          </div>
        </div>
      </section>

      {/* BUSCADOR FLOTANTE */}
      <section className="row mb-4">
        <div className="col-md-8 mx-auto">
          <div className="input-group search-container">
            <span className="input-group-text bg-transparent border-0 text-muted ps-3">
              <i className="bi bi-search fs-6"></i>
            </span>
            <input
              type="text"
              className="form-control border-0 ps-2 py-2 small"
              placeholder="Buscar plataforma, servicio o comunicado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>
      </section>

      {/* LAYOUT DE 2 COLUMNAS */}
      <div className="row g-4">
        {/* COLUMNA IZQUIERDA: BENTO GRID + CALENDARIO PAE SPLIT */}
        <div className="col-lg-7">
          <h2 className="section-title mt-0 mb-3 fs-5">
            Recursos Humanos y Desarrollo
          </h2>

          <div className="bento-grid" id="cards-grid">
            {bentoFiltrados.map((item) => {
              const handleClick = (e) => {
                if (item.onClick) {
                  e.preventDefault();
                  item.onClick();
                }
              };

              if (item.id === "convenios") {
                return (
                  <a
                    href="#"
                    key={item.id}
                    className={`bento-item ${item.type} p-3 d-flex flex-column justify-content-between`}
                    onClick={handleClick}
                    style={{ textDecoration: "none" }}
                  >
                    <div className="d-flex justify-content-between align-items-start w-100">
                      <div className="icon-container accent-icon fs-4">
                        <i className={`bi ${item.icon}`}></i>
                      </div>
                      <span className="badge bg-danger-subtle text-danger extra-small fw-bold px-2 py-1">
                        {item.badge}
                      </span>
                    </div>
                    <div>
                      <h5 className="fw-bold mb-1 text-dark fs-5">
                        {item.title}
                      </h5>
                      <p className="text-muted extra-small mb-0 lh-sm">
                        {item.desc}
                      </p>
                    </div>
                  </a>
                );
              }

              if (item.id === "vacaciones") {
                return (
                  <a
                    href={item.href}
                    target={item.target}
                    rel="noreferrer"
                    key={item.id}
                    className={`bento-item ${item.type} p-3 d-flex align-items-center`}
                    style={{ textDecoration: "none" }}
                  >
                    <div className="d-flex align-items-center gap-3 w-100">
                      <div className="icon-container flex-shrink-0">
                        <i className={`bi ${item.icon}`}></i>
                      </div>
                      <div className="overflow-hidden">
                        <span className="badge bg-danger extra-small py-1 px-2 mb-1 d-inline-block">
                          {item.badge}
                        </span>
                        <p className="link-title fw-bold mb-0 text-dark text-truncate">
                          {item.title}
                        </p>
                      </div>
                    </div>
                  </a>
                );
              }

              if (item.id === "learning") {
                return (
                  <a
                    href={item.href}
                    target={item.target}
                    rel="noreferrer"
                    key={item.id}
                    className={`bento-item ${item.type} p-3 d-flex flex-column justify-content-between`}
                    style={{ textDecoration: "none" }}
                  >
                    <div className="icon-container accent-icon">
                      <i className={`bi ${item.icon}`}></i>
                    </div>
                    <div>
                      <p className="link-title fw-bold mb-1 text-dark">
                        {item.title}
                      </p>
                      <span className="text-muted extra-small d-block">
                        {item.subtitle}
                      </span>
                    </div>
                  </a>
                );
              }

              if (
                item.type === "card-wide" ||
                item.type === "card-tall" ||
                item.type === "card-large"
              ) {
                const isVertical =
                  item.type === "card-large" || item.type === "card-tall";

                return (
                  <a
                    href={item.href || "#"}
                    target={item.target}
                    rel="noreferrer"
                    key={item.id}
                    className={`bento-item ${item.type} p-3`}
                    onClick={handleClick}
                    style={{ textDecoration: "none" }}
                  >
                    {isVertical ? (
                      <div className="d-flex flex-column justify-content-between h-100 w-100">
                        <div className="d-flex justify-content-between align-items-start w-100 mb-2">
                          <div
                            className={`icon-container ${item.accent ? "accent-icon" : ""}`}
                          >
                            <i className={`bi ${item.icon}`}></i>
                          </div>
                          {item.badge && (
                            <span className="badge bg-danger-subtle text-danger extra-small fw-bold px-2 py-1">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="link-title fw-bold mb-1 text-dark fs-6">
                            {item.title}
                          </p>
                          {item.desc && (
                            <p className="text-muted extra-small mb-0 lh-sm">
                              {item.desc}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="d-flex align-items-center gap-2 w-100 h-100 overflow-hidden">
                        <div
                          className={`icon-container ${item.accent ? "accent-icon" : ""} my-0 flex-shrink-0`}
                        >
                          <i className={`bi ${item.icon}`}></i>
                        </div>
                        <div className="flex-grow-1 min-w-0 d-flex flex-column justify-content-center">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            {item.badge && (
                              <span
                                className="badge bg-danger-subtle text-danger extra-small fw-bold px-1.5 py-0.5 flex-shrink-0"
                                style={{ fontSize: "0.6rem" }}
                              >
                                {item.badge}
                              </span>
                            )}
                            <p
                              className="link-title fw-bold text-dark text-truncate mb-0"
                              style={{ fontSize: "0.85rem" }}
                            >
                              {item.title}
                            </p>
                          </div>
                          {item.desc && (
                            <p
                              className="text-muted extra-small mb-0 text-truncate"
                              style={{ fontSize: "0.68rem" }}
                            >
                              {item.desc}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </a>
                );
              }

              return (
                <a
                  href={item.href || "#"}
                  target={item.target}
                  rel="noreferrer"
                  key={item.id}
                  className="bento-item"
                  onClick={handleClick}
                  style={{ textDecoration: "none" }}
                >
                  <div className="icon-container">
                    <i className={`bi ${item.icon}`}></i>
                  </div>
                  <p className="link-title">{item.title}</p>
                </a>
              );
            })}
          </div>

          {/* TARJETA SPLIT CON VISTA PREVIA DE LA IMAGEN DE CALENDARIO PAE */}
          <div className="card border-0 rounded-4 bg-white shadow-sm overflow-hidden mt-4">
            <div className="row g-0 align-items-center">
              <div
                className="col-sm-5 bg-light p-2 text-center border-end border-light position-relative overflow-hidden cursor-pointer"
                onClick={() => setShowModalPae(true)}
                title="Haz clic para ampliar imagen"
              >
                <div
                  style={{ height: "165px" }}
                  className="d-flex align-items-center justify-content-center overflow-hidden rounded-3 bg-white"
                >
                  {imagenPaeActual ? (
                    <img
                      src={obtenerUrlPae(imagenPaeActual)}
                      alt="Calendario Orienta PAE"
                      className="img-fluid w-100 h-100"
                      style={{ objectFit: "cover", objectPosition: "top" }}
                    />
                  ) : (
                    <i className="bi bi-calendar-event fs-1 text-danger"></i>
                  )}
                </div>
                <div
                  className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-60 text-white py-1 extra-small"
                  style={{ fontSize: "0.68rem" }}
                >
                  <i className="bi bi-arrows-angle-expand me-1"></i> Clic para
                  ampliar
                </div>
              </div>

              <div className="col-sm-7 p-3.5 p-3">
                <span className="badge bg-danger-subtle text-danger extra-small fw-bold px-2 py-1 mb-1">
                  BIENESTAR ORIENTA PAE
                </span>
                <h6 className="fw-bold text-dark mb-1">
                  Calendario de Eventos & Actividades
                </h6>
                <p
                  className="text-muted extra-small mb-3 lh-sm"
                  style={{ fontSize: "0.75rem" }}
                >
                  Consulta los próximos talleres, webinars y actividades de
                  salud mental y financiera.
                </p>

                <div className="d-flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-semibold extra-small"
                    onClick={() => setShowModalPae(true)}
                  >
                    <i className="bi bi-eye me-1"></i> Ver Imagen
                  </button>
                  <a
                    href={
                      urlPaeActual ||
                      `http://localhost:8001/uploads/calendario_orienta_pae.pdf`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-danger rounded-pill px-3 fw-semibold extra-small border-0"
                    style={{ backgroundColor: "#CC0000" }}
                  >
                    <i className="bi bi-file-earmark-pdf me-1"></i> Abrir PDF
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: COMUNICADOS + ATENCIÓN RH & FILOSOFÍA */}
        <div className="col-lg-5">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="section-title mt-0 mb-0 fs-5">Comunicados</h2>
            <div className="d-flex gap-1">
              <button
                type="button"
                className="btn btn-outline-secondary btn-xs rounded-circle p-0 d-flex align-items-center justify-content-center"
                style={{ width: "28px", height: "28px" }}
                onClick={() => moverCarrusel(-1)}
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              <button
                type="button"
                className="btn btn-outline-danger btn-xs rounded-circle p-0 d-flex align-items-center justify-content-center"
                style={{ width: "28px", height: "28px" }}
                onClick={() => moverCarrusel(1)}
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>

          <div
            className="overflow-hidden rounded-4 mb-4"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div
              className="d-flex flex-nowrap"
              style={{
                transform: `translateX(-${carruselIndex * 100}%)`,
                transition: "transform 0.4s ease-in-out",
              }}
            >
              {comunicadosFiltrados.length === 0 ? (
                <div className="w-100 p-4 text-center text-muted bg-white rounded-4 border">
                  No hay comunicados.
                </div>
              ) : (
                comunicadosFiltrados.map((item) => {
                  const textoBase = item.contenido || item.resumen || "";
                  const resumenFormateado = limpiarTextoPlano(textoBase, 120);

                  return (
                    <div
                      key={item.id}
                      className="flex-shrink-0 w-100"
                      style={{ cursor: "pointer" }}
                      onClick={() => setComunicadoSeleccionado(item)}
                    >
                      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white h-100">
                        {item.imagen_url && (
                          <div
                            className="bg-light border-bottom d-flex align-items-center justify-content-center overflow-hidden"
                            style={{ height: "240px" }}
                          >
                            <img
                              src={obtenerUrlArchivo(item.imagen_url)}
                              alt={item.titulo}
                              className="img-fluid w-100 h-100"
                              style={{ objectFit: "contain", padding: "8px" }}
                            />
                          </div>
                        )}
                        <div className="card-body p-4">
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="badge bg-danger-subtle text-danger extra-small rounded-pill px-3 py-1">
                              {item.categoria || "Aviso"}
                            </span>
                            <small className="text-muted extra-small">
                              {item.fecha_publicacion
                                ? new Date(
                                    item.fecha_publicacion,
                                  ).toLocaleDateString("es-ES")
                                : ""}
                            </small>
                          </div>
                          <h5 className="fw-bold text-dark mb-2 fs-6">
                            {decodeHTMLEntities(item.titulo)}
                          </h5>
                          <p className="text-muted small mb-3 lh-sm">
                            {resumenFormateado}
                          </p>

                          <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                            <button
                              type="button"
                              className="btn btn-xs btn-light text-danger rounded-pill fw-semibold px-3 py-1 d-flex align-items-center gap-1"
                              onClick={(e) => handleLike(e, item.id)}
                            >
                              <i className="bi bi-heart-fill"></i>{" "}
                              <span>{item.likes ?? 0}</span>
                            </button>

                            <button
                              type="button"
                              className="btn btn-xs btn-outline-success rounded-pill fw-semibold px-3 py-1 d-flex align-items-center gap-1"
                              onClick={(e) => handleConfirmar(e, item.id)}
                            >
                              <i className="bi bi-check2-circle"></i>{" "}
                              <span>
                                Enterado{" "}
                                {item.confirmaciones
                                  ? `(${item.confirmaciones})`
                                  : ""}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* MÓDULO COMBINADO: ATENCIÓN RH (SÓLO CORREO) & FILOSOFÍA KYOSEI */}
          <div className="d-flex flex-column gap-3">
            {/* ATENCIÓN DIRECTA A COLABORADORES */}
            <div className="card border-0 shadow-sm rounded-4 bg-white p-3.5 p-3">
              <h6 className="fw-bold text-dark mb-2.5 d-flex align-items-center gap-2 extra-small text-uppercase tracking-wider">
                <i className="bi bi-headset text-danger fs-5"></i>
                Atención a Colaboradores
              </h6>
              <div>
                <a
                  href="mailto:recursoshumanosmx@cusa.canon.com"
                  className="text-decoration-none p-2.5 p-2 rounded-3 bg-light text-center d-block hover-elevate transition-all border border-light"
                >
                  <i className="bi bi-envelope-at-fill text-danger fs-4 d-block mb-1"></i>
                  <small className="fw-bold d-block text-dark extra-small">
                    Buzón RH
                  </small>
                  <span
                    className="text-muted extra-small"
                    style={{ fontSize: "0.75rem" }}
                  >
                    recursoshumanosmx@cusa.canon.com
                  </span>
                </a>
              </div>
            </div>

            {/* BANNER FILOSOFÍA CANON - KYOSEI */}
            <div
              className="card border-0 shadow-sm rounded-4 p-3.5 p-3 text-white position-relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #1e1e1e 0%, #3a3a3a 100%)",
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="badge bg-danger text-white extra-small fw-bold px-2 py-0.5">
                  FILOSOFÍA CANON
                </span>
                <i className="bi bi-globe2 text-white-50 fs-5"></i>
              </div>
              <h6
                className="fw-bold mb-1 text-white"
                style={{ fontSize: "0.95rem" }}
              >
                Kyosei (共生)
              </h6>
              <p
                className="extra-small mb-0 text-white-50 lh-sm"
                style={{ fontSize: "0.73rem" }}
              >
                "Todas las personas, sin importar su origen o cultura, viviendo
                y trabajando juntas armónicamente por el bien común."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL LIGHTBOX PARA VER IMAGEN DE CALENDARIO PAE */}
      {showModalPae && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.75)", zIndex: 1055 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
              <div className="modal-header border-0 pb-2 pt-3 px-4 d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-calendar-event text-danger fs-5"></i>
                  <h5 className="modal-title fw-bold text-dark mb-0 fs-6">
                    Calendario Orienta PAE
                  </h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModalPae(false)}
                ></button>
              </div>

              <div className="modal-body p-3 bg-light text-center">
                {imagenPaeActual ? (
                  <img
                    src={obtenerUrlPae(imagenPaeActual)}
                    alt="Calendario Orienta PAE"
                    className="img-fluid rounded-3 shadow-sm"
                    style={{ maxHeight: "72vh", objectFit: "contain" }}
                  />
                ) : (
                  <div className="py-5 text-muted">
                    <i className="bi bi-file-earmark-pdf fs-1 d-block text-danger mb-2"></i>
                    No hay vista previa disponible.
                  </div>
                )}
              </div>

              <div className="modal-footer border-0 p-3 bg-white justify-content-between">
                <small className="text-muted extra-small">
                  Programa de Asistencia a Empleados — Canon Group
                </small>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-light border rounded-pill px-3 fw-semibold extra-small"
                    onClick={() => setShowModalPae(false)}
                  >
                    Cerrar
                  </button>
                  <a
                    href={
                      urlPaeActual ||
                      `http://localhost:8001/uploads/calendario_orienta_pae.pdf`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-danger rounded-pill px-3 fw-semibold extra-small border-0"
                    style={{ backgroundColor: "#CC0000" }}
                  >
                    <i className="bi bi-box-arrow-up-right me-1"></i> Abrir PDF
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL COMUNICADO SELECCIONADO */}
      {comunicadoSeleccionado && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
            style={{ maxWidth: "800px", width: "90%" }}
          >
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-0 pb-0 mt-2 mx-2">
                <h5 className="modal-title fw-bold fs-5 text-dark">
                  {decodeHTMLEntities(comunicadoSeleccionado.titulo)}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setComunicadoSeleccionado(null)}
                ></button>
              </div>
              <div className="modal-body mx-2 pb-4 pt-2">
                <div className="mb-3 d-flex align-items-center gap-2">
                  <span className="badge bg-danger rounded-pill extra-small">
                    {comunicadoSeleccionado.categoria}
                  </span>
                  <small className="text-muted extra-small">
                    {comunicadoSeleccionado.fecha_publicacion
                      ? new Date(
                          comunicadoSeleccionado.fecha_publicacion,
                        ).toLocaleDateString("es-ES")
                      : ""}
                  </small>
                </div>

                {comunicadoSeleccionado.imagen_url && (
                  <div className="bg-light border rounded-3 mb-3 text-center overflow-hidden p-2 w-100 position-relative">
                    <img
                      src={obtenerUrlArchivo(comunicadoSeleccionado.imagen_url)}
                      alt="Banner"
                      className="img-fluid rounded-3 w-100 h-auto"
                      style={{ maxHeight: "700px", objectFit: "contain" }}
                    />
                  </div>
                )}

                <div className="comunicado-contenido-body text-dark small lh-lg">
                  <div
                    className="ql-editor p-0"
                    dangerouslySetInnerHTML={{
                      __html: comunicadoSeleccionado.contenido,
                    }}
                  />
                </div>
              </div>
              <div className="modal-footer border-0 pt-0 pb-3 justify-content-center">
                <button
                  type="button"
                  className="btn btn-light rounded-pill px-4 btn-sm fw-medium"
                  onClick={() => setComunicadoSeleccionado(null)}
                >
                  Cerrar comunicado
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastNotification
        show={toastInfo.show}
        message={toastInfo.message}
        type={toastInfo.type}
        onClose={() => setToastInfo({ ...toastInfo, show: false })}
      />
    </main>
  );
}
