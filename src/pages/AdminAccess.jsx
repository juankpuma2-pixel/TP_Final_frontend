import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getProductos,
  crearProducto,
  eliminarProducto,
  getPedidosAdmin,
  cambiarEstadoPedido,
  modificarStockProducto,
  DEFAULT_PRODUCT_IMAGE,
} from '../services/api';
import { SubirImagenProducto } from '../components/SubirImagenProducto';
import { urlImagen } from '../utils/imagenes';
import { Link } from 'react-router-dom';

export default function AdminAccess() {
  const { loginAdmin, isAdmin, user, logout } = useAuth();

  // Estado Formulario Login Admin
  const [emailAdmin, setEmailAdmin] = useState('');
  const [passwordAdmin, setPasswordAdmin] = useState('');
  const [cargandoLogin, setCargandoLogin] = useState(false);
  const [errorLogin, setErrorLogin] = useState(null);

  // Pestaña activa del Dashboard ('pedidos' | 'stock' | 'nuevo')
  const [tabAdmin, setTabAdmin] = useState('pedidos');

  // Estado Pedidos
  const [pedidos, setPedidos] = useState([]);
  const [cargandoPedidos, setCargandoPedidos] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('todos'); // 'todos' | 'pendientes' | 'entregado' | 'cancelado'
  const [actualizandoPedidoId, setActualizandoPedidoId] = useState(null);

  // Estado Productos & Stock
  const [productos, setProductos] = useState([]);
  const [cargandoProds, setCargandoProds] = useState(false);
  const [busquedaStock, setBusquedaStock] = useState('');
  const [stockInputs, setStockInputs] = useState({}); // { [prodId]: number }
  const [actualizandoStockId, setActualizandoStockId] = useState(null);
  const [stockGuardadoId, setStockGuardadoId] = useState(null);

  // Notificaciones / Toast
  const [notificacion, setNotificacion] = useState(null); // { tipo: 'exito' | 'error', mensaje: string }

  // Estado del panel de subida de imagen (null = oculto, número = id del producto activo)
  const [subiendoImagenId, setSubiendoImagenId] = useState(null);

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
  const [cargandoCrear, setCargandoCrear] = useState(false);

  const mostrarNotificacion = (tipo, mensaje) => {
    setNotificacion({ tipo, mensaje });
    setTimeout(() => {
      setNotificacion(null);
    }, 4500);
  };

  // Carga de Pedidos desde el Backend
  const cargarListaPedidos = async () => {
    setCargandoPedidos(true);
    try {
      const data = await getPedidosAdmin();
      setPedidos(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error al cargar pedidos admin:', e);
      mostrarNotificacion('error', e.message || 'No se pudieron sincronizar los pedidos del servidor.');
    } finally {
      setCargandoPedidos(false);
    }
  };

  // Carga de Productos desde el Backend
  const cargarListaProductos = async () => {
    setCargandoProds(true);
    try {
      const data = await getProductos({ page: 0, limit: 100 });
      const lista = Array.isArray(data) ? data : [];
      setProductos(lista);

      // Inicializar inputs de stock locales
      const inputsInit = {};
      lista.forEach((p) => {
        const id = p.id ?? p._id;
        inputsInit[id] = p.stock ?? 0;
      });
      setStockInputs(inputsInit);
    } catch (e) {
      console.error('Error al cargar inventario:', e);
      mostrarNotificacion('error', 'Error al sincronizar inventario de productos.');
    } finally {
      setCargandoProds(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      cargarListaPedidos();
      cargarListaProductos();
    }
  }, [isAdmin]);

  // Manejo de Login de Administrador
  const handleAdminLoginSubmit = async (e) => {
    e.preventDefault();
    if (!emailAdmin || !passwordAdmin) {
      setErrorLogin('Por favor, ingresa el correo y la contraseña de administrador.');
      return;
    }

    setCargandoLogin(true);
    setErrorLogin(null);

    try {
      await loginAdmin({ email: emailAdmin, password: passwordAdmin });
      mostrarNotificacion('exito', '¡Autenticación de Administrador TITAN exitosa!');
    } catch (err) {
      setErrorLogin(err.message || 'Acceso denegado: No tienes permisos de administrador.');
    } finally {
      setCargandoLogin(false);
    }
  };

  // ---------------------------------------------------------
  // GESTIÓN DE ESTADOS DE PEDIDOS
  // ---------------------------------------------------------
  const handleCambiarEstado = async (pedidoId, nuevoEstado) => {
    setActualizandoPedidoId(pedidoId);
    try {
      const res = await cambiarEstadoPedido(pedidoId, nuevoEstado);
      const estadoActualizado = res?.estado || nuevoEstado;

      // Actualizar estado localmente de inmediato
      setPedidos((prev) =>
        prev.map((ped) =>
          ped.id === pedidoId ? { ...ped, estado: estadoActualizado } : ped
        )
      );

      mostrarNotificacion(
        'exito',
        `Pedido #${pedidoId} actualizado a "${estadoActualizado.toUpperCase()}".`
      );

      // Si se canceló el pedido, el backend devuelve el stock de las prendas a la BD.
      // Sincronizamos la lista de productos para reflejar el stock recuperado en vivo.
      if (estadoActualizado === 'cancelado') {
        cargarListaProductos();
      }
    } catch (err) {
      mostrarNotificacion('error', err.message || `No se pudo actualizar el pedido #${pedidoId}`);
    } finally {
      setActualizandoPedidoId(null);
    }
  };

  // ---------------------------------------------------------
  // GESTIÓN DE STOCK EN TIEMPO REAL
  // ---------------------------------------------------------
  const handleGuardarStock = async (prodId, nuevoStock) => {
    const stockNormalizado = Math.max(0, parseInt(nuevoStock, 10) || 0);
    setActualizandoStockId(prodId);

    try {
      const res = await modificarStockProducto(prodId, stockNormalizado);
      const stockFinal = res?.stock ?? stockNormalizado;

      // Actualizar lista global de productos
      setProductos((prev) =>
        prev.map((p) =>
          (p.id ?? p._id) === prodId ? { ...p, stock: stockFinal } : p
        )
      );

      // Actualizar valor en el input
      setStockInputs((prev) => ({
        ...prev,
        [prodId]: stockFinal,
      }));

      // Feedback de guardado exitoso
      setStockGuardadoId(prodId);
      setTimeout(() => setStockGuardadoId(null), 1800);

      mostrarNotificacion('exito', `Stock actualizado a ${stockFinal} unidades.`);
    } catch (err) {
      mostrarNotificacion('error', err.message || 'Error al actualizar el stock en el servidor.');
    } finally {
      setActualizandoStockId(null);
    }
  };

  const handleModificarDeltaStock = (prodId, delta) => {
    const actual = stockInputs[prodId] ?? productos.find((p) => (p.id ?? p._id) === prodId)?.stock ?? 0;
    const nuevoValor = Math.max(0, actual + delta);
    setStockInputs((prev) => ({ ...prev, [prodId]: nuevoValor }));
    handleGuardarStock(prodId, nuevoValor);
  };

  // ---------------------------------------------------------
  // CREACIÓN Y ELIMINACIÓN DE PRODUCTOS
  // ---------------------------------------------------------
  const handleCrearProductoSubmit = async (e) => {
    e.preventDefault();
    if (!nuevoProd.nombre.trim() || !nuevoProd.precio_final) {
      mostrarNotificacion('error', 'El nombre y precio final son obligatorios.');
      return;
    }

    setCargandoCrear(true);
    try {
      const payload = {
        nombre: nuevoProd.nombre.trim(),
        precio_final: Number(nuevoProd.precio_final),
        stock: nuevoProd.stock !== '' ? Number(nuevoProd.stock) : 1,
        cuotas_cantidad: nuevoProd.cuotas_cantidad !== '' ? Number(nuevoProd.cuotas_cantidad) : 1,
        cuotas_valor: nuevoProd.cuotas_valor !== '' ? Number(nuevoProd.cuotas_valor) : undefined,
        garantia_meses: nuevoProd.garantia_meses !== '' ? Number(nuevoProd.garantia_meses) : 12,
        imagen: nuevoProd.imagen ? nuevoProd.imagen.trim() : '',
      };

      await crearProducto(payload);
      mostrarNotificacion('exito', `Prenda "${payload.nombre}" publicada exitosamente en el catálogo.`);
      setNuevoProd({
        nombre: '',
        precio_final: '',
        stock: '',
        cuotas_cantidad: '3',
        cuotas_valor: '',
        garantia_meses: '12',
        imagen: '',
      });
      await cargarListaProductos();
      setTabAdmin('stock');
    } catch (err) {
      mostrarNotificacion('error', err.message || 'Error al agregar el producto.');
    } finally {
      setCargandoCrear(false);
    }
  };

  const handleEliminarProducto = async (idProd, nombre) => {
    if (!window.confirm(`¿Seguro que deseas dar de baja "${nombre}" del catálogo oficial?`)) return;
    try {
      await eliminarProducto(idProd);
      mostrarNotificacion('exito', `Prenda "${nombre}" retirada del catálogo.`);
      cargarListaProductos();
    } catch (err) {
      mostrarNotificacion('error', err.message || 'Error al eliminar la prenda.');
    }
  };

  // ---------------------------------------------------------
  // FILTRADO Y MÉTRICAS COMPUTADAS
  // ---------------------------------------------------------
  const pedidosPendientesCount = useMemo(() => {
    return pedidos.filter(
      (p) => p.estado?.toLowerCase() !== 'entregado' && p.estado?.toLowerCase() !== 'cancelado'
    ).length;
  }, [pedidos]);

  const pedidosEntregadosCount = useMemo(() => {
    return pedidos.filter((p) => p.estado?.toLowerCase() === 'entregado').length;
  }, [pedidos]);

  const pedidosCanceladosCount = useMemo(() => {
    return pedidos.filter((p) => p.estado?.toLowerCase() === 'cancelado').length;
  }, [pedidos]);

  const totalFacturacion = useMemo(() => {
    return pedidos
      .filter((p) => p.estado?.toLowerCase() !== 'cancelado')
      .reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
  }, [pedidos]);

  const pedidosFiltrados = useMemo(() => {
    if (filtroEstado === 'pendientes') {
      return pedidos.filter(
        (p) => p.estado?.toLowerCase() !== 'entregado' && p.estado?.toLowerCase() !== 'cancelado'
      );
    }
    if (filtroEstado === 'entregado') {
      return pedidos.filter((p) => p.estado?.toLowerCase() === 'entregado');
    }
    if (filtroEstado === 'cancelado') {
      return pedidos.filter((p) => p.estado?.toLowerCase() === 'cancelado');
    }
    return pedidos;
  }, [pedidos, filtroEstado]);

  const productosFiltrados = useMemo(() => {
    if (!busquedaStock.trim()) return productos;
    const q = busquedaStock.toLowerCase();
    return productos.filter(
      (p) =>
        p.nombre?.toLowerCase().includes(q) ||
        String(p.id ?? p._id).includes(q)
    );
  }, [productos, busquedaStock]);

  const totalUnidadesStock = useMemo(() => {
    return productos.reduce((acc, p) => acc + (Number(p.stock) || 0), 0);
  }, [productos]);

  const stockCriticoCount = useMemo(() => {
    return productos.filter((p) => (Number(p.stock) || 0) <= 5).length;
  }, [productos]);

  // Helper para renderizar badges de estado con diseño deportivo
  const renderBadgeEstado = (estadoRaw) => {
    const estado = (estadoRaw || 'pendiente').toLowerCase();
    if (estado === 'entregado') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 shadow-sm shadow-emerald-500/10">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          Entregado
        </span>
      );
    }
    if (estado === 'cancelado') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-500/15 border border-rose-500/40 text-rose-400 shadow-sm shadow-rose-500/10">
          <span className="w-2 h-2 rounded-full bg-rose-400"></span>
          Cancelado
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/15 border border-amber-500/40 text-amber-300 shadow-sm shadow-amber-500/10">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
        {estado === 'procesando' ? 'Procesando' : 'Pendiente'}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">
      {/* HEADER PRINCIPAL APARTADO 3 */}
      <div className="text-center border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141820] border border-white/10 text-[#00ff66] text-[11px] uppercase font-black tracking-[0.2em] mb-2">
          <span>🛡️</span>
          <span>Titan Command Center • Control de Operaciones</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-wide uppercase mt-1">
          Panel de Administración Pro
        </h1>
        <p className="text-neutral-400 text-xs sm:text-sm mt-1 max-w-2xl mx-auto">
          Gestión centralizada de pedidos de atletas, control de stock en tiempo real y catálogo oficial TITAN COMPRESSION.
        </p>
      </div>

      {/* TOAST FLOTANTE DE NOTIFICACIÓN */}
      {notificacion && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-2xl border flex items-center gap-3 max-w-md transition-all animate-bounce ${
            notificacion.tipo === 'exito'
              ? 'bg-[#0f1914] border-emerald-500/60 text-emerald-300 shadow-emerald-500/20'
              : 'bg-[#1a0f12] border-rose-500/60 text-rose-300 shadow-rose-500/20'
          }`}
        >
          <span className="text-xl">
            {notificacion.tipo === 'exito' ? '✅' : '⚠️'}
          </span>
          <p className="text-xs font-bold leading-snug">{notificacion.mensaje}</p>
          <button
            onClick={() => setNotificacion(null)}
            className="ml-auto text-neutral-400 hover:text-white text-xs cursor-pointer px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* VISTA 1: ACCESO ADMINISTRADOR RESTRINGIDO (LOGIN)       */}
      {/* ======================================================== */}
      {!isAdmin ? (
        <div className="max-w-md mx-auto card-athletic rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#00ff66] via-[#00e5ff] to-neutral-900 rounded-2xl p-0.5 mx-auto mb-3 shadow-lg shadow-[#00ff66]/20">
              <div className="w-full h-full bg-[#0a0c10] rounded-[14px] flex items-center justify-center text-3xl text-[#00ff66]">
                🔒
              </div>
            </div>
            <h2 className="font-display text-xl font-bold text-white uppercase tracking-wider">
              Acceso Exclusivo Administrador
            </h2>
            <p className="text-neutral-400 text-xs mt-1">
              Ingresa tus credenciales autorizadas con rol de Administrador.
            </p>
          </div>

          {errorLogin && (
            <div className="bg-rose-500/10 border border-rose-500/40 text-rose-300 p-4 rounded-xl text-xs font-bold space-y-1">
              <div className="flex items-center gap-2 text-sm text-rose-400">
                <span>🚫</span> <span>Acceso Restringido</span>
              </div>
              <p>{errorLogin}</p>
            </div>
          )}

          <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Email de Administrador
              </label>
              <input
                type="email"
                required
                placeholder="admin@tienda.com"
                value={emailAdmin}
                onChange={(e) => setEmailAdmin(e.target.value)}
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
                value={passwordAdmin}
                onChange={(e) => setPasswordAdmin(e.target.value)}
                className="w-full px-4 py-2.5 input-stealth rounded-xl text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={cargandoLogin}
              className="w-full btn-volt py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all disabled:opacity-50 mt-2 shadow-lg flex items-center justify-center gap-2"
            >
              <span>{cargandoLogin ? 'Verificando credenciales...' : 'Verificar y Acceder como Admin 🛡️'}</span>
            </button>
          </form>

          <div className="border-t border-white/10 pt-4 text-center">
            <p className="text-neutral-400 text-xs">
              ¿Sos usuario cliente? Ir a{' '}
              <Link to="/autenticacion" className="text-[#00ff66] underline font-bold">
                Acceso Atleta (Apartado 2)
              </Link>
            </p>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* VISTA 2: PANEL DE CONTROL ADMINISTRADOR COMPLETO         */
        /* ======================================================== */
        <div className="space-y-8">
          {/* BANNER SUPERIOR CON ESTADO DE SESIÓN */}
          <div className="bg-gradient-to-r from-[#12161f] via-[#151a24] to-[#0f131a] border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 bg-[#00ff66]/10 border border-[#00ff66]/30 rounded-xl flex items-center justify-center text-2xl text-[#00ff66] shadow-[0_0_12px_rgba(0,255,102,0.15)]">
                ⚡
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="font-display text-lg font-bold text-white uppercase tracking-wider">
                    Sesión de Administrador
                  </h2>
                  <span className="bg-[#00ff66]/15 border border-[#00ff66]/40 text-[#00ff66] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66] animate-ping"></span>
                    Activo
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Conectado como: <strong className="text-white">{user?.email || user?.nombre || 'Administrador'}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/" className="btn-outline-volt text-xs px-3.5 py-2 rounded-xl font-bold">
                Ver Catálogo Atletas ⚡
              </Link>
              <button
                onClick={logout}
                className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Cerrar Sesión Admin
              </button>
            </div>
          </div>

          {/* TARJETAS DE MÉTRICAS KPI */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card-athletic rounded-2xl p-4 border-l-4 border-l-amber-400">
              <div className="text-neutral-400 text-[11px] font-bold uppercase tracking-wider">
                Pedidos Pendientes
              </div>
              <div className="text-2xl sm:text-3xl font-display font-black text-amber-400 mt-1">
                {pedidosPendientesCount}
              </div>
              <div className="text-[10px] text-neutral-400 mt-1">Requieren despacho</div>
            </div>

            <div className="card-athletic rounded-2xl p-4 border-l-4 border-l-emerald-500">
              <div className="text-neutral-400 text-[11px] font-bold uppercase tracking-wider">
                Pedidos Entregados
              </div>
              <div className="text-2xl sm:text-3xl font-display font-black text-emerald-400 mt-1">
                {pedidosEntregadosCount}
              </div>
              <div className="text-[10px] text-neutral-400 mt-1">Completados con éxito</div>
            </div>

            <div className="card-athletic rounded-2xl p-4 border-l-4 border-l-[#00ff66]">
              <div className="text-neutral-400 text-[11px] font-bold uppercase tracking-wider">
                Prendas en Inventario
              </div>
              <div className="text-2xl sm:text-3xl font-display font-black text-[#00ff66] mt-1">
                {totalUnidadesStock} <span className="text-xs text-neutral-400">uds</span>
              </div>
              <div className="text-[10px] text-neutral-400 mt-1">{productos.length} modelos activos</div>
            </div>

            <div className="card-athletic rounded-2xl p-4 border-l-4 border-l-cyan-400">
              <div className="text-neutral-400 text-[11px] font-bold uppercase tracking-wider">
                Facturación Efectiva
              </div>
              <div className="text-2xl sm:text-3xl font-display font-black text-white mt-1">
                ${totalFacturacion.toLocaleString('es-AR')}
              </div>
              <div className="text-[10px] text-neutral-400 mt-1">Sin contar pedidos cancelados</div>
            </div>
          </div>

          {/* BARRA DE PESTAÑAS (TABS) DEL DASHBOARD */}
          <div className="flex border-b border-white/10 bg-[#12161f] p-1.5 rounded-2xl gap-2">
            <button
              onClick={() => setTabAdmin('pedidos')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                tabAdmin === 'pedidos'
                  ? 'bg-[#1b222c] text-[#00ff66] border border-[#00ff66]/40 shadow-lg'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>📦</span>
              <span>Gestión de Pedidos</span>
              {pedidosPendientesCount > 0 && (
                <span className="bg-amber-500 text-black font-black text-[10px] px-2 py-0.5 rounded-full">
                  {pedidosPendientesCount} pendientes
                </span>
              )}
            </button>

            <button
              onClick={() => setTabAdmin('stock')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                tabAdmin === 'stock'
                  ? 'bg-[#1b222c] text-[#00ff66] border border-[#00ff66]/40 shadow-lg'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>⚡</span>
              <span>Control de Stock e Inventario</span>
              {stockCriticoCount > 0 && (
                <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {stockCriticoCount} críticos
                </span>
              )}
            </button>

            <button
              onClick={() => setTabAdmin('nuevo')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                tabAdmin === 'nuevo'
                  ? 'bg-[#1b222c] text-[#00ff66] border border-[#00ff66]/40 shadow-lg'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>➕</span>
              <span>Nueva Prenda Pro</span>
            </button>
          </div>

          {/* ======================================================== */}
          {/* SUB-SECCIÓN A: GESTIÓN DE PEDIDOS PENDIENTES & TODOS     */}
          {/* ======================================================== */}
          {tabAdmin === 'pedidos' && (
            <div className="space-y-6">
              {/* FILTROS Y CONTROLES DE PEDIDOS */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#11141b] p-4 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Filtrar por:</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setFiltroEstado('todos')}
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        filtroEstado === 'todos'
                          ? 'bg-[#00ff66] text-black'
                          : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                      }`}
                    >
                      Todos ({pedidos.length})
                    </button>
                    <button
                      onClick={() => setFiltroEstado('pendientes')}
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        filtroEstado === 'pendientes'
                          ? 'bg-amber-400 text-black'
                          : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                      }`}
                    >
                      Pendientes ({pedidosPendientesCount})
                    </button>
                    <button
                      onClick={() => setFiltroEstado('entregado')}
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        filtroEstado === 'entregado'
                          ? 'bg-emerald-500 text-black'
                          : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                      }`}
                    >
                      Entregados ({pedidosEntregadosCount})
                    </button>
                    <button
                      onClick={() => setFiltroEstado('cancelado')}
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        filtroEstado === 'cancelado'
                          ? 'bg-rose-500 text-white'
                          : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                      }`}
                    >
                      Cancelados ({pedidosCanceladosCount})
                    </button>
                  </div>
                </div>

                <button
                  onClick={cargarListaPedidos}
                  disabled={cargandoPedidos}
                  className="text-xs font-bold text-[#00ff66] bg-[#00ff66]/10 hover:bg-[#00ff66]/20 border border-[#00ff66]/30 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span className={cargandoPedidos ? 'animate-spin' : ''}>🔄</span>
                  <span>{cargandoPedidos ? 'Sincronizando...' : 'Actualizar Lista'}</span>
                </button>
              </div>

              {/* LISTA / TARJETAS DE PEDIDOS */}
              {cargandoPedidos && pedidos.length === 0 ? (
                <div className="card-athletic rounded-3xl p-12 text-center text-neutral-400 text-xs">
                  <div className="text-3xl mb-2 animate-bounce">⚡</div>
                  <p>Cargando pedidos de la base de datos...</p>
                </div>
              ) : pedidosFiltrados.length === 0 ? (
                <div className="card-athletic rounded-3xl p-12 text-center text-neutral-400 text-xs space-y-2">
                  <div className="text-3xl">📭</div>
                  <p className="font-bold text-white">No hay pedidos con el filtro seleccionado ({filtroEstado}).</p>
                  <p className="text-neutral-500 text-[11px]">Los pedidos de los usuarios aparecerán aquí en tiempo real.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pedidosFiltrados.map((pedido) => {
                    const id = pedido.id;
                    const estado = (pedido.estado || 'pendiente').toLowerCase();
                    const esEntregado = estado === 'entregado';
                    const esCancelado = estado === 'cancelado';
                    const estaActualizando = actualizandoPedidoId === id;
                    const items = pedido.items || [];

                    return (
                      <div
                        key={id}
                        className={`card-athletic rounded-2xl p-5 border transition-all ${
                          esEntregado
                            ? 'border-emerald-500/30 bg-[#0e1612]'
                            : esCancelado
                            ? 'border-rose-500/30 bg-[#160e10] opacity-80'
                            : 'border-white/10 hover:border-[#00ff66]/40'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
                          {/* INFORMACIÓN DEL PEDIDO */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-sm font-black text-[#00ff66]">
                                #{String(id).padStart(4, '0')}
                              </span>
                              {renderBadgeEstado(estado)}
                              <span className="text-[11px] text-neutral-400">
                                Cliente ID: <strong className="text-white">#{pedido.usuario_id || 1}</strong>
                              </span>
                            </div>
                            <p className="text-xs text-neutral-400">
                              Fecha de Pedido:{' '}
                              <strong className="text-neutral-200">
                                {pedido.creado_en
                                  ? new Date(pedido.creado_en).toLocaleString('es-AR', {
                                      dateStyle: 'medium',
                                      timeStyle: 'short',
                                    })
                                  : 'Fecha no registrada'}
                              </strong>
                            </p>
                          </div>

                          {/* TOTAL Y ACCIONES RÁPIDAS (ENTREGADO / CANCELAR) */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="text-left sm:text-right">
                              <span className="text-[10px] uppercase tracking-wider text-neutral-400 block font-bold">
                                Total Pedido
                              </span>
                              <span className="font-display text-2xl font-black text-white">
                                ${(Number(pedido.total) || 0).toLocaleString('es-AR')}
                              </span>
                            </div>

                            {/* BOTONES RÁPIDOS REQUERIMIENTO 2.a */}
                            <div className="flex items-center gap-2">
                              {/* BOTÓN RÁPIDO: MARCAR COMO ENTREGADO (BADGE VERDE) */}
                              <button
                                onClick={() => handleCambiarEstado(id, 'entregado')}
                                disabled={esEntregado || estaActualizando}
                                className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                                  esEntregado
                                    ? 'bg-emerald-500/10 text-emerald-400/60 border border-emerald-500/20 cursor-default'
                                    : 'bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black border border-emerald-500/50 shadow-lg shadow-emerald-500/20'
                                }`}
                                title="Marcar este pedido como entregado"
                              >
                                <span>{esEntregado ? '✓' : '🚀'}</span>
                                <span>{estaActualizando ? 'Guardando...' : esEntregado ? 'Entregado' : 'Marcar como Entregado'}</span>
                              </button>

                              {/* BOTÓN RÁPIDO: CANCELAR PEDIDO (BADGE ROJO) */}
                              <button
                                onClick={() => {
                                  if (window.confirm(`¿Confirmas la cancelación del Pedido #${id}? El stock se devolverá automáticamente al catálogo.`)) {
                                    handleCambiarEstado(id, 'cancelado');
                                  }
                                }}
                                disabled={esCancelado || estaActualizando}
                                className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                                  esCancelado
                                    ? 'bg-rose-500/10 text-rose-400/60 border border-rose-500/20 cursor-default'
                                    : 'bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/50 shadow-lg shadow-rose-500/20'
                                }`}
                                title="Cancelar pedido y reponer stock"
                              >
                                <span>{esCancelado ? '✕' : '🚫'}</span>
                                <span>{estaActualizando ? 'Guardando...' : esCancelado ? 'Cancelado' : 'Cancelar Pedido'}</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* DESGLOSE DE ITEMS DEL PEDIDO */}
                        <div className="pt-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                            Prendas del Pedido ({items.length}):
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {items.map((item, idx) => (
                              <div
                                key={idx}
                                className="bg-[#14171f] border border-white/5 p-2 rounded-xl text-xs flex items-center justify-between"
                              >
                                <div>
                                  <span className="font-bold text-white block">
                                    Prenda #{item.producto_id}
                                  </span>
                                  <span className="text-[11px] text-neutral-400">
                                    Cant: <strong className="text-[#00ff66]">{item.cantidad} u.</strong>
                                  </span>
                                </div>
                                <span className="font-display font-bold text-neutral-300">
                                  ${(Number(item.precio_unitario) || 0).toLocaleString('es-AR')}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* SUB-SECCIÓN B: GESTIÓN DE PRODUCTOS Y STOCK EN VIVO     */}
          {/* ======================================================== */}
          {tabAdmin === 'stock' && (
            <div className="space-y-6">
              {/* BARRA DE BÚSQUEDA Y CONTROL DE INVENTARIO */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#11141b] p-4 rounded-2xl border border-white/10">
                <div className="w-full sm:w-80">
                  <input
                    type="text"
                    placeholder="🔍 Buscar prenda por nombre o ID..."
                    value={busquedaStock}
                    onChange={(e) => setBusquedaStock(e.target.value)}
                    className="w-full px-3.5 py-2 input-stealth rounded-xl text-xs"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-neutral-400">
                    Mostrando <strong className="text-[#00ff66]">{productosFiltrados.length}</strong> de {productos.length} prendas
                  </span>
                  <button
                    onClick={cargarListaProductos}
                    disabled={cargandoProds}
                    className="text-xs font-bold text-[#00ff66] bg-[#00ff66]/10 hover:bg-[#00ff66]/20 border border-[#00ff66]/30 px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span className={cargandoProds ? 'animate-spin' : ''}>🔄</span>
                    <span>Actualizar Stock</span>
                  </button>
                </div>
              </div>

              {/* TABLA DE PRODUCTOS CON CONTROL DE STOCK EN TIEMPO REAL */}
              {cargandoProds && productos.length === 0 ? (
                <div className="card-athletic rounded-3xl p-12 text-center text-neutral-400 text-xs">
                  <div className="text-3xl mb-2 animate-bounce">⚡</div>
                  <p>Cargando catálogo e inventario...</p>
                </div>
              ) : productosFiltrados.length === 0 ? (
                <div className="card-athletic rounded-3xl p-12 text-center text-neutral-400 text-xs space-y-2">
                  <div className="text-3xl">📦</div>
                  <p className="font-bold text-white">No se encontraron productos con el término de búsqueda.</p>
                </div>
              ) : (
                <div className="card-athletic rounded-3xl overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-neutral-300">
                      <thead className="bg-[#121620] text-[#00ff66] uppercase font-black tracking-wider border-b border-white/10">
                        <tr>
                          <th className="py-3.5 px-4">Prenda</th>
                          <th className="py-3.5 px-3">Precio Final</th>
                          <th className="py-3.5 px-3">Estado Stock</th>
                          <th className="py-3.5 px-4 text-center">Cambiar Stock en Vivo (Input / + / -)</th>
                          <th className="py-3.5 px-4 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {productosFiltrados.map((prod) => {
                          const id = prod.id ?? prod._id;
                          const stockActual = prod.stock ?? 0;
                          const stockEnInput = stockInputs[id] !== undefined ? stockInputs[id] : stockActual;
                          const estaGuardando = actualizandoStockId === id;
                          const fueGuardado = stockGuardadoId === id;

                          // Badges de estado de inventario
                          let badgeStock;
                          if (stockActual === 0) {
                            badgeStock = (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500/15 text-rose-400 border border-rose-500/30">
                                Agotado (0)
                              </span>
                            );
                          } else if (stockActual <= 5) {
                            badgeStock = (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                Stock Bajo ({stockActual})
                              </span>
                            );
                          } else {
                            badgeStock = (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                En Stock ({stockActual})
                              </span>
                            );
                          }

                          return (
                            <>
                            <tr key={id} className="hover:bg-white/[0.02] transition-colors">
                              {/* PRENDA / IMAGEN */}
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/10 bg-[#0d0f14] flex-shrink-0 aspect-square">
                                    {urlImagen(prod) ? (
                                      <img
                                        src={urlImagen(prod)}
                                        alt={prod.nombre}
                                        loading="lazy"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          e.currentTarget.onerror = null;
                                          e.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                                        }}
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-[#10131a] text-neutral-600 text-[9px] font-bold uppercase tracking-wider text-center p-1">
                                        Sin imagen
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <span className="font-mono text-[10px] text-neutral-400 font-bold block">
                                      ID #{id}
                                    </span>
                                    <span className="font-bold text-white text-sm line-clamp-1">
                                      {prod.nombre}
                                    </span>
                                    <span className="text-[10px] text-neutral-400">
                                      {prod.cuotas_cantidad || 3} cuotas de ${(prod.cuotas_valor || Math.round((prod.precio_final || 0)/3)).toLocaleString('es-AR')}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* PRECIO FINAL */}
                              <td className="py-3 px-3">
                                <span className="font-display font-black text-sm text-white">
                                  ${(Number(prod.precio_final) || 0).toLocaleString('es-AR')}
                                </span>
                              </td>

                              {/* ESTADO STOCK */}
                              <td className="py-3 px-3">
                                {badgeStock}
                              </td>

                              {/* CONTROL DE STOCK EN TIEMPO REAL: INPUT Y BOTONES (+ / -) */}
                              <td className="py-3 px-4">
                                <div className="flex items-center justify-center gap-2">
                                  {/* BOTÓN RESTAR (-) */}
                                  <button
                                    onClick={() => handleModificarDeltaStock(id, -1)}
                                    disabled={stockEnInput <= 0 || estaGuardando}
                                    className="w-8 h-8 rounded-lg bg-[#1a1f29] hover:bg-rose-500/20 hover:text-rose-400 border border-white/10 hover:border-rose-500/40 text-neutral-300 font-black text-sm flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                    title="Restar 1 unidad al stock"
                                  >
                                    -
                                  </button>

                                  {/* INPUT NUMÉRICO DIRECTO EN TIEMPO REAL */}
                                  <div className="relative">
                                    <input
                                      type="number"
                                      min="0"
                                      value={stockEnInput}
                                      onChange={(e) => {
                                        const v = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                                        setStockInputs((prev) => ({ ...prev, [id]: v }));
                                      }}
                                      onBlur={(e) => {
                                        const val = parseInt(e.target.value, 10);
                                        if (!isNaN(val) && val !== stockActual) {
                                          handleGuardarStock(id, val);
                                        }
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          const val = parseInt(e.target.value, 10);
                                          if (!isNaN(val)) {
                                            handleGuardarStock(id, val);
                                          }
                                        }
                                      }}
                                      disabled={estaGuardando}
                                      className="w-18 px-2 py-1.5 text-center font-mono font-black text-sm rounded-lg input-stealth bg-[#0f1218] border-white/20 focus:border-[#00ff66]"
                                    />
                                  </div>

                                  {/* BOTÓN SUMAR (+) */}
                                  <button
                                    onClick={() => handleModificarDeltaStock(id, 1)}
                                    disabled={estaGuardando}
                                    className="w-8 h-8 rounded-lg bg-[#1a1f29] hover:bg-[#00ff66]/20 hover:text-[#00ff66] border border-white/10 hover:border-[#00ff66]/40 text-neutral-300 font-black text-sm flex items-center justify-center transition-colors disabled:opacity-30 cursor-pointer"
                                    title="Sumar 1 unidad al stock"
                                  >
                                    +
                                  </button>

                                  {/* INDICADOR EN VIVO DE GUARDADO */}
                                  <div className="w-6 text-center">
                                    {estaGuardando ? (
                                      <span className="text-xs text-[#00ff66] animate-spin inline-block">⌛</span>
                                    ) : fueGuardado ? (
                                      <span className="text-xs text-[#00ff66] font-black" title="Guardado con éxito">✓</span>
                                    ) : (
                                      stockEnInput !== stockActual && (
                                        <button
                                          onClick={() => handleGuardarStock(id, stockEnInput)}
                                          className="text-[10px] bg-[#00ff66] text-black px-1.5 py-0.5 rounded font-black uppercase cursor-pointer"
                                          title="Guardar cambio"
                                        >
                                          OK
                                        </button>
                                      )
                                    )}
                                  </div>
                                </div>
                              </td>

                               {/* ACCIONES (SUBIR IMAGEN + DAR DE BAJA) */}
                              <td className="py-3 px-4 text-right">
                                <div className="flex flex-col items-end gap-1.5">
                                  <button
                                    onClick={() =>
                                      setSubiendoImagenId((prev) => (prev === id ? null : id))
                                    }
                                    className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                                      subiendoImagenId === id
                                        ? 'bg-[#00ff66]/20 border-[#00ff66]/50 text-[#00ff66]'
                                        : 'bg-[#00ff66]/10 hover:bg-[#00ff66]/20 border-[#00ff66]/30 text-[#00ff66]'
                                    }`}
                                    title="Subir imagen para esta prenda"
                                  >
                                    {subiendoImagenId === id ? '✕ Cerrar' : '📷 Imagen'}
                                  </button>
                                  <button
                                    onClick={() => handleEliminarProducto(id, prod.nombre)}
                                    className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer text-[11px]"
                                    title="Quitar prenda del catálogo"
                                  >
                                    Quitar 🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>
                            {/* Panel de subida de imagen inline, visible solo cuando este producto está activo */}
                            {subiendoImagenId === id && (
                              <tr key={`img-panel-${id}`} className="bg-[#0d1017]">
                                <td colSpan={5} className="px-6 py-4">
                                  <SubirImagenProducto
                                    productoId={id}
                                    productoNombre={prod.nombre}
                                    onSuccess={(productoActualizado) => {
                                      mostrarNotificacion(
                                        'exito',
                                        `Imagen actualizada para "${prod.nombre}".`
                                      );
                                      setSubiendoImagenId(null);
                                      cargarListaProductos();
                                    }}
                                    onCancelar={() => setSubiendoImagenId(null)}
                                  />
                                </td>
                              </tr>
                            )}
                            </>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* SUB-SECCIÓN C: FORMULARIO PUBLICAR NUEVA PRENDA         */}
          {/* ======================================================== */}
          {tabAdmin === 'nuevo' && (
            <div className="card-athletic rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h3 className="text-xl font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span>➕</span> Registrar Nueva Prenda Pro-Fit
                </h3>
                <p className="text-neutral-400 text-xs mt-1">
                  Ingresa las especificaciones del nuevo equipamiento. Se sincronizará inmediatamente en el catálogo oficial de la tienda.
                </p>
              </div>

              <form onSubmit={handleCrearProductoSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                    Nombre de la Prenda *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Titan Armor Camiseta Compresión 2.0"
                    value={nuevoProd.nombre}
                    onChange={(e) => setNuevoProd({ ...nuevoProd, nombre: e.target.value })}
                    className="w-full px-3.5 py-2.5 input-stealth rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                    Precio Final ($ ARS) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="Ej: 34500"
                    value={nuevoProd.precio_final}
                    onChange={(e) => setNuevoProd({ ...nuevoProd, precio_final: e.target.value })}
                    className="w-full px-3.5 py-2.5 input-stealth rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                    Stock Inicial (Unidades)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Ej: 15"
                    value={nuevoProd.stock}
                    onChange={(e) => setNuevoProd({ ...nuevoProd, stock: e.target.value })}
                    className="w-full px-3.5 py-2.5 input-stealth rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                    Cantidad de Cuotas
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Ej: 6"
                    value={nuevoProd.cuotas_cantidad}
                    onChange={(e) => setNuevoProd({ ...nuevoProd, cuotas_cantidad: e.target.value })}
                    className="w-full px-3.5 py-2.5 input-stealth rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                    Valor de Cada Cuota ($ ARS)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Dejar vacío para cálculo automático"
                    value={nuevoProd.cuotas_valor}
                    onChange={(e) => setNuevoProd({ ...nuevoProd, cuotas_valor: e.target.value })}
                    className="w-full px-3.5 py-2.5 input-stealth rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                    Garantía Oficial (Meses)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Ej: 12"
                    value={nuevoProd.garantia_meses}
                    onChange={(e) => setNuevoProd({ ...nuevoProd, garantia_meses: e.target.value })}
                    className="w-full px-3.5 py-2.5 input-stealth rounded-xl text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                    URL de Imagen de Alta Resolución (Opcional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={nuevoProd.imagen}
                    onChange={(e) => setNuevoProd({ ...nuevoProd, imagen: e.target.value })}
                    className="w-full px-3.5 py-2.5 input-stealth rounded-xl text-sm"
                  />
                  <p className="text-[10px] text-neutral-500 mt-1">
                    Si no colocas una URL, se generará el placeholder oficial deportivo TITAN COMPRESSION automáticamente.
                  </p>
                </div>

                <div className="md:col-span-2 pt-2">
                  <button
                    type="submit"
                    disabled={cargandoCrear}
                    className="w-full btn-volt py-3.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span>{cargandoCrear ? 'Publicando en catálogo...' : '⚡ Publicar Prenda en Catálogo Oficial'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
