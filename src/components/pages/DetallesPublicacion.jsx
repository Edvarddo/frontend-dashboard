import React from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeftIcon, MapPinIcon, ImageIcon, FileIcon, Info, Pencil, CheckCircle2, Clock, MailQuestion } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
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
import axios from 'axios';
import { set } from 'date-fns';
import TopBar from '../TopBar';
import { useNavigate } from 'react-router-dom';
import useAxiosPrivate from '../../hooks/useAxiosPrivate'

const DetallesPublicacion = ({ isOpened, setIsOpened }) => {
  const axiosPrivate = useAxiosPrivate();
  const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
  });

  L.Marker.prototype.options.icon = DefaultIcon;
  const { id } = useParams();
  const [loading, setLoading] = useState(true)
  const [situationLoading, setSituationLoading] = useState(false)
  const [error, setError] = useState(null)
  const [publicacion, setPublicacion] = useState({})
  const statusConfig = {
    received: { label: 'Recibido', icon: <MailQuestion className="h-4 w-4" />, color: 'bg-yellow-500' },
    inProcess: { label: 'En curso', icon: <Clock className="h-4 w-4" />, color: 'bg-blue-500' },
    resolved: { label: 'Resuelto', icon: <CheckCircle2 className="h-4 w-4" />, color: 'bg-green-500' },
  }
  const navigate = useNavigate();

  const [status, setStatus] = useState('received')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false)
  const [tempStatus, setTempStatus] = useState(status)

  const url_local = import.meta.env.VITE_URL_PROD_VERCEL
  const url = `publicaciones/${id}/`
  const fetchPublicacion = (url) => {
    setLoading(true)
    axiosPrivate.get(url
    ).then(response => {
      console.log(response.data)
      setPublicacion(response.data)
      setLoading(false)
    })
      .catch(error => {
        setError(error)
        setLoading(false)
      })

  }
  useEffect(() => {
    fetchPublicacion(url)
  }, [])
  const handleOpenSidebar = () => {
    setIsOpened(!isOpened)
  }
  const handleStatusChange = (newStatus) => {
    setTempStatus(newStatus)
    setStatus(newStatus)
  }

  const openDialog = () => {
    setTempStatus(status)
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setTempStatus(status)
  }

  const openAlertDialog = () => {
    setIsAlertDialogOpen(true)
  }

  const closeAlertDialog = () => {
    setIsAlertDialogOpen(false)
  }

  const confirmStatusChange = () => {
    setStatus(tempStatus)

    const url = `publicaciones/${id}/`
    axiosPrivate.patch(url, { situacion: tempStatus === 'received' ? 1 : tempStatus === 'inProcess' ? 2 : 3 })
      .then(response => {
        console.log(response)
        setPublicacion({ ...publicacion, situacion: { nombre: tempStatus === 'received' ? 'Recibido' : tempStatus === 'inProcess' ? 'En curso' : 'Resuelto' } })
        console.log(response.data)
      })
      .catch(error => {
        console.log(error)
      })
    setIsDialogOpen(false)
    setIsAlertDialogOpen(false)

  }

  const cancelStatusChange = () => {
    setTempStatus(status)
    setIsAlertDialogOpen(false)
  }
  const [activeTab, setActiveTab] = useState('info')
  const handleDownload = (id, archivo) => {
    console.log("downloading file with id: ", id)
    const imageUrl = "https://res.cloudinary.com/de06451wd/" + archivo

    const link = document.createElement('a');
    link.href = imageUrl;
    link.setAttribute('download', 'download');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  return (
    <>
      <TopBar handleOpenSidebar={handleOpenSidebar} title="Detalles de la publicación" />
      <div className='p-8 bg-gray-100 min-h-screen'>
        <Card className="w-full max-w-4xl mx-auto bg-white">
          <CardHeader className="border-b">
            <div className="flex flex-wrap justify-between   mb-4 ">
              <Button onClick={() => navigate("/listado-publicaciones")} variant="outline" className=" mb-4 bg-white text-green-600 border-green-600 hover:bg-green-50 w-full lg:w-[unset]">
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                <span>Volver al listado</span>
              </Button>

              <div className='flex w-full lg:w-[unset]   justify-center'>
                <Button
                  variant={activeTab === 'info' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('info')}
                  className={`pub-detail-tab w-[32%]  ${activeTab === 'info' ? 'bg-green-600 text-white' : 'text-green-600'}`}
                >
                  <Info className=" h-4 w-4 mr-2" />
                  <span className="hidden md:inline">Información</span>
                </Button>
                <Button
                  variant={activeTab === 'ubicacion' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('ubicacion')}
                  className={`pub-detail-tab w-[32%]  ${activeTab === 'ubicacion' ? 'bg-green-600 text-white' : 'text-green-600'}`}
                >
                  <MapPinIcon className=" h-4 w-4 mr-2" />
                  <span className="hidden md:inline">
                    Ubicación
                  </span>
                </Button>
                <Button
                  variant={activeTab === 'evidencias' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('evidencias')}
                  className={`pub-detail-tab w-[32%] ${activeTab === 'evidencias' ? 'bg-green-600 text-white  ' : 'text-green-600'}`}
                >
                  <ImageIcon className=" h-4 w-4 mr-2" />
                  <span className="hidden md:inline">Evidencias</span>
                </Button>
              </div>
            </div>
            <CardTitle className="text-2xl text-green-700">
              {
                loading ? <Skeleton className="h-8 w-full" /> : publicacion?.titulo
              }
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {activeTab === 'info' && (
              <div className="space-y-6">
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
                                      <SelectItem value="received">Recibido {publicacion?.situacion?.nombre === 'Recibido' ? (<Badge>Actual</Badge>) : ""}</SelectItem>
                                      <SelectItem value="inProcess">En curso {publicacion?.situacion?.nombre === 'En curso' ? (<Badge>Actual</Badge>) : ""}</SelectItem>
                                      <SelectItem value="resolved">Resuelto {publicacion?.situacion?.nombre === 'Resuelto' ? (<Badge>Actual</Badge>) : ""}</SelectItem>
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
                    </CardContent>
                  </Card>
                </div>
                <Card>
                  <CardHeader>
<CardTitle className="text-green-700">Respuestas Municipales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {
                        [1, 2, 3].map((item) => (
                          <li key={item} className="flex items-center space-x-4">
                            <Skeleton className="h-[50px] w-full " />
                          </li>
                        ))
                      }
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}
            {activeTab === 'ubicacion' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-700">Ubicación de la publicación</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className=" bg-green-100 rounded-md overflow-hidden flex items-center justify-center w-full h-full">
                    {
                      loading ? <Skeleton className="h-96 w-full" /> : (
                        publicacion.latitud ? (
                          <MapContainer
                            center={[publicacion?.latitud, publicacion?.longitud]}
                            zoom={16}
                            minZoom={13}
                            maxZoom={18}
                          >
                            <TileLayer
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker
                              position={[publicacion?.latitud, publicacion?.longitud]}
                            >
                              <Popup>
                                {publicacion?.junta_vecinal?.nombre_calle}
                              </Popup>
                            </Marker>
                          </MapContainer>
                        ) : (
                          <div className='bg-gray-200 h-96'>
                          </div>
                        )
                      )
                    }
                  </div>
                </CardContent>
              </Card>
            )}
            {activeTab === 'evidencias' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-700">Evidencias de la publicación</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`p-1 ${publicacion?.evidencias?.length > 0 ? "grid grid-cols-1 md:grid-cols-2 gap-4" : ""}`}>
                    {loading ? (
                      // 3 skeleton cards
                      [1, 2, 3].map((item) => (
                        <Card key={item} className="w-full">
                          <CardContent className="p-4">
                            <Skeleton className="h-48 w-full" />
                            <Skeleton className="h-4 w-full mt-2" />
                          </CardContent>
                        </Card>
                      ))
                    ) : publicacion?.evidencias?.length > 0 ? (
                      publicacion.evidencias.map((evidencia) => (
                        <Card key={evidencia.id} className="w-full">
                          <CardContent className="p-4">
                            <img src={`https://res.cloudinary.com/de06451wd/${evidencia.archivo}`} alt={evidencia.nombre} className="w-full h-48 object-cover" />
                            <div className="flex justify-between items-center mt-2">
                              <p>{evidencia.nombre}</p>
                              <Button variant="outline" className="text-green-600" onClick={() => handleDownload(evidencia.id, evidencia.archivo)}>
                                <FileIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 px-4 w-full">
                        <div className="bg-gray-100 p-4 rounded-full mb-4">
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No hay evidencias disponibles</h3>
                        <p className="text-sm text-gray-500">No se encontraron imágenes para esta publicación</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default DetallesPublicacion

