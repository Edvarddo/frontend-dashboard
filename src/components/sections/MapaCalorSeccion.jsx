"use client"
import { useState, useEffect } from "react"
import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Search,
  Filter,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Flame,
  AlertTriangle,
  TrendingUp,
  Clock,
  MapPin,
} from "lucide-react"
// import dynamic from "next/dynamic"
import MapaCalorComponente from "./MapaCalorComponente"



const MapaCalorSeccion = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState([])
  const [filtros, setFiltros] = useState({
    fechaInicio: "",
    fechaFin: "",
    junta_vecinal: [],
    categoria: [],
    busqueda: "",
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Datos de ejemplo para problemáticas NO RESUELTAS (mapa de calor)
  const datosNoResueltos = [
    {
      Junta_Vecinal: {
        latitud: -22.459831,
        longitud: -68.933872,
        nombre: "Junta Norte",
        total_publicaciones: 25,
        intensidad: 0.9, // Alta problemática = más calor
        pendientes: 18,
        urgentes: 5,
      },
      "Asistencia Social": 6,
      "Mantención de Calles": 8,
      Seguridad: 7,
      "Áreas verdes": 4,
      tiempo_promedio_pendiente: "45 días",
      ultima_publicacion: "2024-01-26",
    },
    {
      Junta_Vecinal: {
        latitud: -22.457217,
        longitud: -68.919495,
        nombre: "Junta Centro",
        total_publicaciones: 32,
        intensidad: 1.0, // Máxima problemática
        pendientes: 28,
        urgentes: 8,
      },
      "Asistencia Social": 9,
      "Mantención de Calles": 12,
      Seguridad: 8,
      "Áreas verdes": 3,
      tiempo_promedio_pendiente: "52 días",
      ultima_publicacion: "2024-01-26",
    },
    {
      Junta_Vecinal: {
        latitud: -22.458974,
        longitud: -68.947353,
        nombre: "Junta Sur",
        total_publicaciones: 20,
        intensidad: 0.7,
        pendientes: 15,
        urgentes: 3,
      },
      "Asistencia Social": 5,
      "Mantención de Calles": 6,
      Seguridad: 6,
      "Áreas verdes": 3,
      tiempo_promedio_pendiente: "38 días",
      ultima_publicacion: "2024-01-25",
    },
    {
      Junta_Vecinal: {
        latitud: -22.461503,
        longitud: -68.925289,
        nombre: "Junta Este",
        total_publicaciones: 28,
        intensidad: 0.85,
        pendientes: 22,
        urgentes: 6,
      },
      "Asistencia Social": 7,
      "Mantención de Calles": 9,
      Seguridad: 8,
      "Áreas verdes": 4,
      tiempo_promedio_pendiente: "48 días",
      ultima_publicacion: "2024-01-24",
    },
    {
      Junta_Vecinal: {
        latitud: -22.455689,
        longitud: -68.939178,
        nombre: "Junta Oeste",
        total_publicaciones: 15,
        intensidad: 0.5,
        pendientes: 10,
        urgentes: 2,
      },
      "Asistencia Social": 3,
      "Mantención de Calles": 4,
      Seguridad: 5,
      "Áreas verdes": 3,
      tiempo_promedio_pendiente: "32 días",
      ultima_publicacion: "2024-01-25",
    },
  ]

  const juntasOptions = [
    { id: "junta-norte", nombre: "Junta Norte" },
    { id: "junta-centro", nombre: "Junta Centro" },
    { id: "junta-sur", nombre: "Junta Sur" },
    { id: "junta-este", nombre: "Junta Este" },
    { id: "junta-oeste", nombre: "Junta Oeste" },
  ]

  const categoriasOptions = [
    { id: "asistencia-social", nombre: "Asistencia Social" },
    { id: "mantencion-calles", nombre: "Mantención de Calles" },
    { id: "seguridad", nombre: "Seguridad" },
    { id: "areas-verdes", nombre: "Áreas verdes" },
  ]

  useEffect(() => {
    setIsLoading(true)
    // Simular carga de datos
    setTimeout(() => {
      setData(datosNoResueltos)
      setIsLoading(false)
    }, 1500)
  }, [])

  const handleFiltroChange = (campo, valor) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor,
    }))
  }

  const aplicarFiltros = () => {
    let datosFiltrados = [...datosNoResueltos]

    if (filtros.junta_vecinal.length > 0) {
      datosFiltrados = datosFiltrados.filter((item) =>
        filtros.junta_vecinal.some((junta) => junta === item.Junta_Vecinal.nombre),
      )
    }

    if (filtros.busqueda) {
      datosFiltrados = datosFiltrados.filter((item) =>
        item.Junta_Vecinal.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()),
      )
    }

    setData(datosFiltrados)
  }

  const limpiarFiltros = () => {
    setFiltros({
      fechaInicio: "",
      fechaFin: "",
      junta_vecinal: [],
      categoria: [],
      busqueda: "",
    })
    setData(datosNoResueltos)
  }

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-AR")
  }

  // Estadísticas generales
  const estadisticas = {
    totalPendientes: data.length > 0 ? data.reduce((total, item) => total + item.Junta_Vecinal.pendientes, 0) : 0,
    totalUrgentes: data.length > 0 ? data.reduce((total, item) => total + item.Junta_Vecinal.urgentes, 0) : 0,
    juntaMasProblematica:
      data.length > 0
        ? data.reduce(
            (peor, item) => (item.Junta_Vecinal.intensidad > (peor?.Junta_Vecinal?.intensidad || 0) ? item : peor),
            data[0],
          )
        : null,
    tiempoPromedioPendiente:
      data.length > 0
        ? Math.round(
            data.reduce((total, item) => total + Number.parseInt(item.tiempo_promedio_pendiente), 0) / data.length,
          )
        : 0,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-red-100">
      
      <SidebarInset>
        <div className="p-6">
          <Card className="bg-white shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Flame className="w-8 h-8 text-red-100" />
                  <div>
                    <CardTitle className="text-2xl font-bold">Mapa de Calor - Problemáticas Pendientes</CardTitle>
                    <p className="text-red-100 mt-1">
                      Visualización de problemas no resueltos y zonas críticas por junta vecinal
                    </p>
                  </div>
                </div>
                <Badge className="bg-red-100 text-red-800 text-lg px-4 py-2">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  {estadisticas.totalPendientes} Pendientes
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {/* Dashboard de estadísticas calientes */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
                  <CardContent className="p-4 text-center">
                    <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-red-700">{estadisticas.totalPendientes}</div>
                    <div className="text-sm text-red-600">Total pendientes</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                  <CardContent className="p-4 text-center">
                    <Flame className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-orange-700">{estadisticas.totalUrgentes}</div>
                    <div className="text-sm text-orange-600">Casos urgentes</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <div className="text-lg font-bold text-yellow-700 truncate">
                      {estadisticas.juntaMasProblematica?.Junta_Vecinal?.nombre || "Cargando..."}
                    </div>
                    <div className="text-sm text-yellow-600">Zona más crítica</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-pink-50 to-pink-100 border-pink-200">
                  <CardContent className="p-4 text-center">
                    <Clock className="w-8 h-8 text-pink-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-pink-700">{estadisticas.tiempoPromedioPendiente}</div>
                    <div className="text-sm text-pink-600">Días pendiente</div>
                  </CardContent>
                </Card>
              </div>

              {/* Filtros para mapa de calor */}
              <Card className="mb-6 bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2 text-red-800">
                    <Filter className="w-5 h-5" />
                    Filtros del mapa de calor
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-red-700">Juntas vecinales</label>
                      <Select
                        value={filtros.junta_vecinal.join(",")}
                        onValueChange={(value) => handleFiltroChange("junta_vecinal", value ? value.split(",") : [])}
                      >
                        <SelectTrigger className="h-10 border-red-200">
                          <SelectValue placeholder="Seleccionar juntas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las juntas</SelectItem>
                          {juntasOptions.map((junta) => (
                            <SelectItem key={junta.id} value={junta.nombre}>
                              {junta.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-red-700">Categorías</label>
                      <Select
                        value={filtros.categoria.join(",")}
                        onValueChange={(value) => handleFiltroChange("categoria", value ? value.split(",") : [])}
                      >
                        <SelectTrigger className="h-10 border-red-200">
                          <SelectValue placeholder="Seleccionar categorías" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las categorías</SelectItem>
                          {categoriasOptions.map((categoria) => (
                            <SelectItem key={categoria.id} value={categoria.nombre}>
                              {categoria.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-red-700">Buscar junta</label>
                      <Input
                        placeholder="Buscar por nombre..."
                        value={filtros.busqueda}
                        onChange={(e) => handleFiltroChange("busqueda", e.target.value)}
                        className="h-10 border-red-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-red-700">Fecha desde</label>
                      <Input
                        type="date"
                        value={filtros.fechaInicio}
                        onChange={(e) => handleFiltroChange("fechaInicio", e.target.value)}
                        className="h-10 border-red-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-red-700">Fecha hasta</label>
                      <Input
                        type="date"
                        value={filtros.fechaFin}
                        onChange={(e) => handleFiltroChange("fechaFin", e.target.value)}
                        className="h-10 border-red-200"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={aplicarFiltros} className="bg-red-600 hover:bg-red-700 text-white">
                      <Search className="w-4 h-4 mr-2" />
                      Aplicar filtros
                    </Button>
                    <Button
                      variant="outline"
                      onClick={limpiarFiltros}
                      className="border-red-200 text-red-700 bg-transparent"
                    >
                      Limpiar filtros
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Mapa de calor */}
              <Card className="mb-6 border-red-200">
                <CardHeader className="bg-gradient-to-r from-red-100 to-orange-100">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-red-800 flex items-center gap-2">
                      <Flame className="w-6 h-6" />
                      Mapa de Calor - Juntas Vecinales
                    </CardTitle>
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon" className="border-red-300 text-red-700 bg-transparent">
                          <Maximize2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[95vw] w-full h-[95vh] px-1" style={{ zIndex: 10001 }}>
                        <div className="flex flex-col h-full overflow-hidden p-1">
                          <DialogHeader className="px-6 py-4 border-b bg-red-100 flex justify-between items-center">
                            <DialogTitle className="flex justify-between items-center text-red-800">
                              Mapa de Calor - Vista Ampliada
                              <Button
                                className="ml-2 sm:hidden"
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsModalOpen(false)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </DialogTitle>
                          </DialogHeader>
                          <div className="flex-1 relative overflow-y-auto">
                            <MapaCalorComponente data={data} isModal={true} />
                            <div
                              className={`absolute top-0 right-0 h-full p-1 bg-background border-l border-red-200 shadow-lg transition-all duration-300 ease-in-out ${
                                isSidebarOpen ? "w-[300px]" : "w-[40px]"
                              }`}
                              style={{ zIndex: 10002 }}
                            >
                              <Button
                                size="icon"
                                className="absolute top-2 left-[-1rem] z-[10003] bg-red-500 hover:bg-red-600 text-white"
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                              >
                                {isSidebarOpen ? (
                                  <ChevronRight className="h-4 w-4" />
                                ) : (
                                  <ChevronLeft className="h-4 w-4" />
                                )}
                              </Button>
                              {isSidebarOpen && (
                                <div className="p-4 overflow-y-auto h-full">
                                  <h3 className="font-semibold mb-4 text-center text-red-800">Filtros Avanzados</h3>
                                  <div className="space-y-4">
                                    <Select
                                      value={filtros.junta_vecinal.join(",")}
                                      onValueChange={(value) =>
                                        handleFiltroChange("junta_vecinal", value ? value.split(",") : [])
                                      }
                                    >
                                      <SelectTrigger className="border-red-200">
                                        <SelectValue placeholder="Seleccionar juntas" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="all">Todas las juntas</SelectItem>
                                        {juntasOptions.map((junta) => (
                                          <SelectItem key={junta.id} value={junta.nombre}>
                                            {junta.nombre}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <Button
                                      onClick={aplicarFiltros}
                                      className="bg-red-500 hover:bg-red-600 text-white w-full"
                                    >
                                      Aplicar filtros
                                    </Button>
                                    <Button
                                      onClick={limpiarFiltros}
                                      className="bg-white hover:bg-red-50 text-red-700 w-full border-red-200"
                                    >
                                      Limpiar filtros
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="w-full h-[500px] bg-gradient-to-br from-red-50 to-orange-50 animate-pulse flex items-center justify-center">
                      <div className="text-center">
                        <Flame className="w-12 h-12 text-red-400 mx-auto mb-4 animate-pulse" />
                        <div className="text-red-600">Cargando mapa de calor...</div>
                      </div>
                    </div>
                  ) : (
                    <MapaCalorComponente data={data} isModal={false} />
                  )}
                </CardContent>
              </Card>

              {/* Tabla de estadísticas de problemáticas */}
              <Card className="border-red-200">
                <CardHeader className="bg-gradient-to-r from-red-100 to-orange-100">
                  <CardTitle className="text-red-800 flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6" />
                    Estadísticas de Problemáticas por Junta Vecinal
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-red-50">
                          <TableHead className="text-red-800 font-semibold">Junta Vecinal</TableHead>
                          <TableHead className="text-red-800 font-semibold">Asistencia Social</TableHead>
                          <TableHead className="text-red-800 font-semibold">Mantención de Calles</TableHead>
                          <TableHead className="text-red-800 font-semibold">Seguridad</TableHead>
                          <TableHead className="text-red-800 font-semibold">Áreas Verdes</TableHead>
                          <TableHead className="text-red-800 font-semibold">Total Pendientes</TableHead>
                          <TableHead className="text-red-800 font-semibold">Casos Urgentes</TableHead>
                          <TableHead className="text-red-800 font-semibold">Tiempo Promedio</TableHead>
                          <TableHead className="text-red-800 font-semibold">Última Publicación</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.map((item, index) => (
                          <TableRow key={index} className="hover:bg-red-50">
                            <TableCell className="font-medium text-red-900">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-red-600" />
                                {item.Junta_Vecinal.nombre}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                {item["Asistencia Social"]}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                {item["Mantención de Calles"]}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                {item.Seguridad}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
                                {item["Áreas verdes"]}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center font-bold text-red-700">
                              {item.Junta_Vecinal.pendientes}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                className={`${
                                  item.Junta_Vecinal.urgentes >= 6
                                    ? "bg-red-100 text-red-800 border-red-300"
                                    : item.Junta_Vecinal.urgentes >= 3
                                      ? "bg-orange-100 text-orange-800 border-orange-300"
                                      : "bg-yellow-100 text-yellow-800 border-yellow-300"
                                }`}
                              >
                                {item.Junta_Vecinal.urgentes}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center text-red-700">{item.tiempo_promedio_pendiente}</TableCell>
                            <TableCell className="text-center text-red-600">
                              {formatearFecha(item.ultima_publicacion)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </div>
  )
}

export default MapaCalorSeccion
