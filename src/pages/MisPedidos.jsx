import { useEffect, useState } from "react";
import { getMisPedidos, revocarPedido } from "../services/api";

const DIAS_PARA_REVOCAR = 10;

function puedeRevocar(pedido) {
  if (pedido.estado === "cancelado") return false;
  const ms = Date.now() - new Date(pedido.creado_en);
  return ms / 86400000 <= DIAS_PARA_REVOCAR;
}

export default function MisPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [mensajeCodigo, setMensajeCodigo] = useState(null);
  const [error, setError] = useState(null);

  const cargarPedidos = async () => {
    try {
      const data = await getMisPedidos();
      setPedidos(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  const handleRevocar = async (pedidoId) => {
    if (enviando) return;
    if (!window.confirm("¿Estás seguro de que querés arrepentirte de esta compra?")) return;

    setEnviando(true);
    setError(null);
    try {
      const res = await revocarPedido(pedidoId);
      setMensajeCodigo(`Solicitud registrada. Código de revocación: ${res.codigo}`);
      await cargarPedidos();
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) {
    return <div className="text-center py-16 text-[#00ff66] font-display font-bold text-sm tracking-wider">Cargando historial de pedidos atleta... ⏳</div>;
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto text-center py-12">
        <div className="card-athletic border border-red-500/30 text-red-300 p-6 rounded-2xl shadow-xl">
          <h3 className="text-base font-bold">{error}</h3>
        </div>
      </div>
    );
  }

  if (pedidos.length === 0) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <div className="card-athletic rounded-3xl p-8 sm:p-10 space-y-3">
          <span className="text-4xl text-[#00ff66]">📦</span>
          <h3 className="font-display text-xl font-bold text-white uppercase tracking-wider">Aún no realizaste ningún pedido</h3>
          <p className="text-neutral-400 text-xs">Tus compras de equipamiento TITAN aparecerán detalladas aquí.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#00ff66] font-black">Historial de Equipamiento</span>
        <h2 className="font-display text-3xl font-black text-white uppercase tracking-wider">Mis Pedidos Atleta</h2>
      </div>

      {mensajeCodigo && (
        <div
          role="status"
          className="bg-[#00ff66]/10 border border-[#00ff66]/40 text-[#00ff66] p-4 rounded-xl font-bold shadow-lg text-xs"
        >
          ✅ {mensajeCodigo}
        </div>
      )}

      {pedidos.map((pedido) => (
        <div key={pedido.id} className="card-athletic rounded-3xl p-6 space-y-4">
          <div className="flex justify-between items-center font-bold text-white border-b border-white/10 pb-3">
            <span className="font-display text-lg tracking-wide uppercase">Orden #{pedido.id}</span>
            <span
              className={`text-[10px] px-3 py-1 rounded-full uppercase font-black tracking-wider ${
                pedido.estado === "cancelado"
                  ? "bg-red-500/10 text-red-400 border border-red-500/30"
                  : "bg-[#00ff66]/15 text-[#00ff66] border border-[#00ff66]/40"
              }`}
            >
              {pedido.estado}
            </span>
          </div>

          <p className="text-xs text-neutral-400 font-mono">
            Fecha de Orden: {new Date(pedido.creado_en).toLocaleString('es-AR')}
          </p>

          <ul className="divide-y divide-white/5 text-sm text-neutral-300 pt-1">
            {pedido.items.map((item) => (
              <li key={item.producto_id} className="py-2.5 flex justify-between items-center">
                <span className="text-xs">Prenda ID: <strong className="text-white">#{item.producto_id}</strong> (x{item.cantidad} u.)</span>
                <span className="font-display font-bold text-[#00ff66] text-sm">${item.precio_unitario}</span>
              </li>
            ))}
          </ul>

          <div className="border-t border-white/10 pt-3 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              {puedeRevocar(pedido) && (
                <button
                  disabled={enviando}
                  onClick={() => handleRevocar(pedido.id)}
                  className="px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {enviando ? "Procesando..." : "Revocar este pedido (Arrepentimiento)"}
                </button>
              )}
            </div>

            <span className="font-display text-2xl font-black text-white text-right">
              Total: <strong className="text-[#00ff66]">${pedido.total?.toLocaleString('es-AR')}</strong>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}