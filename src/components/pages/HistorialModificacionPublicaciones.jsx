"use client"

import { useState, useEffect } from "react"
import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Search,
  Filter,
  Clock,
  User,
  FileText,
  MapPin,
  ChevronDown,
  ChevronRight,
  Edit,
  AlertCircle,
  Users,
  Building,
  Shield,
  TrendingUp,
  Activity,
  Crown,
  History,
} from "lucide-react"
import TopBar from "../TopBar"
import { useNavigate } from "react-router-dom"
import useAxiosPrivate from "../../hooks/useAxiosPrivate"
import useAuth from "../../hooks/useAuth"
import {API_ROUTES} from "@/api/apiRoutes"

const HistorialModificacionPublicaciones = () => {
  const [modificacionesData, setModificacionesData] = useState([])
  const axiosPrivate = useAxiosPrivate()
  const { userId, departamento, departamentoId, rol, nombre } = useAuth()

  // Usuario actual simulado - AQUÍ SE DETERMINA EL ROL
  const [usuarioActual] = useState({
    id: userId,
    nombre: nombre,
    email: "juan.perez@municipio.gov",
    departamento: departamento || "Sin asignar",
    rol: rol,
    avatar: "/placeholder.svg?height=40&width=40",
    puede_ver_todos: true,
    fecha_ingreso: "2022-01-15",
  })

  const [modificacionesDataPorUsuario, setModificacionesDataPorUsuario] = useState([])
  const [statsData, setStatsData] = useState({})
  const navigate = useNavigate()
  const [publicaciones, setPublicaciones] = useState([])
  const [publicacionesOriginales, setPublicacionesOriginales] = useState([])
  const [modificacionesFlat, setModificacionesFlat] = useState([])
  const [modificacionesFlatOriginales, setModificacionesFlatOriginales] = useState([])
  const [filtros, setFiltros] = useState({
    fechaInicio: "",
    fechaFin: "",
    miembro_equipo: "Todos los miembros",
    tipoModificacion: "Todos los tipos",
    publicacion: "",
    impacto: "Todos los niveles",
  })
  const [loading, setLoading] = useState(false)
  const [publicacionesAbiertas, setPublicacionesAbiertas] = useState(new Set())
  const [miembrosEquipo, setMiembrosEquipo] = useState([])

  // Determinar si es jefe o personal
  const esJefe =
    usuarioActual.rol === "jefe" || usuarioActual.rol === "admin" || usuarioActual.rol === "jefe_departamento"
  const esPersonal = !esJefe

  const getModificacionesData = async () => {
    try {
      console.log("Fetching modificaciones data for department ID:", departamentoId)
      const response = await axiosPrivate.get(
        `${API_ROUTES.PUBLICACIONES.CON_HISTORIAL}?departamento=${departamento}`,
      )
      console.log("Modificaciones data fetched:", response.data)
      console.log(response.data.results)
      setModificacionesData(response.data.results)
    } catch (error) {
      console.error("Error fetching modificaciones data:", error)
    }
  }

  const obtenerModificacionesPorUsuario = async () => {
    try {
      console.log(`[v0] Fetching modificaciones for user ${userId}`)
      const response = await axiosPrivate.get(
        `${API_ROUTES.HISTORIAL_MODIFICACIONES.ROOT}?autor=${userId}`,
      )
      console.log(`[v0] Modificaciones for user ${userId} fetched:`, response.data)
      console.log("[v0] modificacionesDataPorUsuario results:", response?.data?.results)
      console.log("[v0] modificacionesDataPorUsuario length:", response?.data?.results?.length)
      setModificacionesDataPorUsuario(response?.data || [])
    } catch (error) {
      console.error(`[v0] Error fetching modificaciones for user ${userId}:`, error)
    }
  }

  const getUsersByDepartment = async () => {
    try {
      console.log("Fetching users for department ID:", departamentoId)
      const response = await axiosPrivate.get(
        `${API_ROUTES.USUARIO_DEPARTAMENTO.ROOT}?departamento=${departamentoId}`,
      )
      console.log("Users fetched for department:", response.data)
      setMiembrosEquipo(response.data)
    } catch (error) {
      console.error("Error fetching users for department:", error)
    }
  }

  const getStats = async () => {
    try {
      console.log("Fetching stats for department ID:", departamentoId)
      const response = await axiosPrivate.get(API_ROUTES.STATS.ESTADISTICAS_HISTORIAL_MODIFICACIONES)
      console.log("Stats fetched:", response.data)
      setStatsData(response.data)
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        console.log("[v0] userId:", userId)
        console.log("[v0] departamento:", departamento)
        console.log("[v0] departamentoId:", departamentoId)
        console.log("[v0] rol:", rol)
        console.log("[v0] esJefe:", esJefe)
        console.log("[v0] esPersonal:", esPersonal)

        await Promise.all([
          getModificacionesData(),
          obtenerModificacionesPorUsuario(),
          getUsersByDepartment(),
          getStats(),
        ])

        console.log("[v0] All data fetched successfully")
      } catch (error) {
        console.error("[v0] Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (userId && departamento && departamentoId) {
      fetchData()
    } else {
      console.log(
        "[v0] Missing required data - userId:",
        userId,
        "departamento:",
        departamento,
        "departamentoId:",
        departamentoId,
      )
    }
  }, [userId, departamento, departamentoId])

  const togglePublicacion = (publicacionId) => {
    const nuevasAbiertas = new Set(publicacionesAbiertas)
    if (nuevasAbiertas.has(publicacionId)) {
      nuevasAbiertas.delete(publicacionId)
    } else {
      nuevasAbiertas.add(publicacionId)
    }
    setPublicacionesAbiertas(nuevasAbiertas)
  }

  const handleFiltroChange = (campo, valor) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor,
    }))
  }

  const handleModificacionClick = (modificacion, publicacion = null) => {
    console.log("Modificación clickeada:", modificacion)
    console.log("Publicación ktorá:", publicacion)
    const datosCompletos = {
      modificacion,
      publicacion: publicacion || {
        publicacion_id: modificacion.publicacion.id,
        titulo: modificacion.publicacion.titulo,
        ubicacion: modificacion.publicacion.ubicacion,
        estado_actual: modificacion.publicacion.estado_actual,
      },
      todasLasModificaciones: publicacion ? publicacion.modificaciones : [],
    }
    navigate(`/detalle-modificacion-publicacion/${modificacion.id}`, {
      state: { datosCompletos },
    })
  }

  const aplicarFiltros = () => {
    if (esJefe) {
      let publicacionesFiltradas = [...publicacionesOriginales]

      if (filtros.miembro_equipo && filtros.miembro_equipo !== "Todos los miembros") {
        publicacionesFiltradas = publicacionesFiltradas.filter((pub) =>
          pub.modificaciones.some((mod) => mod.usuario_info.nombre === filtros.miembro_equipo),
        )
      }

      if (filtros.tipoModificacion && filtros.tipoModificacion !== "Todos los tipos") {
        publicacionesFiltradas = publicacionesFiltradas.filter((pub) =>
          pub.modificaciones.some((mod) =>
            mod.campo_modificado.toLowerCase().includes(filtros.tipoModificacion.toLowerCase()),
          ),
        )
      }

      if (filtros.impacto && filtros.impacto !== "Todos los niveles") {
        publicacionesFiltradas = publicacionesFiltradas.filter((pub) =>
          pub.modificaciones.some((mod) => mod.impacto === filtros.impacto),
        )
      }

      if (filtros.publicacion) {
        publicacionesFiltradas = publicacionesFiltradas.filter((pub) =>
          pub.titulo.toLowerCase().includes(filtros.publicacion.toLowerCase()),
        )
      }

      setPublicaciones(publicacionesFiltradas)
    } else {
      let modificacionesFiltradas = [...modificacionesFlatOriginales]

      if (filtros.miembro_equipo && filtros.miembro_equipo !== "Todos los miembros") {
        modificacionesFiltradas = modificacionesFiltradas.filter(
          (mod) => mod.usuario_info.nombre === filtros.miembro_equipo,
        )
      }

      if (filtros.tipoModificacion && filtros.tipoModificacion !== "Todos los tipos") {
        modificacionesFiltradas = modificacionesFiltradas.filter((mod) =>
          mod.campo_modificado.toLowerCase().includes(filtros.tipoModificacion.toLowerCase()),
        )
      }

      if (filtros.impacto && filtros.impacto !== "Todos los niveles") {
        modificacionesFiltradas = modificacionesFiltradas.filter((mod) => mod.impacto === filtros.impacto)
      }

      if (filtros.publicacion) {
        modificacionesFiltradas = modificacionesFiltradas.filter((mod) =>
          mod.publicacion_titulo.toLowerCase().includes(filtros.publicacion.toLowerCase()),
        )
      }

      if (filtros.fechaInicio) {
        modificacionesFiltradas = modificacionesFiltradas.filter(
          (mod) => new Date(mod.fecha) >= new Date(filtros.fechaInicio),
        )
      }

      if (filtros.fechaFin) {
        modificacionesFiltradas = modificacionesFiltradas.filter(
          (mod) => new Date(mod.fecha) <= new Date(filtros.fechaFin),
        )
      }

      setModificacionesFlat(modificacionesFiltradas)
    }
  }

  const limpiarFiltros = () => {
    setFiltros({
      fechaInicio: "",
      fechaFin: "",
      miembro_equipo: "Todos los miembros",
      tipoModificacion: "Todos los tipos",
      publicacion: "",
      impacto: "Todos los niveles",
    })
    if (esJefe) {
      setPublicaciones(publicacionesOriginales)
    } else {
      setModificacionesFlat(modificacionesFlatOriginales)
    }
  }

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString("es-AR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getEstadoBadge = (estado) => {
    const colores = {
      Reportado: "bg-yellow-100 text-yellow-800 border-yellow-300",
      "En proceso": "bg-blue-100 text-blue-800 border-blue-300",
      Resuelto: "bg-green-100 text-green-800 border-green-300",
      Pendiente: "bg-gray-100 text-gray-800 border-gray-300",
      Urgente: "bg-red-100 text-red-800 border-red-300",
    }
    return colores[estado] || "bg-gray-100 text-gray-800 border-gray-300"
  }

  const getImpactoBadge = (impacto) => {
    const colores = {
      Bajo: "bg-green-100 text-green-800 border-green-300",
      Medio: "bg-yellow-100 text-yellow-800 border-yellow-300",
      Alto: "bg-red-100 text-red-800 border-red-300",
    }
    return colores[impacto] || "bg-gray-100 text-gray-800 border-gray-300"
  }

  const getCampoIcon = (campo) => {
    const iconos = {
      Estado: <AlertCircle className="w-4 h-4 text-blue-500" />,
      Ubicación: <MapPin className="w-4 h-4 text-red-500" />,
      Descripción: <FileText className="w-4 h-4 text-green-500" />,
      Prioridad: <Clock className="w-4 h-4 text-orange-500" />,
      Categoría: <Edit className="w-4 h-4 text-purple-500" />,
    }
    return iconos[campo] || <Edit className="w-4 h-4 text-gray-500" />
  }

  const estadisticas = esJefe
    ? {
        totalModificaciones: publicaciones.reduce((total, pub) => total + pub.total_modificaciones, 0),
        modificacionesHoy: publicaciones
          .flatMap((pub) => pub.modificaciones)
          .filter((mod) => {
            const hoy = new Date().toDateString()
            const fechaMod = new Date(mod.fecha).toDateString()
            return hoy === fechaMod
          }).length,
        miembroMasActivo: miembrosEquipo.reduce(
          (masActivo, miembro) => {
            const modificaciones = publicaciones
              .flatMap((pub) => pub.modificaciones)
              .filter((mod) => mod.usuario_info.id === miembro.id).length
            return modificaciones > masActivo.modificaciones ? { miembro, modificaciones } : masActivo
          },
          { miembro: null, modificaciones: 0 },
        ),
        miembrosEquipo: miembrosEquipo.length,
      }
    : {
        totalModificaciones: modificacionesFlat.length,
        misModificaciones: modificacionesFlat.filter((mod) => mod.es_propia).length,
        modificacionesEquipo: modificacionesFlat.filter((mod) => !mod.es_propia).length,
        modificacionesAprobadas: modificacionesFlat.filter((mod) => mod.aprobada_por !== "Pendiente de aprobación")
          .length,
      }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar
        title={"Historial de modificación de publicaciones"}
        icon={<History className="h-6 w-6 text-blue-600" />}
      />
      <div className="p-6">
        <SidebarInset>
          <div className="">
            <Card className="bg-white shadow-lg">
              <CardHeader className="border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {esJefe ? (
                      <Building className="w-8 h-8 text-green-600" />
                    ) : (
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={usuarioActual.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-green-100 text-green-700">
                          {usuarioActual.nombre
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-800">
                        {esJefe
                          ? `Historial de modificaciones - ${usuarioActual.departamento}`
                          : "Modificaciones del departamento"}
                      </CardTitle>
                      <p className="text-gray-600 mt-1">
                        {esJefe
                          ? `Seguimiento de cambios realizados por tu equipo • ${miembrosEquipo.length} miembros activos`
                          : `${usuarioActual.nombre} • ${usuarioActual.departamento} • Todas las modificaciones del equipo`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {esJefe && <Crown className="w-5 h-5 text-yellow-500" />}
                    <Shield className="w-5 h-5 text-blue-500" />
                    <Badge variant="outline" className="text-sm">
                      {usuarioActual.rol.charAt(0).toUpperCase() + usuarioActual.rol.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {/* Dashboard dinámico según el rol */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {esJefe ? (
                    <>
                      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                        <CardContent className="p-4 text-center">
                          <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-blue-700">{statsData?.totalModificaciones}</div>
                          <div className="text-sm text-blue-600">Total modificaciones</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                        <CardContent className="p-4 text-center">
                          <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-green-700">{statsData?.modificacionesHoy}</div>
                          <div className="text-sm text-green-600">Modificaciones hoy</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                        <CardContent className="p-4 text-center">
                          <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-purple-700">{statsData?.miembrosEquipo}</div>
                          <div className="text-sm text-purple-600">Miembros del equipo</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                        <CardContent className="p-4 text-center">
                          <User className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                          <div className="text-lg font-bold text-orange-700 truncate">
                            {statsData?.miembroMasActivo?.miembro?.nombre.split(" ")[0] || "N/A"}
                          </div>
                          <div className="text-sm text-orange-600">Más activo</div>
                        </CardContent>
                      </Card>
                    </>
                  ) : (
                    <>
                      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                        <CardContent className="p-4 text-center">
                          <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-blue-700">{statsData?.totalModificaciones}</div>
                          <div className="text-sm text-blue-600">Total del equipo</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                        <CardContent className="p-4 text-center">
                          <User className="w-8 h-8 text-green-600 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-green-700">{statsData?.misModificaciones}</div>
                          <div className="text-sm text-green-600">Mis modificaciones</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                        <CardContent className="p-4 text-center">
                          <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-purple-700">{statsData?.modificacionesEquipo}</div>
                          <div className="text-sm text-purple-600">Del equipo</div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>

                {/* Filtros dinámicos */}
                <Card className="mb-6 bg-gray-50">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Filter className="w-5 h-5" />
                      {esJefe ? "Filtros del equipo" : "Filtrar modificaciones"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Miembro del equipo</label>
                        <Select
                          value={filtros.miembro_equipo}
                          onValueChange={(value) => handleFiltroChange("miembro_equipo", value)}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Seleccionar miembro" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Todos los miembros">Todos los miembros</SelectItem>
                            {miembrosEquipo.map((miembro) => (
                              <SelectItem key={miembro?.usuario?.id} value={miembro?.usuario?.nombre}>
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-6 h-6">
                                    <AvatarFallback className="text-xs">
                                      {miembro?.usuario?.nombre
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  {miembro?.usuario?.nombre}
                                  {miembro?.usuario?.id === usuarioActual.id && !esJefe && " (Yo)"}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Tipo de modificación</label>
                        <Select
                          value={filtros.tipoModificacion}
                          onValueChange={(value) => handleFiltroChange("tipoModificacion", value)}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Todos los tipos">Todos los tipos</SelectItem>
                            <SelectItem value="Estado">Estado</SelectItem>
                            <SelectItem value="Ubicación">Ubicación</SelectItem>
                            <SelectItem value="Descripción">Descripción</SelectItem>
                            <SelectItem value="Prioridad">Prioridad</SelectItem>
                            <SelectItem value="Categoría">Categoría</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Publicación</label>
                        <Input
                          placeholder="Buscar publicación..."
                          value={filtros.publicacion}
                          onChange={(e) => handleFiltroChange("publicacion", e.target.value)}
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Fecha desde</label>
                        <Input
                          type="date"
                          value={filtros.fechaInicio}
                          onChange={(e) => handleFiltroChange("fechaInicio", e.target.value)}
                          className="h-10"
                        />
                      </div>
                      {esPersonal && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Fecha hasta</label>
                          <Input
                            type="date"
                            value={filtros.fechaFin}
                            onChange={(e) => handleFiltroChange("fechaFin", e.target.value)}
                            className="h-10"
                          />
                        </div>
                      )}
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

                {/* Vista dinámica según el rol */}
                {esJefe ? (
                  // VISTA DEL JEFE - Publicaciones agrupadas
                  <div className="space-y-4">
                    {loading ? (
                      <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                      </div>
                    ) : (
                      modificacionesData.map((publicacion) => (
                        <Card key={publicacion.id} className="border-l-4 border-l-green-500">
                          <Collapsible>
                            <CollapsibleTrigger className="w-full" onClick={() => togglePublicacion(publicacion.id)}>
                              <CardHeader className="hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    {publicacionesAbiertas.has(publicacion.id) ? (
                                      <ChevronDown className="w-5 h-5 text-gray-500" />
                                    ) : (
                                      <ChevronRight className="w-5 h-5 text-gray-500" />
                                    )}
                                    <div className="text-left">
                                      <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-semibold text-gray-800">{publicacion.titulo}</h3>
                                        <Badge className={`text-xs ${getEstadoBadge(publicacion.situacion.nombre)}`}>
                                          {publicacion.situacion.nombre}
                                        </Badge>
                                      </div>
                                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                        <span className="flex items-center gap-1">
                                          <FileText className="w-4 h-4" />
                                          ID: {publicacion.id}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <MapPin className="w-4 h-4" />
                                          {publicacion.ubicacion}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Edit className="w-4 h-4" />
                                          {publicacion.total_modificaciones} modificaciones por tu equipo
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardHeader>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                              <CardContent className="pt-0">
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <h4 className="font-medium text-gray-800 mb-4">
                                    Modificaciones realizadas por {usuarioActual.departamento}
                                  </h4>
                                  <div className="overflow-x-auto">
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead className="w-[140px]">Fecha</TableHead>
                                          <TableHead>Miembro</TableHead>
                                          <TableHead>Campo</TableHead>
                                          <TableHead>Valor anterior</TableHead>
                                          <TableHead>Valor nuevo</TableHead>
                                          <TableHead>Impacto</TableHead>
                                          <TableHead>Motivo</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {publicacion.modificaciones.map((modificacion) => (
                                          <TableRow
                                            key={modificacion.id}
                                            className="hover:bg-white cursor-pointer transition-colors"
                                            onClick={() =>
                                              handleModificacionClick(modificacion, modificacion.publicacion)
                                            }
                                          >
                                            <TableCell className="font-mono text-xs">
                                              {formatearFecha(modificacion.fecha)}
                                            </TableCell>
                                            <TableCell>
                                              <div className="flex items-center gap-2">
                                                <Avatar className="w-8 h-8">
                                                  <AvatarImage src={modificacion.autor.avatar || "/placeholder.svg"} />
                                                  <AvatarFallback className="text-xs">
                                                    {modificacion.autor.nombre
                                                      .split(" ")
                                                      .map((n) => n[0])
                                                      .join("")}
                                                  </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                  <div className="font-medium text-sm">{modificacion.autor.nombre}</div>
                                                  <div className="text-xs text-gray-500">{modificacion.autor.rol}</div>
                                                </div>
                                              </div>
                                            </TableCell>
                                            <TableCell>
                                              <div className="flex items-center gap-2">
                                                {getCampoIcon(modificacion.campo_modificado)}
                                                <span className="font-medium text-sm">
                                                  {modificacion.campo_modificado}
                                                </span>
                                              </div>
                                            </TableCell>
                                            <TableCell>
                                              <Badge
                                                variant="outline"
                                                className="text-xs bg-red-50 text-red-700 border-red-200"
                                              >
                                                {modificacion.valor_anterior}
                                              </Badge>
                                            </TableCell>
                                            <TableCell>
                                              <Badge
                                                variant="outline"
                                                className="text-xs bg-green-50 text-green-700 border-green-200"
                                              >
                                                {modificacion.valor_nuevo}
                                              </Badge>
                                            </TableCell>
                                            <TableCell>
                                              <Badge className={`text-xs ${getImpactoBadge(modificacion.impacto)}`}>
                                                {modificacion.impacto}
                                              </Badge>
                                            </TableCell>
                                            <TableCell>
                                              <div className="max-w-xs">
                                                <p
                                                  className="text-sm text-gray-600 truncate"
                                                  title={modificacion.motivo}
                                                >
                                                  {modificacion.motivo}
                                                </p>
                                              </div>
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </div>
                              </CardContent>
                            </CollapsibleContent>
                          </Collapsible>
                        </Card>
                      ))
                    )}

                    {/* Equipo de trabajo para jefe */}
                    <Card className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="w-6 h-6 text-blue-600" />
                          Tu equipo de trabajo - {usuarioActual.departamento}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {miembrosEquipo.map((miembro) => {
                            const modificacionesMiembro =
                              statsData?.modificacionesPorUsuario?.find(
                                (item) => item.usuario_id === miembro?.usuario?.id,
                              )?.modificaciones || 0
                            return (
                              <Card key={miembro?.usuario?.id} className="bg-white">
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="w-12 h-12">
                                      <AvatarImage src={miembro?.usuario?.avatar || "/placeholder.svg"} />
                                      <AvatarFallback>
                                        {miembro?.usuario?.nombre
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-800">{miembro?.usuario?.nombre}</div>
                                      <div className="text-sm text-gray-600">{miembro?.usuario?.rol}</div>
                                      <div className="text-xs text-blue-600 mt-1">
                                        {modificacionesMiembro} modificaciones
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  // VISTA DEL PERSONAL - Tabla plana
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-6 h-6 text-green-600" />
                        Modificaciones del departamento ({modificacionesDataPorUsuario?.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {console.log("[v0] Rendering VISTA DEL PERSONAL")}
                      {console.log("[v0] modificacionesDataPorUsuario in render:", modificacionesDataPorUsuario)}
                      {console.log(
                        "[v0] modificacionesDataPorUsuario length in render:",
                        modificacionesDataPorUsuario?.length,
                      )}
                      {loading ? (
                        <div className="flex justify-center items-center h-64">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          {modificacionesDataPorUsuario?.length > 0 ? (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-[140px]">Fecha</TableHead>
                                  <TableHead>Publicación</TableHead>
                                  <TableHead>Campo modificado</TableHead>
                                  <TableHead>Cambio realizado</TableHead>
                                  <TableHead>Realizada por</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {modificacionesDataPorUsuario?.map((modificacion) => {
                                  console.log("[v0] Rendering modificacion:", modificacion)
                                  return (
                                    <TableRow
                                      key={modificacion?.id}
                                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                                      onClick={() => handleModificacionClick(modificacion, modificacion?.publicacion)}
                                    >
                                      <TableCell className="font-mono text-xs">
                                        {formatearFecha(modificacion?.fecha)}
                                      </TableCell>
                                      <TableCell>
                                        <div>
                                          <div className="font-medium text-sm">{modificacion?.publicacion?.codigo}</div>
                                          <div className="text-xs text-gray-500 flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {modificacion?.publicacion?.ubicacion
                                              ? modificacion?.publicacion?.ubicacion
                                              : "Sin ubicación"}
                                          </div>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          {getCampoIcon(modificacion?.campo_modificado)}
                                          <span className="font-medium text-sm">{modificacion?.campo_modificado}</span>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="space-y-1">
                                          <div className="flex items-center gap-2">
                                            <Badge
                                              variant="outline"
                                              className="text-xs bg-red-50 text-red-700 border-red-200"
                                            >
                                              {modificacion?.valor_anterior}
                                            </Badge>
                                            <span className="text-gray-400">→</span>
                                            <Badge
                                              variant="outline"
                                              className="text-xs bg-green-50 text-green-700 border-green-200"
                                            >
                                              {modificacion?.valor_nuevo}
                                            </Badge>
                                          </div>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          <Avatar className="w-8 h-8">
                                            <AvatarFallback className="text-xs">
                                              {modificacion?.autor?.nombre
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div>
                                            <div className="text-xs text-gray-500">
                                              {modificacion?.autor?.tipo_usuario}
                                            </div>
                                          </div>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  )
                                })}
                              </TableBody>
                            </Table>
                          ) : (
                            <div className="text-center py-12">
                              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                              <h3 className="text-lg font-medium text-gray-600 mb-2">No hay modificaciones</h3>
                              <p className="text-gray-500">
                                No se encontraron modificaciones para este usuario. Verifica que el userId sea correcto.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </div>
    </div>
  )
}

export default HistorialModificacionPublicaciones
