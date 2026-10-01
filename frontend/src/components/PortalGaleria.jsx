import React, { useState, useEffect } from "react";
import { api } from "../services/api.js";
import PortalHeader from "./PortalHeader.jsx";

export default function PortalGaleria({
  galeria: galeriaProp,
  onVolver,
  usuario,
  onSwitchView,
  onLogout,
}) {
  const [filter, setFilter] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [fotoSeleccionada, setFotoSeleccionada] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0); // Índice para navegar entre las fotos del álbum
  const [isPaused, setIsPaused] = useState(false); // Estado para pausar el carrusel al pasar el mouse
  const [galeriaData, setGaleriaData] = useState(galeriaProp || []);
  const [cargando, setCargando] = useState(!galeriaProp);

  // 🟢 HELPER DE NORMALIZACIÓN DE ENLACES EXTERNOS (Agrega https:// si no lo incluye)
  const obtenerEnlaceExterno = (item) => {
    if (!item) return null;
    const rawUrl =
      item.enlace_url ||
      item.url_externa ||
      item.enlace ||
      item.link ||
      item.url_fotos ||
      item.link_fotos ||
      item.url_album;

    if (!rawUrl || typeof rawUrl !== "string") return null;
    const trimmed = rawUrl.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };

  // 🟢 HELPER DE NORMALIZACIÓN DE FOTOS DEL ÁLBUM
  const obtenerFotosAlbum = (item) => {
    if (!item) return [];
    let raw = item.fotos;

    if (typeof raw === "string") {
      try {
        raw = JSON.parse(raw);
      } catch (e) {
        raw = [raw];
      }
    }

    if (!Array.isArray(raw) || raw.length === 0) {
      const portada = item.imagen_portada || item.imagen_url || item.url;
      return portada ? [{ url: portada, es_portada: true }] : [];
    }

    return raw.map((f, idx) => {
      if (typeof f === "string") {
        return { url: f, es_portada: idx === 0 };
      }
      return {
        url: f.url || f.imagen_url || f.src || "",
        es_portada: !!f.es_portada,
      };
    });
  };

  // Sincronizar galeriaProp si viene actualizado del padre
  useEffect(() => {
    if (galeriaProp && Array.isArray(galeriaProp)) {
      setGaleriaData(galeriaProp);
      setCargando(false);
    }
  }, [galeriaProp]);

  // Cargar datos de la galería si no se pasaron por props
  useEffect(() => {
    if (!galeriaProp) {
      const fetchGaleria = async () => {
        try {
          const res = await api.getGaleria();
          if (Array.isArray(res)) setGaleriaData(res);
        } catch (err) {
          console.error("Error al cargar la galería pública:", err);
        } finally {
          setCargando(false);
        }
      };
      fetchGaleria();
    }
  }, [galeriaProp]);

  // 🟢 EFECTO PARA AVANCE AUTOMÁTICO DE FOTOS CADA 5 SEGUNDOS
  useEffect(() => {
    if (!fotoSeleccionada || isPaused) return;

    const fotos = obtenerFotosAlbum(fotoSeleccionada);
    if (fotos.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === fotos.length - 1 ? 0 : prev + 1));
    }, 5000); // 5000ms = 5 segundos

    return () => clearInterval(interval);
  }, [fotoSeleccionada, isPaused, currentIndex]);

  // Abrir álbum seleccionando la portada por defecto
  const handleAbrirAlbum = (item) => {
    const fotos = obtenerFotosAlbum(item);
    const indexPortada = fotos.findIndex((f) => f.es_portada);
    setCurrentIndex(indexPortada !== -1 ? indexPortada : 0);
    setIsPaused(false);
    setFotoSeleccionada(item);
  };

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    const fotos = obtenerFotosAlbum(fotoSeleccionada);
    if (fotos.length <= 1) return;
    setCurrentIndex((prev) => (prev === 0 ? fotos.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    const fotos = obtenerFotosAlbum(fotoSeleccionada);
    if (fotos.length <= 1) return;
    setCurrentIndex((prev) => (prev === fotos.length - 1 ? 0 : prev + 1));
  };

  // Filtrado combinado por categoría y buscador
  const fotosFiltradas = galeriaData.filter((item) => {
    const coincideCategoria = filter === "todos" || item.categoria === filter;
    const term = searchTerm.toLowerCase();
    const coincideBusqueda =
      (item.titulo && item.titulo.toLowerCase().includes(term)) ||
      (item.descripcion && item.descripcion.toLowerCase().includes(term)) ||
      (item.fecha && item.fecha.toLowerCase().includes(term));

    return coincideCategoria && coincideBusqueda;
  });

  return (
    <div className="bg-light min-vh-100 pb-5">
      {/* 🟢 HEADER CORPORATIVO UNIFICADO */}
      <PortalHeader
        usuario={usuario}
        onSwitchView={onSwitchView}
        onLogout={onLogout}
      />

      {/* CONTENIDO PRINCIPAL */}
      <main className="container mb-5 pt-3">
        {/* Encabezado de Página & Breadcrumbs */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-2 extra-small">
                <li className="breadcrumb-item">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onVolver();
                    }}
                    className="text-decoration-none text-danger fw-semibold d-inline-flex align-items-center gap-1"
                  >
                    <i className="bi bi-house-door-fill"></i>
                    <span>Inicio</span>
                  </a>
                </li>
                <li
                  className="breadcrumb-item active text-muted"
                  aria-current="page"
                >
                  Galería de Eventos
                </li>
              </ol>
            </nav>

            <h2 className="fw-bold text-dark mb-1">
              Galería Fotográfica Corporativa
            </h2>
            <p className="text-muted small mb-0">
              Revive los mejores momentos de nuestras integraciones,
              voluntariados y eventos de la comunidad Canon.
            </p>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-light btn-sm rounded-pill px-3 fw-semibold text-dark border shadow-sm"
              onClick={onVolver}
            >
              <i className="bi bi-arrow-left text-danger me-1"></i> Volver al
              Portal
            </button>
            <span className="badge bg-danger-subtle text-danger fw-semibold px-3 py-2 rounded-pill extra-small">
              <i className="bi bi-camera-fill me-1"></i> Momentos CMEX 2026
            </span>
          </div>
        </div>

        {/* TARJETA PRINCIPAL DEL CONTENEDOR */}
        <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
          {/* BARRA DE FILTROS Y BÚSQUEDA */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom">
            {/* Filtros de Categoría */}
            <div className="d-flex flex-wrap gap-2">
              {[
                { id: "todos", label: "Todos los eventos" },
                { id: "integracion", label: "Integración" },
                { id: "cumpleanos", label: "Cumpleaños" },
                { id: "capacitacion", label: "Capacitaciones" },
                { id: "corporativo", label: "Eventos Corporativos" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`btn btn-sm rounded-pill extra-small px-3 ${
                    filter === cat.id
                      ? "btn-outline-danger active fw-bold"
                      : "btn-outline-secondary"
                  }`}
                  onClick={() => setFilter(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Buscador */}
            <div style={{ maxWidth: "280px" }} className="w-100">
              <div className="input-group input-group-sm rounded-pill border overflow-hidden shadow-sm">
                <span className="input-group-text bg-white border-0 text-muted ps-3">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-0 ps-1 py-1 extra-small"
                  placeholder="Buscar evento o año..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoComplete="off"
                />
              </div>
            </div>
          </div>

          {/* GRID DE TARJETAS DE ÁLBUMES */}
          {cargando ? (
            <div className="text-center py-5">
              <div className="spinner-border text-danger" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : fotosFiltradas.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-camera fs-2 d-block mb-2"></i>
              No se encontraron fotografías para los criterios seleccionados.
            </div>
          ) : (
            <div className="row g-4">
              {fotosFiltradas.map((item) => {
                const fotos = obtenerFotosAlbum(item);
                const portadaObj = fotos.find((f) => f.es_portada) || fotos[0];
                const urlPortada = portadaObj ? portadaObj.url : "";
                const urlEnlaceCard = obtenerEnlaceExterno(item);

                return (
                  <div className="col-md-6 col-lg-3" key={item.id}>
                    <div
                      className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden bg-white hover-elevate d-flex flex-column"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleAbrirAlbum(item)}
                    >
                      <div
                        className="position-relative overflow-hidden bg-light"
                        style={{ height: "180px" }}
                      >
                        <img
                          src={urlPortada}
                          alt={item.titulo}
                          className="w-100 h-100"
                          style={{ objectFit: "cover" }}
                        />
                        <span className="badge bg-danger position-absolute top-0 end-0 m-2 extra-small rounded-pill">
                          {item.categoria_etiqueta || item.categoria}
                        </span>
                      </div>

                      <div className="card-body p-3 d-flex flex-column flex-grow-1">
                        <h6 className="fw-bold text-dark mb-1 fs-6 text-truncate">
                          {item.titulo}
                        </h6>
                        <small className="text-muted extra-small mb-2 d-block">
                          <i className="bi bi-calendar3 me-1"></i>
                          {item.fecha}
                        </small>
                        <p className="text-muted extra-small mb-2 flex-grow-1 line-clamp-2">
                          {item.descripcion}
                        </p>

                        {/* 🟢 BOTÓN DE ENLACE EXTERNO DIRECTO EN LA TARJETA */}
                        {urlEnlaceCard && (
                          <div className="pt-2 border-top mt-auto">
                            <a
                              href={urlEnlaceCard}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-xs btn-outline-danger rounded-pill px-3 py-1 extra-small fw-semibold d-inline-flex align-items-center gap-1 w-100 justify-content-center text-decoration-none"
                              onClick={(e) => e.stopPropagation()}
                              title="Ver fotos adicionales en enlace externo"
                            >
                              <i className="bi bi-box-arrow-up-right"></i> Ver
                              más fotos
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* MODAL LIGHTBOX CON NAVEGACIÓN, CARRUSEL AUTOMÁTICO Y BOTÓN DE ENLACE EXTERNO */}
      {fotoSeleccionada &&
        (() => {
          const fotosAlbum = obtenerFotosAlbum(fotoSeleccionada);
          const fotoActual = fotosAlbum[currentIndex] || fotosAlbum[0];

          // 🟢 EXTRAER Y VALIDAR LA URL EXTERNA PARA EL MODAL
          const urlEnlace = obtenerEnlaceExterno(fotoSeleccionada);

          return (
            <div
              className="modal fade show d-block"
              tabIndex="-1"
              style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
              onClick={() => setFotoSeleccionada(null)}
            >
              <div
                className="modal-dialog modal-dialog-centered modal-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-content rounded-4 border-0 shadow bg-dark text-white overflow-hidden">
                  <div className="modal-header border-0 pb-0 align-items-center">
                    <div>
                      <h6 className="modal-title fw-bold text-white mb-0">
                        {fotoSeleccionada.titulo}{" "}
                        <span className="text-muted fw-normal fs-7 ms-2">
                          ({currentIndex + 1} de {fotosAlbum.length})
                        </span>
                      </h6>
                      <span className="extra-small text-muted">
                        {fotoSeleccionada.fecha}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      onClick={() => setFotoSeleccionada(null)}
                    ></button>
                  </div>

                  <div
                    className="modal-body text-center p-3 position-relative d-flex align-items-center justify-content-center"
                    style={{ minHeight: "350px" }}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                  >
                    {/* Botón Anterior */}
                    {fotosAlbum.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-dark bg-opacity-75 text-white position-absolute start-0 ms-3 rounded-circle shadow border-0"
                        style={{ width: "40px", height: "40px", zIndex: 10 }}
                        onClick={handlePrev}
                        title="Foto anterior"
                      >
                        <i className="bi bi-chevron-left"></i>
                      </button>
                    )}

                    {fotoActual && (
                      <img
                        src={fotoActual.url}
                        alt={fotoSeleccionada.titulo}
                        className="img-fluid rounded-3 shadow"
                        style={{ maxHeight: "65vh", objectFit: "contain" }}
                      />
                    )}

                    {/* Botón Siguiente */}
                    {fotosAlbum.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-dark bg-opacity-75 text-white position-absolute end-0 me-3 rounded-circle shadow border-0"
                        style={{ width: "40px", height: "40px", zIndex: 10 }}
                        onClick={handleNext}
                        title="Siguiente foto"
                      >
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    )}
                  </div>

                  <div className="modal-footer border-0 pt-0 justify-content-between align-items-center extra-small text-muted">
                    <span className="badge bg-danger rounded-pill">
                      {fotoSeleccionada.categoria_etiqueta ||
                        fotoSeleccionada.categoria}
                    </span>
                    <p
                      className="text-light mb-0 text-truncate px-2"
                      style={{ maxWidth: "45%" }}
                    >
                      {fotoSeleccionada.descripcion}
                    </p>

                    <div className="d-flex align-items-center gap-2">
                      {/* 🟢 BOTÓN DESTACADO PARA ABRIR EL ENLACE CON MÁS FOTOS EN EL MODAL */}
                      {urlEnlace && (
                        <a
                          href={urlEnlace}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-danger rounded-pill px-3 fw-semibold text-decoration-none d-inline-flex align-items-center gap-1 extra-small shadow-sm"
                          onClick={(e) => e.stopPropagation()}
                          title="Abrir álbum completo o fotos adicionales"
                        >
                          <i className="bi bi-box-arrow-up-right"></i> Ver más
                          fotos
                        </a>
                      )}

                      <button
                        type="button"
                        className="btn btn-sm btn-outline-light rounded-pill px-4"
                        onClick={() => setFotoSeleccionada(null)}
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      {/* FOOTER CORPORATIVO */}
      <footer className="text-center py-4 text-muted border-top bg-white">
        <div className="container">
          <p className="mb-0 extra-small">
            &copy; 2026 Canon Group. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
