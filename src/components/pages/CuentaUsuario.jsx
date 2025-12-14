import TopBar from '../TopBar'
import { calcularDigitoVerificador, limpiarRut, verificarRut } from "../../lib/utils.js";

import { useState, useEffect, useCallback, useMemo } from "react"
import useAxiosPrivate from '@/hooks/useAxiosPrivate'
import useAuth from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/toaster"
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
  UserCog,
  RefreshCw,
} from "lucide-react"
import { API_ROUTES } from '../../api/apiRoutes'

const CuentaUsuario = ({ setIsOpened, isOpened }) => {
  const [activeSection, setActiveSection] = useState("gestiondeusuarios")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRol, setFilterRol] = useState("todos")
  const [filterEstado, setFilterEstado] = useState("todos")
  const [selectedUser, setSelectedUser] = useState(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const { isAdmin } = useAuth()
  const { toast } = useToast()
  // true
  // Determinar el rol del usuario actual basado en el token
  const CURRENT_USER_ROLE = isAdmin ? "Administrador Municipal" : "Jefe de departamento"
  const CURRENT_USER_DEPARTMENT = "Obras Públicas" // Departamento del jefe actual
  const [newUser, setNewUser] = useState({
    nombre: "",
    email: "",
    rut: "",
    numero_telefonico_movil: "",
    tipo_usuario: "",
    departamento_id: "",
    password: "",
    confirmPassword: "",
    enviarCredenciales: true,
    requiereCambioPassword: true,
  })

  // Estado para editar usuario
  const [editUser, setEditUser] = useState({
    id: "",
    nombre: "",
    email: "",
    rut: "",
    numero_telefonico_movil: "",
    tipo_usuario: "",
    departamento_id: "",
    esta_activo: true,
    requiereCambioPassword: false,
  })

  const [usuarios, setUsuarios] = useState([])
  const [departamentos, setDepartamentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState(null)
  const [rutVerificationMessage, setRutVerificationMessage] = useState(null)
  const [emailVerificationMessage, setEmailVerificationMessage] = useState(null)
  const [verifying, setVerifying] = useState({ rut: false, email: false })
  const axiosPrivate = useAxiosPrivate()

  const getPermisosForRole = useCallback((rol) => {
    switch (rol) {
      case "Administrador Municipal":
        return ["Crear", "Editar", "Eliminar", "Configurar", "Gestionar usuarios", "Acceso total"]
      case "Jefe de departamento":
        return ["Crear", "Editar", "Ver reportes", "Gestionar equipo", "Aprobar solicitudes"]
      case "Personal Municipal":
        return ["Crear", "Editar", "Ver reportes"]
      case "Vecino":
        return ["Ver", "Generar reportes"]
      default:
        return ["Ver"]
    }
  }, [])

  // Función para mapear datos de la API al formato esperado por la interfaz
  const mapApiUserToUIUser = useCallback((apiUser) => {
    const rolMapping = {
      'vecino': 'Vecino',
      'personal': 'Personal Municipal',
      'jefe_departamento': 'Jefe de departamento',
      'administrador': 'Administrador Municipal'
    }

    const estadoMapping = {
      true: 'Activo',
      false: 'Inactivo'
    }

    return {
      id: apiUser.id,
      nombre: apiUser.nombre,
      email: apiUser.email,
      telefono: apiUser.numero_telefonico_movil || 'No especificado',
      rut: apiUser.rut,
      rol: apiUser.es_administrador ? 'Administrador Municipal' : (rolMapping[apiUser.tipo_usuario] || 'Vecino'),
      departamento: apiUser.departamento_asignado.nombre || 'No aplica',
      estado: estadoMapping[apiUser.esta_activo],
      fechaCreacion: new Date(apiUser.fecha_registro).toLocaleDateString('es-ES'),
      ultimoAcceso: apiUser.ultimo_acceso ? new Date(apiUser.ultimo_acceso).toLocaleString('es-ES') : 'Nunca',
      permisos: getPermisosForRole(apiUser.es_administrador ? 'Administrador Municipal' : (rolMapping[apiUser.tipo_usuario] || 'Vecino')),
      intentosFallidos: 0, // No disponible en la API
      requiereCambioPassword: false, // Se puede ajustar según necesidades
      esAdministrador: apiUser.es_administrador,
      tipoUsuario: apiUser.tipo_usuario,
      tipoUsuarioDisplay: apiUser.tipo_usuario_display
    }
  }, [getPermisosForRole])

  // Función para obtener departamentos de la API
  const fetchDepartamentos = useCallback(async () => {
    try {
      const response = await axiosPrivate.get(API_ROUTES.DEPARTAMENTOS.ROOT)
      setDepartamentos(response.data.filter(dept => dept.estado === 'habilitado'))
    } catch (err) {
      console.error('Error al obtener departamentos:', err)
    }
  }, [axiosPrivate])

  // Función para obtener usuarios de la API
  const fetchUsuarios = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axiosPrivate.get(`${API_ROUTES.USUARIOS.ROOT}?tipo_usuario=jefe_departamento,personal,administrador`)
      const mappedUsers = response.data.map(mapApiUserToUIUser)
      setUsuarios(mappedUsers)
    } catch (err) {
      console.error('Error al obtener usuarios:', err)
      setError('Error al cargar los usuarios. Por favor, intente nuevamente.')
    } finally {
      setLoading(false)
    }
  }, [axiosPrivate, mapApiUserToUIUser])

  // Cargar usuarios y departamentos al montar el componente
  useEffect(() => {
    fetchUsuarios()
    fetchDepartamentos()
  }, [fetchUsuarios, fetchDepartamentos])

  // Función para obtener RUT sin formato para envío al backend
  const getRutForBackend = useCallback((formattedRut) => {
    if (!formattedRut) return null
    // Remover puntos pero mantener guión y dígito verificador
    return formattedRut.replace(/\./g, '').toLowerCase();
  }, [])

  // Función para verificar RUT en tiempo real
  const checkRutExists = useCallback(async (rut) => {
    if (!rut) {
      setRutVerificationMessage(null)
      return null
    }

    setVerifying(prev => ({ ...prev, rut: true }))
    try {
      const response = await axiosPrivate.post(API_ROUTES.AUTH.VERIFY_USER, { rut: getRutForBackend(rut) })
      const message = !response.data.rut_disponible
        ? `⚠️ Este RUT ya está registrado por: ${response.data.usuario_rut?.nombre || 'otro usuario'}`
        : null
      setRutVerificationMessage(message)
      return message
    } catch (error) {
      console.error('Error al verificar RUT:', error)
      setRutVerificationMessage(null)
      return null
    } finally {
      setVerifying(prev => ({ ...prev, rut: false }))
    }
  }, [axiosPrivate, getRutForBackend])

  // Función para verificar email en tiempo real
  const checkEmailExists = useCallback(async (email) => {
    if (!email) {
      setEmailVerificationMessage(null)
      return null
    }

    setVerifying(prev => ({ ...prev, email: true }))
    try {
      const response = await axiosPrivate.post(API_ROUTES.AUTH.VERIFY_USER, { email: email.toLowerCase() })
      const message = !response.data.email_disponible
        ? `⚠️ Este email ya está registrado por: ${response.data.usuario_email?.nombre || 'otro usuario'}`
        : null
      setEmailVerificationMessage(message)
      return message
    } catch (error) {
      console.error('Error al verificar email:', error)
      setEmailVerificationMessage(null)
      return null
    } finally {
      setVerifying(prev => ({ ...prev, email: false }))
    }
  }, [axiosPrivate])

  // Verificación automática del RUT con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (newUser.rut) {
        checkRutExists(newUser.rut)
      }
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [newUser.rut]) // eslint-disable-line react-hooks/exhaustive-deps

  // Verificación automática del email con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (newUser.email) {
        checkEmailExists(newUser.email)
      }
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [newUser.email]) // eslint-disable-line react-hooks/exhaustive-deps

  const getFilteredUsersForRole = useCallback(() => {
    if (CURRENT_USER_ROLE === "Administrador Municipal") {
      return usuarios
    } else {
      // Jefe de Departamento solo ve usuarios de su departamento
      return usuarios.filter(
        (user) =>
          user.departamento === CURRENT_USER_DEPARTMENT ||
          (user.rol === "Jefe de departamento" && user.departamento === CURRENT_USER_DEPARTMENT),
      )
    }
  }, [usuarios, CURRENT_USER_ROLE, CURRENT_USER_DEPARTMENT])

  const getMyTeamUsers = useCallback(() => {
    return usuarios.filter(
      (user) => user.departamento === CURRENT_USER_DEPARTMENT && user.rol !== "Jefe de departamento",
    )
  }, [usuarios, CURRENT_USER_DEPARTMENT])

  const seccionesUsuarios = useMemo(() => {
    const filteredUsers = getFilteredUsersForRole()
    const myTeamUsers = getMyTeamUsers()

    const baseSections = [
      {
        nombre: "Gestión de Usuarios",
        elementos: filteredUsers.length,
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
          elementos: myTeamUsers.length,
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
  }, [getFilteredUsersForRole, getMyTeamUsers, CURRENT_USER_ROLE])

  const filteredUsers = useMemo(() => {
    return getFilteredUsersForRole().filter((user) => {
      const matchesSearch =
        user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.departamento.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRolFilter = filterRol === "todos" || user.rol === filterRol
      const matchesEstadoFilter = filterEstado === "todos" || user.estado === filterEstado
      return matchesSearch && matchesRolFilter && matchesEstadoFilter
    })
  }, [getFilteredUsersForRole, searchTerm, filterRol, filterEstado])

  // Función para validar si ya existe un usuario con el mismo RUT o email
  const validateUniqueUser = async (rut, email) => {
    try {
      const response = await axiosPrivate.post(API_ROUTES.AUTH.VERIFY_USER, {
        rut: getRutForBackend(rut),
        email: email.toLowerCase()
      })

      if (!response.data.rut_disponible) {
        return {
          isValid: false,
          message: `El RUT ${rut} ya está registrado por: ${response.data.usuario_rut?.nombre || 'otro usuario'}`
        }
      }

      if (!response.data.email_disponible) {
        return {
          isValid: false,
          message: `El email ${email} ya está registrado por: ${response.data.usuario_email?.nombre || 'otro usuario'}`
        }
      }

      return { isValid: true, message: "" }
    } catch (error) {
      console.error('Error al validar usuario único:', error)
      return { isValid: false, message: "Error al verificar la disponibilidad del usuario" }
    }
  }

  // Función para validar si el departamento ya tiene un jefe asignado
  const validateDepartmentChief = (departamentoId, tipoUsuario) => {
    if (tipoUsuario !== 'jefe_departamento') {
      return { isValid: true, message: "" }
    }

    const departamento = departamentos.find(dept => dept.id.toString() === departamentoId)

    if (departamento && departamento.jefe_departamento) {
      return {
        isValid: false,
        message: `El departamento "${departamento.nombre}" ya tiene un jefe asignado: ${departamento.jefe_departamento.nombre}`
      }
    }

    return { isValid: true, message: "" }
  }

  // Función para validar jefe de departamento en edición (excluye al usuario actual)
  const validateDepartmentChiefForEdit = (departamentoId, tipoUsuario, usuarioId) => {
    if (tipoUsuario !== 'jefe_departamento') {
      return { isValid: true, message: "" }
    }

    const departamento = departamentos.find(dept => dept.id.toString() === departamentoId)

    if (departamento && departamento.jefe_departamento && departamento.jefe_departamento.id !== usuarioId) {
      return {
        isValid: false,
        message: `El departamento "${departamento.nombre}" ya tiene un jefe asignado: ${departamento.jefe_departamento.nombre}`
      }
    }

    return { isValid: true, message: "" }
  }

  // Función para verificar si el departamento ya tiene jefe
  const checkDepartmentHasChief = (departamentoId, tipoUsuario) => {
    if (tipoUsuario !== 'jefe_departamento' || !departamentoId) return null
    const departamento = departamentos.find(dept => dept.id.toString() === departamentoId)
    return (departamento && departamento.jefe_departamento) ?
      `⚠️ ${departamento.nombre} ya tiene jefe: ${departamento.jefe_departamento.nombre}` : null
  }

  // Función para formatear el RUT automáticamente para visualización
  const formatRut = useCallback((value) => {
    // Limpiar solo dígitos (el filtrado de kK ya se hace en el handler)
    const cleaned = value.replace(/\D/g, '');

    // Si tiene 1 o menos dígitos, retornarlo tal como está
    if (cleaned.length <= 1) return cleaned;

    // Formatear: tomar todos menos el último dígito, agregar puntos, y agregar guión + último dígito
    let formatted = cleaned.slice(0, -1).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    return formatted + '-' + cleaned.slice(-1);
  }, [])

  // Función para manejar el cambio del RUT con formateo
  const handleRutChange = useCallback((e) => {
    const value = e.target.value.replace(/[^\d\-kK]/g, '');
    const formattedRut = formatRut(value);
    setNewUser(prev => ({ ...prev, rut: formattedRut }));
  }, [formatRut])

  // Función para verificar si las contraseñas coinciden
  const checkPasswordMatch = () => {
    if (!newUser.password || !newUser.confirmPassword) return null;
    return newUser.password !== newUser.confirmPassword ?
      "❌ Las contraseñas no coinciden" : null;
  };

  // Función para validar formato de email
  const validateEmail = (email) => {
    if (!email) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !emailRegex.test(email) ? "❌ Formato de email inválido" : null;
  };

  // Función para validar longitud de campos según modelo backend
  const validateFieldLength = (field, value, maxLength) => {
    if (!value) return null;
    return value.length > maxLength ? `❌ Máximo ${maxLength} caracteres` : null;
  };

  // Función para validar RUT (formato básico)
  const validateRutFormat = (rut) => {
    if (!rut) return null;
    const rutPattern = /^\d{1,8}-[\dkK]$/;
    const cleanRut = getRutForBackend(rut);
    return !rutPattern.test(cleanRut) ? "❌ Formato de RUT inválido" : null;
  };
  // Funcion para validar el RUT segun digito verificador
  const validateRutCheckDigit = (rut) => {
    if (!rut) return null
    if (!verificarRut(rut)) {
      return "❌ RUT invalido (digito verificador no coincide)"
    }
    return null
  }

  // Función para obtener el motivo por el cual el botón está desactivado
  const getDisabledButtonReason = () => {
    if (updating) return "Creando usuario...";
    if (verifying.rut || verifying.email) return "Verificando disponibilidad...";
    if (!newUser.nombre) return "Falta completar el nombre";
    if (validateFieldLength('nombre', newUser.nombre, 120)) return "Nombre demasiado largo";
    if (!newUser.email) return "Falta completar el email";
    if (validateEmail(newUser.email)) return "Formato de email inválido";
    if (validateFieldLength('email', newUser.email, 200)) return "Email demasiado largo";
    if (!newUser.rut) return "Falta completar el RUT";
    if (validateRutFormat(newUser.rut)) return "Formato de RUT inválido";
    if (validateRutCheckDigit(newUser.rut)) return "RUT invalido (digito verificador no coincide)"
    if (!newUser.tipo_usuario) return "Falta seleccionar el tipo de usuario";
    if (!newUser.departamento_id) return "Falta seleccionar un departamento";
    if (!newUser.password) return "Falta completar la contraseña";
    if (!newUser.confirmPassword) return "Falta confirmar la contraseña";
    if (validateFieldLength('telefono', newUser.numero_telefonico_movil, 9)) return "Teléfono demasiado largo";
    if (rutVerificationMessage) return "RUT no disponible";
    if (emailVerificationMessage) return "Email no disponible";
    if (checkDepartmentHasChief(newUser.departamento_id, newUser.tipo_usuario)) return "El departamento ya tiene jefe asignado";
    if (newUser.password !== newUser.confirmPassword) return "Las contraseñas no coinciden";
    if (newUser.password.length < 6) return "La contraseña debe tener al menos 6 caracteres";
    return "Listo para crear usuario";
  };

  // Función para obtener el motivo por el cual el botón de editar está desactivado
  const getDisabledEditButtonReason = () => {
    if (updating) return "Actualizando usuario...";
    if (!editUser.nombre) return "Falta completar el nombre";
    if (validateFieldLength('nombre', editUser.nombre, 120)) return "Nombre demasiado largo";
    if (!editUser.email) return "Falta completar el email";
    if (validateEmail(editUser.email)) return "Formato de email inválido";
    if (validateFieldLength('email', editUser.email, 200)) return "Email demasiado largo";
    if (editUser.rut && validateRutFormat(editUser.rut)) return "Formato de RUT inválido";
     if (editUser.rut && validateRutCheckDigit(editUser.rut)) return "RUT invalido (digito verificador no coincide)"
    if (validateFieldLength('telefono', editUser.numero_telefonico_movil, 9)) return "Teléfono demasiado largo";
    if (editUser.departamento_id && !validateDepartmentChiefForEdit(editUser.departamento_id, editUser.tipo_usuario, editUser.id).isValid) {
      return validateDepartmentChiefForEdit(editUser.departamento_id, editUser.tipo_usuario, editUser.id).message;
    }
    return "Listo para guardar cambios";
  }; const handleCreateUser = async () => {
    // Validaciones básicas
    if (!newUser.nombre || !newUser.email || !newUser.rut || !newUser.tipo_usuario) {
      toast({
        title: "Error de validación",
        description: "Por favor, complete todos los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    if (!newUser.departamento_id) {
      toast({
        title: "Error de validación",
        description: "Por favor, seleccione un departamento",
        variant: "destructive",
      })
      return
    }

    if (newUser.password !== newUser.confirmPassword) {
      toast({
        title: "Error de validación",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      })
      return
    }

    if (newUser.password.length < 6) {
      toast({
        title: "Error de validación",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      })
      return
    }

    // Validación de RUT formato básico (opcional)
    const rutPattern = /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/
    if (!rutPattern.test(newUser.rut)) {
      toast({
        title: "Error de validación",
        description: "Por favor, ingrese el RUT en formato válido (ej: 12.345.678-9)",
        variant: "destructive",
      })
      return
    }

    // Validación de email formato
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(newUser.email)) {
      toast({
        title: "Error de validación",
        description: "Por favor, ingrese un email válido",
        variant: "destructive",
      })
      return
    }

    // Validar si el usuario ya existe
    const uniqueUserValidation = await validateUniqueUser(newUser.rut, newUser.email)
    if (!uniqueUserValidation.isValid) {
      toast({
        title: "Usuario duplicado",
        description: uniqueUserValidation.message,
        variant: "destructive",
      })
      return
    }

    // Validar si el departamento ya tiene jefe asignado
    const departmentChiefValidation = validateDepartmentChief(newUser.departamento_id, newUser.tipo_usuario)
    if (!departmentChiefValidation.isValid) {
      toast({
        title: "Error de asignación",
        description: departmentChiefValidation.message,
        variant: "destructive",
      })
      return
    }

    try {
      setUpdating(true) // Iniciar estado de actualización

      // Preparar datos para enviar a la API
      const userData = {
        nombre: newUser.nombre,
        email: newUser.email,
        rut: getRutForBackend(newUser.rut), // Enviar RUT sin puntos
        numero_telefonico_movil: newUser.numero_telefonico_movil || "",
        tipo_usuario: newUser.tipo_usuario,
        password: newUser.password,
        es_administrador: false,
        esta_activo: true
      }

      // Crear usuario
      const response = await axiosPrivate.post(API_ROUTES.USUARIOS.ROOT, userData)

      // Asignar usuario al departamento
      if (response.data.id) {
        await axiosPrivate.post(API_ROUTES.USUARIO_DEPARTAMENTO.ROOT, {
          usuario: response.data.id,
          departamento: newUser.departamento_id,
          estado: 'activo'
        })
      }

      // Si el usuario es jefe de departamento, asignarlo como jefe
      if (newUser.tipo_usuario === 'jefe_departamento') {
        await axiosPrivate.patch(`${API_ROUTES.DEPARTAMENTOS.ROOT}${newUser.departamento_id}/`, {
          jefe_departamento: response.data.id
        })
      }

      toast({
        title: "Éxito",
        description: "Usuario creado exitosamente",
        duration: 5000,
        className: "bg-green-500 text-white",
      })
      setIsCreateDialogOpen(false)
      resetNewUserForm()

      // Recargar tanto usuarios como departamentos para reflejar cambios
      await Promise.all([
        fetchUsuarios(),
        fetchDepartamentos()
      ])

    } catch (error) {
      console.error('Error al crear usuario:', error)

      // Manejo específico de errores del backend
      if (error.response?.status === 400) {
        const errorData = error.response.data

        // Verificar errores específicos de campos únicos
        if (errorData.rut && Array.isArray(errorData.rut)) {
          toast({
            title: "Error con el RUT",
            description: errorData.rut.join(', '),
            variant: "destructive",
          })
          return
        }

        if (errorData.email && Array.isArray(errorData.email)) {
          toast({
            title: "Error con el email",
            description: errorData.email.join(', '),
            variant: "destructive",
          })
          return
        }

        // Error general de validación
        const errorMessages = Object.entries(errorData)
          .map(([field, messages]) => {
            const fieldName = field === 'rut' ? 'RUT' :
              field === 'email' ? 'Email' :
                field === 'numero_telefonico_movil' ? 'Teléfono' :
                  field.charAt(0).toUpperCase() + field.slice(1)
            return `${fieldName}: ${Array.isArray(messages) ? messages.join(', ') : messages}`
          })
          .join('\n')

        toast({
          title: "Error al crear usuario",
          description: errorMessages,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "Error al crear usuario. Por favor, intente nuevamente.",
          variant: "destructive",
        })
      }
    } finally {
      setUpdating(false) // Finalizar estado de actualización
    }
  }

  const resetNewUserForm = () => {
    setNewUser({
      nombre: "",
      email: "",
      rut: "",
      numero_telefonico_movil: "",
      tipo_usuario: "",
      departamento_id: "",
      password: "",
      confirmPassword: "",
      enviarCredenciales: true,
      requiereCambioPassword: true,
    })
    // Limpiar mensajes de verificación
    setRutVerificationMessage(null)
    setEmailVerificationMessage(null)
    setVerifying({ rut: false, email: false })
  }

  // Funciones para editar usuario
  const openEditDialog = (usuario) => {
    // Buscar el departamento asignado por nombre
    const departamentoAsignado = departamentos.find(dept => dept.nombre === usuario.departamento)

    setEditUser({
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rut: formatRut(usuario.rut) || "",
      numero_telefonico_movil: usuario.telefono === "No especificado" ? "" : usuario.telefono,
      tipo_usuario: usuario.rol === "Administrador Municipal" ? "administrador" :
        usuario.rol === "Jefe de departamento" ? "jefe_departamento" :
          usuario.rol === "Personal Municipal" ? "personal" : "vecino",
      departamento_id: departamentoAsignado?.id?.toString() || "",
      esta_activo: usuario.estado === "Activo",
      requiereCambioPassword: usuario.requiereCambioPassword || false,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateUser = async () => {
    // Validaciones básicas
    if (!editUser.nombre || !editUser.email) {
      toast({
        title: "Error de validación",
        description: "Por favor, complete todos los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    // Validar formato de email
    if (validateEmail(editUser.email)) {
      toast({
        title: "Error de validación",
        description: "El formato del email es inválido",
        variant: "destructive",
      })
      return
    }

    // Validar formato de RUT si se proporciona
    if (editUser.rut && validateRutFormat(editUser.rut)) {
      toast({
        title: "Error de validación",
        description: "El formato del RUT es inválido",
        variant: "destructive",
      })
      return
    }

    // Validar longitudes de campos
    if (validateFieldLength('nombre', editUser.nombre, 120)) {
      toast({
        title: "Error de validación",
        description: "El nombre es demasiado largo (máximo 120 caracteres)",
        variant: "destructive",
      })
      return
    }

    if (validateFieldLength('email', editUser.email, 200)) {
      toast({
        title: "Error de validación",
        description: "El email es demasiado largo (máximo 200 caracteres)",
        variant: "destructive",
      })
      return
    }

    if (validateFieldLength('telefono', editUser.numero_telefonico_movil, 9)) {
      toast({
        title: "Error de validación",
        description: "El teléfono es demasiado largo (máximo 9 dígitos)",
        variant: "destructive",
      })
      return
    }

    // Validar si el departamento ya tiene jefe asignado (excluyendo al usuario actual)
    if (editUser.departamento_id) {
      const departmentChiefValidation = validateDepartmentChiefForEdit(
        editUser.departamento_id,
        editUser.tipo_usuario,
        editUser.id
      )
      if (!departmentChiefValidation.isValid) {
        toast({
          title: "Error de asignación",
          description: departmentChiefValidation.message,
          variant: "destructive",
        })
        return
      }
    }

    try {
      setUpdating(true) // Iniciar estado de actualización

      // PASO 1: Primero manejar la desasignación de jefatura ANTES de cambiar el tipo de usuario
      if (editUser.departamento_id) {
        try {
          // Obtener información actual del usuario desde la UI
          const currentUserData = usuarios.find(u => u.id === editUser.id)
          const currentDepartmentName = currentUserData?.departamento || null
          const currentDepartment = departamentos.find(dept => dept.nombre === currentDepartmentName)
          const currentDepartmentId = currentDepartment?.id.toString()
          const newDepartmentId = editUser.departamento_id.toString()
          const currentRol = currentUserData?.rol || null
          const newRol = editUser.tipo_usuario === 'jefe_departamento' ? 'Jefe de departamento' : 'Personal Municipal'

          console.log('Departamento actual:', currentDepartmentId, 'Nuevo departamento:', newDepartmentId)
          console.log('Rol actual:', currentRol, 'Nuevo rol:', newRol)
          console.log('Tipo de usuario:', editUser.tipo_usuario)

          // Proceder si el departamento cambió O si el tipo de usuario cambió
          const departmentChanged = currentDepartmentId !== newDepartmentId

          // IMPORTANTE: Si el usuario deja de ser jefe, remover PRIMERO la asignación del departamento
          if (currentRol === 'Jefe de departamento' && newRol !== 'Jefe de departamento') {
            // Encontrar el departamento donde era jefe
            const departmentWhereWasChief = departamentos.find(dept =>
              dept.jefe_departamento && dept.jefe_departamento.id === editUser.id
            )

            if (departmentWhereWasChief) {
              await axiosPrivate.patch(`${API_ROUTES.DEPARTAMENTOS.ROOT}${departmentWhereWasChief.id}/`, {
                jefe_departamento: null
              })
              console.log(`✅ PASO 1A: Removida asignación como jefe de departamento en: ${departmentWhereWasChief.nombre}`)
            }
          }

          // IMPORTANTE: Si el usuario cambia de personal a jefe, eliminar su registro de usuario-departamento
          if (currentRol === 'Personal Municipal' && newRol === 'Jefe de departamento') {
            try {
              const currentAssignment = await axiosPrivate.get(`${API_ROUTES.USUARIO_DEPARTAMENTO.ROOT}?usuario=${editUser.id}`)
              const assignments = Array.isArray(currentAssignment.data) ? currentAssignment.data :
                (currentAssignment.data.results || [])

              if (assignments.length > 0) {
                // Finalizar todas las asignaciones actuales en usuario-departamento
                for (const assignment of assignments) {
                  if (assignment.estado === 'activo') {
                    await axiosPrivate.patch(`${API_ROUTES.USUARIO_DEPARTAMENTO.ROOT}${assignment.id}/`, {
                      estado: 'inactivo',
                      fecha_fin_asignacion: new Date().toISOString()
                    })
                    console.log(`✅ PASO 1B: Finalizada asignación usuario-departamento ID: ${assignment.id}`)
                  }
                }
              }
            } catch (assignmentError) {
              console.error('❌ Error al finalizar asignaciones usuario-departamento:', assignmentError)
            }
          }

          // Si cambió a un departamento diferente y era jefe del anterior, también remover esa asignación
          if (departmentChanged && currentUserData?.rol === 'Jefe de departamento' && currentDepartment && currentDepartment.id !== parseInt(newDepartmentId)) {
            await axiosPrivate.patch(`${API_ROUTES.DEPARTAMENTOS.ROOT}${currentDepartment.id}/`, {
              jefe_departamento: null
            })
            console.log('✅ PASO 1C: Removida asignación anterior como jefe de departamento por cambio de departamento')
          }

        } catch (preUpdateError) {
          console.error('❌ Error en PASO 1 (pre-actualización):', preUpdateError)
          // Continuar con el proceso, pero registrar el error
        }
      }

      // PASO 2: Actualizar los datos básicos del usuario
      const updateData = {
        nombre: editUser.nombre,
        email: editUser.email,
        numero_telefonico_movil: editUser.numero_telefonico_movil || "",
        tipo_usuario: editUser.tipo_usuario,
        esta_activo: editUser.esta_activo,
      }

      // Solo incluir RUT si se proporcionó
      if (editUser.rut) {
        updateData.rut = getRutForBackend(editUser.rut)
      }

      // Actualizar usuario
      await axiosPrivate.patch(`${API_ROUTES.USUARIOS.ROOT}${editUser.id}/`, updateData)
      console.log('✅ PASO 2: Usuario actualizado exitosamente')

      // PASO 3: Manejar las nuevas asignaciones de departamento
      if (editUser.departamento_id) {
        try {
          // Obtener información actualizada
          const currentUserData = usuarios.find(u => u.id === editUser.id)
          const currentDepartmentName = currentUserData?.departamento || null
          const currentDepartment = departamentos.find(dept => dept.nombre === currentDepartmentName)
          const currentDepartmentId = currentDepartment?.id.toString()
          const newDepartmentId = editUser.departamento_id.toString()
          const newRol = editUser.tipo_usuario === 'jefe_departamento' ? 'Jefe de departamento' : 'Personal Municipal'

          const departmentChanged = currentDepartmentId !== newDepartmentId
          const roleChanged = currentUserData?.rol !== newRol

          // Solo proceder si hay cambios que procesar
          if (departmentChanged || roleChanged) {

            // Manejar asignaciones según el nuevo tipo de usuario
            if (editUser.tipo_usuario === 'jefe_departamento') {
              // Para jefe de departamento: actualizar directamente en la tabla departamentos
              await axiosPrivate.patch(`${API_ROUTES.DEPARTAMENTOS.ROOT}${editUser.departamento_id}/`, {
                jefe_departamento: editUser.id
              })
              console.log('✅ PASO 3A: Usuario asignado como jefe de departamento')

              // Solo crear registro en usuario-departamento si cambió de departamento
              // (no si cambió de personal a jefe en el mismo departamento)
              if (departmentChanged) {
                const currentAssignment = await axiosPrivate.get(`${API_ROUTES.USUARIO_DEPARTAMENTO.ROOT}?usuario=${editUser.id}`)
                const assignments = Array.isArray(currentAssignment.data) ? currentAssignment.data :
                  (currentAssignment.data.results || [])

                // Crear nueva asignación solo si cambió el departamento
                const needsNewAssignment = assignments.length === 0 ||
                  assignments.every(a => a.estado !== 'activo' || a.departamento.id.toString() !== editUser.departamento_id.toString())

                if (needsNewAssignment) {
                  await axiosPrivate.post(API_ROUTES.USUARIO_DEPARTAMENTO.ROOT, {
                    usuario: editUser.id,
                    departamento: editUser.departamento_id,
                    estado: 'activo'
                  })
                  console.log('✅ PASO 3A: Asignación en usuario-departamento creada para jefe (cambio de departamento)')
                }
              } else {
                console.log('✅ PASO 3A: Jefe asignado al mismo departamento, no se crea registro usuario-departamento')
              }

            } else {
              // Para personal municipal: usar solo usuario-departamento
              const currentAssignment = await axiosPrivate.get(`${API_ROUTES.USUARIO_DEPARTAMENTO.ROOT}?usuario=${editUser.id}`)
              const assignments = Array.isArray(currentAssignment.data) ? currentAssignment.data :
                (currentAssignment.data.results || [])

              console.log('Asignaciones actuales:', assignments)

              // Si hay asignaciones activas y cambió el departamento, finalizarlas
              if (assignments.length > 0 && departmentChanged) {
                const activeAssignments = assignments.filter(a => a.estado === 'activo')
                for (const assignment of activeAssignments) {
                  await axiosPrivate.patch(`${API_ROUTES.USUARIO_DEPARTAMENTO.ROOT}${assignment.id}/`, {
                    estado: 'inactivo',
                    fecha_fin_asignacion: new Date().toISOString()
                  })
                  console.log(`✅ PASO 3B: Finalizada asignación previa ID: ${assignment.id}`)
                }
              }

              // Para usuarios que cambian a "Personal", asegurar asignación activa
              if (editUser.tipo_usuario === 'personal') {
                // Buscar si ya existe un registro para este usuario y departamento
                const existingAssignment = assignments.find(
                  a => a.departamento.id.toString() === editUser.departamento_id.toString()
                )

                if (existingAssignment) {
                  // Si existe pero está inactivo, reactivarlo
                  if (existingAssignment.estado === 'inactivo') {
                    await axiosPrivate.patch(`${API_ROUTES.USUARIO_DEPARTAMENTO.ROOT}${existingAssignment.id}/`, {
                      estado: 'activo',
                      fecha_fin_asignacion: null
                    })
                    console.log('✅ PASO 3B: Asignación existente reactivada para personal municipal')
                  } else {
                    console.log('✅ PASO 3B: Usuario ya tiene asignación activa en el departamento objetivo')
                  }
                } else {
                  // Si no existe registro, crear uno nuevo
                  await axiosPrivate.post(API_ROUTES.USUARIO_DEPARTAMENTO.ROOT, {
                    usuario: editUser.id,
                    departamento: editUser.departamento_id,
                    estado: 'activo'
                  })
                  console.log('✅ PASO 3B: Nueva asignación de departamento creada para personal municipal')
                }
              }
            }
          } else {
            console.log('✅ Ni el departamento ni el rol cambiaron, no se actualiza la asignación')
          }
        } catch (assignmentError) {
          console.error('❌ Error en PASO 3 (post-actualización):', assignmentError)
          // No interrumpir el proceso por errores de asignación
        }
      }

      toast({
        title: "Éxito",
        description: "Usuario actualizado exitosamente",
        duration: 5000,
        className: "bg-green-500 text-white",
      })
      setIsEditDialogOpen(false)
      resetEditUserForm()

      // PASO 4: Recargar tanto usuarios como departamentos para reflejar cambios
      await Promise.all([
        fetchUsuarios(),
        fetchDepartamentos()
      ])
      console.log('✅ PASO 4: Datos recargados exitosamente')

    } catch (error) {
      console.error('Error al actualizar usuario:', error)

      if (error.response?.data) {
        const errorData = error.response.data

        // Manejar errores específicos
        if (errorData.rut) {
          toast({
            title: "Error con el RUT",
            description: Array.isArray(errorData.rut) ? errorData.rut.join(', ') : errorData.rut,
            variant: "destructive",
          })
          return
        }

        if (errorData.email) {
          toast({
            title: "Error con el email",
            description: Array.isArray(errorData.email) ? errorData.email.join(', ') : errorData.email,
            variant: "destructive",
          })
          return
        }

        // Error general de validación
        const errorMessages = Object.entries(errorData)
          .map(([field, messages]) => {
            const fieldName = field === 'rut' ? 'RUT' :
              field === 'email' ? 'Email' :
                field === 'numero_telefonico_movil' ? 'Teléfono' :
                  field.charAt(0).toUpperCase() + field.slice(1)
            return `${fieldName}: ${Array.isArray(messages) ? messages.join(', ') : messages}`
          })
          .join('\n')

        toast({
          title: "Error al actualizar usuario",
          description: errorMessages,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "Error al actualizar usuario. Por favor, intente nuevamente.",
          variant: "destructive",
        })
      }
    } finally {
      setUpdating(false) // Finalizar estado de actualización
    }
  }

  const resetEditUserForm = () => {
    setEditUser({
      id: "",
      nombre: "",
      email: "",
      rut: "",
      numero_telefonico_movil: "",
      tipo_usuario: "",
      departamento_id: "",
      esta_activo: true,
      requiereCambioPassword: false,
    })
  }

  // Funciones para eliminar usuario
  const openDeleteDialog = (usuario) => {
    setUserToDelete(usuario)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    try {
      setUpdating(true)

      // Verificar si el usuario tiene dependencias críticas
      const canDelete = await validateUserDeletion(userToDelete)
      if (!canDelete.isValid) {
        toast({
          title: "No se puede eliminar",
          description: canDelete.message,
          variant: "destructive",
        })
        return
      }

      // Eliminar usuario
      await axiosPrivate.delete(`${API_ROUTES.USUARIOS.ROOT}${userToDelete.id}/`)

      toast({
        title: "Éxito",
        description: "Usuario eliminado exitosamente",
        duration: 5000,
        className: "bg-green-500 text-white",
      })
      setIsDeleteDialogOpen(false)
      setUserToDelete(null)

      // Recargar tanto usuarios como departamentos para reflejar cambios
      await Promise.all([
        fetchUsuarios(),
        fetchDepartamentos()
      ])

    } catch (error) {
      console.error('Error al eliminar usuario:', error)

      if (error.response?.status === 400) {
        toast({
          title: "Error",
          description: "No se puede eliminar el usuario porque tiene dependencias activas.",
          variant: "destructive",
        })
      } else if (error.response?.status === 403) {
        toast({
          title: "Sin permisos",
          description: "No tienes permisos para eliminar este usuario.",
          variant: "destructive",
        })
      } else if (error.response?.status === 404) {
        toast({
          title: "Usuario no encontrado",
          description: "El usuario no existe o ya fue eliminado.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "Error al eliminar usuario. Por favor, intente nuevamente.",
          variant: "destructive",
        })
      }
    } finally {
      setUpdating(false)
    }
  }

  const validateUserDeletion = async (usuario) => {
    // Verificar si es el último administrador
    const adminUsers = usuarios.filter(u => u.rol === "Administrador Municipal" && u.estado === "Activo")
    if (usuario.rol === "Administrador Municipal" && adminUsers.length <= 1) {
      return {
        isValid: false,
        message: "No se puede eliminar el último administrador del sistema."
      }
    }

    // Verificar si es jefe de departamento con departamento asignado
    if (usuario.rol === "Jefe de departamento") {
      const departamento = departamentos.find(dept =>
        dept.jefe_departamento?.id === usuario.id
      )
      if (departamento) {
        return {
          isValid: false,
          message: `No se puede eliminar al jefe del departamento "${departamento.nombre}". Asigne otro jefe primero.`
        }
      }
    }

    return { isValid: true, message: "" }
  }

  // Función para manejar el cambio del RUT en edición
  const handleEditRutChange = (e) => {
    const value = e.target.value.replace(/[^\d\-kK]/g, '');
    const formattedRut = formatRut(value)
    setEditUser({ ...editUser, rut: formattedRut })
  }

  const getRolIcon = (rol) => {
    switch (rol) {
      case "Administrador Municipal":
        return <Shield className="w-4 h-4" />
      case "Jefe de departamento":
        return <ShieldCheck className="w-4 h-4" />
      case "Personal Municipal":
        return <Edit className="w-4 h-4" />
      case "Vecino":
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
      case "Jefe de departamento":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "Personal Municipal":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Vecino":
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

  const renderGestionUsuarios = () => {
    // Mostrar loading
    if (loading) {
      return (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando usuarios...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    // Mostrar error
    if (error) {
      return (
        <div className="space-y-6">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-red-200 rounded-full p-3 flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-red-800" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Error al cargar usuarios</h3>
                  <p className="text-red-800 mb-4">{error}</p>
                  <Button
                    onClick={fetchUsuarios}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Reintentar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Card explicativa */}
        <Card className="bg-gradient-to-r from-pink-50 to-pink-100 border-pink-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <XCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-red-600">
                    {filteredUsers.filter((u) => u.estado === "Inactivo").length}
                  </p>
                  <p className="text-sm text-gray-600">Usuarios Inactivos</p>
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchUsuarios}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Cargando...' : 'Refrescar'}
                </Button>
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
                      <DialogDescription>
                        Complete los datos del nuevo usuario municipal. Los campos marcados con asterisco (*) son obligatorios.
                      </DialogDescription>
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
                              maxLength={120}
                            />
                            {validateFieldLength('nombre', newUser.nombre, 120) && (
                              <p className="text-xs text-red-500 mt-1">
                                {validateFieldLength('nombre', newUser.nombre, 120)}
                              </p>
                            )}
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
                              maxLength={200}
                            />
                            {emailVerificationMessage && (
                              <p className="text-xs text-red-500 mt-1">
                                {emailVerificationMessage}
                              </p>
                            )}
                            {validateEmail(newUser.email) && (
                              <p className="text-xs text-red-500 mt-1">
                                {validateEmail(newUser.email)}
                              </p>
                            )}
                            {validateFieldLength('email', newUser.email, 200) && (
                              <p className="text-xs text-red-500 mt-1">
                                {validateFieldLength('email', newUser.email, 200)}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="rut">RUT *</Label>
                            <Input
                              id="rut"
                              value={newUser.rut}
                              onChange={handleRutChange}
                              placeholder="12.345.678-9"
                              className="mt-1"
                              maxLength={12}
                            />
                            {rutVerificationMessage && (
                              <p className="text-xs text-red-500 mt-1">
                                {rutVerificationMessage}
                              </p>
                            )}
                            {validateRutFormat(newUser.rut) && (
                              <p className="text-xs text-red-500 mt-1">
                                {validateRutFormat(newUser.rut)}
                              </p>
                            )}
                            {validateRutCheckDigit(newUser.rut) && (
                              <p className="text-xs text-red-500 mt-1">
                                {validateRutCheckDigit(newUser.rut)}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Formato: 12.345.678-9 o 12.345.678-k
                            </p>
                          </div>
                          <div>
                            <Label htmlFor="telefono">Teléfono Móvil</Label>
                            <Input
                              id="telefono"
                              value={newUser.numero_telefonico_movil}
                              onChange={(e) => setNewUser({ ...newUser, numero_telefonico_movil: e.target.value.replace(/\D/g, '') })}
                              placeholder="987654321"
                              className="mt-1"
                              maxLength={9}
                            />
                            {validateFieldLength('telefono', newUser.numero_telefonico_movil, 9) && (
                              <p className="text-xs text-red-500 mt-1">
                                {validateFieldLength('telefono', newUser.numero_telefonico_movil, 9)}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Solo números, máximo 9 dígitos
                            </p>
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
                            <Label htmlFor="tipo_usuario">Tipo de Usuario *</Label>
                            <Select value={newUser.tipo_usuario} onValueChange={(value) => setNewUser({ ...newUser, tipo_usuario: value })}>
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Seleccionar tipo de usuario" />
                              </SelectTrigger>
                              <SelectContent>
                                {CURRENT_USER_ROLE === "Administrador Municipal" && (
                                  <SelectItem value="jefe_departamento">
                                    <div className="flex items-center gap-2">
                                      <ShieldCheck className="w-4 h-4" />
                                      Jefe de departamento
                                    </div>
                                  </SelectItem>
                                )}
                                <SelectItem value="personal">
                                  <div className="flex items-center gap-2">
                                    <Edit className="w-4 h-4" />
                                    Personal Municipal
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="departamento">Departamento *</Label>
                            <Select
                              value={newUser.departamento_id}
                              onValueChange={(value) => setNewUser({ ...newUser, departamento_id: value })}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Seleccionar departamento" />
                              </SelectTrigger>
                              <SelectContent>
                                {departamentos.map((dept) => (
                                  <SelectItem key={dept.id} value={dept.id.toString()}>
                                    {dept.nombre}
                                    {dept.jefe_departamento && (
                                      <span className="text-xs text-gray-500 ml-2">
                                        (Jefe: {dept.jefe_departamento.nombre})
                                      </span>
                                    )}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {checkDepartmentHasChief(newUser.departamento_id, newUser.tipo_usuario) && (
                              <p className="text-xs text-red-500 mt-1">
                                {checkDepartmentHasChief(newUser.departamento_id, newUser.tipo_usuario)}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              El usuario será asignado a este departamento
                            </p>
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
                              placeholder="Mínimo 6 caracteres"
                              className="mt-1"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Debe contener al menos 6 caracteres
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
                            {checkPasswordMatch() && (
                              <p className="text-xs text-red-500 mt-1">
                                {checkPasswordMatch()}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* <div className="space-y-4 mt-4">
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
                        </div> */}
                      </div>

                      {/* Permisos Preview */}
                      {newUser.tipo_usuario && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            Permisos del Tipo de Usuario Seleccionado
                          </h3>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex flex-wrap gap-2">
                              {getPermisosForRole(
                                newUser.tipo_usuario === 'jefe_departamento' ? 'Jefe de departamento' :
                                  newUser.tipo_usuario === 'personal' ? 'Personal Municipal' : ''
                              ).map((permiso, index) => (
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
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={handleCreateUser}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={
                              updating ||
                              !newUser.nombre ||
                              !newUser.email ||
                              !newUser.rut ||
                              !newUser.tipo_usuario ||
                              !newUser.departamento_id ||
                              !newUser.password ||
                              !newUser.confirmPassword ||
                              validateFieldLength('nombre', newUser.nombre, 120) ||
                              validateEmail(newUser.email) ||
                              validateFieldLength('email', newUser.email, 200) ||
                              validateRutFormat(newUser.rut) ||
                              validateRutCheckDigit(newUser.rut) ||
                              validateFieldLength('telefono', newUser.numero_telefonico_movil, 9) ||
                              rutVerificationMessage ||
                              emailVerificationMessage ||
                              checkDepartmentHasChief(newUser.departamento_id, newUser.tipo_usuario) ||
                              newUser.password !== newUser.confirmPassword ||
                              newUser.password.length < 6
                            }
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            {updating ? "Creando..." : "Crear Usuario"}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{getDisabledButtonReason()}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Diálogo de Edición de Usuario */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Edit className="w-5 h-5" />
                        Editar Usuario
                      </DialogTitle>
                      <DialogDescription>
                        Modifique los datos del usuario. Los campos marcados con asterisco (*) son obligatorios.
                      </DialogDescription>
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
                            <Label htmlFor="edit-nombre">Nombre Completo *</Label>
                            <Input
                              id="edit-nombre"
                              value={editUser.nombre}
                              onChange={(e) => setEditUser({ ...editUser, nombre: e.target.value })}
                              placeholder="Ej: María González"
                              className="mt-1"
                              maxLength={120}
                            />
                            {validateFieldLength('nombre', editUser.nombre, 120) && (
                              <p className="text-xs text-red-500 mt-1">
                                {validateFieldLength('nombre', editUser.nombre, 120)}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="edit-email">Email Corporativo *</Label>
                            <Input
                              id="edit-email"
                              type="email"
                              value={editUser.email}
                              onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                              placeholder="usuario@municipio.gov"
                              className="mt-1"
                              maxLength={200}
                            />
                            {validateEmail(editUser.email) && (
                              <p className="text-xs text-red-500 mt-1">
                                {validateEmail(editUser.email)}
                              </p>
                            )}
                            {validateFieldLength('email', editUser.email, 200) && (
                              <p className="text-xs text-red-500 mt-1">
                                {validateFieldLength('email', editUser.email, 200)}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="edit-rut">RUT</Label>
                            <Input
                              id="edit-rut"
                              value={editUser.rut}
                              onChange={handleEditRutChange}
                              placeholder="12.345.678-9"
                              className="mt-1"
                              maxLength={12}
                            />
                            {validateRutFormat(editUser.rut) && (
                              <p className="text-xs text-red-500 mt-1">
                                {validateRutFormat(editUser.rut)}
                              </p>
                            )}
                            {validateRutCheckDigit(newUser.rut) && (
                              <p className="text-xs text-red-500 mt-1">
                                {validateRutCheckDigit(newUser.rut)}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Formato: 12.345.678-9 o 12.345.678-k
                            </p>
                          </div>
                          <div>
                            <Label htmlFor="edit-telefono">Teléfono Móvil</Label>
                            <Input
                              id="edit-telefono"
                              value={editUser.numero_telefonico_movil}
                              onChange={(e) => setEditUser({ ...editUser, numero_telefonico_movil: e.target.value.replace(/\D/g, '') })}
                              placeholder="987654321"
                              className="mt-1"
                              maxLength={9}
                            />
                            {validateFieldLength('telefono', editUser.numero_telefonico_movil, 9) && (
                              <p className="text-xs text-red-500 mt-1">
                                {validateFieldLength('telefono', editUser.numero_telefonico_movil, 9)}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Solo números, máximo 9 dígitos
                            </p>
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
                            <Label htmlFor="edit-tipo_usuario">Tipo de Usuario *</Label>
                            <Select value={editUser.tipo_usuario} onValueChange={(value) => setEditUser({ ...editUser, tipo_usuario: value })}>
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Seleccionar tipo de usuario" />
                              </SelectTrigger>
                              <SelectContent>
                                {CURRENT_USER_ROLE === "Administrador Municipal" && (
                                  <SelectItem value="jefe_departamento">
                                    <div className="flex items-center gap-2">
                                      <ShieldCheck className="w-4 h-4" />
                                      Jefe de departamento
                                    </div>
                                  </SelectItem>
                                )}
                                <SelectItem value="personal">
                                  <div className="flex items-center gap-2">
                                    <Edit className="w-4 h-4" />
                                    Personal Municipal
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="edit-departamento">Departamento</Label>
                            <Select
                              value={editUser.departamento_id}
                              onValueChange={(value) => setEditUser({ ...editUser, departamento_id: value })}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Seleccionar departamento" />
                              </SelectTrigger>
                              <SelectContent>
                                {departamentos.map((dept) => {
                                  const hasChief = dept.jefe_departamento && dept.jefe_departamento.id !== editUser.id
                                  const wouldConflict = editUser.tipo_usuario === 'jefe_departamento' && hasChief

                                  return (
                                    <SelectItem
                                      key={dept.id}
                                      value={dept.id.toString()}
                                      disabled={wouldConflict}
                                      className={wouldConflict ? "text-gray-400" : ""}
                                    >
                                      <div className="flex items-center justify-between w-full">
                                        <span>{dept.nombre}</span>
                                        {dept.jefe_departamento && (
                                          <span className="text-xs text-gray-500 ml-2">
                                            {dept.jefe_departamento.id === editUser.id ?
                                              "(Jefe actual: Usted)" :
                                              `(Jefe: ${dept.jefe_departamento.nombre})`
                                            }
                                          </span>
                                        )}
                                        {wouldConflict && (
                                          <span className="text-xs text-red-500 ml-2">⚠️</span>
                                        )}
                                      </div>
                                    </SelectItem>
                                  )
                                })}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 mt-1">
                              Cambiará la asignación del usuario
                            </p>
                            {editUser.tipo_usuario === 'jefe_departamento' && editUser.departamento_id && (
                              (() => {
                                const validation = validateDepartmentChiefForEdit(
                                  editUser.departamento_id,
                                  editUser.tipo_usuario,
                                  editUser.id
                                )
                                return !validation.isValid ? (
                                  <p className="text-xs text-red-500 mt-1">
                                    ⚠️ {validation.message}
                                  </p>
                                ) : null
                              })()
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Configuración de Cuenta */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Key className="w-5 h-5" />
                          Configuración de Cuenta
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Usuario activo</Label>
                              <p className="text-sm text-gray-500">
                                Determina si el usuario puede acceder al sistema
                              </p>
                            </div>
                            <Switch
                              checked={editUser.esta_activo}
                              onCheckedChange={(checked) => setEditUser({ ...editUser, esta_activo: checked })}
                            />
                          </div>
                          {/* <div className="flex items-center justify-between">
                            <div>
                              <Label>Requerir cambio de contraseña</Label>
                              <p className="text-sm text-gray-500">
                                El usuario deberá cambiar la contraseña en el próximo acceso
                              </p>
                            </div>
                            <Switch
                              checked={editUser.requiereCambioPassword}
                              onCheckedChange={(checked) => setEditUser({ ...editUser, requiereCambioPassword: checked })}
                            />
                          </div> */}
                        </div>
                      </div>

                      {/* Permisos Preview */}
                      {editUser.tipo_usuario && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            Permisos del Tipo de Usuario Seleccionado
                          </h3>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex flex-wrap gap-2">
                              {getPermisosForRole(
                                editUser.tipo_usuario === 'jefe_departamento' ? 'Jefe de departamento' :
                                  editUser.tipo_usuario === 'personal' ? 'Personal Municipal' : ''
                              ).map((permiso, index) => (
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
                          setIsEditDialogOpen(false)
                          resetEditUserForm()
                        }}
                      >
                        Cancelar
                      </Button>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={handleUpdateUser}
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={
                              updating ||
                              !editUser.nombre ||
                              !editUser.email ||
                              validateFieldLength('nombre', editUser.nombre, 120) ||
                              validateEmail(editUser.email) ||
                              validateFieldLength('email', editUser.email, 200) ||
                              (editUser.rut && validateRutFormat(editUser.rut)) ||
                              (editUser.rut && validateRutCheckDigit(editUser.rut)) ||
                              validateFieldLength('telefono', editUser.numero_telefonico_movil, 9) ||
                              (editUser.departamento_id && !validateDepartmentChiefForEdit(
                                editUser.departamento_id,
                                editUser.tipo_usuario,
                                editUser.id
                              ).isValid)
                            }
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            {updating ? "Actualizando..." : "Actualizar Usuario"}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{getDisabledEditButtonReason()}</p>
                        </TooltipContent>
                      </Tooltip>
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
                  <SelectItem value="Jefe de departamento">Jefe de departamento</SelectItem>
                  <SelectItem value="Personal Municipal">Personal Municipal</SelectItem>
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

            {/* Tabla de usuarios mejorada */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b">
                <div className="grid grid-cols-16 gap-4 text-sm font-medium text-gray-700">
                  <div className="col-span-5">Usuario</div>
                  <div className="col-span-3 hidden md:block">Rol</div>
                  <div className="col-span-2 hidden lg:block">Departamento</div>
                  <div className="col-span-2 hidden lg:block">Estado</div>
                  <div className="col-span-2 hidden xl:block">Último Acceso</div>
                  <div className="col-span-2 md:col-span-11 lg:col-span-6 xl:col-span-2">Acciones</div>
                </div>
              </div>
              <div className="divide-y">
                {filteredUsers.map((usuario) => (
                  <div key={usuario.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="grid grid-cols-16 gap-4 items-center">
                      <div className="col-span-5">
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900 flex items-center gap-2">
                            <span className="truncate">{usuario.nombre}</span>
                            {usuario.requiereCambioPassword && (
                              <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" title="Requiere cambio de contraseña" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500 truncate" title={usuario.email}>
                            {usuario.email}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            {usuario.rut && (
                              <span>RUT: {formatRut(usuario.rut)}</span>
                            )}
                            {usuario.telefono && usuario.telefono !== 'No especificado' && (
                              <span>Tel: {usuario.telefono}</span>
                            )}
                          </div>
                          {usuario.intentosFallidos > 0 && (
                            <div className="text-xs text-red-500">{usuario.intentosFallidos} intentos fallidos</div>
                          )}
                          {/* Mostrar rol, departamento y estado en móvil */}
                          <div className="flex flex-wrap gap-2 md:hidden mt-2">
                            <Badge className={`${getRolColor(usuario.rol)} flex items-center gap-1 w-fit border text-xs`}>
                              {getRolIcon(usuario.rol)}
                              <span className="truncate">{usuario.rol}</span>
                            </Badge>
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs truncate">
                              {usuario.departamento}
                            </Badge>
                            <Badge className={`${getEstadoColor(usuario.estado)} flex items-center gap-1 w-fit border text-xs`}>
                              {getEstadoIcon(usuario.estado)}
                              {usuario.estado}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-3 hidden md:block">
                        <Badge className={`${getRolColor(usuario.rol)} flex items-center gap-1 w-fit border text-xs`}>
                          {getRolIcon(usuario.rol)}
                          <span className="truncate">{usuario.rol}</span>
                        </Badge>
                      </div>
                      <div className="col-span-2 hidden lg:block">
                        <span className="text-sm text-gray-600 truncate" title={usuario.departamento}>
                          {usuario.departamento}
                        </span>
                      </div>
                      <div className="col-span-2 hidden lg:block">
                        <Badge className={`${getEstadoColor(usuario.estado)} flex items-center gap-1 w-fit border text-xs`}>
                          {getEstadoIcon(usuario.estado)}
                          {usuario.estado}
                        </Badge>
                      </div>
                      <div className="col-span-2 hidden xl:block">
                        <span className="text-sm text-gray-600 truncate" title={usuario.ultimoAcceso}>
                          {usuario.ultimoAcceso}
                        </span>
                      </div>
                      <div className="col-span-2 md:col-span-11 lg:col-span-6 xl:col-span-2">
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" onClick={() => setSelectedUser(usuario)} title="Ver detalles">
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
                                  <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="info">Información</TabsTrigger>
                                    <TabsTrigger value="permisos">Permisos</TabsTrigger>
                                    {/* <TabsTrigger value="actividad">Actividad</TabsTrigger>
                                    <TabsTrigger value="seguridad">Seguridad</TabsTrigger> */}
                                  </TabsList>
                                  <TabsContent value="info" className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                      <div className="space-y-4">
                                        <div>
                                          <Label className="text-sm font-medium text-gray-700">Nombre Completo</Label>
                                          <p className="text-lg font-semibold">{selectedUser.nombre}</p>
                                        </div>
                                        {selectedUser.rut && (
                                          <div>
                                            <Label className="text-sm font-medium text-gray-700">RUT</Label>
                                            <p className="text-sm font-medium">{selectedUser.rut}</p>
                                          </div>
                                        )}
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
                          {/* Mostrar botones de editar y eliminar con permisos apropiados */}
                          {(CURRENT_USER_ROLE === "Administrador Municipal" ||
                            (CURRENT_USER_ROLE === "Jefe de Departamento" &&
                              usuario.departamento === CURRENT_USER_DEPARTMENT &&
                              usuario.rol !== "Jefe de Departamento")) && (
                              <>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      disabled={usuario.rol === "Administrador Municipal"}
                                      onClick={() => usuario.rol !== "Administrador Municipal" && openEditDialog(usuario)}
                                      className={usuario.rol === "Administrador Municipal" ? "opacity-50 cursor-not-allowed" : ""}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{usuario.rol === "Administrador Municipal" ? "No se puede editar una cuenta de Administrador Municipal" : "Editar usuario"}</p>
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      disabled={usuario.rol === "Administrador Municipal"}
                                      onClick={() => usuario.rol !== "Administrador Municipal" && openDeleteDialog(usuario)}
                                      className={usuario.rol === "Administrador Municipal" ?
                                        "opacity-50 cursor-not-allowed" :
                                        "text-red-600 hover:text-red-700 hover:border-red-300"}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{usuario.rol === "Administrador Municipal" ? "No se puede eliminar una cuenta de Administrador Municipal" : "Eliminar usuario"}</p>
                                  </TooltipContent>
                                </Tooltip>
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
  }

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
                Usuarios activos: {usuarios.filter((u) => u.rol === "Jefe de departamento").length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Edit className="w-5 h-5" />
              Personal Municipal
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
                Usuarios activos: {usuarios.filter((u) => u.rol === "Personal Municipal").length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Eye className="w-5 h-5" />
              Vecino
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
                Usuarios activos: {usuarios.filter((u) => u.rol === "Vecino").length}
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
                  <th className="text-center p-2">Personal Municipal</th>
                  <th className="text-center p-2">Vecino</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    modulo: "Gestión de Usuarios",
                    admin: "Total",
                    jefe: "Departamento",
                    personal: "No",
                    vecino: "No",
                  },
                  {
                    modulo: "Juntas Vecinales",
                    admin: "Total",
                    jefe: "Departamento",
                    personal: "Editar",
                    vecino: "Ver",
                  },
                  { modulo: "Mapas", admin: "Total", jefe: "Ver/Editar", personal: "Ver/Editar", vecino: "Ver" },
                  { modulo: "Reportes", admin: "Total", jefe: "Departamento", personal: "Básicos", vecino: "Ver" },
                  { modulo: "Configuración", admin: "Total", jefe: "No", personal: "No", vecino: "No" },
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
                      <Badge className="bg-blue-100 text-blue-800">{row.personal}</Badge>
                    </td>
                    <td className="p-2 text-center">
                      <Badge className="bg-green-100 text-green-800">{row.vecino}</Badge>
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
      case "gestiondeusuarios":
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
    <TooltipProvider>
      <TopBar title="Cuentas de Usuario" optionalbg="bg-[#00A86B]" handleOpenSidebar={handleOpenSidebar} />
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Panel de Gestión de Usuarios</h1>
          <p className="text-gray-600">
            {CURRENT_USER_ROLE === "Administrador Municipal"
              ? "Gestión integral de usuarios del sistema municipal"
              : `Gestión de usuarios del departamento de ${CURRENT_USER_DEPARTMENT}`}
          </p>
        </div>

        {/* Layout principal mejorado */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Sidebar de Secciones - Más compacto */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Secciones</CardTitle>
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
                      <button
                        key={index}
                        onClick={() => setActiveSection(sectionKey)}
                        className={`w-full text-left p-4 flex items-center gap-3 transition-colors ${isActive
                          ? "bg-green-50 border-r-4 border-green-600 text-green-700"
                          : "hover:bg-gray-50 text-gray-700"
                          }`}
                      >
                        <div className={`p-2 rounded-lg ${isActive ? "bg-green-100" : seccion.color}`}>
                          <IconComponent className={`w-4 h-4 ${isActive ? "text-green-600" : ""}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-medium text-sm ${isActive ? "text-green-700" : "text-gray-900"}`}>
                            {seccion.nombre}
                          </h3>
                          <p className="text-xs text-gray-500">{seccion.elementos} elementos</p>
                        </div>
                        {isActive && <ChevronRight className="w-4 h-4 text-green-500" />}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contenido Principal - Más espacio */}
          <div className="lg:col-span-4">{renderContent()}</div>
        </div>

        {/* Alert Dialog para confirmar eliminación */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
              <AlertDialogDescription>
                {userToDelete && (
                  <div className="space-y-2">
                    <p>¿Estás seguro de que deseas eliminar al usuario <strong>{userToDelete.nombre} {userToDelete.apellido}</strong>?</p>
                    <p>RUT: {userToDelete.rut}</p>
                    <p>Email: {userToDelete.email}</p>
                    <p className="text-red-600 font-medium mt-3">Esta acción no se puede deshacer.</p>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteUser}
                className="bg-red-600 hover:bg-red-700"
              >
                Eliminar usuario
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <Toaster />
    </TooltipProvider>
  )
}

export default CuentaUsuario