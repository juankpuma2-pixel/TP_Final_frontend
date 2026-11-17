import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CarritoProvider } from './context/CarritoContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Pie';
import Catalogo from './pages/Catalogo';
import AuthCliente from './pages/AuthCliente';
import AdminAccess from './pages/AdminAccess';
import Carrito from './pages/Carrito';
import MisPedidos from './pages/MisPedidos';
import Arrepentimiento from './pages/Arrepentimiento';
import MisDatos from './pages/MisDatos';

function App() {
  return (
    <AuthProvider>
      <CarritoProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-[#090b0e] text-neutral-100 flex flex-col justify-between selection:bg-[#00ff66] selection:text-[#090b0e]">
            <div>
              <Navbar />
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <Routes>
                  {/* APARTADO 1: Catálogo de Productos */}
                  <Route path="/" element={<Catalogo />} />
                  <Route path="/catalogo" element={<Catalogo />} />

                  {/* APARTADO 2: Autenticación de Usuario (Cliente: Login / Registro) */}
                  <Route path="/autenticacion" element={<AuthCliente />} />
                  <Route path="/login" element={<Navigate to="/autenticacion" replace />} />

                  {/* APARTADO 3: Acceso Administrador (Exclusivo Admin) */}
                  <Route path="/admin" element={<AdminAccess />} />

                  {/* RUTAS SECUNDARIAS DE CLIENTE */}
                  <Route path="/carrito" element={<Carrito />} />
                  <Route path="/mis-pedidos" element={<MisPedidos />} />
                  <Route path="/arrepentimiento" element={<Arrepentimiento />} />
                  <Route path="/mis-datos" element={<MisDatos />} />

                  {/* FALLBACK */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
            {/* Footer de pie de página */}
            <Footer />
          </div>
        </BrowserRouter>
      </CarritoProvider>
    </AuthProvider>
  );
}

export default App;