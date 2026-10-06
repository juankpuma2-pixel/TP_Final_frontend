import React, { useState } from 'react';
import { useCarrito } from '../context/CarritoContext';
import { DEFAULT_PRODUCT_IMAGE } from '../services/api';

export function ProductCard({
  producto,
  nombre,
  precio_final,
  cuotas_cantidad,
  cuotas_valor,
  garantia_meses,
  stock,
  imagen,
  onEliminar,
  isAdmin = false
}) {
  const { agregar } = useCarrito();

  const p = producto || {};

  const name = nombre ?? p.nombre ?? 'Producto Aura';
  const precioFinal = precio_final ?? p.precio_final ?? 0;
  const cuotasCantidad = cuotas_cantidad ?? p.cuotas_cantidad;
  const cuotasValor = cuotas_valor ?? p.cuotas_valor;
  const garantiaMeses = garantia_meses ?? p.garantia_meses;
  const stockUnidades = stock ?? p.stock;
  const rawImagen = imagen || p.imagen || p.image || p.foto;

  // Manejo de imagen con placeholder dorado/morado por defecto si no hay URL o si falla
  const [imgSrc, setImgSrc] = useState(rawImagen && rawImagen.trim() !== '' ? rawImagen : DEFAULT_PRODUCT_IMAGE);
  const [imgError, setImgError] = useState(false);

  const handleImageError = () => {
    if (!imgError) {
      setImgError(true);
      setImgSrc(DEFAULT_PRODUCT_IMAGE);
    }
  };

  const productoParaCarrito = producto || {
    id: p.id || Date.now(),
    nombre: name,
    precio_final: precioFinal,
    stock: stockUnidades,
    imagen: imgSrc,
  };

  const idProducto = p.id || p._id;

  return (
    <div className="group relative bg-purple-card border border-amber-500/20 rounded-2xl p-5 shadow-xl hover:shadow-2xl hover:border-amber-500/50 transition-all duration-300 flex flex-col justify-between overflow-hidden backdrop-blur-md">
      {/* Resplandor decorativo dorado de fondo en hover */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all duration-500 pointer-events-none"></div>

      <div>
        {/* Contenedor de Imagen de producto */}
        <div className="relative w-full h-52 rounded-xl overflow-hidden mb-4 bg-purple-950/80 border border-purple-800/40 group-hover:border-amber-500/30 transition-colors">
          <img
            src={imgSrc}
            alt={name}
            onError={handleImageError}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {stockUnidades != null && (
            <span className="absolute top-2 right-2 bg-purple-950/90 text-amber-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-500/30 backdrop-blur-md">
              Stock: {stockUnidades} u.
            </span>
          )}
        </div>

        {/* Título de producto */}
        <h3 className="text-xl font-bold text-amber-100 mb-2 line-clamp-1 group-hover:text-amber-300 transition-colors">
          {name}
        </h3>

        {/* Precio Final destacado en Dorado */}
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-xs font-semibold text-amber-400">ARS</span>
          <span className="text-2xl font-extrabold text-gold-gradient tracking-tight">
            ${typeof precioFinal === 'number' ? precioFinal.toLocaleString('es-AR') : precioFinal}
          </span>
        </div>
      </div>

      <div>
        {/* Detalles de cuotas, garantía y stock */}
        <div className="border-t border-purple-800/50 pt-3 space-y-2 text-xs text-purple-200/80 mb-4">
          {cuotasCantidad != null && cuotasValor != null && (
            <div className="flex items-center gap-1.5 text-amber-200/90 font-medium">
              <span className="text-amber-400">💳</span>
              <span>
                <strong className="text-amber-300 font-bold">{cuotasCantidad}</strong> cuotas de{' '}
                <strong className="text-amber-300 font-bold">
                  ${typeof cuotasValor === 'number' ? cuotasValor.toLocaleString('es-AR') : cuotasValor}
                </strong>
              </span>
            </div>
          )}
          {garantiaMeses != null && (
            <div className="flex items-center gap-1.5 text-purple-300">
              <span className="text-amber-400">🛡️</span>
              <span>Garantía oficial: <strong className="text-purple-100">{garantiaMeses} meses</strong></span>
            </div>
          )}
        </div>

        {/* Acciones: Botón Agregar al Carrito */}
        <button
          onClick={() => agregar(productoParaCarrito, 1)}
          className="w-full btn-gold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer text-sm tracking-wide font-bold"
        >
          <span>Agregar al carrito</span>
          <span className="text-base">🛍️</span>
        </button>

        {/* Control exclusivo de Administrador: Quitar / Eliminar Producto */}
        {isAdmin && onEliminar && (
          <button
            onClick={() => onEliminar(idProducto)}
            className="mt-2 w-full bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-200 text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>🗑️ Eliminar del catálogo (Admin)</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default ProductCard;