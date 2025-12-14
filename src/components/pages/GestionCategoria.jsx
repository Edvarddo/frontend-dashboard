"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Plus, Edit, ArrowLeft, Tag, Eye, RefreshCw, Trash2 } from "lucide-react"
import TopBar from "../TopBar"

import useAxiosPrivate from "@/hooks/useAxiosPrivate"
import { useToast } from "../../hooks/use-toast"
import { ModalEliminarCategoria } from "../ModalEliminarCategoria"
import { Spinner } from "@radix-ui/themes"
import { operations } from "@/lib/constants"
import { API_ROUTES } from "@/api/apiRoutes"

import Paginador from "../Paginador"

const GestionCategoria = ({ onVolver }) => {
  const axiosPrivate = useAxiosPrivate()
  const { toast } = useToast()

  // --- Estados de Datos ---
  const [allData, setAllData] = useState([]) // Todos los datos de categorías
  const [departamentos, setDepartamentos] = useState([])
  const [loading, setLoading] = useState(false)

  // --- Estados de Filtros ---
  const [filtros, setFiltros] = useState({
    departamento: "all",
    estado: "all",
    busqueda: "",
  })

  // --- Estados de Paginación ---
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // --- Estados de UI ---
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [formData, setFormData] = useState({
    id: null,
    nombre: "",
    descripcion: "",
    departamento_id: "",
    estado: "habilitado",
  })

  // --- Carga de Datos ---
  const fetchCategorias = useCallback(async () => {
    setLoading(true)
    try {
      const response = await axiosPrivate.get(API_ROUTES.CATEGORIAS.ROOT)
      // Asegurar que sea un array
      const data = Array.isArray(response.data) ? response.data : (response.data.results || [])
      setAllData(data)
    } catch (error) {
      console.error("Error al cargar categorías:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [axiosPrivate, toast])

  const fetchDepartamentos = useCallback(async () => {
    try {
      const response = await axiosPrivate.get(API_ROUTES.DEPARTAMENTOS.ROOT)
      setDepartamentos(response.data || [])
    } catch (error) {
      console.error("Error al cargar departamentos:", error)
    }
  }, [axiosPrivate])

  useEffect(() => {
    fetchCategorias()
    fetchDepartamentos()
  }, [fetchCategorias, fetchDepartamentos])

  // --- Lógica de Filtrado (useMemo) ---
  const categoriasFiltradas = useMemo(() => {
    return allData.filter((categoria) => {
      // 1. Búsqueda Texto
      const cumpleBusqueda =
        !filtros.busqueda ||
        categoria.nombre?.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        categoria.descripcion?.toLowerCase().includes(filtros.busqueda.toLowerCase())

      // 2. Filtro Departamento
      const cumpleDepartamento =
        filtros.departamento === "all" ||
        categoria.departamento?.id?.toString() === filtros.departamento ||
        categoria.departamento_id?.toString() === filtros.departamento

      // 3. Filtro Estado
      const cumpleEstado =
        filtros.estado === "all" ||
        categoria.estado?.toLowerCase() === filtros.estado.toLowerCase()

      return cumpleBusqueda && cumpleDepartamento && cumpleEstado
    })
  }, [allData, filtros])

  // --- Lógica de Paginación (useMemo) ---
  const paginatedData = useMemo(() => {
    const firstIndex = (currentPage - 1) * itemsPerPage
    const lastIndex = firstIndex + itemsPerPage
    return categoriasFiltradas.slice(firstIndex, lastIndex)
  }, [categoriasFiltradas, currentPage, itemsPerPage])

  const totalItems = categoriasFiltradas.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // Resetear página al filtrar
  useEffect(() => {
    setCurrentPage(1)
  }, [filtros])

  // --- Estadísticas (Calculadas sobre allData) ---
  const estadisticas = useMemo(() => ({
    total: allData.length,
    activas: allData.filter((cat) => cat.estado === "habilitado").length,
    inactivas: allData.filter((cat) => cat.estado === "deshabilitado").length,
    totalPublicaciones: allData.reduce((sum, cat) => sum + (cat.cantidad_publicaciones || 0), 0),
  }), [allData])

  // --- Manejadores ---
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAgregarCategoria = () => {
    setFormData({
      id: null,
      nombre: "",
      descripcion: "",
      departamento_id: "",
      estado: "habilitado",
    })
    setModoEdicion(false)
    setModalAbierto(true)
  }

  const handleEditarCategoria = (categoria) => {
    setFormData({
      id: categoria.id,
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
      // Manejar si departamento viene como objeto o ID
      departamento_id: categoria.departamento?.id?.toString() || categoria.departamento_id?.toString() || "",
      estado: categoria.estado,
    })
    setModoEdicion(true)
    setModalAbierto(true)
  }

  const handleGuardarCategoria = async () => {
    if (formData.nombre && formData.descripcion && formData.departamento_id && formData.estado) {
      setLoading(true)
      try {
        const payload = {
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          estado: formData.estado,
          departamento: formData.departamento_id // Enviamos 'departamento' en lugar de 'departamento_id'
        }
        if (modoEdicion) {
          await axiosPrivate.patch(`${API_ROUTES.CATEGORIAS.ROOT}${formData.id}/`, payload)
          toast({ title: "Categoría actualizada", description: "Actualización exitosa.", className: operations.SUCCESS })
        } else {
          await axiosPrivate.post(API_ROUTES.CATEGORIAS.ROOT, payload)
          toast({ title: "Categoría creada", description: "Creación exitosa.", className: operations.SUCCESS })
        }
        fetchCategorias() // Recarga lista completa
        setModalAbierto(false)
      } catch (error) {
        console.error("Error al guardar:", error)
        toast({ title: "Error", description: "No se pudo guardar la categoría.", className: operations.ERROR })
      } finally {
        setLoading(false)
      }
    }
  }

  const handleEliminarCategoria = async (id) => {
    try {
      await axiosPrivate.delete(`${API_ROUTES.CATEGORIAS.ROOT}${id}/`)
      toast({ title: "Categoría eliminada", description: "Eliminación exitosa.", className: operations.SUCCESS })
      fetchCategorias() // Recarga lista completa
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar.", className: operations.ERROR })
    }
  }

  const limpiarFiltros = () => {
    setFiltros({ departamento: "all", estado: "all", busqueda: "" })
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const options = { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric" }
    return new Date(dateString).toLocaleDateString("es-CL", options)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar title={"Gestión de Categorías"} icon={<Tag className="h-6 w-6 text-blue-600" />} />

      <div className="p-6 space-y-6">
        {onVolver && (
          <Button variant="outline" onClick={onVolver} className="mb-4 bg-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Gestión de Datos
          </Button>
        )}

        {/* Tarjetas de Estadísticas (Tu Diseño Original) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Total Categorías</p>
                  <p className="text-2xl font-bold">{estadisticas.total}</p>
                </div>
                <Tag className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Habilitadas</p>
                  <p className="text-2xl font-bold">{estadisticas.activas}</p>
                </div>
                <Eye className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Deshabilitadas</p>
                  <p className="text-2xl font-bold">{estadisticas.inactivas}</p>
                </div>
                <Tag className="h-8 w-8 text-red-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Publicaciones</p>
                  <p className="text-2xl font-bold">{estadisticas.totalPublicaciones}</p>
                </div>
                <Tag className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sección Principal con Filtros y Tabla */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Gestión de Categorías
              </CardTitle>
              <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
                <DialogTrigger asChild>
                  <Button onClick={handleAgregarCategoria} className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Categoría
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{modoEdicion ? "Editar Categoría" : "Agregar Nueva Categoría"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Formulario del Modal (Mantenido) */}
                    <div>
                      <Label htmlFor="nombre">Nombre de la Categoría</Label>
                      <Input
                        id="nombre"
                        value={formData.nombre}
                        onChange={(e) => handleInputChange("nombre", e.target.value)}
                        placeholder="Ej: Ordenanzas Municipales"
                      />
                    </div>
                    <div>
                      <Label htmlFor="descripcion">Descripción</Label>
                      <Textarea
                        id="descripcion"
                        value={formData.descripcion}
                        onChange={(e) => handleInputChange("descripcion", e.target.value)}
                        placeholder="Describe el propósito de esta categoría..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="departamento">Departamento</Label>
                      <Select
                        value={formData.departamento_id}
                        onValueChange={(value) => handleInputChange("departamento_id", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar departamento" />
                        </SelectTrigger>
                        <SelectContent>
                          {departamentos.map((dep) => (
                            <SelectItem key={dep.id} value={dep.id.toString()}>
                              {dep.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="estado">Estado</Label>
                      <Select
                        value={formData.estado}
                        onValueChange={(value) => handleInputChange("estado", value)}
                      >
                        <SelectTrigger><SelectValue placeholder="Seleccionar estado" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="habilitado">Habilitado</SelectItem>
                          <SelectItem value="deshabilitado">Deshabilitado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={handleGuardarCategoria}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        disabled={!formData.nombre || !formData.descripcion || !formData.departamento_id || loading}
                      >
                        {loading ? <Spinner /> : (modoEdicion ? "Actualizar" : "Crear") + " Categoría"}
                      </Button>
                      <Button variant="outline" onClick={() => setModalAbierto(false)}>Cancelar</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Filtros (Estilo Original) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div>
                <Label>Departamento</Label>
                <Select
                  value={filtros.departamento}
                  onValueChange={(value) => setFiltros((prev) => ({ ...prev, departamento: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los departamentos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los departamentos</SelectItem>
                    {departamentos.map((dep) => (
                      <SelectItem key={dep.id} value={dep.id.toString()}>
                        {dep.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Estado</Label>
                <Select
                  value={filtros.estado}
                  onValueChange={(value) => setFiltros((prev) => ({ ...prev, estado: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="habilitado">Habilitado</SelectItem>
                    <SelectItem value="deshabilitado">Deshabilitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Búsqueda</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar categorías..."
                    value={filtros.busqueda}
                    onChange={(e) => setFiltros((prev) => ({ ...prev, busqueda: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2 items-end">
                <Button variant="outline" onClick={limpiarFiltros}>
                  Limpiar filtros
                </Button>
                <Button variant="outline" onClick={fetchCategorias} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Recargar
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Tabla */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-green-50">
                    <TableHead className="text-center text-green-700 font-bold">ID</TableHead>
                    <TableHead className="text-center text-green-700 font-bold">Nombre</TableHead>
                    <TableHead className="text-center text-green-700 font-bold">Descripción</TableHead>
                    <TableHead className="text-center text-green-700 font-bold">Departamento</TableHead>
                    <TableHead className="text-center text-green-700 font-bold">Estado</TableHead>
                    <TableHead className="text-center text-green-700 font-bold">Publicaciones</TableHead>
                    <TableHead className="text-center text-green-700 font-bold">Fecha Creación</TableHead>
                    <TableHead className="text-center text-green-700 font-bold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-center">
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">Cargando datos...</TableCell>
                    </TableRow>
                  ) : paginatedData.length > 0 ? (
                    paginatedData.map((categoria) => (
                      <TableRow key={categoria.id}>
                        <TableCell className="font-medium">{categoria.id}</TableCell>
                        <TableCell className="font-medium">{categoria.nombre}</TableCell>
                        <TableCell className="max-w-xs truncate" title={categoria.descripcion}>
                          {categoria.descripcion || "Sin descripción"}
                        </TableCell>
                        <TableCell>{categoria.departamento?.nombre || "Sin asignar"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={categoria.estado === "habilitado" ? "default" : "secondary"}
                          >
                            {categoria.estado}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{categoria.cantidad_publicaciones || 0}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(categoria.fecha_creacion)}</TableCell>
                        <TableCell className="flex justify-center">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditarCategoria(categoria)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <ModalEliminarCategoria
                              categoria={categoria}
                              onEliminar={handleEliminarCategoria}
                              onCancel={() => { }}
                              trigger={
                                <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 border-red-200">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              }
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No se encontraron categorías
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <Paginador
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={(val) => {
                setItemsPerPage(Number(val))
                setCurrentPage(1)
              }}
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default GestionCategoria