import React, { useState, useEffect } from "react";
import AdminLayout from "./components/AdminLayout.jsx";
import MetricCards from "./components/MetricCards.jsx";
import ComunicadosSection from "./components/ComunicadosSection.jsx";
import ConveniosSection from "./components/ConveniosSection.jsx";
import GaleriaSection from "./components/GaleriaSection.jsx";
import CategoriasConveniosSection from "./components/CategoriasConveniosSection.jsx";
import CalendarioAdminSection from "./components/CalendarioAdminSection.jsx";
import FormatosAdminSection from "./components/FormatosAdminSection.jsx";
import CajaAhorroAdminSection from "./components/CajaAhorroAdminSection.jsx";
import PortalHeader from "./components/PortalHeader.jsx";
import PortalPublic from "./components/PortalPublic.jsx";
import PortalConvenios from "./components/PortalConvenios.jsx";
import PortalCalendario from "./components/PortalCalendario.jsx";
import PortalGaleria from "./components/PortalGaleria.jsx";
import PortalFormatos from "./components/PortalFormatos.jsx";
import PortalCajaAhorro from "./components/PortalCajaAhorro.jsx";
import PortalGastosMedicos from "./components/PortalGastosMedicos.jsx";
import LoginColaborador from "./components/LoginColaborador.jsx";
import LoginAdmin from "./components/LoginAdmin.jsx";
import ReporteReaccionesSection from "./components/ReporteReaccionesSection.jsx";
import { api } from "./services/api.js";

