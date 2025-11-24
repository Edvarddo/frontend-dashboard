"use client"

import { useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet"
import L from "leaflet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, MapPin, ArrowLeft, Map, Trash2, Filter } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import TopBar from "../TopBar"
import useAxiosPrivate from "@/hooks/useAxiosPrivate"
import { useToast } from "../../hooks/use-toast"
import { operations } from "../../lib/constants"
import { API_ROUTES } from "@/api/apiRoutes"

// Importaciones de Componentes de Filtros y Paginación
import FilterContainer from "../filters/FilterContainer"
import FilterMultiSelect from "../filters/FilterMultiSelect"
import FilterDatePicker from "../filters/FilterDatePicker"
import FilterInput from "../filters/FilterInput" // <--- Nuevo Componente
import Paginador from "../Paginador"
import useFilters from "../../hooks/useFilters"
import { usePaginatedFetch } from "@/hooks/usePaginatedFetch" // <--- Hook de Paginación

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng)
    },
  })
  return null
}

const GestionJuntaVecinal = ({ onVolver }) => {
  const axiosPrivate = useAxiosPrivate()
  const { toast } = useToast()

  // 1. Gestión de Filtros
  const { filters, setFilter, resetFilters, getQueryParams } = useFilters({
    estado: [],
    fecha_inicio: null,
    fecha_fin: null,
    nombre: "",
  })

  // Estado para la URL dinámica de paginación
  const [filterUrl, setFilterUrl] = useState(null)

  // 2. Implementación del Hook usePaginatedFetch
  const {
    data: juntasVecinales, // Los datos de la tabla vienen de aquí
    totalItems,
    loading,
    currentPage,
    itemsPerPage,
    setPage,
    setPageSize,
    refresh // Usaremos esto para recargar tras CRUD
  } = usePaginatedFetch({
    baseUrl: API_ROUTES.JUNTAS_VECINALES.PAGINATED || API_ROUTES.JUNTAS_VECINALES.ROOT, // Asegúrate que tu API route sea la correcta
    externalUrl: filterUrl,
    initialPageSize: 10
  })

  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // Icono del Mapa
  const customIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  })

  // Estados para Modales y Formularios
  const [nuevasUbicaciones, setNuevasUbicaciones] = useState([])
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingJunta, setEditingJunta] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [juntaToDelete, setJuntaToDelete] = useState(null)

  const [formData, setFormData] = useState({
    nombre: "",
    calle: "",
    numero: "",
    estado: "deshabilitado",
    ubicacion: null,
    latitud: "",
    longitud: "",
  })

  const [editFormData, setEditFormData] = useState({
    nombre: "",
    calle: "",
    numero: "",
    estado: "",
    ubicacion: null,
    latitud: "",
    longitud: "",
  })

  // --- Lógica de Aplicación de Filtros ---
  const handleApplyFilters = () => {
    const query = getQueryParams()
    // Si hay query, construimos la URL con filtros, si no, null para usar la base
    if (query) {
      setFilterUrl(`${API_ROUTES.JUNTAS_VECINALES.PAGINATED || API_ROUTES.JUNTAS_VECINALES.ROOT}?${query}`)
    } else {
      setFilterUrl(null)
    }
    setPage(1) // Volver a primera página al filtrar
  }

  const handleCleanFilters = () => {
    resetFilters()
    setFilterUrl(null)
    setPage(1)
  }

  // --- Lógica de Formularios (Agregar) ---
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (field === "latitud" || field === "longitud") {
      const lat = field === "latitud" ? parseFloat(value) : parseFloat(formData.latitud)
      const lng = field === "longitud" ? parseFloat(value) : parseFloat(formData.longitud)
      if (!isNaN(lat) && !isNaN(lng)) {
        setFormData((current) => ({ ...current, ubicacion: { lat, lng } }))
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
        const nuevaJuntaPayload = {
          nombre_junta: formData.nombre,
          nombre_calle: formData.calle,
          numero_calle: formData.numero,
          estado: formData.estado,
          latitud: parseFloat(formData.ubicacion.lat.toFixed(6)),
          longitud: parseFloat(formData.ubicacion.lng.toFixed(6)),
          // categoria y fecha se manejan usualmente en backend, pero se pueden enviar si es necesario
        }

        const response = await axiosPrivate.post(API_ROUTES.JUNTAS_VECINALES.ROOT, nuevaJuntaPayload)

        // Agregar temporalmente al mapa (opcional, ya que el refresh recargará la tabla)
        const nuevaJuntaLocal = { ...nuevaJuntaPayload, id: response.data.id, tipo: "nueva" }
        setNuevasUbicaciones((prev) => [...prev, nuevaJuntaLocal])

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

        refresh() // <--- Recargar tabla
      }
    } catch (error) {
      toast({
        title: "Error al agregar junta vecinal",
        description: "Ha ocurrido un error al agregar la nueva junta vecinal.",
        className: operations.ERROR,
      })
      console.error("Error:", error)
    }
  }

  // --- Lógica de Edición ---
  const handleEditClick = (junta) => {
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
    setEditFormData((prev) => ({ ...prev, [field]: value }))

    if (field === "latitud" || field === "longitud") {
      const lat = field === "latitud" ? parseFloat(value) : parseFloat(editFormData.latitud)
      const lng = field === "longitud" ? parseFloat(value) : parseFloat(editFormData.longitud)
      if (!isNaN(lat) && !isNaN(lng)) {
        setEditFormData((current) => ({ ...current, ubicacion: { lat, lng } }))
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
      const updatedJunta = {
        nombre_junta: editFormData.nombre,
        nombre_calle: editFormData.calle,
        numero_calle: editFormData.numero,
        estado: editFormData.estado,
        latitud: parseFloat(editFormData.latitud).toFixed(6),
        longitud: parseFloat(editFormData.longitud).toFixed(6),
      }

      await axiosPrivate.patch(`${API_ROUTES.JUNTAS_VECINALES.ROOT}${editFormData.id}/`, updatedJunta)

      setEditModalOpen(false)
      setEditingJunta(null)

      toast({
        title: "Junta vecinal actualizada",
        description: "La junta vecinal ha sido actualizada exitosamente.",
        className: operations.SUCCESS,
      })

      refresh() // <--- Recargar tabla
    } catch (error) {
      toast({
        title: "Error al actualizar",
        description: "Ha ocurrido un error al intentar actualizar la junta vecinal.",
        className: operations.ERROR,
      })
      console.error("Error:", error)
    }
  }

  // --- Lógica de Eliminación ---
  const handleDeleteClick = (junta) => {
    setJuntaToDelete(junta)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!juntaToDelete) return
    try {
      await axiosPrivate.delete(`${API_ROUTES.JUNTAS_VECINALES.ROOT}${juntaToDelete.id}/`)

      // Limpiar marcadores temporales si es necesario
      setNuevasUbicaciones((prev) => prev.filter((item) => item.id !== juntaToDelete.id))

      toast({
        title: "Junta vecinal eliminada",
        description: "La junta vecinal ha sido eliminada exitosamente.",
        className: operations.SUCCESS,
      })

      refresh() // <--- Recargar tabla (maneja lógica de página vacía internamente si el hook está optimizado, o vuelve a cargar la actual)
    } catch (error) {
      toast({
        title: "Error al eliminar",
        description: "Ha ocurrido un error al intentar eliminar la junta vecinal.",
        className: operations.ERROR,
      })
      console.error("Error:", error)
    } finally {
      setDeleteModalOpen(false)
      setJuntaToDelete(null)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "short", day: "numeric" }
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
          {/* Formulario de Creación */}
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
                Seleccione la ubicación en el mapa
                {formData.ubicacion && (
                  <div className="mt-2 text-xs">
                    Coordenadas: {formData.ubicacion.lat.toFixed(6)}, {formData.ubicacion.lng.toFixed(6)}
                  </div>
                )}
              </div>
              <Button
                onClick={handleAgregarJunta}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={!formData.nombre || !formData.calle || !formData.numero || !formData.ubicacion || !formData.estado}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Junta Vecinal
              </Button>
            </CardContent>
          </Card>

          {/* Mapa General */}
          <Card>
            <CardHeader>
              <CardTitle>Mapa de Ubicaciones</CardTitle>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span>Existentes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span>Nueva (Selección)</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!(editModalOpen || deleteModalOpen) ? (
                <div className="h-96 rounded-lg overflow-hidden">
                  <MapContainer
                    center={[-22.4667, -68.9333]}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapClickHandler onMapClick={handleMapClick} />

                    {/* Juntas cargadas desde API */}
                    {juntasVecinales.map((junta) => (
                      <Marker key={junta.id} position={[junta.latitud, junta.longitud]}>
                        <Popup>
                          <div>
                            <h3 className="font-semibold">{junta.nombre_junta}</h3>
                            <p>{junta.nombre_calle} {junta.numero_calle}</p>
                            <Badge variant={junta.estado === "habilitado" ? "default" : "secondary"}>
                              {junta.estado}
                            </Badge>
                          </div>
                        </Popup>
                      </Marker>
                    ))}

                    {/* Nuevas ubicaciones agregadas localmente antes de refresh */}
                    {nuevasUbicaciones.map((junta) => (
                      <Marker key={`new-${junta.id}`} position={[junta.latitud, junta.longitud]} icon={customIcon}>
                        <Popup>Agregada recientemente</Popup>
                      </Marker>
                    ))}

                    {/* Marcador de selección actual */}
                    {formData.ubicacion && (
                      <Marker position={[formData.ubicacion.lat, formData.ubicacion.lng]} icon={customIcon}>
                        <Popup>Nueva Ubicación Seleccionada</Popup>
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

        {/* Sección de Listado con Filtros y Paginación */}
        <Card>
          <CardHeader>
            <CardTitle>Listado de Juntas Vecinales</CardTitle>
            <FilterContainer>
              <FilterMultiSelect
                label="Estado"
                options={[
                  { nombre: "Habilitado" },
                  { nombre: "Deshabilitado" }
                ]}
                value={filters.estado}
                onChange={(val) => setFilter("estado", val)}
              />
              <FilterDatePicker
                label="Fecha de Creación"
                dateRange={{ from: filters.fecha_inicio, to: filters.fecha_fin }}
                setDateRange={(range) => {
                  setFilter("fecha_inicio", range?.from)
                  setFilter("fecha_fin", range?.to)
                }}
              />
              {/* Componente de Búsqueda Refactorizado */}
              <FilterInput
                label="Búsqueda"
                value={filters.nombre}
                onChange={(e) => setFilter("nombre", e.target.value)}
                placeholder="Buscar por título..."
              />

              <div className="flex gap-2 items-end">
                <Button variant="outline" onClick={handleCleanFilters}>
                  Limpiar
                </Button>
                <Button className="bg-green-600 hover:bg-green-700" onClick={handleApplyFilters}>
                  <Filter className="h-4 w-4 mr-2" />
                  Aplicar
                </Button>
              </div>
            </FilterContainer>
          </CardHeader>

          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-green-50 bold-text">
                    <TableHead className="text-center text-green-700 font-bold">Nombre</TableHead>
                    <TableHead className="text-center text-green-700 font-bold">Dirección</TableHead>
                    <TableHead className="text-center text-green-700 font-bold">Estado</TableHead>
                    <TableHead className="text-center text-green-700 font-bold">Fecha de Creación</TableHead>
                    <TableHead className="text-center text-green-700 font-bold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-center">
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">Cargando...</TableCell>
                    </TableRow>
                  ) : juntasVecinales.length > 0 ? (
                    juntasVecinales.map((junta) => (
                      <TableRow key={junta.id}>
                        <TableCell>{junta.nombre_junta}</TableCell>
                        <TableCell>{junta.nombre_calle} {junta.numero_calle}</TableCell>
                        <TableCell>
                          <Badge variant={junta.estado === "habilitado" ? "default" : "secondary"}>
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
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        0 Resultados encontrados
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Paginador Reutilizable */}
            <Paginador
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setPageSize}
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>

      {/* Modal Editar */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Junta Vecinal</DialogTitle>
          </DialogHeader>
          {/* ... Contenido del formulario de edición (Mantenido igual que original, usando editFormData) ... */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              {/* Inputs de edición */}
              <div>
                <Label htmlFor="edit-nombre">Nombre</Label>
                <Input id="edit-nombre" value={editFormData.nombre} onChange={(e) => handleEditInputChange("nombre", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="edit-calle">Calle</Label>
                <Input id="edit-calle" value={editFormData.calle} onChange={(e) => handleEditInputChange("calle", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="edit-numero">Número</Label>
                <Input id="edit-numero" value={editFormData.numero} onChange={(e) => handleEditInputChange("numero", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="edit-estado">Estado</Label>
                <Select value={editFormData.estado} onValueChange={(value) => handleEditInputChange("estado", value)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="habilitado">Habilitado</SelectItem>
                    <SelectItem value="deshabilitado">Deshabilitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Latitud</Label>
                  <Input type="number" step="any" value={editFormData.latitud} onChange={(e) => handleEditInputChange("latitud", e.target.value)} />
                </div>
                <div>
                  <Label>Longitud</Label>
                  <Input type="number" step="any" value={editFormData.longitud} onChange={(e) => handleEditInputChange("longitud", e.target.value)} />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button onClick={handleSaveEdit} className="flex-1 bg-blue-600 hover:bg-blue-700">Guardar Cambios</Button>
                <Button variant="outline" onClick={() => setEditModalOpen(false)} className="flex-1">Cancelar</Button>
              </div>
            </div>
            {/* Mapa Edición */}
            <div>
              <div className="h-96 rounded-lg overflow-hidden border">
                <MapContainer
                  center={editFormData.ubicacion ? [editFormData.latitud, editFormData.longitud] : [-22.4667, -68.9333]}
                  zoom={15}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapClickHandler onMapClick={handleEditMapClick} />
                  {editFormData.ubicacion && (
                    <Marker position={[editFormData.latitud, editFormData.longitud]} icon={customIcon} />
                  )}
                </MapContainer>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Eliminar */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">¿Estás seguro de que quieres eliminar la junta "{juntaToDelete?.nombre_junta}"?</p>
            <p className="text-sm text-gray-500 mt-2">Esta acción no se puede deshacer.</p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">Eliminar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default GestionJuntaVecinal