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
    return <div className="text-center py-16 text-amber-300 font-medium">Cargando historial de compras... ⏳</div>;
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto text-center py-12">
        <div className="bg-red-950/90 border border-red-500/50 text-red-200 p-6 rounded-2xl shadow-xl">
          <h3 className="text-lg font-bold">{error}</h3>
        </div>
      </div>
    );
  }

  if (pedidos.length === 0) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <div className="bg-purple-card border border-amber-500/30 rounded-2xl p-8 shadow-2xl space-y-3">
          <span className="text-4xl">📦</span>
          <h3 className="text-xl font-bold text-amber-300">Aún no realizaste ninguna compra</h3>
          <p className="text-purple-300 text-xs">Tus compras confirmadas aparecerán en esta sección.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <div>
        <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">Historial de Usuario</span>
        <h2 className="text-3xl font-serif-gold font-bold text-gold-gradient">Mis Compras</h2>
      </div>

      {mensajeCodigo && (
        <div
          role="status"
          className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 p-4 rounded-xl font-semibold shadow-lg text-sm"
        >
          ✅ {mensajeCodigo}
        </div>
      )}

      {pedidos.map((pedido) => (
        <div key={pedido.id} className="bg-purple-card border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center font-bold text-amber-200 border-b border-purple-800/40 pb-3">
            <span className="text-lg">Pedido #{pedido.id}</span>
            <span
              className={`text-xs px-3 py-1 rounded-full uppercase font-bold ${
                pedido.estado === "cancelado"
                  ? "bg-red-950 text-red-300 border border-red-500/40"
                  : "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
              }`}
            >
              {pedido.estado}
            </span>
          </div>

          <p className="text-xs text-purple-300">
            Fecha: {new Date(pedido.creado_en).toLocaleString('es-AR')}
          </p>

          <ul className="divide-y divide-purple-800/30 text-sm text-purple-200 pt-1">
            {pedido.items.map((item) => (
              <li key={item.producto_id} className="py-2 flex justify-between">
                <span>Producto ID: {item.producto_id} (x{item.cantidad})</span>
                <span className="font-semibold text-amber-300">${item.precio_unitario} c/u</span>
              </li>
            ))}
          </ul>

          <div className="border-t border-purple-800/50 pt-3 flex justify-between items-center">
            <div>
              {puedeRevocar(pedido) && (
                <button
                  disabled={enviando}
                  onClick={() => handleRevocar(pedido.id)}
                  className="px-3.5 py-1.5 bg-red-950 hover:bg-red-900 border border-red-500/40 text-red-200 text-xs font-semibold rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {enviando ? "Procesando..." : "Arrepentirme de esta compra"}
                </button>
              )}
            </div>

            <span className="text-xl font-bold text-gold-gradient">
              Total: ${pedido.total?.toLocaleString('es-AR')}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}