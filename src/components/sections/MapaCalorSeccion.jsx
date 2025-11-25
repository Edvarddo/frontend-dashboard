"use client"
import { useState, useEffect, useCallback, Component } from "react"
import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import FilterMultiSelect from "../filters/FilterMultiSelect"
import FilterDatePicker from "../filters/FilterDatePicker"
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
import MapaCalorComponente from "./MapaCalorComponente"
import useAxiosPrivate from "@/hooks/useAxiosPrivate"
import { API_ROUTES } from "@/api/apiRoutes"

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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [juntaCritica, setJuntaCritica] = useState(null)
  const [loadingJuntaCritica, setLoadingJuntaCritica] = useState(false)
  const [selectedJunta, setSelectedJunta] = useState(null)
  const axiosPrivate = useAxiosPrivate()

  // 1. NORMALIZACIÓN DE DATOS (Esto ya estaba bien, pero es vital)
  const rawJuntas = Array.isArray(juntas) ? juntas : (juntas?.juntas || []);
  const rawCategorias = Array.isArray(categorias) ? categorias : (categorias?.categorias || []);

  const juntaOptions = rawJuntas.map(j => ({
    nombre: j.nombre, // <--- ESTO ES LO QUE BUSCA TU MULTISELECT
    value: j.nombre,
    id: j.id
  }));

  const categoriaOptions = rawCategorias.map(c => ({
    nombre: c.nombre, // <--- ESTO ES LO QUE BUSCA TU MULTISELECT
    value: c.nombre,
    id: c.id
  }));
  const obtenerJuntaCritica = useCallback(async () => {
    try {
      setLoadingJuntaCritica(true)
      const response = await axiosPrivate.get(API_ROUTES.STATS.JUNTA_MAS_CRITICA)
      setJuntaCritica(response.data)
    } catch (error) {
      console.error('Error al obtener junta más crítica:', error)
      setJuntaCritica(null)
    } finally {
      setLoadingJuntaCritica(false)
    }
  }, [axiosPrivate])

  useEffect(() => {
    if (backendData && backendData.length > 0) {
      obtenerJuntaCritica()
    }
  }, [backendData, obtenerJuntaCritica])

  if (!backendData || !Array.isArray(backendData)) {
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

  let processedData = [];
  let estadisticas = {
    totalPendientes: 0,
    totalUrgentes: 0,
    juntaMasProblematica: null,
    tiempoPromedioPendiente: 0
  };

  try {
    processedData = backendData?.length > 0 ? backendData.map(item => {
      return {
        ...item,
        Junta_Vecinal: {
          ...item.Junta_Vecinal,
          pendientes: item.Junta_Vecinal?.pendientes ?? Math.floor((item.Junta_Vecinal?.total_publicaciones || 0) * 0.7),
          urgentes: item.Junta_Vecinal?.urgentes ?? Math.floor((item.Junta_Vecinal?.total_publicaciones || 0) * 0.2),
        },
        tiempo_promedio_pendiente: item.tiempo_promedio_pendiente || "35 días",
        ultima_publicacion: item.ultima_publicacion || "2024-01-26",
      }
    }) : []

    estadisticas = {
      totalPendientes: processedData.length > 0
        ? processedData.reduce((total, item) => total + (item.Junta_Vecinal?.pendientes || 0), 0)
        : 0,
      totalUrgentes: processedData.length > 0
        ? processedData.reduce((total, item) => total + (item.Junta_Vecinal?.urgentes || 0), 0)
        : 0,
      juntaMasProblematica:
        juntaCritica?.junta_mas_critica ? {
          Junta_Vecinal: {
            nombre: juntaCritica.junta_mas_critica.junta.nombre,
            latitud: juntaCritica.junta_mas_critica.junta.latitud,
            longitud: juntaCritica.junta_mas_critica.junta.longitud,
            intensidad: juntaCritica.junta_mas_critica.metricas.indice_criticidad / 100,
            pendientes: juntaCritica.junta_mas_critica.metricas.publicaciones_pendientes,
            urgentes: juntaCritica.junta_mas_critica.metricas.casos_urgentes,
            total_publicaciones: juntaCritica.junta_mas_critica.metricas.total_publicaciones
          },
          tiempo_promedio_pendiente: `${juntaCritica.junta_mas_critica.metricas.tiempo_promedio_pendiente} días`,
          "Asistencia Social": Math.floor(juntaCritica.junta_mas_critica.metricas.total_publicaciones * 0.3),
          "Mantención de Calles": Math.floor(juntaCritica.junta_mas_critica.metricas.total_publicaciones * 0.3),
          "Seguridad": Math.floor(juntaCritica.junta_mas_critica.metricas.total_publicaciones * 0.2),
          "Áreas verdes": Math.floor(juntaCritica.junta_mas_critica.metricas.total_publicaciones * 0.2),
          ultima_publicacion: new Date().toISOString().split('T')[0]
        } :
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
            const tiempoStr = item.tiempo_promedio_pendiente || "0 días";
            const dias = parseInt(tiempoStr.replace(/[^\d]/g, '')) || 0;
            return total + dias;
          }, 0) / processedData.length)
          : 0
    }
  } catch (error) {
    console.error('Error procesando datos del mapa de calor:', error);
    processedData = [];
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
                {/* KPIs */}
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

                {/* Filtros */}
                <Card className="mb-6 bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2 text-red-800">
                      <Filter className="w-5 h-5" />
                      Filtros del mapa de calor
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="[&>div>h2]:text-red-700 [&>div>h2]:text-sm">
                        <FilterMultiSelect
                          label="Juntas Vecinales"
                          placeholder="Seleccionar juntas..."
                          options={juntaOptions}
                          value={selectedFilters.junta}
                          onChange={(value) => setSelectedFilters(prev => ({ ...prev, junta: value }))}
                          clearValues={clearValues}
                        />
                      </div>
                      <div className="[&>div>h2]:text-red-700 [&>div>h2]:text-sm">
                        <FilterMultiSelect
                          label="Categorías"
                          placeholder="Seleccionar categorías..."
                          options={categoriaOptions}
                          value={selectedFilters.categoria}
                          onChange={(value) => setSelectedFilters(prev => ({ ...prev, categoria: value }))}
                          clearValues={clearValues}
                        />
                      </div>
                      <div className="[&>div>h2]:text-red-700 [&>div>h2]:text-sm">
                        <FilterDatePicker
                          label="Rango de fechas"
                          dateRange={dateRange}
                          setDateRange={setDateRange}
                          setIsValid={setIsValid}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 mt-4">
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

                {/* Mapa */}
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
                                    // 2. CORRECCIÓN: Pasar los datos normalizados al hijo
                                    categorias={rawCategorias}
                                    juntas={rawJuntas}
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
                                    <div className="space-y-6" style={{ position: 'relative', zIndex: 10022 }}>

                                      <div style={{ position: 'relative', zIndex: 10023 }} className="[&>div>h2]:text-red-700 [&>div>h2]:text-sm">
                                        <FilterMultiSelect
                                          label="Juntas Vecinales"
                                          placeholder="Seleccionar..."
                                          options={juntaOptions}
                                          value={selectedFilters.junta}
                                          onChange={(value) => setSelectedFilters(prev => ({ ...prev, junta: value }))}
                                          clearValues={clearValues}
                                        />
                                      </div>

                                      <div style={{ position: 'relative', zIndex: 10023 }} className="[&>div>h2]:text-red-700 [&>div>h2]:text-sm">
                                        <FilterMultiSelect
                                          label="Categorías"
                                          placeholder="Seleccionar..."
                                          options={categoriaOptions}
                                          value={selectedFilters.categoria}
                                          onChange={(value) => setSelectedFilters(prev => ({ ...prev, categoria: value }))}
                                          clearValues={clearValues}
                                        />
                                      </div>

                                      <div className="[&>div>h2]:text-red-700 [&>div>h2]:text-sm">
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
                          // 2. CORRECCIÓN: Pasar los datos normalizados al hijo
                          categorias={rawCategorias}
                          juntas={rawJuntas}
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

                {/* Tabla de estadísticas */}
                <Card className="border-red-200">
                  <CardHeader className="bg-gradient-to-r from-red-100 to-orange-100">
                    <CardTitle className="text-red-800 flex items-center gap-2">
                      <AlertTriangle className="w-6 h-6" />
                      Estadísticas de Problemáticas por Junta Vecinal
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-4">
                    {hasData ? (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* LISTA DE JUNTAS */}
                        <div className="lg:col-span-1">
                          <Card className="h-full border-red-200">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-semibold text-red-800">
                                Juntas Vecinales
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0 max-h-[380px] overflow-y-auto space-y-2">
                              {data.map((item) => (
                                <button
                                  key={item.Junta_Vecinal.id ?? item.Junta_Vecinal.nombre}
                                  onClick={() => setSelectedJunta(item)}
                                  className={`w-full flex items-center justify-between rounded-lg px-3 py-2 border text-left transition
                    ${selectedJunta?.Junta_Vecinal?.nombre ===
                                      item.Junta_Vecinal.nombre
                                      ? "border-red-400 bg-red-50"
                                      : "border-red-100 hover:bg-red-50/70"
                                    }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-red-600" />
                                    <span className="text-xs sm:text-sm font-medium text-red-800 line-clamp-2">
                                      {item.Junta_Vecinal.nombre || "Sin nombre"}
                                    </span>
                                  </div>
                                  <div className="flex flex-col items-end gap-1">
                                    <span className="text-[11px] text-red-500 font-semibold">
                                      {item.Junta_Vecinal.pendientes ?? 0} pend.
                                    </span>
                                    <Badge
                                      className={`
                        px-1.5 py-0 h-5 text-[10px]
                        ${(item.Junta_Vecinal.urgentes || 0) >= 6
                                          ? "bg-red-100 text-red-800 border-red-300"
                                          : (item.Junta_Vecinal.urgentes || 0) >= 3
                                            ? "bg-orange-100 text-orange-800 border-orange-300"
                                            : "bg-yellow-100 text-yellow-800 border-yellow-300"
                                        }
                      `}
                                    >
                                      {item.Junta_Vecinal.urgentes ?? 0} urg.
                                    </Badge>
                                  </div>
                                </button>
                              ))}
                            </CardContent>
                          </Card>
                        </div>

                        {/* DETALLE JUNTA */}
                        <div className="lg:col-span-2">
                          {selectedJunta ? (
                            <Card className="border-red-200">
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-red-600" />
                                    <div>
                                      <CardTitle className="text-base sm:text-lg text-red-800">
                                        {selectedJunta.Junta_Vecinal.nombre}
                                      </CardTitle>
                                      <p className="text-xs text-red-500">
                                        Detalle de problemáticas y categorías
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right text-xs text-red-500">
                                    <span className="block font-semibold">
                                      {selectedJunta.Junta_Vecinal.total_publicaciones ?? 0} publ.
                                    </span>
                                    <span>
                                      {selectedJunta.Junta_Vecinal.pendientes ?? 0} pendientes
                                    </span>
                                  </div>
                                </div>
                              </CardHeader>

                              <CardContent className="space-y-4">
                                {/* MÉTRICAS */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                  <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                                    <CardContent className="p-3 text-center">
                                      <div className="text-[11px] text-red-600">
                                        Total Pendientes
                                      </div>
                                      <div className="text-xl font-bold text-red-700">
                                        {selectedJunta.Junta_Vecinal.pendientes ?? 0}
                                      </div>
                                    </CardContent>
                                  </Card>

                                  <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                                    <CardContent className="p-3 text-center">
                                      <div className="text-[11px] text-orange-600">
                                        Casos Urgentes
                                      </div>
                                      <div className="text-xl font-bold text-orange-700">
                                        {selectedJunta.Junta_Vecinal.urgentes ?? 0}
                                      </div>
                                    </CardContent>
                                  </Card>

                                  <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
                                    <CardContent className="p-3 text-center">
                                      <div className="text-[11px] text-pink-600">
                                        Tiempo Promedio
                                      </div>
                                      <div className="text-sm font-semibold text-pink-700">
                                        {selectedJunta.tiempo_promedio_pendiente || "N/A"}
                                      </div>
                                    </CardContent>
                                  </Card>

                                  <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                                    <CardContent className="p-3 text-center">
                                      <div className="text-[11px] text-yellow-700">
                                        Última Publicación
                                      </div>
                                      <div className="text-sm font-semibold text-yellow-800">
                                        {selectedJunta.ultima_publicacion
                                          ? formatearFecha(selectedJunta.ultima_publicacion)
                                          : "N/A"}
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>

                                {/* TABLA DE CATEGORÍAS */}
                                <div className="border border-red-100 rounded-lg overflow-hidden">
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="bg-red-50">
                                        <TableHead className="text-red-800">
                                          Categoría
                                        </TableHead>
                                        <TableHead className="text-right text-red-800">
                                          Cantidad
                                        </TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {/* 3. CORRECCIÓN: Usar rawCategorias en lugar de categorias */}
                                      {rawCategorias.map((cat) => (
                                        <TableRow key={cat.id}>
                                          <TableCell className="text-sm">
                                            {cat.nombre}
                                          </TableCell>
                                          <TableCell className="text-right text-sm font-semibold text-red-700">
                                            {selectedJunta[cat.nombre] ?? 0}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </CardContent>
                            </Card>
                          ) : (
                            <Card className="border-dashed border-red-200 h-full flex items-center justify-center">
                              <p className="text-sm text-red-500">
                                Selecciona una junta vecinal para ver el detalle.
                              </p>
                            </Card>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="h-32 flex items-center justify-center text-red-500">
                        No hay datos para mostrar.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>

        {/* Estilos globales */}
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
    </MapaCalorErrorBoundary>
  )
}

export default MapaCalorSeccion