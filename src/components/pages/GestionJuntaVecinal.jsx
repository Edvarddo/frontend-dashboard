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
import { Search, Download, Filter, Plus, Edit, MapPin, ArrowLeft, Map } from "lucide-react"
import TopBar from "../TopBar"

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
    nombre: "Junta Vecinal Centro",
    calle: "Av. Principal",
    numero: "123",
    estado: "Activa",
    categoria: "Urbana",
    fechaCreacion: "2024-01-15",
    ubicacion: { lat: -22.4558, lng: -68.9293 },
    tipo: "actual",
  },
  {
    id: 2,
    codigo: "JV002",
    nombre: "Junta Vecinal Norte",
    calle: "Calle Los Pinos",
    numero: "456",
    estado: "Inactiva",
    categoria: "Residencial",
    fechaCreacion: "2024-02-20",
    ubicacion: { lat: -22.4517, lng: -68.9172 },
    tipo: "actual",
  },
  {
    id: 3,
    codigo: "JV003",
    nombre: "Junta Vecinal Sur",
    calle: "Av. Granaderos",
    numero: "789",
    estado: "Activa",
    categoria: "Comercial",
    fechaCreacion: "2024-03-10",
    ubicacion: { lat: -22.4621, lng: -68.9338 },
    tipo: "actual",
  },
]

const GestionJuntaVecinal = ({ onVolver }) => {
  const customIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  })

  const [formData, setFormData] = useState({
    nombre: "",
    calle: "",
    numero: "",
    estado: "Inactiva", // Estado por defecto
    ubicacion: null,
  })

  const [filtros, setFiltros] = useState({
    categoria: "",
    estado: "",
    fechaInicio: "",
    fechaFin: "",
    busqueda: "",
  })

  const [juntasVecinales, setJuntasVecinales] = useState(juntasVecinalesData)
  const [nuevasUbicaciones, setNuevasUbicaciones] = useState([])

  // Manejar cambios en el formulario
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Manejar clic en el mapa
  const handleMapClick = (latlng) => {
    setFormData((prev) => ({
      ...prev,
      ubicacion: latlng,
    }))
  }

  // Agregar nueva junta vecinal
  const handleAgregarJunta = () => {
    if (formData.nombre && formData.calle && formData.numero && formData.ubicacion && formData.estado) {
      const nuevaJunta = {
        id: Date.now(),
        codigo: `JV${String(juntasVecinales.length + nuevasUbicaciones.length + 1).padStart(3, "0")}`,
        nombre: formData.nombre,
        calle: formData.calle,
        numero: formData.numero,
        estado: formData.estado,
        categoria: "Nueva",
        fechaCreacion: new Date().toISOString().split("T")[0],
        ubicacion: formData.ubicacion,
        tipo: "nueva",
      }

      setNuevasUbicaciones((prev) => [...prev, nuevaJunta])
      setFormData({
        nombre: "",
        calle: "",
        numero: "",
        estado: "Inactiva",
        ubicacion: null,
      })
    }
  }

  // Filtrar datos
  const datosFiltrados = [...juntasVecinales, ...nuevasUbicaciones].filter((item) => {
    const cumpleBusqueda =
      !filtros.busqueda ||
      item.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      item.calle.toLowerCase().includes(filtros.busqueda.toLowerCase())

    const cumpleCategoria = !filtros.categoria || item.categoria === filtros.categoria
    const cumpleEstado = !filtros.estado || item.estado === filtros.estado

    return cumpleBusqueda && cumpleCategoria && cumpleEstado
  })

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      categoria: "",
      estado: "",
      fechaInicio: "",
      fechaFin: "",
      busqueda: "",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar title={"Gestión de Juntas Vecinales"} icon={<Map className="h-6 w-6 text-blue-600" />} />
      {/* Header */}
      {/* <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <Map className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-semibold text-gray-900">Gestión de Juntas Vecinales</h1>
          </div>
        </div>
      </div> */}

      <div className="p-6 space-y-6">
        {/* Botón para volver */}
        {onVolver && (
          <Button variant="outline" onClick={onVolver} className="mb-4 bg-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Gestión de Datos
          </Button>
        )}

        {/* Sección de Formulario y Mapa */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulario */}
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
                    <SelectItem value="Activa">Activa</SelectItem>
                    <SelectItem value="Inactiva">Inactiva</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <MapPin className="h-4 w-4 inline mr-2" />
                Seleccione la ubicación aproximada en el mapa
                {formData.ubicacion && (
                  <div className="mt-2 text-xs">
                    Coordenadas: {formData.ubicacion.lat.toFixed(4)}, {formData.ubicacion.lng.toFixed(4)}
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

          {/* Mapa */}
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
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <MapClickHandler onMapClick={handleMapClick} />

                  {/* Marcadores de juntas existentes */}
                  {juntasVecinales.map((junta) => (
                    <Marker key={junta.id} position={[junta.ubicacion.lat, junta.ubicacion.lng]}>
                      <Popup>
                        <div>
                          <h3 className="font-semibold">{junta.nombre}</h3>
                          <p>
                            {junta.calle} {junta.numero}
                          </p>
                          <Badge variant={junta.estado === "Activa" ? "default" : "secondary"}>{junta.estado}</Badge>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* Marcadores de nuevas ubicaciones */}
                  {nuevasUbicaciones.map((junta) => (
                    <Marker key={junta.id} position={[junta.ubicacion.lat, junta.ubicacion.lng]}>
                      <Popup>
                        <div>
                          <h3 className="font-semibold">{junta.nombre}</h3>
                          <p>
                            {junta.calle} {junta.numero}
                          </p>
                          <Badge
                            variant={junta.estado === "Activa" ? "default" : "secondary"}
                            className="bg-green-100 text-green-800"
                          >
                            {junta.estado} (Nueva)
                          </Badge>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* Marcador temporal para nueva ubicación */}
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
            </CardContent>
          </Card>
        </div>

        {/* Sección de Filtros y Tabla */}
        <Card>
          <CardHeader>
            <CardTitle>Listado de Juntas Vecinales</CardTitle>
            {/* Filtros */}
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
                    <SelectItem value="Activa">Activa</SelectItem>
                    <SelectItem value="Inactiva">Inactiva</SelectItem>
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

            {/* Barra de búsqueda y acciones */}
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
            {/* Tabla */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Dirección</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha de Creación</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {datosFiltrados.length > 0 ? (
                    datosFiltrados.map((junta) => (
                      <TableRow key={junta.id}>
                        <TableCell className="font-medium">{junta.codigo}</TableCell>
                        <TableCell>{junta.nombre}</TableCell>
                        <TableCell>
                          {junta.calle} {junta.numero}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              junta.estado === "Activa"
                                ? "default"
                                : junta.estado === "Pendiente"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {junta.estado}
                          </Badge>
                        </TableCell>
                        <TableCell>{junta.fechaCreacion}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
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

            {/* Paginación */}
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">Página 1 de 1</div>
              <div className="text-sm text-gray-500">{datosFiltrados.length} Resultados encontrados</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default GestionJuntaVecinal
