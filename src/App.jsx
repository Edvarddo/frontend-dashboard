import PublicacionesListado from './components/pages/PublicacionesListado'
import Dashboard from './components/pages/Dashboard'
import Sidebar from './components/Sidebar'
import DetallesPublicacion from './components/pages/DetallesPublicacion'
import Descargar from './components/pages/Descargar'
import Anuncio from './components/pages/Anuncio'
import Reporte from './components/pages/Reporte'
import Mapa from './components/pages/Mapa'
import axios from 'axios'
import { BrowserRouter as Router, Routes, Route, Outlet  } from 'react-router-dom'
import './index.css'
import { useEffect, useState, useContext } from 'react'
import Login from './components/pages/Login'
import { PrivateRoute } from './contexts/PrivateRoute'

import  AuthContext  from './contexts/AuthContext'
const PrivLayout = ({ children, isOpened, setIsOpened }) => {
  return (
    <>
    
          <Sidebar isOpened={isOpened} />
      <div className={`content ${!isOpened ? 'overflow-hidden' : ''}`}>
        <div className="bg-gray-100 min-h-screen min-w-[400px]">
          {/* {children} */}
          <Outlet />

        </div>
      </div>

   
    
    </>
  );
};

// Layout sin Sidebar
const LayoutWithoutSidebar = ({ children }) => {
  return (
    <>
      {children}
      <Outlet />
    
    </>
  );
};
function App() {
  // TEMPORAL
  const useAuth = useContext(AuthContext)
  // console.log(useAuth())
  const [isOpened, setIsOpened] = useState(true)
  const url = "http://3.217.85.102/api/v1/publicaciones/"
  return (
    <>
      <Router>
            <Routes>
            <Route index path="/" element={<Login isOpened={isOpened} setIsOpened={setIsOpened} />} />
               <Route path='/'>
                  {/* PRIVATE ROUTES */}
                  <Route element={<PrivLayout isOpened={isOpened} setIsOpened={setIsOpened} />}>
                    <Route element={<PrivateRoute />}>
                      <Route path="/dashboard" element={<Dashboard isOpened={isOpened} setIsOpened={setIsOpened} />}/>
                      <Route path="/publicacion/:id" element={<DetallesPublicacion isOpened={isOpened} setIsOpened={setIsOpened} />} />
                        <Route path="/listado-publicaciones" element={<PublicacionesListado isOpened={isOpened} setIsOpened={setIsOpened} />} />
                      <Route path="/descargar" element={<Descargar isOpened={isOpened} setIsOpened={setIsOpened} />} />
                      <Route path="/anuncios" element={<Anuncio isOpened={isOpened} setIsOpened={setIsOpened} />} />
                      <Route path="/reportes" element={<Reporte isOpened={isOpened} setIsOpened={setIsOpened} />} />
                      <Route path="/mapa" element={<Mapa isOpened={isOpened} setIsOpened={setIsOpened} />} />

                    </Route> 
                  </Route>
                  {/* PUBLIC ROUTES */}
                  <Route index path="/login" element={<Login isOpened={isOpened} setIsOpened={setIsOpened} />} />
                  {/* MISSING */}
                  <Route path="*" element={<h1>404</h1>} />
               </Route>

    
                
                
            </Routes>
        </Router>





    </>
  )
}

export default App
