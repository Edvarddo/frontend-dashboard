"use client"

import { useState, useEffect, useCallback, Component } from "react"
import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
// Importamos los filtros unificados
import FilterMultiSelect from "../filters/FilterMultiSelect"
import FilterDatePicker from "../filters/FilterDatePicker"
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
  Star,
} from "lucide-react"
import MapaFrioComponente from "./MapaFrioComponente"
import useAxiosPrivate from '@/hooks/useAxiosPrivate'
import { API_ROUTES } from "@/api/apiRoutes"


// --- COMPONENTE DE PUNTUACIÓN (ESTRELLAS) ---
const RatingDisplay = ({ puntuacion, totalVotos }) => {
  if (!puntuacion || puntuacion === 0) {
    return <span className="text-[10px] text-gray-400 italic">Sin votos</span>;
  }

  return (
    <div className="flex flex-col items-end">
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`w-3 h-3 ${index < Math.round(puntuacion)
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-300"
              }`}
          />
        ))}
      </div>
      <span className="text-[10px] text-gray-500 font-medium">
        {puntuacion.toFixed(1)} ({totalVotos})
      </span>
    </div>
  );
};

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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [juntaEficiente, setJuntaEficiente] = useState(null)
  const [loadingJuntaEficiente, setLoadingJuntaEficiente] = useState(false)
  const [selectedJuntaFrio, setSelectedJuntaFrio] = useState(null)
  const axiosPrivate = useAxiosPrivate()

  // 1. NORMALIZACIÓN DE DATOS (Igual que en Mapa Calor)
  const rawJuntas = Array.isArray(juntas) ? juntas : (juntas?.juntas || []);
  const rawCategorias = Array.isArray(categorias) ? categorias : (categorias?.categorias || []);

  const juntaOptions = rawJuntas.map(j => ({
    nombre: j.nombre,
    value: j.nombre,
    id: j.id
  }));

  const categoriaOptions = rawCategorias.map(c => ({
    nombre: c.nombre,
    value: c.nombre,
    id: c.id
  }));

  // Función para obtener la junta más eficiente del backend
  const obtenerJuntaEficiente = useCallback(async () => {
    try {
      setLoadingJuntaEficiente(true)
      const response = await axiosPrivate.get(API_ROUTES.STATS.JUNTA_MAS_EFICIENTE)
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
      return {
        ...item,
        Junta_Vecinal: {
          ...item.Junta_Vecinal,
          total_resueltas: item.Junta_Vecinal?.total_resueltas ?? 0,
          eficiencia: item.Junta_Vecinal?.eficiencia ?? 0,
          intensidad_frio: item.Junta_Vecinal?.intensidad_frio ?? (item.Junta_Vecinal?.eficiencia || 0) / 100,
          calificacion_promedio: item.Junta_Vecinal?.calificacion_promedio ?? 0,
          total_valoraciones: item.Junta_Vecinal?.total_valoraciones ?? 0,
        },
        tiempo_promedio_resolucion: item.tiempo_promedio_resolucion || "0 días",
        ultima_resolucion: item.ultima_resolucion || "2024-01-26",
        "Asistencia Social": item["Asistencia Social"] ?? 0,
        "Mantención de Calles": item["Mantención de Calles"] ?? 0,
        "Seguridad": item.Seguridad ?? 0,
        "Áreas verdes": item["Áreas verdes"] ?? 0,
      }
    }) : []

    estadisticas = {
      totalResueltas: processedData.length > 0
        ? processedData.reduce((total, item) => total + (item.Junta_Vecinal?.total_resueltas || 0), 0)
        : 0,
      eficienciaPromedio: processedData.length > 0
        ? (processedData.reduce((total, item) => total + (item.Junta_Vecinal?.eficiencia || 0), 0) / processedData.length).toFixed(1)
        : "0.0",
      mejorJunta:
        juntaEficiente?.junta_mas_eficiente ? {
          Junta_Vecinal: {
            nombre: juntaEficiente.junta_mas_eficiente.junta.nombre,
            latitud: juntaEficiente.junta_mas_eficiente.junta.latitud,
            longitud: juntaEficiente.junta_mas_eficiente.junta.longitud,
            eficiencia: juntaEficiente.junta_mas_eficiente.metricas.porcentaje_resueltas,
            total_resueltas: juntaEficiente.junta_mas_eficiente.metricas.publicaciones_resueltas,
            intensidad_frio: juntaEficiente.junta_mas_eficiente.metricas.indice_eficiencia / 100
          },
          tiempo_promedio_resolucion: `${juntaEficiente.junta_mas_eficiente.metricas.tiempo_promedio_resolucion} días`,
          "Asistencia Social": Math.floor(juntaEficiente.junta_mas_eficiente.metricas.total_publicaciones * 0.3),
          "Mantención de Calles": Math.floor(juntaEficiente.junta_mas_eficiente.metricas.total_publicaciones * 0.3),
          "Seguridad": Math.floor(juntaEficiente.junta_mas_eficiente.metricas.total_publicaciones * 0.2),
          "Áreas verdes": Math.floor(juntaEficiente.junta_mas_eficiente.metricas.total_publicaciones * 0.2),
          ultima_resolucion: new Date().toISOString().split('T')[0]
        } :
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

  const formatearFecha = (fecha) => {
    try {
      return new Date(fecha).toLocaleDateString("es-AR")
    } catch (error) {
      return "Fecha no disponible";
    }
  }

  const data = processedData
  const hasData = data && data.length > 0

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

                {/* Filtros para mapa de frío - ACTUALIZADO CON COMPONENTES DE FILTRO */}
                <Card className="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
                      <Filter className="w-5 h-5" />
                      Filtros del mapa de frío
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="[&>div>h2]:text-blue-700 [&>div>h2]:text-sm">
                        <FilterMultiSelect
                          label="Juntas Vecinales"
                          placeholder="Seleccionar juntas..."
                          options={juntaOptions}
                          value={selectedFilters.junta}
                          onChange={(value) => setSelectedFilters(prev => ({ ...prev, junta: value }))}
                          clearValues={clearValues}
                        />
                      </div>
                      <div className="[&>div>h2]:text-blue-700 [&>div>h2]:text-sm">
                        <FilterMultiSelect
                          label="Categorías"
                          placeholder="Seleccionar categorías..."
                          options={categoriaOptions}
                          value={selectedFilters.categoria}
                          onChange={(value) => setSelectedFilters(prev => ({ ...prev, categoria: value }))}
                          clearValues={clearValues}
                        />
                      </div>
                      <div className="[&>div>h2]:text-blue-700 [&>div>h2]:text-sm">
                        <FilterDatePicker
                          label="Rango de fechas"
                          dateRange={dateRange}
                          setDateRange={setDateRange}
                          setIsValid={setIsValid}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 mt-4">
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
                        <DialogContent className="max-w-[95vw] w-full h-[95vh] px-1" style={{ zIndex: 10010 }}>
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
                              <MapaFrioComponente
                                data={data}
                                isModal={true}
                                categorias={rawCategorias}
                                juntas={rawJuntas}
                              />
                              <div
                                className={`absolute top-0 right-0 h-full p-1 bg-white border-l border-blue-200 shadow-lg transition-all duration-300 ease-in-out ${isSidebarOpen ? "w-[300px]" : "w-[40px]"
                                  }`}
                                style={{ zIndex: 10020 }}
                              >
                                <Button
                                  size="icon"
                                  className="absolute top-2 left-[-1rem] z-[10025] bg-blue-500 hover:bg-blue-600 text-white"
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
                                    <h3 className="font-semibold mb-4 text-center text-blue-800">Filtros Avanzados</h3>
                                    <div className="space-y-6" style={{ position: 'relative', zIndex: 10022 }}>
                                      <div style={{ position: 'relative', zIndex: 10023 }} className="[&>div>h2]:text-blue-700 [&>div>h2]:text-sm">
                                        <FilterMultiSelect
                                          label="Juntas Vecinales"
                                          placeholder="Seleccionar..."
                                          options={juntaOptions}
                                          value={selectedFilters.junta}
                                          onChange={(value) => setSelectedFilters(prev => ({ ...prev, junta: value }))}
                                          clearValues={clearValues}
                                        />
                                      </div>
                                      <div style={{ position: 'relative', zIndex: 10023 }} className="[&>div>h2]:text-blue-700 [&>div>h2]:text-sm">
                                        <FilterMultiSelect
                                          label="Categorías"
                                          placeholder="Seleccionar..."
                                          options={categoriaOptions}
                                          value={selectedFilters.categoria}
                                          onChange={(value) => setSelectedFilters(prev => ({ ...prev, categoria: value }))}
                                          clearValues={clearValues}
                                        />
                                      </div>
                                      <div className="[&>div>h2]:text-blue-700 [&>div>h2]:text-sm">
                                        <FilterDatePicker
                                          label="Rango de fechas"
                                          dateRange={dateRange}
                                          setDateRange={setDateRange}
                                          setIsValid={setIsValid}
                                        />
                                      </div>
                                      <div className="space-y-3 pt-4">
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
                      <MapaFrioComponente
                        data={data}
                        isModal={false}
                        categorias={rawCategorias}
                        juntas={rawJuntas}
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Tabla de estadísticas de resolución */}
                <Card className="border-blue-200">
                  <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-100">
                    <CardTitle className="text-blue-800 flex items-center gap-2">
                      <CheckCircle className="w-6 h-6" />
                      Estadísticas de Resolución por Junta Vecinal (Mapa de Frío)
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-4">

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                      {/* MAESTRO – LISTA DE JUNTAS */}
                      <div className="lg:col-span-1">
                        <Card className="h-full border-blue-200">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-sm font-semibold text-blue-800">
                                Juntas Vecinales
                              </CardTitle>
                              <span className="text-xs text-gray-500">Satisfacción</span>
                            </div>
                          </CardHeader>

                          <CardContent className="pt-0 max-h-[450px] overflow-y-auto space-y-2 px-2">
                            {data.map((item) => (
                              <button
                                key={item.Junta_Vecinal.nombre}
                                onClick={() => setSelectedJuntaFrio(item)}
                                className={`w-full flex items-center justify-between rounded-lg px-3 py-3 border text-left transition-all
            ${selectedJuntaFrio?.Junta_Vecinal?.nombre === item.Junta_Vecinal.nombre
                                    ? "border-blue-400 bg-blue-50 shadow-sm ring-1 ring-blue-200"
                                    : "border-blue-100 hover:bg-blue-50/50 hover:border-blue-300"
                                  }`}
                              >
                                {/* Izquierda: Nombre e Info Básica */}
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className={`p-2 rounded-full ${selectedJuntaFrio === item ? 'bg-blue-200' : 'bg-blue-100'}`}>
                                    <MapPin className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <div className="min-w-0">
                                    <span className="text-sm font-semibold text-blue-900 block truncate">
                                      {item.Junta_Vecinal.nombre}
                                    </span>
                                    <span className="text-xs text-blue-600">
                                      {item.Junta_Vecinal.total_resueltas} resueltas
                                    </span>
                                  </div>
                                </div>

                                {/* Derecha: Componente de Estrellas */}
                                <div className="pl-2 flex-shrink-0">
                                  <RatingDisplay
                                    puntuacion={item.Junta_Vecinal?.calificacion_promedio}
                                    totalVotos={item.Junta_Vecinal?.total_valoraciones}
                                  />
                                </div>
                              </button>
                            ))}
                          </CardContent>
                        </Card>
                      </div>

                      {/* DETALLE (FRÍO) */}
                      <div className="lg:col-span-2">

                        {selectedJuntaFrio ? (
                          <Card className="border-blue-200">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-5 h-5 text-blue-600" />
                                  <div>
                                    <CardTitle className="text-base sm:text-lg text-blue-800">
                                      {selectedJuntaFrio.Junta_Vecinal.nombre}
                                    </CardTitle>
                                    <p className="text-xs text-blue-500">
                                      Análisis de resoluciones y eficiencia operativa
                                    </p>
                                  </div>
                                </div>

                                <div className="text-right text-xs text-blue-600">
                                  <span className="block font-semibold">
                                    {selectedJuntaFrio.Junta_Vecinal.total_resueltas ?? 0} resueltas
                                  </span>
                                </div>
                              </div>
                            </CardHeader>

                            <CardContent className="space-y-4">

                              {/* TARJETAS MÉTRICAS */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

                                <Card className="bg-blue-50 border-blue-200">
                                  <CardContent className="p-3 text-center">
                                    <div className="text-[11px] text-blue-600">Total Resueltas</div>
                                    <div className="text-xl font-bold text-blue-800">
                                      {selectedJuntaFrio.Junta_Vecinal.total_resueltas ?? 0}
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card className="bg-cyan-50 border-cyan-200">
                                  <CardContent className="p-3 text-center">
                                    <div className="text-[11px] text-cyan-600">Eficiencia</div>
                                    <div className="text-xl font-bold text-cyan-700">
                                      {selectedJuntaFrio.Junta_Vecinal.eficiencia ?? 0}%
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card className="bg-indigo-50 border-indigo-200">
                                  <CardContent className="p-3 text-center">
                                    <div className="text-[11px] text-indigo-600">Tiempo Promedio</div>
                                    <div className="text-sm font-semibold text-indigo-700">
                                      {selectedJuntaFrio.tiempo_promedio_resolucion}
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card className="bg-teal-50 border-teal-200">
                                  <CardContent className="p-3 text-center">
                                    <div className="text-[11px] text-teal-700">Última Resolución</div>
                                    <div className="text-sm font-semibold text-teal-800">
                                      {formatearFecha(selectedJuntaFrio.ultima_resolucion)}
                                    </div>
                                  </CardContent>
                                </Card>

                              </div>

                              {/* TABLA DE CATEGORÍAS RESUELTAS */}
                              <div className="border border-blue-100 rounded-lg overflow-hidden">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-blue-50">
                                      <TableHead className="text-blue-800">Categoría</TableHead>
                                      <TableHead className="text-right text-blue-800">Resueltas</TableHead>
                                    </TableRow>
                                  </TableHeader>

                                  <TableBody>
                                    {categorias.map((cat) => (
                                      <TableRow key={cat.id}>
                                        <TableCell className="text-sm">{cat.nombre}</TableCell>
                                        <TableCell className="text-right text-sm font-semibold text-blue-700">
                                          {selectedJuntaFrio[cat.nombre] ?? 0}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>

                            </CardContent>
                          </Card>
                        ) : (
                          <Card className="border-dashed border-blue-200 h-full flex items-center justify-center">
                            <p className="text-sm text-blue-500">
                              Selecciona una junta vecinal para ver el detalle.
                            </p>
                          </Card>
                        )}

                      </div>
                    </div>

                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
        {/* Estilos globales para tooltips y modales consistentes */}
        {isModalOpen && (
          <style dangerouslySetInnerHTML={{
            __html: `
            [data-radix-popper-content-wrapper] { z-index: 10030 !important; }
            [data-radix-select-content] { z-index: 10030 !important; }
            .radix-select-content { z-index: 10030 !important; }
            .z-50 { z-index: 10030 !important; }
          `
          }} />
        )}
      </div>
    </MapaFrioErrorBoundary>
  )
}

export default MapaFrioSeccion