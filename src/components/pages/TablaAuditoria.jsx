
import { useState, useEffect } from "react"
import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  Download,
  RefreshCw,
  Calendar,
  User,
  Database,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Monitor,
  Smartphone,
  Activity,
  BarChart3,
  FileText,
  Settings,
} from "lucide-react"
import React from 'react'
import TopBar from '../TopBar'

const TablaAuditoria = ({ setIsOpened, isOpened }) => {
  const [loading, setLoading] = useState(true)
  const [auditLogs, setAuditLogs] = useState([])
  const [auditLogsOriginales, setAuditLogsOriginales] = useState([])
  const [filtros, setFiltros] = useState({
    fechaInicio: "",
    fechaFin: "",
    usuario: "Todos los usuarios",
    accion: "Todas las acciones",
    modulo: "Todos los módulos",
    busqueda: "",
    resultado: "Todos los resultados",
  })

  // Datos de auditoría simplificados y organizados
  const auditDataEjemplo = [
    {
      id: "AUD001",
      timestamp: "2024-01-26T10:30:15.123Z",
      usuario: {
        id: "USR001",
        nombre: "Juan Pérez",
        email: "juan.perez@municipio.gov",
        rol: "Supervisor",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      accion: "CREATE",
      modulo: "Publicaciones",
      entidad: "Publicación",
      entidad_id: "PUB123",
      descripcion: "Creó nueva publicación: 'Poste de luz dañado en Av. Corrientes'",
      ip_address: "192.168.1.100",
      dispositivo: "Desktop",
      navegador: "Chrome 120.0",
      resultado: "EXITOSO",
      duracion_ms: 245,
      // riesgo: "BAJO",
    },
    {
      id: "AUD002",
      timestamp: "2024-01-26T11:15:42.456Z",
      usuario: {
        id: "USR002",
        nombre: "María González",
        email: "maria.gonzalez@municipio.gov",
        rol: "Técnico",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      accion: "UPDATE",
      modulo: "Publicaciones",
      entidad: "Publicación",
      entidad_id: "PUB123",
      descripcion: "Actualizó estado de publicación de 'Pendiente' a 'En proceso'",
      ip_address: "192.168.1.101",
      dispositivo: "Mobile",
      navegador: "Safari 17.0",
      resultado: "EXITOSO",
      duracion_ms: 156,
      // riesgo: "MEDIO",
    },
    {
      id: "AUD003",
      timestamp: "2024-01-26T12:45:18.789Z",
      usuario: {
        id: "USR003",
        nombre: "Carlos Rodríguez",
        email: "carlos.rodriguez@municipio.gov",
        rol: "Administrador",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      accion: "DELETE",
      modulo: "Usuarios",
      entidad: "Usuario",
      entidad_id: "USR999",
      descripcion: "Eliminó cuenta de usuario: 'usuario.temporal@municipio.gov'",
      ip_address: "192.168.1.102",
      dispositivo: "Desktop",
      navegador: "Chrome 120.0",
      resultado: "EXITOSO",
      duracion_ms: 89,
      // riesgo: "ALTO",
    },
    {
      id: "AUD004",
      timestamp: "2024-01-26T13:20:33.012Z",
      usuario: {
        id: "USR001",
        nombre: "Juan Pérez",
        email: "juan.perez@municipio.gov",
        rol: "Supervisor",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      accion: "READ",
      modulo: "Reportes",
      entidad: "Reporte",
      entidad_id: "REP001",
      descripcion: "Consultó reporte de estadísticas mensuales",
      ip_address: "192.168.1.100",
      dispositivo: "Desktop",
      navegador: "Chrome 120.0",
      resultado: "EXITOSO",
      duracion_ms: 1234,
      // riesgo: "BAJO",
    },
    {
      id: "AUD005",
      timestamp: "2024-01-26T14:10:55.345Z",
      usuario: {
        id: "USR004",
        nombre: "Ana López",
        email: "ana.lopez@municipio.gov",
        rol: "Coordinadora",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      accion: "LOGIN",
      modulo: "Autenticación",
      entidad: "Sesión",
      entidad_id: "sess_jkl012",
      descripcion: "Inicio de sesión exitoso",
      ip_address: "192.168.1.103",
      dispositivo: "Desktop",
      navegador: "Firefox 121.0",
      resultado: "FALLIDO",
      duracion_ms: 567,
      // riesgo: "BAJO",
      error: "Credenciales incorrectas",
    },
      // {
      //   id: "AUD006",
      //   timestamp: "2024-01-26T15:30:22.678Z",
      //   usuario: {
      //     id: "USR005",
      //     nombre: "Roberto Silva",
      //     email: "roberto.silva@municipio.gov",
      //     rol: "Técnico",
      //     avatar: "/placeholder.svg?height=32&width=32",
      //   },
      //   accion: "UPDATE",
      //   modulo: "Configuración",
      //   entidad: "Configuración",
      //   entidad_id: "CFG001",
      //   descripcion: "Modificó configuración de notificaciones por email",
      //   ip_address: "192.168.1.104",
      //   dispositivo: "Desktop",
      //   navegador: "Firefox 121.0",
      //   resultado: "FALLIDO",
      //   duracion_ms: 2345,
      //   // riesgo: "MEDIO",
      //   error: "Permisos insuficientes para modificar configuración",
      // },
  ]

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

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setAuditLogsOriginales(auditDataEjemplo)
      setAuditLogs(auditDataEjemplo)
      setLoading(false)
    }, 1000)
  }, [])

  const handleFiltroChange = (campo, valor) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor,
    }))
  }

  const aplicarFiltros = () => {
    let logsFiltrados = [...auditLogsOriginales]

    if (filtros.usuario !== "Todos los usuarios") {
      logsFiltrados = logsFiltrados.filter((log) => log.usuario.nombre === filtros.usuario)
    }

    if (filtros.accion !== "Todas las acciones") {
      logsFiltrados = logsFiltrados.filter((log) => log.accion === filtros.accion)
    }

    if (filtros.modulo !== "Todos los módulos") {
      logsFiltrados = logsFiltrados.filter((log) => log.modulo === filtros.modulo)
    }

    if (filtros.resultado !== "Todos los resultados") {
      logsFiltrados = logsFiltrados.filter((log) => log.resultado === filtros.resultado)
    }

    if (filtros.busqueda) {
      logsFiltrados = logsFiltrados.filter(
        (log) =>
          log.descripcion.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
          log.entidad.toLowerCase().includes(filtros.busqueda.toLowerCase()),
      )
    }

    if (filtros.fechaInicio) {
      logsFiltrados = logsFiltrados.filter((log) => new Date(log.timestamp) >= new Date(filtros.fechaInicio))
    }

    if (filtros.fechaFin) {
      logsFiltrados = logsFiltrados.filter((log) => new Date(log.timestamp) <= new Date(filtros.fechaFin))
    }

    setAuditLogs(logsFiltrados)
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
    setAuditLogs(auditLogsOriginales)
  }

  const formatearFecha = (timestamp) => {
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
    return resultado === "EXITOSO" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }

  const getRiesgoBadge = (riesgo) => {
    const colores = {
      BAJO: "bg-green-100 text-green-800",
      MEDIO: "bg-yellow-100 text-yellow-800",
      ALTO: "bg-red-100 text-red-800",
    }
    return colores[riesgo] || "bg-gray-100 text-gray-800"
  }

  const getDispositivoIcon = (dispositivo) => {
    return dispositivo === "Mobile" ? (
      <Smartphone className="w-4 h-4 text-blue-500" />
    ) : (
      <Monitor className="w-4 h-4 text-gray-500" />
    )
  }

  // Estadísticas
  const estadisticas = {
    totalLogs: auditLogs.length,
    logsHoy: auditLogs.filter((log) => {
      const hoy = new Date().toDateString()
      const fechaLog = new Date(log.timestamp).toDateString()
      return hoy === fechaLog
    }).length,
    usuariosActivos: new Set(auditLogs.map((log) => log.usuario.id)).size,
    accionesExitosas: auditLogs.filter((log) => log.resultado === "EXITOSO").length,
    accionesFallidas: auditLogs.filter((log) => log.resultado === "FALLIDO").length,
    riesgoAlto: auditLogs.filter((log) => log.riesgo === "ALTO").length,
  }
  const handleOpenSidebar = () => {
    setIsOpened(!isOpened)
  }
  return (
    <>
      <TopBar title="Auditoría" optionalbg="bg-[#00A86B]" handleOpenSidebar={handleOpenSidebar} />
      <div className="p-6 bg-gray-50 min-h-screen">
        <SidebarInset>
          {/* Header Verde Municipal */}
          {/* <div className="bg-green-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6" />
              <div>
                <h1 className="text-2xl font-bold">Auditoría</h1>
                <p className="text-green-100">Sistema de registro y monitoreo de actividades</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold">{estadisticas.totalLogs}</div>
                <div className="text-green-100">Registros</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{estadisticas.usuariosActivos}</div>
                <div className="text-green-100">Usuarios</div>
              </div>
            </div>
          </div>
        </div> */}

          <div className="bg-gray-50">
            {/* Resumen de estadísticas */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <Card className="bg-white shadow-sm">
                <CardContent className="p-4 text-center">
                  <Activity className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="text-xl font-bold text-gray-900">{estadisticas.totalLogs}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm">
                <CardContent className="p-4 text-center">
                  <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-xl font-bold text-gray-900">{estadisticas.logsHoy}</div>
                  <div className="text-sm text-gray-600">Hoy</div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm">
                <CardContent className="p-4 text-center">
                  <User className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-xl font-bold text-gray-900">{estadisticas.usuariosActivos}</div>
                  <div className="text-sm text-gray-600">Usuarios</div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm">
                <CardContent className="p-4 text-center">
                  <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="text-xl font-bold text-gray-900">{estadisticas.accionesExitosas}</div>
                  <div className="text-sm text-gray-600">Exitosas</div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm">
                <CardContent className="p-4 text-center">
                  <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                  <div className="text-xl font-bold text-gray-900">{estadisticas.accionesFallidas}</div>
                  <div className="text-sm text-gray-600">Fallidas</div>
                </CardContent>
              </Card>

              {/* <Card className="bg-white shadow-sm">
                <CardContent className="p-4 text-center">
                  <AlertTriangle className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                  <div className="text-xl font-bold text-gray-900">{estadisticas.riesgoAlto}</div>
                  <div className="text-sm text-gray-600">Riesgo Alto</div>
                </CardContent>
              </Card> */}
            </div>

            {/* Pestañas principales */}
            <Tabs defaultValue="registros" className="space-y-6">
              <div className="flex items-center justify-between">
                

                <div className="flex items-center gap-2">
                  {/* <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button> */}
                  {/* <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Actualizar
                  </Button> */}
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
                      Registro de Auditoría ({auditLogs.length} registros)
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
                            <TableHead className="font-semibold">Descripción</TableHead>
                            <TableHead className="font-semibold">IP / Dispositivo</TableHead>
                            <TableHead className="font-semibold">Resultado</TableHead>
                            {/* <TableHead className="font-semibold">Riesgo</TableHead> */}
                            <TableHead className="font-semibold">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loading ? (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-8">
                                <div className="flex justify-center items-center">
                                  <RefreshCw className="w-6 h-6 animate-spin text-green-600 mr-2" />
                                  Cargando registros de auditoría...
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : auditLogs.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-8">
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
                                    <div className="font-semibold">{formatearFecha(log.timestamp)}</div>
                                    <div className="text-gray-500 text-xs">ID: {log.id}</div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Avatar className="w-8 h-8">
                                      <AvatarImage src={log.usuario.avatar || "/placeholder.svg"} />
                                      <AvatarFallback className="text-xs">
                                        {log.usuario.nombre
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium text-sm">{log.usuario.nombre}</div>
                                      <div className="text-xs text-gray-500">{log.usuario.rol}</div>
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
                                  <div className="max-w-xs">
                                    <p className="text-sm text-gray-600 truncate" title={log.descripcion}>
                                      {log.descripcion}
                                    </p>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {log.entidad}: {log.entidad_id}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-xs">
                                      <Globe className="w-3 h-3 text-gray-500" />
                                      <span className="font-mono">{log.ip_address}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                      {getDispositivoIcon(log.dispositivo)}
                                      <span>{log.navegador}</span>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <Badge className={`text-xs ${getResultadoBadge(log.resultado)}`}>
                                      {log.resultado}
                                    </Badge>
                                    <div className="text-xs text-gray-500">
                                      <Clock className="w-3 h-3 inline mr-1" />
                                      {log.duracion_ms}ms
                                    </div>
                                  </div>
                                </TableCell>
                                {/* <TableCell>
                                  <Badge className={`text-xs ${getRiesgoBadge(log.riesgo)}`}>{log.riesgo}</Badge>
                                </TableCell> */}
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
                                            <p className="text-sm text-gray-900">{formatearFecha(log.timestamp)}</p>
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium text-gray-700">Usuario</label>
                                            <p className="text-sm text-gray-900">
                                              {log.usuario.nombre} ({log.usuario.rol})
                                            </p>
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium text-gray-700">Acción</label>
                                            <Badge className={`text-xs ${getAccionBadge(log.accion)}`}>
                                              {log.accion}
                                            </Badge>
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium text-gray-700">Módulo</label>
                                            <p className="text-sm text-gray-900">{log.modulo}</p>
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium text-gray-700">IP Address</label>
                                            <p className="text-sm text-gray-900 font-mono">{log.ip_address}</p>
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium text-gray-700">Dispositivo</label>
                                            <p className="text-sm text-gray-900">{log.dispositivo}</p>
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
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab de Estadísticas */}
              <TabsContent value="estadisticas" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-white shadow-sm">
                    <CardHeader>
                      <CardTitle>Resumen de Actividad</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Acciones exitosas</span>
                          <span className="font-semibold">{estadisticas.accionesExitosas}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Acciones fallidas</span>
                          <span className="font-semibold">{estadisticas.accionesFallidas}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Usuarios activos</span>
                          <span className="font-semibold">{estadisticas.usuariosActivos}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Eventos de alto riesgo</span>
                          <span className="font-semibold">{estadisticas.riesgoAlto}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white shadow-sm">
                    <CardHeader>
                      <CardTitle>Distribución por Módulo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {["Publicaciones", "Usuarios", "Reportes", "Configuración", "Autenticación"].map((modulo) => {
                          const count = auditLogs.filter((log) => log.modulo === modulo).length
                          const percentage = auditLogs.length > 0 ? (count / auditLogs.length) * 100 : 0
                          return (
                            <div key={modulo} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>{modulo}</span>
                                <span>
                                  {count} ({percentage.toFixed(1)}%)
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Tab de Configuración */}
              <TabsContent value="configuracion" className="space-y-6">
                <Card className="bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle>Configuración de Auditoría</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Retención de Datos</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Configurar por cuánto tiempo se mantienen los registros de auditoría
                        </p>
                        <Select defaultValue="90">
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">30 días</SelectItem>
                            <SelectItem value="90">90 días</SelectItem>
                            <SelectItem value="180">180 días</SelectItem>
                            <SelectItem value="365">1 año</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Nivel de Detalle</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Configurar qué nivel de detalle se registra en los logs
                        </p>
                        <Select defaultValue="completo">
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basico">Básico</SelectItem>
                            <SelectItem value="completo">Completo</SelectItem>
                            <SelectItem value="detallado">Detallado</SelectItem>
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