import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-20 py-10 border-t border-white/10 bg-[#080a0d]/95 text-center backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 space-y-4">
        <div className="flex items-center justify-center gap-2.5">
          <span className="text-[#00ff66] text-xl font-bold">⚡</span>
          <span className="font-display font-black text-gradient-volt text-xl tracking-wider uppercase">
            TITAN COMPRESSION
          </span>
        </div>
        <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
          Ingeniería textil biomecánica de compresión graduada. Diseñado para atletas de alta exigencia, cross-training y recuperación muscular.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-neutral-500 pt-2 border-t border-white/5">
          <span>© 2026 TITAN COMPRESSION GEAR. Todos los derechos reservados.</span>
          <span className="text-neutral-700">•</span>
          <Link
            to="/arrepentimiento"
            className="text-neutral-400 hover:text-[#00ff66] font-semibold underline transition-colors"
          >
            Botón de Arrepentimiento (Defensa del Consumidor)
          </Link>
        </div>
      </div>
    </footer>
  );
}