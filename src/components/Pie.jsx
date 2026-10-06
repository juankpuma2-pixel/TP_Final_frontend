import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-16 py-8 border-t border-amber-500/20 bg-[#0b0518]/90 text-center backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 space-y-3">
        <div className="flex items-center justify-center gap-2">
          <span className="text-amber-400 text-lg">👑</span>
          <span className="font-serif-gold font-bold text-gold-gradient text-lg tracking-wider">AURA GOLD</span>
        </div>
        <p className="text-xs text-purple-300/70">
          © 2026 Aura Store. Todos los derechos reservados. Experiencia Premium Morado & Dorado.
        </p>
        <div>
          <Link
            to="/arrepentimiento"
            className="text-xs text-amber-400/90 hover:text-amber-300 font-semibold underline transition-colors"
          >
            Botón de arrepentimiento
          </Link>
        </div>
      </div>
    </footer>
  );
}