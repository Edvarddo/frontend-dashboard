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
  Target,
  Crown,
} from "lucide-react"
import TopBar from '../TopBar'

const HistorialModificacionPublicaciones = () => {
  // Usuario actual simulado - AQUÍ SE DETERMINA EL ROL
  const [usuarioActual] = useState({
    id: "USR001", // Cambiar a USR002 para vista de personal
    nombre: "Juan Pérez", // Cambiar a "María González" para personal
    email: "juan.perez@municipio.gov",
    departamento: "Obras Públicas",
    rol: "técnico", // "supervisor" = jefe, "tecnico" = personal
    avatar: "/placeholder.svg?height=40&width=40",
    puede_ver_todos: true, // true para jefe, false para personal
    fecha_ingreso: "2022-01-15",
  })

  // Estados unificados
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
    usuarioActual.rol === "supervisor" || usuarioActual.rol === "admin" || usuarioActual.rol === "coordinador"
  const esPersonal = !esJefe

  // Datos de ejemplo completos
  const publicacionesEjemplo = [
    {
      publicacion_id: "PUB001",
      titulo: "Poste de luz dañado en Av. Corrientes",
      ubicacion: "Av. Corrientes 1234",
      estado_actual: "Resuelto",
      fecha_creacion: "2024-01-10T08:00:00",
      departamento_responsable: "Obras Públicas",
      total_modificaciones: 4,
      modificaciones: [
        {
          id: "MOD001",
          publicacion_id: "PUB001",
          fecha: "2024-01-15T10:30:00",
          usuario_id: "USR001",
          usuario_info: {
            id: "USR001",
            nombre: "Juan Pérez",
            email: "juan.perez@municipio.gov",
            departamento: "Obras Públicas",
            rol: "Supervisor",
            avatar: "/placeholder.svg?height=32&width=32",
          },
          campo_modificado: "Estado",
          valor_anterior: "Reportado",
          valor_nuevo: "En proceso",
          motivo: "Técnico asignado para evaluación",
          ip_address: "192.168.1.100",
          impacto: "Medio",
          aprobada_por: "Auto-aprobada (Supervisor)",
          es_propia: usuarioActual.id === "USR001",
        },
        {
          id: "MOD002",
          publicacion_id: "PUB001",
          fecha: "2024-01-16T14:20:00",
          usuario_id: "USR002",
          usuario_info: {
            id: "USR002",
            nombre: "María González",
            email: "maria.gonzalez@municipio.gov",
            departamento: "Obras Públicas",
            rol: "Técnico",
            avatar: "/placeholder.svg?height=32&width=32",
          },
          campo_modificado: "Ubicación",
          valor_anterior: "Av. Corrientes 1200",
          valor_nuevo: "Av. Corrientes 1234",
          motivo: "Corrección de dirección exacta tras inspección",
          ip_address: "192.168.1.101",
          impacto: "Bajo",
          aprobada_por: "Juan Pérez - Supervisor",
          es_propia: usuarioActual.id === "USR002",
        },
        {
          id: "MOD003",
          publicacion_id: "PUB001",
          fecha: "2024-01-18T09:45:00",
          usuario_id: "USR003",
          usuario_info: {
            id: "USR003",
            nombre: "Carlos Rodríguez",
            email: "carlos.rodriguez@municipio.gov",
            departamento: "Obras Públicas",
            rol: "Técnico Senior",
            avatar: "/placeholder.svg?height=32&width=32",
          },
          campo_modificado: "Descripción",
          valor_anterior: "Poste dañado",
          valor_nuevo: "Poste de luz con cable expuesto, riesgo eléctrico",
          motivo: "Ampliación de detalles tras inspección técnica",
          ip_address: "192.168.1.102",
          impacto: "Alto",
          aprobada_por: "Juan Pérez - Supervisor",
          es_propia: usuarioActual.id === "USR003",
        },
        {
          id: "MOD004",
          publicacion_id: "PUB001",
          fecha: "2024-01-20T16:00:00",
          usuario_id: "USR001",
          usuario_info: {
            id: "USR001",
            nombre: "Juan Pérez",
            email: "juan.perez@municipio.gov",
            departamento: "Obras Públicas",
            rol: "Supervisor",
            avatar: "/placeholder.svg?height=32&width=32",
          },
          campo_modificado: "Estado",
          valor_anterior: "En proceso",
          valor_nuevo: "Resuelto",
          motivo: "Reparación completada exitosamente por el equipo",
          ip_address: "192.168.1.100",
          impacto: "Alto",
          aprobada_por: "Auto-aprobada (Supervisor)",
          es_propia: usuarioActual.id === "USR001",
        },
      ],
    },
    {
      publicacion_id: "PUB002",
      titulo: "Bache en calle San Martín",
      ubicacion: "San Martín 567",
      estado_actual: "En proceso",
      fecha_creacion: "2024-01-12T10:15:00",
      departamento_responsable: "Obras Públicas",
      total_modificaciones: 2,
      modificaciones: [
        {
          id: "MOD005",
          publicacion_id: "PUB002",
          fecha: "2024-01-14T11:30:00",
          usuario_id: "USR004",
          usuario_info: {
            id: "USR004",
            nombre: "Ana López",
            email: "ana.lopez@municipio.gov",
            departamento: "Obras Públicas",
            rol: "Coordinadora",
            avatar: "/placeholder.svg?height=32&width=32",
          },
          campo_modificado: "Prioridad",
          valor_anterior: "Media",
          valor_nuevo: "Alta",
          motivo: "Bache profundo que afecta significativamente el tránsito",
          ip_address: "192.168.1.103",
          impacto: "Alto",
          aprobada_por: "Juan Pérez - Supervisor",
          es_propia: usuarioActual.id === "USR004",
        },
        {
          id: "MOD006",
          publicacion_id: "PUB002",
          fecha: "2024-01-15T15:45:00",
          usuario_id: "USR002",
          usuario_info: {
            id: "USR002",
            nombre: "María González",
            email: "maria.gonzalez@municipio.gov",
            departamento: "Obras Públicas",
            rol: "Técnico",
            avatar: "/placeholder.svg?height=32&width=32",
          },
          campo_modificado: "Estado",
          valor_anterior: "Reportado",
          valor_nuevo: "En proceso",
          motivo: "Cuadrilla de asfalto asignada para reparación",
          ip_address: "192.168.1.101",
          impacto: "Medio",
          aprobada_por: "Juan Pérez - Supervisor",
          es_propia: usuarioActual.id === "USR002",
        },
      ],
    },
  ]

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      // Filtrar publicaciones por departamento del usuario actual
      const publicacionesFiltradas = usuarioActual.puede_ver_todos
        ? publicacionesEjemplo
        : publicacionesEjemplo.filter((pub) => pub.departamento_responsable === usuarioActual.departamento)

      setPublicacionesOriginales(publicacionesFiltradas)
      setPublicaciones(publicacionesFiltradas)

      // Crear lista plana de modificaciones para vista de personal
      const modificacionesFlat = publicacionesFiltradas.flatMap((pub) =>
        pub.modificaciones.map((mod) => ({
          ...mod,
          publicacion_titulo: pub.titulo,
          publicacion_ubicacion: pub.ubicacion,
          publicacion_estado: pub.estado_actual,
        })),
      )

      setModificacionesFlatOriginales(modificacionesFlat)
      setModificacionesFlat(modificacionesFlat)

      // Extraer miembros del equipo del departamento
      const miembros = new Map()
      publicacionesFiltradas.forEach((pub) => {
        pub.modificaciones.forEach((mod) => {
          if (mod.usuario_info.departamento === usuarioActual.departamento || usuarioActual.puede_ver_todos) {
            miembros.set(mod.usuario_info.id, mod.usuario_info)
          }
        })
      })
      setMiembrosEquipo(Array.from(miembros.values()))

      setLoading(false)
    }, 1000)
  }, [usuarioActual])

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

  const aplicarFiltros = () => {
    if (esJefe) {
      // Filtros para vista de jefe (publicaciones agrupadas)
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
      // Filtros para vista de personal (modificaciones planas)
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

  // Estadísticas dinámicas según el rol
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
    <>
      <TopBar title="Historial de modificación de publicaciones" icon="bx bx-database" isOpened={true} setIsOpened={() => { }} />
      <div className="min-h-screen bg-gray-50 p-6">
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  {esJefe ? (
                    <>
                      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                        <CardContent className="p-4 text-center">
                          <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-blue-700">{estadisticas.totalModificaciones}</div>
                          <div className="text-sm text-blue-600">Total modificaciones</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                        <CardContent className="p-4 text-center">
                          <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-green-700">{estadisticas.modificacionesHoy}</div>
                          <div className="text-sm text-green-600">Modificaciones hoy</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                        <CardContent className="p-4 text-center">
                          <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-purple-700">{estadisticas.miembrosEquipo}</div>
                          <div className="text-sm text-purple-600">Miembros del equipo</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                        <CardContent className="p-4 text-center">
                          <User className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                          <div className="text-lg font-bold text-orange-700 truncate">
                            {estadisticas.miembroMasActivo.miembro?.nombre.split(" ")[0] || "N/A"}
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
                          <div className="text-2xl font-bold text-blue-700">{estadisticas.totalModificaciones}</div>
                          <div className="text-sm text-blue-600">Total del equipo</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                        <CardContent className="p-4 text-center">
                          <User className="w-8 h-8 text-green-600 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-green-700">{estadisticas.misModificaciones}</div>
                          <div className="text-sm text-green-600">Mis modificaciones</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                        <CardContent className="p-4 text-center">
                          <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-purple-700">{estadisticas.modificacionesEquipo}</div>
                          <div className="text-sm text-purple-600">Del equipo</div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                        <CardContent className="p-4 text-center">
                          <Target className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                          <div className="text-2xl font-bold text-orange-700">{estadisticas.modificacionesAprobadas}</div>
                          <div className="text-sm text-orange-600">Aprobadas</div>
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
                              <SelectItem key={miembro.id} value={miembro.nombre}>
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-6 h-6">
                                    <AvatarImage src={miembro.avatar || "/placeholder.svg"} />
                                    <AvatarFallback className="text-xs">
                                      {miembro.nombre
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  {miembro.nombre}
                                  {miembro.id === usuarioActual.id && !esJefe && " (Yo)"}
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
                        <label className="text-sm font-medium text-gray-700">Nivel de impacto</label>
                        <Select value={filtros.impacto} onValueChange={(value) => handleFiltroChange("impacto", value)}>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Seleccionar impacto" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Todos los niveles">Todos los niveles</SelectItem>
                            <SelectItem value="Alto">Alto impacto</SelectItem>
                            <SelectItem value="Medio">Medio impacto</SelectItem>
                            <SelectItem value="Bajo">Bajo impacto</SelectItem>
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
                      publicaciones.map((publicacion) => (
                        <Card key={publicacion.publicacion_id} className="border-l-4 border-l-green-500">
                          <Collapsible>
                            <CollapsibleTrigger
                              className="w-full"
                              onClick={() => togglePublicacion(publicacion.publicacion_id)}
                            >
                              <CardHeader className="hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    {publicacionesAbiertas.has(publicacion.publicacion_id) ? (
                                      <ChevronDown className="w-5 h-5 text-gray-500" />
                                    ) : (
                                      <ChevronRight className="w-5 h-5 text-gray-500" />
                                    )}
                                    <div className="text-left">
                                      <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-semibold text-gray-800">{publicacion.titulo}</h3>
                                        <Badge className={`text-xs ${getEstadoBadge(publicacion.estado_actual)}`}>
                                          {publicacion.estado_actual}
                                        </Badge>
                                      </div>
                                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                        <span className="flex items-center gap-1">
                                          <FileText className="w-4 h-4" />
                                          ID: {publicacion.publicacion_id}
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
                                          <TableRow key={modificacion.id} className="hover:bg-white">
                                            <TableCell className="font-mono text-xs">
                                              {formatearFecha(modificacion.fecha)}
                                            </TableCell>
                                            <TableCell>
                                              <div className="flex items-center gap-2">
                                                <Avatar className="w-8 h-8">
                                                  <AvatarImage
                                                    src={modificacion.usuario_info.avatar || "/placeholder.svg"}
                                                  />
                                                  <AvatarFallback className="text-xs">
                                                    {modificacion.usuario_info.nombre
                                                      .split(" ")
                                                      .map((n) => n[0])
                                                      .join("")}
                                                  </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                  <div className="font-medium text-sm">
                                                    {modificacion.usuario_info.nombre}
                                                  </div>
                                                  <div className="text-xs text-gray-500">
                                                    {modificacion.usuario_info.rol}
                                                  </div>
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
                                                <p className="text-sm text-gray-600 truncate" title={modificacion.motivo}>
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
                            const modificacionesMiembro = publicaciones
                              .flatMap((pub) => pub.modificaciones)
                              .filter((mod) => mod.usuario_info.id === miembro.id).length

                            return (
                              <Card key={miembro.id} className="bg-white">
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="w-12 h-12">
                                      <AvatarImage src={miembro.avatar || "/placeholder.svg"} />
                                      <AvatarFallback>
                                        {miembro.nombre
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-800">{miembro.nombre}</div>
                                      <div className="text-sm text-gray-600">{miembro.rol}</div>
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
                        Modificaciones del departamento ({modificacionesFlat.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="flex justify-center items-center h-64">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[140px]">Fecha</TableHead>
                                <TableHead>Publicación</TableHead>
                                <TableHead>Campo modificado</TableHead>
                                <TableHead>Cambio realizado</TableHead>
                                <TableHead>Impacto</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Realizada por</TableHead>
                                <TableHead>Aprobación</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {modificacionesFlat.map((modificacion) => (
                                <TableRow key={modificacion.id} className="hover:bg-gray-50">
                                  <TableCell className="font-mono text-xs">
                                    {formatearFecha(modificacion.fecha)}
                                  </TableCell>
                                  <TableCell>
                                    <div>
                                      <div className="font-medium text-sm">{modificacion.publicacion_titulo}</div>
                                      <div className="text-xs text-gray-500 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {modificacion.publicacion_ubicacion}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      {getCampoIcon(modificacion.campo_modificado)}
                                      <span className="font-medium text-sm">{modificacion.campo_modificado}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <Badge
                                          variant="outline"
                                          className="text-xs bg-red-50 text-red-700 border-red-200"
                                        >
                                          {modificacion.valor_anterior}
                                        </Badge>
                                        <span className="text-gray-400">→</span>
                                        <Badge
                                          variant="outline"
                                          className="text-xs bg-green-50 text-green-700 border-green-200"
                                        >
                                          {modificacion.valor_nuevo}
                                        </Badge>
                                      </div>
                                      <div
                                        className="text-xs text-gray-600 max-w-xs truncate"
                                        title={modificacion.motivo}
                                      >
                                        {modificacion.motivo}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={`text-xs ${getImpactoBadge(modificacion.impacto)}`}>
                                      {modificacion.impacto}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={`text-xs ${getEstadoBadge(modificacion.publicacion_estado)}`}>
                                      {modificacion.publicacion_estado}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Avatar className="w-8 h-8">
                                        <AvatarImage src={modificacion.usuario_info.avatar || "/placeholder.svg"} />
                                        <AvatarFallback className="text-xs">
                                          {modificacion.usuario_info.nombre
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <div
                                          className={`font-medium text-sm ${modificacion.es_propia ? "text-green-700 font-bold" : ""}`}
                                        >
                                          {modificacion.usuario_info.nombre}
                                          {modificacion.es_propia && " (Yo)"}
                                        </div>
                                        <div className="text-xs text-gray-500">{modificacion.usuario_info.rol}</div>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-xs">
                                      {modificacion.aprobada_por === "Pendiente de aprobación" ? (
                                        <Badge
                                          variant="outline"
                                          className="bg-yellow-50 text-yellow-700 border-yellow-200"
                                        >
                                          Pendiente
                                        </Badge>
                                      ) : (
                                        <div>
                                          <Badge
                                            variant="outline"
                                            className="bg-green-50 text-green-700 border-green-200"
                                          >
                                            Aprobada
                                          </Badge>
                                          <div className="text-gray-500 mt-1">{modificacion.aprobada_por}</div>
                                        </div>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}

                      {!loading && modificacionesFlat.length === 0 && (
                        <div className="text-center py-12">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-600 mb-2">No hay modificaciones</h3>
                          <p className="text-gray-500">No se encontraron modificaciones con los filtros aplicados.</p>
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
    </>

  )
}

export default HistorialModificacionPublicaciones