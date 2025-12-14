"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet"
import L from "leaflet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, MapPin, ArrowLeft, Map as MapIcon, Trash2, Filter, Search, RefreshCw } from "lucide-react"
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
import FilterInput from "../filters/FilterInput"
import Paginador from "../Paginador"
import useFilters from "../../hooks/useFilters"


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

  // --- 1. Estados de Datos ---
  const [allData, setAllData] = useState([]) // Todos los datos del backend
  const [loading, setLoading] = useState(false)

  // --- 2. Gestión de Filtros (Estado Local) ---
  const { filters, setFilter, resetFilters } = useFilters({
    estado: [],
    fecha_inicio: null,
    fecha_fin: null,
    nombre: "", // Búsqueda por texto
  })

  // --- 3. Paginación Local ---
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // --- 4. Carga de Datos (Solo al montar o actualizar) ---
  const fetchJuntas = useCallback(async () => {
    setLoading(true)
    try {
      // Traemos TODO el listado (sin paginación de backend)
      const response = await axiosPrivate.get(API_ROUTES.JUNTAS_VECINALES.ROOT)
      // Aseguramos que sea un array
      const data = Array.isArray(response.data) ? response.data : (response.data.results || [])
      setAllData(data)
    } catch (error) {
      console.error("Error al cargar juntas:", error)
      toast({
        title: "Error de carga",
        description: "No se pudieron cargar las juntas vecinales.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [axiosPrivate, toast])

  useEffect(() => {
    fetchJuntas()
  }, [fetchJuntas])

  // --- 5. Lógica de Filtrado Local (useMemo) ---
  const filteredData = useMemo(() => {
    let data = allData

    // 1. Búsqueda por texto (Nombre o Calle)
    if (filters.nombre) {
      const search = filters.nombre.toLowerCase()
      data = data.filter(item =>
        item.nombre_junta?.toLowerCase().includes(search) ||
        item.nombre_calle?.toLowerCase().includes(search)
      )
    }

    // 2. Filtro por Estado
    if (filters.estado && filters.estado.length > 0) {
      // filters.estado es un array de nombres ['Habilitado', 'Deshabilitado']
      // Aseguramos comparación case-insensitive si es necesario
      const estadosFilter = filters.estado.map(e => e.toLowerCase())
      data = data.filter(item => estadosFilter.includes(item.estado?.toLowerCase()))
    }

    // 3. Filtro por Rango de Fechas
    if (filters.fecha_inicio) {
      const start = new Date(filters.fecha_inicio)
      start.setHours(0, 0, 0, 0)
      data = data.filter(item => new Date(item.fecha_creacion) >= start)
    }
    if (filters.fecha_fin) {
      const end = new Date(filters.fecha_fin)
      end.setHours(23, 59, 59, 999)
      data = data.filter(item => new Date(item.fecha_creacion) <= end)
    }

    return data
  }, [allData, filters])

  // --- 6. Lógica de Paginación Local (useMemo) ---
  const paginatedData = useMemo(() => {
    const firstIndex = (currentPage - 1) * itemsPerPage
    const lastIndex = firstIndex + itemsPerPage
    return filteredData.slice(firstIndex, lastIndex)
  }, [filteredData, currentPage, itemsPerPage])

  const totalItems = filteredData.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // Resetear a página 1 si cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])


  // --- Icono del Mapa ---
  const customIcon = useMemo(() => {
    return L.icon({
      iconUrl: "https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-green.png",
      // Usamos la misma fuente de sombra que tu configuración global para consistencia
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    })
  }, [])

  // --- Estados para Modales y Formularios ---
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

  // --- Manejadores de Filtros ---
  const handleCleanFilters = () => {
    resetFilters()
  }

  // --- Lógica de Agregar ---
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
        }

        await axiosPrivate.post(API_ROUTES.JUNTAS_VECINALES.ROOT, nuevaJuntaPayload)

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

        fetchJuntas() // RECARGA LA LISTA COMPLETA
      }
    } catch (error) {
      toast({
        title: "Error al agregar",
        description: "No se pudo crear la junta vecinal.",
        variant: "destructive",
      })
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
        description: "Los cambios se guardaron correctamente.",
        className: operations.SUCCESS,
      })

      fetchJuntas() // RECARGA LA LISTA COMPLETA
    } catch (error) {
      toast({
        title: "Error al actualizar",
        description: "No se pudieron guardar los cambios.",
        variant: "destructive",
      })
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

      toast({
        title: "Junta vecinal eliminada",
        description: "El registro ha sido eliminado correctamente.",
        className: operations.SUCCESS,
      })

      fetchJuntas() // RECARGA LA LISTA COMPLETA
    } catch (error) {
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar el registro.",
        variant: "destructive",
      })
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
      <TopBar title={"Gestión de Juntas Vecinales"} icon={<MapIcon className="h-6 w-6 text-blue-600" />} />
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
              {/* Inputs Formulario */}
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

          {/* Mapa General (Muestra filteredData para contexto de búsqueda) */}
          <Card>
            <CardHeader>
              <CardTitle>Mapa de Ubicaciones</CardTitle>
              <div className="flex gap-4 text-sm text-gray-500">
                {filteredData.length} ubicaciones visibles según filtros
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

                    {/* Renderiza filteredData para ver lo que se busca en la tabla */}
                    {filteredData.map((junta) => (
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

                    {/* Marcador de selección actual para nueva junta */}
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

        {/* Listado con Filtros Locales */}
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
              {/* Filtro Texto Local */}
              <FilterInput
                label="Búsqueda"
                value={filters.nombre}
                onChange={(e) => setFilter("nombre", e.target.value)}
                placeholder="Buscar por nombre o calle..."
              />

              <div className="flex gap-2 items-end">
                <Button variant="outline" onClick={handleCleanFilters}>
                  Limpiar
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
                      <TableCell colSpan={5} className="text-center py-8">Cargando listado completo...</TableCell>
                    </TableRow>
                  ) : paginatedData.length > 0 ? (
                    paginatedData.map((junta) => (
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
                        No se encontraron resultados con los filtros actuales.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Paginador Local */}
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
              loading={false}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
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