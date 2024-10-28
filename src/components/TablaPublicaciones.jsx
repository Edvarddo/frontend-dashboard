import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Link } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import axios from 'axios'
import { da } from "date-fns/locale"
const TablaPublicaciones = ({
  currentPage,
  publicacionesPorPagina,
  setPublicacionesPorPagina,
  setCurrentPage,
  url
}) => {
  const [publicaciones, setPublicaciones] = useState([])
  const [nextPageUrl, setNextPageUrl] = useState(null)
  const [prevPageUrl, setPrevPageUrl] = useState(null)
  const [totalPublicaciones, setTotalPublicaciones] = useState(0)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const url_local = import.meta.env.VITE_URL_PROD_VERCEL
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzMwMTgxMjU4LCJpYXQiOjE3MzAwOTQ4NTgsImp0aSI6ImFkYTUzODQzMzY2NTQxYzM5ZDFiYmRiNDE1OTVjNGVjIiwicnV0IjoiMjAxMjM5MzAtNSJ9.IvyGeMNF0elq-E4xl_ZoFtTQif9Q96MGFwSqj_giwvA"
  const fetchPublicaciones = (url) => {
    // fetch with axios
    setLoading(true)
    // add authorization token bearer
    axios.get(url, {
      // headers: {
      //   'Authorization': `Bearer ${token}`
      // }
    })
      .then(response => {
        console.log(response)
        setTotalPublicaciones(response.data.count)
        setPublicaciones(response.data.results ? response.data.results : [])

        setLoading(false)
      })
      .catch(error => {
        setError(error)
        setLoading(false)
      })

    // fetch("http://localhost:3000/api-proxy/",
    //   // {
    //   //   method: 'GET',
    //   //   headers: {
    //   //     'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzI5OTg0MDIwLCJpYXQiOjE3Mjk4OTc2MjAsImp0aSI6ImI4YmZiNDI4Y2E5OTQyMTI5YThmZDM5YzI4MTljNWZhIiwicnV0IjoiMjAxMjM5MzAtNSJ9.YcTJPiqkHwMcprG0b7b5Kw3OJuCI5B-9N8EhPmjt-Q8`
    //   //   }
    //   // }
    // )
    //   .then(response => {
    //     console.log(response)
    //     response.json()
    //   })
    //   .then(data => {
    //     console.log(data)
    //     setTotalPublicaciones(data.count)
    //     setPublicaciones(data.results ? data.results : [])

    //     setLoading(false)
    //   })
    //   .catch(error => {
    //     setError(error)
    //     setLoading(false)
    //   })
  }
  const handleNextPage = () => {

    setCurrentPage(currentPage + 1)
    fetchPublicaciones(nextPageUrl)

  }
  const handlePrevPage = () => {
    if (prevPageUrl) {
      setCurrentPage(currentPage - 1)
      fetchPublicaciones(prevPageUrl)
    }
  }
  const handleLimitPerPage = (value) => {

    setPublicacionesPorPagina(value)
  }


  useEffect(() => {
    const pagesize = publicacionesPorPagina ? `pagesize=${publicacionesPorPagina}` : ""
    const baseUrl = `${import.meta.env.VITE_URL_PROD_VERCEL}publicaciones/`
    if (currentPage === 1) {
      fetchPublicaciones(`${url ? url : baseUrl}${publicacionesPorPagina != 5 ? `?${pagesize}` : ""}`)
    } else {
      fetchPublicaciones(`${url ? url  : baseUrl.concat("?")}page=${currentPage}&${pagesize}`)
    }
  }, [currentPage, url, publicacionesPorPagina])



  if (loading) return (
    <div className="flex justify-center">
      {/* table skeleton */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Fecha de publicación</TableHead>
            <TableHead>Junta vecinal</TableHead>
            {/* eye to detalles de publicacion */}
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                {
              Array.from({ length: 6 }).map((_, index) => (
                <TableCell key={index}>
                  <Skeleton 
                    className="h-[2rem] w-full"
                  />
                </TableCell>
              ))
            }
              </TableRow>
            ))
          }

          
        
        </TableBody>


      </Table>

    </div>)
  if (error) return <div>Error: {error.message}</div>

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Fecha de publicación</TableHead>
            <TableHead>Junta vecinal</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {publicaciones.map((pub) => (
            <TableRow key={pub.id}>
              <TableCell className={"hover:bg-green-50 cursor-pointer  "}>
                    
                <Link className="" to={`/publicacion/${pub.id}`}>
                {pub.titulo}

                </Link>
              </TableCell>
              <TableCell>{pub.descripcion}</TableCell>
              <TableCell>{pub.situacion.nombre}</TableCell>
              <TableCell>{pub.categoria.nombre}</TableCell>
              <TableCell>{
                // i need this format "dd-MM-yyyy"
                format(new Date(pub.fecha_publicacion), "yyyy-MM-dd")
                // new Date(pub.fecha_publicacion).toLocaleDateString()
              }</TableCell>
              <TableCell>{pub.junta_vecinal.nombre_calle} {pub.junta_vecinal.numero_calle}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between mt-4">
        <span>Página {currentPage} de 
          <span className=""> {Math.ceil(totalPublicaciones / publicacionesPorPagina)}</span>
        </span>

        <div className="flex items-center space-x-2 ">
          <div className="limit-rows-per-page">
            <Select
              value={publicacionesPorPagina ? publicacionesPorPagina : "5"}
              onValueChange={(value) => { handleLimitPerPage(value) }}
            >
              <SelectTrigger>
                <SelectValue placeholder="5" />
              </SelectTrigger>
              <SelectContent>
                {/* <SelectItem value={null}>Todas las categorías</SelectItem> */}
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                {/* <SelectItem value="15">15</SelectItem> */}

              </SelectContent>
            </Select>



          </div>
          {/* initial page */}
          <Button variant="outline" size="icon" onClick={() => setCurrentPage(1)} disabled={currentPage > 1 ? false : true}>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setCurrentPage(currentPage - 1)} disabled={
            currentPage > 1 ? false : true
          }>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setCurrentPage(currentPage + 1)} disabled={
            currentPage < Math.ceil(totalPublicaciones / publicacionesPorPagina) ? false : true
          }>
            <ChevronRight className="h-4 w-4" />
          </Button>
          {/* final page */}
          <Button variant="outline" size="icon" onClick={() => setCurrentPage(Math.ceil(totalPublicaciones / publicacionesPorPagina))} disabled={
            currentPage < Math.ceil(totalPublicaciones / publicacionesPorPagina) ? false : true
          }>
            <ChevronsRight className="h-4 w-4" />
          </Button>
          
        </div>
      </div>
    </>
  )
}

export default TablaPublicaciones