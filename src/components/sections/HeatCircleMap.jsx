import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Maximize2 } from 'lucide-react'
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import  StatsTable  from "./StatsMapTable"
const data = [
      {
        "Junta_Vecinal": {
          "latitud": -22.459831,
          "longitud": -68.933872,
          "nombre": "Junta 1",
          "total_publicaciones": 7,
          "intensidad": 0.3333333333333333
        },
        "Asistencia Social": 2,
        "Mantención de Calles": 2,
        "Seguridad": 2,
        "Áreas verdes": 1
      },
      {
        "Junta_Vecinal": {
          "latitud": -22.457217,
          "longitud": -68.919495,
          "nombre": "Junta 2",
          "total_publicaciones": 4,
          "intensidad": 0.19047619047619047
        },
        "Áreas verdes": 2,
        "Asistencia Social": 1,
        "Seguridad": 1
      },
      {
        "Junta_Vecinal": {
          "latitud": -22.458974,
          "longitud": -68.947353,
          "nombre": "Junta 3",
          "total_publicaciones": 10,
          "intensidad": 0.47619047619047616
        },
        "Mantención de Calles": 3,
        "Seguridad": 3,
        "Áreas verdes": 2,
        "Asistencia Social": 2
      },
      {
        "Junta_Vecinal": {
          "latitud": -22.461503,
          "longitud": -68.925289,
          "nombre": "Junta 4",
          "total_publicaciones": 15,
          "intensidad": 0.7142857142857143
        },
        "Seguridad": 5,
        "Mantención de Calles": 4,
        "Asistencia Social": 3,
        "Áreas verdes": 3
      },
      {
        "Junta_Vecinal": {
          "latitud": -22.455689,
          "longitud": -68.939178,
          "nombre": "Junta 5",
          "total_publicaciones": 6,
          "intensidad": 0.2857142857142857
        },
        "Áreas verdes": 3,
        "Seguridad": 2,
        "Asistencia Social": 1
      },
      {
        "Junta_Vecinal": {
          "latitud": -22.463821,
          "longitud": -68.941324,
          "nombre": "Junta 6",
          "total_publicaciones": 12,
          "intensidad": 0.5714285714285714
        },
        "Mantención de Calles": 5,
        "Seguridad": 3,
        "Asistencia Social": 2,
        "Áreas verdes": 2
      },
      {
        "Junta_Vecinal": {
          "latitud": -22.456912,
          "longitud": -68.929567,
          "nombre": "Junta 7",
          "total_publicaciones": 8,
          "intensidad": 0.38095238095238093
        },
        "Seguridad": 4,
        "Asistencia Social": 2,
        "Áreas verdes": 1,
        "Mantención de Calles": 1
      },
      {
        "Junta_Vecinal": {
          "latitud": -22.460278,
          "longitud": -68.936777,
          "nombre": "Junta 8",
          "total_publicaciones": 9,
          "intensidad": 0.42857142857142855
        },
        "Mantención de Calles": 3,
        "Áreas verdes": 3,
        "Seguridad": 2,
        "Asistencia Social": 1
      },
      {
        "Junta_Vecinal": {
          "latitud": -22.454123,
          "longitud": -68.944588,
          "nombre": "Junta 9",
          "total_publicaciones": 5,
          "intensidad": 0.23809523809523808
        },
        "Asistencia Social": 2,
        "Seguridad": 2,
        "Áreas verdes": 1
      },
      {
        "Junta_Vecinal": {
          "latitud": -22.462745,
          "longitud": -68.922070,
          "nombre": "Junta 10",
          "total_publicaciones": 11,
          "intensidad": 0.5238095238095238
        },
        "Seguridad": 4,
        "Mantención de Calles": 3,
        "Asistencia Social": 2,
        "Áreas verdes": 2
      }
    ];

