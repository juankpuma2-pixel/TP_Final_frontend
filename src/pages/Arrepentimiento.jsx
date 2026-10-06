import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Arrepentimiento() {
  const { token } = useAuth();

  return (
    <div className="max-w-xl mx-auto py-10">
      <div className="bg-purple-card border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5 backdrop-blur-md">
        <div className="border-b border-purple-800/50 pb-3">
          <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">Normativa Legal</span>
          <h2 className="text-2xl font-serif-gold font-bold text-gold-gradient mt-1">Derecho de Arrepentimiento</h2>
        </div>

        <p className="text-sm text-purple-200 leading-relaxed">
          De acuerdo con la Disposición 954/2025 y la Ley 24.240, tenés derecho a revocar tu compra dentro de los <strong className="text-amber-300">10 días corridos</strong> contados desde la recepción del producto o confirmación de la compra.
        </p>

        <ul className="list-disc list-inside text-xs text-purple-300 space-y-1.5 pl-2">
          <li>El trámite es completamente gratuito.</li>
          <li>No necesitás justificar el motivo.</li>
          <li>Los gastos de devolución corren por cuenta del vendedor.</li>
        </ul>

        {token ? (
          <div className="pt-4 border-t border-purple-800/40">
            <p className="text-xs text-purple-300 mb-3">Para ejercer este derecho sobre uno de tus pedidos:</p>
            <Link
              to="/mis-pedidos"
              className="inline-block btn-gold text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg cursor-pointer"
            >
              Ir a mis compras para arrepentirme 📦
            </Link>
          </div>
        ) : (
          <div className="pt-4 border-t border-purple-800/40">
            <p className="text-xs text-purple-300 mb-3">Para identificar tu compra, por favor iniciá sesión:</p>
            <Link
              to="/autenticacion"
              className="inline-block btn-outline-gold text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
            >
              Iniciar sesión de cliente 🔑
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}