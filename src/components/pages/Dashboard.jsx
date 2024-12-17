import { set, format } from 'date-fns'
import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { BarChart, Bar, PieChart, Pie, LineChart, Line, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { FileText, Users, CheckCircle, TrendingUp, CodeIcon as ChartColumnIncreasing, PieChartIcon as ChartPie, LineChartIcon as ChartLine, ArrowUpRight, PercentIcon, Table } from 'lucide-react'
import TopBar from '../TopBar'
import Filters from "../Filters"
import EmptyState from '../EmptyState'
import { ResolutionRateTable } from '../sections/TablaTasaResolución'
import { getColorForCategory, chartColors } from '@/lib/utils'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import axios from '@/api/axios'
import useRefreshToken from '@/contexts/useRefreshToken'
import { toast } from '@/hooks/use-toast'

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


  const [filtros, setFiltros] = useState(null)
  const [selectedCategoria, setSelectedCategoria] = useState(null)
  const [selectedSituacion, setSelectedSituacion] = useState(null)
  const [selectedJunta, setSelectedJunta] = useState(null)
  const [selectedDepto, setSelectedDepto] = useState(null)
  const [selectedDeptoReporte, setSelectedDeptoReporte] = useState("General")
  const [dateRange, setDateRange] = useState({ from: null, to: null })
  const [clearValues, setClearValues] = useState(false)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [additionalComments, setAdditionalComments] = useState("")
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const lineChartRef = useRef(null);

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

  const api_url = import.meta.env.VITE_URL_PROD_VERCEL

  const fetchData = async (urls) => {
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
      console.log('No se encontró un token de autenticación.');
      setLoading(false); // Asegúrate de detener el spinner u otros indicadores de carga.
      return;
    }

    try {
      const requests = urls.map((url) => axiosPrivate(url));
      console.log(requests);

      // responses será un array de objetos con la estructura de Axios (cada uno con .data, .status, etc.)
      const responses = await Promise.all(requests);

      // Como Axios ya parsea la respuesta, puedes acceder directamente a response.data
      const data = responses.map((response) => {
        // Validación del status: por ejemplo si no es 200, lanzar error.
        if (response.status < 200 || response.status >= 300) {
          console.error(`Error en la URL ${response.config.url}: ${response.status}`);
          throw new Error(`Error al obtener datos de ${response.config.url}`);
        }
        return response.data; // Aquí ya tienes el JSON listo
      });

      console.log(data);

      // Asignación de datos a los estados.
      setCategorias(data[0] || []);
      setSituaciones(data[3] || []);

      const juntas = data[1]?.map((junta) => ({
        ...junta,
        nombre: junta.nombre_junta,
      }));

      setJuntasVecinales(juntas || []);
      setDepartamentos(data[2] || []);
    } catch (error) {
      console.error('Error general:', error.message);
      toast({
        title: 'Error al cargar los datos',
        description: 'Ocurrió un error al cargar los datos. Por favor, intenta nuevamente.',
        status: 'error',
      });
    } finally {
      setLoading(false);

    }
  };

  const fetchCharData = async (urls) => {
    setLoading(true)
    try {
      const requests =await urls.map(url => axiosPrivate(url))
      console.log(requests)
      const responses = await Promise.all(requests)

      // En lugar de usar response.json(), en Axios accedes directamente a response.data
      const data = responses.map(response => response.data)

      let distinctValues = []
      console.log(data)

      data[0]?.forEach((monthData) => {
        // Object.keys obtendrá las llaves del objeto monthData
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
      `categorias/`,
      `juntas-vecinales/`,
      `departamentos-municipales/`,
      `situaciones-publicaciones/`
    ])
  }, [api_url])

  useEffect(() => {
    fetchCharData([
      `${api_url}publicaciones-por-mes-y-categoria/?${filtros || ""}`,
      `${api_url}publicaciones-por-categoria/?${filtros || ""}`,
      `${api_url}resumen-estadisticas/?${filtros || ""}`,
      `${api_url}resueltos-por-mes/?${filtros || ""}`,
      `${api_url}tasa-resolucion-departamento/?${filtros || ""}`
    ])
  }, [filtros, api_url])

  useEffect(() => {
  }, [filtrosObj])

  const handleOpenSidebar = () => {
    setIsOpened(!isOpened)
  }

  const handleDownload = () => {
    console.log("download")
  }

  const aplicarFiltros = () => {
    const categoriesParams = filtrosObj.categoria.join(",")
    const juntasParams = filtrosObj.junta.join(",")
    const situacionesParams = filtrosObj.situacion.join(",")
    const departamentosParams = filtrosObj.departamentos.join(",")

    const category = filtrosObj.categoria.length > 0 ? "categoria=" + categoriesParams + "&" : "",
      junta = filtrosObj.junta.length > 0 ? "junta_vecinal=" + juntasParams + "&" : "",
      situation = filtrosObj.situacion.length > 0 ? "situacion=" + situacionesParams + "&" : "",
      departamento = filtrosObj.departamentos.length > 0 ? "departamento=" + departamentosParams + "&" : "",
      iniDate = dateRange?.from ? "fecha_publicacion_after=" + format(dateRange?.from, "yyyy-MM-dd") + "&" : "",
      endDate = dateRange?.to ? "fecha_publicacion_before=" + format(dateRange?.to, "yyyy-MM-dd") + "&" : ""

    const filtros = `${category}${junta}${situation}${departamento}${iniDate}${endDate}`
    setFiltros(filtros)
  }

  const limpiarFiltros = () => {
    setSelectedCategoria(null)
    setSelectedSituacion(null)
    setSelectedJunta(null)
    setSelectedDepto(null)
    setDateRange({ from: null, to: null })
    setFiltrosObj({
      categoria: [],
      junta: [],
      situacion: [],
      departamentos: [],
      iniDate: null,
      endDate: null
    })
    setClearValues(!clearValues)
    setFiltros(null)
  }

  const handleExportPDFBackend = async (additionalComments, selectedDeptoReporte) => {
    try {
      console.log({ selectedDeptoReporte });
      const token = localStorage.getItem("authToken"); // Obtén el token desde el almacenamiento local
      const response = await axios.get(`${api_url}generate-pdf-report/?${filtros || ""}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Incluye el token en los encabezados
        },
        params: { comentarios: additionalComments, departamento_reporte: selectedDeptoReporte },
        responseType: "blob", // Asegúrate de manejar la respuesta como un archivo blob
      });

      // Crear una URL para el archivo y desencadenar la descarga
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement("a");
      link.href = url;

      // Usa un nombre personalizado para el archivo
      const filename = `reporte_publicaciones_${new Date().toISOString().split("T")[0]}.pdf`;
      link.setAttribute("download", filename);

      document.body.appendChild(link);
      link.click();

      // Limpia el elemento creado
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error al descargar el archivo:", error);
    }
  };

  const handleModalConfirm = () => {
    handleExportPDFBackend(additionalComments, selectedDeptoReporte);
    setIsModalOpen(false);
    setAdditionalComments("");
  };

  const calculateResolutionRate = () => {
    if (cardsData?.publicaciones && cardsData?.problemas_resueltos) {
      return ((cardsData.problemas_resueltos / cardsData.publicaciones) * 100).toFixed(1);
    }
    return 0;
  };



  return (
    <>
      <TopBar handleOpenSidebar={handleOpenSidebar} title="Dashboard Municipal" />
      <div className="p-8 bg-gray-100 min-h-screen">
        {/* <Button onClick={() => refresh()}>PRUEBA</Button> */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {(loading) ? (
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
                    <CardTitle className="text-base font-medium text-gray-600">Publicaciones Recibidas</CardTitle>
                    <div className="p-2 bg-white rounded-full shadow-sm">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div className="text-3xl font-bold">{cardsData?.publicaciones || 0}</div>
                    <div className="flex items-center text-sm text-green-600">
                      {/* <ArrowUpRight className="h-4 w-4 mr-1" />
                      <span>5%</span> */}
                    </div>
                  </div>
                  {/* <p className="text-sm text-muted-foreground mt-2">vs. mes anterior</p> */}
                </CardContent>
              </Card>
              <Card className="overflow-hidden bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <CardTitle className="text-base font-medium text-gray-600">Usuarios Activos</CardTitle>
                    <div className="p-2 bg-white rounded-full shadow-sm">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div className="text-3xl font-bold">{cardsData?.usuarios || 0}</div>
                    <div className="flex items-center text-sm text-green-600">
                      {/* <ArrowUpRight className="h-4 w-4 mr-1" />
                      <span>3%</span> */}
                    </div>
                  </div>
                  {/* <p className="text-sm text-muted-foreground mt-2">vs. semana anterior</p> */}
                </CardContent>
              </Card>
              <Card className="overflow-hidden bg-purple-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <CardTitle className="text-base font-medium text-gray-600">Publicaciones Resueltas</CardTitle>
                    <div className="p-2 bg-white rounded-full shadow-sm">
                      <CheckCircle className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div className="text-3xl font-bold">{cardsData?.problemas_resueltos || 0}</div>
                    <div className="flex items-center text-sm text-green-600">
                      {/* <ArrowUpRight className="h-4 w-4 mr-1" />
                      <span>7%</span> */}
                    </div>
                  </div>
                  {/* <p className="text-sm text-muted-foreground mt-2">vs. mes anterior</p> */}
                </CardContent>
              </Card>
              <Card className="overflow-hidden bg-yellow-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <CardTitle className="text-base font-medium text-gray-600">Tasa de Resolución</CardTitle>
                    <div className="p-2 bg-white rounded-full shadow-sm">
                      <PercentIcon className="h-5 w-5 text-yellow-600" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div className="text-3xl font-bold">{calculateResolutionRate()}%</div>
                    <div className="flex items-center text-sm text-green-600">
                      {/* <ArrowUpRight className="h-4 w-4 mr-1" />
                      <span>2%</span> */}
                    </div>
                  </div>
                  {/* <p className="text-sm text-muted-foreground mt-2">vs. mes anterior</p> */}
                </CardContent>
              </Card>
            </>
          )}
        </div>
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
                  <h3 className="text-lg font-semibold mb-4">Publicaciones por Mes y Categoría</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    {barData.length === 0 ? (
                      <div className="flex justify-center items-center h-full">
                        <EmptyState Image={ChartColumnIncreasing} title="No hay datos para mostrar" description="No se encontraron datos para mostrar" />
                      </div>
                    ) : (
                      <BarChart
                      // change language
                       
                      data={barData}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip 
                          // change language to spanish
                          label={(value) => {
                            console.log(value)
                          }}

                        
                        />
                        <Legend />
                        
                        {barKeys.map((key, index) => (
                          <Bar key={index} dataKey={key} stackId="a" fill={getColorForCategory(key)} />
                        ))}
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card ref={pieChartRef}>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Distribución de Publicaciones por Categoría</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    {pieData.length === 0 ? (
                      <div className="flex justify-center items-center h-full">
                        <EmptyState Image={ChartPie} title="No hay datos para mostrar" description="No se encontraron datos para mostrar" />
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
                            <Cell key={`cell-${index}`} fill={getColorForCategory(entry.name)} />
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
        {loading ? (
          <Skeleton className="h-96 mb-8" />
        ) : (
          <Card className="mb-8" ref={lineChartRef}>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Tendencia de Resolución de Problemas</h3>
              <ResponsiveContainer width="100%" height={300}>
                {lineChartData.length === 0 ? (
                  <div className="flex justify-center items-center h-full">
                    <EmptyState Image={ChartLine} title="No hay datos para mostrar" description="No se encontraron datos para mostrar" />
                  </div>
                ) : (
                  <LineChart data={lineChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line name="Recibidos" strokeWidth={3} type="monotone" dataKey="recibidos" stroke="#82ca9d" />
                    <Line name="Resueltos" strokeWidth={3} type="monotone" dataKey="resueltos" stroke="#8884d8" />
                    <Line name="En curso" strokeWidth={3} type="monotone" dataKey="en_curso" stroke="#ff8042" />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
        {loading ? (
          <Skeleton className="h-96 mb-8" />
        ) : (
          tasaResolucionData && Object.keys(tasaResolucionData).length == 0
            ?
            (
              <Card className="mb-8">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Tasa de Resolución por Departamento y Mes</h3>
                  <EmptyState Image={Table} title="No hay datos para mostrar" description="No se encontraron datos para mostrar" />
                </CardContent>
              </Card>
            )
            :
            (<Card className="mb-8">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Tasa de Resolución por Departamento y Mes</h3>
                <ResolutionRateTable data={tasaResolucionData} />
              </CardContent>
            </Card>
            )
        )}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Acciones Rápidas</h3>
            <div className="flex flex-wrap gap-4">
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    disabled={pieData.length <= 0 && barData.length <= 0 && lineChartData.length <= 0 && Object.keys(tasaResolucionData).length == 0}
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
                    <label htmlFor="departamento" className="text-sm font-medium text-gray-700">
                      Seleccionar Departamento Municipal
                    </label>
                    <Select value={selectedDeptoReporte} onValueChange={setSelectedDeptoReporte} defaultValue="General">
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccione un departamento..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General">General</SelectItem>
                        {departamentos?.map((departamento) => (
                          <SelectItem key={departamento.id} value={departamento.nombre}>
                            {departamento.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
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
    </>
  )
}

export default Dashboard

