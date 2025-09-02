"use client"

import { useState, useEffect, useCallback, Component } from "react"
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
  AlertTriangle,
} from "lucide-react"
import MapaFrioComponente from "./MapaFrioComponente"
import useAxiosPrivate from '@/hooks/useAxiosPrivate'

// Error Boundary para manejar errores sin romper el componente
class MapaFrioErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error capturado en MapaFrioErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="text-red-800 font-semibold">Error en el Mapa de Frío</h3>
          </div>
          <p className="text-red-700 text-sm mt-2">
            Ocurrió un error al cargar el mapa de frío. Por favor, recarga la página.
          </p>
          <Button
            onClick={() => this.setState({ hasError: false, error: null })}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            Reintentar
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}


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

const MapaFrioSeccion = ({
  data: backendData,
  isLoading,
  juntas,
  categorias,
  selectedFilters,
  setSelectedFilters,
  applyFilters,
  limpiarFiltros,
  clearValues,
  dateRange,
  setDateRange,
  setIsValid,
  isValid
}) => {
  const [filtros, setFiltros] = useState({
    fechaInicio: "",
    fechaFin: "",
    junta_vecinal: [],
    categoria: [],
    busqueda: "",
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [juntaEficiente, setJuntaEficiente] = useState(null)
  const [loadingJuntaEficiente, setLoadingJuntaEficiente] = useState(false)

  const axiosPrivate = useAxiosPrivate()

  // Función para obtener la junta más eficiente del backend
  const obtenerJuntaEficiente = useCallback(async () => {
    try {
      setLoadingJuntaEficiente(true)
      const response = await axiosPrivate.get('/junta-mas-eficiente/')
      console.log('Junta más eficiente:', response.data)
      setJuntaEficiente(response.data)
    } catch (error) {
      console.error('Error obteniendo junta más eficiente:', error)
      setJuntaEficiente(null)
    } finally {
      setLoadingJuntaEficiente(false)
    }
  }, [axiosPrivate])

  // Efecto para cargar la junta más eficiente cuando cambia backendData
  useEffect(() => {
    if (backendData && backendData.length > 0) {
      obtenerJuntaEficiente()
    }
  }, [backendData, obtenerJuntaEficiente])

  // Verificar que backendData no esté vacío - validación inicial más robusta
  if (!backendData || !Array.isArray(backendData)) {
    console.log('MapaFrioSeccion: backendData no válido', backendData)
    return (
      <MapaFrioErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100">
          <SidebarInset>
            <div className="p-6">
              <Card className="bg-white shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-t-lg">
                  <CardTitle className="text-2xl font-bold flex items-center gap-4">
                    <Snowflake className="w-8 h-8 text-blue-100" />
                    Mapa de Frío - Problemáticas Resueltas
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <Snowflake className="w-16 h-16 text-blue-300 mx-auto mb-4 animate-pulse" />
                    <p className="text-blue-600 text-lg">Cargando datos de resoluciones...</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </SidebarInset>
        </div>
      </MapaFrioErrorBoundary>
    )
  }

  // Procesar datos del backend para el formato del mapa de frío con manejo de errores
  let processedData = [];
  let estadisticas = {
    totalResueltas: 0,
    eficienciaPromedio: 0,
    mejorJunta: null,
    tiempoPromedio: 0
  };

  try {
    processedData = backendData?.length > 0 ? backendData.map(item => {
      console.log('Procesando item (frío):', item);
      console.log('Valores originales - resueltas:', item.Junta_Vecinal?.total_resueltas, 'eficiencia:', item.Junta_Vecinal?.eficiencia);

      return {
        ...item,
        // Los datos ahora vienen dinámicamente del backend para resoluciones
        Junta_Vecinal: {
          ...item.Junta_Vecinal,
          // Usar valores del backend directamente para datos de resolución
          total_resueltas: item.Junta_Vecinal?.total_resueltas ?? 0,
          eficiencia: item.Junta_Vecinal?.eficiencia ?? 0,
          intensidad_frio: item.Junta_Vecinal?.intensidad_frio ?? (item.Junta_Vecinal?.eficiencia || 0) / 100,
        },
        // Usar valores del backend o valores por defecto
        tiempo_promedio_resolucion: item.tiempo_promedio_resolucion || "0 días",
        ultima_resolucion: item.ultima_resolucion || "2024-01-26",
        // Asegurar que las categorías estén definidas con valores por defecto
        "Asistencia Social": item["Asistencia Social"] ?? 0,
        "Mantención de Calles": item["Mantención de Calles"] ?? 0,
        "Seguridad": item.Seguridad ?? 0,
        "Áreas verdes": item["Áreas verdes"] ?? 0,
      }
    }) : []

    // Estadísticas generales calculadas con datos reales del backend
    estadisticas = {
      totalResueltas: processedData.length > 0
        ? processedData.reduce((total, item) => total + (item.Junta_Vecinal?.total_resueltas || 0), 0)
        : 0,
      eficienciaPromedio: processedData.length > 0
        ? (processedData.reduce((total, item) => total + (item.Junta_Vecinal?.eficiencia || 0), 0) / processedData.length).toFixed(1)
        : "0.0",
      mejorJunta:
        // Usar la junta eficiente del endpoint específico si está disponible
        juntaEficiente?.junta_mas_eficiente ? {
          Junta_Vecinal: {
            nombre: juntaEficiente.junta_mas_eficiente.junta.nombre,
            latitud: juntaEficiente.junta_mas_eficiente.junta.latitud,
            longitud: juntaEficiente.junta_mas_eficiente.junta.longitud,
            eficiencia: juntaEficiente.junta_mas_eficiente.metricas.porcentaje_resueltas,
            total_resueltas: juntaEficiente.junta_mas_eficiente.metricas.publicaciones_resueltas,
            intensidad_frio: juntaEficiente.junta_mas_eficiente.metricas.indice_eficiencia / 100 // Normalizar a 0-1
          },
          tiempo_promedio_resolucion: `${juntaEficiente.junta_mas_eficiente.metricas.tiempo_promedio_resolucion} días`,
          // Simular datos de categorías para compatibilidad con la tabla
          "Asistencia Social": Math.floor(juntaEficiente.junta_mas_eficiente.metricas.total_publicaciones * 0.3),
          "Mantención de Calles": Math.floor(juntaEficiente.junta_mas_eficiente.metricas.total_publicaciones * 0.3),
          "Seguridad": Math.floor(juntaEficiente.junta_mas_eficiente.metricas.total_publicaciones * 0.2),
          "Áreas verdes": Math.floor(juntaEficiente.junta_mas_eficiente.metricas.total_publicaciones * 0.2),
          ultima_resolucion: new Date().toISOString().split('T')[0]
        } :
          // Fallback a cálculo local si no hay datos del endpoint
          processedData.length > 0
            ? processedData.reduce(
              (mejor, item) => ((item.Junta_Vecinal?.eficiencia || 0) > (mejor?.Junta_Vecinal?.eficiencia || 0) ? item : mejor),
              processedData[0],
            )
            : null,
      tiempoPromedio: juntaEficiente?.junta_mas_eficiente ?
        juntaEficiente.junta_mas_eficiente.metricas.tiempo_promedio_resolucion :
        processedData.length > 0
          ? Math.round(processedData.reduce((total, item) => {
            // Extraer número de días del string, manejo más robusto
            const tiempoStr = item.tiempo_promedio_resolucion || "0 días";
            const dias = parseInt(tiempoStr.replace(/[^\d]/g, '')) || 0;
            return total + dias;
          }, 0) / processedData.length)
          : 0
    }
  } catch (error) {
    console.error('Error procesando datos del mapa de frío:', error);
    processedData = [];
    estadisticas = {
      totalResueltas: 0,
      eficienciaPromedio: "0.0",
      mejorJunta: null,
      tiempoPromedio: 0
    };
  }

  // Función para formatear fechas de manera segura
  const formatearFecha = (fecha) => {
    try {
      return new Date(fecha).toLocaleDateString("es-AR")
    } catch (error) {
      console.error('Error formateando fecha:', fecha, error);
      return "Fecha no disponible";
    }
  }

  // Usar los datos del backend como fuente principal
  const data = processedData

  // Verificar que tengamos datos procesados para mostrar
  const hasData = data && data.length > 0

  // Debug: verificar el estado de los datos
  console.log('Debug Frío - backendData:', backendData);
  console.log('Debug Frío - processedData:', processedData);
  console.log('Debug Frío - data:', data);
  console.log('Debug Frío - hasData:', hasData);

  return (
    <MapaFrioErrorBoundary>
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
                        {loadingJuntaEficiente ? "Cargando..." :
                          (juntaEficiente?.junta_mas_eficiente?.junta?.nombre ||
                            estadisticas.mejorJunta?.Junta_Vecinal?.nombre ||
                            "Sin datos")}
                      </div>
                      <div className="text-sm text-indigo-600">
                        {juntaEficiente?.junta_mas_eficiente ?
                          `Eficiencia: ${juntaEficiente.junta_mas_eficiente.metricas.indice_eficiencia.toFixed(1)}%` :
                          "Mejor junta"
                        }
                      </div>
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
                          value={selectedFilters.junta.join(",")}
                          onValueChange={(value) => {
                            setSelectedFilters(prev => ({
                              ...prev,
                              junta: value ? [value] : []
                            }))
                          }}
                        >
                          <SelectTrigger className="h-10 border-blue-200">
                            <SelectValue placeholder="Seleccionar junta" />
                          </SelectTrigger>
                          <SelectContent style={{ zIndex: isModalOpen ? 10030 : 'auto' }}>
                            {juntas.map((junta) => (
                              <SelectItem key={junta.id || junta} value={junta.nombre || junta}>
                                {junta.nombre || junta}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-blue-700">Categoría</label>
                        <Select
                          value={selectedFilters.categoria.join(",")}
                          onValueChange={(value) => {
                            setSelectedFilters(prev => ({
                              ...prev,
                              categoria: value ? [value] : []
                            }))
                          }}
                        >
                          <SelectTrigger className="h-10 border-blue-200">
                            <SelectValue placeholder="Seleccionar categoría" />
                          </SelectTrigger>
                          <SelectContent style={{ zIndex: isModalOpen ? 10030 : 'auto' }}>
                            {categorias.map((categoria) => (
                              <SelectItem key={categoria.id || categoria} value={categoria.nombre || categoria}>
                                {categoria.nombre || categoria}
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
                          onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
                          className="h-10 border-blue-200"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-blue-700">Fecha desde</label>
                        <Input
                          type="date"
                          value={dateRange?.from ? dateRange.from.toISOString().split('T')[0] : ''}
                          onChange={(e) => {
                            const newDate = e.target.value ? new Date(e.target.value) : null;
                            setDateRange(prev => ({ ...prev, from: newDate }));
                          }}
                          className="h-10 border-blue-200"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-blue-700">Fecha hasta</label>
                        <Input
                          type="date"
                          value={dateRange?.to ? dateRange.to.toISOString().split('T')[0] : ''}
                          onChange={(e) => {
                            const newDate = e.target.value ? new Date(e.target.value) : null;
                            setDateRange(prev => ({ ...prev, to: newDate }));
                          }}
                          className="h-10 border-blue-200"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button onClick={applyFilters} className="bg-blue-600 hover:bg-blue-700 text-white">
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
                                className={`absolute top-0 right-0 h-full p-1 bg-background border-l border-blue-200 shadow-lg transition-all duration-300 ease-in-out ${isSidebarOpen ? "w-[300px]" : "w-[40px]"
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
                                        value={selectedFilters.junta.join(",")}
                                        onValueChange={(value) => {
                                          setSelectedFilters(prev => ({
                                            ...prev,
                                            junta: value ? [value] : []
                                          }))
                                        }}
                                      >
                                        <SelectTrigger className="border-blue-200">
                                          <SelectValue placeholder="Seleccionar junta" />
                                        </SelectTrigger>
                                        <SelectContent style={{ zIndex: 10030 }}>
                                          {juntas.map((junta) => (
                                            <SelectItem key={junta.id || junta} value={junta.nombre || junta}>
                                              {junta.nombre || junta}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <Button
                                        onClick={applyFilters}
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
                                  {item["Asistencia Social"] || 0}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-200">
                                  {item["Mantención de Calles"] || 0}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                                  {item.Seguridad || 0}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                                  {item["Áreas verdes"] || 0}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center font-bold text-blue-700">
                                {item.Junta_Vecinal?.total_resueltas || 0}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge
                                  className={`${(item.Junta_Vecinal?.eficiencia || 0) >= 90
                                    ? "bg-green-100 text-green-800 border-green-300"
                                    : (item.Junta_Vecinal?.eficiencia || 0) >= 80
                                      ? "bg-blue-100 text-blue-800 border-blue-300"
                                      : "bg-yellow-100 text-yellow-800 border-yellow-300"
                                    }`}
                                >
                                  {item.Junta_Vecinal?.eficiencia || 0}%
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center text-blue-700">
                                {item.tiempo_promedio_resolucion || "0 días"}
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
    </MapaFrioErrorBoundary>
  )
}

export default MapaFrioSeccion