const HeatmapLayer = () => {
  const map = useMap();
  const [activePoint, setActivePoint] = useState(null);

  useEffect(() => {
    if (!map) return;

    const points = data.map(item => [
      item.Junta_Vecinal.latitud,
      item.Junta_Vecinal.longitud,
      item.Junta_Vecinal.intensidad
    ]);

    const heat = L.heatLayer(points, {
      radius: 30,
      // blur: 15,
      maxZoom: 10,
    }).addTo(map);

    // Add invisible markers for tooltips
    data.forEach((item, index) => {
      const marker = L.marker([item.Junta_Vecinal.latitud, item.Junta_Vecinal.longitud], {
        opacity: 0,
      }).addTo(map);

      const tooltipContent = `
        <div class="p-2 bg-white shadow-sm min-w-[200px]">
          <h3 class="font-bold mb-1">${item.Junta_Vecinal.nombre}</h3>
          <p class="text-sm">Seguridad: ${item.Seguridad || 'N/A'}</p>
          <p class="text-sm">Áreas verdes: ${item["Áreas verdes"] || 'N/A'}</p>
          <p class="text-sm">Total publicaciones: ${item.Junta_Vecinal.total_publicaciones}</p>
        </div>
      `;

      marker.bindTooltip(tooltipContent, {
        permanent: false,
        direction: 'top',
        offset: [0, -10],
        opacity: 1,
        className: 'leaflet-tooltip-custom'
      });

      marker.on('mouseover', () => {
        setActivePoint(index);
        marker.openTooltip();
      });

      marker.on('mouseout', () => {
        setActivePoint(null);
        marker.closeTooltip();
      });
    });

    return () => {
      map.removeLayer(heat);
    };
  }, [map]);

  return <>asd</>;
};

const HeatMap = () => {
  const [activeJunta, setActiveJunta] = useState(null);
  const [selectedJunta, setSelectedJunta] = useState('all');
  const [selectedCategoria, setSelectedCategoria] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const juntas = [...new Set(data.map(item => item.Junta_Vecinal.nombre))];
  const categorias = ['Asistencia Social', 'Mantención de Calles', 'Seguridad', 'Áreas verdes'];

  return (
    <div className="flex flex-col h-full ">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="flex-none">
          <div className="flex justify-between items-center">
            <CardTitle className="text-green-700">Mapa de Calor - Juntas Vecinales</CardTitle>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0">
                <div className="flex flex-col h-full">
                  <DialogHeader className="px-6 py-2 border-b bg-gray-50">
                    <div className="space-y-4">
                      <DialogTitle>Mapa de Calor - Vista Ampliada</DialogTitle>
                      <div className="flex space-x-4 pb-2">
                        <Select value={selectedJunta} onValueChange={setSelectedJunta}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Seleccionar Junta" />
                          </SelectTrigger>
                          <SelectContent className="z-[1000]">
                            <SelectItem value="all">Todas las Juntas</SelectItem>
                            {juntas.map((junta) => (
                              <SelectItem key={junta} value={junta}>{junta}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Seleccionar Categoría" />
                          </SelectTrigger>
                          <SelectContent className="z-[1000]">
                            <SelectItem value="all">Todas las Categorías</SelectItem>
                            {categorias.map((categoria) => (
                              <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </DialogHeader>
                  <div className="flex-1">
                    <MapContainer
                      center={[-22.459831, -68.933872]}
                      zoom={13}
                      className="w-full h-full"
                      style={{ height: 'calc(95vh - 120px)' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <HeatmapLayer />
                    </MapContainer>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex space-x-4 mt-4">
            <Select value={selectedJunta} onValueChange={setSelectedJunta}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Seleccionar Junta" />
              </SelectTrigger>
              <SelectContent className="z-[1000]">
                <SelectItem value="all">Todas las Juntas</SelectItem>
                {juntas.map((junta) => (
                  <SelectItem key={junta} value={junta}>{junta}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Seleccionar Categoría" />
              </SelectTrigger>
              <SelectContent className="z-[1000]">
                <SelectItem value="all">Todas las Categorías</SelectItem>
                {categorias.map((categoria) => (
                  <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className=" ">
          {!isModalOpen && (
            <div className=" w-full">
              <MapContainer
                center={[-22.459831, -68.933872]}
                zoom={13}
                className="w-full h-full"
                // style={{ minHeight: 'calc(100vh - 200px)' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <HeatmapLayer />
              </MapContainer>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default HeatMap;

