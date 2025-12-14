"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Plus, Edit, Trash2, ArrowLeft, Building2, Users, Eye, RefreshCw } from "lucide-react"
import TopBar from "../TopBar"
import { useToast } from "../../hooks/use-toast"
import useAxiosPrivate from "../../hooks/useAxiosPrivate"
import { operations } from "@/lib/constants"
import { API_ROUTES } from "@/api/apiRoutes"
import Paginador from "../Paginador" // Importación del Paginador

const GestionDepartamento = ({ onVolver }) => {
  const axiosPrivate = useAxiosPrivate()
  const { toast } = useToast()

  // --- Estados de Datos ---
  const [departamentos, setDepartamentos] = useState([])
  const [loading, setLoading] = useState(false)

  // --- Estados de Filtros ---
  const [filtros, setFiltros] = useState({
    estado: "all",
    busqueda: "",
  })

  // --- Estados de Paginación ---
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // --- Estados de UI ---
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [modalEliminar, setModalEliminar] = useState(false)
  const [departamentoAEliminar, setDepartamentoAEliminar] = useState(null)
  const [formData, setFormData] = useState({
    id: null,
    nombre: "",
    descripcion: "",
    estado: "habilitado",
  })

  // --- Carga de Datos ---
  const fetchDepartamentos = async () => {
    setLoading(true)
    try {
      const response = await axiosPrivate.get(API_ROUTES.DEPARTAMENTOS.ROOT)
      setDepartamentos(response.data)
    } catch (error) {
      console.error("Error al obtener departamentos:", error)
      toast({
        title: "Error al obtener departamentos",
        description: "Ha ocurrido un error al intentar obtener los departamentos.",
        className: operations.ERROR,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDepartamentos()
  }, [])

  // --- Lógica de Filtrado (useMemo) ---
  const departamentosFiltrados = useMemo(() => {
    return departamentos.filter((departamento) => {
      // 1. Filtro Búsqueda
      const cumpleBusqueda =
        !filtros.busqueda ||
        departamento.nombre?.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        departamento.descripcion?.toLowerCase().includes(filtros.busqueda.toLowerCase())

      // 2. Filtro Estado
      const cumpleEstado =
        filtros.estado === "all" ||
        !filtros.estado ||
        departamento.estado === filtros.estado

      return cumpleBusqueda && cumpleEstado
    })
  }, [departamentos, filtros])

  // --- Lógica de Paginación (useMemo) ---
  const paginatedData = useMemo(() => {
    const firstIndex = (currentPage - 1) * itemsPerPage
    const lastIndex = firstIndex + itemsPerPage
    return departamentosFiltrados.slice(firstIndex, lastIndex)
  }, [departamentosFiltrados, currentPage, itemsPerPage])

  const totalItems = departamentosFiltrados.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // Resetear página al filtrar
  useEffect(() => {
    setCurrentPage(1)
  }, [filtros])

  // --- Estadísticas ---
  const estadisticas = useMemo(() => ({
    total: departamentos.length,
    activos: departamentos.filter((dept) => dept.estado?.toLowerCase() === "habilitado").length,
    inactivos: departamentos.filter((dept) => dept.estado?.toLowerCase() === "deshabilitado").length,
    totalEmpleados: departamentos.reduce((sum, dept) => sum + (dept.funcionarios_count || 0), 0),
  }), [departamentos])

  // --- Manejadores ---
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const limpiarFiltros = () => {
    setFiltros({
      estado: "all",
      busqueda: "",
    })
  }

  const handleAgregarDepartamento = () => {
    setFormData({
      id: null,
      nombre: "",
      descripcion: "",
      estado: "habilitado",
    })
    setModoEdicion(false)
    setModalAbierto(true)
  }

  const handleEditarDepartamento = (departamento) => {
    setFormData({
      id: departamento.id,
      nombre: departamento.nombre,
      descripcion: departamento.descripcion,
      estado: departamento.estado,
    })
    setModoEdicion(true)
    setModalAbierto(true)
  }

  const handleGuardarDepartamento = async () => {
    if (formData.nombre && formData.descripcion && formData.estado) {
      setLoading(true)
      try {
        if (modoEdicion) {
          await axiosPrivate.put(`${API_ROUTES.DEPARTAMENTOS.ROOT}${formData.id}/`, formData)
          // Actualización optimista o recarga
          fetchDepartamentos()
          toast({
            title: "Departamento actualizado",
            description: "El departamento ha sido actualizado correctamente.",
            className: operations.SUCCESS,
          })
        } else {
          await axiosPrivate.post(API_ROUTES.DEPARTAMENTOS.ROOT, formData)
          fetchDepartamentos()
          toast({
            title: "Departamento creado",
            description: "El departamento ha sido creado correctamente.",
            className: operations.SUCCESS,
          })
        }
        setModalAbierto(false)
      } catch (error) {
        console.error("Error al guardar departamento:", error)
        toast({
          title: "Error",
          description: "Ha ocurrido un error al intentar guardar el departamento.",
          className: operations.ERROR,
        })
      } finally {
        setLoading(false)
      }
    }
  }

  const handleEliminarDepartamento = (departamento) => {
    setDepartamentoAEliminar(departamento)
    setModalEliminar(true)
  }

  const confirmarEliminacion = async () => {
    try {
      if (departamentoAEliminar) {
        await axiosPrivate.delete(`${API_ROUTES.DEPARTAMENTOS.ROOT}${departamentoAEliminar.id}/`)
        setDepartamentos((prev) => prev.filter((dept) => dept.id !== departamentoAEliminar.id))
        setModalEliminar(false)
        setDepartamentoAEliminar(null)
        toast({
          title: "Departamento eliminado",
          description: "El departamento ha sido eliminado correctamente.",
          className: operations.SUCCESS,
        })
      }
    } catch (error) {
      console.error("Error al eliminar departamento:", error)
      toast({
        title: "Error",
        description: "Ha ocurrido un error al intentar eliminar el departamento.",
        className: operations.ERROR,
      })
    }
  }

  const cancelarEliminacion = () => {
    setModalEliminar(false)
    setDepartamentoAEliminar(null)
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric" }
    return new Date(dateString).toLocaleDateString("es-CL", options)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <TopBar title={"Gestión de Departamentos"} icon={<Building2 className="h-6 w-6 text-blue-600" />} />

      <div className="p-6 space-y-6">
        {/* Botón para volver */}
        {onVolver && (
          <Button variant="outline" onClick={onVolver} className="mb-4 bg-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Gestión de Datos
          </Button>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="bg-gradient-to-r from-green-400 to-green-500 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Total Departamentos</p>
                  <p className="text-2xl font-bold">{estadisticas.total}</p>
                </div>
                <Building2 className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Habilitados</p>
                  <p className="text-2xl font-bold">{estadisticas.activos}</p>
                </div>
                <Eye className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Deshabilitados</p>
                  <p className="text-2xl font-bold">{estadisticas.inactivos}</p>
                </div>
                <Building2 className="h-8 w-8 text-red-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Empleados</p>
                  <p className="text-2xl font-bold">{estadisticas.totalEmpleados}</p>
                </div>
                <Users className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sección principal */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Gestión de Departamentos
              </CardTitle>
              <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
                <DialogTrigger asChild>
                  <Button onClick={handleAgregarDepartamento} className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Departamento
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{modoEdicion ? "Editar Departamento" : "Agregar Nuevo Departamento"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nombre">Nombre del Departamento</Label>
                      <Input
                        id="nombre"
                        value={formData.nombre}
                        onChange={(e) => handleInputChange("nombre", e.target.value)}
                        placeholder="Ej: Secretaría General"
                      />
                    </div>
                    <div>
                      <Label htmlFor="descripcion">Descripción</Label>
                      <Textarea
                        id="descripcion"
                        value={formData.descripcion}
                        onChange={(e) => handleInputChange("descripcion", e.target.value)}
                        placeholder="Describe las funciones y responsabilidades del departamento..."
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label htmlFor="estado">Estado</Label>
                      <Select value={formData.estado} onValueChange={(value) => handleInputChange("estado", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="habilitado">Habilitado</SelectItem>
                          <SelectItem value="deshabilitado">Deshabilitado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={handleGuardarDepartamento}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        disabled={!formData.nombre || !formData.descripcion || !formData.estado || loading}
                      >
                        {modoEdicion ? "Actualizar" : "Crear"} Departamento
                      </Button>
                      <Button variant="outline" onClick={() => setModalAbierto(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
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
                    placeholder="Buscar departamentos..."
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
                <Button variant="outline" onClick={fetchDepartamentos} disabled={loading}>
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
                <TableHeader className="text-center">
                  <TableRow className="bg-green-50 text-center">
                    <TableHead className="text-center text-green-700 font-bold">ID</TableHead>
                    <TableHead className="text-center text-green-700 font-bold">Nombre</TableHead>
                    <TableHead className="text-center text-green-700 font-bold">Descripción</TableHead>
                    <TableHead className="text-center text-green-700 font-bold">Estado</TableHead>
                    <TableHead className="text-center text-green-700 font-bold">Empleados</TableHead>
                    <TableHead className="text-center text-green-700 font-bold">Fecha Creación</TableHead>
                    <TableHead className="text-center text-green-700 font-bold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">Cargando datos...</TableCell>
                    </TableRow>
                  ) : paginatedData.length > 0 ? (
                    paginatedData.map((departamento) => (
                      <TableRow key={departamento.id} className="text-center">
                        <TableCell className="font-medium">{departamento.id}</TableCell>
                        <TableCell className="font-medium">{departamento.nombre}</TableCell>
                        <TableCell className="max-w-xs truncate" title={departamento.descripcion}>
                          {departamento.descripcion ? departamento.descripcion : "Sin descripción"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={departamento.estado === "habilitado" ? "default" : "secondary"}
                          >
                            {departamento.estado}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            {departamento.funcionarios_count || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(departamento.fecha_creacion)}</TableCell>
                        <TableCell className="flex justify-center">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditarDepartamento(departamento)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEliminarDepartamento(departamento)}
                              className="text-red-600 hover:bg-red-50 border-red-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No se encontraron departamentos
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Paginación */}
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

        {/* Modal Eliminar */}
        <Dialog open={modalEliminar} onOpenChange={setModalEliminar}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600">Confirmar Eliminación</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-700">
                ¿Estás seguro de que deseas eliminar el departamento{" "}
                <span className="font-semibold">"{departamentoAEliminar?.nombre}"</span>?
              </p>
              <p className="text-sm text-gray-500">
                Esta acción no se puede deshacer y se eliminará toda la información asociada.
              </p>
              <div className="flex gap-2 pt-4">
                <Button onClick={confirmarEliminacion} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                  Sí, eliminar
                </Button>
                <Button variant="outline" onClick={cancelarEliminacion} className="flex-1 bg-transparent">
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default GestionDepartamento