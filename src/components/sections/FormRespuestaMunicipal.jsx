import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import useAxiosPrivate from "../../hooks/useAxiosPrivate"
import { DialogClose } from "@radix-ui/react-dialog"
import { AlertCircle, Info, Paperclip, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import FileUpload from '../FileUpload'; // Importa el nuevo componente
import useFileHandling from '../../hooks/useFileHandling'; // Importa el nuevo hook
import useAuth from '../../hooks/useAuth';
const stateOrder = ["Pendiente", "Recibido", "En curso", "Resuelto", "No Resuelto"]
const finalStates = ["Resuelto", "No Resuelto"]

export function MunicipalResponseForm({
  onSubmit,
  onUploadComplete,
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
  const [isUploading, setIsUploading] = useState(false);

  const axiosPrivate = useAxiosPrivate()

  const {
    files,
    isDragging,
    uploadProgress,
    setUploadProgress,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    removeFile,
    resetFiles,
  } = useFileHandling();
  const { departamentoId, userId } = useAuth();

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

  const changeStatus = async () => {
    const url = `publicaciones/${id}/`
    try {
      const response = await axiosPrivate.patch(url, { situacion: situationMap[currentStatus] })
      setPublicacion({ ...publicacion, situacion: { nombre: statusConfig[currentStatus].label } })
    } catch (error) {
      console.error("Error al cambiar estado:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la publicación.",
        variant: "destructive",
      });
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (finalStates.includes(previousStatus)) {
      return
    }

    setIsUploading(true);
    setUploadProgress({});

    // 1. Crear la respuesta municipal
    const createdResponse = await onSubmit({
      usuario: userId ? userId : null, // O el ID del usuario actual
      situacion_inicial: previousStatus,
      situacion_posterior: currentStatus,
      fecha: new Date().toISOString(),
      descripcion: description,
      acciones: actions,
    });

    if (!createdResponse || !createdResponse.id) {
      toast({
        title: "Error",
        description: "No se pudo crear la respuesta municipal. La subida de archivos fue cancelada.",
        variant: "destructive",
      });
      setIsUploading(false);
      return;
    }

    // 2. Subir las evidencias (secuencialmente)
    if (files.length > 0) {
      for (const fileData of files) {
        const formData = new FormData();
        formData.append('respuesta', createdResponse.id);
        formData.append('archivo', fileData.file);
        formData.append('extension', fileData.name.split('.').pop() || 'unknown');
        formData.append('nombre', fileData.name);
        formData.append('peso', fileData.size);
        formData.append('descripcion', `Evidencia para ${fileData.name}`);

        try {
          await axiosPrivate.post('/evidencia-respuesta/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
              setUploadProgress((prev) => ({ ...prev, [fileData.id]: progress }))
            },
          });
        } catch (error) {
          console.error(`Error al subir el archivo ${fileData.name}:`, error);
          toast({
            title: "Error al subir evidencia",
            description: `No se pudo subir el archivo ${fileData.name}. El proceso se detendrá.`,
            variant: "destructive",
          });
          setIsUploading(false); // Detener el proceso si un archivo falla
          return; // Salir de handleSubmit
        }
      }
    }

    // 3. Cambiar el estado de la publicación (AHORA CON AWAIT)
    await changeStatus()


    // 4. Limpiar formulario y notificar al padre
    toast({
      title: "Éxito",
      description: "La respuesta y la evidencia se guardaron correctamente.",
      className: "bg-green-500 text-white",
    });
    setDescription("")
    setActions("")
    resetFiles()
    setIsUploading(false)

    // 5. Notificar al padre para que recargue los datos
    if (onUploadComplete) {
      onUploadComplete();
    }

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

            <FileUpload
              files={files}
              isDragging={isDragging}
              handleFileChange={handleFileChange}
              handleDragOver={handleDragOver}
              handleDragLeave={handleDragLeave}
              handleDrop={handleDrop}
              removeFile={removeFile}
              isUploading={isUploading}
              setUploadProgress={setUploadProgress}
              uploadProgress={uploadProgress}
            />

            {isUploading && !files.length && ( // Mensaje si solo se está guardando
              <div className="flex items-center justify-center space-x-2 mt-4">
                <Loader2 className="h-5 w-5 animate-spin text-green-600" />
                <span className="text-green-600">Guardando respuesta...</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white"
              disabled={finalStates.includes(previousStatus) || isUploading}
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Paperclip className="w-4 h-4 mr-2" />
              )}
              {isUploading ? 'Guardando...' : 'Guardar Respuesta con Evidencia'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

export default MunicipalResponseForm