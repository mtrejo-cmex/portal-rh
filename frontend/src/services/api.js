const PORT = "8001";
const HOST =
  typeof window !== "undefined" ? window.location.hostname : "localhost";
const API_BASE_URL = `http://${HOST}:${PORT}/api`;

export const api = {
  async checkSession() {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        credentials: "include", // 👈 Lee la cookie en segundo plano
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (error) {
      return null;
    }
  },

  // ==========================================
  // --- MÉTODOS PÚBLICOS ---
  // ==========================================
  async getConvenios(categoria = "") {
    try {
      const url = categoria
        ? `${API_BASE_URL}/convenios?categoria=${encodeURIComponent(categoria)}`
        : `${API_BASE_URL}/convenios`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error("Error en getConvenios:", error);
      return [];
    }
  },

  async getComunicadosPublicos() {
    try {
      const res = await fetch(`${API_BASE_URL}/comunicados`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error("Error en getComunicadosPublicos:", error);
      return [];
    }
  },

  async darLike(id, usuario) {
    try {
      const res = await fetch(`${API_BASE_URL}/comunicados/${id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario_email: usuario?.email || usuario?.usuario_email || "",
          usuario_nombre: usuario?.nombre || usuario?.usuario_nombre || "",
          tipo_reaccion: "like",
        }),
      });

      if (!res.ok) {
        const errDetail = await res.json().catch(() => ({}));
        console.error("Detalle del error 422:", errDetail);
        throw new Error(`Error HTTP: ${res.status}`);
      }
      return await res.json();
    } catch (error) {
      console.error("Error en darLike:", error);
      return null;
    }
  },

  async confirmarLectura(id, usuario) {
    try {
      const res = await fetch(`${API_BASE_URL}/comunicados/${id}/confirmar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario_email: usuario?.email || usuario?.usuario_email || "",
          usuario_nombre: usuario?.nombre || usuario?.usuario_nombre || "",
          tipo_reaccion: "enterado",
        }),
      });

      if (!res.ok) {
        const errDetail = await res.json().catch(() => ({}));
        console.error("Detalle del error 422:", errDetail);
        throw new Error(`Error HTTP: ${res.status}`);
      }
      return await res.json();
    } catch (error) {
      console.error("Error en confirmarLectura:", error);
      return null;
    }
  },

  async getCategoriasConvenios() {
    try {
      const res = await fetch(`${API_BASE_URL}/convenios/categorias`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error("Error en getCategoriasConvenios:", error);
      return [];
    }
  },

  async getCalendario() {
    try {
      const res = await fetch(`${API_BASE_URL}/calendario`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error("Error en getCalendario:", error);
      return [];
    }
  },

  // 🟢 MÉTODOS PÚBLICOS DE FORMATOS
  async getFormatos() {
    try {
      const res = await fetch(`${API_BASE_URL}/formatos`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error("Error en getFormatos:", error);
      return [];
    }
  },

  // ==========================================
  // --- MÉTODOS ADMIN ---
  // ==========================================
  async getMetricas() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/metricas`, {
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error("Error en getMetricas:", error);
      return {};
    }
  },

  async getComunicadosAdmin() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/comunicados/todos`, {
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error("Error en getComunicadosAdmin:", error);
      return [];
    }
  },

  async guardarComunicado(payload, id = null) {
    try {
      const method = id ? "PUT" : "POST";
      const url = id
        ? `${API_BASE_URL}/admin/comunicados/${id}`
        : `${API_BASE_URL}/admin/comunicados`;

      let fechaLimpia = null;
      if (payload.fecha_publicacion) {
        if (
          typeof payload.fecha_publicacion === "string" &&
          payload.fecha_publicacion.trim() !== ""
        ) {
          fechaLimpia = payload.fecha_publicacion.trim();
        } else if (payload.fecha_publicacion instanceof Date) {
          fechaLimpia = payload.fecha_publicacion.toISOString();
        }
      }

      const bodyFinal = {
        titulo: payload.titulo,
        categoria: payload.categoria,
        resumen: payload.resumen || "",
        contenido: payload.contenido,
        autor: payload.autor || "Recursos Humanos",
        imagen_url: payload.imagen_url || null,
        documento_url: payload.documento_url || null,
        enlace_url: payload.enlace_url || null,
        fecha_publicacion: fechaLimpia,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(bodyFinal),
      });

      return res.ok;
    } catch (error) {
      console.error("Error en guardarComunicado:", error);
      return false;
    }
  },

  async cambiarEstadoComunicado(id, estado) {
    try {
      const res = await fetch(
        `${API_BASE_URL}/admin/comunicados/${id}/estado`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ estado }),
        },
      );
      return res.ok;
    } catch (error) {
      console.error("Error en cambiarEstadoComunicado:", error);
      return false;
    }
  },

  async eliminarComunicado(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/comunicados/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      return res.ok;
    } catch (error) {
      console.error("Error en eliminarComunicado:", error);
      return false;
    }
  },

  //Gestión de convenios
  async guardarCategoriaConvenio(payload, id = null) {
    try {
      const method = id ? "PUT" : "POST";
      const url = id
        ? `${API_BASE_URL}/admin/convenios/categorias/${id}`
        : `${API_BASE_URL}/admin/convenios/categorias`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      return res.ok;
    } catch (error) {
      console.error("Error en guardarCategoriaConvenio:", error);
      return false;
    }
  },

  async eliminarCategoriaConvenio(id) {
    try {
      const res = await fetch(
        `${API_BASE_URL}/admin/convenios/categorias/${id}`,
        { method: "DELETE", credentials: "include" },
      );
      return res.ok;
    } catch (error) {
      console.error("Error en eliminarCategoriaConvenio:", error);
      return false;
    }
  },

  async getConveniosAdmin() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/convenios/todos`, {
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error("Error en getConveniosAdmin:", error);
      return [];
    }
  },

  async guardarConvenio(payload, id = null) {
    try {
      const method = id ? "PUT" : "POST";
      const url = id
        ? `${API_BASE_URL}/admin/convenios/${id}`
        : `${API_BASE_URL}/admin/convenios`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      return res.ok;
    } catch (error) {
      console.error("Error en guardarConvenio:", error);
      return false;
    }
  },

  async eliminarConvenio(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/convenios/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      return res.ok;
    } catch (error) {
      console.error("Error en eliminarConvenio:", error);
      return false;
    }
  },

  async reactivarConvenio(id) {
    try {
      const res = await fetch(
        `${API_BASE_URL}/admin/convenios/${id}/reactivar`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );
      return res.ok;
    } catch (error) {
      console.error("Error en reactivarConvenio:", error);
      return false;
    }
  },

  // Gestión de la galeria
  async uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE_URL}/admin/upload`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || "Error al subir el archivo");
    }
    return res.json();
  },

  async getGaleria() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/galeria`, {
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error("Error en getGaleria:", error);
      return [];
    }
  },

  async guardarGaleria(payload, id = null) {
    try {
      const method = id ? "PUT" : "POST";
      const url = id
        ? `${API_BASE_URL}/admin/galeria/${id}`
        : `${API_BASE_URL}/admin/galeria`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      return res.ok;
    } catch (error) {
      console.error("Error en guardarGaleria:", error);
      return false;
    }
  },

  async eliminarGaleria(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/galeria/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      return res.ok;
    } catch (error) {
      console.error("Error en eliminarGaleria:", error);
      return false;
    }
  },

  // Gestion del calendario
  async guardarEventoCalendario(payload, id = null) {
    try {
      const method = id ? "PUT" : "POST";
      const url = id
        ? `${API_BASE_URL}/admin/calendario/${id}`
        : `${API_BASE_URL}/admin/calendario`;
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Error al guardar el evento");
      return await response.json();
    } catch (error) {
      console.error("Error en guardarEventoCalendario:", error);
      return null;
    }
  },

  async eliminarEventoCalendario(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/calendario/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      return response.ok;
    } catch (error) {
      console.error("Error en eliminarEventoCalendario:", error);
      return false;
    }
  },

  // MÉTODOS DE ADMINISTRACIÓN DE FORMATOS
  async getFormatosAdmin() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/formatos`, {
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error("Error en getFormatosAdmin:", error);
      return [];
    }
  },

  async guardarFormato(payload, id = null) {
    try {
      const method = id ? "PUT" : "POST";
      const url = id
        ? `${API_BASE_URL}/admin/formatos/${id}`
        : `${API_BASE_URL}/admin/formatos`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `Error al guardar el formato (${res.status})`,
        );
      }
      return await res.json();
    } catch (error) {
      console.error("Error en guardarFormato:", error);
      throw error;
    }
  },

  async crearFormato(payload) {
    return this.guardarFormato(payload, null);
  },

  async actualizarFormato(id, payload) {
    return this.guardarFormato(payload, id);
  },

  async eliminarFormato(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/formatos/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Error al eliminar el formato del servidor");
      }
      return await res.json();
    } catch (error) {
      console.error("Error en eliminarFormato:", error);
      throw error;
    }
  },

  async getReaccionesAdmin() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/comunicados/reacciones`, {
        credentials: "include", // 👈 Envía la cookie de sesión del Admin
      });
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error("Error en getReaccionesAdmin:", error);
      return [];
    }
  },

  // ==========================================
  // --- MÉTODOS DE AUTENTICACIÓN ---
  // ==========================================
  async loginColaborador(userId) {
    const res = await fetch(`${API_BASE_URL}/auth/colaborador`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Habilita la recepción y almacenamiento de cookies HttpOnly
      body: JSON.stringify({ user_id: userId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Error al validar el usuario");
    }
    const data = await res.json();
    return data.user || data;
  },

  async logout() {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include", // Envía la cookie para que el servidor la identifique y elimine
      });
    } catch (error) {
      console.error("Error al cerrar sesión en servidor:", error);
    }
  },

  async loginAdmin(userId, password) {
    const res = await fetch(`${API_BASE_URL}/auth/admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ user_id: userId, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Credenciales de administrador inválidas");
    }
    return res.json();
  },

  // Carga de calendario OrientaPAE
  async subirCalendarioPae(file) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE_URL}/admin/orienta-pae/upload`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || "Error al subir el calendario PAE");
    }
    return res.json();
  },

  // Subir la imagen de vista previa para Orienta PAE
  async subirImagenCalendarioPae(file) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE_URL}/admin/orienta-pae/upload-image`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.detail || "Error al subir la imagen del calendario PAE",
      );
    }
    return res.json();
  },

  // Obtener la configuración actual de Orienta PAE (PDF e Imagen)
  async getPaeConfig() {
    try {
      const res = await fetch(`${API_BASE_URL}/orienta-pae/config`);
      if (!res.ok) return null;
      return await res.json();
    } catch (error) {
      console.error("Error en getPaeConfig:", error);
      return null;
    }
  },

  // ==========================================
  // --- MÉTODOS DE CAJA DE AHORRO ---
  // ==========================================
  async getCajaAhorro() {
    try {
      const res = await fetch(`${API_BASE_URL}/caja-ahorro`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error("Error en getCajaAhorro:", error);
      return [];
    }
  },

  async getCajaAhorroAdmin() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/caja-ahorro/todos`, {
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error("Error en getCajaAhorroAdmin:", error);
      return [];
    }
  },

  async guardarCajaAhorro(payload, id) {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/caja-ahorro/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      return res.ok;
    } catch (error) {
      console.error("Error en guardarCajaAhorro:", error);
      return false;
    }
  },
};
