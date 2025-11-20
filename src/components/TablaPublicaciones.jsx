import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Eye, ChevronUp, ChevronDown } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

import { capitalizeFirstLetter } from "@/lib/utils"
import { API_ROUTES } from '@/api/apiRoutes'

// Asegúrate de que las rutas de importación sean correctas según tu proyecto
import { usePaginatedFetch } from '@/hooks/usePaginatedFetch'
import Paginador from './Paginador'

const TablaPublicaciones = ({
  url,
  setDownloadIsAvailable: setParentDownloadIsAvailable,
}) => {
  const navigate = useNavigate()

  // Hook personalizado: Maneja la lógica de API, URL y Paginación
  const {
    data: publicaciones,
    totalItems,
    loading,
    error,
    currentPage,
    itemsPerPage,
    setPage,
    setPageSize,
    downloadIsAvailable
  } = usePaginatedFetch({
    baseUrl: API_ROUTES.PUBLICACIONES.ROOT,
    externalUrl: url,
    initialPageSize: 5
  })

  // Estados locales para UI (Búsqueda y Ordenamiento en cliente)
  const [searchTerm, setSearchTerm] = useState('')
  const [orderBy, setOrderBy] = useState('fecha_publicacion') // Orden por defecto
  const [orderDirection, setOrderDirection] = useState('desc') // Descendente por defecto
  const [filteredPublicaciones, setFilteredPublicaciones] = useState([])

  // Sincronizar disponibilidad de descarga con el componente padre
  useEffect(() => {
    if (setParentDownloadIsAvailable) {
      setParentDownloadIsAvailable(downloadIsAvailable)
    }
  }, [downloadIsAvailable, setParentDownloadIsAvailable])

  // Efecto para filtrar y ordenar los datos visualmente sin recargar la API
  useEffect(() => {
    let processed = [...publicaciones]

    // 1. Filtrado local (Búsqueda)
    if (searchTerm) {
      processed = processed.filter((pub) =>
        pub.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pub.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 2. Ordenamiento local
    processed.sort((a, b) => {
      // Helper para acceder a propiedades anidadas (ej: 'categoria__nombre' -> a.categoria.nombre)
      const getValue = (obj, path) => {
        if (path.includes('__')) {
          // Convierte 'categoria__nombre' en ['categoria', 'nombre'] y accede al valor
          return path.split('__').reduce((o, k) => (o || {})[k], obj)
        }
        return obj[path]
      }

      const valA = getValue(a, orderBy)
      const valB = getValue(b, orderBy)

      // Manejo de nulos
      if (!valA) return 1
      if (!valB) return -1

      if (valA < valB) return orderDirection === 'asc' ? -1 : 1
      if (valA > valB) return orderDirection === 'asc' ? 1 : -1
      return 0
    })

    setFilteredPublicaciones(processed)
  }, [publicaciones, searchTerm, orderBy, orderDirection])


  const handleSort = (column) => {
    if (orderBy === column) {
      setOrderDirection(orderDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setOrderBy(column)
      setOrderDirection('asc')
    }
  }

  const renderSortIcon = (column) => {
    if (orderBy !== column) return null
    return orderDirection === 'asc' ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />
  }

  // Cálculo del total de páginas basado en el total real de items en base de datos
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  if (error) return <div className="text-center text-red-500 p-4">{error}</div>

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          type="search"
          placeholder="Buscar por título o código..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">
                <Button variant="ghost" onClick={() => handleSort('codigo')}>
                  Código {renderSortIcon('codigo')}
                </Button>
              </TableHead>
              <TableHead className="text-center">
                <Button variant="ghost" onClick={() => handleSort('titulo')}>
                  Título {renderSortIcon('titulo')}
                </Button>
              </TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-center">
                <Button variant="ghost" onClick={() => handleSort('categoria__nombre')}>
                  Categoría {renderSortIcon('categoria__nombre')}
                </Button>
              </TableHead>
              <TableHead className="text-center">
                <Button variant="ghost" onClick={() => handleSort('fecha_publicacion')}>
                  Fecha {renderSortIcon('fecha_publicacion')}
                </Button>
              </TableHead>
              <TableHead className="text-center">
                <Button variant="ghost" onClick={() => handleSort('junta_vecinal__nombre_calle')}>
                  Junta Vecinal {renderSortIcon('junta_vecinal__nombre_calle')}
                </Button>
              </TableHead>
              <TableHead className="text-center">
                <Button variant="ghost" onClick={() => handleSort('ubicacion')}>
                  Ubicación {renderSortIcon('ubicacion')}
                </Button>
              </TableHead>
              <TableHead className="text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: itemsPerPage }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 7 }).map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredPublicaciones.length > 0 ? (
              filteredPublicaciones.map((pub) => (
                <TableRow key={pub.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium text-center">{pub.codigo}</TableCell>
                  <TableCell className="font-medium text-center">{pub.titulo}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={'primary'}>
                      {capitalizeFirstLetter(pub.situacion?.nombre || 'Desconocido')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {capitalizeFirstLetter(pub.categoria?.nombre || 'Sin categoría')}
                  </TableCell>
                  <TableCell className="text-center">
                    {pub.fecha_publicacion ? format(new Date(pub.fecha_publicacion), "dd-MM-yyyy HH:mm") : '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    {pub.junta_vecinal ?
                      `${pub.junta_vecinal.nombre_junta?.split(" ").map(n => capitalizeFirstLetter(n)).join(" ")} ${pub.junta_vecinal.numero_calle || ''}`
                      : 'N/A'}
                  </TableCell>
                  <TableCell className="text-center">
                    {pub.ubicacion || "No disponible"}
                  </TableCell>
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

      {/* Componente de Paginación Reutilizable */}
      <Paginador
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setPageSize}
        loading={loading}
      />
    </div>
  )
}

export default TablaPublicaciones