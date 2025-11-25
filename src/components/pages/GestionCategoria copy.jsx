"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Plus, Edit, ArrowLeft, Tag, Eye, RefreshCw } from "lucide-react"
import TopBar from "../TopBar"

import useAxiosPrivate from "@/hooks/useAxiosPrivate"
import { useToast } from "../../hooks/use-toast"
import { ModalEliminarCategoria } from "../ModalEliminarCategoria"
import { Spinner } from "@radix-ui/themes"
import { operations } from "@/lib/constants"
import { API_ROUTES } from "@/api/apiRoutes"
// Datos de ejemplo para departamentos
const departamentosData = [
  { id: 1, nombre: "Secretaría General" },
  { id: 2, nombre: "Obras Públicas" },
  { id: 3, nombre: "Desarrollo Social" },
  { id: 4, nombre: "Medio Ambiente" },
  { id: 5, nombre: "Cultura y Turismo" },
  { id: 6, nombre: "Deportes" },
  { id: 7, nombre: "Educación" },
  { id: 8, nombre: "Salud" },
]

// Datos de ejemplo para categorías
const categoriasData = [
  {
    id: 1,
    nombre: "Ordenanzas Municipales",
    descripcion: "Normativas y reglamentos del municipio",
    departamento_id: 1,
    estado: "Activa",
    fechaCreacion: "2024-01-15",
    publicaciones: 25,
  },
  {
    id: 2,
    nombre: "Obras de Infraestructura",
    descripcion: "Proyectos de construcción y mejoramiento urbano",
    departamento_id: 2,
    estado: "Activa",
    fechaCreacion: "2024-01-20",
    publicaciones: 18,
  },
  {
    id: 3,
    nombre: "Programas Sociales",
    descripcion: "Iniciativas de desarrollo comunitario y asistencia social",
    departamento_id: 3,
    estado: "Activa",
    fechaCreacion: "2024-02-01",
    publicaciones: 32,
  },
  {
    id: 4,
    nombre: "Medio Ambiente",
    descripcion: "Políticas y acciones ambientales",
    departamento_id: 4,
    estado: "Inactiva",
    fechaCreacion: "2024-02-10",
    publicaciones: 12,
  },
  {
    id: 5,
    nombre: "Eventos Culturales",
    descripcion: "Actividades culturales y festivales municipales",
    departamento_id: 5,
    estado: "Activa",
    fechaCreacion: "2024-02-15",
    publicaciones: 45,
  },
]

