import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Eye, ChevronUp, ChevronDown } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

import useAxiosPrivate from '../hooks/useAxiosPrivate'
import { capitalizeFirstLetter } from "@/lib/utils"

const TablaPublicaciones = ({
  currentPage,
  publicacionesPorPagina,
  setPublicacionesPorPagina,
  setCurrentPage,
  url,
  setLoading,
  loading,
  setDownloadIsAvailable,
}) => {
  const axiosPrivate = useAxiosPrivate()
  const [publicaciones, setPublicaciones] = useState([])
  const [totalPublicaciones, setTotalPublicaciones] = useState(0)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [orderBy, setOrderBy] = useState('titulo')
  const [orderDirection, setOrderDirection] = useState('asc')
  const [tempPublicaciones, setTempPublicaciones] = useState([])
  const navigate = useNavigate()

  const fetchPublicaciones = async (fetchUrl) => {
    setLoading(true)
    try {
      const response = await axiosPrivate.get(fetchUrl)
      setTotalPublicaciones(response.data.count)
      setDownloadIsAvailable(response.data.count > 0)
      setPublicaciones(response.data.results || [])
      setTempPublicaciones(response.data.results || [])
    } catch (error) {
      setError(error.message || 'Ocurrió un error al cargar las publicaciones')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const baseUrl = `${import.meta.env.VITE_URL_PROD_VERCEL}publicaciones/`
    const limitPerPage = publicacionesPorPagina ? `&pagesize=${publicacionesPorPagina}` : ''
    // Si existe la url con filtros se aplica la petición con ella
    if (url){
      const fetchUrl = `${url}?${limitPerPage}&page=${currentPage}`
      fetchPublicaciones(fetchUrl)
      return;
    }
    // Si no hay filtros se aplica la petición con la url base
    const fetchUrl = `${baseUrl}?${limitPerPage}&page=${currentPage}`
    // const fetchUrl = currentPage === 1 ? `${url || baseUrl}?${limitPerPage}` : `${url || baseUrl}&page=${currentPage}`
    console.log(fetchUrl)
    fetchPublicaciones(fetchUrl)
  }, [currentPage, url, publicacionesPorPagina])

  const handleLimitPerPage = (value) => {
    console.log(value)
    setPublicacionesPorPagina(Number(value))
    setCurrentPage(1)
  }

  const handleSearch = (event) => {
    setSearchTerm(event.target.value)
    if (!event.target.value) {
      setPublicaciones(tempPublicaciones)
      return
    }
    const filteredPublicaciones = tempPublicaciones.filter((pub) =>
      pub.titulo.toLowerCase().includes(event.target.value.toLowerCase())
    )
    setPublicaciones(filteredPublicaciones)
    
    // setCurrentPage(1)
  }

  const handleSort = (column) => {
    if (orderBy === column) {
      setOrderDirection(orderDirection === 'asc' ? 'desc' : 'asc')
      // order publicaciones
      const sortedPublicaciones = publicaciones.sort((a, b) => {
        if (orderDirection === 'asc') {
          return a[column] < b[column] ? -1 : 1
        } else {
          return a[column] > b[column] ? -1 : 1
        }
      })
      setPublicaciones(sortedPublicaciones)

    } else {
      setOrderBy(column)
      setOrderDirection('asc')
    }
    // setCurrentPage(1)
  }

  const totalPages = Math.ceil(totalPublicaciones / publicacionesPorPagina)

  const getStatusVariant = (status) => {
    switch (status.toLowerCase()) {
      case 'Recibido': return 'success'
      case 'En curso': return 'warning' 
      case 'Finalizado': return 'danger'
      case 'Pendiente' : return 'info'
      case 'No Resuelto' : return 'danger'
    }
  }

  const renderSortIcon = (column) => {
    if (orderBy !== column) return null
    return orderDirection === 'asc' ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />
  }

  if (error) return <div className="text-center text-red-500 p-4">{error}</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          type="search"
          placeholder="Buscar por título..."
          value={searchTerm}
          onChange={handleSearch}
          className="max-w-sm"
        />
        

        <Select
          value={publicacionesPorPagina.toString()}
          onValueChange={handleLimitPerPage}
          disabled={loading}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Publicaciones por página" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 por página</SelectItem>
            <SelectItem value="10">10 por página</SelectItem>
            <SelectItem value="20">20 por página</SelectItem>
            
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className=" text-center">
                <Button variant="ghost" onClick={() => handleSort('codigo')}>
                  Código {renderSortIcon('codigo')}
                </Button>
              </TableHead>
              <TableHead className=" text-center" >
                <Button variant="ghost" onClick={() => handleSort('titulo')}>
                  Título {renderSortIcon('titulo')}
                </Button>
              </TableHead>
              {/* <TableHead>Descripción</TableHead> */}
              <TableHead className=" text-center">Estado</TableHead>
              <TableHead className=" text-center">
                <Button variant="ghost" onClick={() => handleSort('categoria__nombre')}>
                  Categoría {renderSortIcon('categoria__nombre')}
                </Button>
              </TableHead>
              <TableHead className=" text-center">
                <Button variant="ghost" onClick={() => handleSort('fecha_publicacion')}>
                  Fecha de publicación {renderSortIcon('fecha_publicacion')}
                </Button>
              </TableHead>
              <TableHead className=" text-center">
                <Button variant="ghost" onClick={() => handleSort('junta_vecinal__nombre_calle')}>
                  Junta vecinal {renderSortIcon('junta_vecinal__nombre_calle')}
                </Button>
              </TableHead>
              <TableHead className=" text-center">
                <Button variant="ghost" onClick={() => handleSort('junta_vecinal__nombre_calle')}>
                  Calle {renderSortIcon('junta_vecinal__nombre_calle')}
                </Button>
              </TableHead>
              <TableHead className="text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: publicacionesPorPagina }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 7 }).map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : publicaciones.length > 0 ? (
              publicaciones.map((pub) => (
                <TableRow key={pub.id} className="hover:bg-muted/50">
                  {/* TITULO */}
                  <TableCell className="font-medium text-center">{(pub.codigo)}</TableCell>
                  <TableCell className="font-medium text-center">{(pub.titulo)}</TableCell>
                  {/* DESCRIPCION */}
                  {/* <TableCell>{capitalizeFirstLetter(pub.descripcion)}</TableCell> */}
                  {/* ESTADO */}
                  <TableCell className=" text-center">
                    <Badge variant={'primary'} >
                      {capitalizeFirstLetter(pub.situacion.nombre)}
                    </Badge>
                  </TableCell>
                  {/* CATEGORIA */}
                  <TableCell className="text-center">{capitalizeFirstLetter(pub.categoria.nombre)}</TableCell>
                  {/* FECHA DE PUBLICACION */}
                  <TableCell className=" text-center">{format(new Date(pub.fecha_publicacion), "dd-MM-yyyy HH:mm")}</TableCell>
                  {/* JUNTA VECINAL */}
                  <TableCell className=" text-center">
                    {`${pub.junta_vecinal.nombre_junta.split(" ").map(nombre => capitalizeFirstLetter(nombre)).join(" ")} ${pub.junta_vecinal.numero_calle}`}
                  </TableCell>
                  {/* CALLE */}
                  <TableCell className=" text-center">
                    {`${pub.junta_vecinal.nombre_calle.split(" ").map(nombre => capitalizeFirstLetter(nombre)).join(" ")} ${pub.junta_vecinal.numero_calle}`}
                  </TableCell>
                  {/* ACCIONES */}
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/publicacion/${pub.id}`)}
                      aria-label={`Ver detalles de ${pub.titulo}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No se encontraron resultados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Página {currentPage} de {totalPages || 1}
        </span>
        <div className="flex items-center space-x-2">
          {/* plural and singular handle */}
          {
            totalPublicaciones === 1 ? (
              <span className="text-sm text-muted-foreground">{totalPublicaciones} Resultado encontrado</span>
            ) : (
              <span className="text-sm text-muted-foreground">{totalPublicaciones} Resultados encontrados</span>
            )
          }
          {/* <span className="text-sm text-muted-foreground">{publicaciones.length} Resultados encontrados</span> */}
          
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage <= 1}
            aria-label="Primera página"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage >= totalPages || loading}
            aria-label="Página siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage >= totalPages || loading}
            aria-label="Última página"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TablaPublicaciones

