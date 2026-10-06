import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCarrito } from '../context/CarritoContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { items } = useCarrito();
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();

  const cantidadTotal = items.reduce((acc, item) => acc + item.cantidad, 0);

  const isActive = (path) => {
    if (path === '/' && (location.pathname === '/' || location.pathname === '/catalogo')) return true;
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 bg-[#120726]/90 backdrop-blur-lg border-b border-amber-500/30 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* LOGO TIENDA */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-purple-900 p-0.5 shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-[#120726] rounded-[10px] flex items-center justify-center text-xl">
              👑
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-serif-gold text-2xl font-black text-gold-gradient tracking-wide">
              AURA GOLD
            </span>
            <span className="text-[10px] uppercase tracking-widest text-purple-300 font-semibold -mt-1">
              Luxury Collection
            </span>
          </div>
        </Link>

        {/* 3 APARTADOS PRINCIPALES DE NAVEGACIÓN */}
        <nav className="flex items-center gap-1 sm:gap-2 bg-purple-950/70 p-1.5 rounded-2xl border border-amber-500/20">
          
          {/* APARTADO 1: CATÁLOGO DE PRODUCTOS */}
          <Link
            to="/"
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-1.5 ${
              isActive('/')
                ? 'btn-gold shadow-md'
                : 'text-purple-200 hover:text-amber-300 hover:bg-purple-900/50'
            }`}
          >
            <span>🛍️</span>
            <span>Catálogo</span>
          </Link>

          {/* APARTADO 2: AUTENTICACIÓN DE USUARIO (CLIENTE) */}
          <Link
            to="/autenticacion"
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-1.5 ${
              isActive('/autenticacion')
                ? 'btn-gold shadow-md'
                : 'text-purple-200 hover:text-amber-300 hover:bg-purple-900/50'
            }`}
          >
            <span>👤</span>
            <span>Acceso Cliente</span>
          </Link>

          {/* APARTADO 3: ACCESO ADMINISTRADOR */}
          <Link
            to="/admin"
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-1.5 ${
              isActive('/admin')
                ? 'bg-gradient-to-r from-purple-800 to-amber-600 text-amber-100 border border-amber-400/50 shadow-lg shadow-purple-900/50'
                : 'text-amber-300/90 hover:text-amber-200 hover:bg-purple-900/50 border border-amber-500/30'
            }`}
          >
            <span>🛡️</span>
            <span>Acceso Admin</span>
            {isAdmin && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            )}
          </Link>
        </nav>

        {/* SECCIÓN SECUNDARIA: CARRITO, MIS COMPRAS, USUARIO */}
        <div className="flex items-center gap-3">
          {/* CARRITO DE COMPRAS */}
          <Link
            to="/carrito"
            className="relative p-2 sm:px-3 sm:py-2 rounded-xl border border-amber-500/30 bg-purple-900/40 text-amber-300 hover:border-amber-400 hover:bg-purple-800/50 transition-all flex items-center gap-2 text-xs font-semibold"
          >
            <span className="text-base">🛒</span>
            <span className="hidden sm:inline">Carrito</span>
            {cantidadTotal > 0 && (
              <span className="bg-gradient-to-r from-amber-400 to-amber-600 text-purple-950 font-black text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-md">
                {cantidadTotal}
              </span>
            )}
          </Link>

          {/* MENU USUARIO LOGUEADO */}
          {user ? (
            <div className="flex items-center gap-2 bg-purple-950/80 border border-amber-500/30 p-1.5 rounded-xl text-xs">
              <Link to="/mis-datos" className="text-purple-200 hover:text-amber-300 font-semibold px-2">
                {user.nombre || user.email?.split('@')[0]}
              </Link>
              <Link to="/mis-pedidos" className="text-purple-300 hover:text-amber-300 font-medium px-1" title="Mis Compras">
                📦
              </Link>
              <button
                onClick={logout}
                className="bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-500/30 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                title="Cerrar Sesión"
              >
                Cerrar
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
