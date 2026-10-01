import React, { useEffect } from "react";

export default function ToastNotification({
  show,
  message,
  type = "success", // 'success', 'danger', 'info', 'warning'
  onClose,
}) {
  // 🟢 Autocierre después de 3.5 segundos
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  // Clases de color y iconos dinámicos según el tipo
  const configs = {
    success: { bg: "bg-success text-white", icon: "bi-check-circle-fill" },
    danger: {
      bg: "bg-danger text-white",
      icon: "bi-exclamation-triangle-fill",
    },
    info: { bg: "bg-dark text-white", icon: "bi-info-circle-fill" },
    warning: { bg: "bg-warning text-dark", icon: "bi-exclamation-circle-fill" },
  };

  const currentConfig = configs[type] || configs.success;

  return (
    <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1100 }}>
      <div
        className={`toast show align-items-center ${currentConfig.bg} border-0 shadow-lg rounded-3`}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div className="d-flex">
          <div className="toast-body d-flex align-items-center fw-semibold">
            <i className={`bi ${currentConfig.icon} me-2 fs-5`}></i>
            {message}
          </div>
          <button
            type="button"
            className={`btn-close me-2 m-auto ${type === "warning" ? "" : "btn-close-white"}`}
            onClick={onClose}
            aria-label="Close"
          ></button>
        </div>
      </div>
    </div>
  );
}
