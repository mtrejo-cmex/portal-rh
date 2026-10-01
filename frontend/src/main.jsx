import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// 1. Frameworks base y Librerías (PRIMERO para que no pisen tus reglas)
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css';

// 2. Estilos personalizados del Portal RH (AL FINAL para tener máxima prioridad)
import './Styles/styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
