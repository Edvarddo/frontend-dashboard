import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Pencil, CheckCircle2, Clock, MailQuestion, AlertCircle, XCircle } from 'lucide-react'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import FlujoEstado from '../FlujoEstado'
import FormRespuestaMunicipal from './FormRespuestaMunicipal'
import ListaRespuestaMunicipal from './ListaRespuestaMunicipal'
import { format, addHours, isAfter } from 'date-fns'
import { toast } from '@/hooks/use-toast'
import {API_ROUTES} from '../../api/apiRoutes'

const InfoPublicacion = ({ loading, publicacion, id, setPublicacion }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [status, setStatus] = useState('Pendiente')
  const [tempStatus, setTempStatus] = useState(status)
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false)
  const [situationLoading, setSituationLoading] = useState(false)
  const [showResponseForm, setShowResponseForm] = useState(false)
  const [responses, setResponses] = useState([])
  const [isLoadingStatus, setIsLoadingStatus] = useState(false)
  const [departaments, setDepartaments] = useState([])
  const [responsesLoading, setResponsesLoading] = useState(false)
  const [isDepartmentDialogOpen, setIsDepartmentDialogOpen] = useState(false)
  const [isAlertDialogOpenDepartment, setIsAlertDialogOpenDepartment] = useState(false)
  const [tempDepartment, setTempDepartment] = useState(null)
  const statusConfig = {
    "Pendiente": { label: 'Pendiente', icon: <AlertCircle className="h-4 w-4" />, color: 'bg-orange-500' },
    "Recibido": { label: 'Recibido', icon: <MailQuestion className="h-4 w-4" />, color: 'bg-yellow-500' },
    "En curso": { label: 'En curso', icon: <Clock className="h-4 w-4" />, color: 'bg-blue-500' },
    "Resuelto": { label: 'Resuelto', icon: <CheckCircle2 className="h-4 w-4" />, color: 'bg-green-500' },
    "No Resuelto": { label: 'No Resuelto', icon: <XCircle className="h-4 w-4" />, color: 'bg-red-500' },
  }
  const situationMap = {
    "Pendiente": 4,
    "Recibido": 1,
    "En curso": 2,
    "Resuelto": 3,
    "No Resuelto": 5
  }
  const getDepartaments = () => {
    axiosPrivate.get(API_ROUTES.DEPARTAMENTOS.ROOT)
      .then(response => {
        setDepartaments(response.data)
        console.log('Departaments:', response.data)
      })
      .catch(error => {
        console.error('Error fetching departaments:', error)
      })
  }
  const axiosPrivate = useAxiosPrivate()

  const openDialog = () => {
    setTempStatus(status)
    setIsDialogOpen(true)
  }
  const handleStatusChange = (newStatus) => {
    setTempStatus(newStatus)
    setStatus(newStatus)
  }
  const openAlertDialog = () => {
    setIsAlertDialogOpen(true)
  }
  const cancelStatusChange = () => {
    setTempStatus(status)
    setIsAlertDialogOpen(false)
  }

  const currentConfig = statusConfig[publicacion?.situacion?.nombre] || statusConfig.Pendiente
  const canEditStatus =
    publicacion?.situacion?.nombre !== "Resuelto" && publicacion?.situacion?.nombre !== "No Resuelto"


  useEffect(() => {
    if (publicacion?.situacion?.nombre) {
      setStatus(publicacion.situacion.nombre)
      setTempStatus(publicacion.situacion.nombre)
    }
  }, [publicacion])


  const changeStatus = () => {
    const url = `publicaciones/${id}/`
    axiosPrivate.patch(url, { situacion: situationMap[tempStatus] })
      .then(response => {
        console.log(response)
        setPublicacion({ ...publicacion, situacion: { nombre: statusConfig[tempStatus].label } })
        console.log(response.data)
      })
      .catch(error => {
        console.log(error)
      })
  }
  const confirmStatusChange = () => {
    setStatus(tempStatus)
    changeStatus()
    setIsDialogOpen(false)
    setIsAlertDialogOpen(false)
  }

  // 1. 'onSubmit' (ANTES 'handleAddResponse')
  //    Ahora solo crea la respuesta y la retorna.
  const createMunicipalResponse = async (newResponse) => {
    try {
      console.log('newResponse:', newResponse)
      const response = await axiosPrivate.post(API_ROUTES.RESPUESTAS_MUNICIPALES.ROOT, {
        ...newResponse,
        publicacion: id
      })

      // ¡NO hay fetchResponses() ni setShowResponseForm(false) aquí!
      // El formulario ahora controla esto.

      // Simplemente retornamos la respuesta creada para que el formulario 
      // pueda usar su ID para la subida de archivos.
      return response.data;

    } catch (error) {
      console.error('Error creating municipal response:', error)
      toast({
        title: "Error al crear respuesta",
        description: "No se pudo crear la respuesta. La subida de archivos fue cancelada.",
        variant: "destructive",
      });
      return null; // Retornamos null para que el formulario sepa que falló
    }
  }

  // 2. ¡NUEVA FUNCIÓN! Se ejecutará DESPUÉS de que el formulario termine todo.
  const handleUploadComplete = () => {
    fetchResponses()      // Ahora recargamos los datos
    setShowResponseForm(false) // Y ahora ocultamos el formulario
  }

  const fetchResponses = async () => {
    setResponsesLoading(true)
    try {
      const response = await axiosPrivate.get(API_ROUTES.RESPUESTAS_MUNICIPALES.DETAIL(id))
      setResponses(response.data)
    } catch (error) {
      if (error.status === 404) {
        setResponses([])
      }
    } finally {
      setResponsesLoading(false)
    }
  }

  const onEditResponse = async (updatedResponse, id) => {
    console.log('updatedResponse:', updatedResponse)


    try {
      const response = await axiosPrivate.patch(API_ROUTES.RESPUESTAS_MUNICIPALES.ROOT_ID(id), updatedResponse)
      fetchResponses()
      toast({
        title: "Respuesta actualizada",
        description: "La respuesta municipal ha sido actualizada exitosamente.",
        duration: 5000,
        className: "bg-green-500 text-white",
      });

    } catch (error) {
      console.error('Error updating municipal response:', error)
      toast({
        title: "Error al actualizar respuesta",
        description: "Ha ocurrido un error al intentar actualizar la respuesta municipal.",
        duration: 5000,
        className: "bg-red-500 text-white",
      });

    }
  }
  const onDeleteResponse = async (id) => {


    try {
      const lastResponse = responses[responses.length - 1];

      await axiosPrivate.delete(API_ROUTES.RESPUESTAS_MUNICIPALES.ROOT_ID(id))


      // Cambiar el estado de la publicación al estado anterior
      const previousStatus = lastResponse.situacion_inicial;
      const previousStatusId = situationMap[previousStatus];

      await axiosPrivate.patch(API_ROUTES.PUBLICACIONES.DETAIL(publicacion.id), { situacion: previousStatusId })

      // Actualizar el estado en el frontend
      setPublicacion(prev => ({ ...prev, situacion: { nombre: previousStatus } }))

      // Obtener nuevamente las respuestas

      fetchResponses()
      toast({
        title: "Respuesta eliminada",
        description: "La respuesta municipal ha sido eliminada exitosamente.",
        duration: 5000,
        className: "bg-green-500 text-white",
      });

    } catch (error) {
      toast({
        title: "Error al eliminar respuesta",
        description: "Ha ocurrido un error al intentar eliminar la respuesta municipal.",
        duration: 5000,
        className: "bg-red-500 text-white",
      });
    }
  }
  const formatPhoneNumber = (numero) => {
    if (!numero) return null;
    return `+56 9 ${numero.slice(1)}`;
  }
  const formatRut = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 1) return cleaned;

    let formatted = cleaned.slice(0, -1).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    return formatted + '-' + cleaned.slice(-1);
  };
  const handleDepartmentChange = (value) => {
    const selectedDepartment = departaments.find(dept => dept.id.toString() === value);
    setTempDepartment(selectedDepartment);
  };
  const confirmDepartmentChange = async () => {
    if (tempDepartment) {
      try {
        await axiosPrivate.patch(API_ROUTES.PUBLICACIONES.DETAIL(id), { departamento: tempDepartment.id });
        setPublicacion(prev => ({ ...prev, departamento: tempDepartment }));
        toast({
          title: "Departamento actualizado",
          description: "El departamento ha sido actualizado exitosamente.",
          duration: 5000,
          className: "bg-green-500 text-white",
        });
      } catch (error) {
        console.error('Error updating department:', error);
        toast({
          title: "Error al actualizar departamento",
          description: "Ha ocurrido un error al intentar actualizar el departamento.",
          duration: 5000,
          className: "bg-red-500 text-white",
        });
      }
    }
    setIsAlertDialogOpenDepartment(false);
    setIsDepartmentDialogOpen(false);
  };
  useEffect(() => {
    console.log('id:', id)
    if (id) {
      fetchResponses()
      getDepartaments()
    }
  }, [id])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Information Card */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-green-700">Información del Usuario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">

              <div className="space-y-1">
                <p className="text-sm font-medium text-green-600">Nombre de usuario:</p>
                <p>
                  {loading ? <Skeleton className="h-[1.5rem] w-full" /> : publicacion?.usuario?.nombre}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-600">Rut:</p>
                <p>
                  {loading ? <Skeleton className="h-[1.5rem] w-full" /> : formatRut(publicacion?.usuario?.rut)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-600">Teléfono:</p>
                <p>
                  {loading ? <Skeleton className="h-[1.5rem] w-full" /> :
                    formatPhoneNumber(publicacion?.usuario?.numero_telefonico_movil) || "No disponible"
                  }
                </p>
              </div>
              {/* email */}
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-600">Correo:</p>
                <p>
                  {loading ? <Skeleton className="h-[1.5rem] w-full" /> : publicacion?.usuario?.email}
                </p>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Publication Information Card */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-green-700">Información de la Publicación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-600">Código:</p>
                <p>
                  {loading ? <Skeleton className="h-[1.5rem] w-full" /> : publicacion?.codigo}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-600">Categoría:</p>
                <p>
                  {loading ? <Skeleton className="h-[1.5rem] w-full" /> : publicacion?.categoria?.nombre}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-600">Descripción:</p>
                <p className="break-words">
                  {loading ? <Skeleton className="h-[4.5rem] w-full" /> : publicacion?.descripcion || "No disponible"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-600">Fecha de publicación:</p>
                <p>
                  {loading ? <Skeleton className="h-[1.5rem] w-full" /> :
                    format(new Date(publicacion.fecha_publicacion), 'dd-MM-yyyy HH:mm')}
                </p>
              </div>
              {/* <div className="space-y-1">
                <p className="text-sm font-medium text-green-600">Estado:</p>
                <div className="flex items-center space-x-2">
                  <p className="flex-grow">
                    {loading || situationLoading ? <Skeleton className="h-[1.5rem] w-full" /> : (
                      <Badge className="bg-green-100 text-green-800 hover:text-white">
                        {publicacion?.situacion?.nombre}
                      </Badge>
                    )}
                  </p>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        className="h-[1.5rem] w-[1.5rem]"
                        variant="outline"
                        size="icon"
                        onClick={openDialog}
                        disabled={loading}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Editar Estado de la Publicación</DialogTitle>
                      </DialogHeader>
                      <p>Actualiza el estado de la publicación</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`p-2 rounded-full ${statusConfig[status].color}`}>
                            {statusConfig[status].icon}
                          </div>
                          <span className="font-medium">{statusConfig[status].label}</span>
                        </div>
                        <Badge variant="outline">ID: {publicacion?.id} {publicacion?.situacion?.nombre}</Badge>
                      </div>
                      <Select onValueChange={handleStatusChange} value={tempStatus}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pendiente">Pendiente {publicacion?.situacion?.nombre === 'Pendiente' ? (<Badge>Actual</Badge>) : ""}</SelectItem>
                          <SelectItem value="Recibido">Recibido {publicacion?.situacion?.nombre === 'Recibido' ? (<Badge>Actual</Badge>) : ""}</SelectItem>
                          <SelectItem value="En curso">En curso {publicacion?.situacion?.nombre === 'En curso' ? (<Badge>Actual</Badge>) : ""}</SelectItem>
                          <SelectItem value="Resuelto">Resuelto {publicacion?.situacion?.nombre === 'Resuelto' ? (<Badge>Actual</Badge>) : ""}</SelectItem>
                          <SelectItem value="No Resuelto">No resuelto {publicacion?.situacion?.nombre === 'No resuelto' ? (<Badge>Actual</Badge>) : ""}</SelectItem>
                        </SelectContent>
                      </Select>
                      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
                        <AlertDialogTrigger asChild>
                          <Button className="w-full mt-4" onClick={openAlertDialog}>Guardar cambios</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción cambiará el estado de la publicación. ¿Deseas continuar?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={cancelStatusChange}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmStatusChange}>Continuar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DialogContent>
                  </Dialog>
                </div>
              </div> */}
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-600">Responsable:</p>
                <p>
                  {loading ? <Skeleton className="h-[1.5rem] w-full" /> : 'Administrador Municipal'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-600">Departamento:</p>
                <div className="flex items-center space-x-2">
                  <p className="flex-grow">
                    {loading ? <Skeleton className="h-[1.5rem] w-full" /> : publicacion?.departamento?.nombre}
                  </p>
                  <Dialog open={isDepartmentDialogOpen} onOpenChange={setIsDepartmentDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        className="h-[1.5rem] w-[1.5rem]"
                        variant="outline"
                        size="icon"
                        disabled={loading}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Seleccionar Departamento</DialogTitle>
                      </DialogHeader>
                      <Select onValueChange={handleDepartmentChange} value={publicacion?.departamento?.id?.toString()}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar departamento" />
                        </SelectTrigger>
                        <SelectContent>
                          {departaments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id.toString()}>
                              {dept.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button className=" bg-green-500 hover:bg-green-600 text-white w-full mt-4 " onClick={() => setIsAlertDialogOpenDepartment(true)}>Aceptar</Button>
                      <AlertDialog open={isAlertDialogOpenDepartment} onOpenChange={setIsAlertDialogOpenDepartment}>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción cambiará el departamento de la publicación. ¿Deseas continuar?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setIsAlertDialogOpenDepartment(false)}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmDepartmentChange}>Continuar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-600">Junta Vecinal:</p>
                <p>
                  {loading ? <Skeleton className="h-[1.5rem] w-full" /> : publicacion?.junta_vecinal?.nombre_junta}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Flow */}
      <Card className="w-full">
        <CardContent className="pt-6">
          <FlujoEstado currentStatus={publicacion?.situacion?.nombre} />
        </CardContent>
      </Card>

      {/* Municipal Responses Card */}
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-green-700">Respuestas Municipales</CardTitle>
          <Button
            variant="outline"
            className="text-green-600"
            onClick={() => setShowResponseForm(true)}
          >
            Agregar Respuesta
          </Button>
        </CardHeader>
        <CardContent>
          {showResponseForm && (
            <FormRespuestaMunicipal
              onSubmit={createMunicipalResponse}
              onUploadComplete={handleUploadComplete}
              previousStatus={publicacion?.situacion?.nombre}
              currentStatus={publicacion?.situacion?.nombre}
              statusConfig={statusConfig}
              situationMap={situationMap}
              publicacion={publicacion}
              id={id}
              setPublicacion={setPublicacion}
            />
          )}
          <ListaRespuestaMunicipal
            responses={responses}
            loading={responsesLoading}
            onEditResponse={onEditResponse}
            onDeleteResponse={onDeleteResponse}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default InfoPublicacion

