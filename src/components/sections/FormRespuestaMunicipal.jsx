"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useState, useEffect, useRef } from "react"
import { format } from "date-fns"
import useAxiosPrivate from "../../hooks/useAxiosPrivate"
import { DialogClose } from "@radix-ui/react-dialog"
import {
  AlertCircle,
  Info,
  Upload,
  File,
  ImageIcon,
  FileText,
  X,
  Eye,
  Camera,
  Paperclip,
  CheckCircle,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

const stateOrder = ["Pendiente", "Recibido", "En curso", "Resuelto", "No Resuelto"]
const finalStates = ["Resuelto", "No Resuelto"]

// Tipos de archivo permitidos
const ALLOWED_FILE_TYPES = {
  images: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
  documents: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  others: [
    "text/plain",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_FILES = 5

export function MunicipalResponseForm({
  onSubmit,
  previousStatus,
  situationMap,
  statusConfig,
  publicacion,
  setPublicacion,
  id,
}) {
  const [description, setDescription] = useState("")
  const [actions, setActions] = useState("")
  const [currentStatus, setCurrentStatus] = useState("")
  const [fecha, setFecha] = useState("")
  const [evidenceFiles, setEvidenceFiles] = useState([])
  const [uploadProgress, setUploadProgress] = useState({})
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const axiosPrivate = useAxiosPrivate()

  useEffect(() => {
    if (previousStatus === "En curso") {
      setCurrentStatus("Resuelto")
    } else {
      const currentIndex = stateOrder.indexOf(previousStatus)
      if (currentIndex < stateOrder.length - 1 && !finalStates.includes(previousStatus)) {
        setCurrentStatus(stateOrder[currentIndex + 1])
      }
    }
  }, [previousStatus])

  // Validar tipo de archivo
  const validateFile = (file) => {
    const allAllowedTypes = [
      ...ALLOWED_FILE_TYPES.images,
      ...ALLOWED_FILE_TYPES.documents,
      ...ALLOWED_FILE_TYPES.others,
    ]

    if (!allAllowedTypes.includes(file.type)) {
      toast({
        title: "Tipo de archivo no permitido",
        description: `El archivo ${file.name} no es un tipo válido.`,
        variant: "destructive",
      })
      return false
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Archivo muy grande",
        description: `El archivo ${file.name} excede el límite de 10MB.`,
        variant: "destructive",
      })
      return false
    }

    return true
  }

  // Manejar selección de archivos
  const handleFileSelect = (files) => {
    const fileArray = Array.from(files)

    if (evidenceFiles.length + fileArray.length > MAX_FILES) {
      toast({
        title: "Límite de archivos excedido",
        description: `Solo puedes subir máximo ${MAX_FILES} archivos.`,
        variant: "destructive",
      })
      return
    }

    const validFiles = fileArray.filter(validateFile)

    const newFiles = validFiles.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      uploaded: false,
      uploading: false,
    }))

    setEvidenceFiles((prev) => [...prev, ...newFiles])
  }

  // Manejar drag and drop
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    handleFileSelect(files)
  }

  // Remover archivo
  const removeFile = (fileId) => {
    setEvidenceFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === fileId)
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return prev.filter((f) => f.id !== fileId)
    })
  }

  // Subir archivo individual
  const uploadFile = async (fileData) => {
    const formData = new FormData()
    formData.append("file", fileData.file)
    formData.append("publicacion_id", id)
    formData.append("tipo", "evidencia")

    try {
      setEvidenceFiles((prev) => prev.map((f) => (f.id === fileData.id ? { ...f, uploading: true } : f)))

      const response = await axiosPrivate.post("/upload-evidence/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress((prev) => ({ ...prev, [fileData.id]: progress }))
        },
      })

      setEvidenceFiles((prev) =>
        prev.map((f) =>
          f.id === fileData.id
            ? {
                ...f,
                uploading: false,
                uploaded: true,
                url: response.data.url,
              }
            : f,
        ),
      )

      toast({
        title: "Archivo subido exitosamente",
        description: `${fileData.name} se ha subido correctamente.`,
      })
    } catch (error) {
      console.error("Error uploading file:", error)
      setEvidenceFiles((prev) => prev.map((f) => (f.id === fileData.id ? { ...f, uploading: false } : f)))

      toast({
        title: "Error al subir archivo",
        description: `No se pudo subir ${fileData.name}.`,
        variant: "destructive",
      })
    }
  }

  // Obtener icono según tipo de archivo
  const getFileIcon = (type) => {
    if (type.startsWith("image/")) return <ImageIcon className="w-5 h-5 text-blue-500" />
    if (type === "application/pdf") return <FileText className="w-5 h-5 text-red-500" />
    if (type.includes("word")) return <FileText className="w-5 h-5 text-blue-600" />
    return <File className="w-5 h-5 text-gray-500" />
  }

  // Formatear tamaño de archivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const changeStatus = () => {
    const url = `publicaciones/${id}/`
    axiosPrivate
      .patch(url, { situacion: situationMap[currentStatus] })
      .then((response) => {
        console.log(response)
        setPublicacion({ ...publicacion, situacion: { nombre: statusConfig[currentStatus].label } })
        console.log(response.data)
      })
      .catch((error) => {
        console.log(error)
      })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const date = new Date().toISOString()

    if (finalStates.includes(previousStatus)) {
      return
    }

    // Subir archivos pendientes
    const pendingFiles = evidenceFiles.filter((f) => !f.uploaded && !f.uploading)
    pendingFiles.forEach(uploadFile)

    onSubmit({
      usuario: 1,
      situacion_inicial: previousStatus,
      situacion_posterior: currentStatus,
      fecha: date,
      descripcion: description,
      acciones: actions,
      evidencia: evidenceFiles.filter((f) => f.uploaded).map((f) => f.url),
    })

    changeStatus()
    setDescription("")
    setActions("")
    setEvidenceFiles([])
  }

  const getNextStatus = () => {
    if (previousStatus === "En curso") {
      return ["Resuelto", "No Resuelto"]
    }
    const currentIndex = stateOrder.indexOf(previousStatus)
    return currentIndex < stateOrder.length - 1 && !finalStates.includes(previousStatus)
      ? [stateOrder[currentIndex + 1]]
      : null
  }

  const nextStatus = getNextStatus()

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-green-700 flex items-center gap-2">
          <Paperclip className="w-5 h-5" />
          Nueva Respuesta Municipal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {finalStates.includes(previousStatus) ? (
          <div className="text-center">
            <p className="text-amber-600 font-semibold mb-4">
              El proceso ha finalizado. No se pueden crear más respuestas municipales.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Info className="w-4 h-4 mr-2" />
                  Ver más información
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    <AlertCircle className="w-5 h-5 inline-block mr-2 text-amber-500" />
                    Proceso Finalizado
                  </DialogTitle>
                  <DialogDescription>
                    El estado actual es {previousStatus}, lo cual indica que el proceso ha concluido. No se pueden crear
                    más respuestas municipales cuando el proceso está en un estado final.
                  </DialogDescription>
                </DialogHeader>
                <DialogClose asChild>
                  <Button variant="outline">Cerrar</Button>
                </DialogClose>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current-status">Estado Actual</Label>
                <Input id="current-status" value={previousStatus} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-status">Estado Nuevo</Label>
                {nextStatus ? (
                  <Select
                    value={currentStatus}
                    onValueChange={setCurrentStatus}
                    disabled={previousStatus !== "En curso"}
                  >
                    <SelectTrigger id="new-status">
                      <SelectValue>{currentStatus}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {nextStatus.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input id="new-status" value="Estado final alcanzado" disabled />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                value={format(new Date(), "dd/MM/yyyy")}
                onChange={(e) => setFecha(e.target.value)}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Ingrese una descripción de la respuesta..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="actions">Acciones</Label>
              <Textarea
                id="actions"
                placeholder="Ingrese las acciones tomadas..."
                value={actions}
                onChange={(e) => setActions(e.target.value)}
                required
              />
            </div>

            {/* SECCIÓN DE EVIDENCIA ÉPICA */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-lg font-semibold text-green-700">Evidencia de Resolución</Label>
                <Badge variant="outline" className="text-xs">
                  {evidenceFiles.length}/{MAX_FILES} archivos
                </Badge>
              </div>

              {/* Zona de Drop */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                  isDragging
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 hover:border-green-400 hover:bg-gray-50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Upload className="w-8 h-8 text-green-500" />
                    <Camera className="w-6 h-6 text-blue-500" />
                    <FileText className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-700">
                      Arrastra archivos aquí o
                      <Button
                        type="button"
                        variant="link"
                        className="p-0 h-auto text-green-600 font-semibold"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        selecciona archivos
                      </Button>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Imágenes, PDFs, documentos • Máximo 10MB por archivo</p>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.txt,.xls,.xlsx"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />
              </div>

              {/* Lista de Archivos */}
              {evidenceFiles.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">Archivos seleccionados:</h4>
                  <div className="space-y-2">
                    {evidenceFiles.map((fileData) => (
                      <div key={fileData.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                        {/* Preview o Icono */}
                        <div className="flex-shrink-0">
                          {fileData.preview ? (
                            <div className="relative">
                              <img
                                src={fileData.preview || "/placeholder.svg"}
                                alt={fileData.name}
                                className="w-12 h-12 object-cover rounded border"
                              />
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="absolute -top-1 -right-1 w-6 h-6 bg-white shadow-sm"
                                  >
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl">
                                  <DialogHeader>
                                    <DialogTitle>{fileData.name}</DialogTitle>
                                  </DialogHeader>
                                  <img
                                    src={fileData.preview || "/placeholder.svg"}
                                    alt={fileData.name}
                                    className="w-full h-auto max-h-[70vh] object-contain"
                                  />
                                </DialogContent>
                              </Dialog>
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-white rounded border flex items-center justify-center">
                              {getFileIcon(fileData.type)}
                            </div>
                          )}
                        </div>

                        {/* Info del Archivo */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">{fileData.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(fileData.size)}</p>

                          {/* Progress Bar */}
                          {fileData.uploading && (
                            <div className="mt-2">
                              <Progress value={uploadProgress[fileData.id] || 0} className="h-2" />
                              <p className="text-xs text-blue-600 mt-1">
                                Subiendo... {uploadProgress[fileData.id] || 0}%
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Estado y Acciones */}
                        <div className="flex items-center gap-2">
                          {fileData.uploaded && (
                            <Badge variant="outline" className="text-green-600 border-green-300">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Subido
                            </Badge>
                          )}

                          {fileData.uploading && (
                            <Badge variant="outline" className="text-blue-600 border-blue-300">
                              <Upload className="w-3 h-3 mr-1" />
                              Subiendo
                            </Badge>
                          )}

                          {!fileData.uploaded && !fileData.uploading && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => uploadFile(fileData)}
                              className="text-green-600 border-green-300 hover:bg-green-50"
                            >
                              <Upload className="w-3 h-3 mr-1" />
                              Subir
                            </Button>
                          )}

                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => removeFile(fileData.id)}
                            className="w-8 h-8 text-red-500 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white"
              disabled={finalStates.includes(previousStatus)}
            >
              <Paperclip className="w-4 h-4 mr-2" />
              Guardar Respuesta con Evidencia
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

export default MunicipalResponseForm
