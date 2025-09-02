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
  Flame,
  AlertTriangle,
  TrendingUp,
  Clock,
  MapPin,
} from "lucide-react"
// import dynamic from "next/dynamic"
import MapaCalorComponente from "./MapaCalorComponente"
import useAxiosPrivate from "@/hooks/useAxiosPrivate"

// Error Boundary para manejar errores sin romper el componente
class MapaCalorErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error capturado en MapaCalorErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="text-red-800 font-semibold">Error en el Mapa de Calor</h3>
          </div>
          <p className="text-red-700 text-sm mt-2">
            Ocurrió un error al cargar el mapa de calor. Por favor, recarga la página.
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



const MapaCalorSeccion = ({
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
  const [juntaCritica, setJuntaCritica] = useState(null)
  const [loadingJuntaCritica, setLoadingJuntaCritica] = useState(false)

  const axiosPrivate = useAxiosPrivate()

  // Función para obtener la junta más crítica del backend
  const obtenerJuntaCritica = useCallback(async () => {
    try {
      setLoadingJuntaCritica(true)
      const response = await axiosPrivate.get('/junta-mas-critica/')
      console.log('Junta más crítica del backend:', response.data)
      setJuntaCritica(response.data)
    } catch (error) {
      console.error('Error al obtener junta más crítica:', error)
      setJuntaCritica(null)
    } finally {
      setLoadingJuntaCritica(false)
    }
  }, [axiosPrivate])

  // Efecto para cargar la junta más crítica cuando cambia backendData
  useEffect(() => {
    if (backendData && backendData.length > 0) {
      obtenerJuntaCritica()
    }
  }, [backendData, obtenerJuntaCritica])

  // Verificar que backendData no esté vacío - validación inicial más robusta
  if (!backendData || !Array.isArray(backendData)) {
    console.log('BackendData no es un array válido:', backendData);
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
                        Error: Datos no válidos recibidos
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        </SidebarInset>
      </div>
    )
  }

  // Procesar datos del backend para el formato del mapa de calor con manejo de errores
  let processedData = [];
  let estadisticas = {
    totalPendientes: 0,
    totalUrgentes: 0,
    juntaMasProblematica: null,
    tiempoPromedioPendiente: 0
  };

  try {
    processedData = backendData?.length > 0 ? backendData.map(item => {
      console.log('Procesando item:', item);
      console.log('Valores originales - pendientes:', item.Junta_Vecinal?.pendientes, 'urgentes:', item.Junta_Vecinal?.urgentes);

      return {
        ...item,
        // Los datos ahora vienen dinámicamente del backend
        Junta_Vecinal: {
          ...item.Junta_Vecinal,
          // Usar valores del backend directamente, sin calcular automáticamente cuando son 0
          pendientes: item.Junta_Vecinal?.pendientes ?? Math.floor((item.Junta_Vecinal?.total_publicaciones || 0) * 0.7),
          urgentes: item.Junta_Vecinal?.urgentes ?? Math.floor((item.Junta_Vecinal?.total_publicaciones || 0) * 0.2),
        },
        // Usar valores del backend o valores por defecto
        tiempo_promedio_pendiente: item.tiempo_promedio_pendiente || "35 días",
        ultima_publicacion: item.ultima_publicacion || "2024-01-26",
      }
    }) : []

    // Estadísticas generales calculadas con datos reales del backend
    estadisticas = {
      totalPendientes: processedData.length > 0
        ? processedData.reduce((total, item) => total + (item.Junta_Vecinal?.pendientes || 0), 0)
        : 0,
      totalUrgentes: processedData.length > 0
        ? processedData.reduce((total, item) => total + (item.Junta_Vecinal?.urgentes || 0), 0)
        : 0,
      juntaMasProblematica:
        // Usar la junta crítica del endpoint específico si está disponible
        juntaCritica?.junta_mas_critica ? {
          Junta_Vecinal: {
            nombre: juntaCritica.junta_mas_critica.junta.nombre,
            latitud: juntaCritica.junta_mas_critica.junta.latitud,
            longitud: juntaCritica.junta_mas_critica.junta.longitud,
            intensidad: juntaCritica.junta_mas_critica.metricas.indice_criticidad / 100, // Normalizar a 0-1
            pendientes: juntaCritica.junta_mas_critica.metricas.publicaciones_pendientes,
            urgentes: juntaCritica.junta_mas_critica.metricas.casos_urgentes,
            total_publicaciones: juntaCritica.junta_mas_critica.metricas.total_publicaciones
          },
          tiempo_promedio_pendiente: `${juntaCritica.junta_mas_critica.metricas.tiempo_promedio_pendiente} días`,
          // Simular datos de categorías para compatibilidad con la tabla
          "Asistencia Social": Math.floor(juntaCritica.junta_mas_critica.metricas.total_publicaciones * 0.3),
          "Mantención de Calles": Math.floor(juntaCritica.junta_mas_critica.metricas.total_publicaciones * 0.3),
          "Seguridad": Math.floor(juntaCritica.junta_mas_critica.metricas.total_publicaciones * 0.2),
          "Áreas verdes": Math.floor(juntaCritica.junta_mas_critica.metricas.total_publicaciones * 0.2),
          ultima_publicacion: new Date().toISOString().split('T')[0]
        } :
          // Fallback a cálculo local si no hay datos del endpoint
          processedData.length > 0
            ? processedData.reduce(
              (peor, item) => ((item.Junta_Vecinal?.intensidad || 0) > (peor?.Junta_Vecinal?.intensidad || 0) ? item : peor),
              processedData[0],
            )
            : null,
      tiempoPromedioPendiente: juntaCritica?.junta_mas_critica ?
        juntaCritica.junta_mas_critica.metricas.tiempo_promedio_pendiente :
        processedData.length > 0
          ? Math.round(processedData.reduce((total, item) => {
            // Extraer número de días del string, manejo más robusto
            const tiempoStr = item.tiempo_promedio_pendiente || "0 días";
            const dias = parseInt(tiempoStr.replace(/[^\d]/g, '')) || 0;
            return total + dias;
          }, 0) / processedData.length)
          : 0
    }
  } catch (error) {
    console.error('Error procesando datos del mapa de calor:', error);
    processedData = [];
    estadisticas = {
      totalPendientes: 0,
      totalUrgentes: 0,
      juntaMasProblematica: null,
      tiempoPromedioPendiente: 0
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
  console.log('Debug - backendData:', backendData);
  console.log('Debug - processedData:', processedData);
  console.log('Debug - data:', data);
  console.log('Debug - hasData:', hasData);

  return (
    <MapaCalorErrorBoundary>
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
                        {loadingJuntaCritica ? (
                          "Cargando..."
                        ) : juntaCritica?.junta_mas_critica ? (
                          juntaCritica.junta_mas_critica.junta.nombre
                        ) : (
                          estadisticas.juntaMasProblematica?.Junta_Vecinal?.nombre || "Sin datos"
                        )}
                      </div>
                      <div className="text-sm text-yellow-600">
                        {juntaCritica?.junta_mas_critica ?
                          `Criticidad: ${juntaCritica.junta_mas_critica.metricas.indice_criticidad.toFixed(1)}%` :
                          "Zona más crítica"
                        }
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-pink-50 to-pink-100 border-pink-200">
                    <CardContent className="p-4 text-center">
                      <Clock className="w-8 h-8 text-pink-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-pink-700">{estadisticas.tiempoPromedioPendiente} días</div>
                      <div className="text-sm text-pink-600">Días pendiente promedio</div>
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
                          value={selectedFilters.junta.join(",")}
                          onValueChange={(value) => {
                            const newValues = value && value !== "all" ? value.split(",") : []
                            setSelectedFilters(prev => ({ ...prev, junta: newValues }))
                          }}
                        >
                          <SelectTrigger className="h-10 border-red-200">
                            <SelectValue placeholder="Seleccionar juntas" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas las juntas</SelectItem>
                            {juntas.map((junta) => (
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
                          value={selectedFilters.categoria.join(",")}
                          onValueChange={(value) => {
                            const newValues = value && value !== "all" ? value.split(",") : []
                            setSelectedFilters(prev => ({ ...prev, categoria: newValues }))
                          }}
                        >
                          <SelectTrigger className="h-10 border-red-200">
                            <SelectValue placeholder="Seleccionar categorías" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas las categorías</SelectItem>
                            {categorias.map((categoria) => (
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
                          onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
                          className="h-10 border-red-200"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-red-700">Fecha desde</label>
                        <Input
                          type="date"
                          value={dateRange?.from ? dateRange.from.toISOString().split('T')[0] : ''}
                          onChange={(e) => {
                            const newDate = e.target.value ? new Date(e.target.value) : null
                            setDateRange(prev => ({ ...prev, from: newDate }))
                          }}
                          className="h-10 border-red-200"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-red-700">Fecha hasta</label>
                        <Input
                          type="date"
                          value={dateRange?.to ? dateRange.to.toISOString().split('T')[0] : ''}
                          onChange={(e) => {
                            const newDate = e.target.value ? new Date(e.target.value) : null
                            setDateRange(prev => ({ ...prev, to: newDate }))
                          }}
                          className="h-10 border-red-200"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button onClick={applyFilters} className="bg-red-600 hover:bg-red-700 text-white">
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
                        <DialogContent className="max-w-[95vw] w-full h-[95vh] px-1" style={{ zIndex: 10010 }}>
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
                            <div className="flex-1 relative overflow-hidden">
                              <div className="w-full h-full">
                                {hasData ? (
                                  <MapaCalorComponente
                                    data={data}
                                    isModal={true}
                                    categorias={categorias}
                                    juntas={juntas}
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
                                    <div className="text-center">
                                      <Search className="w-16 h-16 text-red-300 mx-auto mb-4" />
                                      <div className="text-red-600 text-xl font-semibold mb-2">No se encontraron datos</div>
                                      <div className="text-red-500 text-sm mb-4">
                                        Los filtros aplicados no retornaron resultados
                                      </div>
                                      <Button
                                        onClick={limpiarFiltros}
                                        variant="outline"
                                        className="border-red-200 text-red-700 bg-transparent hover:bg-red-50"
                                      >
                                        Limpiar filtros
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div
                                className={`absolute top-0 right-0 h-full bg-white border-l border-red-200 shadow-lg transition-all duration-300 ease-in-out ${isSidebarOpen ? "w-[320px]" : "w-[50px]"
                                  }`}
                                style={{ zIndex: 10020 }}
                              >
                                <Button
                                  size="icon"
                                  className="absolute top-2 left-[-1.5rem] bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg"
                                  style={{ zIndex: 10025 }}
                                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                >
                                  {isSidebarOpen ? (
                                    <ChevronRight className="h-4 w-4" />
                                  ) : (
                                    <ChevronLeft className="h-4 w-4" />
                                  )}
                                </Button>
                                {isSidebarOpen && (
                                  <div className="p-4 overflow-y-auto h-full" style={{ zIndex: 10021 }}>
                                    <h3 className="font-semibold mb-4 text-center text-red-800">Filtros Avanzados</h3>
                                    <div className="space-y-4" style={{ position: 'relative', zIndex: 10022 }}>
                                      {/* Filtro de Juntas Vecinales */}
                                      <div className="space-y-2" style={{ position: 'relative', zIndex: 10023 }}>
                                        <label className="text-sm font-medium text-red-700">Juntas Vecinales</label>
                                        <Select
                                          value={selectedFilters.junta.join(",")}
                                          onValueChange={(value) => {
                                            const newValues = value && value !== "all" ? value.split(",") : []
                                            setSelectedFilters(prev => ({ ...prev, junta: newValues }))
                                          }}
                                        >
                                          <SelectTrigger className="border-red-200" style={{ position: 'relative', zIndex: 10024 }}>
                                            <SelectValue placeholder="Seleccionar juntas" />
                                          </SelectTrigger>
                                          <SelectContent className="z-[10030]" style={{ zIndex: 10030 }}>
                                            <SelectItem value="all">Todas las juntas</SelectItem>
                                            {juntas.map((junta) => (
                                              <SelectItem key={junta.id} value={junta.nombre}>
                                                {junta.nombre}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>

                                      {/* Filtro de Categorías */}
                                      <div className="space-y-2" style={{ position: 'relative', zIndex: 10023 }}>
                                        <label className="text-sm font-medium text-red-700">Categorías</label>
                                        <Select
                                          value={selectedFilters.categoria.join(",")}
                                          onValueChange={(value) => {
                                            const newValues = value && value !== "all" ? value.split(",") : []
                                            setSelectedFilters(prev => ({ ...prev, categoria: newValues }))
                                          }}
                                        >
                                          <SelectTrigger className="border-red-200" style={{ position: 'relative', zIndex: 10024 }}>
                                            <SelectValue placeholder="Seleccionar categorías" />
                                          </SelectTrigger>
                                          <SelectContent className="z-[10030]" style={{ zIndex: 10030 }}>
                                            <SelectItem value="all">Todas las categorías</SelectItem>
                                            {categorias.map((categoria) => (
                                              <SelectItem key={categoria.id} value={categoria.nombre}>
                                                {categoria.nombre}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>

                                      {/* Filtro de fecha desde */}
                                      <div className="space-y-2">
                                        <label className="text-sm font-medium text-red-700">Fecha desde</label>
                                        <Input
                                          type="date"
                                          value={dateRange?.from ? dateRange.from.toISOString().split('T')[0] : ''}
                                          onChange={(e) => {
                                            const newDate = e.target.value ? new Date(e.target.value) : null
                                            setDateRange(prev => ({ ...prev, from: newDate }))
                                          }}
                                          className="border-red-200"
                                        />
                                      </div>

                                      {/* Filtro de fecha hasta */}
                                      <div className="space-y-2">
                                        <label className="text-sm font-medium text-red-700">Fecha hasta</label>
                                        <Input
                                          type="date"
                                          value={dateRange?.to ? dateRange.to.toISOString().split('T')[0] : ''}
                                          onChange={(e) => {
                                            const newDate = e.target.value ? new Date(e.target.value) : null
                                            setDateRange(prev => ({ ...prev, to: newDate }))
                                          }}
                                          className="border-red-200"
                                        />
                                      </div>

                                      {/* Botones de acción */}
                                      <Button
                                        onClick={applyFilters}
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
                    ) : !isModalOpen ? (
                      hasData ? (
                        <MapaCalorComponente
                          data={data}
                          isModal={false}
                          categorias={categorias}
                          juntas={juntas}
                        />
                      ) : (
                        <div className="w-full h-[500px] bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center border-t">
                          <div className="text-center">
                            <Search className="w-16 h-16 text-red-300 mx-auto mb-4" />
                            <div className="text-red-600 text-xl font-semibold mb-2">No se encontraron datos</div>
                            <div className="text-red-500 text-sm mb-4">
                              Los filtros aplicados no retornaron resultados
                            </div>
                            <Button
                              onClick={limpiarFiltros}
                              variant="outline"
                              className="border-red-200 text-red-700 bg-transparent hover:bg-red-50"
                            >
                              Limpiar filtros
                            </Button>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="w-full h-[500px] bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
                        <div className="text-center">
                          <Maximize2 className="w-12 h-12 text-red-400 mx-auto mb-4" />
                          <div className="text-red-600">Vista ampliada activa</div>
                        </div>
                      </div>
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
                          {hasData ? (
                            data.map((item, index) => (
                              <TableRow key={index} className="hover:bg-red-50">
                                <TableCell className="font-medium text-red-900">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-red-600" />
                                    {item.Junta_Vecinal.nombre || "Sin nombre"}
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                    {item["Asistencia Social"] || 0}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                    {item["Mantención de Calles"] || 0}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                    {item.Seguridad || 0}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
                                    {item["Áreas verdes"] || 0}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center font-bold text-red-700">
                                  {item.Junta_Vecinal.pendientes || 0}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge
                                    className={`${(item.Junta_Vecinal.urgentes || 0) >= 6
                                      ? "bg-red-100 text-red-800 border-red-300"
                                      : (item.Junta_Vecinal.urgentes || 0) >= 3
                                        ? "bg-orange-100 text-orange-800 border-orange-300"
                                        : "bg-yellow-100 text-yellow-800 border-yellow-300"
                                      }`}
                                  >
                                    {item.Junta_Vecinal.urgentes || 0}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center text-red-700">{item.tiempo_promedio_pendiente || "N/A"}</TableCell>
                                <TableCell className="text-center text-red-600">
                                  {item.ultima_publicacion ? formatearFecha(item.ultima_publicacion) : "N/A"}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={9} className="h-32 text-center">
                                <div className="flex flex-col items-center justify-center text-red-500">
                                  <Search className="w-12 h-12 text-red-300 mb-3" />
                                  <div className="text-lg font-medium mb-1">No hay datos para mostrar</div>
                                  <div className="text-sm">Los filtros aplicados no retornaron resultados</div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>

        {/* Estilos globales para dropdowns en modal */}
        {isModalOpen && (
          <style dangerouslySetInnerHTML={{
            __html: `
            /* Radix UI Select Content - muy específico */
            [data-radix-popper-content-wrapper] {
              z-index: 10030 !important;
            }
            [data-radix-select-content] {
              z-index: 10030 !important;
              position: relative !important;
            }
            .radix-select-content {
              z-index: 10030 !important;
            }
            .radix-dropdown-content {
              z-index: 10030 !important;
            }
            /* Select específicos para el modal */
            [data-state="open"] {
              z-index: 10030 !important;
            }
            [data-side] {
              z-index: 10030 !important;
            }
            /* Portales de Radix */
            [data-radix-portal] {
              z-index: 10030 !important;
            }
            /* Clases de shadcn/ui */
            .z-50 {
              z-index: 10030 !important;
            }
          `
          }} />
        )}
      </div>
    </MapaCalorErrorBoundary>
  )
}

export default MapaCalorSeccion
