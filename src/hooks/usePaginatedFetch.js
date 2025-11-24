import { useState, useEffect } from 'react'
import useAxiosPrivate from '../hooks/useAxiosPrivate'

// Recibe la URL base por defecto y opcionalmente una URL con filtros dinámica
export const usePaginatedFetch = ({
  baseUrl,
  initialPageSize = 5,
  externalUrl = null
}) => {
  const axiosPrivate = useAxiosPrivate()

  // Estados de la lógica de negocio
  const [data, setData] = useState([])
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(initialPageSize)
  const [downloadIsAvailable, setDownloadIsAvailable] = useState(false)

  const fetchData = async (fetchUrl) => {
    setLoading(true)
    try {
      const response = await axiosPrivate.get(fetchUrl)
      // API devuelve { count: number, results: [] }
      setTotalItems(response.data.count)
      setDownloadIsAvailable(response.data.count > 0)
      setData(response.data.results || [])
    } catch (err) {
      setError(err.message || 'Ocurrió un error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  // Lógica de construcción de URL
  useEffect(() => {
    const limitParam = itemsPerPage ? `&pagesize=${itemsPerPage}` : ''

    // Lógica para manejar si la URL externa ya trae parámetros (?)
    const separator = (url) => url.includes('?') ? '&' : '?'

    let fetchUrl = ''

    if (externalUrl) {
      // Si hay URL con filtros (externalUrl), usamos esa
      fetchUrl = `${externalUrl}${separator(externalUrl)}${limitParam.replace(/^&/, '')}&page=${currentPage}`
    } else {
      // Si no, usamos la base
      fetchUrl = `${baseUrl}${separator(baseUrl)}${limitParam.replace(/^&/, '')}&page=${currentPage}`
    }

    console.log('Fetching:', fetchUrl)
    fetchData(fetchUrl)

  }, [currentPage, externalUrl, itemsPerPage, baseUrl]) // Dependencias clave

  // Funciones para exponer al componente
  const handlePageChange = (page) => setCurrentPage(page)

  const handleLimitChange = (limit) => {
    setItemsPerPage(Number(limit))
    setCurrentPage(1) // Resetear a la página 1 al cambiar el límite
  }

  // Retornamos todo lo que la UI necesita
  return {
    data,
    totalItems,
    loading,
    error,
    currentPage,
    itemsPerPage,
    downloadIsAvailable,
    setPage: handlePageChange,
    setPageSize: handleLimitChange,
    refresh: () => fetchData(`${baseUrl}?page=${currentPage}`) // Opción extra para recargar manualmente
  }
}