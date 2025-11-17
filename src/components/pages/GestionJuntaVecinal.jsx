"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet"
import L from "leaflet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Download, Filter, Plus, Edit, MapPin, ArrowLeft, Map, Trash2, Import } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import TopBar from "../TopBar"
import useAxiosPrivate from "@/hooks/useAxiosPrivate"
import { set } from "date-fns"
import { useToast } from "../../hooks/use-toast"
import { operations } from "../../lib/constants"
import { API_ROUTES } from "@/api/apiRoutes"
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng)
    },
  })
  return null
}

const juntasVecinalesData = [
  {
    id: 1,
    codigo: "JV001",
    nombre_junta: "Junta Vecinal Centro",
    nombre_calle: "Av. Principal",
    numero_calle: "123",
    estado: "habilitado",
    categoria: "Urbana",
    fecha_creacion: "2024-01-15T10:30:00Z",
    latitud: -22.4558,
    longitud: -68.9293,
    tipo: "actual",
  },
  {
    id: 2,
    codigo: "JV002",
    nombre_junta: "Junta Vecinal Norte",
    nombre_calle: "Calle Los Pinos",
    numero_calle: "456",
    estado: "deshabilitado",
    categoria: "Residencial",
    fecha_creacion: "2024-02-20T14:15:00Z",
    latitud: -22.4517,
    longitud: -68.9172,
    tipo: "actual",
  },
  {
    id: 3,
    codigo: "JV003",
    nombre_junta: "Junta Vecinal Sur",
    nombre_calle: "Av. Granaderos",
    numero_calle: "789",
    estado: "habilitado",
    categoria: "Comercial",
    fecha_creacion: "2024-03-10T09:45:00Z",
    latitud: -22.4621,
    longitud: -68.9338,
    tipo: "actual",
  },
]

