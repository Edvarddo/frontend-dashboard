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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-green-700">Ubicación de la publicación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-green-100 rounded-md overflow-hidden flex items-center justify-center w-full h-full">
            {
              loading ? <Skeleton className="h-96 w-full" /> : (
                publicacion.latitud ? (
                  <MapContainer
                    center={[publicacion?.latitud, publicacion?.longitud]}
                    zoom={16}
                    minZoom={13}
                    maxZoom={18}
                    style={{ height: '400px', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker
                      position={[publicacion?.latitud, publicacion?.longitud]}
                    >
                      <Popup>
                        {publicacion?.junta_vecinal?.nombre_junta}
                      </Popup>
                    </Marker>
                  </MapContainer>
                ) : (
                  <div className='bg-gray-200 h-96 w-full flex items-center justify-center'>
                    <p className="text-gray-500">No hay ubicación disponible</p>
                  </div>
                )
              )
            }
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-green-700">Información de ubicación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-green-600">Junta Vecinal:</p>
              <p>
                {loading ? <Skeleton className="h-[1.5rem] w-full" /> : publicacion?.junta_vecinal?.nombre_junta || "No disponible"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-green-600">Nombre de la calle:</p>
              <p>
                {loading ? <Skeleton className="h-[1.5rem] w-full" /> : publicacion?.junta_vecinal?.nombre_calle || "No disponible"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-green-600">Nro de calle:</p>
              <p>
                {loading ? <Skeleton className="h-[1.5rem] w-full" /> : publicacion?.junta_vecinal?.numero_calle || "No disponible"}
              </p>
            </div>
            {/* <div className="space-y-1">
              <p className="text-sm font-medium text-green-600">Región:</p>
              <p>
                {loading ? <Skeleton className="h-[1.5rem] w-full" /> : publicacion?.junta_vecinal?.region || "No disponible"}
              </p>
            </div> */}
            <div className="space-y-1">
              <p className="text-sm font-medium text-green-600">Latitud:</p>
              <p>
                {loading ? <Skeleton className="h-[1.5rem] w-full" /> : publicacion?.latitud || "No disponible"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-green-600">Longitud:</p>
              <p>
                {loading ? <Skeleton className="h-[1.5rem] w-full" /> : publicacion?.longitud || "No disponible"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default MapaPublicacion

