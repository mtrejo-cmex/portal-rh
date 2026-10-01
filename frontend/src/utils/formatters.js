export const decodeHTMLEntities = (text) => {
  if (!text) return '';
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/html');
  // Devuelve el HTML decodificado conservando las etiquetas (<p>, <br>, etc.)
  return doc.body.innerHTML || '';
};

// Helper opcional si necesitas extraer SOLO texto plano sin tags en tablas compactas
export const stripHTML = (htmlText) => {
  if (!htmlText) return '';
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, 'text/html');
  return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
};
