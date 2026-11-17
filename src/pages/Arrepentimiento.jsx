import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Arrepentimiento() {
  const { token } = useAuth();

  return (
    <div className="max-w-xl mx-auto py-10">
      <div className="card-athletic rounded-3xl p-6 sm:p-8 space-y-5">
        <div className="border-b border-white/10 pb-3">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#00ff66] font-black">Normativa Atleta y Consumidor</span>
          <h2 className="text-2xl font-display font-black text-white uppercase tracking-wider mt-1">Derecho de Arrepentimiento</h2>
        </div>

        <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
          De acuerdo con la Disposición 954/2025 y la Ley 24.240, tienes derecho a revocar la compra de tus prendas de compresión dentro de los <strong className="text-[#00ff66]">10 días corridos</strong> contados desde la recepción del equipamiento.
        </p>

        <ul className="list-disc list-inside text-xs text-neutral-400 space-y-1.5 pl-2">
          <li>El trámite es completamente gratuito e inmediato.</li>
          <li>Sin preguntas ni demoras innecesarias.</li>
          <li>Los costos de logística inversa son cubiertos por TITAN GEAR.</li>
        </ul>

        {token ? (
          <div className="pt-4 border-t border-white/10">
            <p className="text-xs text-neutral-400 mb-3">Para solicitar la revocación sobre una orden específica:</p>
            <Link
              to="/mis-pedidos"
              className="inline-flex items-center gap-2 btn-volt text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl shadow-lg cursor-pointer"
            >
              <span>Ir a mis órdenes para solicitar revocación 📦</span>
            </Link>
          </div>
        ) : (
          <div className="pt-4 border-t border-white/10">
            <p className="text-xs text-neutral-400 mb-3">Para identificar tu pedido, ingresa a tu cuenta de atleta:</p>
            <Link
              to="/autenticacion"
              className="inline-flex items-center gap-2 btn-outline-volt text-xs font-bold px-5 py-3 rounded-xl cursor-pointer"
            >
              <span>Acceder a cuenta atleta ⚡</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}