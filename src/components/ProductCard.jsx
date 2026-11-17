import React from 'react';
import { useCarrito } from '../context/CarritoContext';
import { DEFAULT_PRODUCT_IMAGE } from '../services/api';
import { urlImagen } from '../utils/imagenes';

export function ProductCard({
  producto,
  nombre,
  precio_final,
  cuotas_cantidad,
  cuotas_valor,
  garantia_meses,
  stock,
  imagen,
  imagen_url,
  badge,
  onEliminar,
  onVerDetalle,
  isAdmin = false
}) {
  const { agregar } = useCarrito();

  const p = producto || {};

  const name = nombre ?? p.nombre ?? 'Prenda Compresión TITAN';
  const precioFinal = precio_final ?? p.precio_final ?? 0;
  const cuotasCantidad = cuotas_cantidad ?? p.cuotas_cantidad;
  const cuotasValor = cuotas_valor ?? p.cuotas_valor;
  const garantiaMeses = garantia_meses ?? p.garantia_meses;
  const stockUnidades = stock ?? p.stock;
  const idProducto = p.id || p._id || 1;

  // Resolución de imagen mediante la utilidad oficial urlImagen
  const imgUrl = urlImagen(p.imagen_url ? p : { ...p, imagen_url: imagen_url || imagen });

  // Badge deportivo derivado o personalizado
  const pId = parseInt(idProducto, 10) || 1;
  const defaultBadges = ['PRO-FIT', 'COMPRESSION 2.0', 'DRY-FIT', 'OFERTA -20%'];
  const activeBadge = badge || p.badge || defaultBadges[pId % defaultBadges.length];

  const getBadgeStyle = (b) => {
    if (b.includes('PRO-FIT')) return 'bg-[#00ff66]/15 text-[#00ff66] border-[#00ff66]/40 shadow-[0_0_12px_rgba(0,255,102,0.2)]';
    if (b.includes('COMPRESSION')) return 'bg-[#00e5ff]/15 text-[#00e5ff] border-[#00e5ff]/40 shadow-[0_0_12px_rgba(0,229,255,0.2)]';
    if (b.includes('DRY-FIT')) return 'bg-white/10 text-white border-white/30';
    return 'bg-[#ff3344]/15 text-[#ff3344] border-[#ff3344]/40 shadow-[0_0_12px_rgba(255,51,68,0.2)]';
  };

  const productoParaCarrito = producto || {
    id: idProducto,
    nombre: name,
    precio_final: precioFinal,
    stock: stockUnidades,
    imagen: imgUrl,
  };

  return (
    <div className="group relative card-athletic rounded-2xl p-4 sm:p-5 flex flex-col justify-between overflow-hidden">
      {/* Resplandor Neón Volt de fondo en hover */}
      <div className="absolute -top-24 -right-24 w-44 h-44 bg-[#00ff66]/10 rounded-full blur-3xl group-hover:bg-[#00ff66]/20 transition-all duration-700 pointer-events-none"></div>

      <div>
        {/* Contenedor de Imagen de producto con aspect-square para evitar saltos en la grilla */}
        <div
          onClick={() => onVerDetalle && onVerDetalle(p)}
          className={`relative w-full aspect-square rounded-xl overflow-hidden mb-4 bg-[#0d0f14] border border-white/10 group-hover:border-[#00ff66]/40 transition-colors flex items-center justify-center ${
            onVerDetalle ? 'cursor-pointer' : ''
          }`}
        >
          {imgUrl ? (
            <img
              src={imgUrl}
              alt={p.nombre || name}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          ) : (
            /* Marcador de posición (placeholder) con idéntico aspect-square y texto "Sin imagen" */
            <div className="w-full h-full aspect-square flex flex-col items-center justify-center bg-[#10131a] text-neutral-400 text-xs font-bold uppercase tracking-wider select-none border border-dashed border-white/10 p-4 text-center">
              <span className="text-3xl mb-1.5 opacity-50">🖼️</span>
              <span>Sin imagen</span>
            </div>
          )}

          {/* Badge de Tecnología Deportiva */}
          <span className={`absolute top-2.5 left-2.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border backdrop-blur-md ${getBadgeStyle(activeBadge)}`}>
            {activeBadge}
          </span>

          {/* Indicador de Stock */}
          {stockUnidades != null && (
            <span className="absolute top-2.5 right-2.5 bg-[#0a0b0e]/85 text-neutral-300 text-[11px] font-bold px-2 py-0.5 rounded-md border border-white/10 backdrop-blur-md">
              {stockUnidades > 0 ? `${stockUnidades} disponibles` : 'Agotado'}
            </span>
          )}

          {/* Sombra gradiente inferior en la imagen */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0e1015] to-transparent opacity-60 pointer-events-none"></div>
        </div>

        {/* Título de producto */}
        <h3
          onClick={() => onVerDetalle && onVerDetalle(p)}
          className={`font-display text-lg font-bold text-white group-hover:text-[#00ff66] transition-colors leading-snug line-clamp-2 mb-2 tracking-wide ${
            onVerDetalle ? 'cursor-pointer' : ''
          }`}
        >
          {name}
        </h3>

        {/* Precio Final destacado en Neón Volt */}
        <div className="flex items-baseline gap-1.5 mb-3">
          <span className="text-xs font-bold text-neutral-400">ARS</span>
          <span className="font-display text-2xl font-black text-white group-hover:text-[#00ff66] tracking-tight transition-colors">
            ${typeof precioFinal === 'number' ? precioFinal.toLocaleString('es-AR') : precioFinal}
          </span>
        </div>
      </div>

      <div>
        {/* Cuotas y Garantía Oficial */}
        <div className="border-t border-white/10 pt-3 space-y-1.5 text-xs text-neutral-400 mb-4">
          {cuotasCantidad != null && cuotasValor != null && (
            <div className="flex items-center gap-1.5 text-neutral-300 font-medium">
              <span className="text-[#00ff66]">💳</span>
              <span>
                <strong className="text-white font-bold">{cuotasCantidad}</strong> cuotas fijas de{' '}
                <strong className="text-[#00ff66] font-bold">
                  ${typeof cuotasValor === 'number' ? cuotasValor.toLocaleString('es-AR') : cuotasValor}
                </strong>
              </span>
            </div>
          )}
          {garantiaMeses != null && (
            <div className="flex items-center gap-1.5 text-neutral-400 text-[11px]">
              <span className="text-neutral-300">🛡️</span>
              <span>Garantía de rendimiento: <strong className="text-neutral-200">{garantiaMeses} meses</strong></span>
            </div>
          )}
        </div>

        {/* Botón Agregar al Carrito */}
        <button
          onClick={() => agregar(productoParaCarrito, 1)}
          className="w-full btn-volt py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer text-xs font-black tracking-wider transition-all"
        >
          <span>Añadir a la Bolsa</span>
          <span className="text-sm">⚡</span>
        </button>

        {/* Control exclusivo de Administrador */}
        {isAdmin && onEliminar && (
          <button
            onClick={() => onEliminar(idProducto)}
            className="mt-2 w-full bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-xs font-bold py-1.5 px-3 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>🗑️ Quitar del catálogo</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default ProductCard;