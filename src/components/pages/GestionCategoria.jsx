

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Download, Plus, Edit, Trash2, ArrowLeft, Tag, Eye } from "lucide-react"
import TopBar from "../TopBar"

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
  const [categorias, setCategorias] = useState(categoriasData)
  const [formData, setFormData] = useState({
    id: null,
    nombre: "",
    descripcion: "",
    departamento_id: "",
  })

  const [filtros, setFiltros] = useState({
    departamento: "",
    estado: "",
    busqueda: "",
  })

  const [modalAbierto, setModalAbierto] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)

  // Manejar cambios en el formulario
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Abrir modal para agregar nueva categoría
  const handleAgregarCategoria = () => {
    setFormData({
      id: null,
      nombre: "",
      descripcion: "",
      departamento_id: "",
    })
    setModoEdicion(false)
    setModalAbierto(true)
  }

  // Abrir modal para editar categoría
  const handleEditarCategoria = (categoria) => {
    setFormData({
      id: categoria.id,
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
      departamento_id: categoria.departamento_id,
    })
    setModoEdicion(true)
    setModalAbierto(true)
  }

  // Guardar categoría (crear o actualizar)
  const handleGuardarCategoria = () => {
    if (formData.nombre && formData.descripcion && formData.departamento_id) {
      if (modoEdicion) {
        // Actualizar categoría existente
        setCategorias((prev) =>
          prev.map((cat) =>
            cat.id === formData.id
              ? {
                  ...cat,
                  nombre: formData.nombre,
                  descripcion: formData.descripcion,
                  departamento_id: Number.parseInt(formData.departamento_id),
                }
              : cat,
          ),
        )
      } else {
        // Crear nueva categoría
        const nuevaCategoria = {
          id: Date.now(),
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          departamento_id: Number.parseInt(formData.departamento_id),
          estado: "Activa",
          fechaCreacion: new Date().toISOString().split("T")[0],
          publicaciones: 0,
        }
        setCategorias((prev) => [...prev, nuevaCategoria])
      }

      setModalAbierto(false)
      setFormData({
        id: null,
        nombre: "",
        descripcion: "",
        departamento_id: "",
      })
    }
  }

  // Eliminar categoría
  const handleEliminarCategoria = (id) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta categoría?")) {
      setCategorias((prev) => prev.filter((cat) => cat.id !== id))
    }
  }

  // Cambiar estado de categoría
  const handleCambiarEstado = (id) => {
    setCategorias((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, estado: cat.estado === "Activa" ? "Inactiva" : "Activa" } : cat)),
    )
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
    activas: categorias.filter((cat) => cat.estado === "Activa").length,
    inactivas: categorias.filter((cat) => cat.estado === "Inactiva").length,
    totalPublicaciones: categorias.reduce((sum, cat) => sum + cat.publicaciones, 0),
  }

  return (
    <>
      <TopBar title="Gestión de Categorías" icon="bx bx-tag" isOpened={true} setIsOpened={() => {}} />

      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        {/* Botón para volver */}
        {onVolver && (
          <Button variant="outline" onClick={onVolver} className="mb-4 bg-transparent">
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
                  <p className="text-green-100 text-sm">Activas</p>
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
                  <p className="text-red-100 text-sm">Inactivas</p>
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
                          {departamentosData.map((departamento) => (
                            <SelectItem key={departamento.id} value={departamento.id.toString()}>
                              {departamento.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={handleGuardarCategoria}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        disabled={!formData.nombre || !formData.descripcion || !formData.departamento_id}
                      >
                        {modoEdicion ? "Actualizar" : "Crear"} Categoría
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
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Tabla */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Publicaciones</TableHead>
                    <TableHead>Fecha Creación</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoriasFiltradas.length > 0 ? (
                    categoriasFiltradas.map((categoria) => (
                      <TableRow key={categoria.id}>
                        <TableCell className="font-medium">{categoria.id}</TableCell>
                        <TableCell className="font-medium">{categoria.nombre}</TableCell>
                        <TableCell className="max-w-xs truncate">{categoria.descripcion}</TableCell>
                        <TableCell>{getNombreDepartamento(categoria.departamento_id)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={categoria.estado === "Activa" ? "default" : "secondary"}
                            className={
                              categoria.estado === "Activa"
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-red-100 text-red-800 hover:bg-red-200"
                            }
                          >
                            {categoria.estado}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{categoria.publicaciones}</Badge>
                        </TableCell>
                        <TableCell>{categoria.fechaCreacion}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditarCategoria(categoria)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCambiarEstado(categoria.id)}
                              className={
                                categoria.estado === "Activa"
                                  ? "text-red-600 hover:text-red-700"
                                  : "text-green-600 hover:text-green-700"
                              }
                            >
                              {categoria.estado === "Activa" ? "Desactivar" : "Activar"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEliminarCategoria(categoria.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
    </>
  )
}

export default GestionCategoria
