import { useState, useEffect } from 'react';
import { getProductos, eliminarProducto } from '../services/api';
import ProductCard from '../components/ProductCard';
import { DetalleProductoModal } from '../components/DetalleProducto';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [page, setPage] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('todos');
  const [cargando, setCargando] = useState(true);
  const [errorApi, setErrorApi] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [productoDetalle, setProductoDetalle] = useState(null);
  const { isAdmin } = useAuth();
  const limit = 4;

  const categorias = [
    { id: 'todos', label: 'Toda la Colección' },
    { id: 'camiseta', label: 'Camisetas Pro' },
    { id: 'calza', label: 'Calzas & Tights' },
    { id: 'short', label: 'Shorts 2-en-1' },
    { id: 'accesorios', label: 'Manguitas & Soporte' },
  ];

  const cargarCatalog = () => {
    setCargando(true);
    setErrorApi(null);

    // Si hay una categoría seleccionada y no es 'todos', concatenamos la búsqueda
    let queryNombre = busqueda;
    if (categoria !== 'todos' && !busqueda) {
      if (categoria === 'camiseta') queryNombre = 'Camiseta';
      else if (categoria === 'calza') queryNombre = 'Calza';
      else if (categoria === 'short') queryNombre = 'Short';
      else if (categoria === 'accesorios') queryNombre = 'Sleeve';
    }

    getProductos({ page, limit, nombre: queryNombre })
      .then((data) => {
        if (data && Array.isArray(data)) {
          setProductos(data);
        } else {
          setProductos([]);
        }
      })
      .catch((error) => {
        console.error('Error al cargar productos:', error);
        setErrorApi('No se pudo establecer conexión con el servidor. Verifica que el backend esté en ejecución.');
      })
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarCatalog();
  }, [page, busqueda, categoria]);

  const handleBusqueda = (e) => {
    setPage(0);
    setBusqueda(e.target.value);
  };

  const handleCategoriaChange = (catId) => {
    setPage(0);
    setCategoria(catId);
  };

  const handleAnterior = () => {
    if (page > 0) setPage(page - 1);
  };

  const handleSiguiente = () => {
    setPage(page + 1);
  };

  const handleEliminar = async (idProducto) => {
    if (!window.confirm("¿Confirmas que deseas retirar este producto de la colección?")) return;
    try {
      await eliminarProducto(idProducto);
      setMensaje("Prenda eliminada del catálogo exitosamente.");
      cargarCatalog();
      setTimeout(() => setMensaje(null), 4000);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-12 py-4">
      
      {/* ========================================================
          HERO BANNER PRINCIPAL: HIGH PERFORMANCE COMPRESSION
          ======================================================== */}
      <section className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#12151c] via-[#0d0f14] to-[#07080b] shadow-2xl p-6 sm:p-10 lg:p-14">
        {/* Luces Neón de fondo atmosféricas */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00ff66]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#00e5ff]/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Patrón de líneas técnicas deportivas */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00ff66]/10 border border-[#00ff66]/30 text-[#00ff66] text-xs font-black tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-ping"></span>
            <span>Tecnología de Compresión Avanzada 2.0</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase leading-none">
            Lleva tu Rendimiento <br />
            <span className="text-gradient-volt">al Límite Absoluto</span>
          </h1>

          <p className="text-neutral-300 text-sm sm:text-base leading-relaxed max-w-2xl font-medium">
            Prendas biomecánicas de compresión graduada diseñadas para maximizar el flujo sanguíneo, 
            estabilizar articulaciones y reducir la fatiga muscular en entrenamientos de alto impacto.
          </p>

          {/* BOTONES DE LLAMADA A LA ACCIÓN (CTA) */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="#coleccion"
              className="btn-volt px-6 py-3.5 rounded-xl text-xs sm:text-sm font-black tracking-wider flex items-center gap-2 shadow-xl shadow-[#00ff66]/20 cursor-pointer"
            >
              <span>Explorar Colección</span>
              <span className="text-base">⚡</span>
            </a>
            <Link
              to="/autenticacion"
              className="btn-outline-volt px-5 py-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer"
            >
              <span>Beneficios Atleta</span>
              <span>🛡️</span>
            </Link>
          </div>

          {/* FEATURES DEPORTIVAS DE ALTO IMPACTO */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-lg text-[#00ff66]">⚡</span>
              <div className="text-[11px] leading-tight">
                <strong className="text-white block font-bold">Compresión 4D</strong>
                <span className="text-neutral-400">Soporte Graduado</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg text-[#00e5ff]">❄️</span>
              <div className="text-[11px] leading-tight">
                <strong className="text-white block font-bold">Dry-Fit 3X</strong>
                <span className="text-neutral-400">Termorregulación</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg text-[#ff3344]">🛡️</span>
              <div className="text-[11px] leading-tight">
                <strong className="text-white block font-bold">Anti-Fatiga</strong>
                <span className="text-neutral-400">Recuperación 2x</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg text-[#00ff66]">🚀</span>
              <div className="text-[11px] leading-tight">
                <strong className="text-white block font-bold">Envío 24/48 hs</strong>
                <span className="text-neutral-400">A todo el país</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          BARRA DE FILTRADO, BÚSQUEDA Y CONTROL ADMIN
          ======================================================== */}
      <div id="coleccion" className="space-y-6 pt-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#00ff66] rounded-sm"></span>
              <span className="text-xs uppercase tracking-[0.2em] text-[#00ff66] font-black">
                Catálogo Oficial TITAN
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-white tracking-wide uppercase mt-1">
              Prendas de Alto Rendimiento
            </h2>
          </div>

          {isAdmin && (
            <Link
              to="/admin"
              className="btn-volt text-xs px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 self-start md:self-auto shadow-md"
            >
              <span>⚙️ Panel de Gestión Admin</span>
            </Link>
          )}
        </div>

        {/* NOTIFICACIÓN ADMIN TEMPORAL */}
        {mensaje && (
          <div className="bg-[#00ff66]/10 border border-[#00ff66]/40 text-[#00ff66] p-4 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2">
            <span>✅</span>
            <span>{mensaje}</span>
          </div>
        )}

        {/* BÚSQUEDA Y PILLS DE CATEGORÍAS */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Búsqueda */}
          <div className="w-full lg:max-w-md relative">
            <input
              type="text"
              placeholder="Buscar prenda de compresión por nombre..."
              value={busqueda}
              onChange={handleBusqueda}
              className="w-full pl-10 pr-4 py-3 input-stealth rounded-xl text-sm placeholder-neutral-500 font-medium"
            />
            <span className="absolute left-3.5 top-3.5 text-neutral-400 text-sm">🔍</span>
          </div>

          {/* Categorías Rápidas */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {categorias.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoriaChange(cat.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  categoria === cat.id
                    ? 'bg-[#00ff66] text-[#0a0b0e] shadow-[0_0_12px_rgba(0,255,102,0.35)]'
                    : 'bg-[#15181f] text-neutral-300 hover:text-white hover:bg-[#1e232d] border border-white/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================
            GRILLA DE PRODUCTOS / SKELETONS / ERROR STATE
            ======================================================== */}
        {cargando ? (
          /* Skeletons de carga deportivos */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="card-athletic rounded-2xl p-4 space-y-4 animate-pulse">
                <div className="w-full h-56 bg-white/5 rounded-xl"></div>
                <div className="h-4 bg-white/10 rounded w-3/4"></div>
                <div className="h-6 bg-white/10 rounded w-1/2"></div>
                <div className="h-10 bg-white/5 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : errorApi ? (
          /* Estado de error claro con botón de reintento */
          <div className="py-14 text-center card-athletic rounded-3xl p-8 max-w-xl mx-auto space-y-4 border border-red-500/30">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center text-3xl mx-auto text-red-400">
              ⚠️
            </div>
            <h3 className="font-display text-xl font-bold text-white uppercase">
              Servidor No Disponible
            </h3>
            <p className="text-neutral-300 text-xs leading-relaxed">
              {errorApi}
            </p>
            <div className="pt-2">
              <button
                onClick={cargarCatalog}
                className="btn-volt px-5 py-2.5 rounded-xl text-xs font-black cursor-pointer shadow-lg inline-flex items-center gap-2"
              >
                <span>Reintentar Conexión</span>
                <span>🔄</span>
              </button>
            </div>
          </div>
        ) : (
          /* Listado de Productos */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productos && productos.length > 0 ? (
              productos.map((producto, index) => (
                <ProductCard
                  key={producto.id || producto._id || index}
                  producto={producto}
                  onEliminar={handleEliminar}
                  onVerDetalle={(prod) => setProductoDetalle(prod)}
                  isAdmin={isAdmin}
                  {...producto}
                />
              ))
            ) : (
              <div className="col-span-full py-16 text-center card-athletic rounded-2xl p-8 border border-white/10">
                <span className="text-4xl">⚡</span>
                <p className="font-display text-lg font-bold text-white mt-3 uppercase">
                  No se encontraron prendas con ese filtro
                </p>
                <p className="text-neutral-400 text-xs mt-1">
                  Intenta cambiar el término de búsqueda o selecciona "Toda la Colección".
                </p>
                <button
                  onClick={() => { setBusqueda(''); setCategoria('todos'); }}
                  className="mt-4 px-4 py-2 btn-outline-volt rounded-xl text-xs font-bold cursor-pointer"
                >
                  Restablecer Filtros
                </button>
              </div>
            )}
          </div>
        )}

        {/* CONTROLES DE PAGINACIÓN */}
        <div className="flex items-center justify-between border-t border-white/10 pt-6">
          <button
            onClick={handleAnterior}
            disabled={page === 0 || cargando}
            className="px-5 py-2.5 bg-[#14171d] text-neutral-300 border border-white/10 rounded-xl font-bold text-xs uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#1a1f27] hover:text-[#00ff66] transition-colors cursor-pointer"
          >
            ← Anterior
          </button>
          <span className="text-xs font-black tracking-wider text-[#00ff66] bg-[#14171d] px-4 py-1.5 rounded-full border border-white/10 uppercase">
            Página {page + 1}
          </span>
          <button
            onClick={handleSiguiente}
            disabled={productos.length < limit || cargando}
            className="px-5 py-2.5 btn-volt rounded-xl text-xs font-black uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            Siguiente →
          </button>
        </div>
      </div>
      {/* Modal de Vista de Detalle del Producto */}
      <DetalleProductoModal
        producto={productoDetalle}
        isOpen={!!productoDetalle}
        onClose={() => setProductoDetalle(null)}
      />
    </div>
  );
}