import { set, format } from 'date-fns'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { BarChart, Bar, PieChart, Pie, LineChart, Line, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Skeleton } from '../ui/skeleton'
import { ChartColumnIncreasing, ChartPie, ChartLine } from 'lucide-react'
import TopBar from '../TopBar'
import Filters from "../Filters"
import EmptyState from '../EmptyState'
import { getColorForCategory, chartColors } from '@/lib/utils'
const Dashboard = ({ isOpened, setIsOpened }) => {
  // http://3.217.85.102/api/v1/publicaciones-por-categoria/ PIE CHART
  // http://3.217.85.102/api/v1/publicaciones-por-mes-y-categoria/ bar chart
  // http://3.217.85.102/api/v1/resumen-estadisticas/ cards

  const [barData, setBarData] = useState([])
  const [pieData, setPieData] = useState([])
  const [cardsData, setCardsData] = useState({})
  const [barKeys, setBarKeys] = useState([])
  const [lineChartData, setLineChartData] = useState([])

  const [categorias, setCategorias] = useState([])
  const [juntasVecinales, setJuntasVecinales] = useState([])
  const [departamentos, setDepartamentos] = useState([])

  const situaciones = [
    { nombre: "Recibido", value: "recibido" },
    { nombre: "En curso", value: "en_curso" },
    { nombre: "Resuelto", value: "resuelto" }
  ]

  // VALORES SELECCIONADOS FILTROS
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
  // object filtros
  const [filtrosObj, setFiltrosObj] = useState({
    categoria: [],
    junta: [],
    situacion: [],
    departamentos: [],
    iniDate: null,
    endDate: null
  })
  const [loading, setLoading] = useState(false)
  // VALIDACIÓN
  const [isValid, setIsValid] = useState(false)
  const [filterError, setFilterError] = useState(null)

  const api_url = import.meta.env.VITE_URL_PROD_VERCEL

  // fetch all
  const fetchData = async (urls) => {
    console.log(urls)
    const requests = urls.map(url => fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    }))
    // console.log(requests)
    const responses = await Promise.all(requests)
    const data = await Promise.all(responses.map(response => {
      console.log(response.data);
      return response.json()
    }))

    setCategorias(data[0])

    const juntas = data[1].map(junta => {
      junta.nombre = junta.nombre_calle
      return junta
    })

    setJuntasVecinales(juntas)
    setDepartamentos(data[2])
  }


  const fetchCharData = async (urls) => {
    setLoading(true)
    console.log(urls)
    const requests = urls.map(url => fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    }))
    // console.log(requests)
    const responses = await Promise.all(requests)
    const data = await Promise.all(responses.map(response => {
      console.log(response.data);
      return response.json()
    }))

    console.log(data[0])
    console.log(data[1])
    console.log(data[2])

    let distinctValues = []

    data[0].map((monthData, i) => {
      console.log(Object.keys(monthData))
      Object.keys(monthData).forEach((key, index) => {
        if (!distinctValues.includes(key) && key !== 'name') {
          distinctValues.push(key)
        }
      })
    })

    setCardsData(data[2])
    setBarKeys(distinctValues)
    setBarData(data[0])
    setPieData(data[1])
    setLineChartData(data[3])


    setLoading(false)
  }




  useEffect(() => {
    fetchData([
      `${api_url}categorias/`,
      `${api_url}juntas-vecinales/`,
      `${api_url}departamentos-municipales/`

    ])
  }, [api_url])

  useEffect(() => {
    fetchCharData([
      `${api_url}publicaciones-por-mes-y-categoria/?${filtros}`,
      `${api_url}publicaciones-por-categoria/?${filtros}`,
      `${api_url}resumen-estadisticas/?${filtros}`,
      `${api_url}resueltos-por-mes/?${filtros}`

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
    // void filtersObj
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

  const handleExportPDF = async (comments = "") => {
    const doc = new jsPDF();

    // Título del PDF
    doc.setFontSize(18);
    doc.text('Dashboard Municipal', 14, 20);

    // Subtítulos y datos generales
    doc.setFontSize(14);
    doc.text('Resumen de Estadísticas', 14, 30);
    doc.text(`Publicaciones Recibidas: ${cardsData?.publicaciones || 0}`, 14, 40);
    doc.text(`Usuarios Activos: ${cardsData?.usuarios || 0}`, 14, 50);
    doc.text(`Publicaciones Resueltas: ${cardsData?.problemas_resueltos || 0}`, 14, 60);

    // Capturar y añadir el Bar Chart
    if (barChartRef.current && barData.length > 0) {
      const barCanvas = await html2canvas(barChartRef.current);
      const barImgData = barCanvas.toDataURL('image/png');
      doc.addPage();
      doc.text('Publicaciones por Mes y Categoría:', 14, 20);
      doc.addImage(barImgData, 'PNG', 14, 30, 180, 90); // Ajustar dimensiones si es necesario
    }

    // Capturar y añadir el Pie Chart
    if (pieChartRef.current && pieData.length > 0) {
      const pieCanvas = await html2canvas(pieChartRef.current);
      const pieImgData = pieCanvas.toDataURL('image/png');
      doc.addPage();
      doc.text('Publicaciones por Categoría:', 14, 20);
      doc.addImage(pieImgData, 'PNG', 14, 30, 180, 90);
    }

    // Capturar y añadir el Line Chart
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

      // Configurar el ancho máximo del texto
      const pageWidth = doc.internal.pageSize.width; // Ancho de la página
      const margin = 14; // Margen izquierdo y derecho
      const maxWidth = pageWidth - margin * 2; // Ancho máximo permitido para el texto

      doc.setFontSize(12);
      const lines = doc.splitTextToSize(comments, maxWidth); // Dividir texto en líneas ajustadas al ancho
      doc.text(lines, margin, 30); // Añadir texto, respetando el margen
    }

    // Guardar el PDF
    doc.save('dashboard.pdf');
  };

  const handleModalConfirm = () => {
    handleExportPDF(additionalComments);
    setIsModalOpen(false);
    setAdditionalComments("");
  };

  // const lineChartData = [
  //   { name: 'Ene', resueltos: 400 },
  //   { name: 'Feb', resueltos: 300 },
  //   { name: 'Mar', resueltos: 500 },
  //   { name: 'Abr', resueltos: 280 },
  //   { name: 'May', resueltos: 590 },
  //   { name: 'Jun', resueltos: 320 },
  // ]


  const areaChartData = [
    { name: 'Ene', Infraestructura: 4000, Seguridad: 2400, Medio_Ambiente: 2400 },
    { name: 'Feb', Infraestructura: 3000, Seguridad: 1398, Medio_Ambiente: 2210 },
    { name: 'Mar', Infraestructura: 2000, Seguridad: 9800, Medio_Ambiente: 2290 },
    { name: 'Abr', Infraestructura: 2780, Seguridad: 3908, Medio_Ambiente: 2000 },
    { name: 'May', Infraestructura: 1890, Seguridad: 4800, Medio_Ambiente: 2181 },
    { name: 'Jun', Infraestructura: 2390, Seguridad: 3800, Medio_Ambiente: 2500 },
  ]

  const scatterChartData = [
    { prioridad: 1, tiempoResolucion: 24, categoria: 'Infraestructura' },
    { prioridad: 2, tiempoResolucion: 36, categoria: 'Seguridad' },
    { prioridad: 3, tiempoResolucion: 48, categoria: 'Medio Ambiente' },
    { prioridad: 1, tiempoResolucion: 18, categoria: 'Infraestructura' },
    { prioridad: 2, tiempoResolucion: 30, categoria: 'Seguridad' },
    { prioridad: 3, tiempoResolucion: 42, categoria: 'Medio Ambiente' },
  ]

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

  return (
    <>
      <TopBar handleOpenSidebar={handleOpenSidebar} title="Dashboard Municipal" />
      <div className="p-8 bg-gray-100 min-h-screen">
        <div className="p-8 bg-gray-100 min-h-screen">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {
              loading ? (
                <>
                  <Skeleton width="full" height="h-32" >
                    <Card className="h-32 bg-inherit">
                    </Card>
                  </Skeleton>
                  <Skeleton width="full" height="h-32" >
                    <Card className="h-32 bg-inherit">
                    </Card>
                  </Skeleton>
                  <Skeleton width="full" height="h-32" >
                    <Card className="h-32 bg-inherit">
                    </Card>
                  </Skeleton>


                </>


              ) : (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Publicaciones Recibidas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-4xl font-bold">{cardsData?.publicaciones}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Usuarios activos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-4xl font-bold">{cardsData?.usuarios}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Publicaciones Resueltas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-4xl font-bold">{cardsData?.problemas_resueltos}</p>
                    </CardContent>
                  </Card>

                </>
              )
            }


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
            {
              loading ? (
                <>
                  <Skeleton width="full" height="h-96">
                    <Card className="h-96 bg-inherit">
                    </Card>
                  </Skeleton>
                  <Skeleton width="full" height="h-96">
                    <Card className="h-96 bg-inherit">
                    </Card>
                  </Skeleton>
                </>
              ) : (
                <>
                  <Card ref={barChartRef}>
                    <CardHeader>
                      <CardTitle>Publicaciones por Mes y Categoría</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        {barData.length === 0
                          ?
                          (
                            <div className="flex justify-center items-center h-full">
                              <EmptyState Image={ChartColumnIncreasing} title="No hay datos para mostrar" description="No se encontraron datos para mostrar" />
                            </div>
                          )
                          :
                          (
                            <BarChart data={barData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              {barKeys.map((key, index) => (
                                console.log(key),
                                console.log(getColorForCategory(key)),
                                <Bar key={index} dataKey={key} stackId="a" fill={getColorForCategory(key)} />
                              ))}
                            </BarChart>
                          )
                        }
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <Card ref={pieChartRef}>
                    <CardHeader>
                      <CardTitle>Distribución de Publicaciones por Categoría</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        {pieData.length === 0
                          ?
                          (
                            <div className="flex justify-center items-center h-full">
                              <EmptyState Image={ChartPie} title="No hay datos para mostrar" description="No se encontraron datos para mostrar" />
                            </div>
                          )
                          :
                          (
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
                          )
                        }
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </>
              )

            }


          </div>
          {loading ?
            (
              <Skeleton width="full" height="h-96">
                <Card className="h-96 bg-inherit">
                </Card>
              </Skeleton>
            )
            :
            (
              <Card className="mb-8" ref={lineChartRef}>
                <CardHeader>
                  <CardTitle>Tendencia de Resolución de Problemas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    {lineChartData.length === 0
                      ?
                      (
                        <div className="flex justify-center items-center h-full">
                          <EmptyState Image={ChartLine} title="No hay datos para mostrar" description="No se encontraron datos para mostrar" />
                        </div>
                      )
                      :
                      (
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
                      )
                    }

                  </ResponsiveContainer>
                </CardContent>
              </Card>

            )
          }

          {/* 
            <Card>
              <CardHeader>
                <CardTitle>Presupuesto Asignado por Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={areaChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="Infraestructura" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="Seguridad" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                    <Area type="monotone" dataKey="Medio_Ambiente" stackId="1" stroke="#ffc658" fill="#ffc658" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card> */}

          {/* <Card className="mb-8">
            <CardHeader>
              <CardTitle>Relación entre Tiempo de Resolución y Prioridad</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid />
                  <XAxis type="number" dataKey="prioridad" name="Prioridad" />
                  <YAxis type="number" dataKey="tiempoResolucion" name="Tiempo de Resolución (horas)" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Legend />
                  <Scatter name="Problemas" data={scatterChartData} fill="#8884d8" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card> */}

          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button disabled={pieData.length <= 0 && barData.length <= 0 && lineChartData.length <= 0} className="w-full md:w-[unset] bg-green-500 hover:bg-green-600 text-white filter-btn">
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
                      <Button className="w-full md:w-[unset] bg-green-500 hover:bg-green-600 text-white filter-btn" onClick={handleModalConfirm}>Descargar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div >

    </>



  )
}

export default Dashboard