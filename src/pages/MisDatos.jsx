import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMisDatos, eliminarMiCuenta } from "../services/api";
import { useCarrito } from "../context/CarritoContext";
import { useAuth } from "../context/AuthContext";

export default function MisDatos() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [confirmacion, setConfirmacion] = useState("");
  const [eliminando, setEliminando] = useState(false);

  const { vaciar } = useCarrito();
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getMisDatos()
      .then((res) => setDatos(res))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  const handleExportar = () => {
    const jsonStr = JSON.stringify(datos, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mis_datos_${datos?.usuario?.id || 'usuario'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEliminarCuenta = async () => {
    if (confirmacion !== "ELIMINAR") return;
    setEliminando(true);

    try {
      await eliminarMiCuenta();
      if (vaciar) vaciar();
      logout();
      alert("Tu cuenta ha sido dada de baja y tus datos han sido anonimizados.");
      navigate("/");
    } catch (err) {
      alert(err.message);
      setEliminando(false);
    }
  };

  if (cargando) return <p className="text-center py-16 text-amber-300 font-medium">Cargando información personal... ⏳</p>;
  if (error) return <p className="text-center py-16 text-red-400 font-medium">{error}</p>;

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <div>
        <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">Cuenta de Usuario</span>
        <h2 className="text-3xl font-serif-gold font-bold text-gold-gradient">Mis Datos Personales</h2>
      </div>

      <div className="bg-purple-card border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-3 text-sm text-purple-200">
        <p><strong className="text-amber-300">ID Usuario:</strong> {datos.usuario.id}</p>
        <p><strong className="text-amber-300">Nombre:</strong> {datos.usuario.nombre}</p>
        <p><strong className="text-amber-300">Email:</strong> {datos.usuario.email}</p>
        <p><strong className="text-amber-300">Fecha de consentimiento / registro:</strong> {new Date(datos.usuario.creado_en).toLocaleString('es-AR')}</p>
      </div>

      <button
        onClick={handleExportar}
        className="btn-gold text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer shadow-lg"
      >
        📥 Descargar mis datos (.JSON)
      </button>

      <div className="bg-red-950/60 border border-red-500/40 rounded-2xl p-6 space-y-4 shadow-xl">
        <h3 className="text-lg font-bold text-red-300">Eliminar mi cuenta</h3>
        <p className="text-xs text-red-200/80 leading-relaxed">
          Al confirmar la baja, tus datos personales (nombre, email, contraseña) se <strong>anonimizarán permanentemente</strong>. Tus pedidos anteriores se conservarán por normativas contables pero de forma anonimizada.
        </p>

        <p className="text-xs text-purple-200 font-medium">Escribí la palabra <strong>ELIMINAR</strong> para confirmar:</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={confirmacion}
            onChange={(e) => setConfirmacion(e.target.value)}
            placeholder="ELIMINAR"
            className="input-purple rounded-xl px-4 py-2 text-sm focus:border-red-500 flex-1"
          />

          <button
            disabled={confirmacion !== "ELIMINAR" || eliminando}
            onClick={handleEliminarCuenta}
            className="bg-red-900 hover:bg-red-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {eliminando ? "Procesando..." : "Confirmar eliminación"}
          </button>
        </div>
      </div>
    </div>
  );
}