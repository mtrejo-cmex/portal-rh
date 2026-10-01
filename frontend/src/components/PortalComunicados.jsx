import React from "react";
import { api } from "../services/api.js";
import { decodeHTMLEntities } from "../utils/formatters.js";

export default function PortalComunicados({
  comunicados = [],
  usuario,
  onReload,
}) {
  const handleLike = async (e, id) => {
    e.stopPropagation();

    if (!usuario?.email) {
      alert("Debes ingresar con tu usuario RH para reaccionar.");
      return;
    }

    try {
      await api.darLike(id, usuario);
      if (onReload) onReload();
    } catch (error) {
      console.error("Error al procesar Me Gusta:", error);
    }
  };

  const handleConfirmar = async (e, id) => {
    e.stopPropagation();

    if (!usuario?.email) {
      alert("Debes ingresar con tu usuario RH para confirmar la lectura.");
      return;
    }

    try {
      const res = await api.confirmarLectura(id, usuario);
      if (res.status === "already_confirmed") {
        alert(
          res.message ||
            "Ya has confirmado la lectura de este comunicado anteriormente.",
        );
      } else {
        alert("¡Gracias! Se ha registrado tu confirmación de lectura.");
        if (onReload) onReload();
      }
    } catch (error) {
      console.error("Error al confirmar lectura:", error);
    }
  };

  const obtenerUrlArchivo = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    const host =
      typeof window !== "undefined" ? window.location.hostname : "localhost";
    const puertoBackend = "8001";
    const rutaLimpia = url.startsWith("/") ? url : "/" + url;
    return `http://${host}:${puertoBackend}${rutaLimpia}`;
  };

  // 🟢 MEJORA: Extracción limpia de texto plano evitando residuos como &nbsp; o &nb...
  const limpiarTextoPlano = (texto, maxLen = 100) => {
    if (!texto) return "";

    let textoLimpio = String(texto);

    // 1. Barrido preventivo de entidades llanas y dobles comunes
    textoLimpio = textoLimpio
      .replace(/&amp;nbsp;/gi, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'");

    // 2. Extraer texto plano eliminando las etiquetas HTML
    if (typeof window !== "undefined") {
      try {
        const doc = new DOMParser().parseFromString(textoLimpio, "text/html");
        textoLimpio = doc.body.textContent || doc.body.innerText || "";
      } catch (e) {
        textoLimpio = textoLimpio.replace(/<[^>]*>/g, " ");
      }
    } else {
      textoLimpio = textoLimpio.replace(/<[^>]*>/g, " ");
    }

    // 3. Limpieza profunda: eliminar cualquier entidad HTML residual que haya sobrevivido (ej. &amp;nb, &nbsp;, etc.)
    textoLimpio = textoLimpio
      .replace(/&[a-zA-Z0-9#]+;?/g, " ") // Elimina cualquier código tipo &algo;
      .replace(/&[a-zA-Z0-9#]+/g, " "); // Elimina códigos rotos sin punto y coma

    // 4. Normalizar espacios múltiples y caracteres especiales de espacio
    textoLimpio = decodeHTMLEntities(textoLimpio)
      .replace(/[\u00A0\s]+/g, " ")
      .trim();

    // 5. Truncar de forma segura respetando el límite máximo
    if (maxLen && textoLimpio.length > maxLen) {
      return textoLimpio.substring(0, maxLen).trim() + "...";
    }

    return textoLimpio;
  };

  return (
    <div className="mb-5">
      {/* 🟢 BANNER ROJO PRINCIPAL */}
      <div
        className="rounded-4 p-4 p-md-5 mb-5 shadow-lg position-relative overflow-hidden"
        style={{
          backgroundColor: "#CC0000",
          backgroundImage: "linear-gradient(135deg, #CC0000 0%, #990000 100%)",
          color: "#FFFFFF",
        }}
      >
        {/* Decorativo circular de fondo */}
        <div
          className="position-absolute rounded-circle"
          style={{
            width: "400px",
            height: "400px",
            right: "-100px",
            bottom: "-150px",
            pointerEvents: "none",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
          }}
        ></div>

        <div className="position-relative z-1" style={{ maxWidth: "800px" }}>
          <span
            className="badge rounded-pill px-3 py-1 mb-3 extra-small shadow-sm d-inline-flex align-items-center gap-1"
            style={{
              backgroundColor: "#FFFFFF",
              color: "#CC0000",
              fontWeight: "bold",
            }}
          >
            <span
              className="d-inline-block rounded-circle"
              style={{
                width: "6px",
                height: "6px",
                backgroundColor: "#CC0000",
              }}
            ></span>
            PORTAL OFICIAL RH
          </span>

          <h1
            className="display-6 mb-3"
            style={{ color: "#FFFFFF", fontWeight: 900 }}
          >
            Bienvenido a Mi Portal RH
          </h1>

          <p
            className="fs-6 fw-normal lh-base mb-0"
            style={{ color: "#FFFFFF", opacity: 0.95, maxWidth: "750px" }}
          >
            El lugar donde encontrarás todo en un solo sitio. Mantente al día
            con los últimos eventos, comunicados y actualizaciones importantes
            de la empresa. No te pierdas ninguna información clave y accede
            fácilmente a todos los recursos que facilitan tu día a día en Canon
            Mexicana.
          </p>
        </div>
      </div>

      {/* 🟢 ENCABEZADO DE LA SECCIÓN DE COMUNICADOS */}
      <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom">
        <div>
          <h3 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <span
              className="d-inline-block rounded-square bg-danger"
              style={{
                width: "5px",
                height: "24px",
                backgroundColor: "#CC0000",
              }}
            ></span>
            Comunicados Recientes
          </h3>
          <p className="text-muted extra-small mb-0 ms-3">
            Listado general de avisos y comunicados.
          </p>
        </div>
      </div>

      {/* 🟢 TABLA DE COMUNICADOS */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-secondary extra-small text-uppercase">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3">Título</th>
                <th className="py-3">Categoría</th>
                <th className="py-3">Autor</th>
                <th className="py-3">Fecha</th>
                <th className="py-3 text-center">Likes</th>
                <th className="py-3 text-center">Confirmaciones</th>
                <th className="py-3 text-end px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {comunicados.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center text-muted py-5">
                    No hay comunicados disponibles.
                  </td>
                </tr>
              ) : (
                comunicados.map((item) => {
                  const urlDocumento = obtenerUrlArchivo(item.documento_url);
                  const resumenPlano = limpiarTextoPlano(
                    item.resumen || item.contenido || "",
                    90,
                  );

                  return (
                    <tr key={item.id}>
                      <td className="px-4 fw-bold text-muted small">
                        {item.id}
                      </td>
                      <td>
                        <div className="fw-bold text-dark">
                          {decodeHTMLEntities(item.titulo)}
                        </div>
                        {resumenPlano && (
                          <small
                            className="text-muted text-truncate d-block"
                            style={{ maxWidth: "280px" }}
                          >
                            {resumenPlano}
                          </small>
                        )}
                      </td>
                      <td>
                        <span className="badge bg-danger-subtle text-danger border border-danger-subtle extra-small rounded-pill px-3">
                          {item.categoria || "Aviso"}
                        </span>
                      </td>
                      <td className="small text-secondary">
                        {item.autor || "N/D"}
                      </td>
                      <td className="small text-muted">
                        {item.fecha_publicacion
                          ? new Date(item.fecha_publicacion).toLocaleDateString(
                              "es-ES",
                            )
                          : "-"}
                      </td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-sm btn-light rounded-pill px-2 extra-small fw-semibold text-danger"
                          onClick={(e) => handleLike(e, item.id)}
                          title="Dar Me Gusta"
                        >
                          <i className="bi bi-heart-fill me-1"></i>{" "}
                          {item.likes || 0}
                        </button>
                      </td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-success rounded-pill px-2 extra-small fw-semibold"
                          onClick={(e) => handleConfirmar(e, item.id)}
                          title="Confirmar Lectura"
                        >
                          <i className="bi bi-check2-circle me-1"></i>{" "}
                          {item.confirmaciones || 0}
                        </button>
                      </td>
                      <td className="text-end px-4">
                        <div className="d-flex justify-content-end align-items-center gap-2">
                          {/* Botón de Enlace Externo */}
                          {item.enlace_url && (
                            <a
                              href={
                                item.enlace_url.startsWith("http")
                                  ? item.enlace_url
                                  : `https://${item.enlace_url}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-danger rounded-pill extra-small fw-semibold px-3 shadow-sm"
                              style={{
                                backgroundColor: "#CC0000",
                                borderColor: "#CC0000",
                              }}
                              title="Ir al enlace"
                            >
                              <i className="bi bi-link-45deg me-1"></i> Web ↗
                            </a>
                          )}

                          {/* Botón de PDF */}
                          {item.documento_url ? (
                            <a
                              href={urlDocumento}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-danger rounded-pill extra-small fw-semibold px-3"
                              title="Ver documento PDF"
                            >
                              <i className="bi bi-file-earmark-pdf me-1"></i>{" "}
                              PDF ↗
                            </a>
                          ) : (
                            !item.enlace_url && (
                              <span className="text-muted extra-small">-</span>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
