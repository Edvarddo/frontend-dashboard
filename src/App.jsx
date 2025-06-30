import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Toaster } from "@/components/ui/toaster"
import useAuth from "@/hooks/useAuth";

// Importaciones de componentes
import PublicacionesListado from './components/pages/PublicacionesListado'
import Dashboard from './components/pages/Dashboard'
import Sidebar from './components/Sidebar'
import DetallesPublicacion from './components/pages/DetallesPublicacion'
import Descargar from './components/pages/Descargar'
import Anuncio from './components/pages/Anuncio'
import Reporte from './components/pages/Reporte'
import Mapa from './components/pages/Mapa'
import RespuestasMunicipales from './components/pages/RespuestasMunicipales'
import AnuncioFormulario from './components/AnuncioFormulario'
import Login from './components/pages/Login'
import { PrivateRoute } from './contexts/PrivateRoute'

import './index.css'
import GestionDatos from './components/pages/GestionDatos';
import HistorialModificacionPublicaciones from './components/pages/HistorialModificacionPublicaciones';
import TablaAuditoria from './components/pages/TablaAuditoria';
import CuentaUsuario from './components/pages/CuentaUsuario';
import Kanban from './components/pages/Kanban';

const PrivLayout = ({ children, isOpened, setIsOpened }) => {
  const navigate = useNavigate();
  const { isTokenExpired, setIsTokenExpired, logout } = useAuth();
  const [showExpiredDialog, setShowExpiredDialog] = useState(false);
  useEffect(() => {
    if (isTokenExpired) {
      setShowExpiredDialog(true);
    }
  }, [isTokenExpired]);

  const handleExpiredToken = () => {
    // const navigate = useNavigate();
    setShowExpiredDialog(false);
    setIsTokenExpired(false);
    logout();
    navigate('/login');
  };
  return (
    <>
      <AlertDialog open={showExpiredDialog} onOpenChange={setShowExpiredDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sesión Expirada</AlertDialogTitle>
            <AlertDialogDescription>
              Tu sesión ha expirado. Por favor, inicia sesión nuevamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleExpiredToken}>Aceptar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Sidebar isOpened={isOpened} />
      <div className={`content ${!isOpened ? 'overflow-hidden' : ''}`}>
        <div className="bg-gray-100 min-h-screen min-w-[400px]">
          <Outlet />
        </div>
      </div>
    </>
  );
};

const LayoutWithoutSidebar = ({ children }) => {
  return (
    <>
      {children}
      <Outlet />
    </>
  );
};

function App() {
  
  const [isOpened, setIsOpened] = useState(true);
  
  // const navigate = useNavigate();

  

  return (
    <Router>
      <Toaster />

      <Routes>
        <Route index path="/" element={<Login isOpened={isOpened} setIsOpened={setIsOpened} />} />
        <Route path='/'>
          <Route element={<PrivateRoute />}>
            <Route element={<PrivLayout isOpened={isOpened} setIsOpened={setIsOpened} />}>
              <Route path="/dashboard" element={<Dashboard isOpened={isOpened} setIsOpened={setIsOpened} />} />
              <Route path="/publicacion/:id" element={<DetallesPublicacion isOpened={isOpened} setIsOpened={setIsOpened} />} />
              <Route path="/listado-publicaciones" element={<PublicacionesListado isOpened={isOpened} setIsOpened={setIsOpened} />} />
              <Route path="/descargar" element={<Descargar isOpened={isOpened} setIsOpened={setIsOpened} />} />
              <Route path="/anuncios" element={<Anuncio isOpened={isOpened} setIsOpened={setIsOpened} />} />
              <Route path="/anuncio-formulario" element={<AnuncioFormulario isOpened={isOpened} setIsOpened={setIsOpened} />} />
              <Route path="/reportes" element={<Reporte isOpened={isOpened} setIsOpened={setIsOpened} />} />
              <Route path="/mapa" element={<Mapa isOpened={isOpened} setIsOpened={setIsOpened} />} />
              <Route path="/respuestas-municipales" element={<RespuestasMunicipales isOpened={isOpened} setIsOpened={setIsOpened} />} />
              <Route path='/gestion-datos' element={<GestionDatos isOpened={isOpened} setIsOpened={setIsOpened}/>}/>
              <Route path="/historial-modificacion-publicaciones" element={<HistorialModificacionPublicaciones isOpened={isOpened} setIsOpened={setIsOpened}/>} />
              <Route path="/auditoria" element={<TablaAuditoria isOpened={isOpened} setIsOpened={setIsOpened}/>} />
              <Route path="/cuentas-usuario" element={<CuentaUsuario isOpened={isOpened} setIsOpened={setIsOpened} />} />
              <Route path="/kanban" element={<Kanban isOpened={isOpened} setIsOpened={setIsOpened} />} />
            </Route>
          </Route>
          <Route path="/login" element={<Login isOpened={isOpened} setIsOpened={setIsOpened} />} />
          <Route path="*" element={<h1>404</h1>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

