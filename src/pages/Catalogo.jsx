import { useState, useEffect } from 'react';
import { getProductos, eliminarProducto } from '../services/api';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [page, setPage] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState(null);
  const { isAdmin } = useAuth();
  const limit = 4;

  const cargarCatalog = () => {
    setCargando(true);
    getProductos({ page, limit, nombre: busqueda })
      .then((data) => {
        if (data) setProductos(data);
      })
      .catch((error) => console.error('Error al cargar productos:', error))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarCatalog();
  }, [page, busqueda]);

  const handleBusqueda = (e) => {
    setPage(0);
    setBusqueda(e.target.value);
  };

  const handleAnterior = () => {
    if (page > 0) setPage(page - 1);
  };

  const handleSiguiente = () => {
    setPage(page + 1);
  };

  const handleEliminar = async (idProducto) => {
    if (!window.confirm("¿Confirmas que deseas quitar este producto del catálogo?")) return;
    try {
      await eliminarProducto(idProducto);
      setMensaje("Producto eliminado del catálogo correctamente.");
      cargarCatalog();
      setTimeout(() => setMensaje(null), 4000);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8 py-6">
      
      {/* HEADER DEL CATÁLOGO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-amber-500/20 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">
            Apartado 1 • Colección Exclusiva
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif-gold font-bold text-gold-gradient tracking-wide mt-1">
            Catálogo de Productos
          </h1>
          <p className="text-purple-300 text-sm mt-1">
            Explora nuestros productos con imágenes, precios finales y facilidades de pago en cuotas.
          </p>
        </div>

        {/* SI ES ADMIN, SE MUESTRA UN BOTÓN RAPIDO DE GESTIÓN DE PRODUCTOS */}
        {isAdmin && (
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="btn-gold text-xs px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg"
            >
              <span>⚙️ Panel de Gestión Admin</span>
            </Link>
          </div>
        )}
      </div>

      {/* BANNER NOTIFICACIÓN ADMIN */}
      {mensaje && (
        <div className="bg-amber-950/80 border border-amber-500/50 text-amber-200 p-4 rounded-xl text-sm font-semibold shadow-lg">
          ✅ {mensaje}
        </div>
      )}

      {/* BARRA DE BÚSQUEDA Y FILTRADO */}
      <div className="max-w-md relative">
        <input
          type="text"
          placeholder="Buscar producto por nombre..."
          value={busqueda}
          onChange={handleBusqueda}
          className="w-full pl-10 pr-4 py-3 input-purple rounded-xl text-sm placeholder-purple-400/60 focus:ring-2 focus:ring-amber-500/40"
        />
        <span className="absolute left-3.5 top-3.5 text-amber-400 text-sm">🔍</span>
      </div>

      {/* GRILLA DE PRODUCTOS */}
      {cargando ? (
        <div className="text-center py-16">
          <div className="inline-block w-10 h-10 border-4 border-amber-500/20 border-t-amber-400 rounded-full animate-spin mb-3"></div>
          <p className="text-purple-300 font-medium">Cargando productos del catálogo...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productos && productos.length > 0 ? (
            productos.map((producto, index) => (
              <ProductCard
                key={producto.id || producto._id || index}
                producto={producto}
                onEliminar={handleEliminar}
                isAdmin={isAdmin}
                {...producto}
              />
            ))
          ) : (
            <div className="col-span-full py-16 text-center bg-purple-950/40 border border-purple-800/30 rounded-2xl">
              <span className="text-4xl">🛍️</span>
              <p className="text-purple-300 font-semibold mt-2">No se encontraron productos en el catálogo.</p>
              <p className="text-purple-400/70 text-xs mt-1">Prueba realizando una nueva búsqueda.</p>
            </div>
          )}
        </div>
      )}

      {/* CONTROLES DE PAGINACIÓN */}
      <div className="flex items-center justify-between border-t border-purple-800/40 pt-6">
        <button
          onClick={handleAnterior}
          disabled={page === 0 || cargando}
          className="px-5 py-2.5 bg-purple-900/60 text-purple-200 border border-amber-500/20 rounded-xl font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-purple-800/80 hover:text-amber-300 transition-colors"
        >
          ← Anterior
        </button>
        <span className="text-sm font-bold text-amber-300 bg-purple-950/80 px-4 py-1.5 rounded-full border border-amber-500/30">
          Página {page + 1}
        </span>
        <button
          onClick={handleSiguiente}
          disabled={productos.length < limit || cargando}
          className="px-5 py-2.5 btn-gold rounded-xl text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}