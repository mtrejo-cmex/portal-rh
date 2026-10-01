import React, { useState } from "react";
import { decodeHTMLEntities } from "../utils/formatters.js";
import PortalHeader from "./PortalHeader.jsx";

// ✅ COMPONENTE AUXILIAR PARA EL CARRUSEL CONTROLADO POR ESTADO
function CarouselFlyers({ urls }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? urls.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === urls.length - 1 ? 0 : prev + 1));
  };

  const url = urls[currentIndex];
  const esPdf = url.toLowerCase().endsWith(".pdf");
  const esDoc =
    url.toLowerCase().endsWith(".doc") || url.toLowerCase().endsWith(".docx");

  return (
    <div className="mb-4">
      <div
        className="card bg-dark rounded-3 overflow-hidden shadow-sm position-relative border-0"
        style={{ minHeight: "300px" }}
      >
        {/* Contenido del Slide Activo */}
        <div
          className="d-flex align-items-center justify-content-center h-100"
          style={{ minHeight: "300px", maxHeight: "350px" }}
        >
          {esPdf ? (
            <div className="d-flex flex-column align-items-center justify-content-center py-5 text-white h-100 bg-secondary bg-opacity-25 w-100">
              <i className="bi bi-file-earmark-pdf-fill display-4 text-danger mb-2"></i>
              <p className="fw-bold mb-2">
                Documento PDF Adjunto ({currentIndex + 1} de {urls.length})
              </p>
              <button
                type="button"
                className="btn btn-outline-light btn-sm rounded-pill px-3"
                onClick={() => window.open(url, "_blank")}
              >
                <i className="bi bi-box-arrow-up-right me-1"></i> Abrir PDF en
                ventana nueva
              </button>
            </div>
          ) : esDoc ? (
            <div className="d-flex flex-column align-items-center justify-content-center py-5 text-white h-100 bg-secondary bg-opacity-25 w-100">
              <i className="bi bi-file-earmark-word-fill display-4 text-primary mb-2"></i>
              <p className="fw-bold mb-2">
                Documento Word Adjunto ({currentIndex + 1} de {urls.length})
              </p>
              <button
                type="button"
                className="btn btn-outline-light btn-sm rounded-pill px-3"
                onClick={() => window.open(url, "_blank")}
              >
                <i className="bi bi-box-arrow-up-right me-1"></i> Abrir Word en
                ventana nueva
              </button>
            </div>
          ) : (
            <div
              className="d-flex align-items-center justify-content-center h-100 position-relative w-100"
              style={{ cursor: "pointer", minHeight: "300px" }}
              onClick={() => window.open(url, "_blank")}
              title="Haz clic para ver la imagen a tamaño completo"
            >
              <img
                src={url}
                alt={`Flyer ${currentIndex + 1}`}
                className="d-block w-100 h-100 object-fit-contain"
                style={{ maxHeight: "330px", backgroundColor: "#1a1a1a" }}
              />
              <div className="position-absolute bottom-0 end-0 m-2 badge bg-dark bg-opacity-75 text-white extra-small">
                <i className="bi bi-arrows-fullscreen me-1"></i> Clic para
                ampliar ({currentIndex + 1}/{urls.length})
              </div>
            </div>
          )}
        </div>

        {/* Botones de Navegación */}
        {urls.length > 1 && (
          <>
            <button
              type="button"
              className="btn btn-dark position-absolute top-50 start-0 translate-middle-y ms-2 rounded-circle p-2 d-flex align-items-center justify-content-center shadow"
              style={{
                width: "40px",
                height: "40px",
                opacity: 0.85,
                zIndex: 5,
              }}
              onClick={handlePrev}
              title="Anterior"
            >
              <i className="bi bi-chevron-left fs-5 text-white"></i>
            </button>
            <button
              type="button"
              className="btn btn-dark position-absolute top-50 end-0 translate-middle-y me-2 rounded-circle p-2 d-flex align-items-center justify-content-center shadow"
              style={{
                width: "40px",
                height: "40px",
                opacity: 0.85,
                zIndex: 5,
              }}
              onClick={handleNext}
              title="Siguiente"
            >
              <i className="bi bi-chevron-right fs-5 text-white"></i>
            </button>
          </>
        )}

        {/* Indicadores de Puntos */}
        {urls.length > 1 && (
          <div
            className="position-absolute bottom-0 start-50 translate-middle-x mb-2 d-flex gap-1"
            style={{ zIndex: 5 }}
          >
            {urls.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`rounded-circle border-0 ${
                  idx === currentIndex ? "bg-danger" : "bg-white bg-opacity-50"
                }`}
                style={{ width: "8px", height: "8px", padding: 0 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PortalConvenios({
  convenios = [],
  onVolver,
  usuario,
  onSwitchView,
  onLogout,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todas");
  const [convenioSeleccionado, setConvenioSeleccionado] = useState(null);

  // Categorías fijas de la empresa para mantener un orden preferente
  const ordenCategoriasBase = [
    "Entretenimiento y Cultura",
    "Educación",
    "Electrodomésticos",
    "Compras y Moda",
    "Viajes & Turismo",
    "Transporte",
    "Salud",
    "Deportes y Bienestar",
  ];

  // Helper para obtener el nombre de la categoría
  const getCategoriaNombre = (item) => {
    if (!item) return "General";
    return item.categoria_rel?.nombre || item.categoria || "General";
  };

  // Helper para obtener la URL de la imagen
  const getImageUrl = (item) => {
    if (!item) return null;
    const url = item.logo_url || item.imagen_url || item.imagen;
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return url.startsWith("/") ? url : `/${url}`;
  };

  // 🟢 1. Extraer lista dinámica de categorías para los botones de píldora
  const todasLasCategoriasPresentes = Array.from(
    new Set(convenios.map((c) => getCategoriaNombre(c))),
  );

  const listaCategoriasFiltro = [
    "Todas",
    ...ordenCategoriasBase.filter((cat) =>
      todasLasCategoriasPresentes.includes(cat),
    ),
    ...todasLasCategoriasPresentes.filter(
      (cat) => !ordenCategoriasBase.includes(cat),
    ),
  ];

  // 🟢 2. Filtrado combinado (por término de búsqueda Y categoría seleccionada)
  const conveniosFiltrados = convenios.filter((item) => {
    const catNombre = getCategoriaNombre(item);
    const coincideCategoria =
      categoriaFiltro === "Todas" ||
      catNombre.toLowerCase() === categoriaFiltro.toLowerCase();

    const term = searchTerm.toLowerCase();
    const empresa = item.empresa ? item.empresa.toLowerCase() : "";
    const titulo = item.titulo ? item.titulo.toLowerCase() : "";
    const desc = item.descripcion ? item.descripcion.toLowerCase() : "";

    const coincideBusqueda =
      empresa.includes(term) ||
      titulo.includes(term) ||
      desc.includes(term) ||
      catNombre.toLowerCase().includes(term);

    return coincideCategoria && coincideBusqueda;
  });

  // 3. Agrupar convenios filtrados por categoría
  const conveniosPorCategoria = conveniosFiltrados.reduce((acc, item) => {
    const cat = getCategoriaNombre(item);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  // 4. Ordenar las categorías a renderizar
  const categoriasEncontradas = Object.keys(conveniosPorCategoria);
  const categoriasOrdenadas = [
    ...ordenCategoriasBase.filter((cat) => categoriasEncontradas.includes(cat)),
    ...categoriasEncontradas.filter(
      (cat) => !ordenCategoriasBase.includes(cat),
    ),
  ];

  return (
    <div className="bg-light min-vh-100 pb-5">
      {/* NAVBAR / HEADER CORPORATIVO REUTILIZABLE */}
      <PortalHeader
        usuario={usuario}
        onSwitchView={onSwitchView}
        onLogout={onLogout}
      />

      {/* CONTENIDO PRINCIPAL ADAPTATIVO */}
      <main
        className="container-fluid px-3 px-md-4 px-lg-5 mb-5"
        style={{ maxWidth: "1600px", margin: "0 auto" }}
      >
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
                  Convenios Corporativos
                </li>
              </ol>
            </nav>

            <h2 className="fw-bold text-dark mb-1">Convenios</h2>
            <p className="text-muted small mb-0">
              Descubre los programas de descuento, promociones y alianzas
              exclusivas para colaboradores de Canon.
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
              <i className="bi bi-gift-fill me-1"></i> Beneficios Exclusivos
              CMEX
            </span>
          </div>
        </div>

        {/* BUSCADOR GENERAL Y FILTRO POR CATEGORÍAS */}
        <div className="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4">
          <div className="row mb-3">
            <div className="col-md-6 col-lg-5">
              <div className="input-group search-container rounded-pill border overflow-hidden shadow-sm">
                <span className="input-group-text bg-white border-0 text-muted ps-3">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-0 ps-1 py-2 extra-small"
                  placeholder="Buscar por empresa, beneficio o palabra clave..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoComplete="off"
                />
                {searchTerm && (
                  <button
                    className="btn btn-link text-muted pe-3 text-decoration-none"
                    type="button"
                    onClick={() => setSearchTerm("")}
                  >
                    <i className="bi bi-x-circle-fill"></i>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* BARRA DE FILTROS POR CATEGORÍA */}
          <div className="d-flex flex-wrap align-items-center gap-2 pt-3 border-top">
            <span className="extra-small text-muted fw-semibold me-1">
              <i className="bi bi-funnel-fill text-danger me-1"></i>Filtrar por
              categoría:
            </span>
            {listaCategoriasFiltro.map((cat) => {
              const isActive = categoriaFiltro === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  className={`btn btn-sm rounded-pill extra-small px-3 py-1 transition-all ${
                    isActive
                      ? "btn-danger fw-bold shadow-sm"
                      : "btn-outline-secondary text-dark border-light-subtle bg-light"
                  }`}
                  onClick={() => setCategoriaFiltro(cat)}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* LISTADO DE TARJETAS POR CATEGORÍA */}
        {categoriasOrdenadas.length === 0 ? (
          <div className="card border-0 shadow-sm rounded-4 bg-white p-5 text-center text-muted">
            <i className="bi bi-search fs-2 d-block mb-2"></i>
            No se encontraron convenios que coincidan con la búsqueda o filtro
            seleccionado.
          </div>
        ) : (
          <div className="d-flex flex-column gap-4">
            {categoriasOrdenadas.map((categoria) => {
              const itemsCategoria = conveniosPorCategoria[categoria];

              return (
                <div
                  key={categoria}
                  className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden p-4"
                >
                  <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-4">
                    <div className="d-flex align-items-center gap-2">
                      <div className="bg-danger-subtle text-danger p-2 rounded-3 d-flex align-items-center justify-content-center">
                        <i className="bi bi-tag-fill fs-5"></i>
                      </div>
                      <h4 className="fw-bold text-dark mb-0 fs-5">
                        {categoria}
                      </h4>
                    </div>
                    <span className="badge bg-light text-muted border rounded-pill px-3 py-2 extra-small fw-semibold">
                      {itemsCategoria.length}{" "}
                      {itemsCategoria.length === 1 ? "Convenio" : "Convenios"}
                    </span>
                  </div>

                  <div className="row g-4">
                    {itemsCategoria.map((item) => {
                      const imgPath = getImageUrl(item);

                      const descuentoLimpio = item.descuento
                        ? decodeHTMLEntities(item.descuento)
                            .replace(/&nbsp;/g, " ")
                            .trim()
                        : "";

                      const descLimpia = item.descripcion
                        ? decodeHTMLEntities(
                            item.descripcion.replace(/<[^>]*>/g, ""),
                          )
                            .replace(/&nbsp;/g, " ")
                            .trim()
                        : "";

                      return (
                        <div
                          className="col-sm-6 col-lg-4 col-xxl-3"
                          key={item.id || item.empresa}
                        >
                          <div
                            className="card h-100 border border-light-subtle shadow-sm rounded-4 overflow-hidden bg-white d-flex flex-column transition-all hover-elevate"
                            style={{ cursor: "pointer" }}
                            onClick={() => setConvenioSeleccionado(item)}
                          >
                            {imgPath && (
                              <div
                                className="bg-light border-bottom d-flex align-items-center justify-content-center p-3"
                                style={{ height: "130px" }}
                              >
                                <img
                                  src={imgPath}
                                  alt={item.empresa}
                                  className="img-fluid h-100"
                                  style={{ objectFit: "contain" }}
                                />
                              </div>
                            )}

                            <div className="p-3 d-flex flex-column flex-grow-1">
                              <div className="mb-2">
                                <h5 className="fw-bold text-dark mb-1 fs-6">
                                  {decodeHTMLEntities(
                                    item.titulo || item.empresa,
                                  )}
                                </h5>

                                {item.titulo &&
                                  item.titulo !== item.empresa && (
                                    <span className="text-muted extra-small d-block mb-2">
                                      {decodeHTMLEntities(item.empresa)}
                                    </span>
                                  )}

                                {descuentoLimpio && (
                                  <div className="mb-2">
                                    {descuentoLimpio.length <= 25 ? (
                                      <span
                                        className="badge bg-danger extra-small px-3 py-1.5 rounded-pill fw-bold"
                                        style={{ backgroundColor: "#CC0000" }}
                                      >
                                        {descuentoLimpio}
                                      </span>
                                    ) : (
                                      <div className="p-2 rounded-3 bg-danger-subtle text-danger border border-danger-subtle extra-small">
                                        <strong
                                          className="d-block mb-0.5 text-uppercase"
                                          style={{ fontSize: "0.7rem" }}
                                        >
                                          <i className="bi bi-tag-fill me-1"></i>{" "}
                                          Beneficio:
                                        </strong>
                                        <span className="text-dark fw-medium lh-sm d-block">
                                          {descuentoLimpio}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {descLimpia && (
                                  <p
                                    className="text-secondary extra-small mb-0 mt-2"
                                    style={{
                                      display: "-webkit-box",
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: "vertical",
                                      overflow: "hidden",
                                      lineHeight: "1.4",
                                    }}
                                  >
                                    {descLimpia}
                                  </p>
                                )}
                              </div>

                              <div className="pt-2 border-top mt-auto text-end">
                                <span className="text-danger extra-small fw-semibold">
                                  Ver detalle{" "}
                                  <i className="bi bi-arrow-right ms-1"></i>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* MODAL: VER DETALLES DEL CONVENIO */}
      {convenioSeleccionado && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <div>
                  <h5 className="modal-title fw-bold text-dark fs-5">
                    {decodeHTMLEntities(
                      convenioSeleccionado.titulo ||
                        convenioSeleccionado.empresa,
                    )}
                  </h5>
                  {convenioSeleccionado.titulo && (
                    <span className="text-muted small">
                      {decodeHTMLEntities(convenioSeleccionado.empresa)}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setConvenioSeleccionado(null)}
                ></button>
              </div>

              <div className="modal-body p-4">
                <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                  <span className="badge bg-danger-subtle text-danger extra-small px-3 py-2 rounded-pill">
                    {getCategoriaNombre(convenioSeleccionado)}
                  </span>
                  {convenioSeleccionado.descuento && (
                    <span
                      className="badge bg-danger extra-small px-3 py-2 rounded-pill text-wrap text-start"
                      style={{ maxWidth: "100%", lineHeight: "1.3" }}
                    >
                      {decodeHTMLEntities(
                        convenioSeleccionado.descuento,
                      ).replace(/&nbsp;/g, " ")}
                    </span>
                  )}
                </div>

                {convenioSeleccionado.archivos_adjuntos &&
                  (() => {
                    try {
                      const urls = JSON.parse(
                        convenioSeleccionado.archivos_adjuntos,
                      );
                      if (!Array.isArray(urls) || urls.length === 0)
                        return null;
                      return <CarouselFlyers urls={urls} />;
                    } catch (e) {
                      return null;
                    }
                  })()}

                <div
                  className="text-secondary small mb-3 lh-base"
                  style={{ wordBreak: "break-word" }}
                  dangerouslySetInnerHTML={{
                    __html: convenioSeleccionado.descripcion || "",
                  }}
                />

                <div className="bg-light p-3 rounded-3 mb-3 border">
                  <h6 className="fw-bold extra-small mb-1 text-dark">
                    <i className="bi bi-info-circle me-1 text-danger"></i>¿Cómo
                    hacer válido este beneficio?
                  </h6>
                  <p className="extra-small text-muted mb-0 lh-sm">
                    {convenioSeleccionado.condiciones
                      ? convenioSeleccionado.condiciones
                      : "Presenta tu credencial vigente de colaborador CMEX en sucursal o ingresa el código promocional."}
                  </p>
                </div>

                {convenioSeleccionado.contactos &&
                  convenioSeleccionado.contactos.length > 0 && (
                    <div className="mb-3">
                      <h6 className="fw-bold extra-small text-dark mb-2">
                        <i className="bi bi-people-fill text-danger me-1"></i>
                        Contactos de Atención Directa
                      </h6>
                      <div className="row g-2">
                        {convenioSeleccionado.contactos.map((c, idx) => (
                          <div key={idx} className="col-md-6">
                            <div className="p-2 bg-light rounded-3 border extra-small">
                              <div className="fw-bold text-dark">
                                {c.nombre}
                              </div>
                              {c.puesto && (
                                <div className="text-muted">{c.puesto}</div>
                              )}
                              {c.telefono && (
                                <div className="text-danger fw-semibold">
                                  <i className="bi bi-telephone-fill me-1"></i>
                                  {c.telefono}
                                </div>
                              )}
                              {c.email && (
                                <div className="text-muted">
                                  <i className="bi bi-envelope-fill me-1"></i>
                                  {c.email}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                <div className="row g-2 mb-3 extra-small text-muted border-top pt-3">
                  <div className="col-6">
                    <i className="bi bi-tag me-1 text-danger"></i>Código:{" "}
                    <strong className="text-dark">
                      {convenioSeleccionado.codigo_promocional || "N/A"}
                    </strong>
                  </div>
                  <div className="col-6">
                    <i className="bi bi-calendar-event me-1 text-danger"></i>
                    Vigencia:{" "}
                    <strong className="text-dark">
                      {convenioSeleccionado.vigencia
                        ? new Date(
                            convenioSeleccionado.vigencia,
                          ).toLocaleDateString("es-ES")
                        : "Permanente"}
                    </strong>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                  {convenioSeleccionado.sitio_web ? (
                    <a
                      href={convenioSeleccionado.sitio_web}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-danger btn-sm rounded-pill px-3 extra-small fw-semibold"
                    >
                      <i className="bi bi-box-arrow-up-right me-1"></i> Visitar
                      sitio web
                    </a>
                  ) : (
                    <div></div>
                  )}

                  <button
                    type="button"
                    className="btn btn-danger rounded-pill px-4 btn-sm fw-bold"
                    onClick={() => setConvenioSeleccionado(null)}
                  >
                    Entendido
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER CORPORATIVO */}
      <footer className="text-center py-4 text-muted border-top bg-white container-fluid">
        <div className="px-3">
          <p className="mb-0 extra-small">
            &copy; 2026 Canon Group. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
