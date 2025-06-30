"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  CheckCircle2Icon,
  ClockIcon,
  AlertCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  Edit2Icon,
  Trash2Icon,
  FileIcon,
  ImageIcon,
  FileTextIcon,
  DownloadIcon,
  EyeIcon,
  PaperclipIcon,
  ZoomInIcon,
  PlayIcon,
  FileSpreadsheetIcon,
} from "lucide-react"
import { format } from "date-fns"
import EditMunicipalResponseModal from "../EditMunicipalResponseModal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// ARCHIVOS DE EJEMPLO HARDCODEADOS - ¡ÉPICOS!
const EVIDENCIA_EJEMPLO = [
  {
    id: 1,
    nombre: "reparacion_poste_antes.jpg",
    tipo: "image/jpeg",
    tamaño: "2.4 MB",
    url: "https://images.unsplash.com/photo-1744706908540-c7450689a30a?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    descripcion: "Estado del poste antes de la reparación",
    fechaSubida: "2024-01-15T10:30:00",
  },
  {
    id: 2,
    nombre: "reparacion_poste_despues.jpg",
    tipo: "image/jpeg",
    tamaño: "2.1 MB",
    url: "https://images.unsplash.com/photo-1744706908540-c7450689a30a?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    descripcion: "Poste reparado y funcionando",
    fechaSubida: "2024-01-15T16:45:00",
  },
  {
    id: 3,
    nombre: "informe_tecnico_reparacion.pdf",
    tipo: "application/pdf",
    tamaño: "856 KB",
    url: "https://images.unsplash.com/photo-1744706908540-c7450689a30a?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    descripcion: "Informe técnico detallado de la reparación",
    fechaSubida: "2024-01-15T17:00:00",
  },
  {
    id: 4,
    nombre: "presupuesto_materiales.xlsx",
    tipo: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    tamaño: "124 KB",
    url: "https://images.unsplash.com/photo-1744706908540-c7450689a30a?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    descripcion: "Detalle de costos y materiales utilizados",
    fechaSubida: "2024-01-15T17:15:00",
  },
  {
    id: 5,
    nombre: "video_funcionamiento.mp4",
    tipo: "video/mp4",
    tamaño: "15.2 MB",
    url: "https://images.unsplash.com/photo-1744706908540-c7450689a30a?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    descripcion: "Video mostrando el funcionamiento del poste reparado",
    fechaSubida: "2024-01-15T18:00:00",
  },
]

const getStateIcon = (state) => {
  switch (state) {
    case "Pendiente":
      return <AlertCircleIcon className="h-6 w-6 text-yellow-500" />
    case "Recibido":
      return <ClockIcon className="h-6 w-6 text-blue-500" />
    case "En curso":
      return <ClockIcon className="h-6 w-6 text-purple-500" />
    case "Resuelto":
      return <CheckCircle2Icon className="h-6 w-6 text-green-500" />
    case "No resuelto":
      return <XCircleIcon className="h-6 w-6 text-red-500" />
    default:
      return <AlertCircleIcon className="h-6 w-6 text-gray-500" />
  }
}

const getStateColor = (state) => {
  switch (state) {
    case "Pendiente":
      return "bg-yellow-100 text-yellow-800 border-yellow-300"
    case "Recibido":
      return "bg-blue-100 text-blue-800 border-blue-300"
    case "En curso":
      return "bg-purple-100 text-purple-800 border-purple-300"
    case "Resuelto":
      return "bg-green-100 text-green-800 border-green-300"
    case "No resuelto":
      return "bg-red-100 text-red-800 border-red-300"
    default:
      return "bg-gray-100 text-gray-800 border-gray-300"
  }
}

// Función para obtener el icono según el tipo de archivo
const getFileIcon = (tipo) => {
  if (tipo.startsWith("image/")) {
    return <ImageIcon className="w-5 h-5 text-blue-500" />
  }
  if (tipo === "application/pdf") {
    return <FileTextIcon className="w-5 h-5 text-red-500" />
  }
  if (tipo.includes("spreadsheet") || tipo.includes("excel")) {
    return <FileSpreadsheetIcon className="w-5 h-5 text-green-600" />
  }
  if (tipo.includes("word") || tipo.includes("document")) {
    return <FileTextIcon className="w-5 h-5 text-blue-600" />
  }
  if (tipo.startsWith("video/")) {
    return <PlayIcon className="w-5 h-5 text-purple-500" />
  }
  return <FileIcon className="w-5 h-5 text-gray-500" />
}

