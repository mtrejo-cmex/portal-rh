import React, { useState } from "react";

export default function PortalOrientaPAE({ onVolver }) {
  const urlLoginOrienta = "https://app.orienta.soy/cuenta/iniciar-sesion";

  // Lista de videos con textos explicativos completos
  const videosInformativos = [
    {
      id: 1,
      titulo: "Instructivo General Orienta-ME",
      subtitulo: "¿Qué es Orienta-ME?",
      archivo: "./ORIENTA-ME Instructivo.mp4",
      descripcionTextos: [
        "Orienta-ME es tu plataforma personalizada de PAE, creada para brindarte acceso fácil y directo a todos los servicios y beneficios diseñados para tu bienestar integral. Aquí encontrarás test interactivos, cápsulas de video, artículos, y webinars para apoyarte en cada área de tu vida.",
        "Consulta el calendario de eventos, regístrate en nuestras sesiones, y si te perdiste algún webinar, ¡puedes verlo de nuevo en el portal! También tendrás acceso a orientación en línea, apoyo nutricional personalizado, y asesoría de especialistas.",
        "Todo lo que necesitas para cuidar tu salud y mejorar tu productividad está al alcance de un clic. ¡Aprovéchalo!",
        "Disponible para familiares directos.",
      ],
    },
    {
      id: 2,
      titulo: "Instructivo de Registro Orienta-ME",
      subtitulo: "¿Cómo me registro?",
      archivo: "./OrientaME_Registro.mp4",
      pasosRegistro: [
        "Ingresa a www.orienta-me.com",
        "Dale clic al botón de “Regístrate aquí”",
        "Introduce los siguientes datos: Número de Empleado, Empresa o Institución (Servicios Orienta), Nombre completo, Teléfono, Correo Electrónico y Contraseña.",
        "Ingresa la opción de “Soy Empleado” o “Soy Familiar”.",
        "Selecciona la casilla de “No soy un robot” y acepta las Políticas de Privacidad.",
        "Selecciona “Regístrame”.",
        "Verifica tu cuenta y listo, ingresa con tu usuario y contraseña.",
      ],
      notaPie:
        "En caso de tener dudas o algún problema, ¡no olvides revisar el video de paso a paso! ó contáctanos, estamos para apoyarte.",
    },
  ];

  const [videoActivo, setVideoActivo] = useState(videosInformativos[0]);

  return (
    <div className="bg-light min-vh-100 pb-5">
      <main className="container pt-3 mb-5">
        {/* Breadcrumb, Título y Botón Volver */}
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
                  Orienta PAE
                </li>
              </ol>
            </nav>

            <h2 className="fw-bold text-dark mb-1">
              Programa de Asistencia al Empleado (PAE)
            </h2>
            <p className="text-muted small mb-0">
              Servicio profesional, gratuito y 100% confidencial para
              colaboradores de Canon Mexicana y sus familias.
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

            <a
              href={urlLoginOrienta}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-danger rounded-pill px-4 btn-sm fw-bold shadow-sm d-inline-flex align-items-center gap-2"
            >
              <i className="bi bi-box-arrow-up-right"></i> Acceder a Orienta PAE
            </a>
          </div>
        </div>

        {/* HERO BANNER DE BIENVENIDA ORIENTA PAE */}
        <div className="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4 border-start border-5 border-danger position-relative overflow-hidden">
          <div className="row align-items-center">
            <div className="col-lg-9">
              <span className="badge bg-danger-subtle text-danger px-3 py-1 rounded-pill extra-small fw-bold mb-2">
                <i className="bi bi-shield-heart me-1"></i> ¡Tu Bienestar es
                Nuestra Prioridad!
              </span>
              <h4 className="fw-bold text-dark mb-2">
                Asesoría y Apoyo en 6 Áreas Clave
              </h4>
              <p className="text-secondary small mb-2 lh-base">
                En Canon, te ofrecemos <strong>Orienta PAE</strong>, una
                herramienta diseñada para brindarte asesoría y apoyo en seis
                áreas clave. Ya sea que enfrentes desafíos personales,
                familiares o laborales, tendrás el respaldo que necesitas para
                tomar decisiones que mejoren tu calidad de vida.
              </p>
              <p className="fw-bold text-danger extra-small mb-0 italic">
                <i className="bi bi-quote me-1"></i>Cada experiencia es una
                oportunidad para crecer y avanzar.
              </p>
            </div>
            <div className="col-lg-3 text-center d-none d-lg-block">
              <i className="bi bi-person-hearts display-1 text-danger opacity-25"></i>
            </div>
          </div>
        </div>

        {/* TARJETAS DE LAS 6 SECCIONES OFICIALES ORIENTA */}
        <h5 className="fw-bold text-dark mb-3 fs-6">
          <i className="bi bi-grid-3x3-gap-fill text-danger me-2"></i>Secciones
          ORIENTA
        </h5>

        <div className="row g-3 mb-4">
          {/* 1. Emocional */}
          <div className="col-md-4">
            <div
              className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100"
              style={{ borderLeft: "5px solid #E04867" }}
            >
              <div className="d-flex align-items-center gap-3 mb-2">
                <div
                  className="p-2 rounded-3 fs-4 text-white d-flex align-items-center justify-content-center"
                  style={{
                    backgroundColor: "#E04867",
                    width: "42px",
                    height: "42px",
                  }}
                >
                  <i className="bi bi-heart-pulse-fill"></i>
                </div>
                <h6 className="fw-bold text-dark mb-0 fs-6">Emocional</h6>
              </div>
              <p className="text-muted extra-small mb-0">
                Apoyo psicológico, manejo del estrés, ansiedad, duelos,
                inteligencia emocional y consulta individual.
              </p>
            </div>
          </div>

          {/* 2. Médico */}
          <div className="col-md-4">
            <div
              className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100"
              style={{ borderLeft: "5px solid #12B2B3" }}
            >
              <div className="d-flex align-items-center gap-3 mb-2">
                <div
                  className="p-2 rounded-3 fs-4 text-white d-flex align-items-center justify-content-center"
                  style={{
                    backgroundColor: "#12B2B3",
                    width: "42px",
                    height: "42px",
                  }}
                >
                  <i className="bi bi-hospital"></i>
                </div>
                <h6 className="fw-bold text-dark mb-0 fs-6">Médico</h6>
              </div>
              <p className="text-muted extra-small mb-0">
                Orientación médica telefónica, seguimiento de síntomas, dudas
                sobre medicamentos y medicina preventiva.
              </p>
            </div>
          </div>

          {/* 3. Nutricional */}
          <div className="col-md-4">
            <div
              className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100"
              style={{ borderLeft: "5px solid #00A859" }}
            >
              <div className="d-flex align-items-center gap-3 mb-2">
                <div
                  className="p-2 rounded-3 fs-4 text-white d-flex align-items-center justify-content-center"
                  style={{
                    backgroundColor: "#00A859",
                    width: "42px",
                    height: "42px",
                  }}
                >
                  <i className="bi bi-apple"></i>
                </div>
                <h6 className="fw-bold text-dark mb-0 fs-6">Nutricional</h6>
              </div>
              <p className="text-muted extra-small mb-0">
                Planes de alimentación saludable, cálculo de hábitos
                alimenticios y asesoría nutricional adaptada.
              </p>
            </div>
          </div>

          {/* 4. Veterinaria */}
          <div className="col-md-4">
            <div
              className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100"
              style={{ borderLeft: "5px solid #8E7CC3" }}
            >
              <div className="d-flex align-items-center gap-3 mb-2">
                <div
                  className="p-2 rounded-3 fs-4 text-white d-flex align-items-center justify-content-center"
                  style={{
                    backgroundColor: "#8E7CC3",
                    width: "42px",
                    height: "42px",
                  }}
                >
                  <i className="bi bi-github"></i>
                </div>
                <h6 className="fw-bold text-dark mb-0 fs-6">Veterinaria</h6>
              </div>
              <p className="text-muted extra-small mb-0">
                Orientación veterinaria, cuidados preventivos, vacunación y
                bienestar integral para tus mascotas.
              </p>
            </div>
          </div>

          {/* 5. Economía Personal */}
          <div className="col-md-4">
            <div
              className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100"
              style={{ borderLeft: "5px solid #F1B51C" }}
            >
              <div className="d-flex align-items-center gap-3 mb-2">
                <div
                  className="p-2 rounded-3 fs-4 text-white d-flex align-items-center justify-content-center"
                  style={{
                    backgroundColor: "#F1B51C",
                    width: "42px",
                    height: "42px",
                  }}
                >
                  <i className="bi bi-piggy-bank-fill"></i>
                </div>
                <h6 className="fw-bold text-dark mb-0 fs-6">
                  Economía Personal
                </h6>
              </div>
              <p className="text-muted extra-small mb-0">
                Estructuración de presupuestos, manejo de deudas, estrategias de
                ahorro y educación financiera.
              </p>
            </div>
          </div>

          {/* 6. Legal */}
          <div className="col-md-4">
            <div
              className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100"
              style={{ borderLeft: "5px solid #004B72" }}
            >
              <div className="d-flex align-items-center gap-3 mb-2">
                <div
                  className="p-2 rounded-3 fs-4 text-white d-flex align-items-center justify-content-center"
                  style={{
                    backgroundColor: "#004B72",
                    width: "42px",
                    height: "42px",
                  }}
                >
                  <i className="bi bi-bank"></i>
                </div>
                <h6 className="fw-bold text-dark mb-0 fs-6">Legal</h6>
              </div>
              <p className="text-muted extra-small mb-0">
                Asesoría en derecho civil, familiar, patrimonial, mercantil,
                contratos y trámites legales del día a día.
              </p>
            </div>
          </div>
        </div>

        {/* REPRODUCTOR Y ATENCIÓN DIRECTA */}
        <div className="row g-4">
          {/* REPRODUCTOR MP4 DE VIDEOS */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 bg-white p-4 h-100">
              <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-play-circle-fill text-danger"></i> Centro de
                Videos Instructivos
              </h5>

              {/* Reproductor Nativo MP4 desde public/ */}
              <div className="rounded-3 overflow-hidden shadow-sm border mb-3 bg-black">
                <video
                  key={videoActivo.archivo}
                  controls
                  className="w-100 h-auto"
                  style={{ maxHeight: "420px", objectFit: "contain" }}
                >
                  <source src={videoActivo.archivo} type="video/mp4" />
                  Tu navegador no soporta el reproductor de video.
                </video>
              </div>

              {/* Título y Subtítulo */}
              <h6 className="fw-bold text-dark mb-1 fs-6">
                {videoActivo.titulo}
              </h6>
              <span className="badge bg-danger-subtle text-danger extra-small mb-3 d-inline-block">
                {videoActivo.subtitulo}
              </span>

              {/* Descripción para el Video Instructivo General */}
              {videoActivo.descripcionTextos && (
                <div className="text-secondary extra-small mb-4 lh-base">
                  {videoActivo.descripcionTextos.map((parrafo, idx) => (
                    <p
                      key={idx}
                      className={
                        idx === videoActivo.descripcionTextos.length - 1
                          ? "fw-bold text-dark mb-0"
                          : "mb-2"
                      }
                    >
                      {parrafo}
                    </p>
                  ))}
                </div>
              )}

              {/* Lista de Pasos para el Video de Registro */}
              {videoActivo.pasosRegistro && (
                <div className="text-secondary extra-small mb-4 lh-base">
                  <ol className="ps-3 mb-3">
                    {videoActivo.pasosRegistro.map((paso, idx) => (
                      <li key={idx} className="mb-1">
                        {paso}
                      </li>
                    ))}
                  </ol>
                  <p className="fw-bold text-dark mb-0 bg-light p-2 rounded border">
                    <i className="bi bi-info-circle-fill text-danger me-1"></i>
                    {videoActivo.notaPie}
                  </p>
                </div>
              )}

              {/* Selector entre los 2 videos */}
              <h6 className="fw-bold text-muted extra-small text-uppercase mb-2 pt-2 border-top">
                Selecciona un video:
              </h6>
              <div className="row g-2">
                {videosInformativos.map((vid) => (
                  <div key={vid.id} className="col-md-6">
                    <button
                      type="button"
                      className={`btn text-start w-100 p-3 rounded-3 border extra-small d-flex align-items-center gap-2 transition-all ${
                        videoActivo.id === vid.id
                          ? "btn-danger text-white"
                          : "btn-light text-dark"
                      }`}
                      onClick={() => setVideoActivo(vid)}
                    >
                      <i className="bi bi-file-earmark-play-fill fs-4"></i>
                      <div className="text-truncate">
                        <strong className="d-block">{vid.titulo}</strong>
                        <span
                          className={
                            videoActivo.id === vid.id
                              ? "text-white-50"
                              : "text-muted"
                          }
                        >
                          {vid.subtitulo}
                        </span>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: CANALES DE ATENCIÓN DIRECTA */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 bg-white p-4 h-100 d-flex flex-column justify-content-between">
              <div>
                <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                  <i className="bi bi-headset text-danger"></i> Contacto
                  Inmediato
                </h5>

                <div className="p-3 bg-danger-subtle rounded-3 border border-danger-subtle mb-3">
                  <p className="fw-bold text-danger extra-small mb-0">
                    <i className="bi bi-heart-fill me-1"></i> ¡Es un servicio
                    gratuito y confidencial para ti y para tu familia!
                  </p>
                </div>

                <p className="text-muted extra-small mb-3">
                  Llama sin costo a nuestras líneas de atención directa:
                </p>

                <div className="d-flex flex-column gap-3 mb-4">
                  {/* Línea Sin Costo 800 */}
                  <div className="p-3 bg-light rounded-3 border d-flex align-items-center gap-3">
                    <div
                      className="bg-danger text-white p-2 rounded-circle fs-4 d-flex align-items-center justify-content-center"
                      style={{ width: "45px", height: "45px" }}
                    >
                      <i className="bi bi-telephone-outbound-fill"></i>
                    </div>
                    <div>
                      <span className="fw-bold text-muted d-block extra-small text-uppercase">
                        Llama Sin Costo
                      </span>
                      <strong className="text-danger fs-5">800 999 2233</strong>
                    </div>
                  </div>

                  {/* Línea Directa (442) */}
                  <div className="p-3 bg-light rounded-3 border d-flex align-items-center gap-3">
                    <div
                      className="bg-dark text-white p-2 rounded-circle fs-4 d-flex align-items-center justify-content-center"
                      style={{ width: "45px", height: "45px" }}
                    >
                      <i className="bi bi-telephone-fill"></i>
                    </div>
                    <div>
                      <span className="fw-bold text-muted d-block extra-small text-uppercase">
                        Línea Directa
                      </span>
                      <strong className="text-dark fs-6">
                        (442) 295 30 01
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-top text-center">
                <span className="badge bg-secondary-subtle text-secondary extra-small rounded-pill w-100 py-2">
                  <i className="bi bi-lock-fill me-1"></i> Servicio 100%
                  Confidencial
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

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