const GestionCategoria = ({ onVolver }) => {
  // usamos useAxiosPrivate
  const axiosPrivate = useAxiosPrivate()
  const { toast } = useToast()
  const [categorias, setCategorias] = useState([])
  const [departamentos, setDepartamentos] = useState([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    id: null,
    nombre: "",
    descripcion: "",
    departamento_id: "",
    estado: "",
  })
  const [selectedState, setSelectedState] = useState("")
  const [filtros, setFiltros] = useState({
    departamento: "",
    estado: "",
    busqueda: "",
  })
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)

  // Manejar cambios en el formulario
  const handleInputChange = (field, value) => {
    console.log(`Campo cambiado: ${field}, Nuevo valor: ${value}`)
    console.log(formData)
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Abrir modal para agregar nueva categoría
  const handleAgregarCategoria = () => {
    setSelectedState("")
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

  // Abrir modal para editar categoría
  const handleEditarCategoria = (categoria) => {
    console.log("Editar categoría:", categoria)
    setSelectedState(categoria.estado)
    setFormData({
      id: categoria.id,
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
      departamento_id: categoria.departamento.id,
      estado: categoria.estado,
    })
    setModoEdicion(true)
    setModalAbierto(true)
  }

  // Guardar categoría (crear o actualizar)
  const handleGuardarCategoria = async () => {
    if (formData.nombre && formData.descripcion && formData.departamento_id && formData.estado) {
      if (modoEdicion) {
        // añadimos un loading para controlar otros aspectos
        setLoading(true)
        try {
          // backend
          await axiosPrivate.patch(`${API_ROUTES.CATEGORIAS.ROOT}${formData.id}/`, formData)
          // frontend
          setCategorias((prev) => prev.map((cat) => (cat.id === formData.id ? { ...cat, ...formData } : cat)))
          toast({
            title: "Categoría actualizada",
            description: "La categoría se ha actualizado con éxito.",
            className: operations.SUCCESS,
          })
          setModalAbierto(false)
        } catch (error) {
          console.error("Error al actualizar la categoría:", error)
          toast({
            title: "Error al actualizar la categoría",
            description: "Ha ocurrido un error al intentar actualizar la categoría.",
            className: operations.ERROR,
          })
        } finally {
          setLoading(false)
        }
      } else {
        // Crear nueva categoría
        // console.log(formData.departamento_id)
        // try-catch
        const nuevaCategoria = {
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          departamento: formData.departamento_id,
          estado: formData.estado,
          fecha_creacion: new Date().toISOString().split("T")[0],
        }
        try {
          const response = await axiosPrivate.post(API_ROUTES.CATEGORIAS.ROOT, nuevaCategoria)
          setCategorias((prev) => [...prev, response.data])
          toast({
            title: "Categoría creada",
            description: "La categoría se ha creado con éxito.",
            className: operations.SUCCESS,
          })
          setModalAbierto(false)
        } catch (error) {
          console.error("Error al crear la categoría:", error)
          toast({
            title: "Error al crear la categoría",
            description: "Ha ocurrido un error al intentar crear la categoría.",
            className: operations.ERROR,
          })
        }

        console.log(nuevaCategoria)
        // setCategorias((prev) => [...prev, nuevaCategoria])
      }

      // setModalAbierto(false)
      setFormData({
        id: null,
        nombre: "",
        descripcion: "",
        departamento_id: "",
        estado: "habilitado",
      })
    }
  }

  // Eliminar categoría
  const handleEliminarCategoria = (id) => {
    // conectar con api la eliminacion y proporcionar el id
    axiosPrivate
      .delete(`${API_ROUTES.CATEGORIAS.ROOT}${id}/`)
      .then(() => {
        setCategorias((prev) => prev.filter((cat) => cat.id !== id))
        toast({
          title: "Categoría eliminada",
          description: "La categoría se ha eliminado con éxito.",
          className: operations.SUCCESS,
        })
      })
      .catch((error) => {
        console.error("Error al eliminar la categoría:", error)
        toast({
          title: "Error al eliminar la categoría",
          description: "Ha ocurrido un error al intentar eliminar la categoría.",
          className: operations.ERROR,
        })
      })
  }

  // Obtener nombre del departamento
  const getNombreDepartamento = (departamento_id) => {
    const departamento = departamentosData.find((dep) => dep.id === departamento_id)
    return departamento ? departamento.nombre : "Sin asignar"
  }

  // Filtrar categorías
  const categoriasFiltradas = categorias.filter((categoria) => {
    const cumpleBusqueda =
      !filtros.busqueda ||
      categoria.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      categoria.descripcion.toLowerCase().includes(filtros.busqueda.toLowerCase())

    const cumpleDepartamento = !filtros.departamento || categoria.departamento_id.toString() === filtros.departamento
    const cumpleEstado = !filtros.estado || categoria.estado === filtros.estado

    return cumpleBusqueda && cumpleDepartamento && cumpleEstado
  })

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      departamento: "",
      estado: "",
      busqueda: "",
    })
  }

  // Estadísticas
  const estadisticas = {
    total: categorias.length,
    activas: categorias.filter((cat) => cat.estado === "habilitado").length,
    inactivas: categorias.filter((cat) => cat.estado === "deshabilitado").length,
    totalPublicaciones: categorias.reduce((sum, cat) => sum + cat.cantidad_publicaciones, 0),
  }
  // formatear fechas
  const formatDate = (dateString) => {
    // incluye la hora para el formato y mas abreviado
    const options = { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric" }
    return new Date(dateString).toLocaleDateString("es-CL", options)
  }
  // Vamos a obtener las categorias de la api
  const fetchCategorias = async () => {
    const response = await axiosPrivate.get(API_ROUTES.CATEGORIAS.ROOT)
    console.log(response.data)
    setCategorias(response.data)
  }
  const fetchDepartamentos = async () => {
    const response = await axiosPrivate.get(API_ROUTES.DEPARTAMENTOS.ROOT)
    console.log(response.data)
    setDepartamentos(response.data)
  }

  const handleRecargarTabla = async () => {
    setLoading(true)
    try {
      await fetchCategorias()
      toast({
        title: "Tabla recargada",
        description: "Los datos se han actualizado correctamente.",
        className: operations.SUCCESS,
      })
    } catch (error) {
      console.error("Error al recargar la tabla:", error)
      toast({
        title: "Error al recargar",
        description: "Ha ocurrido un error al intentar recargar los datos.",
        className: operations.ERROR,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategorias()
    fetchDepartamentos()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <TopBar title={"Gestión de Categorías"} icon={<Tag className="h-6 w-6 text-blue-600" />} />

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

        {/* Sección principal */}
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
                        value={formData.departamento_id.toString()}
                        onValueChange={(value) => handleInputChange("departamento_id", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar departamento" />
                        </SelectTrigger>
                        <SelectContent>
                          {departamentos.map((departamento) => (
                            <SelectItem key={departamento.id} value={departamento.id.toString()}>
                              {departamento.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Campo de Estado agregado al modal */}
                    <div>
                      <Label htmlFor="estado">Estado</Label>
                      <Select
                        value={selectedState}
                        onValueChange={(value) => {
                          handleInputChange("estado", value), setSelectedState(value)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        {/* estado: habilitado, inhabilitado y pendiente */}
                        <SelectContent>
                          <SelectItem value="habilitado">Habilitado</SelectItem>
                          <SelectItem value="deshabilitado">Deshabilitado</SelectItem>
                          <SelectItem value="pendiente">Pendiente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={handleGuardarCategoria}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        disabled={
                          !formData.nombre || !formData.descripcion || !formData.departamento_id || !formData.estado
                        }
                      >
                        {/* añadimos un spinner */}
                        {loading ? <Spinner bg /> : (modoEdicion ? "Actualizar" : "Crear") + " Categoría"}
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
                <Label>Departamento</Label>
                <Select
                  value={filtros.departamento}
                  onValueChange={(value) => setFiltros((prev) => ({ ...prev, departamento: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los departamentos" />
                  </SelectTrigger>
                  <SelectContent>
                    {departamentosData.map((departamento) => (
                      <SelectItem key={departamento.id} value={departamento.id.toString()}>
                        {departamento.nombre}
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
                    <SelectItem value="Activa">Activa</SelectItem>
                    <SelectItem value="Inactiva">Inactiva</SelectItem>
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
                {/* <Button variant="outline" onClick={handleRecargarTabla} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Recargar
                </Button> */}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Tabla */}
            <div className="rounded-md border">
              <Table>
                <TableHeader className>
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
                  {categoriasFiltradas.length > 0 ? (
                    categoriasFiltradas.map((categoria) => (
                      <TableRow key={categoria.id}>
                        <TableCell className="font-medium">{categoria.id}</TableCell>
                        <TableCell className="font-medium">{categoria.nombre}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {categoria.descripcion !== null ? categoria.descripcion : "Sin descripción"}
                        </TableCell>
                        <TableCell>{categoria.departamento.nombre}</TableCell>
                        <TableCell>
                          <Badge
                            variant={categoria.estado === "habilitado" ? "default" : "secondary"}

                          >
                            {categoria.estado}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{categoria.cantidad_publicaciones}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(categoria.fecha_creacion)}</TableCell>
                        <TableCell className="flex justify-center"  >
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditarCategoria(categoria)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            {/* botton que abra un modal para preguntar si realmente se quiere eliminar */}
                            <ModalEliminarCategoria
                              categoria={categoria}
                              onEliminar={handleEliminarCategoria}
                              onCancel={() => {}}
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

            {/* Paginación */}
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                Mostrando {categoriasFiltradas.length} de {categorias.length} categorías
              </div>
              <div className="text-sm text-gray-500">Página 1 de 1</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default GestionCategoria
