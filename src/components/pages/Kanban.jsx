import React from 'react'
import TopBar from '../TopBar'
"use client"

import { useState } from "react"
import { SidebarInset } from "@/components/ui/sidebar"
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
  Building,
  MessageSquare,
  Paperclip,
  Eye,
  ChevronRight,
  Crown,
  Shield,
  UserCheck,
  ChevronLeft,
} from "lucide-react"

const Kanban = ({setIsOpened, isOpened}) => {
  // Simulamos diferentes usuarios y roles
  const currentUser = {
    name: "Diana Ejecutiva",
    role: "Administradora Municipal",
    department: "Administración General",
    avatar: "DE",
    level: "tecnico", // admin, jefe, personal
  }

  // Datos de ejemplo según el rol
  const getUserData = () => {
    switch (currentUser.level) {
      case "admin":
        return {
          title: "Vista Ejecutiva - Todos los Departamentos",
          subtitle: `${currentUser.name} | ${currentUser.role}`,
          icon: Crown,
          color: "text-yellow-600",
          bgColor: "bg-gradient-to-r from-yellow-100 to-amber-100",
        }
      case "jefe":
        return {
          title: `Departamento: ${currentUser.department}`,
          subtitle: `${currentUser.name} | Jefe de Departamento`,
          icon: Shield,
          color: "text-blue-600",
          bgColor: "bg-gradient-to-r from-blue-100 to-indigo-100",
        }
      default:
        return {
          title: `Mis Tareas - ${currentUser.department}`,
          subtitle: `${currentUser.name} | Personal Técnico`,
          icon: UserCheck,
          color: "text-green-600",
          bgColor: "bg-gradient-to-r from-green-100 to-emerald-100",
        }
    }
  }

  const userData = getUserData()

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

  const [tasks, setTasks] = useState([
    {
      id: "1",
      title: "Reparación de semáforo",
      description:
        "Arreglar semáforo en Av. Principal con Calle 5. El semáforo presenta fallas intermitentes en la luz roja, lo que genera riesgo para peatones y conductores. Se requiere revisión del sistema eléctrico y posible reemplazo de componentes.",
      assignee: "Juan Pérez",
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
    },
    {
      id: "2",
      title: "Limpieza de parque central",
      description:
        "Mantenimiento general del parque y poda de árboles. Incluye limpieza de senderos, mantenimiento de juegos infantiles, poda de árboles y arbustos, y reparación de bancos dañados.",
      assignee: "María González",
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
    },
    {
      id: "3",
      title: "Revisión de permisos comerciales",
      description:
        "Evaluar solicitudes de permisos para nuevos comercios. Revisar documentación, verificar cumplimiento de normativas municipales y realizar inspecciones de seguridad.",
      assignee: "Carlos Ruiz",
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
    },
    {
      id: "4",
      title: "Instalación de luminarias LED",
      description:
        "Reemplazar luminarias tradicionales por LED en zona comercial. Proyecto de eficiencia energética que incluye 50 luminarias en el centro comercial.",
      assignee: "Ana López",
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
    assignee: "",
    priority: "media",
    category: "Obras Públicas",
    location: "",
    dueDate: "",
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
    if (!newTaskForm.title.trim() || !selectedColumn) return

    const newTask = {
      id: Date.now().toString(),
      ...newTaskForm,
      columnId: selectedColumn,
      avatar: newTaskForm.assignee
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase(),
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
      assignee: "",
      priority: "media",
      category: "Obras Públicas",
      location: "",
      dueDate: "",
    })
    setShowNewTaskModal(false)
    setSelectedColumn(null)
  }

  const editTask = (task) => {
    setEditingTask(task)
    setNewTaskForm({
      title: task.title,
      description: task.description,
      assignee: task.assignee,
      priority: task.priority,
      category: task.category,
      location: task.location,
      dueDate: task.dueDate,
    })
    setShowNewTaskModal(true)
  }

  const updateTask = () => {
    if (!newTaskForm.title.trim()) return

    setTasks(
      tasks.map((task) =>
        task.id === editingTask.id
          ? {
              ...task,
              ...newTaskForm,
              avatar: newTaskForm.assignee
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase(),
            }
          : task,
      ),
    )

    setEditingTask(null)
    setNewTaskForm({
      title: "",
      description: "",
      assignee: "",
      priority: "media",
      category: "Obras Públicas",
      location: "",
      dueDate: "",
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
      assignee: "",
      priority: "media",
      category: "Obras Públicas",
      location: "",
      dueDate: "",
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
  return (
    <>
      <TopBar title={"Kanban Board"} optionalbg="bg-[#00A86B]" handleOpenSidebar={handleOpenSidebar} />
      <div className="min-h-screen bg-gray-50 p-6">
      {/* Panel lateral derecho con detalles de la tarea - AHORA COMO OVERLAY */}
      {showTaskPanel && selectedTask && (
        <div className="fixed top-0 right-0 w-96 h-full bg-gray-50  border-gray-200 shadow-2xl z-50 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Header del panel con botón de cerrar mejorado */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-500 to-green-700 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Detalles de la Tarea</h3>
                <div className="flex items-center gap-2">
                  {/* <button
                    onClick={closeTaskPanel}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-white hover:bg-white/20 rounded-lg transition-colors"
                    title="Cerrar panel"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Cerrar</span>
                  </button> */}
                  <button
                    onClick={closeTaskPanel}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                    title="Cerrar panel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Contenido del panel */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Título y descripción */}
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">{selectedTask.title}</h4>
                <p className="text-gray-600 leading-relaxed">{selectedTask.description}</p>
              </div>

              {/* Información básica */}
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
                      className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${categoryColors[selectedTask.category]}`}
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

              {/* Progreso */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Progreso:</span>
                  <span className="text-sm font-medium">{selectedTask.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${selectedTask.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Tags */}
              {selectedTask.tags && selectedTask.tags.length > 0 && (
                <div>
                  <span className="text-sm text-gray-500 mb-2 block">Etiquetas:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Archivos adjuntos */}
              {selectedTask.attachments && selectedTask.attachments.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Paperclip className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Archivos adjuntos ({selectedTask.attachments.length})</span>
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

              {/* Comentarios */}
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

              {/* Información de creación */}
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
        {/* Header simplificado */}
        {/* <div className="bg-green-600 text-white shadow-lg">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Kanban Board</h1>
                <div className="flex items-center gap-4 mt-2 text-green-100">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    <span className="text-sm">Sistema Municipal de Gestión</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{new Date().toLocaleDateString("es-ES")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> */}

        {/* Información del departamento/usuario */}
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

            {/* BOTÓN MOVIDO AQUÍ - FUERA DEL TOPBAR */}
            <button
              onClick={() => setShowNewColumnModal(true)}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-white shadow-md"
            >
              <Plus className="w-4 h-4" />
              Nueva Columna
            </button>
          </div>
        </div>

        {/* Kanban Board con columnas responsivas */}
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-[600px]">
            {columns.map((column) => {
              const columnTasks = tasks.filter((task) => task.columnId === column.id)
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
            <div className="bg-white p-6 rounded-lg w-96 max-h-[90vh] overflow-y-auto shadow-xl">
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
                  <label className="block text-sm font-medium mb-1">Asignado a</label>
                  <input
                    type="text"
                    value={newTaskForm.assignee}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, assignee: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Nombre del responsable"
                  />
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
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={editingTask ? updateTask : createTask}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
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