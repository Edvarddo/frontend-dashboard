import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from '../ui/skeleton'
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

const InfoPublicacion = ({ loading, publicacion, id, setPublicacion }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [status, setStatus] = useState('Pendiente')
  const [tempStatus, setTempStatus] = useState(status)
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false)
  const [situationLoading, setSituationLoading] = useState(false)
  const [showResponseForm, setShowResponseForm] = useState(false)
  const [responses, setResponses] = useState([])
  const [responsesLoading, setResponsesLoading] = useState(false)
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
  const handleAddResponse = async (newResponse) => {
    try {
      console.log('newResponse:', newResponse)
      const response = await axiosPrivate.post('respuestas-municipales/', {
        ...newResponse,
        publicacion: id
      })
      // Fetch the updated responses after adding a new one
      fetchResponses()
      setShowResponseForm(false)
    } catch (error) {
      console.error('Error adding municipal response:', error)
    }
  }
  const fetchResponses = async () => {
    setResponsesLoading(true)
    try {
      const response = await axiosPrivate.get(`https://clubdelamusica-pruebas.com/api/v1/respuestas-municipales/por-publicacion/${id}/`)
      console.log('responses:', response.data)
      setResponses(response.data)
    } catch (error) {
      console.error('Error fetching municipal responses:', error)
    } finally {
      setResponsesLoading(false)
    }
  }
  useEffect(() => {
    console.log('id:', id)
    if (id) {
      fetchResponses()
    }
  }, [id])
  return (
    <>
      <div className="grid grid-cols-1  gap-6">
        <Card className="w-full mx-auto">
          <CardHeader>
            <CardTitle className="text-green-700">Información general</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-green-600">Nombre de usuario:</p>
                  <p>
                    {loading ? <Skeleton className="h-[1.5rem] w-full" /> : publicacion?.usuario?.nombre}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-green-600">Rut:</p>
                  <p>
                    {loading ? <Skeleton className="h-[1.5rem] w-full" /> : publicacion?.usuario?.rut}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-green-600">Teléfono:</p>
                  <p>
                    {
                      loading ? <Skeleton className="h-[1.5rem] w-full" /> : publicacion?.usuario?.numero_telefonico_movil ? publicacion?.usuario?.numero_telefonico_movil : "No disponible"
                    }
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-green-600">Categoría:</p>
                  <p>
                    {loading ? <Skeleton className="h-[1.5rem] w-full" /> : publicacion?.categoria?.nombre}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-green-600">Fecha de publicación:</p>
                  <p>
                    {loading ? <Skeleton className="h-[1.5rem] w-full" /> : new Date(publicacion.fecha_publicacion).toLocaleDateString('es-CL')}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-green-600">Junta Vecinal:</p>
                  <p>
                    {loading ? <Skeleton className="h-[1.5rem] w-full" /> : publicacion?.junta_vecinal?.nombre_calle}
                  </p>
                </div>
                <div className="space-y-1">
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
                        <Button className={"h-[1.5rem] w-[1.5rem]"} variant="outline" size="icon" onClick={openDialog} disabled={loading}>
                          <Pencil className="" />
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
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-green-600">Responsable:</p>
                  <p>
                    {loading ? <Skeleton className="h-[1.5rem] w-full" /> : 'Administrador Municipal'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-green-600">Departamento:</p>
                  <p>
                    {
                      loading ? <Skeleton className="h-[1.5rem] w-full" /> : publicacion?.departamento?.nombre
                    }
                  </p>
                </div>
              </div>
            </div>
            <FlujoEstado currentStatus={publicacion?.situacion?.nombre} />
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6 ">
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
              onSubmit={handleAddResponse}
              previousStatus={publicacion?.situacion?.nombre}
              currentStatus={publicacion?.situacion?.nombre}
              statusConfig={statusConfig}
              situationMap={situationMap}
              publicacion={publicacion}
              id={id}
              setPublicacion={setPublicacion}


            />
          )}

          <ListaRespuestaMunicipal responses={responses} loading={responsesLoading} />
        </CardContent>
      </Card>
    </>
  )
}

export default InfoPublicacion

