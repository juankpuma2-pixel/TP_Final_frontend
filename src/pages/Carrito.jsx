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
        <div className="bg-purple-card border border-amber-500/30 rounded-2xl p-8 shadow-2xl space-y-4">
          <div className="w-16 h-16 bg-purple-900/80 rounded-full border border-amber-500/40 flex items-center justify-center text-3xl mx-auto">
            🛒
          </div>
          <h2 className="text-2xl font-serif-gold font-bold text-gold-gradient">Tu carrito está vacío</h2>
          <p className="text-purple-300 text-sm">Explora nuestro catálogo exclusivo y agrega productos deslumbrantes.</p>
          <Link
            to="/"
            className="inline-block btn-gold py-2.5 px-6 rounded-xl font-bold text-sm mt-2 cursor-pointer shadow-lg"
          >
            Explorar Catálogo 🛍️
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="bg-purple-card border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-md">
        <div className="border-b border-purple-800/50 pb-4 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">Resumen de Selección</span>
            <h2 className="text-2xl font-serif-gold font-bold text-gold-gradient">Tu Carrito de Compras</h2>
          </div>
          <button
            onClick={vaciar}
            className="text-xs text-red-400 hover:text-red-300 underline font-semibold cursor-pointer"
          >
            Vaciar Carrito
          </button>
        </div>

        {error && (
          <div className="bg-red-950/90 border border-red-500/50 text-red-200 p-4 rounded-xl text-sm font-semibold">
            <strong>Error: </strong>{error}
          </div>
        )}

        <ul className="divide-y divide-purple-800/40">
          {items.map((item) => (
            <li key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {item.imagen && (
                  <img
                    src={item.imagen}
                    alt={item.nombre}
                    className="w-14 h-14 object-cover rounded-xl border border-amber-500/30 bg-purple-950"
                  />
                )}
                <div>
                  <p className="font-bold text-amber-100 text-base">{item.nombre}</p>
                  <p className="text-xs text-purple-300">Cantidad: <strong className="text-amber-300">{item.cantidad}</strong></p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4">
                <span className="font-extrabold text-gold-gradient text-lg">
                  ${((item.precio_final || item.precio || 0) * item.cantidad).toLocaleString('es-AR')}
                </span>
                <button
                  onClick={() => quitar(item.id)}
                  className="bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/30 text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Quitar
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="border-t border-purple-800/60 pt-4 flex justify-between items-center">
          <span className="text-lg font-bold text-purple-200">Total estimado:</span>
          <span className="text-3xl font-extrabold text-gold-gradient">
            ${total.toLocaleString('es-AR')}
          </span>
        </div>

        <button
          onClick={confirmar}
          disabled={enviando}
          className="w-full btn-gold py-3.5 rounded-xl text-base font-bold transition-all cursor-pointer disabled:opacity-50 shadow-xl"
        >
          {enviando ? "Procesando compra…" : "Confirmar compra 💳"}
        </button>
      </div>
    </div>
  );
}