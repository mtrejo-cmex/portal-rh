import React from 'react';

export default function PortalNosotros({ onVolver }) {
  return (
    <div className="bg-light min-vh-100 pb-5">
      {/* ESTILOS CSS DE ANIMACIONES E INTERACCIONES */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeInUp 0.5s ease-out forwards;
        }

        .animate-delay-1 { animation-delay: 0.1s; opacity: 0; }
        .animate-delay-2 { animation-delay: 0.2s; opacity: 0; }
        .animate-delay-3 { animation-delay: 0.3s; opacity: 0; }
        .animate-delay-4 { animation-delay: 0.4s; opacity: 0; }

        .card-hover-effect {
          transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.28s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .card-hover-effect:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08) !important;
        }

        .kanji-badge {
          transition: transform 0.25s ease, background-color 0.25s ease;
        }

        .card-hover-effect:hover .kanji-badge {
          transform: scale(1.05);
        }
      `}</style>

      <main className="container pt-4 mb-5">
        {/* BREADCRUMB & BOTÓN VOLVER */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 animate-fade-in">
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
                <li className="breadcrumb-item active text-muted" aria-current="page">
                  Nosotros
                </li>
              </ol>
            </nav>
            <h2 className="fw-bold text-dark mb-1">Nosotros</h2>
            <p className="text-muted small mb-0">
              Conoce la historia, filosofía y principios que guían a Canon Mexicana.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-light btn-sm rounded-pill px-3 fw-semibold text-dark border shadow-sm align-self-start align-self-md-auto card-hover-effect"
            onClick={onVolver}
          >
            <i className="bi bi-arrow-left text-danger me-1"></i> Volver al Portal
          </button>
        </div>

        {/* HERO BANNER CORPORATIVO */}
        <div className="card border-0 shadow-sm rounded-4 bg-white p-4 p-md-5 mb-4 border-start border-5 border-danger position-relative overflow-hidden animate-fade-in animate-delay-1 card-hover-effect">
          <div className="row align-items-center">
            <div className="col-lg-9">
              <span className="badge bg-danger text-white px-3 py-1 rounded-pill extra-small fw-bold mb-3">
                <i className="bi bi-building-check me-1"></i> Canon Mexicana
              </span>
              <h3 className="fw-bold text-dark mb-3 display-6">¿Quiénes somos?</h3>
              <p className="text-secondary mb-0 lh-lg" style={{ fontSize: '0.95rem' }}>
                Somos una empresa global que ofrece una amplia gama de soluciones de imágenes digitales, diseñadas para capturar, almacenar y distribuir información e imágenes con precisión y eficiencia. Nuestras soluciones están dirigidas tanto a usuarios finales como a corporativos, brindando tecnología avanzada que impulsa la productividad y la innovación en diversos sectores.
              </p>
            </div>
            <div className="col-lg-3 text-center d-none d-lg-block">
              <i className="bi bi-globe2 display-1 text-danger opacity-25"></i>
            </div>
          </div>
        </div>

        {/* SECCIÓN FILOSOFÍA KYOSEI & MISIÓN */}
        <div className="row g-4 mb-4">
          {/* FILOSOFÍA KYOSEI */}
          <div className="col-lg-7 animate-fade-in animate-delay-2">
            <div className="card border-0 shadow-sm rounded-4 bg-white p-4 p-md-5 h-100 border-top border-4 border-danger card-hover-effect">
              <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-danger text-white p-2 rounded-3 fs-5 d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px' }}>
                    <i className="bi bi-people-fill"></i>
                  </div>
                  <div>
                    <h5 className="fw-bold text-dark mb-0">Filosofía Kyosei</h5>
                    <span className="text-muted extra-small">Cultura y Armonía Global</span>
                  </div>
                </div>
                
                {/* Badge con Kanji */}
                <span className="badge bg-dark text-white fs-5 px-3 py-2 rounded-3 shadow-sm d-flex align-items-center gap-2 kanji-badge">
                  <span className="text-danger fw-bold fs-4" style={{ fontFamily: '"Noto Serif JP", serif' }}>共生</span>
                  <small className="fs-6 opacity-75 fw-normal">(Kyōsei)</small>
                </span>
              </div>

              <div className="p-3 bg-light rounded-3 border-start border-4 border-danger mb-4">
                <p className="fw-bold text-danger small mb-0 fst-italic lh-base">
                  “Todas las personas, sin distinción de raza, religión o cultura, viviendo y trabajando juntas en armonía en pos del futuro”.
                </p>
              </div>

              <p className="text-secondary small mb-3 lh-base">
                Esta convicción es la base de todo lo que hacemos. La filosofía Kyosei nos dice que cada uno de nosotros debe tratar de hacer su mejor esfuerzo pero a la vez ser conscientes y responsables de nuestras acciones y las consecuencias que tienen para otras personas, grupos y para todo el planeta.
              </p>
              <p className="text-secondary small mb-0 lh-base">
                De acuerdo con la filosofía Kyosei, la manera en que desarrollamos nuevas creaciones es tan importante como las creaciones mismas. Ponemos énfasis en la comunicación, la equidad, el respeto mutuo y la integridad.
              </p>
            </div>
          </div>

          {/* MISIÓN */}
          <div className="col-lg-5 animate-fade-in animate-delay-2">
            <div className="card border-0 shadow-sm rounded-4 bg-white p-4 p-md-5 h-100 border-top border-4 border-dark card-hover-effect">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="bg-dark text-white p-2 rounded-3 fs-5 d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px' }}>
                  <i className="bi bi-lightbulb-fill"></i>
                </div>
                <div>
                  <h5 className="fw-bold text-dark mb-0">Misión</h5>
                  <span className="text-muted extra-small">Innovación y Tecnología Óptica</span>
                </div>
              </div>

              <p className="text-secondary small mb-3 lh-base">
                Canon contribuye al mundo trabajando incansablemente para mejorar permanentemente el <strong className="text-dark">artscience</strong> del procesamiento digital de imágenes.
              </p>
              <p className="text-secondary small mb-4 lh-base">
                Invertimos miles de millones en investigación y desarrollo, obteniendo miles de patentes para brindar la mejor tecnología óptica.
              </p>

              <div className="p-3 bg-light rounded-3 border mt-auto border-start border-3 border-dark">
                <span className="fw-bold text-dark d-block extra-small mb-1">
                  <i className="bi bi-check-circle-fill text-danger me-1"></i> ¿El resultado?
                </span>
                <p className="text-muted extra-small mb-0 lh-sm">
                  Diseñamos nuestros productos pensando en personas reales para aprovechar la tecnología en su máxima expresión.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ESPÍRITU SAN-JI */}
        <div className="card border-0 shadow-sm rounded-4 bg-white p-4 p-md-5 mb-4 animate-fade-in animate-delay-3 card-hover-effect">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4 pb-3 border-bottom">
            <div>
              <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <i className="bi bi-compass-fill text-danger"></i> Espíritu San-Ji
              </h5>
              <p className="text-muted extra-small mb-0 mt-1">
                Los tres principios rectores del comportamiento y la autogestión en Canon.
              </p>
            </div>
            
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-dark text-white fs-6 px-3 py-2 rounded-3 kanji-badge" style={{ fontFamily: '"Noto Serif JP", serif' }}>
                三自の精神
              </span>
              <span className="badge bg-danger text-white extra-small rounded-pill px-3 py-2 fw-bold">
                Justicia, Honestidad y Ética
              </span>
            </div>
          </div>

          <p className="text-secondary small mb-4">
            Nuestro compromiso bajo el Espíritu San-ji implica cumplir y actuar de acuerdo con las leyes y reglamentos correspondientes, comportándonos de manera justa, honesta y ética.
          </p>

          <div className="row g-3">
            {/* 1. Ji-hatsu */}
            <div className="col-md-4">
              <div className="p-4 rounded-4 bg-light border h-100 border-top border-4 border-danger shadow-sm card-hover-effect">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="badge bg-danger rounded-pill px-3 py-1">1. Motivarse</span>
                  <span className="fs-3 fw-bold text-dark kanji-badge" style={{ fontFamily: '"Noto Serif JP", serif' }}>
                    自発
                  </span>
                </div>
                <h6 className="fw-bold text-dark mb-2">Ji-hatsu</h6>
                <p className="text-muted extra-small mb-0 lh-base">
                  Tome la iniciativa y sea proactivo en cada una de sus actividades diarias.
                </p>
              </div>
            </div>

            {/* 2. Ji-chi */}
            <div className="col-md-4">
              <div className="p-4 rounded-4 bg-light border h-100 border-top border-4 border-dark shadow-sm card-hover-effect">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="badge bg-dark rounded-pill px-3 py-1">2. Autogestionarse</span>
                  <span className="fs-3 fw-bold text-dark kanji-badge" style={{ fontFamily: '"Noto Serif JP", serif' }}>
                    自治
                  </span>
                </div>
                <h6 className="fw-bold text-dark mb-2">Ji-chi</h6>
                <p className="text-muted extra-small mb-0 lh-base">
                  Conducirse de manera responsable en todas sus acciones y decisiones profesionales.
                </p>
              </div>
            </div>

            {/* 3. Ji-kaku */}
            <div className="col-md-4">
              <div className="p-4 rounded-4 bg-light border h-100 border-top border-4 border-danger shadow-sm card-hover-effect">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="badge bg-danger rounded-pill px-3 py-1">3. Concientizarse</span>
                  <span className="fs-3 fw-bold text-dark kanji-badge" style={{ fontFamily: '"Noto Serif JP", serif' }}>
                    自覚
                  </span>
                </div>
                <h6 className="fw-bold text-dark mb-2">Ji-kaku</h6>
                <p className="text-muted extra-small mb-0 lh-base">
                  Comprenda la situación actual y reconozca claramente su papel dentro de ella.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* NUESTROS PRODUCTOS */}
        <div className="card border-0 shadow-sm rounded-4 bg-white p-4 p-md-5 mb-4 animate-fade-in animate-delay-4 card-hover-effect">
          <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
            <i className="bi bi-printer-fill text-danger"></i> Nuestros Productos
          </h5>
          <p className="text-secondary small mb-0 lh-lg">
            Canon ofrece una amplia gama de productos diseñados para satisfacer diversas necesidades tecnológicas y profesionales. Desde copiadoras, calculadoras, impresoras, escáneres, periféricos, sistemas micrográficos y multifuncionales, hasta impresoras de producción de alta velocidad y sistemas de impresión de formato amplio para documentación técnica y gráficos a color. Además, contamos con equipos especializados en el sector <strong className="text-dark">Healthcare</strong>, como soluciones oftalmológicas y radiológicas, así como equipos de fotografía, video y proyectores, que garantizan calidad y precisión en cada uso.
          </p>
        </div>

        {/* NUESTRAS OFICINAS */}
        <h5 className="fw-bold text-dark mb-3 fs-6 animate-fade-in animate-delay-4">
          <i className="bi bi-geo-alt-fill text-danger me-2"></i>Nuestras Oficinas
        </h5>

        <div className="row g-3 animate-fade-in animate-delay-4">
          {/* Corporativo */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 border-top border-4 border-danger card-hover-effect">
              <div className="d-flex align-items-center gap-2 mb-3">
                <i className="bi bi-building fs-4 text-danger"></i>
                <h6 className="fw-bold text-dark mb-0">Canon Mexicana (Corporativo)</h6>
              </div>
              <p className="text-muted extra-small mb-3 lh-sm">
                Blvd. Manuel Ávila Camacho No. 138, Piso 17<br />
                Col. Lomas de Chapultepec, C.P. 11000<br />
                Miguel Hidalgo, CDMX
              </p>
              <div className="pt-2 border-top extra-small text-secondary">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <i className="bi bi-telephone-fill text-danger"></i>
                  <span>Corporativo: <strong>55 5249 4900</strong></span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-headset text-danger"></i>
                  <span>Centro de Servicio: <strong>55 5249 4905</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Canon Academy */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 border-top border-4 border-dark card-hover-effect">
              <div className="d-flex align-items-center gap-2 mb-3">
                <i className="bi bi-mortarboard-fill fs-4 text-dark"></i>
                <h6 className="fw-bold text-dark mb-0">Canon Academy</h6>
              </div>
              <p className="text-muted extra-small mb-3 lh-sm">
                Blvd. Manuel Ávila Camacho No. 138, Piso 15<br />
                Col. Lomas de Chapultepec, C.P. 11000<br />
                Miguel Hidalgo, CDMX
              </p>
              <div className="pt-2 border-top extra-small text-secondary">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-telephone-fill text-dark"></i>
                  <span>Teléfono: <strong>55 4172 0080</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Almacén */}
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 border-top border-4 border-danger card-hover-effect">
              <div className="d-flex align-items-center gap-2 mb-3">
                <i className="bi bi-box-seam-fill fs-4 text-danger"></i>
                <h6 className="fw-bold text-dark mb-0">Almacén</h6>
              </div>
              <p className="text-muted extra-small mb-0 lh-sm">
                Carretera Tepotzotlán - La Aurora KM. 1,<br />
                Parque Industrial O´Donnell.<br />
                Fraccionamiento Ex Hacienda San Miguel<br />
                Cuautitlán Izcalli, Edo. De México. C.P. 54715.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-4 text-muted border-top bg-white">
        <div className="container">
          <p className="mb-0 extra-small">&copy; 2026 Canon Group. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}