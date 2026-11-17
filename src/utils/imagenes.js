/**
 * Utilidad para resolver y formatear la URL de la imagen de un producto.
 * 
 * Regla de negocio (Clase 10):
 * - Si producto.imagen_url no existe o es null, retorna null.
 * - De lo contrario, retorna la URL concatenada con import.meta.env.VITE_API_URL.
 * 
 * @param {Object} producto - Objeto del producto
 * @returns {string|null} URL completa de la imagen o null si no existe
 */
export function urlImagen(producto) {
  if (!producto || !producto.imagen_url) {
    return null;
  }

  const rawUrl = String(producto.imagen_url).trim();
  if (!rawUrl) {
    return null;
  }

  // Si ya es una URL absoluta externa o data URI, se retorna tal cual
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://') || rawUrl.startsWith('data:')) {
    return rawUrl;
  }

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const cleanBase = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
  const cleanPath = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;

  return `${cleanBase}${cleanPath}`;
}

export default urlImagen;
