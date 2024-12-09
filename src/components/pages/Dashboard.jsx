import { set, format } from 'date-fns'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { BarChart, Bar, PieChart, Pie, LineChart, Line, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, Users, CheckCircle, TrendingUp, CodeIcon as ChartColumnIncreasing, PieChartIcon as ChartPie, LineChartIcon as ChartLine, ArrowUpRight, PercentIcon } from 'lucide-react'
import TopBar from '../TopBar'
import Filters from "../Filters"
import EmptyState from '../EmptyState'
import { getColorForCategory, chartColors } from '@/lib/utils'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'

const Dashboard = ({ isOpened, setIsOpened }) => {
  const axiosPrivate = useAxiosPrivate()
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
    } finally {
      setLoading(false);
    }
  };

  const fetchCharData = async (urls) => {
    setLoading(true)
    try {
      const requests = urls.map(url => axiosPrivate(url))
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
      setBarData(data[0] || [])
      setPieData(data[1] || [])
      setLineChartData(data[3] || [])
    
    } catch (error) {
      console.log(error)
    } finally {
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
      `publicaciones-por-mes-y-categoria/?${filtros}`,
      `publicaciones-por-categoria/?${filtros}`,
      `resumen-estadisticas/?${filtros}`,
      `resueltos-por-mes/?${filtros}`
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

  const splitTextToLines = (doc, text, maxWidth) => {
    const lines = [];
    let currentLine = '';
    const words = text.split(' ');

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const width = doc.getStringUnitWidth(currentLine + ' ' + word) * doc.internal.getFontSize() / doc.internal.scaleFactor;
      if (width < maxWidth) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
    return lines;
  };
  const handleExportPDFBackend = async () => {
    try {
      const token = localStorage.getItem("authToken"); // Obtén el token desde el almacenamiento local
      const response = await axiosPrivate.get(`${api_url}generate-pdf-report/`, {
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
  }
  
  const handleExportPDF = async (comments = "") => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Dashboard Municipal', 14, 20);

    doc.setFontSize(14);
    doc.text('Resumen de Estadísticas', 14, 30);
    doc.text(`Publicaciones Recibidas: ${cardsData?.publicaciones || 0}`, 14, 40);
    doc.text(`Usuarios Activos: ${cardsData?.usuarios || 0}`, 14, 50);
    doc.text(`Publicaciones Resueltas: ${cardsData?.problemas_resueltos || 0}`, 14, 60);
    doc.text(`Tasa de Resolución: ${calculateResolutionRate()}%`, 14, 70);

    if (barChartRef.current && barData.length > 0) {
      const barCanvas = await html2canvas(barChartRef.current);
      const barImgData = barCanvas.toDataURL('image/png');
      doc.addPage();
      doc.text('Publicaciones por Mes y Categoría:', 14, 20);
      doc.addImage(barImgData, 'PNG', 14, 30, 180, 90);
    }

    if (pieChartRef.current && pieData.length > 0) {
      const pieCanvas = await html2canvas(pieChartRef.current);
      const pieImgData = pieCanvas.toDataURL('image/png');
      doc.addPage();
      doc.text('Publicaciones por Categoría:', 14, 20);
      doc.addImage(pieImgData, 'PNG', 14, 30, 180, 90);
    }

    if (lineChartRef.current && lineChartData.length > 0) {
      const lineCanvas = await html2canvas(lineChartRef.current);
      const lineImgData = lineCanvas.toDataURL('image/png');
      doc.addPage();
      doc.text('Resueltos por Mes:', 14, 20);
      doc.addImage(lineImgData, 'PNG', 14, 30, 180, 90);
    }

    if (comments) {
      doc.addPage();
      doc.setFontSize(14);
      doc.text('Comentarios Adicionales:', 14, 20);

      const pageWidth = doc.internal.pageSize.width;
      const margin = 14;
      const maxWidth = pageWidth - margin * 2;

      doc.setFontSize(12);
      const lines = doc.splitTextToSize(comments, maxWidth);
      doc.text(lines, margin, 30);
    }

    doc.save('dashboard.pdf');
  };

  const handleModalConfirm = () => {
    handleExportPDFBackend();
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
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
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
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Acciones Rápidas</h3>
            <div className="flex flex-wrap gap-4">
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    disabled={pieData.length <= 0 && barData.length <= 0 && lineChartData.length <= 0}
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

