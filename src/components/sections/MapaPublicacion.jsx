import React from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

const MapaPublicacion = ({loading, publicacion}) => {
  const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
  })

  L.Marker.prototype.options.icon = DefaultIcon
  return (
    <>
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
    </>
  )
}

export default MapaPublicacion