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
  const [aceptaPolitica, setAceptaPolitica] = useState(false);

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

    if (!aceptaPolitica) {
      setErrorMsg('Debes aceptar la Política de Privacidad y Consentimiento de Datos para continuar.');
      return;
    }

    setCargando(true);
    setErrorMsg(null);
    setMensajeExito(null);

    try {
      await registrarCliente({
        nombre: nombreReg,
        email: emailReg,
        password: passwordReg,
        acepta_politica_privacidad: true,
        acepto_tratamiento: true,
      });
      setMensajeExito('¡Registro exitoso! Ahora podés iniciar sesión con tus credenciales.');
      setEmailLogin(emailReg);
      setPasswordLogin(passwordReg);
      setTab('login');
      setAceptaPolitica(false);
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
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#00ff66] font-black">
          Apartado 2 • Atletas TITAN
        </span>
        <h1 className="text-3xl font-display font-black text-white tracking-wide uppercase mt-1">
          Acceso Atleta
        </h1>
        <p className="text-neutral-400 text-xs mt-1">
          Inicia sesión o regístrate para acceder a compras seguras y seguimiento de tus pedidos pro.
        </p>
      </div>

      {/* SI YA ESTÁ LOGUEADO */}
      {user ? (
        <div className="card-athletic rounded-3xl p-6 sm:p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-[#161a22] rounded-2xl border border-white/10 flex items-center justify-center text-3xl mx-auto text-[#00ff66]">
            ⚡
          </div>
          <h2 className="font-display text-xl font-bold text-white uppercase tracking-wider">¡Hola, {user.nombre || user.email}!</h2>
          <p className="text-neutral-300 text-xs sm:text-sm">Tu cuenta de atleta se encuentra activa.</p>
          
          <div className="flex flex-col gap-2.5 pt-2">
            <button
              onClick={() => navigate('/')}
              className="btn-volt py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-lg"
            >
              Explorar Catálogo de Compresión ⚡
            </button>
            <button
              onClick={logout}
              className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 py-2.5 px-4 rounded-xl text-xs font-bold cursor-pointer transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      ) : (
        /* CONTENEDOR CON PESTAÑAS (TABS) LOGIN / REGISTRO */
        <div className="card-athletic rounded-3xl overflow-hidden shadow-2xl">
          
          {/* TAB SWITCHER */}
          <div className="flex border-b border-white/10 bg-[#101319]">
            <button
              type="button"
              onClick={() => { setTab('login'); setErrorMsg(null); setMensajeExito(null); }}
              className={`flex-1 py-3.5 text-center text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                tab === 'login'
                  ? 'bg-[#181d26] text-[#00ff66] border-b-2 border-[#00ff66]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              ⚡ Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => { setTab('register'); setErrorMsg(null); setMensajeExito(null); }}
              className={`flex-1 py-3.5 text-center text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                tab === 'register'
                  ? 'bg-[#181d26] text-[#00ff66] border-b-2 border-[#00ff66]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              ✨ Registrarse
            </button>
          </div>

          <div className="p-6 space-y-4">
            
            {/* ALERTAS */}
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/40 text-red-300 p-3.5 rounded-xl text-xs font-bold">
                ⚠️ {errorMsg}
              </div>
            )}

            {mensajeExito && (
              <div className="bg-[#00ff66]/10 border border-[#00ff66]/40 text-[#00ff66] p-3.5 rounded-xl text-xs font-bold">
                ✅ {mensajeExito}
              </div>
            )}

            {/* TAB 1: FORMULARIO LOGIN CLIENTE */}
            {tab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="atleta@ejemplo.com"
                    value={emailLogin}
                    onChange={(e) => setEmailLogin(e.target.value)}
                    className="w-full px-4 py-2.5 input-stealth rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={passwordLogin}
                    onChange={(e) => setPasswordLogin(e.target.value)}
                    className="w-full px-4 py-2.5 input-stealth rounded-xl text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={cargando}
                  className="w-full btn-volt py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all disabled:opacity-50 mt-2 shadow-lg"
                >
                  {cargando ? 'Iniciando sesión...' : 'Ingresar como Atleta ⚡'}
                </button>
              </form>
            )}

            {/* TAB 2: FORMULARIO REGISTRO CLIENTE */}
            {tab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Lucas Gómez"
                    value={nombreReg}
                    onChange={(e) => setNombreReg(e.target.value)}
                    className="w-full px-4 py-2.5 input-stealth rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="lucas@ejemplo.com"
                    value={emailReg}
                    onChange={(e) => setEmailReg(e.target.value)}
                    className="w-full px-4 py-2.5 input-stealth rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={passwordReg}
                    onChange={(e) => setPasswordReg(e.target.value)}
                    className="w-full px-4 py-2.5 input-stealth rounded-xl text-sm"
                  />
                </div>

                {/* CASILLA DE CONSENTIMIENTO DE DATOS LEY 25.326 */}
                <div className="pt-1">
                  <label
                    htmlFor="acepta_politica"
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                      aceptaPolitica
                        ? 'bg-[#00ff66]/10 border-[#00ff66]/40 text-neutral-200 shadow-sm shadow-[#00ff66]/10'
                        : 'bg-[#12161f] border-white/10 text-neutral-400 hover:border-white/20'
                    }`}
                  >
                    <input
                      type="checkbox"
                      id="acepta_politica"
                      name="acepta_politica"
                      checked={aceptaPolitica}
                      onChange={(e) => setAceptaPolitica(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-[#00ff66] focus:ring-[#00ff66] accent-[#00ff66] cursor-pointer"
                      required
                    />
                    <span className="text-xs leading-relaxed">
                      Acepto los Términos y la Política de Privacidad. Entiendo que <strong className="text-white font-bold">TITAN COMPRESSION</strong> resguarda mis datos según la <span className="text-[#00ff66] font-bold">Ley 25.326</span> y no venderá ni compartirá mi información personal con terceros.
                    </span>
                  </label>
                </div>

                {/* BOTÓN CREAR CUENTA ATLETA (DESHABILITADO SI NO ACEPTA POLÍTICA) */}
                <button
                  type="submit"
                  disabled={cargando || !aceptaPolitica}
                  className={`w-full py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all mt-2 shadow-lg flex items-center justify-center gap-2 ${
                    cargando || !aceptaPolitica
                      ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-white/5 opacity-60'
                      : 'btn-volt cursor-pointer hover:shadow-[#00ff66]/30'
                  }`}
                  title={!aceptaPolitica ? "Debes marcar la casilla de consentimiento para habilitar el registro" : "Crear Cuenta Atleta"}
                >
                  <span>{cargando ? 'Creando cuenta...' : 'Crear Cuenta Atleta ✨'}</span>
                </button>

                {!aceptaPolitica && (
                  <p className="text-[11px] text-center text-neutral-500 flex items-center justify-center gap-1.5 font-medium">
                    <span>🔒</span>
                    <span>Marca la casilla de consentimiento para habilitar el botón</span>
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
