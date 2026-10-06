import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AuthCliente() {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const { loginCliente, registrarCliente, user, logout } = useAuth();
  const navigate = useNavigate();

  // Estado del formulario Login
  const [emailLogin, setEmailLogin] = useState('');
  const [passwordLogin, setPasswordLogin] = useState('');

  // Estado del formulario Registro
  const [nombreReg, setNombreReg] = useState('');
  const [emailReg, setEmailReg] = useState('');
  const [passwordReg, setPasswordReg] = useState('');

  const [cargando, setCargando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!emailLogin || !passwordLogin) {
      setErrorMsg('Por favor, completa todos los campos.');
      return;
    }

    setCargando(true);
    setErrorMsg(null);
    setMensajeExito(null);

    try {
      await loginCliente({ email: emailLogin, password: passwordLogin });
      setMensajeExito('¡Inicio de sesión exitoso! Redirigiendo al catálogo...');
      setTimeout(() => {
        navigate('/');
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Credenciales incorrectas.');
    } finally {
      setCargando(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!nombreReg || !emailReg || !passwordReg) {
      setErrorMsg('Por favor, completa todos los campos del registro.');
      return;
    }

    setCargando(true);
    setErrorMsg(null);
    setMensajeExito(null);

    try {
      await registrarCliente({ nombre: nombreReg, email: emailReg, password: passwordReg });
      setMensajeExito('¡Registro exitoso! Ahora podés iniciar sesión con tus credenciales.');
      setEmailLogin(emailReg);
      setPasswordLogin(passwordReg);
      setTab('login');
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo completar el registro.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10">
      
      {/* HEADER DE APARTADO 2 */}
      <div className="text-center mb-8">
        <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">
          Apartado 2 • Clientes
        </span>
        <h1 className="text-3xl font-serif-gold font-bold text-gold-gradient tracking-wide mt-1">
          Autenticación de Usuario
        </h1>
        <p className="text-purple-300 text-xs mt-1">
          Accedé a tu cuenta de cliente o registrate para realizar compras exclusivas.
        </p>
      </div>

      {/* SI YA ESTÁ LOGUEADO */}
      {user ? (
        <div className="bg-purple-card border border-amber-500/30 rounded-2xl p-6 text-center shadow-xl space-y-4">
          <div className="w-16 h-16 bg-purple-900/80 rounded-full border border-amber-500/40 flex items-center justify-center text-3xl mx-auto">
            👤
          </div>
          <h2 className="text-xl font-bold text-amber-300">¡Hola, {user.nombre || user.email}!</h2>
          <p className="text-purple-200 text-sm">Ya tenés una sesión activa de cliente.</p>
          
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => navigate('/')}
              className="btn-gold py-2.5 px-4 rounded-xl text-sm font-bold cursor-pointer"
            >
              Ir al Catálogo de Productos 🛍️
            </button>
            <button
              onClick={logout}
              className="bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-200 py-2 px-4 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      ) : (
        /* CONTENEDOR CON PESTAÑAS (TABS) LOGIN / REGISTRO */
        <div className="bg-purple-card border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
          
          {/* TAB SWITCHER */}
          <div className="flex border-b border-amber-500/20 bg-purple-950/60">
            <button
              type="button"
              onClick={() => { setTab('login'); setErrorMsg(null); setMensajeExito(null); }}
              className={`flex-1 py-3.5 text-center text-sm font-bold transition-all ${
                tab === 'login'
                  ? 'bg-purple-900/80 text-amber-300 border-b-2 border-amber-400 shadow-inner'
                  : 'text-purple-300/70 hover:text-amber-200 hover:bg-purple-900/30'
              }`}
            >
              🔑 Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => { setTab('register'); setErrorMsg(null); setMensajeExito(null); }}
              className={`flex-1 py-3.5 text-center text-sm font-bold transition-all ${
                tab === 'register'
                  ? 'bg-purple-900/80 text-amber-300 border-b-2 border-amber-400 shadow-inner'
                  : 'text-purple-300/70 hover:text-amber-200 hover:bg-purple-900/30'
              }`}
            >
              ✨ Registrarse
            </button>
          </div>

          <div className="p-6 space-y-4">
            
            {/* ALERTAS */}
            {errorMsg && (
              <div className="bg-red-950/90 border border-red-500/50 text-red-200 p-3.5 rounded-xl text-xs font-semibold">
                ⚠️ {errorMsg}
              </div>
            )}

            {mensajeExito && (
              <div className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 p-3.5 rounded-xl text-xs font-semibold">
                ✅ {mensajeExito}
              </div>
            )}

            {/* TAB 1: FORMULARIO LOGIN CLIENTE */}
            {tab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-amber-200 mb-1.5">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="cliente@ejemplo.com"
                    value={emailLogin}
                    onChange={(e) => setEmailLogin(e.target.value)}
                    className="w-full px-4 py-2.5 input-purple rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-amber-200 mb-1.5">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={passwordLogin}
                    onChange={(e) => setPasswordLogin(e.target.value)}
                    className="w-full px-4 py-2.5 input-purple rounded-xl text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={cargando}
                  className="w-full btn-gold py-3 px-4 rounded-xl text-sm font-bold cursor-pointer transition-all disabled:opacity-50 mt-2"
                >
                  {cargando ? 'Iniciando sesión...' : 'Ingresar como Cliente 🛍️'}
                </button>
              </form>
            )}

            {/* TAB 2: FORMULARIO REGISTRO CLIENTE */}
            {tab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-amber-200 mb-1.5">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="María Pérez"
                    value={nombreReg}
                    onChange={(e) => setNombreReg(e.target.value)}
                    className="w-full px-4 py-2.5 input-purple rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-amber-200 mb-1.5">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="maria@ejemplo.com"
                    value={emailReg}
                    onChange={(e) => setEmailReg(e.target.value)}
                    className="w-full px-4 py-2.5 input-purple rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-amber-200 mb-1.5">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={passwordReg}
                    onChange={(e) => setPasswordReg(e.target.value)}
                    className="w-full px-4 py-2.5 input-purple rounded-xl text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={cargando}
                  className="w-full btn-gold py-3 px-4 rounded-xl text-sm font-bold cursor-pointer transition-all disabled:opacity-50 mt-2"
                >
                  {cargando ? 'Creando cuenta...' : 'Crear Cuenta de Cliente ✨'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
