import PublicacionesListado from './components/pages/PublicacionesListado'
import Dashboard from './components/pages/Dashboard'
import Sidebar from './components/Sidebar'
import DetallesPublicacion from './components/pages/DetallesPublicacion'
import Descargar from './components/pages/Descargar'
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
          {children}
          <Outlet />
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
               
                <Route element={
                  <PrivateRoute>
                    <PrivLayout isOpened={isOpened} setIsOpened={setIsOpened} />
                   
                  </PrivateRoute>
                  }>
                    {/* <Route path="/" element={<PublicacionesListado isOpened={isOpened} setIsOpened={setIsOpened} />} /> */}
                    <Route path="/dashboard" element={<Dashboard isOpened={isOpened} setIsOpened={setIsOpened} />}/>
                      
                    <Route path="/listado-publicaciones" element={<PublicacionesListado isOpened={isOpened} setIsOpened={setIsOpened} />} />
                    <Route path="/publicacion/:id" element={<DetallesPublicacion isOpened={isOpened} setIsOpened={setIsOpened} />} />
                    <Route path="/descargar" element={<Descargar isOpened={isOpened} setIsOpened={setIsOpened} />} />
                </Route>

    
                <Route element={<LayoutWithoutSidebar />}>
                    <Route index path="/" element={<Login isOpened={isOpened} setIsOpened={setIsOpened} />} />
                </Route>
            </Routes>
        </Router>





    </>
  )
}

export default App
