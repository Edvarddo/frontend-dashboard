// src/components/sections/ChartDetailDialog.jsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
} from "recharts"
import {
  CodeIcon as ChartColumnIncreasing,
  PieChartIcon as ChartPie,
  LineChartIcon as ChartLine,
} from "lucide-react"
import EmptyState from "../EmptyState"
import Filters from "../Filters"
import { getColorForCategory } from "@/lib/utils"

const ChartDetailDialog = ({
  open,
  onOpenChange,
  chartType,
  barData,
  barKeys,
  pieData,
  lineChartData,
  filtrosResumenText,
  filtrosObj,
  setFiltrosObj,
  dateRange,
  setDateRange,
  categorias,
  situaciones,
  juntasVecinales,
  departamentos,
  clearValues,
  setIsValid,
  isValid,
  loading,
  handleDownload,
  limpiarFiltros,
  aplicarFiltros,
}) => {
  const title =
    chartType === "bar"
      ? "Publicaciones por Mes y Categoría"
      : chartType === "pie"
      ? "Distribución de Publicaciones por Categoría"
      : chartType === "line"
      ? "Tendencia de Resolución de Problemas"
      : ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* max-h para no salirse de pantalla y scroll interno */}
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        {/* GRID PRINCIPAL: IZQ (header + gráfico), DER (filtros) */}
        <div className="grid gap-6 md:grid-cols-[2.2fr,1.1fr] h-full">
          {/* COLUMNA IZQUIERDA: header + gráfico */}
          <div className="flex flex-col min-h-0">
            <DialogHeader className="shrink-0 pb-2">
              <DialogTitle>{title}</DialogTitle>
              {filtrosResumenText && (
                <DialogDescription>{filtrosResumenText}</DialogDescription>
              )}
            </DialogHeader>

            {/* contenedor del gráfico con más altura */}
            <div className="flex-1 min-h-0">
              <div className="w-full h-[380px] md:h-[440px] lg:h-[480px]">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "bar" && (
                    barData?.length === 0 ? (
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
                        {barKeys?.map((key, index) => (
                          <Bar
                            key={index}
                            dataKey={key}
                            stackId="a"
                            fill={getColorForCategory(key)}
                          />
                        ))}
                      </BarChart>
                    )
                  )}

                  {chartType === "pie" && (
                    pieData?.length === 0 ? (
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
                          outerRadius={140}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData?.map((entry, index) => (
                            <Cell
                              key={`cell-big-${index}`}
                              fill={getColorForCategory(entry.name)}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    )
                  )}

                  {chartType === "line" && (
                    lineChartData?.length === 0 ? (
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
                    )
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: panel de filtros pegado arriba */}
          <aside className="flex flex-col min-h-0">
            <div className="flex-1 min-h-0">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">
                Filtros del Dashboard
              </h4>

              {/* scroll sólo dentro del panel si se pasa en alto */}
              <div className="max-h-[420px] overflow-y-auto pr-1">
                <Filters
                  variant="sidebar"
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
            </div>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ChartDetailDialog
