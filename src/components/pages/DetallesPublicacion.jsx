import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeftIcon, MapPinIcon, ImageIcon, Info } from 'lucide-react'
import { Skeleton } from "@/components/ui/skeleton"
import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import TopBar from '../TopBar';
import { useNavigate } from 'react-router-dom';
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import InfoPublicacion from '../sections/InfoPublicacion'
import MapaPublicacion from '../sections/MapaPublicacion';
import EvidenciaPublicacion from '../sections/EvidenciaPublicacion';
import ListaRespuestaMunicipal from '../sections/ListaRespuestaMunicipal';
import FormRespuestaMunicipal from '../sections/FormRespuestaMunicipal';
// import useAuth from '../../hooks/useAuth'

const DetallesPublicacion = ({ isOpened, setIsOpened }) => {
  const axiosPrivate = useAxiosPrivate();
  const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
  });

  const { id } = useParams();
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [publicacion, setPublicacion] = useState({})
  
  const [showResponseForm, setShowResponseForm] = useState(false)
  const navigate = useNavigate();
  const url = `publicaciones/${id}/`
  // const { userId } = useAuth()
  // console.log(userId)
  
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
            {
              activeTab === 'info' && (
                <>
                  <InfoPublicacion publicacion={publicacion} loading={loading} id={id} setPublicacion={setPublicacion} />
                  
                </>

              )}
            {activeTab === 'ubicacion' && <MapaPublicacion publicacion={publicacion} loading={loading} />}
            {activeTab === 'evidencias' && <EvidenciaPublicacion publicacion={publicacion} loading={loading} handleDownload={handleDownload} />}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default DetallesPublicacion

