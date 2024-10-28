import PublicacionesListado from './components/pages/PublicacionesListado'
import Dashboard from './components/pages/Dashboard'
import Sidebar from './components/Sidebar'
import DetallesPublicacion from './components/pages/DetallesPublicacion'  
import Descargar from './components/pages/Descargar'
import axios from 'axios'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css'
import { useEffect, useState } from 'react'

function App() {
  // TEMPORAL
  const [isOpened, setIsOpened] = useState(true)
  const url= "http://3.217.85.102/api/v1/publicaciones"
  useEffect(() => {
    // now with fetch only
    console.log("fetching data with fetch")
    fetch(url)
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => {})
    axios.get(url)
      .then(response => console.log(response))
      .catch(error => {})

  }
    
  , [])
  return (
    <>
      <Router>
        <Sidebar
          isOpened={isOpened}
        />
        <div className="content ">
          <Routes>
            <Route path="/" element={<PublicacionesListado isOpened={isOpened} setIsOpened={setIsOpened} />} />
            <Route path="/dashboard"  element={<Dashboard isOpened={isOpened} setIsOpened={setIsOpened} />}  />
            <Route path="/publicacion/:id" element={<DetallesPublicacion isOpened={isOpened} setIsOpened={setIsOpened} />} />
            <Route path="/descargar" element={<Descargar isOpened={isOpened} setIsOpened={setIsOpened} />} />
          </Routes>
        </div>
      </Router>





    </>
  )
}

export default App
