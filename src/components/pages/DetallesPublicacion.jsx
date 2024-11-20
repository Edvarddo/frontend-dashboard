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

const DetallesPublicacion = ({ isOpened, setIsOpened }) => {
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
    inProcess: { label: 'En proceso', icon: <Clock className="h-4 w-4" />, color: 'bg-blue-500' },
    resolved: { label: 'Resuelto', icon: <CheckCircle2 className="h-4 w-4" />, color: 'bg-green-500' },
  }
  const navigate = useNavigate();

  const [status, setStatus] = useState('received')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false)
  const [tempStatus, setTempStatus] = useState(status)

  const url_local = import.meta.env.VITE_URL_PROD_VERCEL
  const url = `${import.meta.env.VITE_URL_PROD_VERCEL}publicaciones/${id}/`
  const fetchPublicacion = (url) => {
    setLoading(true)
    fetch(url,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }

      }
    )
      .then(response => response.json())
      .then(data => {
        setPublicacion(data)
        console.log(data)
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

    const url = `${import.meta.env.VITE_URL_PROD_VERCEL}publicaciones/${id}/`
    axios.patch(url, { situacion: tempStatus === 'received' ? 1 : tempStatus === 'inProcess' ? 2 : 3 })
      .then(response => {

        console.log(response)
        // change situacion/estado in publicacion
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
    // automatically download file with link. open explorer dialog. create element a
    // format to download https://res.cloudinary.com/demo/image/upload/fl_attachment/sample.jpg
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

              <Button onClick={()=> navigate("/listado-publicaciones")} variant="outline" className=" mb-4 bg-white text-green-600 border-green-600 hover:bg-green-50 w-full lg:w-[unset]">
                {/* <Link className='w-[100%] flex justify-center' to="/listado-publicaciones"> */}
                  <ArrowLeftIcon className="mr-2 h-4 w-4" />
                  <span>Volver al listado</span>
                {/* </Link> */}
              </Button>

              <div className='flex w-full lg:w-[unset]   justify-center'>
                {/* INFORMACIÓN TAB */}
                <Button
                  variant={activeTab === 'info' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('info')}
                  className={`pub-detail-tab w-[32%]  ${activeTab === 'info' ? 'bg-green-600 text-white' : 'text-green-600'}`}
                >
                  {/* info icon */}
                  <Info className=" h-4 w-4 mr-2" />
                  {/* hide span on mobile sizes */}
                  <span className="hidden md:inline">Información</span>

                </Button>
                {/* UBICACIÓN TAB */}
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
                {/* EVIDENCIAS TAB */}
                <Button
                  variant={activeTab === 'evidencias' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('evidencias')}
                  className={`pub-detail-tab w-[32%] ${activeTab === 'evidencias' ? 'bg-green-600 text-white  ' : 'text-green-600'}`}
                >
                  <ImageIcon className=" h-4 w-4 mr-2" />
                  {/* span hidden on mobile sizes */}
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
                                {/* {status === 'received' ? 'Recibido' : status === 'inProcess' ? 'En curso' : 'Resuelto'} */}
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
                                    <Badge variant="outline">ID: {
                                        publicacion?.id 
                                        
                                      } {publicacion?.situacion?.nombre}</Badge>
                                  </div>
                                  <Select onValueChange={handleStatusChange} value={tempStatus}>
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Seleccionar estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="received">Recibido</SelectItem>
                                      <SelectItem value="inProcess">En curso</SelectItem>
                                      <SelectItem value="resolved">Resuelto</SelectItem>
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
                      {/* <dl className="grid grid-cols-1 gap-2 text-sm">
                        <div className="flex justify-between">

                          <dt className="font-medium text-green-600">Categoría:</dt>
                          <dd>
                            {
                              loading ? <Skeleton className="h-4 w-24" /> : publicacion?.categoria?.nombre
                            }
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="font-medium text-green-600">Fecha de publicación:</dt>
                          <dd>

                            {
                              loading ? <Skeleton className="h-4 w-24" /> : new Date(publicacion.fecha_publicacion).toLocaleDateString('es-CL')

                            }
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="font-medium text-green-600">Junta Vecinal:</dt>
                          <dd>
                            {
                              loading ? <Skeleton className="h-4 w-24" /> : publicacion?.junta_vecinal?.nombre_calle
                            }
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="font-medium text-green-600">Estado:</dt>
                          <dd>
                            {
                              loading ? <Skeleton className="h-4 w-24" /> : (<Badge className="bg-green-100 text-green-800">
                                {publicacion?.situacion?.nombre}
                              </Badge>)
                            }
                            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="icon">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>Editar Estado</DialogTitle>
                                </DialogHeader>
                                <Select onValueChange={handleStatusChange} defaultValue={status}>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Seleccionar estado" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="received">Recibido</SelectItem>
                                    <SelectItem value="inProcess">En curso</SelectItem>
                                    <SelectItem value="resolved">Resuelto</SelectItem>
                                  </SelectContent>
                                </Select>
                              </DialogContent>
                            </Dialog>
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="font-medium text-green-600">Responsable:</dt>
                          <dd>
                            {
                              loading ? <Skeleton className="h-4 w-24" /> : "Administrador Municipal"
                            }
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="font-medium text-green-600">Departamento:</dt>
                          <dd>
                            {
                              loading ? <Skeleton className="h-4 w-24" /> : publicacion?.departamento?.nombre
                            }
                          </dd>
                        </div>
                      </dl> */}
                    </CardContent>
                  </Card>
                  {/* <Card>
                    <CardHeader>
                      <CardTitle className="text-green-700">Detalles del proyecto</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="grid grid-cols-1 gap-2 text-sm">
                        <div>
                          <dt className="font-medium text-green-600">Descripción:</dt>
                          <dd className="mt-1">Descripción del proyecto de ejemplo.</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="font-medium text-green-600">Presupuesto:</dt>
                          <dd>$100,000</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="font-medium text-green-600">Fecha de inicio:</dt>
                          <dd>01/02/2024</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="font-medium text-green-600">Fecha de finalización:</dt>
                          <dd>31/12/2024</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="font-medium text-green-600">Avance:</dt>
                          <dd>50%</dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card> */}
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-700">Respuestas Municipales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {/* static skeleton use skeleton */}
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
                            position={[publicacion.latitud, publicacion.longitud]}
                          >
                            <Popup>
                              {publicacion?.junta_vecinal?.nombre_calle}
                            </Popup>
                          </Marker>
                        </MapContainer>
                      )
                    }
                    {/* see big map */}

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
                  <div className={`  p-1 ${publicacion?.evidencias?.length === 0 ? "": "grid grid-cols-1 md:grid-cols-2  gap-4"}`}>
                    
                    {
                      loading ? (
                        // 3 skeleton cards
                        [1, 2, 3].map((item) => (
                          <Card key={item} className="w-full">
                            <CardContent className="p-4">
                              <Skeleton className="h-48 w-full" />
                              <Skeleton className="h-4 w-full mt-2" />
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        
                          publicacion?.evidencias?.length != 0 ? (
                            publicacion?.evidencias?.map((evidencia) => (
                              <Card key={evidencia.id} className="w-full">
                                <CardContent className="p-4">
                                  <img src={ "https://res.cloudinary.com/de06451wd/"+ evidencia.archivo} alt={evidencia.nombre} className="w-full h-48 object-cover" />
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
                              <div className="w-full flex justify-center">
                                <p className="">No hay evidencias disponibles</p>


                                
                              </div>
                              
                          )
                          
                        
                      )
                    }


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