// Función para obtener el color del badge según el tipo
const getFileTypeColor = (tipo) => {
  if (tipo.startsWith("image/")) {
    return "bg-blue-100 text-blue-800 border-blue-300"
  }
  if (tipo === "application/pdf") {
    return "bg-red-100 text-red-800 border-red-300"
  }
  if (tipo.includes("spreadsheet") || tipo.includes("excel")) {
    return "bg-green-100 text-green-800 border-green-300"
  }
  if (tipo.includes("word") || tipo.includes("document")) {
    return "bg-blue-100 text-blue-800 border-blue-300"
  }
  if (tipo.startsWith("video/")) {
    return "bg-purple-100 text-purple-800 border-purple-300"
  }
  return "bg-gray-100 text-gray-800 border-gray-300"
}

// Componente para mostrar un archivo individual
const FilePreview = ({ archivo }) => {
  const esImagen = archivo.tipo.startsWith("image/")
  const esVideo = archivo.tipo.startsWith("video/")

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
      {/* Icono o Preview */}
      <div className="flex-shrink-0">
        {esImagen ? (
          <div className="relative">
            <img
              src={archivo.url || "/placeholder.svg"}
              alt={archivo.nombre}
              className="w-12 h-12 object-cover rounded border"
            />
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute -top-1 -right-1 w-6 h-6 bg-white shadow-sm hover:bg-blue-50"
                >
                  <ZoomInIcon className="w-3 h-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    {archivo.nombre}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <img
                    src={archivo.url || "/placeholder.svg"}
                    alt={archivo.nombre}
                    className="w-full h-auto max-h-[70vh] object-contain rounded"
                  />
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{archivo.descripcion}</span>
                    <span>{archivo.tamaño}</span>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="w-12 h-12 bg-white rounded border flex items-center justify-center">
            {getFileIcon(archivo.tipo)}
          </div>
        )}
      </div>

      {/* Información del archivo */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-sm text-gray-900 truncate">{archivo.nombre}</p>
          <Badge className={`text-xs ${getFileTypeColor(archivo.tipo)}`}>
            {archivo.tipo.split("/")[1]?.toUpperCase() || "FILE"}
          </Badge>
        </div>
        <p className="text-xs text-gray-600 mb-1">{archivo.descripcion}</p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{archivo.tamaño}</span>
          <span>•</span>
          <span>{format(new Date(archivo.fechaSubida), "dd/MM/yyyy HH:mm")}</span>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-1">
        {esImagen && (
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="h-8 px-2 bg-transparent">
                <EyeIcon className="w-3 h-3 mr-1" />
                Ver
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  {archivo.nombre}
                </DialogTitle>
              </DialogHeader>
              <img
                src={archivo.url || "/placeholder.svg"}
                alt={archivo.nombre}
                className="w-full h-auto max-h-[70vh] object-contain rounded"
              />
            </DialogContent>
          </Dialog>
        )}

        <Button size="sm" variant="outline" className="h-8 px-2 bg-transparent">
          <DownloadIcon className="w-3 h-3 mr-1" />
          Descargar
        </Button>
      </div>
    </div>
  )
}

