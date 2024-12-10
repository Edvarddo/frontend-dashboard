import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import 'leaflet/dist/leaflet.css';

const data = [
  {
    Junta_Vecinal: {
      latitud: -22.4567,
      longitud: -68.9250,
      nombre: "Junta 1",
      total_publicaciones: 50,
      intensidad: 50
    },
    Seguridad: 10,
    "Áreas verdes": 20,
  },
  {
    Junta_Vecinal: {
      latitud: -22.4627,
      longitud: -68.9270,
      nombre: "Junta 2",
      total_publicaciones: 30,
      intensidad: 30
    },
    Seguridad: 5,
    "Áreas verdes": 20,
  }
];

export default function HeatMap() {
  const [activeJunta, setActiveJunta] = useState(null);

  const getColor = (intensidad) => {
    const opacity = intensidad / 100;
    return `rgba(255, 0, 0, ${opacity})`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-green-700">Mapa de Calor - Juntas Vecinales</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div style={{ height: '600px', width: '100%' }}>
          <MapContainer 
            center={[-22.4597, -68.9260]} 
            zoom={14} 
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {data.map((item, index) => (
              <CircleMarker
                key={index}
                center={[item.Junta_Vecinal.latitud, item.Junta_Vecinal.longitud]}
                radius={20}
                fillColor={getColor(item.Junta_Vecinal.intensidad)}
                color="red"
                weight={1}
                fillOpacity={0.7}
                eventHandlers={{
                  mouseover: () => setActiveJunta(item),
                  mouseout: () => setActiveJunta(null),
                }}
              >
                <Tooltip permanent={activeJunta === item} direction="top" offset={[0, -10]}>
                  <Card className="p-2 bg-white shadow-sm min-w-[200px]">
                    <h3 className="font-bold mb-1">{item.Junta_Vecinal.nombre}</h3>
                    <p className="text-sm">Seguridad: {item.Seguridad}</p>
                    <p className="text-sm">Áreas verdes: {item["Áreas verdes"]}</p>
                    <p className="text-sm">Total publicaciones: {item.Junta_Vecinal.total_publicaciones}</p>
                  </Card>
                </Tooltip>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}