const GestionJuntaVecinal = ({ onVolver }) => {
  const [juntasVecinales, setJuntasVecinales] = useState([])
  const [nuevasUbicaciones, setNuevasUbicaciones] = useState([])
  const axiosPrivate = useAxiosPrivate()
  const { toast } = useToast()
  const customIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  })

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingJunta, setEditingJunta] = useState(null)
  const [editFormData, setEditFormData] = useState({

    nombre: "",
    calle: "",
    numero: "",
    estado: "",
    ubicacion: null,
    latitud: "",
    longitud: "",
  })

  const [formData, setFormData] = useState({
    nombre: "",
    calle: "",
    numero: "",
    estado: "deshabilitado", // Estado por defecto
    ubicacion: null,
    latitud: "",
    longitud: "",
  })

  const [filtros, setFiltros] = useState({
    categoria: "",
    estado: "",
    fechaInicio: "",
    fechaFin: "",
    busqueda: "",
  })

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [juntaToDelete, setJuntaToDelete] = useState(null)

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const prevState = prev
      return {
        ...prevState,
        [field]: value,
      }
    })

    if (field === "latitud" || field === "longitud") {
      const lat = field === "latitud" ? Number.parseFloat(value) : Number.parseFloat(formData.latitud)
      const lng = field === "longitud" ? Number.parseFloat(value) : Number.parseFloat(formData.longitud)

      if (!isNaN(lat) && !isNaN(lng)) {
        setFormData((current) => ({
          ...current,
          ubicacion: { lat, lng },
        }))
      }
    }
  }

  const handleMapClick = (latlng) => {
    setFormData((prev) => ({
      ...prev,
      ubicacion: latlng,
      latitud: latlng.lat.toFixed(8),
      longitud: latlng.lng.toFixed(8),
    }))
  }

  const handleAgregarJunta = async () => {
    try {
      if (formData.nombre && formData.calle && formData.numero && formData.ubicacion && formData.estado) {
        console.log("Nueva junta vecinal:", formData)
        const nuevaJunta = {
          id: null, // Generar un ID temporal o manejarlo en el backend
          nombre_junta: formData.nombre,
          nombre_calle: formData.calle,
          numero_calle: formData.numero,
          estado: formData.estado,
          categoria: "Nueva",
          fecha_creacion: new Date().toISOString(),
          latitud: Number.parseFloat(formData.ubicacion.lat.toFixed(6)),
          longitud: Number.parseFloat(formData.ubicacion.lng.toFixed(6)),
          tipo: "nueva",
        }
        console.log("Nueva junta vecinal:", nuevaJunta)
        const response = await axiosPrivate.post(API_ROUTES.JUNTAS_VECINALES.ROOT, {
          nombre_junta: nuevaJunta.nombre_junta,
          nombre_calle: nuevaJunta.nombre_calle,
          numero_calle: nuevaJunta.numero_calle,
          estado: nuevaJunta.estado,
          latitud: nuevaJunta.latitud,
          longitud: nuevaJunta.longitud,
        })
        // Obtener el ID asignado por el backend
        nuevaJunta.id = response.data.id
        console.log("Response from backend:", response)
        setNuevasUbicaciones((prev) => [...prev, nuevaJunta])

        setFormData({
          nombre: "",
          calle: "",
          numero: "",
          estado: "deshabilitado",
          ubicacion: null,
          latitud: "",
          longitud: "",
        })
        toast({
          title: "Junta vecinal agregada",
          description: "La nueva junta vecinal ha sido agregada exitosamente.",
          className: operations.SUCCESS,
        })
      }
    } catch (error) {
      toast({
        title: "Error al agregar junta vecinal",
        description: "Ha ocurrido un error al agregar la nueva junta vecinal.",
        className: operations.ERROR,
      })
      console.error("Error al agregar nueva junta vecinal:", error)
    }
  }

  const handleEditClick = (junta) => {
    console.log("Editing junta:", junta)
    setEditingJunta(junta)
    setEditFormData({
      id: junta.id,
      nombre: junta.nombre_junta,
      calle: junta.nombre_calle,
      numero: junta.numero_calle,
      estado: junta.estado,
      ubicacion: { lat: junta.latitud, lng: junta.longitud },
      latitud: junta.latitud.toString(),
      longitud: junta.longitud.toString(),
    })
    setEditModalOpen(true)
  }

  const handleEditInputChange = (field, value) => {
    setEditFormData((prev) => {
      const prevState = prev
      return {
        ...prevState,
        [field]: value,
      }
    })

    if (field === "latitud" || field === "longitud") {
      const lat = field === "latitud" ? Number.parseFloat(value) : Number.parseFloat(editFormData.latitud)
      const lng = field === "longitud" ? Number.parseFloat(value) : Number.parseFloat(editFormData.longitud)

      if (!isNaN(lat) && !isNaN(lng)) {
        setEditFormData((current) => ({
          ...current,
          ubicacion: { lat, lng },
        }))
      }
    }
  }

  const handleEditMapClick = (latlng) => {
    setEditFormData((prev) => ({
      ...prev,
      ubicacion: latlng,
      latitud: latlng.lat.toFixed(8),
      longitud: latlng.lng.toFixed(8),
    }))
  }

  const handleSaveEdit = async () => {
    try {
      if (
        editFormData.nombre &&
        editFormData.calle &&
        editFormData.numero &&
        editFormData.latitud &&
        editFormData.longitud &&
        editFormData.estado
      ) {
        const updatedJunta = {
          ...editingJunta,
          nombre_junta: editFormData.nombre,
          nombre_calle: editFormData.calle,
          numero_calle: editFormData.numero,
          estado: editFormData.estado,
          latitud: Number.parseFloat(editFormData.latitud).toFixed(6),
          longitud: Number.parseFloat(editFormData.longitud).toFixed(6),
        }
        console.log("Updated junta:", editFormData)
        console.log("Updated junta to save:", updatedJunta)
        console.log("Editing junta:", editingJunta)
        console.log("Editing junta with ID:", editFormData.id)
        const response = await axiosPrivate.patch(`${API_ROUTES.JUNTAS_VECINALES.ROOT}${editFormData.id}/`, updatedJunta)
        console.log("Response from backend:", response)
        setJuntasVecinales((prev) => prev.map((junta) => (junta.id === editingJunta.id ? updatedJunta : junta)))

        // Actualizar también en nuevasUbicaciones si aplica
        setNuevasUbicaciones((prev) => prev.map((junta) => (junta.id === editingJunta.id ? updatedJunta : junta)))

        setEditModalOpen(false)
        setEditingJunta(null)

        toast({
          title: "Junta vecinal actualizada",
          description: "La junta vecinal ha sido actualizada exitosamente.",
          className: operations.SUCCESS,
        })
      }
    } catch (error) {
      toast({
        title: "Error al actualizar la junta vecinal",
        description: "Ha ocurrido un error al intentar actualizar la junta vecinal.",
        className: operations.ERROR,
      })
      console.error("Error al actualizar junta vecinal:", error)
    }
  }

  const handleDeleteClick = (junta) => {
    setJuntaToDelete(junta)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!juntaToDelete) return

    try {
      const response = await axiosPrivate.delete(`${API_ROUTES.JUNTAS_VECINALES.ROOT}${juntaToDelete.id}/`)
      console.log("Delete response:", response)
      if (response.status === 200 || response.status === 204) {
        if (juntaToDelete.tipo === "nueva") {
          // Eliminar de nuevasUbicaciones
          setNuevasUbicaciones((prev) => prev.filter((item) => item.id !== juntaToDelete.id))
        } else {
          // Eliminar de juntasVecinales
          setJuntasVecinales((prev) => prev.filter((item) => item.id !== juntaToDelete.id))
        }
        toast({
          title: "Junta vecinal eliminada",
          description: "La junta vecinal ha sido eliminada exitosamente.",
          className: operations.SUCCESS,
        })
      }
    } catch (error) {
      toast({
        title: "Error al eliminar junta vecinal",
        description: "Ha ocurrido un error al intentar eliminar la junta vecinal.",
        className: operations.ERROR,
      })
      console.error("Error al eliminar junta vecinal:", error)
    } finally {
      setDeleteModalOpen(false)
      setJuntaToDelete(null)
    }
  }

  const datosFiltrados = [...juntasVecinales, ...nuevasUbicaciones].filter((item) => {
    const cumpleBusqueda =
      !filtros.busqueda ||
      item.nombre_junta.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      item.nombre_calle.toLowerCase().includes(filtros.busqueda.toLowerCase())

    const cumpleCategoria = !filtros.categoria || item.categoria === filtros.categoria
    const cumpleEstado = !filtros.estado || item.estado === filtros.estado

    return cumpleBusqueda && cumpleCategoria && cumpleEstado
  })

  const limpiarFiltros = () => {
    setFiltros({
      categoria: "",
      estado: "",
      fechaInicio: "",
      fechaFin: "",
      busqueda: "",
    })
  }

  const fetchJuntas = async () => {
    try {
      const response = await axiosPrivate.get(API_ROUTES.JUNTAS_VECINALES.ROOT)
      console.log("Fetch juntas vecinales response:", response)
      setJuntasVecinales(response.data)
    } catch (error) {
      console.error("Error loading juntas vecinales:", error)
    }
  }

  useEffect(() => {
    fetchJuntas()
  }, [])

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric" }
    return new Date(dateString).toLocaleDateString("es-CL", options)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar title={"Gestión de Juntas Vecinales"} icon={<Map className="h-6 w-6 text-blue-600" />} />
      <div className="p-6 space-y-6">
        {onVolver && (
          <Button variant="outline" onClick={onVolver} className="mb-4 bg-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Gestión de Datos
          </Button>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Agregar Nueva Junta Vecinal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange("nombre", e.target.value)}
                  placeholder="Ej: Junta Vecinal Centro"
                />
              </div>
              <div>
                <Label htmlFor="calle">Calle</Label>
                <Input
                  id="calle"
                  value={formData.calle}
                  onChange={(e) => handleInputChange("calle", e.target.value)}
                  placeholder="Ej: Av. Principal"
                />
              </div>
              <div>
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  value={formData.numero}
                  onChange={(e) => handleInputChange("numero", e.target.value)}
                  placeholder="Ej: 123"
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitud">Latitud</Label>
                  <Input
                    id="latitud"
                    type="number"
                    step="any"
                    value={formData.latitud}
                    onChange={(e) => handleInputChange("latitud", e.target.value)}
                    placeholder="Ej: -22.4558"
                  />
                </div>
                <div>
                  <Label htmlFor="longitud">Longitud</Label>
                  <Input
                    id="longitud"
                    type="number"
                    step="any"
                    value={formData.longitud}
                    onChange={(e) => handleInputChange("longitud", e.target.value)}
                    placeholder="Ej: -68.9293"
                  />
                </div>
              </div>
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <MapPin className="h-4 w-4 inline mr-2" />
                Seleccione la ubicación en el mapa o ingrese las coordenadas manualmente
                {formData.ubicacion && (
                  <div className="mt-2 text-xs">
                    Coordenadas: {formData.ubicacion.lat.toFixed(6)}, {formData.ubicacion.lng.toFixed(6)}
                  </div>
                )}
              </div>
              <Button
                onClick={handleAgregarJunta}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={
                  !formData.nombre || !formData.calle || !formData.numero || !formData.ubicacion || !formData.estado
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Junta Vecinal
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mapa de Ubicaciones</CardTitle>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span>Actuales</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span>A agregar</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* meanwhile delete modal open hide the map too */}
              {!(editModalOpen || deleteModalOpen) ? (
                <div className="h-96 rounded-lg overflow-hidden">
                  <MapContainer
                    center={[
                      -22.4667,
                      -68.9333, // Coordenadas aproximadas de Calama, Chile
                    ]}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

                    />
                    <MapClickHandler onMapClick={handleMapClick} />

                    {juntasVecinales.map((junta) => (
                      <Marker key={junta.id} position={[junta.latitud, junta.longitud]}>
                        <Popup>
                          <div>
                            <h3 className="font-semibold">{junta.nombre_junta}</h3>
                            <p>
                              {junta.nombre_calle} {junta.numero_calle}
                            </p>
                            <Badge variant={junta.estado === "habilitado" ? "default" : "secondary"}>
                              {junta.estado}
                            </Badge>
                          </div>
                        </Popup>
                      </Marker>
                    ))}

                    {nuevasUbicaciones.map((junta) => (
                      <Marker key={junta.id} position={[junta.latitud, junta.longitud]}>
                        <Popup>
                          <div>
                            <h3 className="font-semibold">{junta.nombre_junta}</h3>
                            <p>
                              {junta.nombre_calle} {junta.numero_calle}
                            </p>
                            <Badge
                              variant={junta.estado === "habilitado" ? "default" : "secondary"}
                              className="bg-green-100 text-green-800"
                            >
                              {junta.estado} (Nueva)
                            </Badge>
                          </div>
                        </Popup>
                      </Marker>
                    ))}

                    {formData.ubicacion && (
                      <Marker position={[formData.ubicacion.lat, formData.ubicacion.lng]} icon={customIcon}>
                        <Popup>
                          <div>
                            <h3 className="font-semibold">Nueva Ubicación</h3>
                            <p>Clic para confirmar</p>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                  </MapContainer>
                </div>
              ) : (
                <div className="h-96 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                  <p className="text-gray-500">Mapa desactivado durante la edición</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Listado de Juntas Vecinales</CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
              <div>
                <Label>Estado</Label>
                <Select
                  value={filtros.estado}
                  onValueChange={(value) => setFiltros((prev) => ({ ...prev, estado: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar opciones" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="habilitado">Habilitado</SelectItem>
                    <SelectItem value="deshabilitado">Deshabilitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Fecha Inicio</Label>
                <Input
                  type="date"
                  value={filtros.fechaInicio}
                  onChange={(e) => setFiltros((prev) => ({ ...prev, fechaInicio: e.target.value }))}
                />
              </div>
              <div>
                <Label>Fecha Fin</Label>
                <Input
                  type="date"
                  value={filtros.fechaFin}
                  onChange={(e) => setFiltros((prev) => ({ ...prev, fechaFin: e.target.value }))}
                />
              </div>
              <div className="flex gap-2 items-end">
                <Button variant="outline" onClick={limpiarFiltros}>
                  Limpiar filtros
                </Button>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Filter className="h-4 w-4 mr-2" />
                  Aplicar filtros
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por título..."
                  value={filtros.busqueda}
                  onChange={(e) => setFiltros((prev) => ({ ...prev, busqueda: e.target.value }))}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar datos
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader >
                  <TableRow className="bg-green-50 bold-text">
                    <TableHead className="text-center text-green-700 font-bold">Nombre</TableHead>
                    <TableHead className="text-center text-green-700 font-bold">Dirección</TableHead>
                    <TableHead className="text-center text-green-700 font-bold">Estado</TableHead>
                    <TableHead className="text-center text-green-700 font-bold">Fecha de Creación</TableHead>
                    <TableHead className="text-center text-green-700 font-bold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-center">
                  {datosFiltrados.length > 0 ? (
                    datosFiltrados.map((junta) => (
                      <TableRow key={junta.id}>
                        <TableCell>{junta.nombre_junta}</TableCell>
                        <TableCell>
                          {junta.nombre_calle} {junta.numero_calle}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              junta.estado === "habilitado"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {junta.estado}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(junta.fecha_creacion)}</TableCell>
                        <TableCell className="flex justify-center">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditClick(junta)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(junta)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        0 Resultados encontrados
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">Página 1 de 1</div>
              <div className="text-sm text-gray-500">{datosFiltrados.length} Resultados encontrados</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Junta Vecinal</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-nombre">Nombre</Label>
                <Input
                  id="edit-nombre"
                  value={editFormData.nombre}
                  onChange={(e) => handleEditInputChange("nombre", e.target.value)}
                  placeholder="Ej: Junta Vecinal Centro"
                />
              </div>
              <div>
                <Label htmlFor="edit-calle">Calle</Label>
                <Input
                  id="edit-calle"
                  value={editFormData.calle}
                  onChange={(e) => handleEditInputChange("calle", e.target.value)}
                  placeholder="Ej: Av. Principal"
                />
              </div>
              <div>
                <Label htmlFor="edit-numero">Número</Label>
                <Input
                  id="edit-numero"
                  value={editFormData.numero}
                  onChange={(e) => handleEditInputChange("numero", e.target.value)}
                  placeholder="Ej: 123"
                />
              </div>
              <div>
                <Label htmlFor="edit-estado">Estado</Label>
                <Select value={editFormData.estado} onValueChange={(value) => handleEditInputChange("estado", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="habilitado">Habilitado</SelectItem>
                    <SelectItem value="deshabilitado">Deshabilitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-latitud">Latitud</Label>
                  <Input
                    id="edit-latitud"
                    type="number"
                    step="any"
                    value={editFormData.latitud}
                    onChange={(e) => handleEditInputChange("latitud", e.target.value)}
                    placeholder="Ej: -22.4558"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-longitud">Longitud</Label>
                  <Input
                    id="edit-longitud"
                    type="number"
                    step="any"
                    value={editFormData.longitud}
                    onChange={(e) => handleEditInputChange("longitud", e.target.value)}
                    placeholder="Ej: -68.9293"
                  />
                </div>
              </div>
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <MapPin className="h-4 w-4 inline mr-2" />
                Seleccione la nueva ubicación en el mapa o ingrese las coordenadas manualmente
                {editFormData.ubicacion && (
                  <div className="mt-2 text-xs">
                    Coordenadas: {editFormData.latitud}, {editFormData.longitud}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveEdit}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={
                    !editFormData.nombre ||
                    !editFormData.calle ||
                    !editFormData.numero ||
                    !editFormData.ubicacion ||
                    !editFormData.estado
                  }
                >
                  Guardar Cambios
                </Button>
                <Button variant="outline" onClick={() => setEditModalOpen(false)} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Ubicación en el Mapa</h3>
              <div className="h-96 rounded-lg overflow-hidden border">
                <MapContainer
                  center={editFormData.ubicacion ? [editFormData.latitud, editFormData.longitud] : [-22.4667, -68.9333]}
                  zoom={15}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <MapClickHandler onMapClick={handleEditMapClick} />

                  {editFormData.ubicacion && (
                    <Marker position={[editFormData.latitud, editFormData.longitud]} icon={customIcon}>
                      <Popup>
                        <div>
                          <h3 className="font-semibold">Ubicación Actual</h3>
                          <p>{editFormData.nombre}</p>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              ¿Estás seguro de que quieres eliminar la junta vecinal "{juntaToDelete?.nombre_junta}"?
            </p>
            <p className="text-sm text-gray-500 mt-2">Esta acción no se puede deshacer.</p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default GestionJuntaVecinal