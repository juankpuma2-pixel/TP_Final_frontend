import { useState } from "react";
import { useCarrito } from "../context/CarritoContext";
import { crearPedido } from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function Carrito() {
  const { items, quitar, vaciar, total } = useCarrito();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const confirmar = async () => {
    if (enviando || items.length === 0) return;

    setEnviando(true);
    setError(null);

    try {
      await crearPedido(items);
      vaciar();
      navigate("/mis-pedidos");
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 px-4">
        <div className="card-athletic rounded-3xl p-8 sm:p-10 space-y-4">
          <div className="w-16 h-16 bg-[#161a22] rounded-2xl border border-white/10 flex items-center justify-center text-3xl mx-auto text-[#00ff66]">
            🛍️
          </div>
          <h2 className="font-display text-2xl font-bold text-white uppercase tracking-wider">Tu Bolsa de Entrenamiento está Vacía</h2>
          <p className="text-neutral-400 text-xs sm:text-sm">Explora nuestra colección pro de compresión y maximiza tu rendimiento.</p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 btn-volt py-3 px-6 rounded-xl font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg"
            >
              <span>Explorar Colección ⚡</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="card-athletic rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="border-b border-white/10 pb-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#00ff66] font-black">Resumen de Equipamiento</span>
            <h2 className="font-display text-2xl font-black text-white uppercase tracking-wider">Bolsa de Compras</h2>
          </div>
          <button
            onClick={vaciar}
            className="text-xs text-red-400 hover:text-red-300 underline font-semibold cursor-pointer"
          >
            Vaciar bolsa
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-300 p-4 rounded-xl text-xs font-bold">
            <strong>Atención: </strong>{error}
          </div>
        )}

        <ul className="divide-y divide-white/10">
          {items.map((item) => (
            <li key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                {item.imagen && (
                  <img
                    src={item.imagen}
                    alt={item.nombre}
                    className="w-16 h-16 object-cover rounded-xl border border-white/10 bg-[#0e1014]"
                  />
                )}
                <div>
                  <p className="font-display font-bold text-white text-base tracking-wide">{item.nombre}</p>
                  <p className="text-xs text-neutral-400">Cantidad: <strong className="text-[#00ff66]">{item.cantidad}</strong> u.</p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4">
                <span className="font-display font-black text-white text-xl">
                  ${((item.precio_final || item.precio || 0) * item.cantidad).toLocaleString('es-AR')}
                </span>
                <button
                  onClick={() => quitar(item.id)}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer"
                >
                  Quitar
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="border-t border-white/10 pt-4 flex justify-between items-center">
          <span className="text-sm font-bold text-neutral-300 uppercase tracking-wider">Total a Pagar:</span>
          <span className="font-display text-3xl font-black text-[#00ff66]">
            ${total.toLocaleString('es-AR')}
          </span>
        </div>

        <button
          onClick={confirmar}
          disabled={enviando}
          className="w-full btn-volt py-3.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 shadow-xl"
        >
          {enviando ? "Procesando Pedido Atleta…" : "Confirmar Pedido y Checkout ⚡"}
        </button>
      </div>
    </div>
  );
}