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

  if (cargando) return <p className="text-center py-16 text-[#00ff66] font-display font-bold text-sm tracking-wider">Cargando perfil de atleta... ⏳</p>;
  if (error) return <p className="text-center py-16 text-red-400 font-medium">{error}</p>;

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#00ff66] font-black">Ficha del Atleta</span>
        <h2 className="font-display text-3xl font-black text-white uppercase tracking-wider">Mis Datos Personales</h2>
      </div>

      <div className="card-athletic rounded-3xl p-6 sm:p-8 space-y-3.5 text-xs text-neutral-300">
        <p className="flex justify-between border-b border-white/5 pb-2"><strong className="text-white uppercase tracking-wider">ID Atleta:</strong> <span className="font-mono text-[#00ff66]">#{datos.usuario.id}</span></p>
        <p className="flex justify-between border-b border-white/5 pb-2"><strong className="text-white uppercase tracking-wider">Nombre:</strong> <span className="text-neutral-100 font-bold">{datos.usuario.nombre}</span></p>
        <p className="flex justify-between border-b border-white/5 pb-2"><strong className="text-white uppercase tracking-wider">Email Registrado:</strong> <span className="text-neutral-100">{datos.usuario.email}</span></p>
        <p className="flex justify-between pt-1"><strong className="text-white uppercase tracking-wider">Miembro desde:</strong> <span className="font-mono text-neutral-400">{new Date(datos.usuario.creado_en).toLocaleString('es-AR')}</span></p>
      </div>

      <button
        onClick={handleExportar}
        className="btn-volt text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl cursor-pointer shadow-lg inline-flex items-center gap-2"
      >
        <span>📥 Descargar Mis Datos (.JSON)</span>
      </button>

      <div className="card-athletic border border-red-500/30 rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="font-display text-lg font-bold text-red-400 uppercase tracking-wider">Eliminar / Anonimizar Cuenta</h3>
        <p className="text-xs text-neutral-400 leading-relaxed">
          Al confirmar la baja, tus datos personales se <strong>anonimizarán permanentemente</strong> en cumplimiento de la normativa de privacidad.
        </p>

        <p className="text-xs text-neutral-300 font-medium">Escribe la palabra <strong className="text-red-400 font-black">ELIMINAR</strong> para confirmar:</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={confirmacion}
            onChange={(e) => setConfirmacion(e.target.value)}
            placeholder="ELIMINAR"
            className="input-stealth rounded-xl px-4 py-2.5 text-xs font-mono uppercase focus:border-red-500 flex-1"
          />

          <button
            disabled={confirmacion !== "ELIMINAR" || eliminando}
            onClick={handleEliminarCuenta}
            className="bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            {eliminando ? "Procesando..." : "Confirmar Baja"}
          </button>
        </div>
      </div>
    </div>
  );
}