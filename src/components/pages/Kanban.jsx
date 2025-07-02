import TopBar from "../TopBar"
;("use client")

import { useState } from "react"
import { SidebarInset } from "@/components/ui/sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Edit,
  Trash2,
  X,
  Calendar,
  MapPin,
  AlertCircle,
  User,
  Clock,
  Tag,
  MessageSquare,
  Paperclip,
  Eye,
  ChevronRight,
  Building2,
  Construction,
  Wrench,
  FileText,
  Shield,
  Leaf,
  BarChart3,
  BookOpen,
  Minus,
} from "lucide-react"

const Kanban = ({ setIsOpened, isOpened }) => {
  // Lista de usuarios del sistema
  const usuariosDelSistema = [
    {
      id: "USR001",
      nombre: "Juan Pérez",
      email: "juan.perez@municipio.gov",
      departamento: "Obras Públicas",
      rol: "Supervisor",
      avatar: "JP",
      activo: true,
    },
    {
      id: "USR002",
      nombre: "María González",
      email: "maria.gonzalez@municipio.gov",
      departamento: "Obras Públicas",
      rol: "Técnico",
      avatar: "MG",
      activo: true,
    },
    {
      id: "USR003",
      nombre: "Carlos Rodríguez",
      email: "carlos.rodriguez@municipio.gov",
      departamento: "Obras Públicas",
      rol: "Técnico Senior",
      avatar: "CR",
      activo: true,
    },
    {
      id: "USR004",
      nombre: "Ana López",
      email: "ana.lopez@municipio.gov",
      departamento: "Servicios Públicos",
      rol: "Coordinadora",
      avatar: "AL",
      activo: true,
    },
    {
      id: "USR005",
      nombre: "Diana Ejecutiva",
      email: "diana.ejecutiva@municipio.gov",
      departamento: "Administración General",
      rol: "Administradora Municipal",
      avatar: "DE",
      activo: true,
    },
    {
      id: "USR006",
      nombre: "Roberto Silva",
      email: "roberto.silva@municipio.gov",
      departamento: "Seguridad",
      rol: "Jefe de Seguridad",
      avatar: "RS",
      activo: true,
    },
    {
      id: "USR007",
      nombre: "Laura Martínez",
      email: "laura.martinez@municipio.gov",
      departamento: "Medio Ambiente",
      rol: "Especialista Ambiental",
      avatar: "LM",
      activo: true,
    },
    {
      id: "USR008",
      nombre: "Pedro Ramírez",
      email: "pedro.ramirez@municipio.gov",
      departamento: "Administración",
      rol: "Analista",
      avatar: "PR",
      activo: true,
    },
    {
      id: "USR009",
      nombre: "Carmen Vega",
      email: "carmen.vega@municipio.gov",
      departamento: "Servicios Públicos",
      rol: "Técnico de Mantenimiento",
      avatar: "CV",
      activo: true,
    },
    {
      id: "USR010",
      nombre: "Miguel Torres",
      email: "miguel.torres@municipio.gov",
      departamento: "Obras Públicas",
      rol: "Ingeniero",
      avatar: "MT",
      activo: false,
    },
  ]

  // Lista de publicaciones disponibles
  const publicacionesDisponibles = [
    {
      codigo: "PUB-2024-001",
      titulo: "Reparación de Infraestructura Vial",
      categoria: "Obras Públicas",
      fechaCreacion: "2024-01-05",
      estado: "Activa",
    },
    {
      codigo: "PUB-2024-002",
      titulo: "Mantenimiento de Espacios Verdes",
      categoria: "Servicios Públicos",
      fechaCreacion: "2024-01-08",
      estado: "Activa",
    },
    {
      codigo: "PUB-2024-003",
      titulo: "Renovación de Permisos Comerciales",
      categoria: "Administración",
      fechaCreacion: "2024-01-10",
      estado: "Activa",
    },
    {
      codigo: "PUB-2024-004",
      titulo: "Proyecto de Iluminación LED",
      categoria: "Obras Públicas",
      fechaCreacion: "2024-01-12",
      estado: "Activa",
    },
    {
      codigo: "PUB-2024-005",
      titulo: "Seguridad Ciudadana - Patrullaje",
      categoria: "Seguridad",
      fechaCreacion: "2024-01-15",
      estado: "Activa",
    },
    {
      codigo: "PUB-2024-006",
      titulo: "Programa de Reciclaje Municipal",
      categoria: "Medio Ambiente",
      fechaCreacion: "2024-01-18",
      estado: "Activa",
    },
    {
      codigo: "PUB-2024-007",
      titulo: "Modernización de Sistemas",
      categoria: "Administración",
      fechaCreacion: "2024-01-20",
      estado: "Borrador",
    },
    {
      codigo: "PUB-2024-008",
      titulo: "Reparación de Alcantarillado",
      categoria: "Servicios Públicos",
      fechaCreacion: "2024-01-22",
      estado: "Activa",
    },
  ]

  // Departamentos del sistema con estadísticas
  const departamentos = [
    {
      id: "todos",
      nombre: "Todos los Departamentos",
      icon: Building2,
      color: "from-purple-500 to-purple-700",
      descripcion: "Vista completa del sistema",
    },
    {
      id: "obras-publicas",
      nombre: "Obras Públicas",
      icon: Construction,
      color: "from-orange-500 to-red-600",
      descripcion: "Infraestructura y construcción",
    },
    {
      id: "servicios-publicos",
      nombre: "Servicios Públicos",
      icon: Wrench,
      color: "from-blue-500 to-cyan-600",
      descripcion: "Mantenimiento y servicios",
    },
    {
      id: "administracion",
      nombre: "Administración",
      icon: FileText,
      color: "from-green-500 to-emerald-600",
      descripcion: "Gestión administrativa",
    },
    {
      id: "seguridad",
      nombre: "Seguridad",
      icon: Shield,
      color: "from-red-500 to-pink-600",
      descripcion: "Seguridad ciudadana",
    },
    {
      id: "medio-ambiente",
      nombre: "Medio Ambiente",
      icon: Leaf,
      color: "from-green-600 to-lime-600",
      descripcion: "Sostenibilidad ambiental",
    },
  ]

  const [tasks, setTasks] = useState([
    {
      id: "1",
      title: "Reparación de semáforo",
      description:
        "Arreglar semáforo en Av. Principal con Calle 5. El semáforo presenta fallas intermitentes en la luz roja, lo que genera riesgo para peatones y conductores. Se requiere revisión del sistema eléctrico y posible reemplazo de componentes.",
      assignee: "Juan Pérez",
      assigneeId: "USR001",
      priority: "alta",
      category: "Obras Públicas",
      location: "Av. Principal #123",
      dueDate: "2024-01-15",
      columnId: "pendiente",
      avatar: "JP",
      createdDate: "2024-01-10",
      estimatedHours: 8,
      comments: [
        {
          id: 1,
          author: "María González",
          text: "Se necesita coordinar con la empresa eléctrica",
          date: "2024-01-11",
        },
        {
          id: 2,
          author: "Juan Pérez",
          text: "Ya contacté con el proveedor de repuestos",
          date: "2024-01-12",
        },
      ],
      attachments: [
        { id: 1, name: "foto_semaforo.jpg", type: "image" },
        { id: 2, name: "presupuesto.pdf", type: "document" },
      ],
      tags: ["urgente", "seguridad vial"],
      progress: 0,
      publicacionesAsociadas: ["PUB-2024-001"],
    },
    {
      id: "2",
      title: "Limpieza de parque central",
      description:
        "Mantenimiento general del parque y poda de árboles. Incluye limpieza de senderos, mantenimiento de juegos infantiles, poda de árboles y arbustos, y reparación de bancos dañados.",
      assignee: "María González",
      assigneeId: "USR002",
      priority: "media",
      category: "Servicios Públicos",
      location: "Parque Central",
      dueDate: "2024-01-20",
      columnId: "en-progreso",
      avatar: "MG",
      createdDate: "2024-01-08",
      estimatedHours: 16,
      comments: [
        {
          id: 1,
          author: "Carlos Ruiz",
          text: "Los árboles de la zona norte necesitan poda urgente",
          date: "2024-01-13",
        },
      ],
      attachments: [{ id: 1, name: "plan_mantenimiento.pdf", type: "document" }],
      tags: ["mantenimiento", "espacios verdes"],
      progress: 60,
      publicacionesAsociadas: ["PUB-2024-002"],
    },
    {
      id: "3",
      title: "Revisión de permisos comerciales",
      description:
        "Evaluar solicitudes de permisos para nuevos comercios. Revisar documentación, verificar cumplimiento de normativas municipales y realizar inspecciones de seguridad.",
      assignee: "Carlos Rodríguez",
      assigneeId: "USR003",
      priority: "baja",
      category: "Administración",
      location: "Oficina Municipal",
      dueDate: "2024-01-25",
      columnId: "revision",
      avatar: "CR",
      createdDate: "2024-01-05",
      estimatedHours: 12,
      comments: [],
      attachments: [
        { id: 1, name: "solicitudes_enero.xlsx", type: "document" },
        { id: 2, name: "normativa_comercial.pdf", type: "document" },
      ],
      tags: ["permisos", "comercio"],
      progress: 85,
      publicacionesAsociadas: ["PUB-2024-003"],
    },
    {
      id: "4",
      title: "Instalación de luminarias LED",
      description:
        "Reemplazar luminarias tradicionales por LED en zona comercial. Proyecto de eficiencia energética que incluye 50 luminarias en el centro comercial.",
      assignee: "Ana López",
      assigneeId: "USR004",
      priority: "media",
      category: "Obras Públicas",
      location: "Zona Comercial Centro",
      dueDate: "2024-02-01",
      columnId: "completado",
      avatar: "AL",
      createdDate: "2024-01-01",
      estimatedHours: 24,
      comments: [
        {
          id: 1,
          author: "Diana Ejecutiva",
          text: "Excelente trabajo, proyecto completado antes de tiempo",
          date: "2024-01-14",
        },
      ],
      attachments: [
        { id: 1, name: "informe_final.pdf", type: "document" },
        { id: 2, name: "fotos_instalacion.zip", type: "file" },
      ],
      tags: ["eficiencia energética", "completado"],
      progress: 100,
      publicacionesAsociadas: ["PUB-2024-004"],
    },
  ])

  // Simulamos diferentes usuarios y roles
  const currentUser = {
    name: "Diana Ejecutiva",
    role: "Administradora Municipal",
    department: "Administración General",
    avatar: "DE",
    level: "admin", // Cambiar de "tecnico" a "admin"
  }

  const [selectedDepartment, setSelectedDepartment] = useState("todos")

  const [columns, setColumns] = useState([
    {
      id: "pendiente",
      title: "Pendiente",
      color: "bg-red-100 border-red-300",
      limit: 5,
      isDefault: true,
    },
    {
      id: "en-progreso",
      title: "En Progreso",
      color: "bg-blue-100 border-blue-300",
      limit: 3,
      isDefault: true,
    },
    {
      id: "revision",
      title: "En Revisión",
      color: "bg-yellow-100 border-yellow-300",
      limit: 2,
      isDefault: true,
    },
    {
      id: "completado",
      title: "Completado",
      color: "bg-green-100 border-green-300",
      limit: null,
      isDefault: true,
    },
  ])

  const [draggedTask, setDraggedTask] = useState(null)
  const [draggedOver, setDraggedOver] = useState(null)
  const [showNewColumnModal, setShowNewColumnModal] = useState(false)
  const [showNewTaskModal, setShowNewTaskModal] = useState(false)
  const [selectedColumn, setSelectedColumn] = useState(null)
  const [editingTask, setEditingTask] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [showTaskPanel, setShowTaskPanel] = useState(false)

  const [newColumnForm, setNewColumnForm] = useState({
    title: "",
    color: "bg-gray-100 border-gray-300",
    limit: "",
  })

  const [newTaskForm, setNewTaskForm] = useState({
    title: "",
    description: "",
    assigneeId: "",
    priority: "media",
    category: "Obras Públicas",
    location: "",
    dueDate: "",
    publicacionesAsociadas: [],
  })

  const colorOptions = [
    "bg-red-100 border-red-300",
    "bg-blue-100 border-blue-300",
    "bg-green-100 border-green-300",
    "bg-yellow-100 border-yellow-300",
    "bg-purple-100 border-purple-300",
    "bg-pink-100 border-pink-300",
    "bg-indigo-100 border-indigo-300",
    "bg-gray-100 border-gray-300",
  ]

  const priorityColors = {
    alta: "bg-red-500",
    media: "bg-yellow-500",
    baja: "bg-green-500",
  }

  const categoryColors = {
    "Obras Públicas": "bg-orange-100 text-orange-800",
    "Servicios Públicos": "bg-blue-100 text-blue-800",
    Administración: "bg-purple-100 text-purple-800",
    Seguridad: "bg-red-100 text-red-800",
    "Medio Ambiente": "bg-green-100 text-green-800",
  }

  // Función para obtener usuario por ID
  const getUserById = (userId) => {
    return usuariosDelSistema.find((user) => user.id === userId)
  }

  // Función para obtener usuarios activos
  const getActiveUsers = () => {
    return usuariosDelSistema.filter((user) => user.activo)
  }

  // Función para obtener publicación por código
  const getPublicacionByCodigo = (codigo) => {
    return publicacionesDisponibles.find((pub) => pub.codigo === codigo)
  }

  // Función para obtener publicaciones activas
  const getPublicacionesActivas = () => {
    return publicacionesDisponibles.filter((pub) => pub.estado === "Activa")
  }

  // Filtrar tareas según departamento seleccionado y nivel de usuario
  const getFilteredTasks = () => {
    if (currentUser.level === "admin") {
      // Admin puede ver todos los departamentos
      if (selectedDepartment === "todos") {
        return tasks
      }
      // Filtrar por categoría del departamento seleccionado
      const deptMapping = {
        "obras-publicas": "Obras Públicas",
        "servicios-publicos": "Servicios Públicos",
        administracion: "Administración",
        seguridad: "Seguridad",
        "medio-ambiente": "Medio Ambiente",
      }
      return tasks.filter((task) => task.category === deptMapping[selectedDepartment])
    } else {
      // Usuarios normales y jefes solo ven su departamento
      const userDeptMapping = {
        "Obras Públicas": "Obras Públicas",
        "Servicios Públicos": "Servicios Públicos",
        "Administración General": "Administración",
        Administración: "Administración",
        Seguridad: "Seguridad",
        "Medio Ambiente": "Medio Ambiente",
      }
      return tasks.filter((task) => task.category === userDeptMapping[currentUser.department])
    }
  }

  const filteredTasks = getFilteredTasks()

  const openTaskPanel = (task) => {
    setSelectedTask(task)
    setShowTaskPanel(true)
  }

  const closeTaskPanel = () => {
    setShowTaskPanel(false)
    setSelectedTask(null)
  }

  const handleDragStart = (e, task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e, columnId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDraggedOver(columnId)
  }

  const handleDragLeave = () => {
    setDraggedOver(null)
  }

  const handleDrop = (e, columnId) => {
    e.preventDefault()
    if (draggedTask && draggedTask.columnId !== columnId) {
      const column = columns.find((col) => col.id === columnId)
      const tasksInColumn = tasks.filter((task) => task.columnId === columnId)

      if (column.limit && tasksInColumn.length >= column.limit) {
        alert(`La columna "${column.title}" ha alcanzado su límite de ${column.limit} tareas`)
        setDraggedTask(null)
        setDraggedOver(null)
        return
      }

      setTasks(tasks.map((task) => (task.id === draggedTask.id ? { ...task, columnId } : task)))
    }
    setDraggedTask(null)
    setDraggedOver(null)
  }

  const createColumn = () => {
    if (!newColumnForm.title.trim()) return

    const newColumn = {
      id: Date.now().toString(),
      title: newColumnForm.title,
      color: newColumnForm.color,
      limit: newColumnForm.limit ? Number.parseInt(newColumnForm.limit) : null,
      isDefault: false,
    }

    setColumns([...columns, newColumn])
    setNewColumnForm({ title: "", color: "bg-gray-100 border-gray-300", limit: "" })
    setShowNewColumnModal(false)
  }

  const deleteColumn = (columnId) => {
    const column = columns.find((col) => col.id === columnId)
    if (column.isDefault) {
      alert("No se pueden eliminar las columnas por defecto")
      return
    }

    const tasksInColumn = tasks.filter((task) => task.columnId === columnId)
    if (tasksInColumn.length > 0) {
      if (!confirm("Esta columna contiene tareas. ¿Deseas moverlas a 'Pendiente' y eliminar la columna?")) {
        return
      }
      setTasks(tasks.map((task) => (task.columnId === columnId ? { ...task, columnId: "pendiente" } : task)))
    }

    setColumns(columns.filter((col) => col.id !== columnId))
  }

  const createTask = () => {
    if (!newTaskForm.title.trim() || !selectedColumn || !newTaskForm.assigneeId) return

    const selectedUser = getUserById(newTaskForm.assigneeId)
    if (!selectedUser) return

    const newTask = {
      id: Date.now().toString(),
      ...newTaskForm,
      assignee: selectedUser.nombre,
      columnId: selectedColumn,
      avatar: selectedUser.avatar,
      createdDate: new Date().toISOString().split("T")[0],
      estimatedHours: 8,
      comments: [],
      attachments: [],
      tags: [],
      progress: 0,
    }

    setTasks([...tasks, newTask])
    setNewTaskForm({
      title: "",
      description: "",
      assigneeId: "",
      priority: "media",
      category: "Obras Públicas",
      location: "",
      dueDate: "",
      publicacionesAsociadas: [],
    })
    setShowNewTaskModal(false)
    setSelectedColumn(null)
  }

  const editTask = (task) => {
    setEditingTask(task)
    setNewTaskForm({
      title: task.title,
      description: task.description,
      assigneeId: task.assigneeId || "",
      priority: task.priority,
      category: task.category,
      location: task.location,
      dueDate: task.dueDate,
      publicacionesAsociadas: task.publicacionesAsociadas || [],
    })
    setShowNewTaskModal(true)
  }

  const updateTask = () => {
    if (!newTaskForm.title.trim() || !newTaskForm.assigneeId) return

    const selectedUser = getUserById(newTaskForm.assigneeId)
    if (!selectedUser) return

    setTasks(
      tasks.map((task) =>
        task.id === editingTask.id
          ? {
              ...task,
              ...newTaskForm,
              assignee: selectedUser.nombre,
              avatar: selectedUser.avatar,
            }
          : task,
      ),
    )

    setEditingTask(null)
    setNewTaskForm({
      title: "",
      description: "",
      assigneeId: "",
      priority: "media",
      category: "Obras Públicas",
      location: "",
      dueDate: "",
      publicacionesAsociadas: [],
    })
    setShowNewTaskModal(false)
  }

  const deleteTask = (taskId) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta tarea?")) {
      setTasks(tasks.filter((task) => task.id !== taskId))
      if (selectedTask && selectedTask.id === taskId) {
        closeTaskPanel()
      }
    }
  }

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date()
  }

  const resetForm = () => {
    setNewTaskForm({
      title: "",
      description: "",
      assigneeId: "",
      priority: "media",
      category: "Obras Públicas",
      location: "",
      dueDate: "",
      publicacionesAsociadas: [],
    })
    setEditingTask(null)
    setSelectedColumn(null)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const handleOpenSidebar = () => {
    setIsOpened(!isOpened)
  }

  const userData = {
    bgColor: "bg-gray-50",
    icon: User,
    color: "text-gray-800",
    title: currentUser.name,
    subtitle: `${currentUser.role} • ${currentUser.department}`,
  }

  // Función para agregar publicación
  const addPublicacion = (codigo) => {
    if (!newTaskForm.publicacionesAsociadas.includes(codigo)) {
      setNewTaskForm({
        ...newTaskForm,
        publicacionesAsociadas: [...newTaskForm.publicacionesAsociadas, codigo],
      })
    }
  }

  // Función para remover publicación
  const removePublicacion = (codigo) => {
    setNewTaskForm({
      ...newTaskForm,
      publicacionesAsociadas: newTaskForm.publicacionesAsociadas.filter((pub) => pub !== codigo),
    })
  }

  return (
    <>
      <TopBar title={"Kanban Board"} optionalbg="bg-[#00A86B]" handleOpenSidebar={handleOpenSidebar} />
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Panel lateral derecho con detalles de la tarea */}
        {showTaskPanel && selectedTask && (
          <div className="fixed top-0 right-0 w-96 h-full bg-gray-50 border-gray-200 shadow-2xl z-50 overflow-hidden">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-500 to-green-700 text-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Detalles de la Tarea</h3>
                  <button onClick={closeTaskPanel} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{selectedTask.title}</h4>
                  <p className="text-gray-600 leading-relaxed">{selectedTask.description}</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-500">Asignado a:</span>
                      <p className="font-medium">{selectedTask.assignee}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Tag className="w-5 h-5 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-500">Categoría:</span>
                      <span
                        className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                          categoryColors[selectedTask.category]
                        }`}
                      >
                        {selectedTask.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full ${priorityColors[selectedTask.priority]}`} />
                    <div>
                      <span className="text-sm text-gray-500">Prioridad:</span>
                      <p className="font-medium capitalize">{selectedTask.priority}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-500">Ubicación:</span>
                      <p className="font-medium">{selectedTask.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-500">Fecha límite:</span>
                      <p className={`font-medium ${isOverdue(selectedTask.dueDate) ? "text-red-600" : ""}`}>
                        {formatDate(selectedTask.dueDate)}
                        {isOverdue(selectedTask.dueDate) && <span className="ml-2 text-red-500">(Vencida)</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-500">Horas estimadas:</span>
                      <p className="font-medium">{selectedTask.estimatedHours}h</p>
                    </div>
                  </div>
                </div>

                {/* Publicaciones Asociadas */}
                {selectedTask.publicacionesAsociadas && selectedTask.publicacionesAsociadas.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Publicaciones Asociadas ({selectedTask.publicacionesAsociadas.length})
                      </span>
                    </div>
                    <div className="space-y-2">
                      {selectedTask.publicacionesAsociadas.map((codigo) => {
                        const publicacion = getPublicacionByCodigo(codigo)
                        return (
                          <div
                            key={codigo}
                            className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
                          >
                            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                              <BookOpen className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-800">{codigo}</p>
                              <p className="text-xs text-gray-600">
                                {publicacion?.titulo || "Publicación no encontrada"}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                publicacion?.estado === "Activa"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {publicacion?.estado || "N/A"}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {selectedTask.attachments && selectedTask.attachments.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Paperclip className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Archivos adjuntos ({selectedTask.attachments.length})
                      </span>
                    </div>
                    <div className="space-y-2">
                      {selectedTask.attachments.map((file) => (
                        <div key={file.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                            <Paperclip className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">{file.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{file.type}</p>
                          </div>
                          <button className="p-1 hover:bg-gray-200 rounded">
                            <Eye className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Comentarios ({selectedTask.comments.length})</span>
                  </div>
                  <div className="space-y-3">
                    {selectedTask.comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-800">{comment.author}</span>
                          <span className="text-xs text-gray-500">{formatDate(comment.date)}</span>
                        </div>
                        <p className="text-sm text-gray-600">{comment.text}</p>
                      </div>
                    ))}
                    {selectedTask.comments.length === 0 && (
                      <p className="text-sm text-gray-500 italic">No hay comentarios aún</p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    <p>Creada el: {formatDate(selectedTask.createdDate)}</p>
                    <p>ID de tarea: {selectedTask.id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <SidebarInset>
          {/* Selector de Departamentos ELEGANTE para Administradora Municipal */}
          {currentUser.level === "admin" ? (
            <div className="bg-gradient-to-br from-slate-50 via-green-50 to-indigo-50 border-b-4  shadow-lg">
              <div className="p-6">
                {/* Subtítulo de Vista Administrador */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-sm font-medium text-blue-700 uppercase tracking-wide">
                      Vista de Administrador
                    </span>
                  </div>
                </div>

                {/* Selector Elegante de Departamentos */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                      <BarChart3 className="text-white w-5 h-5" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Gestión por Departamentos</h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                    {departamentos.map((dept) => {
                      return (
                        <div
                          key={dept.id}
                          onClick={() => setSelectedDepartment(dept.id)}
                          className={`relative cursor-pointer group transition-all duration-300 ${
                            selectedDepartment === dept.id
                              ? "transform scale-105 shadow-xl ring-3 ring-blue-400 ring-opacity-60"
                              : "hover:transform hover:scale-102 hover:shadow-lg"
                          }`}
                        >
                          <div className="bg-white rounded-xl p-4 border-2 border-slate-200 hover:border-blue-300 transition-all duration-300 relative overflow-hidden">
                            {/* Efecto de fondo sutil */}
                            <div
                              className={`absolute inset-0 bg-gradient-to-br ${dept.color} opacity-5 group-hover:opacity-15 transition-opacity duration-300`}
                            ></div>

                            {/* Contenido simplificado */}
                            <div className="relative z-10 text-center">
                              {/* Icono del departamento */}
                              <div
                                className={`w-12 h-12 bg-gradient-to-br ${dept.color} rounded-xl flex items-center justify-center shadow-lg mx-auto mb-3`}
                              >
                                <dept.icon className="w-6 h-6 text-white" />
                              </div>

                              {/* Nombre del departamento */}
                              <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors leading-tight">
                                {dept.nombre}
                              </h3>

                              {/* Indicador de selección */}
                              {selectedDepartment === dept.id && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                              )}
                            </div>

                            {/* Efecto hover */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Vista normal para usuarios y jefes
            <div className="bg-gray-50 border-b border-gray-200 shadow-sm">
              <div className="p-4 flex justify-between items-center">
                <div
                  className={`inline-flex items-center gap-3 px-4 py-3 rounded-lg ${userData.bgColor} border border-gray-200`}
                >
                  <userData.icon className={`w-6 h-6 ${userData.color}`} />
                  <div>
                    <div className={`font-semibold text-lg ${userData.color}`}>{userData.title}</div>
                    <div className="text-sm text-gray-600">{userData.subtitle}</div>
                  </div>
                </div>
                <button
                  onClick={() => setShowNewColumnModal(true)}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-white shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Nueva Columna
                </button>
              </div>
            </div>
          )}

          {/* Kanban Board con columnas responsivas */}
          <div className="p-6">
            {/* Header del Kanban con botón Nueva Columna */}
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowNewColumnModal(true)}
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 px-6 py-3 rounded-xl flex items-center gap-3 transition-all transform hover:scale-105 shadow-lg text-white font-semibold"
              >
                <Plus className="w-5 h-5" />
                Nueva Columna
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-[600px]">
              {columns.map((column) => {
                const columnTasks = filteredTasks.filter((task) => task.columnId === column.id)
                const isOverLimit = column.limit && columnTasks.length >= column.limit
                const isDraggedOver = draggedOver === column.id

                return (
                  <div
                    key={column.id}
                    className={`${column.color} border-2 rounded-lg p-4 transition-all ${
                      isDraggedOver ? "ring-2 ring-green-400 bg-green-50" : ""
                    } flex flex-col`}
                    onDragOver={(e) => handleDragOver(e, column.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, column.id)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800">{column.title}</h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isOverLimit ? "bg-red-500 text-white" : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {columnTasks.length}
                          {column.limit ? `/${column.limit}` : ""}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedColumn(column.id)
                            setShowNewTaskModal(true)
                          }}
                          className="p-1 hover:bg-white/50 rounded transition-colors"
                          title="Agregar tarea"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        {!column.isDefault && (
                          <button
                            onClick={() => deleteColumn(column.id)}
                            className="p-1 hover:bg-red-200 rounded text-red-600 transition-colors"
                            title="Eliminar columna"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto">
                      {columnTasks.map((task) => (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task)}
                          onClick={() => openTaskPanel(task)}
                          className="bg-white p-4 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-all hover:border-green-300"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900 flex-1 pr-2">{task.title}</h4>
                            <div className="flex items-center gap-1">
                              <div
                                className={`w-3 h-3 rounded-full ${priorityColors[task.priority]}`}
                                title={`Prioridad ${task.priority}`}
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  editTask(task)
                                }}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteTask(task.id)
                                }}
                                className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{task.location}</span>
                            </div>

                            {task.dueDate && (
                              <div
                                className={`flex items-center gap-2 text-xs ${
                                  isOverdue(task.dueDate) ? "text-red-600" : "text-gray-500"
                                }`}
                              >
                                <Calendar className="w-3 h-3 flex-shrink-0" />
                                <span>{formatDate(task.dueDate)}</span>
                                {isOverdue(task.dueDate) && <AlertCircle className="w-3 h-3 text-red-500" />}
                              </div>
                            )}

                            {/* Mostrar publicaciones asociadas en la tarjeta */}
                            {task.publicacionesAsociadas && task.publicacionesAsociadas.length > 0 && (
                              <div className="flex items-center gap-2 text-xs text-blue-600">
                                <BookOpen className="w-3 h-3 flex-shrink-0" />
                                <span>{task.publicacionesAsociadas.length} publicación(es)</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[task.category]}`}
                            >
                              {task.category}
                            </span>

                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white font-medium">
                                {task.avatar}
                              </div>
                              <span className="text-xs text-gray-600 max-w-20 truncate">{task.assignee}</span>
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Modal Nueva Columna */}
          {showNewColumnModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Nueva Columna</h3>
                  <button
                    onClick={() => setShowNewColumnModal(false)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Título</label>
                    <input
                      type="text"
                      value={newColumnForm.title}
                      onChange={(e) => setNewColumnForm({ ...newColumnForm, title: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Nombre de la columna"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Color</label>
                    <div className="grid grid-cols-4 gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          onClick={() => setNewColumnForm({ ...newColumnForm, color })}
                          className={`w-12 h-8 rounded border-2 ${color} ${
                            newColumnForm.color === color ? "ring-2 ring-blue-500" : ""
                          } transition-all`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Límite de tareas (opcional)</label>
                    <input
                      type="number"
                      value={newColumnForm.limit}
                      onChange={(e) => setNewColumnForm({ ...newColumnForm, limit: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Ej: 5"
                      min="1"
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <button
                    onClick={createColumn}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Crear Columna
                  </button>
                  <button
                    onClick={() => setShowNewColumnModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Nueva/Editar Tarea */}
          {showNewTaskModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg w-[500px] max-h-[90vh] overflow-y-auto shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{editingTask ? "Editar Tarea" : "Nueva Tarea"}</h3>
                  <button
                    onClick={() => {
                      setShowNewTaskModal(false)
                      resetForm()
                    }}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Título *</label>
                    <input
                      type="text"
                      value={newTaskForm.title}
                      onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Título de la tarea"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Descripción</label>
                    <textarea
                      value={newTaskForm.description}
                      onChange={(e) => setNewTaskForm({ ...newTaskForm, description: e.target.value })}
                      className="w-full p-2 border rounded-lg h-20 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Descripción detallada"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Asignado a *</label>
                    <Select
                      value={newTaskForm.assigneeId}
                      onValueChange={(value) => setNewTaskForm({ ...newTaskForm, assigneeId: value })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar usuario del sistema" />
                      </SelectTrigger>
                      <SelectContent>
                        {getActiveUsers().map((usuario) => (
                          <SelectItem key={usuario.id} value={usuario.id}>
                            <div className="flex items-center gap-3 py-1">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white font-medium">
                                {usuario.avatar}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium text-sm">{usuario.nombre}</span>
                                <span className="text-xs text-gray-500">
                                  {usuario.rol} • {usuario.departamento}
                                </span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">{getActiveUsers().length} usuarios activos disponibles</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Prioridad</label>
                      <select
                        value={newTaskForm.priority}
                        onChange={(e) => setNewTaskForm({ ...newTaskForm, priority: e.target.value })}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="baja">Baja</option>
                        <option value="media">Media</option>
                        <option value="alta">Alta</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Categoría</label>
                      <select
                        value={newTaskForm.category}
                        onChange={(e) => setNewTaskForm({ ...newTaskForm, category: e.target.value })}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="Obras Públicas">Obras Públicas</option>
                        <option value="Servicios Públicos">Servicios Públicos</option>
                        <option value="Administración">Administración</option>
                        <option value="Seguridad">Seguridad</option>
                        <option value="Medio Ambiente">Medio Ambiente</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Ubicación</label>
                    <input
                      type="text"
                      value={newTaskForm.location}
                      onChange={(e) => setNewTaskForm({ ...newTaskForm, location: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Dirección o ubicación"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Fecha límite</label>
                    <input
                      type="date"
                      value={newTaskForm.dueDate}
                      onChange={(e) => setNewTaskForm({ ...newTaskForm, dueDate: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* Selector de Publicaciones */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Publicaciones Asociadas</label>
                    <Select onValueChange={addPublicacion}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar publicación por código" />
                      </SelectTrigger>
                      <SelectContent>
                        {getPublicacionesActivas()
                          .filter((pub) => !newTaskForm.publicacionesAsociadas.includes(pub.codigo))
                          .map((publicacion) => (
                            <SelectItem key={publicacion.codigo} value={publicacion.codigo}>
                              <div className="flex flex-col py-1">
                                <span className="font-medium text-sm">{publicacion.codigo}</span>
                                <span className="text-xs text-gray-500">{publicacion.titulo}</span>
                                <span className="text-xs text-blue-600">{publicacion.categoria}</span>
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      {getPublicacionesActivas().length} publicaciones activas disponibles
                    </p>

                    {/* Lista de publicaciones seleccionadas */}
                    {newTaskForm.publicacionesAsociadas.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <span className="text-sm font-medium text-gray-700">Publicaciones seleccionadas:</span>
                        {newTaskForm.publicacionesAsociadas.map((codigo) => {
                          const publicacion = getPublicacionByCodigo(codigo)
                          return (
                            <div
                              key={codigo}
                              className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-200"
                            >
                              <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-blue-600" />
                                <div>
                                  <span className="text-sm font-medium">{codigo}</span>
                                  <p className="text-xs text-gray-600">{publicacion?.titulo}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => removePublicacion(codigo)}
                                className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                                title="Remover publicación"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <button
                    onClick={editingTask ? updateTask : createTask}
                    disabled={!newTaskForm.title.trim() || !newTaskForm.assigneeId}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {editingTask ? "Actualizar" : "Crear"} Tarea
                  </button>
                  <button
                    onClick={() => {
                      setShowNewTaskModal(false)
                      resetForm()
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </SidebarInset>
      </div>
    </>
  )
}

export default Kanban
