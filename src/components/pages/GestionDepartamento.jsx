"use client"

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
import { Search, Download, Plus, Edit, Trash2, ArrowLeft, Building2, Users, Eye } from "lucide-react"
import TopBar from "../TopBar"

// Datos de ejemplo para departamentos
const departamentosData = [
  {
    id: 1,
    nombre: "Secretaría General",
    descripcion: "Coordinación general y administración municipal",
    estado: "Activo",
    fechaCreacion: "2024-01-10",
    empleados: 15,
    categorias: 8,
  },
  {
    id: 2,
    nombre: "Obras Públicas",
    descripcion: "Planificación y ejecución de obras de infraestructura",
    estado: "Activo",
    fechaCreacion: "2024-01-12",
    empleados: 25,
    categorias: 12,
  },
  {
    id: 3,
    nombre: "Desarrollo Social",
    descripcion: "Programas sociales y asistencia comunitaria",
    estado: "Activo",
    fechaCreacion: "2024-01-15",
    empleados: 18,
    categorias: 6,
  },
  {
    id: 4,
    nombre: "Medio Ambiente",
    descripcion: "Políticas ambientales y sostenibilidad",
    estado: "Activo",
    fechaCreacion: "2024-01-18",
    empleados: 12,
    categorias: 4,
  },
  {
    id: 5,
    nombre: "Cultura y Turismo",
    descripcion: "Promoción cultural y desarrollo turístico",
    estado: "Activo",
    fechaCreacion: "2024-01-20",
    empleados: 10,
    categorias: 7,
  },
  {
    id: 6,
    nombre: "Deportes",
    descripcion: "Actividades deportivas y recreativas municipales",
    estado: "Inactivo",
    fechaCreacion: "2024-01-22",
    empleados: 8,
    categorias: 3,
  },
  {
    id: 7,
    nombre: "Educación",
    descripcion: "Programas educativos y capacitación ciudadana",
    estado: "Activo",
    fechaCreacion: "2024-01-25",
    empleados: 20,
    categorias: 9,
  },
  {
    id: 8,
    nombre: "Salud",
    descripcion: "Servicios de salud pública y prevención",
    estado: "Activo",
    fechaCreacion: "2024-01-28",
    empleados: 22,
    categorias: 5,
  },
]

const GestionDepartamento = ({ onVolver }) => {
  const [departamentos, setDepartamentos] = useState(departamentosData)
  const [formData, setFormData] = useState({
    id: null,
    nombre: "",
    descripcion: "",
    estado: "Activo", // Agregado el estado al formData
  })
  const [filtros, setFiltros] = useState({
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

  // Abrir modal para agregar nuevo departamento
  const handleAgregarDepartamento = () => {
    setFormData({
      id: null,
      nombre: "",
      descripcion: "",
      estado: "Activo",
    })
    setModoEdicion(false)
    setModalAbierto(true)
  }

  // Abrir modal para editar departamento
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

  // Guardar departamento (crear o actualizar)
  const handleGuardarDepartamento = () => {
    if (formData.nombre && formData.descripcion && formData.estado) {
      if (modoEdicion) {
        // Actualizar departamento existente
        setDepartamentos((prev) =>
          prev.map((dept) =>
            dept.id === formData.id
              ? {
                  ...dept,
                  nombre: formData.nombre,
                  descripcion: formData.descripcion,
                  estado: formData.estado,
                }
              : dept,
          ),
        )
      } else {
        // Crear nuevo departamento
        const nuevoDepartamento = {
          id: Date.now(),
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          estado: formData.estado,
          fechaCreacion: new Date().toISOString().split("T")[0],
          empleados: 0,
          categorias: 0,
        }
        setDepartamentos((prev) => [...prev, nuevoDepartamento])
      }

      setModalAbierto(false)
      setFormData({
        id: null,
        nombre: "",
        descripcion: "",
        estado: "Activo",
      })
    }
  }

  // Eliminar departamento
  const handleEliminarDepartamento = (id) => {
    if (confirm("¿Estás seguro de que deseas eliminar este departamento?")) {
      setDepartamentos((prev) => prev.filter((dept) => dept.id !== id))
    }
  }

  // Filtrar departamentos
  const departamentosFiltrados = departamentos.filter((departamento) => {
    const cumpleBusqueda =
      !filtros.busqueda ||
      departamento.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      departamento.descripcion.toLowerCase().includes(filtros.busqueda.toLowerCase())

    const cumpleEstado = !filtros.estado || departamento.estado === filtros.estado

    return cumpleBusqueda && cumpleEstado
  })

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      estado: "",
      busqueda: "",
    })
  }

  // Estadísticas
  const estadisticas = {
    total: departamentos.length,
    activos: departamentos.filter((dept) => dept.estado === "Activo").length,
    inactivos: departamentos.filter((dept) => dept.estado === "Inactivo").length,
    totalEmpleados: departamentos.reduce((sum, dept) => sum + dept.empleados, 0),
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
                  <p className="text-green-100 text-sm">Activos</p>
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
                  <p className="text-red-100 text-sm">Inactivos</p>
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
                    {/* Campo de Estado agregado al modal */}
                    <div>
                      <Label htmlFor="estado">Estado</Label>
                      <Select value={formData.estado} onValueChange={(value) => handleInputChange("estado", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Activo">Activo</SelectItem>
                          <SelectItem value="Inactivo">Inactivo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={handleGuardarDepartamento}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        disabled={!formData.nombre || !formData.descripcion || !formData.estado}
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
                    <SelectItem value="Activo">Activo</SelectItem>
                    <SelectItem value="Inactivo">Inactivo</SelectItem>
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
                    <TableHead>Estado</TableHead>
                    <TableHead>Empleados</TableHead>
                    <TableHead>Categorías</TableHead>
                    <TableHead>Fecha Creación</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departamentosFiltrados.length > 0 ? (
                    departamentosFiltrados.map((departamento) => (
                      <TableRow key={departamento.id}>
                        <TableCell className="font-medium">{departamento.id}</TableCell>
                        <TableCell className="font-medium">{departamento.nombre}</TableCell>
                        <TableCell className="max-w-xs truncate">{departamento.descripcion}</TableCell>
                        <TableCell>
                          <Badge
                            variant={departamento.estado === "Activo" ? "default" : "secondary"}
                            className={
                              departamento.estado === "Activo"
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-red-100 text-red-800 hover:bg-red-200"
                            }
                          >
                            {departamento.estado}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            {departamento.empleados}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-purple-50 text-purple-700">
                            {departamento.categorias}
                          </Badge>
                        </TableCell>
                        <TableCell>{departamento.fechaCreacion}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditarDepartamento(departamento)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEliminarDepartamento(departamento.id)}
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
                        No se encontraron departamentos
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Paginación */}
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                Mostrando {departamentosFiltrados.length} de {departamentos.length} departamentos
              </div>
              <div className="text-sm text-gray-500">Página 1 de 1</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default GestionDepartamento
