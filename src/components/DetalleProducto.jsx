import React from 'react';
import { useCarrito } from '../context/CarritoContext';
import { urlImagen } from '../utils/imagenes';

/**
 * Vista de Detalle de Producto según las especificaciones de la Clase 10:
 * - Muestra la imagen usando urlImagen(producto) dentro de un contenedor con `aspect-square`.
 * - Usa la clase `object-cover` en el tag `<img>`, añade `loading="lazy"` y `alt={producto.nombre}`.
 * - Si la imagen es null, renderiza un contenedor marcador de posición (placeholder)
 *   con el texto "Sin imagen" manteniendo las mismas dimensiones (`aspect-square`).
 */
export function DetalleProducto({ producto, onClose }) {
  const { agregar } = useCarrito();

  if (!producto) return null;

  const imgUrl = urlImagen(producto);
  const nombre = producto.nombre || 'Prenda TITAN COMPRESSION';
  const precio = producto.precio_final || 0;
  const stock = producto.stock;
  const cuotas = producto.cuotas_cantidad || 3;
  const cuotasValor = producto.cuotas_valor || Math.round(precio / cuotas);
  const garantia = producto.garantia_meses || 12;

  const handleAgregar = () => {
    agregar(
      {
        id: producto.id || producto._id,
        nombre,
        precio_final: precio,
        stock,
        imagen_url: producto.imagen_url,
        imagen: imgUrl,
      },
      1
    );
  };

  return (
    <div className="card-athletic rounded-3xl p-6 sm:p-8 max-w-3xl w-full border border-white/10 shadow-2xl space-y-6">
      {/* Encabezado con botón de cerrar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-black tracking-widest text-[#00ff66] uppercase">
            Ficha Técnica Oficial
          </span>
          <h2 className="font-display text-2xl font-black text-white uppercase tracking-tight">
            {nombre}
          </h2>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-sm font-bold"
            title="Cerrar vista de detalle"
          >
            ✕
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Contenedor de Imagen de la vista de detalle con aspect-square */}
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#0d0f14] border border-white/10 flex items-center justify-center shadow-xl">
          {imgUrl ? (
            <img
              src={imgUrl}
              alt={nombre}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          ) : (
            /* Marcador de posición (placeholder) con idéntico aspect-square y texto "Sin imagen" */
            <div className="w-full h-full aspect-square flex flex-col items-center justify-center bg-[#10131a] text-neutral-400 text-sm font-bold uppercase tracking-wider select-none border border-dashed border-white/10 p-6 text-center">
              <span className="text-4xl mb-2 opacity-50">🖼️</span>
              <span>Sin imagen</span>
            </div>
          )}
        </div>

        {/* Información Técnica y Acciones */}
        <div className="space-y-4">
          <div>
            <span className="text-xs text-neutral-400 uppercase font-bold tracking-wider">Precio Final</span>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-bold text-neutral-400">ARS</span>
              <span className="font-display text-3xl font-black text-[#00ff66]">
                ${typeof precio === 'number' ? precio.toLocaleString('es-AR') : precio}
              </span>
            </div>
          </div>

          <div className="space-y-2 border-y border-white/10 py-4 text-xs">
            <div className="flex items-center justify-between text-neutral-300">
              <span className="text-neutral-400">Financiación:</span>
              <span className="font-bold text-white">
                {cuotas} cuotas de ${typeof cuotasValor === 'number' ? cuotasValor.toLocaleString('es-AR') : cuotasValor}
              </span>
            </div>
            <div className="flex items-center justify-between text-neutral-300">
              <span className="text-neutral-400">Garantía oficial:</span>
              <span className="font-bold text-white">{garantia} meses</span>
            </div>
            <div className="flex items-center justify-between text-neutral-300">
              <span className="text-neutral-400">Disponibilidad:</span>
              <span className={`font-bold ${stock > 0 ? 'text-[#00ff66]' : 'text-rose-400'}`}>
                {stock > 0 ? `${stock} unidades en stock` : 'Agotado'}
              </span>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={handleAgregar}
              disabled={stock === 0}
              className="w-full btn-volt py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer text-xs font-black uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-[#00ff66]/15"
            >
              <span>{stock === 0 ? 'Sin Stock' : 'Añadir a la Bolsa'}</span>
              <span className="text-base">⚡</span>
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl border border-white/10 hover:bg-white/5 text-neutral-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Volver a la Colección
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DetalleProductoModal({ producto, isOpen, onClose }) {
  if (!isOpen || !producto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <DetalleProducto producto={producto} onClose={onClose} />
    </div>
  );
}

export default DetalleProducto;
