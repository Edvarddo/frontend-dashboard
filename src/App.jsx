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
  const url= "http://3.217.85.102/api/v1/publicaciones/"
  const bearer_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzMwMTgxMjU4LCJpYXQiOjE3MzAwOTQ4NTgsImp0aSI6ImFkYTUzODQzMzY2NTQxYzM5ZDFiYmRiNDE1OTVjNGVjIiwicnV0IjoiMjAxMjM5MzAtNSJ9.IvyGeMNF0elq-E4xl_ZoFtTQif9Q96MGFwSqj_giwvA"
  // useEffect(() => {
  //   // now with fetch only
  //   console.log("fetching data with fetch")
  //   fetch(url,
  //     {
  //       method: 'GET',
  //       headers: {
  //         'Authorization': `Bearer ${bearer_token}`
  //       }
  //     }
  //   )
  //     .then(response => response.json())
  //     .then(data => console.log(data))
  //     .catch(error => {console.log(error)})
  //   axios.get(url,
  //     {
  //       headers: {
  //         'Authorization': `Bearer ${bearer_token}`
  //       }
  //     }
  //   )
  //     .then(response => console.log(response))
  //     .catch(error => {console.log(error)})

  // }
    
  // , [])
  return (
    <>
      <Router>
        <Sidebar
          isOpened={isOpened}
        />
        <div className={`content ${!isOpened ? "overflow-hidden": ""}`}>
          <Routes>
            <Route index path="/"  element={<PublicacionesListado isOpened={isOpened} setIsOpened={setIsOpened} />}  />

            <Route path="/dashboard"  element={<Dashboard isOpened={isOpened} setIsOpened={setIsOpened} />}  />
            <Route path="/listado-publicaciones" element={<PublicacionesListado isOpened={isOpened} setIsOpened={setIsOpened} />} />
            <Route path="/publicacion/:id" element={<DetallesPublicacion isOpened={isOpened} setIsOpened={setIsOpened} />} />
            <Route path="/descargar" element={<Descargar isOpened={isOpened} setIsOpened={setIsOpened} />} />
          </Routes>
        </div>
      </Router>





    </>
  )
}

export default App
