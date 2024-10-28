import { set } from 'date-fns'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, PieChart, Pie, LineChart, Line, AreaChart,Cell, Area, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
const Dashboard = ({ isOpened, setIsOpened }) => {
  const handleOpenSidebar = () => {
    setIsOpened(!isOpened)
  }
  const barChartData = [
    { name: 'Ene', Infraestructura: 4000, Seguridad: 2400, Medio_Ambiente: 2400 },
    { name: 'Feb', Infraestructura: 3000, Seguridad: 1398, Medio_Ambiente: 2210 },
    { name: 'Mar', Infraestructura: 2000, Seguridad: 9800, Medio_Ambiente: 2290 },
    { name: 'Abr', Infraestructura: 2780, Seguridad: 3908, Medio_Ambiente: 2000 },
    { name: 'May', Infraestructura: 1890, Seguridad: 4800, Medio_Ambiente: 2181 },
    { name: 'Jun', Infraestructura: 2390, Seguridad: 3800, Medio_Ambiente: 2500 },
  ]

  const pieChartData = [
    { name: 'Infraestructura', value: 400 },
    { name: 'Seguridad', value: 300 },
    { name: 'Medio Ambiente', value: 300 },
    { name: 'Cultura', value: 200 },
  ]

  const lineChartData = [
    { name: 'Ene', resueltos: 400 },
    { name: 'Feb', resueltos: 300 },
    { name: 'Mar', resueltos: 500 },
    { name: 'Abr', resueltos: 280 },
    { name: 'May', resueltos: 590 },
    { name: 'Jun', resueltos: 320 },
  ]

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
    <div className="bg-[#00A86B] min-h-screen min-w-[400px]">
      <header className="burger-btn p-4 flex items-center">
        <button onClick={handleOpenSidebar} className="text-white mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-white text-3xl font-bold">Dashboard</h1>
      </header>
      <div className="p-8 bg-gray-100 min-h-screen">
        {/* <h1 className="text-3xl font-bold mb-6">Dashboard Municipal</h1> */}
        <div className="p-8 bg-gray-100 min-h-screen">
          <h1 className="text-3xl font-bold mb-6">Dashboard Municipal</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Total de Publicaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">1,234</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Publicaciones Activas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">789</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Juntas Vecinales Activas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">15</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Publicaciones por Categoría y Mes</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Infraestructura" fill="#8884d8" />
                    <Bar dataKey="Seguridad" fill="#82ca9d" />
                    <Bar dataKey="Medio_Ambiente" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución de Publicaciones por Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Tendencia de Resolución de Problemas</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={lineChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="resueltos" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

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
            </Card>
          </div>

          <Card className="mb-8">
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
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button>Nueva Publicación</Button>
                <Button variant="outline">Ver Todas las Publicaciones</Button>
                <Button variant="outline">Generar Reporte</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>


    </div>
  )
}

export default Dashboard