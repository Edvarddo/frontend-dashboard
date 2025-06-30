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
  Snowflake,
  CheckCircle,
  TrendingDown,
  Award,
  Calendar,
  MapPin,
} from "lucide-react"
import MapaFrioComponente from "./MapaFrioComponente"


// Importar el mapa dinámicamente para evitar problemas de SSR
// const MapaFrioComponent = dynamic(() => import("./MapaFrioComponente"), {
//   ssr: false,
//   loading: () => (
//     <div className="w-full h-[500px] bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg flex items-center justify-center">
//       <div className="text-center">
//         <Snowflake className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-spin" />
//         <div className="text-blue-600 font-medium">Cargando mapa de frío...</div>
//       </div>
//     </div>
//   ),
// })

const MapaFrioSeccion = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState([])
  const [filtros, setFiltros] = useState({
    fechaInicio: "",
    fechaFin: "",
    junta_vecinal: "Todas las juntas",
    categoria: "Todas las categorías",
    busqueda: "",
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Datos de ejemplo para problemáticas RESUELTAS (mapa de frío)
  const datosResueltos = [
    {
      Junta_Vecinal: {
        latitud: -22.459831,
        longitud: -68.933872,
        nombre: "Junta Norte",
        total_resueltas: 15,
        intensidad_frio: 0.8, // Alta resolución = más frío
        eficiencia: 85.7, // % de resolución
      },
      "Asistencia Social": 4,
      "Mantención de Calles": 5,
      Seguridad: 3,
      "Áreas verdes": 3,
      tiempo_promedio_resolucion: "12 días",
      ultima_resolucion: "2024-01-25",
    },
    {
      Junta_Vecinal: {
        latitud: -22.457217,
        longitud: -68.919495,
        nombre: "Junta Centro",
        total_resueltas: 22,
        intensidad_frio: 1.0, // Máxima resolución
        eficiencia: 95.2,
      },
      "Asistencia Social": 6,
      "Mantención de Calles": 8,
      Seguridad: 5,
      "Áreas verdes": 3,
      tiempo_promedio_resolucion: "8 días",
      ultima_resolucion: "2024-01-26",
    },
    {
      Junta_Vecinal: {
        latitud: -22.458974,
        longitud: -68.947353,
        nombre: "Junta Sur",
        total_resueltas: 18,
        intensidad_frio: 0.9,
        eficiencia: 90.0,
      },
      "Asistencia Social": 5,
      "Mantención de Calles": 6,
      Seguridad: 4,
      "Áreas verdes": 3,
      tiempo_promedio_resolucion: "10 días",
      ultima_resolucion: "2024-01-24",
    },
    {
      Junta_Vecinal: {
        latitud: -22.461503,
        longitud: -68.925289,
        nombre: "Junta Este",
        total_resueltas: 12,
        intensidad_frio: 0.6,
        eficiencia: 75.0,
      },
      "Asistencia Social": 3,
      "Mantención de Calles": 4,
      Seguridad: 3,
      "Áreas verdes": 2,
      tiempo_promedio_resolucion: "15 días",
      ultima_resolucion: "2024-01-23",
    },
    {
      Junta_Vecinal: {
        latitud: -22.455689,
        longitud: -68.939178,
        nombre: "Junta Oeste",
        total_resueltas: 20,
        intensidad_frio: 0.95,
        eficiencia: 92.3,
      },
      "Asistencia Social": 5,
      "Mantención de Calles": 7,
      Seguridad: 4,
      "Áreas verdes": 4,
      tiempo_promedio_resolucion: "9 días",
      ultima_resolucion: "2024-01-26",
    },
  ]

  const juntas = ["Todas las juntas", "Junta Norte", "Junta Centro", "Junta Sur", "Junta Este", "Junta Oeste"]
  const categorias = ["Todas las categorías", "Asistencia Social", "Mantención de Calles", "Seguridad", "Áreas verdes"]

  useEffect(() => {
    setIsLoading(true)
    // Simular carga de datos
    setTimeout(() => {
      setData(datosResueltos)
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
    let datosFiltrados = [...datosResueltos]

    if (filtros.junta_vecinal !== "Todas las juntas") {
      datosFiltrados = datosFiltrados.filter((item) => item.Junta_Vecinal.nombre === filtros.junta_vecinal)
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
      junta_vecinal: "Todas las juntas",
      categoria: "Todas las categorías",
      busqueda: "",
    })
    setData(datosResueltos)
  }

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-AR")
  }

  // Estadísticas generales
  const estadisticas = {
    totalResueltas: data.length > 0 ? data.reduce((total, item) => total + item.Junta_Vecinal.total_resueltas, 0) : 0,
    eficienciaPromedio:
      data.length > 0
        ? (data.reduce((total, item) => total + item.Junta_Vecinal.eficiencia, 0) / data.length).toFixed(1)
        : "0.0",
    mejorJunta:
      data.length > 0
        ? data.reduce(
            (mejor, item) => (item.Junta_Vecinal.eficiencia > (mejor?.Junta_Vecinal?.eficiencia || 0) ? item : mejor),
            data[0], // Valor inicial para evitar el error
          )
        : null,
    tiempoPromedio:
      data.length > 0
        ? Math.round(
            data.reduce((total, item) => total + Number.parseInt(item.tiempo_promedio_resolucion), 0) / data.length,
          )
        : 0,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100">
      <SidebarInset>
        <div className="p-6">
          <Card className="bg-white shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Snowflake className="w-8 h-8 text-blue-100" />
                  <div>
                    <CardTitle className="text-2xl font-bold">Mapa de Frío - Problemáticas Resueltas</CardTitle>
                    <p className="text-blue-100 mt-1">
                      Visualización de eficiencia y resolución de problemas por junta vecinal
                    </p>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-800 text-lg px-4 py-2">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {estadisticas.totalResueltas} Resueltas
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {/* Dashboard de estadísticas frías */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                  <CardContent className="p-4 text-center">
                    <CheckCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-700">{estadisticas.totalResueltas}</div>
                    <div className="text-sm text-blue-600">Total resueltas</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-cyan-50 to-cyan-100 border-cyan-200">
                  <CardContent className="p-4 text-center">
                    <TrendingDown className="w-8 h-8 text-cyan-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-cyan-700">{estadisticas.eficienciaPromedio}%</div>
                    <div className="text-sm text-cyan-600">Eficiencia promedio</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
                  <CardContent className="p-4 text-center">
                    <Award className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                    <div className="text-lg font-bold text-indigo-700 truncate">
                      {estadisticas.mejorJunta?.Junta_Vecinal?.nombre || "Cargando..."}
                    </div>
                    <div className="text-sm text-indigo-600">Mejor junta</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-teal-50 to-teal-100 border-teal-200">
                  <CardContent className="p-4 text-center">
                    <Calendar className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-teal-700">{estadisticas.tiempoPromedio}</div>
                    <div className="text-sm text-teal-600">Días promedio</div>
                  </CardContent>
                </Card>
              </div>

              {/* Filtros para mapa de frío */}
              <Card className="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
                    <Filter className="w-5 h-5" />
                    Filtros del mapa de frío
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-blue-700">Junta vecinal</label>
                      <Select
                        value={filtros.junta_vecinal}
                        onValueChange={(value) => handleFiltroChange("junta_vecinal", value)}
                      >
                        <SelectTrigger className="h-10 border-blue-200">
                          <SelectValue placeholder="Seleccionar junta" />
                        </SelectTrigger>
                        <SelectContent>
                          {juntas.map((junta) => (
                            <SelectItem key={junta} value={junta}>
                              {junta}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-blue-700">Categoría</label>
                      <Select
                        value={filtros.categoria}
                        onValueChange={(value) => handleFiltroChange("categoria", value)}
                      >
                        <SelectTrigger className="h-10 border-blue-200">
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {categorias.map((categoria) => (
                            <SelectItem key={categoria} value={categoria}>
                              {categoria}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-blue-700">Buscar junta</label>
                      <Input
                        placeholder="Buscar por nombre..."
                        value={filtros.busqueda}
                        onChange={(e) => handleFiltroChange("busqueda", e.target.value)}
                        className="h-10 border-blue-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-blue-700">Fecha desde</label>
                      <Input
                        type="date"
                        value={filtros.fechaInicio}
                        onChange={(e) => handleFiltroChange("fechaInicio", e.target.value)}
                        className="h-10 border-blue-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-blue-700">Fecha hasta</label>
                      <Input
                        type="date"
                        value={filtros.fechaFin}
                        onChange={(e) => handleFiltroChange("fechaFin", e.target.value)}
                        className="h-10 border-blue-200"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={aplicarFiltros} className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Search className="w-4 h-4 mr-2" />
                      Aplicar filtros
                    </Button>
                    <Button
                      variant="outline"
                      onClick={limpiarFiltros}
                      className="border-blue-200 text-blue-700 bg-transparent"
                    >
                      Limpiar filtros
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Mapa de frío */}
              <Card className="mb-6 border-blue-200">
                <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-100">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-blue-800 flex items-center gap-2">
                      <Snowflake className="w-6 h-6" />
                      Mapa de Frío - Juntas Vecinales
                    </CardTitle>
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon" className="border-blue-300 text-blue-700 bg-transparent">
                          <Maximize2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[95vw] w-full h-[95vh] px-1">
                        <div className="flex flex-col h-full overflow-hidden p-1">
                          <DialogHeader className="px-6 py-4 border-b bg-blue-100 flex justify-between items-center">
                            <DialogTitle className="flex justify-between items-center text-blue-800">
                              Mapa de Frío - Vista Ampliada
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
                            <MapaFrioComponente data={data} isModal={true} />
                            <div
                              className={`absolute top-0 right-0 h-full p-1 bg-background border-l border-blue-200 shadow-lg transition-all duration-300 ease-in-out ${
                                isSidebarOpen ? "w-[300px]" : "w-[40px]"
                              }`}
                              style={{ zIndex: 1000 }}
                            >
                              <Button
                                size="icon"
                                className="absolute top-2 left-[-1rem] z-[1001] bg-blue-500 hover:bg-blue-600 text-white"
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
                                  <h3 className="font-semibold mb-4 text-center text-blue-800">Filtros Avanzados</h3>
                                  <div className="space-y-4">
                                    <Select
                                      value={filtros.junta_vecinal}
                                      onValueChange={(value) => handleFiltroChange("junta_vecinal", value)}
                                    >
                                      <SelectTrigger className="border-blue-200">
                                        <SelectValue placeholder="Seleccionar junta" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {juntas.map((junta) => (
                                          <SelectItem key={junta} value={junta}>
                                            {junta}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <Button
                                      onClick={aplicarFiltros}
                                      className="bg-blue-500 hover:bg-blue-600 text-white w-full"
                                    >
                                      Aplicar filtros
                                    </Button>
                                    <Button
                                      onClick={limpiarFiltros}
                                      className="bg-white hover:bg-blue-50 text-blue-700 w-full border-blue-200"
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
                    <div className="w-full h-[500px] bg-gradient-to-br from-blue-50 to-cyan-50 animate-pulse flex items-center justify-center">
                      <div className="text-center">
                        <Snowflake className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-spin" />
                        <div className="text-blue-600">Cargando mapa de frío...</div>
                      </div>
                    </div>
                  ) : (
                    <MapaFrioComponente data={data} isModal={false} />
                  )}
                </CardContent>
              </Card>

              {/* Tabla de estadísticas de resolución */}
              <Card className="border-blue-200">
                <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-100">
                  <CardTitle className="text-blue-800 flex items-center gap-2">
                    <CheckCircle className="w-6 h-6" />
                    Estadísticas de Resolución por Junta Vecinal
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-blue-50">
                          <TableHead className="text-blue-800 font-semibold">Junta Vecinal</TableHead>
                          <TableHead className="text-blue-800 font-semibold">Asistencia Social</TableHead>
                          <TableHead className="text-blue-800 font-semibold">Mantención de Calles</TableHead>
                          <TableHead className="text-blue-800 font-semibold">Seguridad</TableHead>
                          <TableHead className="text-blue-800 font-semibold">Áreas Verdes</TableHead>
                          <TableHead className="text-blue-800 font-semibold">Total Resueltas</TableHead>
                          <TableHead className="text-blue-800 font-semibold">Eficiencia</TableHead>
                          <TableHead className="text-blue-800 font-semibold">Tiempo Promedio</TableHead>
                          <TableHead className="text-blue-800 font-semibold">Última Resolución</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.map((item, index) => (
                          <TableRow key={index} className="hover:bg-blue-50">
                            <TableCell className="font-medium text-blue-900">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-blue-600" />
                                {item.Junta_Vecinal.nombre}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {item["Asistencia Social"]}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-200">
                                {item["Mantención de Calles"]}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                                {item.Seguridad}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                                {item["Áreas verdes"]}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center font-bold text-blue-700">
                              {item.Junta_Vecinal.total_resueltas}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                className={`${
                                  item.Junta_Vecinal.eficiencia >= 90
                                    ? "bg-green-100 text-green-800 border-green-300"
                                    : item.Junta_Vecinal.eficiencia >= 80
                                      ? "bg-blue-100 text-blue-800 border-blue-300"
                                      : "bg-yellow-100 text-yellow-800 border-yellow-300"
                                }`}
                              >
                                {item.Junta_Vecinal.eficiencia}%
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center text-blue-700">
                              {item.tiempo_promedio_resolucion}
                            </TableCell>
                            <TableCell className="text-center text-blue-600">
                              {formatearFecha(item.ultima_resolucion)}
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

export default MapaFrioSeccion
