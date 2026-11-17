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
    <header className="sticky top-0 z-50 bg-[#0c0e12]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* LOGO DE MARCA DEPORTIVA */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00ff66] via-[#00e5ff] to-neutral-800 p-[1.5px] shadow-lg shadow-[#00ff66]/20 group-hover:shadow-[#00ff66]/40 transition-shadow">
            <div className="w-full h-full bg-[#0a0c0f] rounded-[10px] flex items-center justify-center text-xl text-[#00ff66] group-hover:scale-110 transition-transform">
              ⚡
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xl sm:text-2xl font-black text-gradient-volt tracking-wider leading-none">
              TITAN COMPRESSION
            </span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-bold mt-1">
              High Performance Wear
            </span>
          </div>
        </Link>

        {/* 3 APARTADOS PRINCIPALES DE NAVEGACIÓN */}
        <nav className="flex items-center gap-1 sm:gap-2 bg-[#14171d] p-1.5 rounded-2xl border border-white/10">
          
          {/* APARTADO 1: CATÁLOGO DE PRODUCTOS */}
          <Link
            to="/"
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all duration-200 flex items-center gap-1.5 ${
              isActive('/')
                ? 'btn-volt shadow-lg shadow-[#00ff66]/20'
                : 'text-neutral-300 hover:text-[#00ff66] hover:bg-white/5'
            }`}
          >
            <span>⚡</span>
            <span>Colección</span>
          </Link>

          {/* APARTADO 2: AUTENTICACIÓN DE USUARIO (CLIENTE) */}
          <Link
            to="/autenticacion"
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all duration-200 flex items-center gap-1.5 ${
              isActive('/autenticacion')
                ? 'btn-volt shadow-lg shadow-[#00ff66]/20'
                : 'text-neutral-300 hover:text-[#00ff66] hover:bg-white/5'
            }`}
          >
            <span>👤</span>
            <span>Acceso Atleta</span>
          </Link>

          {/* APARTADO 3: ACCESO ADMINISTRADOR */}
          <Link
            to="/admin"
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all duration-200 flex items-center gap-1.5 ${
              isActive('/admin')
                ? 'bg-gradient-to-r from-neutral-800 to-[#1b231c] text-[#00ff66] border border-[#00ff66]/50 shadow-lg shadow-[#00ff66]/10'
                : 'text-neutral-300 hover:text-[#00ff66] hover:bg-white/5 border border-transparent'
            }`}
          >
            <span>🛡️</span>
            <span>Panel Admin</span>
            {isAdmin && (
              <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-pulse shadow-[0_0_8px_#00ff66]"></span>
            )}
          </Link>
        </nav>

        {/* SECCIÓN SECUNDARIA: CARRITO, MIS PEDIDOS, PERFIL */}
        <div className="flex items-center gap-3">
          {/* BOTÓN CARRITO CON CONTADOR NEÓN */}
          <Link
            to="/carrito"
            className="relative p-2 sm:px-4 sm:py-2 rounded-xl border border-white/10 bg-[#14171e] text-white hover:border-[#00ff66]/50 hover:bg-[#1a1f28] transition-all flex items-center gap-2.5 text-xs font-bold"
          >
            <span className="text-base">🛍️</span>
            <span className="hidden sm:inline tracking-wider uppercase">Bolsa</span>
            {cantidadTotal > 0 && (
              <span className="bg-[#00ff66] text-[#0a0b0e] font-black text-xs rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center shadow-[0_0_12px_rgba(0,255,102,0.6)] animate-bounce">
                {cantidadTotal}
              </span>
            )}
          </Link>

          {/* PERFIL / LOGOUT */}
          {user ? (
            <div className="flex items-center gap-2 bg-[#14171e] border border-white/10 p-1.5 rounded-xl text-xs">
              <Link to="/mis-datos" className="text-neutral-200 hover:text-[#00ff66] font-bold px-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00ff66]"></span>
                <span className="max-w-[110px] truncate">{user.nombre || user.email?.split('@')[0]}</span>
              </Link>
              <Link to="/mis-pedidos" className="text-neutral-400 hover:text-white px-1.5 py-1 hover:bg-white/5 rounded-lg" title="Mis Pedidos">
                📦
              </Link>
              <button
                onClick={logout}
                className="bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer"
                title="Cerrar Sesión"
              >
                Salir
              </button>
            </div>
          ) : (
            <Link
              to="/autenticacion"
              className="hidden lg:flex items-center gap-1.5 text-xs text-neutral-400 hover:text-[#00ff66] font-semibold transition-colors"
            >
              <span>Ingresar</span>
              <span>→</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
