// src/components/dashboard/Dashboard.jsx
import { set, format } from 'date-fns'
import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select"
import {
  FileText,
  Users,
  CheckCircle,
  CodeIcon as ChartColumnIncreasing,
  PieChartIcon as ChartPie,
  LineChartIcon as ChartLine,
  PercentIcon,
  Table,
  Maximize2
} from 'lucide-react'
import TopBar from '../TopBar'
import Filters from "../Filters"
import EmptyState from '../EmptyState'
import { ResolutionRateTable } from '../sections/TablaTasaResolución'
import { getColorForCategory } from '@/lib/utils'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import axios from '@/api/axios'
import useRefreshToken from '@/contexts/useRefreshToken'
import { toast } from '@/hooks/use-toast'
import { API_ROUTES } from '../../api/apiRoutes'
import ChartDetailDialog from "../sections/ChartDetailDialog"

const Dashboard = ({ isOpened, setIsOpened }) => {
  const axiosPrivate = useAxiosPrivate()
  const refresh = useRefreshToken()

  const [barData, setBarData] = useState([])
  const [pieData, setPieData] = useState([])
  const [cardsData, setCardsData] = useState({})
  const [barKeys, setBarKeys] = useState([])
  const [lineChartData, setLineChartData] = useState([])

  const [categorias, setCategorias] = useState([])
  const [juntasVecinales, setJuntasVecinales] = useState([])
  const [departamentos, setDepartamentos] = useState([])
  const [situaciones, setSituaciones] = useState([])

  // dateRange nace con año actual (1 enero → hoy)
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date()
    const startOfYear = set(now, { month: 0, date: 1 })
    return { from: startOfYear, to: now }
  })

  // filtros también nace con ese rango por defecto
  const [filtros, setFiltros] = useState(() => {
    const now = new Date()
    const startOfYear = set(now, { month: 0, date: 1 })
    const iniDate = `fecha_publicacion_after=${format(startOfYear, "yyyy-MM-dd")}&`
    const endDate = `fecha_publicacion_before=${format(now, "yyyy-MM-dd")}&`
    return `${iniDate}${endDate}`
  })

  const [selectedCategoria, setSelectedCategoria] = useState(null)
  const [selectedSituacion, setSelectedSituacion] = useState(null)
  const [selectedJunta, setSelectedJunta] = useState(null)
  const [selectedDepto, setSelectedDepto] = useState(null)
  const [selectedDeptoReporte, setSelectedDeptoReporte] = useState("General")
  const [clearValues, setClearValues] = useState(false)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [additionalComments, setAdditionalComments] = useState("")
  const barChartRef = useRef(null)
  const pieChartRef = useRef(null)
  const lineChartRef = useRef(null)

  const [filtrosObj, setFiltrosObj] = useState({
    categoria: [],
    junta: [],
    situacion: [],
    departamentos: [],
    iniDate: null,
    endDate: null
  })
  const [loading, setLoading] = useState(false)
  const [isValid, setIsValid] = useState(false)
  const [filterError, setFilterError] = useState(null)
  const [tasaResolucionData, setTasaResolucionData] = useState({})

  // cuál gráfico está maximizado: "bar" | "pie" | "line" | null
  const [enlargedChart, setEnlargedChart] = useState(null)

  const api_url = import.meta.env.VITE_URL_PROD_VERCEL

  const fetchData = async (urls) => {
    const authToken = localStorage.getItem('authToken')

    if (!authToken) {
      setLoading(false)
      return
    }

    try {
      const requests = urls.map((url) => axiosPrivate(url))
      const responses = await Promise.all(requests)

      const data = responses.map((response) => {
        if (response.status < 200 || response.status >= 300) {
          console.error(`Error en la URL ${response.config.url}: ${response.status}`)
          throw new Error(`Error al obtener datos de ${response.config.url}`)
        }
        return response.data
      })

      setCategorias(data[0] || [])
      setSituaciones(data[3] || [])

      const juntas = data[1]?.map((junta) => ({
        ...junta,
        nombre: junta.nombre_junta,
      }))

      setJuntasVecinales(juntas || [])
      setDepartamentos(data[2] || [])
    } catch (error) {
      console.error('Error general:', error.message)
      toast({
        title: 'Error al cargar los datos',
        description: 'Ocurrió un error al cargar los datos. Por favor, intenta nuevamente.',
        status: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCharData = async (urls) => {
    setLoading(true)
    console.log("Fetching chart data...", urls)
    try {
      const requests = await urls.map(url => axiosPrivate(url))
      const responses = await Promise.all(requests)
      const data = responses.map(response => response.data)

      let distinctValues = []

      data[0]?.forEach((monthData) => {
        Object.keys(monthData).forEach((key) => {
          if (!distinctValues.includes(key) && key !== 'name') {
            distinctValues.push(key)
          }
        })
      })

      setCardsData(data[2] || {})
      setBarKeys(distinctValues)
      setBarData(data[0] ? data[0] : [])
      setPieData(data[1] ? data[1] : [])
      setLineChartData(data[3] ? data[3] : [])
      setTasaResolucionData(data[4] ? data[4] : {})
    } catch (error) {
      console.log(error)
    } finally {
      console.log(cardsData)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData([
      API_ROUTES.CATEGORIAS.ROOT,
      API_ROUTES.JUNTAS_VECINALES.ROOT,
      API_ROUTES.DEPARTAMENTOS.ROOT,
      API_ROUTES.SITUACIONES_PUBLICACIONES.ROOT
    ])
  }, [api_url])

  useEffect(() => {
    console.log("Fetching chart data...", API_ROUTES)

    if (!filtros) return

    fetchCharData([
      `${API_ROUTES.STATS.PUBLICACIONES_POR_MES_Y_CATEGORIA}?${filtros}`,
      `${API_ROUTES.STATS.PUBLICACIONES_POR_CATEGORIA}?${filtros}`,
      `${API_ROUTES.STATS.RESUMEN_ESTADISTICAS}?${filtros}`,
      `${API_ROUTES.STATS.RESUELTOS_POR_MES}?${filtros}`,
      `${API_ROUTES.STATS.TASA_RESOLUCION_DEPARTAMENTO}?${filtros}`
    ])
  }, [filtros, api_url])

  const aplicarFiltros = () => {
    const categoriesParams = filtrosObj.categoria.join(",")
    const juntasParams = filtrosObj.junta.join(",")
    const situacionesParams = filtrosObj.situacion.join(",")
    const departamentosParams = filtrosObj.departamentos.join(",")

    const category =
      filtrosObj.categoria.length > 0 ? "categoria=" + categoriesParams + "&" : ""
    const junta =
      filtrosObj.junta.length > 0 ? "junta_vecinal=" + juntasParams + "&" : ""
    const situation =
      filtrosObj.situacion.length > 0 ? "situacion=" + situacionesParams + "&" : ""
    const departamento =
      filtrosObj.departamentos.length > 0
        ? "departamento=" + departamentosParams + "&"
        : ""

    let fromDate = dateRange?.from
    let toDate = dateRange?.to

    if (!fromDate || !toDate) {
      const now = new Date()
      const startOfYear = set(now, { month: 0, date: 1 })
      fromDate = fromDate || startOfYear
      toDate = toDate || now
    }

    const iniDate = fromDate
      ? "fecha_publicacion_after=" + format(fromDate, "yyyy-MM-dd") + "&"
      : ""
    const endDate = toDate
      ? "fecha_publicacion_before=" + format(toDate, "yyyy-MM-dd") + "&"
      : ""

    const filtros = `${category}${junta}${situation}${departamento}${iniDate}${endDate}`
    setFiltros(filtros)
  }

  const limpiarFiltros = () => {
    setSelectedCategoria(null)
    setSelectedSituacion(null)
    setSelectedJunta(null)
    setSelectedDepto(null)

    const now = new Date()
    const startOfYear = set(now, { month: 0, date: 1 })

    setDateRange({ from: startOfYear, to: now })
    setFiltrosObj({
      categoria: [],
      junta: [],
      situacion: [],
      departamentos: [],
      iniDate: null,
      endDate: null
    })
    setClearValues(!clearValues)

    const iniDate = `fecha_publicacion_after=${format(startOfYear, "yyyy-MM-dd")}&`
    const endDate = `fecha_publicacion_before=${format(now, "yyyy-MM-dd")}&`
    setFiltros(`${iniDate}${endDate}`)
  }

  const handleOpenSidebar = () => {
    setIsOpened(!isOpened)
  }

  const handleDownload = () => {
    console.log("download")
  }

  const handleExportPDFBackend = async (additionalComments, selectedDeptoReporte) => {
    try {
      console.log({ selectedDeptoReporte })

      const response = await axiosPrivate.get(
        `${API_ROUTES.REPORTS.GENERATE_PDF}?${filtros || ""}`,
        {
          params: { comentarios: additionalComments, departamento_reporte: selectedDeptoReporte },
          responseType: "blob",
        }
      )

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      const link = document.createElement("a")
      link.href = url

      const filename = `reporte_publicaciones_${new Date().toISOString().split("T")[0]}.pdf`
      link.setAttribute("download", filename)

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error al descargar el archivo:", error)
    }
  }

  const handleModalConfirm = () => {
    handleExportPDFBackend(additionalComments, selectedDeptoReporte)
    setIsModalOpen(false)
    setAdditionalComments("")
  }

  const calculateResolutionRate = () => {
    if (cardsData?.publicaciones && cardsData?.problemas_resueltos) {
      return ((cardsData.problemas_resueltos / cardsData.publicaciones) * 100).toFixed(1)
    }
    return 0
  }

  // Texto de resumen de filtros para pasar al dialog
  const filtrosResumen = () => {
    const partes = []

    if (dateRange?.from && dateRange?.to) {
      partes.push(
        `Rango de fechas: ${format(dateRange.from, "dd-MM-yyyy")} a ${format(
          dateRange.to,
          "dd-MM-yyyy"
        )}`
      )
    }

    if (filtrosObj.categoria.length > 0) {
      partes.push(`Categorías: ${filtrosObj.categoria.join(", ")}`)
    }

    if (filtrosObj.junta.length > 0) {
      partes.push(`Juntas Vecinales: ${filtrosObj.junta.join(", ")}`)
    }

    if (filtrosObj.situacion.length > 0) {
      partes.push(`Situaciones: ${filtrosObj.situacion.join(", ")}`)
    }

    if (filtrosObj.departamentos.length > 0) {
      partes.push(`Departamentos: ${filtrosObj.departamentos.join(", ")}`)
    }

    if (partes.length === 0) {
      return "Filtros: año actual (1 de enero a hoy), sin filtros adicionales."
    }

    return partes.join(" • ")
  }

  return (
    <>
      <TopBar handleOpenSidebar={handleOpenSidebar} title="Dashboard Municipal" />
      <div className="p-8 bg-gray-100 min-h-screen">
        {/* Tarjetas KPI */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            <>
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </>
          ) : (
            <>
              <Card className="overflow-hidden bg-blue-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <CardTitle className="text-base font-medium text-gray-600">
                      Publicaciones Recibidas
                    </CardTitle>
                    <div className="p-2 bg-white rounded-full shadow-sm">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div className="text-3xl font-bold">
                      {cardsData?.publicaciones || 0}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <CardTitle className="text-base font-medium text-gray-600">
                      Usuarios Activos
                    </CardTitle>
                    <div className="p-2 bg-white rounded-full shadow-sm">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div className="text-3xl font-bold">
                      {cardsData?.usuarios || 0}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden bg-purple-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <CardTitle className="text-base font-medium text-gray-600">
                      Publicaciones Resueltas
                    </CardTitle>
                    <div className="p-2 bg-white rounded-full shadow-sm">
                      <CheckCircle className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div className="text-3xl font-bold">
                      {cardsData?.problemas_resueltos || 0}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden bg-yellow-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <CardTitle className="text-base font-medium text-gray-600">
                      Tasa de Resolución
                    </CardTitle>
                    <div className="p-2 bg-white rounded-full shadow-sm">
                      <PercentIcon className="h-5 w-5 text-yellow-600" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div className="text-3xl font-bold">
                      {calculateResolutionRate()}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Filtros */}
        <div className='mb-5'>
          <Filters
            clearValues={clearValues}
            categorias={categorias}
            situaciones={situaciones}
            juntasVecinales={juntasVecinales}
            departamentos={departamentos}
            setFiltrosObj={setFiltrosObj}
            filtrosObj={filtrosObj}
            dateRange={dateRange}
            setDateRange={setDateRange}
            setIsValid={setIsValid}
            isValid={isValid}
            loading={loading}
            handleDownload={handleDownload}
            limpiarFiltros={limpiarFiltros}
            aplicarFiltros={aplicarFiltros}
            isDownloadAvailable={false}
            showDownload={false}
          />
        </div>

        {/* Gráficos: barras y torta */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {loading ? (
            <>
              <Skeleton className="h-96" />
              <Skeleton className="h-96" />
            </>
          ) : (
            <>
              <Card ref={barChartRef}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      Publicaciones por Mes y Categoría
                    </h3>
                    {/* <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEnlargedChart("bar")}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button> */}
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    {barData.length === 0 ? (
                      <div className="flex justify-center items-center h-full">
                        <EmptyState
                          Image={ChartColumnIncreasing}
                          title="No hay datos para mostrar"
                          description="No se encontraron datos para mostrar"
                        />
                      </div>
                    ) : (
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {barKeys.map((key, index) => (
                          <Bar
                            key={index}
                            dataKey={key}
                            stackId="a"
                            fill={getColorForCategory(key)}
                          />
                        ))}
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card ref={pieChartRef}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      Distribución de Publicaciones por Categoría
                    </h3>
                    {/* <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEnlargedChart("pie")}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button> */}
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    {pieData.length === 0 ? (
                      <div className="flex justify-center items-center h-full">
                        <EmptyState
                          Image={ChartPie}
                          title="No hay datos para mostrar"
                          description="No se encontraron datos para mostrar"
                        />
                      </div>
                    ) : (
                      <PieChart>
                        <Pie
                          label={true}
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData?.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={getColorForCategory(entry.name)}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    )}
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Línea de tendencia */}
        {loading ? (
          <Skeleton className="h-96 mb-8" />
        ) : (
          <Card className="mb-8" ref={lineChartRef}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  Tendencia de Resolución de Problemas
                </h3>
                {/* <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setEnlargedChart("line")}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button> */}
              </div>
              <ResponsiveContainer width="100%" height={300}>
                {lineChartData.length === 0 ? (
                  <div className="flex justify-center items-center h-full">
                    <EmptyState
                      Image={ChartLine}
                      title="No hay datos para mostrar"
                      description="No se encontraron datos para mostrar"
                    />
                  </div>
                ) : (
                  <LineChart data={lineChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      name="Recibidos"
                      strokeWidth={3}
                      type="monotone"
                      dataKey="recibidos"
                      stroke="#82ca9d"
                    />
                    <Line
                      name="Resueltos"
                      strokeWidth={3}
                      type="monotone"
                      dataKey="resueltos"
                      stroke="#8884d8"
                    />
                    <Line
                      name="En curso"
                      strokeWidth={3}
                      type="monotone"
                      dataKey="en_curso"
                      stroke="#ff8042"
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Tabla tasa resolución */}
        {loading ? (
          <Skeleton className="h-96 mb-8" />
        ) : (
          tasaResolucionData && Object.keys(tasaResolucionData).length === 0 ? (
            <Card className="mb-8">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Tasa de Resolución por Departamento y Mes
                </h3>
                <EmptyState
                  Image={Table}
                  title="No hay datos para mostrar"
                  description="No se encontraron datos para mostrar"
                />
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-8">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Tasa de Resolución por Departamento y Mes
                </h3>
                <ResolutionRateTable data={tasaResolucionData} />
              </CardContent>
            </Card>
          )
        )}

        {/* Acciones rápidas */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Acciones Rápidas</h3>
            <div className="flex flex-wrap gap-4">
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    disabled={
                      pieData.length <= 0 &&
                      barData.length <= 0 &&
                      lineChartData.length <= 0 &&
                      Object.keys(tasaResolucionData).length === 0
                    }
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    Generar Reporte
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Agregar Comentarios al Reporte</DialogTitle>
                    <DialogDescription>
                      Puede agregar comentarios adicionales que se incluirán en el reporte PDF.
                    </DialogDescription>
                  </DialogHeader>
                  <Textarea
                    value={additionalComments}
                    onChange={(e) => setAdditionalComments(e.target.value)}
                    placeholder="Escriba sus comentarios aquí..."
                  />
                  {/* Seleccionar Departamento */}
                  <div className="space-y-2">
                    <label
                      htmlFor="departamento"
                      className="text-sm font-medium text-gray-700"
                    >
                      Seleccionar Departamento Municipal
                    </label>
                    <Select
                      value={selectedDeptoReporte}
                      onValueChange={setSelectedDeptoReporte}
                      defaultValue="General"
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccione un departamento..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General">General</SelectItem>
                        {departamentos?.map((departamento) => (
                          <SelectItem
                            key={departamento.id}
                            value={departamento.nombre}
                          >
                            {departamento.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      className="bg-green-500 hover:bg-green-600 text-white"
                      onClick={handleModalConfirm}
                    >
                      Descargar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DIALOG DE VISTA MAXIMIZADA (reutilizable) */}
      <ChartDetailDialog
        open={!!enlargedChart}
        onOpenChange={(open) => {
          if (!open) setEnlargedChart(null)
        }}
        chartType={enlargedChart}
        barData={barData}
        barKeys={barKeys}
        pieData={pieData}
        lineChartData={lineChartData}
        filtrosResumenText={filtrosResumen()}
        // mismos filtros que el dashboard
        filtrosObj={filtrosObj}
        setFiltrosObj={setFiltrosObj}
        dateRange={dateRange}
        setDateRange={setDateRange}
        categorias={categorias}
        situaciones={situaciones}
        juntasVecinales={juntasVecinales}
        departamentos={departamentos}
        clearValues={clearValues}
        setIsValid={setIsValid}
        isValid={isValid}
        loading={loading}
        handleDownload={handleDownload}
        limpiarFiltros={limpiarFiltros}
        aplicarFiltros={aplicarFiltros}
      />
    </>
  )
}

export default Dashboard