export default function App() {
  const [usuario, setUsuario] = useState(() => {
    const savedUser = localStorage.getItem("usuario_cmex");
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      localStorage.removeItem("usuario_cmex");
      return null;
    }
  });

  // ESTADO PARA LA SESIÓN DE ADMINISTRACIÓN
  const [adminUsuario, setAdminUsuario] = useState(() => {
    const savedAdmin = localStorage.getItem("admin_cmex");
    try {
      return savedAdmin ? JSON.parse(savedAdmin) : null;
    } catch (e) {
      localStorage.removeItem("admin_cmex");
      return null;
    }
  });

  const [vista, setVista] = useState(() => {
    const isAdminRoute =
      window.location.pathname.startsWith("/admin") ||
      window.location.search.includes("mode=admin");

    if (isAdminRoute) return "admin";
    return sessionStorage.getItem("cmex_current_vista") || "portal";
  });

  const [metricas, setMetricas] = useState({});
  const [comunicadosAdmin, setComunicadosAdmin] = useState([]);
  const [comunicadosPublicos, setComunicadosPublicos] = useState([]);
  const [convenios, setConvenios] = useState([]);
  const [galeria, setGaleria] = useState([]);
  const [categoriasConvenios, setCategoriasConvenios] = useState([]);
  const [calendario, setCalendario] = useState([]);
  const [formatos, setFormatos] = useState([]);
  const [cajaAhorroAdmin, setCajaAhorroAdmin] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    sessionStorage.setItem("cmex_current_vista", vista);
  }, [vista]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [
        dataMetricas,
        dataComunicadosAdmin,
        dataComunicadosPublicos,
        dataConvenios,
        dataGaleria,
        dataCategoriasConvenios,
        dataCalendario,
        dataFormatos,
        dataCajaAhorro,
      ] = await Promise.all([
        api.getMetricas().catch(() => ({})),
        api.getComunicadosAdmin().catch(() => []),
        api.getComunicadosPublicos().catch(() => []),
        api.getConvenios().catch(() => []),
        api.getGaleria().catch(() => []),
        api.getCategoriasConvenios().catch(() => []),
        api.getCalendario().catch(() => []),
        api.getFormatos().catch(() => []),
        api.getCajaAhorroAdmin().catch(() => []),
      ]);

      setMetricas(dataMetricas || {});
      setComunicadosAdmin(
        Array.isArray(dataComunicadosAdmin) ? dataComunicadosAdmin : [],
      );
      setComunicadosPublicos(
        Array.isArray(dataComunicadosPublicos) ? dataComunicadosPublicos : [],
      );
      setConvenios(Array.isArray(dataConvenios) ? dataConvenios : []);
      setGaleria(Array.isArray(dataGaleria) ? dataGaleria : []);
      setCategoriasConvenios(
        Array.isArray(dataCategoriasConvenios) ? dataCategoriasConvenios : [],
      );
      setCalendario(Array.isArray(dataCalendario) ? dataCalendario : []);
      setFormatos(Array.isArray(dataFormatos) ? dataFormatos : []);
      setCajaAhorroAdmin(Array.isArray(dataCajaAhorro) ? dataCajaAhorro : []);
    } catch (error) {
      console.error("Error cargando datos de la API:", error);
    } finally {
      setCargando(false);
    }
  };

  // CORRECCIÓN CLAVE: Se ejecuta al autenticarse el colaborador O al autenticarse el Admin
  useEffect(() => {
    if (usuario) {
      cargarDatos();
    }
  }, [usuario, adminUsuario]); // 👈 Escucha cambios en adminUsuario

  // 1. Si no hay usuario autenticado, muestra el login corporativo
  if (!usuario) {
    return (
      <LoginColaborador
        onLoginSuccess={(userData) => {
          localStorage.setItem("usuario_cmex", JSON.stringify(userData));
          setUsuario(userData);
        }}
      />
    );
  }

  // 2. Si está cargando datos iniciales, muestra indicador visual
  if (cargando && !comunicadosPublicos.length && !convenios.length) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Cargando portal...</span>
        </div>
      </div>
    );
  }

  // VALIDACIÓN DE ACCESO EXCLUSIVO PARA J02025
  const esJ02025 = usuario?.user_id?.toUpperCase() === "J02025";

  // Función reutilizable de cierre de sesión
  const handleLogout = () => {
    localStorage.removeItem("usuario_cmex");
    localStorage.removeItem("admin_cmex");
    setUsuario(null);
    setAdminUsuario(null);
    setVista("portal");
  };

  const handleSwitchView = () => {
    if (esJ02025) {
      setVista("admin");
    }
  };

  // 3. Vistas del panel de administración
  if (vista === "admin") {
    if (!esJ02025) {
      setTimeout(() => setVista("portal"), 0);
      return null;
    }

    if (!adminUsuario) {
      return (
        <LoginAdmin
          onAdminLoginSuccess={(adminData) => {
            localStorage.setItem("admin_cmex", JSON.stringify(adminData));
            setAdminUsuario(adminData); // 👈 Al actualizarse, el useEffect invocará cargarDatos()
          }}
        />
      );
    }

    return (
      <AdminLayout
        onVolverPortal={() => setVista("portal")}
        metricas={<MetricCards metricas={metricas} />}
        comunicados={
          <ComunicadosSection
            comunicados={comunicadosAdmin}
            onReload={cargarDatos}
          />
        }
        convenios={
          <>
            <CategoriasConveniosSection
              categorias={categoriasConvenios}
              onReload={cargarDatos}
            />
            <ConveniosSection
              convenios={convenios}
              categorias={categoriasConvenios}
              onReload={cargarDatos}
            />
          </>
        }
        galeria={<GaleriaSection galeria={galeria} onReload={cargarDatos} />}
        calendario={
          <CalendarioAdminSection eventos={calendario} onReload={cargarDatos} />
        }
        formatos={
          <FormatosAdminSection formatos={formatos} onReload={cargarDatos} />
        }
        cajaAhorro={
          <CajaAhorroAdminSection
            documentos={cajaAhorroAdmin}
            onReload={cargarDatos}
          />
        }
        reacciones={<ReporteReaccionesSection />}
      />
    );
  }

  if (vista === "convenios") {
    return (
      <PortalConvenios
        convenios={convenios}
        categorias={categoriasConvenios}
        onVolver={() => setVista("portal")}
        usuario={usuario}
        onSwitchView={handleSwitchView}
        onLogout={handleLogout}
      />
    );
  }

  if (vista === "calendario") {
    return (
      <PortalCalendario
        eventos={calendario}
        onVolver={() => setVista("portal")}
        usuario={usuario}
        onSwitchView={handleSwitchView}
        onLogout={handleLogout}
      />
    );
  }

  if (vista === "galeria") {
    return (
      <PortalGaleria
        galeria={galeria}
        onVolver={() => setVista("portal")}
        usuario={usuario}
        onSwitchView={handleSwitchView}
        onLogout={handleLogout}
      />
    );
  }

  if (vista === "formatos") {
    return (
      <PortalFormatos
        formatos={formatos}
        onVolver={() => setVista("portal")}
        usuario={usuario}
        onSwitchView={handleSwitchView}
        onLogout={handleLogout}
      />
    );
  }

  if (vista === "caja-ahorro") {
    return (
      <PortalCajaAhorro
        onVolver={() => setVista("portal")}
        usuario={usuario}
        onSwitchView={handleSwitchView}
        onLogout={handleLogout}
      />
    );
  }

  if (vista === "gastos-medicos") {
    return (
      <PortalGastosMedicos
        gastosMedicos={formatos}
        usuario={usuario}
        onVolver={() => setVista("portal")}
        onSwitchView={handleSwitchView}
        onLogout={handleLogout}
      />
    );
  }

  // 4. Vista principal del portal público para el colaborador
  return (
    <div className="bg-light min-vh-100">
      <PortalHeader
        onSwitchView={handleSwitchView}
        usuario={usuario}
        onLogout={handleLogout}
      />
      <PortalPublic
        comunicados={comunicadosPublicos}
        usuario={usuario}
        onReload={cargarDatos}
        onOpenConvenios={() => setVista("convenios")}
        onOpenCalendario={() => setVista("calendario")}
        onOpenGaleria={() => setVista("galeria")}
        onOpenFormatos={() => setVista("formatos")}
        onOpenCajaAhorro={() => setVista("caja-ahorro")}
        onOpenGastosMedicos={() => setVista("gastos-medicos")}
      />
      <footer className="text-center pb-3">
        <div className="container">
          <p className="mb-0 text-muted extra-small">
            &copy; 2026 Canon Group. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
