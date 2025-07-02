import React from 'react'
import TopBar from '../TopBar'


import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import {
  Users,
  UserPlus,
  Search,
  Shield,
  ShieldCheck,
  ChevronRight,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  Settings,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  Key,
  Database,
  Activity,
  FileText,
  Lock,
  Download,
  Upload,
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Ban,
  UserCog,
} from "lucide-react"

// Simulamos el rol del usuario actual - CAMBIAR AQUÍ PARA PROBAR
const CURRENT_USER_ROLE = "a" // Cambiar a "Jefe de Departamento" para probar
const CURRENT_USER_DEPARTMENT = "Obras Públicas" // Departamento del jefe actual

const CuentaUsuario = ({ setIsOpened, isOpened }) => {
  const [activeSection, setActiveSection] = useState("gestion")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRol, setFilterRol] = useState("todos")
  const [filterEstado, setFilterEstado] = useState("todos")
  const [selectedUser, setSelectedUser] = useState(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    nombre: "",
    email: "",
    telefono: "",
    rol: "",
    departamento: "",
    password: "",
    confirmPassword: "",
    enviarCredenciales: true,
    requiereCambioPassword: true,
  })

  const usuarios = [
    {
      id: 1,
      nombre: "María González",
      email: "maria.gonzalez@municipio.gov",
      telefono: "+54 11 4567-8901",
      rol: "Administrador Municipal",
      departamento: "Administración General",
      estado: "Activo",
      fechaCreacion: "2024-01-15",
      ultimoAcceso: "2024-12-29 14:30",
      permisos: ["Crear", "Editar", "Eliminar", "Configurar", "Gestionar usuarios", "Acceso total"],
      intentosFallidos: 0,
      requiereCambioPassword: false,
    },
    {
      id: 2,
      nombre: "Juan Pérez",
      email: "juan.perez@municipio.gov",
      telefono: "+54 11 4567-8902",
      rol: "Jefe de Departamento",
      departamento: "Obras Públicas",
      estado: "Activo",
      fechaCreacion: "2024-02-20",
      ultimoAcceso: "2024-12-29 13:15",
      permisos: ["Crear", "Editar", "Ver reportes", "Gestionar equipo"],
      intentosFallidos: 0,
      requiereCambioPassword: false,
    },
    {
      id: 3,
      nombre: "Ana Rodríguez",
      email: "ana.rodriguez@municipio.gov",
      telefono: "+54 11 4567-8903",
      rol: "Editor",
      departamento: "Obras Públicas",
      estado: "Pendiente",
      fechaCreacion: "2024-12-25",
      ultimoAcceso: "Nunca",
      permisos: ["Crear", "Editar", "Ver reportes"],
      intentosFallidos: 0,
      requiereCambioPassword: true,
    },
    {
      id: 4,
      nombre: "Carlos López",
      email: "carlos.lopez@municipio.gov",
      telefono: "+54 11 4567-8904",
      rol: "Visualizador",
      departamento: "Obras Públicas",
      estado: "Bloqueado",
      fechaCreacion: "2024-03-10",
      ultimoAcceso: "2024-11-15 09:20",
      permisos: ["Ver", "Generar reportes"],
      intentosFallidos: 3,
      requiereCambioPassword: true,
    },
    {
      id: 5,
      nombre: "Laura Martínez",
      email: "laura.martinez@municipio.gov",
      telefono: "+54 11 4567-8905",
      rol: "Editor",
      departamento: "Servicios Ciudadanos",
      estado: "Activo",
      fechaCreacion: "2024-03-15",
      ultimoAcceso: "2024-12-28 16:45",
      permisos: ["Crear", "Editar", "Ver reportes"],
      intentosFallidos: 0,
      requiereCambioPassword: false,
    },
    {
      id: 6,
      nombre: "Roberto Silva",
      email: "roberto.silva@municipio.gov",
      telefono: "+54 11 4567-8906",
      rol: "Jefe de Departamento",
      departamento: "Medio Ambiente",
      estado: "Activo",
      fechaCreacion: "2024-01-20",
      ultimoAcceso: "2024-12-29 11:30",
      permisos: ["Crear", "Editar", "Ver reportes", "Gestionar equipo"],
      intentosFallidos: 0,
      requiereCambioPassword: false,
    },
  ]

  // Filtrar secciones según el rol del usuario actual
  const getSeccionesUsuarios = () => {
    const baseSections = [
      {
        nombre: "Gestión de Usuarios",
        elementos: getFilteredUsersForRole().length,
        icono: Users,
        color: "text-green-600 bg-green-50",
        descripcion:
          CURRENT_USER_ROLE === "Administrador Municipal"
            ? "Administrar todas las cuentas del sistema"
            : "Gestionar usuarios de mi departamento",
      },
    ]

    if (CURRENT_USER_ROLE === "Administrador Municipal") {
      return [
        ...baseSections,
        {
          nombre: "Roles y Permisos",
          elementos: 4,
          icono: Shield,
          color: "text-blue-600 bg-blue-50",
          descripcion: "Configurar roles y niveles de acceso del sistema",
        },
        // {
        //   nombre: "Configuración Avanzada",
        //   elementos: 8,
        //   icono: Settings,
        //   color: "text-purple-600 bg-purple-50",
        //   descripcion: "Ajustes de seguridad y configuración del sistema",
        // },
      ]
    } else {
      return [
        ...baseSections,
        {
          nombre: "Mi Equipo",
          elementos: getMyTeamUsers().length,
          icono: Users,
          color: "text-blue-600 bg-blue-50",
          descripcion: "Usuarios bajo mi supervisión directa",
        },
        // {
        //   nombre: "Reportes Departamentales",
        //   elementos: 8,
        //   icono: FileText,
        //   color: "text-purple-600 bg-purple-50",
        //   descripcion: "Reportes y métricas de mi departamento",
        // },
        // {
        //   nombre: "Solicitudes Pendientes",
        //   elementos: 3,
        //   icono: Clock,
        //   color: "text-yellow-600 bg-yellow-50",
        //   descripcion: "Solicitudes que requieren mi aprobación",
        // },
      ]
    }
  }

  const getFilteredUsersForRole = () => {
    if (CURRENT_USER_ROLE === "Administrador Municipal") {
      return usuarios
    } else {
      // Jefe de Departamento solo ve usuarios de su departamento
      return usuarios.filter(
        (user) =>
          user.departamento === CURRENT_USER_DEPARTMENT ||
          (user.rol === "Jefe de Departamento" && user.departamento === CURRENT_USER_DEPARTMENT),
      )
    }
  }

  const getMyTeamUsers = () => {
    return usuarios.filter(
      (user) => user.departamento === CURRENT_USER_DEPARTMENT && user.rol !== "Jefe de Departamento",
    )
  }

  const seccionesUsuarios = getSeccionesUsuarios()

  const filteredUsers = getFilteredUsersForRole().filter((user) => {
    const matchesSearch =
      user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.departamento.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRolFilter = filterRol === "todos" || user.rol === filterRol
    const matchesEstadoFilter = filterEstado === "todos" || user.estado === filterEstado
    return matchesSearch && matchesRolFilter && matchesEstadoFilter
  })

  const handleCreateUser = () => {
    if (newUser.password !== newUser.confirmPassword) {
      alert("Las contraseñas no coinciden")
      return
    }

    if (!newUser.nombre || !newUser.email || !newUser.rol || !newUser.departamento) {
      alert("Por favor complete todos los campos obligatorios")
      return
    }

    // Simular creación del usuario
    console.log("Creando usuario:", {
      ...newUser,
      id: usuarios.length + 1,
      estado: "Pendiente",
      fechaCreacion: new Date().toISOString().split("T")[0],
      ultimoAcceso: "Nunca",
      permisos: getPermisosForRole(newUser.rol),
      intentosFallidos: 0,
    })

    alert("Usuario creado exitosamente. Se han enviado las credenciales por email.")
    setIsCreateDialogOpen(false)
    resetNewUserForm()
  }

  const resetNewUserForm = () => {
    setNewUser({
      nombre: "",
      email: "",
      telefono: "",
      rol: "",
      departamento: "",
      password: "",
      confirmPassword: "",
      enviarCredenciales: true,
      requiereCambioPassword: true,
    })
  }

  const getPermisosForRole = (rol) => {
    switch (rol) {
      case "Administrador Municipal":
        return ["Crear", "Editar", "Eliminar", "Configurar", "Gestionar usuarios", "Acceso total"]
      case "Jefe de Departamento":
        return ["Crear", "Editar", "Ver reportes", "Gestionar equipo", "Aprobar solicitudes"]
      case "Editor":
        return ["Crear", "Editar", "Ver reportes"]
      case "Visualizador":
        return ["Ver", "Generar reportes"]
      default:
        return ["Ver"]
    }
  }

  const getRolIcon = (rol) => {
    switch (rol) {
      case "Administrador Municipal":
        return <Shield className="w-4 h-4" />
      case "Jefe de Departamento":
        return <ShieldCheck className="w-4 h-4" />
      case "Editor":
        return <Edit className="w-4 h-4" />
      case "Visualizador":
        return <Eye className="w-4 h-4" />
      default:
        return <Users className="w-4 h-4" />
    }
  }

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case "Activo":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "Inactivo":
        return <XCircle className="w-4 h-4 text-gray-600" />
      case "Pendiente":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "Bloqueado":
        return <Lock className="w-4 h-4 text-red-600" />
      default:
        return <Users className="w-4 h-4" />
    }
  }

  const getRolColor = (rol) => {
    switch (rol) {
      case "Administrador Municipal":
        return "bg-red-100 text-red-800 border-red-200"
      case "Jefe de Departamento":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "Editor":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Visualizador":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "Activo":
        return "bg-green-100 text-green-800 border-green-200"
      case "Inactivo":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "Pendiente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Bloqueado":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const renderGestionUsuarios = () => (
    <div className="space-y-6">
      {/* Card explicativa */}
      <Card className="bg-gradient-to-r from-pink-50 to-pink-100 border-pink-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-pink-200 rounded-full p-3 flex-shrink-0">
              <span className="text-2xl font-bold text-pink-800">1</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-pink-900 mb-2">
                {CURRENT_USER_ROLE === "Administrador Municipal"
                  ? "Gestión Completa de Usuarios del Sistema"
                  : "Gestión de Usuarios de Mi Departamento"}
              </h3>
              <p className="text-pink-800">
                {CURRENT_USER_ROLE === "Administrador Municipal"
                  ? "Permite crear, editar y gestionar todas las cuentas de usuarios del sistema municipal con control total sobre roles y permisos."
                  : "Gestiona los usuarios de tu departamento, asigna tareas y supervisa el rendimiento de tu equipo de trabajo."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {filteredUsers.filter((u) => u.estado === "Activo").length}
                </p>
                <p className="text-sm text-gray-600">Usuarios Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {filteredUsers.filter((u) => u.estado === "Pendiente").length}
                </p>
                <p className="text-sm text-gray-600">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Ban className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {filteredUsers.filter((u) => u.estado === "Bloqueado").length}
                </p>
                <p className="text-sm text-gray-600">Bloqueados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{filteredUsers.length}</p>
                <p className="text-sm text-gray-600">Total Usuarios</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles de búsqueda y filtros */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Lista de Usuarios ({filteredUsers.length})
              {CURRENT_USER_ROLE === "Jefe de Departamento" && (
                <Badge variant="outline" className="ml-2">
                  Departamento: {CURRENT_USER_DEPARTMENT}
                </Badge>
              )}
            </CardTitle>
            <div className="flex gap-2">
              {/* <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button> */}
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Nuevo Usuario
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <UserPlus className="w-5 h-5" />
                      Crear Nuevo Usuario
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    {/* Información Personal */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Información Personal
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="nombre">Nombre Completo *</Label>
                          <Input
                            id="nombre"
                            value={newUser.nombre}
                            onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value })}
                            placeholder="Ej: María González"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email Corporativo *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            placeholder="usuario@municipio.gov"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="telefono">Teléfono</Label>
                          <Input
                            id="telefono"
                            value={newUser.telefono}
                            onChange={(e) => setNewUser({ ...newUser, telefono: e.target.value })}
                            placeholder="+54 11 1234-5678"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Información del Sistema */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Información del Sistema
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="rol">Rol del Usuario *</Label>
                          <Select value={newUser.rol} onValueChange={(value) => setNewUser({ ...newUser, rol: value })}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Seleccionar rol" />
                            </SelectTrigger>
                            <SelectContent>
                              {CURRENT_USER_ROLE === "Administrador Municipal" && (
                                <>
                                  <SelectItem value="Administrador Municipal">
                                    <div className="flex items-center gap-2">
                                      <Shield className="w-4 h-4" />
                                      Administrador Municipal
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Jefe de Departamento">
                                    <div className="flex items-center gap-2">
                                      <ShieldCheck className="w-4 h-4" />
                                      Jefe de Departamento
                                    </div>
                                  </SelectItem>
                                </>
                              )}
                              <SelectItem value="Editor">
                                <div className="flex items-center gap-2">
                                  <Edit className="w-4 h-4" />
                                  Editor
                                </div>
                              </SelectItem>
                              <SelectItem value="Visualizador">
                                <div className="flex items-center gap-2">
                                  <Eye className="w-4 h-4" />
                                  Visualizador
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="departamento">Departamento *</Label>
                          <Select
                            value={newUser.departamento}
                            onValueChange={(value) => setNewUser({ ...newUser, departamento: value })}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Seleccionar departamento" />
                            </SelectTrigger>
                            <SelectContent>
                              {CURRENT_USER_ROLE === "Administrador Municipal" ? (
                                <>
                                  <SelectItem value="Administración General">Administración General</SelectItem>
                                  <SelectItem value="Obras Públicas">Obras Públicas</SelectItem>
                                  <SelectItem value="Servicios Ciudadanos">Servicios Ciudadanos</SelectItem>
                                  <SelectItem value="Planificación Urbana">Planificación Urbana</SelectItem>
                                  <SelectItem value="Medio Ambiente">Medio Ambiente</SelectItem>
                                  <SelectItem value="Finanzas">Finanzas</SelectItem>
                                  <SelectItem value="Recursos Humanos">Recursos Humanos</SelectItem>
                                </>
                              ) : (
                                <SelectItem value={CURRENT_USER_DEPARTMENT}>{CURRENT_USER_DEPARTMENT}</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Configuración de Acceso */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Key className="w-5 h-5" />
                        Configuración de Acceso
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="password">Contraseña Temporal *</Label>
                          <Input
                            id="password"
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            placeholder="Mínimo 8 caracteres"
                            className="mt-1"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Debe contener al menos 8 caracteres, una mayúscula y un número
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={newUser.confirmPassword}
                            onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                            placeholder="Repetir contraseña"
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-4 mt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Enviar credenciales por email</Label>
                            <p className="text-sm text-gray-500">Se enviará un email con las credenciales de acceso</p>
                          </div>
                          <Switch
                            checked={newUser.enviarCredenciales}
                            onCheckedChange={(checked) => setNewUser({ ...newUser, enviarCredenciales: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Requerir cambio de contraseña</Label>
                            <p className="text-sm text-gray-500">
                              El usuario deberá cambiar la contraseña en el primer acceso
                            </p>
                          </div>
                          <Switch
                            checked={newUser.requiereCambioPassword}
                            onCheckedChange={(checked) => setNewUser({ ...newUser, requiereCambioPassword: checked })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Permisos Preview */}
                    {newUser.rol && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Shield className="w-5 h-5" />
                          Permisos del Rol Seleccionado
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex flex-wrap gap-2">
                            {getPermisosForRole(newUser.rol).map((permiso, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {permiso}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsCreateDialogOpen(false)
                        resetNewUserForm()
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateUser} className="bg-green-600 hover:bg-green-700">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Crear Usuario
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, email o departamento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterRol} onValueChange={setFilterRol}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los roles</SelectItem>
                <SelectItem value="Administrador Municipal">Administrador Municipal</SelectItem>
                <SelectItem value="Jefe de Departamento">Jefe de Departamento</SelectItem>
                <SelectItem value="Editor">Editor</SelectItem>
                <SelectItem value="Visualizador">Visualizador</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="Activo">Activo</SelectItem>
                <SelectItem value="Inactivo">Inactivo</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="Bloqueado">Bloqueado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabla de usuarios */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                <div className="col-span-3">Usuario</div>
                <div className="col-span-2">Rol</div>
                <div className="col-span-2">Departamento</div>
                <div className="col-span-2">Estado</div>
                <div className="col-span-2">Último Acceso</div>
                <div className="col-span-1">Acciones</div>
              </div>
            </div>
            <div className="divide-y">
              {filteredUsers.map((usuario) => (
                <div key={usuario.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-3">
                      <div>
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          {usuario.nombre}
                          {usuario.requiereCambioPassword && (
                            <AlertTriangle className="w-4 h-4 text-yellow-500" title="Requiere cambio de contraseña" />
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{usuario.email}</div>
                        {usuario.intentosFallidos > 0 && (
                          <div className="text-xs text-red-500">{usuario.intentosFallidos} intentos fallidos</div>
                        )}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <Badge className={`${getRolColor(usuario.rol)} flex items-center gap-1 w-fit border`}>
                        {getRolIcon(usuario.rol)}
                        {usuario.rol}
                      </Badge>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-gray-600">{usuario.departamento}</span>
                    </div>
                    <div className="col-span-2">
                      <Badge className={`${getEstadoColor(usuario.estado)} flex items-center gap-1 w-fit border`}>
                        {getEstadoIcon(usuario.estado)}
                        {usuario.estado}
                      </Badge>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-gray-600">{usuario.ultimoAcceso}</span>
                    </div>
                    <div className="col-span-1">
                      <div className="flex gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => setSelectedUser(usuario)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <UserCog className="w-5 h-5" />
                                Detalles del Usuario
                              </DialogTitle>
                            </DialogHeader>
                            {selectedUser && (
                              <Tabs defaultValue="info" className="w-full">
                                <TabsList className="grid w-full grid-cols-4">
                                  <TabsTrigger value="info">Información</TabsTrigger>
                                  <TabsTrigger value="permisos">Permisos</TabsTrigger>
                                  <TabsTrigger value="actividad">Actividad</TabsTrigger>
                                  <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
                                </TabsList>
                                <TabsContent value="info" className="space-y-6">
                                  <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                      <div>
                                        <Label className="text-sm font-medium text-gray-700">Nombre Completo</Label>
                                        <p className="text-lg font-semibold">{selectedUser.nombre}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium text-gray-700">Email</Label>
                                        <div className="flex items-center gap-2">
                                          <Mail className="w-4 h-4 text-gray-500" />
                                          <p>{selectedUser.email}</p>
                                        </div>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium text-gray-700">Teléfono</Label>
                                        <div className="flex items-center gap-2">
                                          <Phone className="w-4 h-4 text-gray-500" />
                                          <p>{selectedUser.telefono}</p>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="space-y-4">
                                      <div>
                                        <Label className="text-sm font-medium text-gray-700">Rol</Label>
                                        <Badge
                                          className={`${getRolColor(selectedUser.rol)} flex items-center gap-1 w-fit mt-1 border`}
                                        >
                                          {getRolIcon(selectedUser.rol)}
                                          {selectedUser.rol}
                                        </Badge>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium text-gray-700">Departamento</Label>
                                        <div className="flex items-center gap-2">
                                          <Building2 className="w-4 h-4 text-gray-500" />
                                          <p>{selectedUser.departamento}</p>
                                        </div>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium text-gray-700">Estado</Label>
                                        <Badge
                                          className={`${getEstadoColor(selectedUser.estado)} flex items-center gap-1 w-fit mt-1 border`}
                                        >
                                          {getEstadoIcon(selectedUser.estado)}
                                          {selectedUser.estado}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="border-t pt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="text-sm font-medium text-gray-700">Fecha de Creación</Label>
                                        <div className="flex items-center gap-2">
                                          <Calendar className="w-4 h-4 text-gray-500" />
                                          <p>{selectedUser.fechaCreacion}</p>
                                        </div>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium text-gray-700">Último Acceso</Label>
                                        <div className="flex items-center gap-2">
                                          <Clock className="w-4 h-4 text-gray-500" />
                                          <p>{selectedUser.ultimoAcceso}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </TabsContent>
                                <TabsContent value="permisos" className="space-y-4">
                                  <div>
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                      Permisos Asignados
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                      {selectedUser.permisos.map((permiso, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                          {permiso}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </TabsContent>
                                <TabsContent value="actividad" className="space-y-4">
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                      <CheckCircle className="w-5 h-5 text-green-600" />
                                      <div>
                                        <p className="text-sm font-medium">Último acceso exitoso</p>
                                        <p className="text-xs text-gray-500">{selectedUser.ultimoAcceso}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                      <Activity className="w-5 h-5 text-blue-600" />
                                      <div>
                                        <p className="text-sm font-medium">Sesiones activas</p>
                                        <p className="text-xs text-gray-500">1 sesión activa</p>
                                      </div>
                                    </div>
                                  </div>
                                </TabsContent>
                                <TabsContent value="seguridad" className="space-y-4">
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                      <div>
                                        <p className="font-medium">Intentos de acceso fallidos</p>
                                        <p className="text-sm text-gray-500">
                                          {selectedUser.intentosFallidos} intentos
                                        </p>
                                      </div>
                                      <Badge variant={selectedUser.intentosFallidos > 0 ? "destructive" : "secondary"}>
                                        {selectedUser.intentosFallidos > 0 ? "Atención" : "Normal"}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                      <div>
                                        <p className="font-medium">Cambio de contraseña requerido</p>
                                        <p className="text-sm text-gray-500">
                                          {selectedUser.requiereCambioPassword ? "Sí" : "No"}
                                        </p>
                                      </div>
                                      <Badge
                                        variant={selectedUser.requiereCambioPassword ? "destructive" : "secondary"}
                                      >
                                        {selectedUser.requiereCambioPassword ? "Requerido" : "Actualizada"}
                                      </Badge>
                                    </div>
                                  </div>
                                </TabsContent>
                              </Tabs>
                            )}
                          </DialogContent>
                        </Dialog>
                        {(CURRENT_USER_ROLE === "Administrador Municipal" ||
                          (CURRENT_USER_ROLE === "Jefe de Departamento" &&
                            usuario.departamento === CURRENT_USER_DEPARTMENT &&
                            usuario.rol !== "Jefe de Departamento")) && (
                            <>
                              <Button size="sm" variant="outline">
                                <Edit className="w-4 h-4" />
                              </Button>
                              {CURRENT_USER_ROLE === "Administrador Municipal" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700 bg-transparent"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderRolesPermisos = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue-200 rounded-full p-3 flex-shrink-0">
              <Shield className="w-6 h-6 text-blue-800" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Sistema de Roles y Permisos</h3>
              <p className="text-blue-800">
                Configuración jerárquica de roles con permisos específicos para cada nivel de acceso en el sistema
                municipal.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <Shield className="w-5 h-5" />
              Administrador Municipal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 mb-4">
              Control total del sistema municipal con acceso a todas las funciones administrativas.
            </p>
            <ul className="space-y-2 text-sm text-red-600">
              <li>• Gestión completa de usuarios y roles</li>
              <li>• Configuración del sistema y seguridad</li>
              <li>• Acceso a todas las secciones y módulos</li>
              <li>• Reportes y auditorías completas</li>
              <li>• Configuración de políticas de seguridad</li>
              <li>• Backup y restauración del sistema</li>
              <li>• Gestión de departamentos</li>
            </ul>
            <div className="mt-4 p-3 bg-red-100 rounded-lg">
              <p className="text-xs text-red-800 font-medium">
                Usuarios activos: {usuarios.filter((u) => u.rol === "Administrador Municipal").length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <ShieldCheck className="w-5 h-5" />
              Jefe de Departamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-purple-700 mb-4">
              Gestión completa de su departamento y supervisión del equipo de trabajo.
            </p>
            <ul className="space-y-2 text-sm text-purple-600">
              <li>• Gestión de usuarios de su departamento</li>
              <li>• Asignación de tareas y proyectos</li>
              <li>• Reportes departamentales detallados</li>
              <li>• Supervisión de actividades del equipo</li>
              <li>• Aprobación de solicitudes y permisos</li>
              <li>• Evaluación de desempeño</li>
            </ul>
            <div className="mt-4 p-3 bg-purple-100 rounded-lg">
              <p className="text-xs text-purple-800 font-medium">
                Usuarios activos: {usuarios.filter((u) => u.rol === "Jefe de Departamento").length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Edit className="w-5 h-5" />
              Editor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700 mb-4">
              Puede crear, editar y gestionar contenido del sistema con permisos de modificación.
            </p>
            <ul className="space-y-2 text-sm text-blue-600">
              <li>• Gestión de juntas vecinales</li>
              <li>• Edición de datos municipales</li>
              <li>• Acceso a mapas y herramientas</li>
              <li>• Creación y modificación de contenido</li>
              <li>• Generación de reportes básicos</li>
              <li>• Carga de documentos y archivos</li>
            </ul>
            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <p className="text-xs text-blue-800 font-medium">
                Usuarios activos: {usuarios.filter((u) => u.rol === "Editor").length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Eye className="w-5 h-5" />
              Visualizador
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700 mb-4">
              Solo puede consultar y visualizar información del sistema sin permisos de modificación.
            </p>
            <ul className="space-y-2 text-sm text-green-600">
              <li>• Consulta de información general</li>
              <li>• Visualización de mapas y datos</li>
              <li>• Acceso a reportes de solo lectura</li>
              <li>• Exportación de datos básicos</li>
              <li>• Consulta de estadísticas</li>
              <li>• Visualización de documentos</li>
            </ul>
            <div className="mt-4 p-3 bg-green-100 rounded-lg">
              <p className="text-xs text-green-800 font-medium">
                Usuarios activos: {usuarios.filter((u) => u.rol === "Visualizador").length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Matriz de permisos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Matriz de Permisos por Módulo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Módulo</th>
                  <th className="text-center p-2">Admin Municipal</th>
                  <th className="text-center p-2">Jefe Depto</th>
                  <th className="text-center p-2">Editor</th>
                  <th className="text-center p-2">Visualizador</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    modulo: "Gestión de Usuarios",
                    admin: "Total",
                    jefe: "Departamento",
                    editor: "No",
                    visualizador: "No",
                  },
                  {
                    modulo: "Juntas Vecinales",
                    admin: "Total",
                    jefe: "Departamento",
                    editor: "Editar",
                    visualizador: "Ver",
                  },
                  { modulo: "Mapas", admin: "Total", jefe: "Ver/Editar", editor: "Ver/Editar", visualizador: "Ver" },
                  { modulo: "Reportes", admin: "Total", jefe: "Departamento", editor: "Básicos", visualizador: "Ver" },
                  { modulo: "Configuración", admin: "Total", jefe: "No", editor: "No", visualizador: "No" },
                ].map((row, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{row.modulo}</td>
                    <td className="p-2 text-center">
                      <Badge className="bg-red-100 text-red-800">{row.admin}</Badge>
                    </td>
                    <td className="p-2 text-center">
                      <Badge className="bg-purple-100 text-purple-800">{row.jefe}</Badge>
                    </td>
                    <td className="p-2 text-center">
                      <Badge className="bg-blue-100 text-blue-800">{row.editor}</Badge>
                    </td>
                    <td className="p-2 text-center">
                      <Badge className="bg-green-100 text-green-800">{row.visualizador}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderConfiguracionAvanzada = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-purple-200 rounded-full p-3 flex-shrink-0">
              <Settings className="w-6 h-6 text-purple-800" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-900 mb-2">Configuración Avanzada del Sistema</h3>
              <p className="text-purple-800">
                Configuraciones de seguridad, políticas del sistema y ajustes avanzados para el funcionamiento óptimo
                del sistema municipal.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Configuraciones de Seguridad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <span className="font-medium">Políticas de contraseñas</span>
                <p className="text-sm text-gray-500">Mínimo 8 caracteres, mayúscula y número</p>
              </div>
              <Button size="sm" variant="outline">
                Configurar
              </Button>
            </div>
            <div className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <span className="font-medium">Tiempo de sesión</span>
                <p className="text-sm text-gray-500">Expiración automática: 8 horas</p>
              </div>
              <Button size="sm" variant="outline">
                Configurar
              </Button>
            </div>
            <div className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <span className="font-medium">Autenticación de dos factores</span>
                <p className="text-sm text-gray-500">Opcional para usuarios</p>
              </div>
              <Button size="sm" variant="outline">
                Activar
              </Button>
            </div>
            <div className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <span className="font-medium">Bloqueo automático</span>
                <p className="text-sm text-gray-500">Después de 3 intentos fallidos</p>
              </div>
              <Button size="sm" variant="outline">
                Configurar
              </Button>
            </div>
            <div className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <span className="font-medium">Auditoría de accesos</span>
                <p className="text-sm text-gray-500">Registro completo activado</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Activo</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Configuraciones del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <span className="font-medium">Backup automático</span>
                <p className="text-sm text-gray-500">Diario a las 02:00 AM</p>
              </div>
              <Button size="sm" variant="outline">
                Configurar
              </Button>
            </div>
            <div className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <span className="font-medium">Logs de actividad</span>
                <p className="text-sm text-gray-500">Retención: 90 días</p>
              </div>
              <Button size="sm" variant="outline">
                Ver
              </Button>
            </div>
            <div className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <span className="font-medium">Integración LDAP</span>
                <p className="text-sm text-gray-500">Sincronización desactivada</p>
              </div>
              <Button size="sm" variant="outline">
                Configurar
              </Button>
            </div>
            <div className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <span className="font-medium">Notificaciones por email</span>
                <p className="text-sm text-gray-500">SMTP configurado</p>
              </div>
              <Button size="sm" variant="outline">
                Configurar
              </Button>
            </div>
            <div className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <span className="font-medium">Límite de sesiones</span>
                <p className="text-sm text-gray-500">Máximo 3 sesiones por usuario</p>
              </div>
              <Button size="sm" variant="outline">
                Configurar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuraciones adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="w-5 h-5" />
              Alertas del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Intentos de acceso fallidos</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Nuevos usuarios creados</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Cambios de permisos</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Errores del sistema</span>
                <Switch defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Key className="w-5 h-5" />
              Políticas de Acceso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Horario de acceso restringido</span>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Acceso desde IP específicas</span>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Validación de dispositivos</span>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Renovación de contraseñas</span>
                <Switch defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Upload className="w-5 h-5" />
              Mantenimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Download className="w-4 h-4 mr-2" />
                Exportar configuración
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Upload className="w-4 h-4 mr-2" />
                Importar configuración
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Database className="w-4 h-4 mr-2" />
                Limpiar logs antiguos
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-600 bg-transparent">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Reiniciar sistema
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderMiEquipo = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue-200 rounded-full p-3 flex-shrink-0">
              <Users className="w-6 h-6 text-blue-800" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Mi Equipo de Trabajo - {CURRENT_USER_DEPARTMENT}
              </h3>
              <p className="text-blue-800">
                Gestión y supervisión de los usuarios bajo tu responsabilidad directa en el departamento.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas del equipo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{getMyTeamUsers().length}</p>
                <p className="text-sm text-gray-600">Miembros del equipo</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {getMyTeamUsers().filter((u) => u.estado === "Activo").length}
                </p>
                <p className="text-sm text-gray-600">Usuarios activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {getMyTeamUsers().filter((u) => u.estado === "Pendiente").length}
                </p>
                <p className="text-sm text-gray-600">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-purple-600">92%</p>
                <p className="text-sm text-gray-600">Productividad</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Usuarios de Mi Departamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getMyTeamUsers().map((usuario) => (
              <div
                key={usuario.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    {getRolIcon(usuario.rol)}
                  </div>
                  <div>
                    <p className="font-medium">{usuario.nombre}</p>
                    <p className="text-sm text-gray-600">{usuario.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`${getRolColor(usuario.rol)} text-xs`}>{usuario.rol}</Badge>
                      <Badge className={`${getEstadoColor(usuario.estado)} text-xs`}>{usuario.estado}</Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Último acceso</p>
                  <p className="text-sm font-medium">{usuario.ultimoAcceso}</p>
                  <div className="flex gap-1 mt-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderReportesDepartamentales = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-purple-200 rounded-full p-3 flex-shrink-0">
              <FileText className="w-6 h-6 text-purple-800" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-900 mb-2">
                Reportes Departamentales - {CURRENT_USER_DEPARTMENT}
              </h3>
              <p className="text-purple-800">
                Análisis y métricas específicas de tu departamento para el seguimiento del rendimiento y productividad
                del equipo.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actividad del Equipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">92%</div>
              <p className="text-sm text-gray-600 mb-4">Productividad promedio</p>
              <div className="flex items-center justify-center gap-1 text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">+5% vs mes anterior</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tareas Completadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">47</div>
              <p className="text-sm text-gray-600 mb-4">Esta semana</p>
              <div className="flex items-center justify-center gap-1 text-blue-600">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm">12 pendientes</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tiempo Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">2.3h</div>
              <p className="text-sm text-gray-600 mb-4">Por tarea completada</p>
              <div className="flex items-center justify-center gap-1 text-purple-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Dentro del objetivo</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Rendimiento Individual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getMyTeamUsers().map((usuario, index) => (
                <div key={usuario.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">{usuario.nombre.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{usuario.nombre}</p>
                      <p className="text-xs text-gray-500">{usuario.rol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">{85 + index * 5}%</div>
                    <p className="text-xs text-gray-500">Eficiencia</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reportes Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <FileText className="w-4 h-4 mr-2" />
                Reporte semanal de actividades
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <BarChart3 className="w-4 h-4 mr-2" />
                Métricas de productividad
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Users className="w-4 h-4 mr-2" />
                Evaluación de desempeño
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <TrendingUp className="w-4 h-4 mr-2" />
                Análisis de tendencias
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Download className="w-4 h-4 mr-2" />
                Exportar todos los reportes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderSolicitudesPendientes = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-yellow-200 rounded-full p-3 flex-shrink-0">
              <Clock className="w-6 h-6 text-yellow-800" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">Solicitudes Pendientes de Aprobación</h3>
              <p className="text-yellow-800">
                Solicitudes que requieren tu aprobación como Jefe de Departamento para proceder con las acciones
                correspondientes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">8</p>
                <p className="text-sm text-gray-600">Solicitudes pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">3</p>
                <p className="text-sm text-gray-600">Urgentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">15</p>
                <p className="text-sm text-gray-600">Aprobadas hoy</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Lista de Solicitudes Pendientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                id: 1,
                tipo: "Cambio de permisos",
                solicitante: "Ana Rodríguez",
                descripcion: "Solicita permisos de Editor para gestión de juntas vecinales",
                fecha: "2024-12-29",
                prioridad: "Alta",
                estado: "Pendiente",
              },
              {
                id: 2,
                tipo: "Acceso a módulo",
                solicitante: "Carlos López",
                descripcion: "Requiere acceso al módulo de reportes avanzados",
                fecha: "2024-12-28",
                prioridad: "Media",
                estado: "Pendiente",
              },
              {
                id: 3,
                tipo: "Reactivación de cuenta",
                solicitante: "Sistema",
                descripcion: "Reactivar cuenta de usuario bloqueado por intentos fallidos",
                fecha: "2024-12-28",
                prioridad: "Alta",
                estado: "Pendiente",
              },
            ].map((solicitud) => (
              <div
                key={solicitud.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-3 h-3 rounded-full mt-2 ${solicitud.prioridad === "Alta"
                        ? "bg-red-500"
                        : solicitud.prioridad === "Media"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{solicitud.tipo}</p>
                      <Badge
                        variant="outline"
                        className={
                          solicitud.prioridad === "Alta"
                            ? "border-red-200 text-red-800"
                            : solicitud.prioridad === "Media"
                              ? "border-yellow-200 text-yellow-800"
                              : "border-green-200 text-green-800"
                        }
                      >
                        {solicitud.prioridad}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      Solicitante: <span className="font-medium">{solicitud.solicitante}</span>
                    </p>
                    <p className="text-sm text-gray-700">{solicitud.descripcion}</p>
                    <p className="text-xs text-gray-500 mt-1">Fecha: {solicitud.fecha}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Aprobar
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 bg-transparent">
                    <XCircle className="w-4 h-4 mr-1" />
                    Rechazar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case "gestion":
        return renderGestionUsuarios()
      case "rolesypermisos":
        return renderRolesPermisos()
      case "configuracionavanzada":
        return renderConfiguracionAvanzada()
      case "miequipo":
        return renderMiEquipo()
      case "reportesdepartamentales":
        return renderReportesDepartamentales()
      case "solicitudespendientes":
        return renderSolicitudesPendientes()
      default:
        return renderGestionUsuarios()
    }
  }
  const handleOpenSidebar = () => {
    setIsOpened(!isOpened)
  }
  return (
    <>
      <TopBar title="Cuentas de Usuario" optionalbg="bg-[#00A86B]" handleOpenSidebar={handleOpenSidebar} />
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header Municipal */}
        {/* <div className="bg-green-600 text-white p-6 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Users className="w-8 h-8" />
              <div>
                <h1 className="text-3xl font-bold">Cuentas de Usuario</h1>
                <p className="text-green-100 mt-1">
                  {CURRENT_USER_ROLE === "Administrador Municipal"
                    ? "Gestión integral de usuarios del sistema municipal"
                    : `Gestión de usuarios del departamento de ${CURRENT_USER_DEPARTMENT}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-white text-green-600 border-green-200">
                {CURRENT_USER_ROLE}
              </Badge>
              {CURRENT_USER_ROLE === "Jefe de Departamento" && (
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                  {CURRENT_USER_DEPARTMENT}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div> */}

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar de Secciones - Estilo de la imagen */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Secciones</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1">
                    {seccionesUsuarios.map((seccion, index) => {
                      const IconComponent = seccion.icono
                      const sectionKey = seccion.nombre
                        .toLowerCase()
                        .replace(/\s+/g, "")
                        .replace(/ó/g, "o")
                        .replace(/í/g, "i")
                        .replace(/á/g, "a")
                      const isActive = activeSection === sectionKey

                      return (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${isActive ? "bg-green-50 border-r-4 border-green-500" : "hover:bg-gray-50"
                            }`}
                          onClick={() => setActiveSection(sectionKey)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${seccion.color}`}>
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className={`font-medium ${isActive ? "text-green-700" : "text-gray-900"}`}>
                                {seccion.nombre}
                              </h3>
                              <p className="text-sm text-gray-500">{seccion.elementos} elementos</p>
                            </div>
                          </div>
                          {isActive && <ChevronRight className="w-5 h-5 text-green-500" />}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contenido Principal */}
            <div className="lg:col-span-3">{renderContent()}</div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CuentaUsuario