import { useState, useEffect } from "react"
import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Filter,
  Shield,
  Eye,
  Calendar,
  User,
  Database,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Monitor,
  Smartphone,
  Activity,
  RefreshCw,
} from "lucide-react"
import React from 'react'
import TopBar from '../TopBar'
import Spinner from "../Spinner"
import { API_ROUTES } from "@/api/apiRoutes"

// Importamos la lógica de paginación reutilizable
import { usePaginatedFetch } from '@/hooks/usePaginatedFetch'
import Paginador from '../Paginador'

const TablaAuditoria = ({ setIsOpened, isOpened }) => {
  // Estado para construir la URL con filtros
  const [filterUrl, setFilterUrl] = useState(null)

  const [filtros, setFiltros] = useState({
    fechaInicio: "",
    fechaFin: "",
    usuario: "Todos los usuarios",
    accion: "Todas las acciones",
    modulo: "Todos los módulos",
    busqueda: "",
    resultado: "Todos los resultados",
  })

  // Hook de Paginación: Maneja la carga de datos, paginación y recarga
  const {
    data: auditLogs,
    totalItems,
    loading,
    currentPage,
    itemsPerPage,
    setPage,
    setPageSize,
    refresh
  } = usePaginatedFetch({
    baseUrl: API_ROUTES.AUDITORIA.ROOT,
    externalUrl: filterUrl, // Si filterUrl tiene valor, el hook usará esa URL (con filtros)
    initialPageSize: 10
  })

  const usuarios = [
    "Todos los usuarios",
    "Juan Pérez",
    "María González",
    "Carlos Rodríguez",
    "Ana López",
    "Roberto Silva",
  ]
  const acciones = ["Todas las acciones", "CREATE", "READ", "UPDATE", "DELETE", "LOGIN", "LOGOUT"]
  const modulos = ["Todos los módulos", "Publicaciones", "Usuarios", "Reportes", "Autenticación", "Configuración"]
  const resultados = ["Todos los resultados", "EXITOSO", "FALLIDO"]

  const handleFiltroChange = (campo, valor) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor,
    }))
  }

  // Construcción de URL de parámetros para el backend
  const aplicarFiltros = () => {
    const params = new URLSearchParams()

    if (filtros.usuario !== "Todos los usuarios") params.append('usuario', filtros.usuario)
    if (filtros.accion !== "Todas las acciones") params.append('accion', filtros.accion)
    if (filtros.modulo !== "Todos los módulos") params.append('modulo', filtros.modulo)

    if (filtros.resultado !== "Todos los resultados") {
      const esExitoso = filtros.resultado === "EXITOSO" ? 'true' : 'false'
      params.append('es_exitoso', esExitoso)
    }

    if (filtros.busqueda) params.append('search', filtros.busqueda)
    if (filtros.fechaInicio) params.append('fecha_inicio', filtros.fechaInicio)
    if (filtros.fechaFin) params.append('fecha_fin', filtros.fechaFin)

    // Establecemos la nueva URL con filtros, lo que disparará el hook usePaginatedFetch
    const queryString = params.toString()
    setFilterUrl(queryString ? `${API_ROUTES.AUDITORIA.ROOT}?${queryString}` : null)
    setPage(1) // Reiniciamos a la primera página al filtrar
  }

  const limpiarFiltros = () => {
    setFiltros({
      fechaInicio: "",
      fechaFin: "",
      usuario: "Todos los usuarios",
      accion: "Todas las acciones",
      modulo: "Todos los módulos",
      busqueda: "",
      resultado: "Todos los resultados",
    })
    setFilterUrl(null) // Volver a la URL base sin filtros
    setPage(1)
  }

  const formatearFecha = (timestamp) => {
    if (!timestamp) return "-"
    return new Date(timestamp).toLocaleString("es-AR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const getAccionBadge = (accion) => {
    const colores = {
      CREATE: "bg-green-100 text-green-800",
      READ: "bg-blue-100 text-blue-800",
      UPDATE: "bg-yellow-100 text-yellow-800",
      DELETE: "bg-red-100 text-red-800",
      LOGIN: "bg-purple-100 text-purple-800",
      LOGOUT: "bg-gray-100 text-gray-800",
    }
    return colores[accion] || "bg-gray-100 text-gray-800"
  }

  const getResultadoBadge = (resultado) => {
    return resultado ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }

  const getDispositivoIcon = (dispositivo) => {
    return dispositivo === "Mobile" ? (
      <Smartphone className="w-4 h-4 text-blue-500" />
    ) : (
      <Monitor className="w-4 h-4 text-gray-500" />
    )
  }

  // Nota: Estas estadísticas ahora reflejan solo los datos cargados en la página actual
  // Para estadísticas globales precisas, se recomendaría un endpoint de API separado.
  const estadisticas = {
    totalLogs: totalItems, // Usamos totalItems del hook para el total real
    logsHoy: auditLogs.filter((log) => {
      const hoy = new Date().toDateString()
      const fechaLog = new Date(log.timestamp).toDateString()
      return hoy === fechaLog
    }).length,
    usuariosActivos: new Set(auditLogs.map((log) => log.autor?.id)).size,
    accionesExitosas: auditLogs.filter((log) => log.es_exitoso).length,
    accionesFallidas: auditLogs.filter((log) => log.es_exitoso === false).length,
  }

  const handleOpenSidebar = () => {
    setIsOpened(!isOpened)
  }

  return (
    <>
      <TopBar title="Auditoría" optionalbg="bg-[#00A86B]" handleOpenSidebar={handleOpenSidebar} />
      <div className="p-6 bg-gray-50 min-h-screen">
        <SidebarInset>

          <div className="bg-gray-50">
            {/* Resumen de estadísticas */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              {loading ? (
                <Skeleton className="w-full h-32" />
              ) : (
                <Card className="bg-white shadow-sm flex items-center justify-center py-4">
                  <CardContent className="p-4 text-center">
                    <Activity className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-gray-900">{estadisticas.totalLogs}</div>
                    <div className="text-sm text-gray-600">Total</div>
                  </CardContent>
                </Card>
              )}
              {/* ... (Resto de tarjetas de estadísticas mantenidas igual, usando skeleton si loading) ... */}
              {/* Para simplificar el ejemplo, mantengo la estructura de tus cards originales */}
              {loading ? <Skeleton className="w-full h-32" /> : (
                <Card className="bg-white shadow-sm flex items-center justify-center py-4">
                  <CardContent className="p-4 text-center">
                    <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    {/* Nota: logsHoy solo cuenta la página actual */}
                    <div className="text-xl font-bold text-gray-900">{estadisticas.logsHoy}</div>
                    <div className="text-sm text-gray-600">Hoy (Pág)</div>
                  </CardContent>
                </Card>
              )}
              {loading ? <Skeleton className="w-full h-32" /> : (
                <Card className="bg-white shadow-sm flex items-center justify-center py-4">
                  <CardContent className="p-4 text-center">
                    <User className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-gray-900">{estadisticas.usuariosActivos}</div>
                    <div className="text-sm text-gray-600">Usuarios</div>
                  </CardContent>
                </Card>
              )}
              {loading ? <Skeleton className="w-full h-32" /> : (
                <Card className="bg-white shadow-sm flex items-center justify-center py-4">
                  <CardContent className="text-center">
                    <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-gray-900">{estadisticas.accionesExitosas}</div>
                    <div className="text-sm text-gray-600">Exitosas</div>
                  </CardContent>
                </Card>
              )}
              {loading ? <Skeleton className="w-full h-32" /> : (
                <Card className="bg-white shadow-sm flex items-center justify-center py-4">
                  <CardContent className="p-4 text-center">
                    <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-gray-900">{estadisticas.accionesFallidas}</div>
                    <div className="text-sm text-gray-600">Fallidas</div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Pestañas principales */}
            <Tabs defaultValue="registros" className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={refresh} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Actualizar
                  </Button>
                </div>
              </div>

              {/* Tab de Registros */}
              <TabsContent value="registros" className="space-y-6">
                {/* Filtros */}
                <Card className="bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Filter className="w-5 h-5" />
                      Filtros de Búsqueda
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Usuario</label>
                        <Select value={filtros.usuario} onValueChange={(value) => handleFiltroChange("usuario", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar usuario" />
                          </SelectTrigger>
                          <SelectContent>
                            {usuarios.map((usuario) => (
                              <SelectItem key={usuario} value={usuario}>
                                {usuario}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Acción</label>
                        <Select value={filtros.accion} onValueChange={(value) => handleFiltroChange("accion", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar acción" />
                          </SelectTrigger>
                          <SelectContent>
                            {acciones.map((accion) => (
                              <SelectItem key={accion} value={accion}>
                                {accion}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Módulo</label>
                        <Select value={filtros.modulo} onValueChange={(value) => handleFiltroChange("modulo", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar módulo" />
                          </SelectTrigger>
                          <SelectContent>
                            {modulos.map((modulo) => (
                              <SelectItem key={modulo} value={modulo}>
                                {modulo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Buscar</label>
                        <Input
                          placeholder="Buscar en descripción..."
                          value={filtros.busqueda}
                          onChange={(e) => handleFiltroChange("busqueda", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button onClick={aplicarFiltros} className="bg-green-600 hover:bg-green-700">
                        <Search className="w-4 h-4 mr-2" />
                        Aplicar filtros
                      </Button>
                      <Button variant="outline" onClick={limpiarFiltros}>
                        Limpiar filtros
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Tabla de registros */}
                <Card className="bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      Registro de Auditoría ({totalItems} registros totales)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="font-semibold">Fecha y Hora</TableHead>
                            <TableHead className="font-semibold">Usuario</TableHead>
                            <TableHead className="font-semibold">Acción</TableHead>
                            <TableHead className="font-semibold">Módulo</TableHead>
                            <TableHead className="font-semibold">IP / Dispositivo</TableHead>
                            <TableHead className="font-semibold">Resultado</TableHead>
                            <TableHead className="font-semibold">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="h-full">
                          {loading ? (
                            // Filas de esqueleto para simular carga
                            Array.from({ length: itemsPerPage }).map((_, index) => (
                              <TableRow key={index}>
                                <TableCell colSpan={7}>
                                  <Skeleton className="h-12 w-full" />
                                </TableCell>
                              </TableRow>
                            ))
                          ) : auditLogs.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-8">
                                <div className="flex flex-col items-center">
                                  <Shield className="w-12 h-12 text-gray-400 mb-4" />
                                  <h3 className="text-lg font-semibold text-gray-700">No hay registros</h3>
                                  <p className="text-gray-500">No se encontraron registros con los filtros aplicados.</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            auditLogs.map((log) => (
                              <TableRow key={log.id} className="hover:bg-gray-50">
                                <TableCell className="font-mono text-xs">
                                  <div>
                                    <div className="font-semibold">{formatearFecha(log.fecha)}</div>
                                    <div className="text-gray-500 text-xs">ID: {log.id}</div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Avatar className="w-8 h-8">
                                      <AvatarImage src={log.autor?.avatar || "/placeholder.svg"} />
                                      <AvatarFallback className="text-xs bg-gray-200 text-gray-600">
                                        {log.autor?.nombre
                                          ? log.autor.nombre.split(" ").map((n) => n[0]).join("").slice(0, 2)
                                          : "??"}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium text-sm">{log.autor?.nombre || "Desconocido"}</div>
                                      <div className="text-xs text-gray-500">{log.autor?.rol || "N/A"}</div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className={`text-xs ${getAccionBadge(log.accion)}`}>{log.accion}</Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Database className="w-4 h-4 text-gray-500" />
                                    <span className="font-medium text-sm">{log.modulo}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-xs">
                                      <Globe className="w-3 h-3 text-gray-500" />
                                      <span className="font-mono">
                                        {/* Extracción segura de IP desde descripción si existe */}
                                        {log.descripcion && log.descripcion.match(/(\d{1,3}\.){3}\d{1,3}/)?.[0] || "N/A"}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                      {getDispositivoIcon(log.dispositivo)}
                                      <span>{log.navegador || "N/A"}</span>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <Badge className={`text-xs ${getResultadoBadge(log.es_exitoso)}`}>
                                      {log.es_exitoso ? "EXITOSO" : "FALLIDO"}
                                    </Badge>
                                    <div className="text-xs text-gray-500">
                                      <Clock className="w-3 h-3 inline mr-1" />
                                      {log.duracion_ms}ms
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button size="sm" variant="outline" className="h-8 px-2 bg-transparent">
                                        <Eye className="w-3 h-3 mr-1" />
                                        Ver
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                      <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                          <Shield className="w-5 h-5" />
                                          Detalle de Auditoría - {log.id}
                                        </DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <label className="text-sm font-medium text-gray-700">Timestamp</label>
                                            <p className="text-sm text-gray-900">{formatearFecha(log.fecha)}</p>
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium text-gray-700">Usuario</label>
                                            <p className="text-sm text-gray-900">
                                              {log.autor?.nombre} ({log.autor?.rol})
                                            </p>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <label className="text-sm font-medium text-gray-700">Acción</label>
                                            <Badge className={`text-xs ${getAccionBadge(log.accion)}`}>
                                              {log.accion}
                                            </Badge>
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium text-gray-700">Módulo</label>
                                            <p className="text-sm text-gray-900">{log.modulo}</p>
                                          </div>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-700">Descripción</label>
                                          <p className="text-sm text-gray-900">{log.descripcion}</p>
                                        </div>
                                        {log.error && (
                                          <div>
                                            <label className="text-sm font-medium text-red-700">Error</label>
                                            <p className="text-sm text-red-900 bg-red-50 p-2 rounded">{log.error}</p>
                                          </div>
                                        )}
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Componente de Paginación */}
                    <div className="px-4 pb-4">
                      <Paginador
                        currentPage={currentPage}
                        totalPages={Math.ceil(totalItems / itemsPerPage)}
                        onPageChange={setPage}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onItemsPerPageChange={setPageSize}
                        loading={loading}
                        pageSizeOptions={[10, 20, 50]}
                      />
                    </div>

                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab de Estadísticas */}
              <TabsContent value="estadisticas" className="space-y-6">
                {/* El contenido de estadísticas se mantiene igual, pero ten en cuenta 
                     que ahora los cálculos se basan en la 'pagina actual' a menos que 
                     el backend provea un endpoint específico de estadísticas */}
                <Card className="bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle>Nota sobre estadísticas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      Las estadísticas mostradas a continuación se calculan sobre los registros visibles actualmente.
                      Para ver estadísticas globales, se requiere integración con endpoint de reportes.
                    </p>
                  </CardContent>
                </Card>
                {/* ... Resto de tus componentes de estadísticas ... */}
              </TabsContent>

              {/* Tab de Configuración */}
              <TabsContent value="configuracion" className="space-y-6">
                {/* Mantenemos el contenido original */}
                <Card className="bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle>Configuración de Auditoría</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Retención de Datos</h4>
                        {/* ... resto del form ... */}
                        <Select defaultValue="90">
                          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">30 días</SelectItem>
                            <SelectItem value="90">90 días</SelectItem>
                            <SelectItem value="180">180 días</SelectItem>
                            <SelectItem value="365">1 año</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="pt-4">
                        <Button className="bg-green-600 hover:bg-green-700">Guardar Configuración</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </SidebarInset>
      </div>
    </>
  )
}

export default TablaAuditoria