// Componente para la galería de evidencia
const EvidenceGallery = ({ evidencia }) => {
  const imagenes = evidencia.filter((archivo) => archivo.tipo.startsWith("image/"))
  const documentos = evidencia.filter((archivo) => !archivo.tipo.startsWith("image/"))

  return (
    <div className="space-y-4">
      {/* Galería de Imágenes */}
      {imagenes.length > 0 && (
        <div>
          <h5 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-blue-500" />
            Imágenes ({imagenes.length})
          </h5>
          {imagenes.length > 2 ? (
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                {imagenes.slice(0, 2).map((imagen) => (
                  <Dialog key={imagen.id}>
                    <DialogTrigger asChild>
                      <div className="relative cursor-pointer group">
                        <img
                          src={imagen.url || "/placeholder.svg"}
                          alt={imagen.nombre}
                          className="w-full h-20 object-cover rounded border group-hover:opacity-80 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded flex items-center justify-center">
                          <ZoomInIcon className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>{imagen.nombre}</DialogTitle>
                      </DialogHeader>
                      <img
                        src={imagen.url || "/placeholder.svg"}
                        alt={imagen.nombre}
                        className="w-full h-auto max-h-[70vh] object-contain rounded"
                      />
                    </DialogContent>
                  </Dialog>
                ))}
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="relative cursor-pointer group bg-gray-100 rounded border h-20 flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-lg font-bold text-gray-600">+{imagenes.length - 2}</span>
                        <p className="text-xs text-gray-500">más</p>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <ImageIcon className="w-5 h-5" />
                        Todas las imágenes ({imagenes.length})
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto">
                      {imagenes.map((imagen) => (
                        <div key={imagen.id} className="space-y-2">
                          <img
                            src={imagen.url || "/placeholder.svg"}
                            alt={imagen.nombre}
                            className="w-full h-32 object-cover rounded border"
                          />
                          <div className="text-xs">
                            <p className="font-medium truncate">{imagen.nombre}</p>
                            <p className="text-gray-500">{imagen.tamaño}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {imagenes.map((imagen) => (
                <FilePreview key={imagen.id} archivo={imagen} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Documentos y otros archivos */}
      {documentos.length > 0 && (
        <div>
          <h5 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <FileIcon className="w-4 h-4 text-gray-500" />
            Documentos ({documentos.length})
          </h5>
          <div className="space-y-2">
            {documentos.map((documento) => (
              <FilePreview key={documento.id} archivo={documento} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const ResponseSkeleton = () => (
  <div className="relative pl-8">
    <span className="absolute left-0 flex items-center justify-center w-8 h-8 bg-white rounded-full ring-8 ring-white">
      <Skeleton className="h-6 w-6 rounded-full" />
    </span>
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-6 w-20" />
          </div>
          <div>
            <Skeleton className="h-4 w-20 mb-1" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-20 mb-1" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
)

export function MunicipalResponsesList({ responses, loading, onEditResponse, onDeleteResponse }) {
  const [editingResponse, setEditingResponse] = useState(null)

  const handleEditClick = (response) => {
    setEditingResponse(response)
  }

  const handleCloseModal = () => {
    setEditingResponse(null)
  }

  const handleSaveEdit = (updatedResponse) => {
    console.log(updatedResponse)
    const newResponse = {
      descripcion: updatedResponse.descripcion,
      acciones: updatedResponse.acciones,
    }
    console.log(newResponse)
    onEditResponse(newResponse, updatedResponse.id)
    setEditingResponse(null)
  }

  const handleDeleteLastResponse = () => {
    if (responses.length > 0) {
      onDeleteResponse(responses[responses.length - 1].id)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8 relative before:absolute before:inset-0 before:left-4 before:h-full before:w-0.5 before:bg-gray-200">
        {[...Array(3)].map((_, index) => (
          <ResponseSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (responses.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <AlertCircleIcon className="h-12 w-12 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-700">No hay respuestas municipales</h3>
            <p className="text-sm text-gray-500">Aún no se han registrado respuestas para esta publicación.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-8 relative before:absolute before:inset-0 before:left-4 before:h-full before:w-0.5 before:bg-gray-200">
        {responses.map((response, index) => {
          // Simular evidencia para algunas respuestas (hardcodeado)
          const tieneEvidencia = response.situacion_posterior === "Resuelto" || Math.random() > 0.5
          const evidenciaResponse = tieneEvidencia ? EVIDENCIA_EJEMPLO.slice(0, Math.floor(Math.random() * 5) + 1) : []

          return (
            <div key={index} className="relative pl-8">
              <span className="absolute left-0 flex items-center justify-center w-8 h-8 bg-white rounded-full ring-8 ring-white">
                {getStateIcon(response.situacion_posterior)}
              </span>

              <Card className="w-full">
                <CardContent className="p-4">
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">
                        {format(new Date(response.fecha), "dd/MM/yyyy HH:mm")}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-500">{response.usuario.nombre}</span>
                        {index === responses.length - 1 && (
                          <Button variant="outline" size="sm" onClick={() => handleEditClick(response)} className="p-1">
                            <Edit2Icon className="h-4 w-4" />
                            <span className="sr-only">Editar respuesta</span>
                          </Button>
                        )}

                        {index === responses.length - 1 && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="p-1 text-red-600 hover:text-red-700 bg-transparent"
                              >
                                <Trash2Icon className="h-4 w-4" />
                                <span className="sr-only">Eliminar respuesta</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Esto eliminará permanentemente la última respuesta
                                  municipal.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteLastResponse}>Eliminar</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge
                        className={`${getStateColor(response.situacion_inicial)} px-2 py-1 text-xs font-medium border`}
                      >
                        {response.situacion_inicial}
                      </Badge>
                      <ArrowRightIcon className="h-4 w-4 text-gray-400 transform " />
                      <Badge
                        className={`${getStateColor(response.situacion_posterior)} px-2 py-1 text-xs font-medium border`}
                      >
                        {response.situacion_posterior}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold mb-1">Descripción:</h4>
                      <p className="text-sm text-gray-600">{response.descripcion}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold mb-1">Acciones:</h4>
                      <p className="text-sm text-gray-600">{response.acciones}</p>
                    </div>

                    {/* SECCIÓN DE EVIDENCIA ÉPICA */}
                    {evidenciaResponse.length > 0 && (
                      <div className="border-t pt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <PaperclipIcon className="w-4 h-4 text-green-600" />
                          <h4 className="text-sm font-semibold text-green-700">Evidencia de Resolución</h4>
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                            {evidenciaResponse.length} archivo{evidenciaResponse.length !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                        <EvidenceGallery evidencia={evidenciaResponse} />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>

      <EditMunicipalResponseModal
        isOpen={!!editingResponse}
        onClose={handleCloseModal}
        response={editingResponse}
        onSave={handleSaveEdit}
      />
    </>
  )
}

export default MunicipalResponsesList
