import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProductos, crearProducto, eliminarProducto } from '../services/api';
import { Link } from 'react-router-dom';

export default function AdminAccess() {
  const { loginAdmin, isAdmin, user, logout } = useAuth();

  // Estado Formulario Login Admin
  const [emailAdmin, setEmailAdmin] = useState('');
  const [passwordAdmin, setPasswordAdmin] = useState('');
  const [cargandoLogin, setCargandoLogin] = useState(false);
  const [errorLogin, setErrorLogin] = useState(null);

  // Estado Panel de Gestión Admin
  const [productos, setProductos] = useState([]);
  const [cargandoProds, setCargandoProds] = useState(false);
  const [exitoMsg, setExitoMsg] = useState(null);
  const [errorProd, setErrorProd] = useState(null);

  // Estado Formulario Agregar Producto
  const [nuevoProd, setNuevoProd] = useState({
    nombre: '',
    precio_final: '',
    stock: '',
    cuotas_cantidad: '3',
    cuotas_valor: '',
    garantia_meses: '12',
    imagen: '',
  });

  const cargarListaProductos = async () => {
    setCargandoProds(true);
    try {
      const data = await getProductos({ page: 0, limit: 100 });
      setProductos(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setCargandoProds(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      cargarListaProductos();
    }
  }, [isAdmin]);

  const handleAdminLoginSubmit = async (e) => {
    e.preventDefault();
    if (!emailAdmin || !passwordAdmin) {
      setErrorLogin('Por favor, ingresa el correo y la contraseña.');
      return;
    }

    setCargandoLogin(true);
    setErrorLogin(null);

    try {
      await loginAdmin({ email: emailAdmin, password: passwordAdmin });
      setExitoMsg('¡Autenticación de administrador verificada con éxito!');
      setTimeout(() => setExitoMsg(null), 3000);
    } catch (err) {
      // Requisito 4: Muestra mensaje de error exacto
      setErrorLogin(err.message || 'Acceso denegado: No tienes permisos de administrador');
    } finally {
      setCargandoLogin(false);
    }
  };

  const handleCrearProductoSubmit = async (e) => {
    e.preventDefault();
    if (!nuevoProd.nombre || !nuevoProd.precio_final) {
      setErrorProd('El nombre y precio final son obligatorios.');
      return;
    }

    setErrorProd(null);
    try {
      const payload = {
        nombre: nuevoProd.nombre,
        precio_final: Number(nuevoProd.precio_final),
        stock: Number(nuevoProd.stock || 1),
        cuotas_cantidad: Number(nuevoProd.cuotas_cantidad || 1),
        cuotas_valor: Number(nuevoProd.cuotas_valor || (nuevoProd.precio_final / (nuevoProd.cuotas_cantidad || 1))),
        garantia_meses: Number(nuevoProd.garantia_meses || 12),
        imagen: nuevoProd.imagen.trim(),
      };

      await crearProducto(payload);
      setExitoMsg(`Producto "${nuevoProd.nombre}" agregado exitosamente al catálogo.`);
      setNuevoProd({
        nombre: '',
        precio_final: '',
        stock: '',
        cuotas_cantidad: '3',
        cuotas_valor: '',
        garantia_meses: '12',
        imagen: '',
      });
      cargarListaProductos();
      setTimeout(() => setExitoMsg(null), 4000);
    } catch (err) {
      setErrorProd(err.message);
    }
  };

  const handleEliminarProducto = async (idProd, nombre) => {
    if (!window.confirm(`¿Seguro que deseas eliminar "${nombre}" del catálogo?`)) return;
    try {
      await eliminarProducto(idProd);
      setExitoMsg(`Producto "${nombre}" eliminado del catálogo.`);
      cargarListaProductos();
      setTimeout(() => setExitoMsg(null), 4000);
    } catch (err) {
      setErrorProd(err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      
      {/* HEADER APARTADO 3 */}
      <div className="text-center border-b border-amber-500/20 pb-6">
        <span className="text-xs uppercase tracking-widest text-amber-400 font-bold flex items-center justify-center gap-1.5">
          <span>🛡️</span> Apartado 3 • Acceso Administrador
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif-gold font-bold text-gold-gradient tracking-wide mt-1">
          Portal de Administración
        </h1>
        <p className="text-purple-300 text-sm mt-1 max-w-xl mx-auto">
          Autenticación exclusiva para administradores autorizados. Gestiona el catálogo de productos (Agregar / Eliminar).
        </p>
      </div>

      {/* SI NO ESTÁ AUTENTICADO COMO ADMIN: FORMULARIO DE LOGIN EXCLUSIVO */}
      {!isAdmin ? (
        <div className="max-w-md mx-auto bg-purple-card border border-amber-500/30 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-md space-y-6">
          <div className="text-center">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl p-0.5 mx-auto mb-3 shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-[#14082b] rounded-[14px] flex items-center justify-center text-2xl">
                🔒
              </div>
            </div>
            <h2 className="text-xl font-bold text-amber-300">Inicio de Sesión Admin</h2>
            <p className="text-purple-300 text-xs mt-1">
              Ingresa tus credenciales con rol de administrador autorizadas.
            </p>
          </div>

          {/* MENSAGES DE ERROR / DENEGACIÓN DE ACCESO */}
          {errorLogin && (
            <div className="bg-red-950/90 border border-red-500/60 text-red-200 p-4 rounded-xl text-xs font-bold space-y-1 shadow-lg">
              <div className="flex items-center gap-2 text-sm text-red-300">
                <span>🚫</span> <span>Acceso Restringido</span>
              </div>
              <p>{errorLogin}</p>
            </div>
          )}

          <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-amber-200 mb-1.5">
                Usuario / Email de Administrador
              </label>
              <input
                type="email"
                required
                placeholder="admin@tienda.com"
                value={emailAdmin}
                onChange={(e) => setEmailAdmin(e.target.value)}
                className="w-full px-4 py-2.5 input-purple rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-200 mb-1.5">
                Contraseña de Administrador
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={passwordAdmin}
                onChange={(e) => setPasswordAdmin(e.target.value)}
                className="w-full px-4 py-2.5 input-purple rounded-xl text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={cargandoLogin}
              className="w-full btn-gold py-3 px-4 rounded-xl text-sm font-bold cursor-pointer transition-all disabled:opacity-50 mt-2 shadow-lg"
            >
              {cargandoLogin ? 'Verificando permisos...' : 'Verificar y Acceder como Admin 🛡️'}
            </button>
          </form>

          <div className="border-t border-purple-800/40 pt-4 text-center">
            <p className="text-purple-400 text-xs">
              ¿Sos usuario cliente? Ir a <Link to="/autenticacion" className="text-amber-300 underline font-semibold">Acceso Cliente (Apartado 2)</Link>
            </p>
          </div>
        </div>
      ) : (
        /* PANEL DE CONTROL ADMINISTRADOR AUTORIZADO */
        <div className="space-y-8">
          
          {/* BANNER ADMINISTRADOR ACTIVO */}
          <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-amber-950/60 border border-amber-500/40 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-500/20 border border-amber-400/40 rounded-xl flex items-center justify-center text-2xl">
                👑
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-amber-300">Sesión de Administrador Activa</h2>
                  <span className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Autorizado
                  </span>
                </div>
                <p className="text-xs text-purple-200">
                  Usuario: <strong className="text-amber-100">{user?.email || user?.nombre || 'Admin'}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/" className="btn-outline-gold text-xs px-3.5 py-2 rounded-xl font-bold">
                Ver Catálogo 🛍️
              </Link>
              <button
                onClick={logout}
                className="bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-200 text-xs px-3.5 py-2 rounded-xl font-bold transition-colors cursor-pointer"
              >
                Cerrar Sesión Admin
              </button>
            </div>
          </div>

          {/* NOTIFICACIÓN ÉXITO / ERROR */}
          {exitoMsg && (
            <div className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 p-4 rounded-xl text-sm font-semibold shadow-lg">
              ✅ {exitoMsg}
            </div>
          )}

          {errorProd && (
            <div className="bg-red-950/90 border border-red-500/50 text-red-200 p-4 rounded-xl text-sm font-semibold shadow-lg">
              ⚠️ {errorProd}
            </div>
          )}

          {/* FORMULARIO PARA AGREGAR NUEVOS PRODUCTOS */}
          <div className="bg-purple-card border border-amber-500/30 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="border-b border-purple-800/50 pb-4">
              <h3 className="text-xl font-serif-gold font-bold text-gold-gradient flex items-center gap-2">
                <span>➕</span> Agregar Nuevo Producto al Catálogo
              </h3>
              <p className="text-purple-300 text-xs mt-1">
                Completa los datos del producto. Si no ingresas URL de imagen, se aplicará el diseño placeholder dorado por defecto.
              </p>
            </div>

            <form onSubmit={handleCrearProductoSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-amber-200 mb-1">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Anillo de Oro Aura"
                  value={nuevoProd.nombre}
                  onChange={(e) => setNuevoProd({ ...nuevoProd, nombre: e.target.value })}
                  className="w-full px-3.5 py-2 input-purple rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-200 mb-1">
                  Precio Final ($ ARS) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  placeholder="Ej: 15000"
                  value={nuevoProd.precio_final}
                  onChange={(e) => setNuevoProd({ ...nuevoProd, precio_final: e.target.value })}
                  className="w-full px-3.5 py-2 input-purple rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-200 mb-1">
                  Stock Disponible (Unidades)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Ej: 10"
                  value={nuevoProd.stock}
                  onChange={(e) => setNuevoProd({ ...nuevoProd, stock: e.target.value })}
                  className="w-full px-3.5 py-2 input-purple rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-200 mb-1">
                  Cantidad de Cuotas
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Ej: 3"
                  value={nuevoProd.cuotas_cantidad}
                  onChange={(e) => setNuevoProd({ ...nuevoProd, cuotas_cantidad: e.target.value })}
                  className="w-full px-3.5 py-2 input-purple rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-200 mb-1">
                  Valor de Cada Cuota ($ ARS)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Dejar vacío para cálculo automático"
                  value={nuevoProd.cuotas_valor}
                  onChange={(e) => setNuevoProd({ ...nuevoProd, cuotas_valor: e.target.value })}
                  className="w-full px-3.5 py-2 input-purple rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-200 mb-1">
                  Garantía (Meses)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Ej: 12"
                  value={nuevoProd.garantia_meses}
                  onChange={(e) => setNuevoProd({ ...nuevoProd, garantia_meses: e.target.value })}
                  className="w-full px-3.5 py-2 input-purple rounded-xl text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-amber-200 mb-1">
                  URL de Imagen del Producto (Opcional)
                </label>
                <input
                  type="url"
                  placeholder="https://ejemplo.com/imagen-producto.jpg"
                  value={nuevoProd.imagen}
                  onChange={(e) => setNuevoProd({ ...nuevoProd, imagen: e.target.value })}
                  className="w-full px-3.5 py-2 input-purple rounded-xl text-sm"
                />
              </div>

              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  className="w-full btn-gold py-3 rounded-xl text-sm font-bold cursor-pointer shadow-lg flex items-center justify-center gap-2"
                >
                  <span>✨ Guardar y Publicar Producto en Catálogo</span>
                </button>
              </div>
            </form>
          </div>

          {/* LISTADO Y CONTROL PARA QUITAR/ELIMINAR PRODUCTOS */}
          <div className="bg-purple-card border border-amber-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="border-b border-purple-800/50 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-serif-gold font-bold text-gold-gradient flex items-center gap-2">
                  <span>🗑️</span> Gestión y Eliminación de Productos
                </h3>
                <p className="text-purple-300 text-xs mt-0.5">
                  Lista de productos activos. Haz clic en "Quitar del Catálogo" para remover un elemento.
                </p>
              </div>
              <span className="text-xs font-bold text-amber-300 bg-purple-950 px-3 py-1 rounded-full border border-amber-500/30">
                {productos.length} Productos
              </span>
            </div>

            {cargandoProds ? (
              <p className="text-purple-300 text-center py-6">Cargando lista de productos...</p>
            ) : productos.length === 0 ? (
              <p className="text-purple-400 text-center py-6">No hay productos registrados en el catálogo.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-purple-200">
                  <thead className="bg-purple-950/80 text-amber-300 uppercase font-bold border-b border-purple-800/60">
                    <tr>
                      <th className="py-3 px-3">ID</th>
                      <th className="py-3 px-3">Producto</th>
                      <th className="py-3 px-3">Precio</th>
                      <th className="py-3 px-3">Stock</th>
                      <th className="py-3 px-3 text-right">Acción Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-800/40">
                    {productos.map((prod) => (
                      <tr key={prod.id || prod._id} className="hover:bg-purple-900/30 transition-colors">
                        <td className="py-3 px-3 font-semibold text-amber-400">#{prod.id || prod._id}</td>
                        <td className="py-3 px-3 font-bold text-amber-100">{prod.nombre}</td>
                        <td className="py-3 px-3 text-amber-300 font-bold">${prod.precio_final?.toLocaleString('es-AR')}</td>
                        <td className="py-3 px-3">{prod.stock || 0} u.</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleEliminarProducto(prod.id || prod._id, prod.nombre)}
                            className="bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-200 font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            Quitar 🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
