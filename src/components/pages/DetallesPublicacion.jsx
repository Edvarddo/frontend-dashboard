import React from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeftIcon, MapPinIcon, ImageIcon, FileIcon, Info } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';


const DetallesPublicacion = ({ isOpened, setIsOpened }) => {
  const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
  });

  L.Marker.prototype.options.icon = DefaultIcon;
  const { id } = useParams();
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [publicacion, setPublicacion] = useState({})
  
  const url_local = import.meta.env.VITE_URL_PROD_VERCEL
  const url = `${import.meta.env.VITE_URL_PROD_VERCEL}publicaciones/${id}/`
  const fetchPublicacion = (url) => {
    setLoading(true)
    fetch(url,
      // {
      //   method: 'GET',
      //   headers: {
      //     'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzI5OTg0MDIwLCJpYXQiOjE3Mjk4OTc2MjAsImp0aSI6ImI4YmZiNDI4Y2E5OTQyMTI5YThmZDM5YzI4MTljNWZhIiwicnV0IjoiMjAxMjM5MzAtNSJ9.YcTJPiqkHwMcprG0b7b5Kw3OJuCI5B-9N8EhPmjt-Q8`
      //   }
      // }
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
  const [activeTab, setActiveTab] = useState('info')
  const handleDownload = (id, archivo) => {
    console.log("downloading file with id: ", id)
    // automatically download file with link. open explorer dialog. create element a
    // format to download https://res.cloudinary.com/demo/image/upload/fl_attachment/sample.jpg
    // const imageUrl = "https://res.cloudinary.com/de06451wd/fl_attachment/" + archivo
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.setAttribute('download', 'download');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    
  }
  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <Card className="w-full max-w-4xl mx-auto bg-white">
        <CardHeader className="border-b">
          <div className="flex flex-wrap justify-between   mb-4 ">

            <Button variant="outline" className=" mb-4 bg-white text-green-600 border-green-600 hover:bg-green-50 w-full lg:w-[unset]">
              <Link className='w-[100%] flex justify-center' to="/">
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                <span>Volver al listado</span>
              </Link>
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
                    <dl className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="font-medium text-green-600">Categoría: </dt>
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
                    </dl>
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
                <div className={`grid grid-cols-1 md:grid-cols-2  gap-4  p-1`}>
                  
                    {/* <CardContent className="p-4">
                      <div className="w-full h-48 bg-green-100 rounded-md mb-2 flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-green-600" />
                      </div>
                      <p className="text-sm text-green-700">Foto del sitio antes de la intervención</p>
                    </CardContent> */}
                    
                    {
                      loading  ? (
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
                        publicacion?.evidencias?.map((evidencia) => (
                          <Card key={evidencia.id} className="w-full">
                            <CardContent className="p-4">
                              <div className="w-full h-64 bg-green-100 rounded-md mb-2 flex items-center justify-center">
                                <img 
                                  lazyload="lazy"
                                src={"https://res.cloudinary.com/de06451wd/" + evidencia.archivo} alt={publicacion} className="h-full w-full object-cover" />
                              </div>
                              <p className="text-sm text-green-700">{evidencia.descripcion}</p>
                              {/* botón para descargar */}
                              <Button
                                variant="outline"
                                className="mt-2 w-full"
                                onClick={()=>handleDownload(evidencia.id, evidencia.archivo)}
                              >
                                <FileIcon className="h-4 w-4 mr-2" />
                                Descargar
                              </Button>

                            </CardContent>
                          </Card>
                        ))
                      )
                    }
                  
                  
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default DetallesPublicacion