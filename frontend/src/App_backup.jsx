import React, { useState, useEffect } from 'react';
import AdminLayout from './components/AdminLayout.jsx';
import MetricCards from './components/MetricCards.jsx';
import ComunicadosSection from './components/ComunicadosSection.jsx';
import ConveniosSection from './components/ConveniosSection.jsx';
import GaleriaSection from './components/GaleriaSection.jsx';
import CategoriasConveniosSection from './components/CategoriasConveniosSection.jsx';
import CalendarioAdminSection from './components/CalendarioAdminSection.jsx';
import PortalHeader from './components/PortalHeader.jsx';
import PortalPublic from './components/PortalPublic.jsx';
import PortalConvenios from './components/PortalConvenios.jsx';
import PortalCalendario from './components/PortalCalendario.jsx';
import PortalGaleria from './components/PortalGaleria.jsx';
import LoginColaborador from './components/LoginColaborador.jsx';
import { api } from './services/api.js';

export default function App() {
  const [usuario, setUsuario] = useState(() => {
    const savedUser = localStorage.getItem('usuario_cmex');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      localStorage.removeItem('usuario_cmex');
      return null;
    }
  });

  const [vista, setVista] = useState(() => {
    const isAdminRoute =
      window.location.pathname.startsWith('/admin') ||
      window.location.search.includes('mode=admin');

    if (isAdminRoute) return 'admin';
    return sessionStorage.getItem('cmex_current_vista') || 'portal';
  });

  const [metricas, setMetricas] = useState({});
  const [comunicadosAdmin, setComunicadosAdmin] = useState([]);
  const [comunicadosPublicos, setComunicadosPublicos] = useState([]);
  const [convenios, setConvenios] = useState([]);
  const [galeria, setGaleria] = useState([]);
  const [categoriasConvenios, setCategoriasConvenios] = useState([]);
  const [calendario, setCalendario] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    sessionStorage.setItem('cmex_current_vista', vista);
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
      ] = await Promise.all([
        api.getMetricas().catch(() => ({})),
        api.getComunicadosAdmin().catch(() => []),
        api.getComunicadosPublicos().catch(() => []),
        api.getConvenios().catch(() => []),
        api.getGaleria().catch(() => []),
        api.getCategoriasConvenios().catch(() => []),
        api.getCalendario().catch(() => []),
      ]);

      setMetricas(dataMetricas || {});
      setComunicadosAdmin(
        Array.isArray(dataComunicadosAdmin) ? dataComunicadosAdmin : []
      );
      setComunicadosPublicos(
        Array.isArray(dataComunicadosPublicos) ? dataComunicadosPublicos : []
      );
      setConvenios(Array.isArray(dataConvenios) ? dataConvenios : []);
      setGaleria(Array.isArray(dataGaleria) ? dataGaleria : []);
      setCategoriasConvenios(
        Array.isArray(dataCategoriasConvenios) ? dataCategoriasConvenios : []
      );
      setCalendario(Array.isArray(dataCalendario) ? dataCalendario : []);
    } catch (error) {
      console.error('Error cargando datos de la API:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (usuario) {
      cargarDatos();
    }
  }, [usuario]);

  // 1. Si no hay usuario autenticado, muestra el login corporativo
  if (!usuario) {
    return (
      <LoginColaborador
        onLoginSuccess={(userData) => {
          setUsuario(userData);
        }}
      />
    );
  }

  // 2. Si está cargando datos iniciales, muestra indicador visual fluido
  if (cargando && !comunicadosPublicos.length && !convenios.length) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Cargando portal...</span>
        </div>
      </div>
    );
  }

  // Verificar si el usuario actual es el administrador designado
  const esAdmin = usuario?.user_id?.toUpperCase() === 'J02025';

  // 3. Vistas del panel de administración (Restringido a J02025)
  if (vista === 'admin') {
    // Si NO es el admin J02025, redirige al portal público automáticamente
    if (!esAdmin) {
      setVista('portal');
      return null;
    }

    return (
      <AdminLayout
        onVolverPortal={() => setVista('portal')}
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
      />
    );
  }

  if (vista === 'convenios') {
    return (
      <PortalConvenios
        convenios={convenios}
        categorias={categoriasConvenios}
        onVolver={() => setVista('portal')}
      />
    );
  }

  if (vista === 'calendario') {
    return (
      <PortalCalendario
        eventos={calendario}
        onVolver={() => setVista('portal')}
      />
    );
  }

  if (vista === 'galeria') {
    return (
      <PortalGaleria galeria={galeria} onVolver={() => setVista('portal')} />
    );
  }

  // 4. Vista principal del portal público para el colaborador
  return (
    <div className="bg-light min-vh-100">
      <PortalHeader
        onSwitchView={() => {
          // Abrir el panel de administración en una pestaña nueva
          const adminUrl = `${window.location.origin}${window.location.pathname}?mode=admin`;
          window.open(adminUrl, '_blank');
        }}
        usuario={usuario}
        onLogout={() => {
          localStorage.removeItem('usuario_cmex');
          setUsuario(null);
          setVista('portal');
        }}
      />
      <PortalPublic
        comunicados={comunicadosPublicos}
        onReload={cargarDatos}
        onOpenConvenios={() => setVista('convenios')}
        onOpenCalendario={() => setVista('calendario')}
        onOpenGaleria={() => setVista('galeria')}
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