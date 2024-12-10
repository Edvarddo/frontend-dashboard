import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react'
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
// import StatsTable from "./StatsMapTable"
import { Skeleton } from "@/components/ui/skeleton"
import MultiSelect from "../MultiSelect"
import DatePicker from '../DatePicker';

const HeatmapLayer = ({ data }) => {
  const map = useMap();
  const [activePoint, setActivePoint] = useState(null);

  useEffect(() => {
    if (!map || !data || data.length === 0) return;

    const points = data.map(item => [
      item.Junta_Vecinal.latitud,
      item.Junta_Vecinal.longitud,
      item.Junta_Vecinal.intensidad
    ]);

    const heat = L.heatLayer(points, {
      radius: 30,
      maxZoom: 10,
      // gradient: { 0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1.0: 'red' }
    }).addTo(map);

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
  }, [map, data]);

  return null;
};

const HeatMap = ({ data, isLoading, juntas, categorias, selectedFilters, setSelectedFilters, applyFilters, limpiarFiltros, clearValues,dateRange,setDateRange, setIsValid, isValid }) => {

  const [activeJunta, setActiveJunta] = useState(null);
  const [selectedJunta, setSelectedJunta] = useState([]);
  const [selectedCategoria, setSelectedCategoria] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  // const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  
  // const juntas = [...new Set(data?.map(item => item.Junta_Vecinal.nombre) || [])];
  // const categorias = ['Asistencia Social', 'Mantención de Calles', 'Seguridad', 'Áreas verdes'];



  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-red-700">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Hubo un error al cargar los datos: {error}</p>
        </CardContent>
      </Card>
    );
  }

  


  return (
    <div className="flex flex-col h-full">
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
            <DialogContent className="max-w-[95vw] w-full h-[95vh] ">
              <div className="flex flex-col h-full  p-1">
                <DialogHeader className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
                  <DialogTitle>Mapa de Calor - Vista Ampliada</DialogTitle>
                  {/* <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button> */}
                </DialogHeader>
                <div className="flex-1 relative">
                  <MapContainer
                    center={[-22.459831, -68.933872]}
                    zoom={13}
                    className="w-full h-full"
                    style={{ height: 'calc(95vh - 56px)' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <HeatmapLayer data={data} />
                  </MapContainer>
                  <div 
                    className={`absolute top-0 right-0 h-full bg-background border-l border-gray-200 shadow-lg transition-all duration-300 ease-in-out ${
                      isSidebarOpen ? 'w-[300px]' : 'w-[40px]'
                    }`}
                    style={{ zIndex: 1000 }}
                  >
                    <Button
                      // variant="ghost"
                      size="icon"
                     
                      className="absolute top-2 left-[-1rem] z-[1001] bg-green-500 hover:bg-green-600 text-white"
                      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                      {isSidebarOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </Button>
                    {isSidebarOpen && (
                      <div className="p-4 overflow-y-auto h-full">
                        <h3 className="font-semibold mb-4 text-center">Filtros</h3>
                        <div className="space-y-4">
                          <MultiSelect
                            options={juntas}
                            onValueChange={(val) => { setSelectedFilters({ ...selectedFilters, junta: val }) }}
                            clearValues={clearValues}
                            defaultValue={selectedFilters.junta}
                            placeholder="Seleccionar Juntas"
                            title = "Juntas"
                          />
                          <MultiSelect
                            options={categorias}
                            onValueChange={(val) => { setSelectedFilters({ ...selectedFilters, categoria: val }) }}
                            clearValues={clearValues}
                            defaultValue={selectedFilters.categoria}
                            placeholder="Seleccionar Categorías"
                            title = "Categorías"
                          />
                          <DatePicker
                            dateRange={dateRange}
                            setDateRange={setDateRange}
                            setIsValid={setIsValid}
                          />
                          <Button onClick={applyFilters} className="bg-green-500 hover:bg-green-600 text-white w-full">
                            Aplicar filtros
                          </Button>
                          {/* clear filters */}
                          <Button onClick={limpiarFiltros} className="bg-white hover:bg-green-50 text-black w-full">
                            Limpiar filtros
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      {isLoading || !data || data.length === 0 ? (
        <CardContent className="p-4">
          <div className="w-full h-[500px] bg-gray-100 animate-pulse flex items-center justify-center">
            <div className="text-gray-400">Cargando datos del mapa...</div>
          </div>
        </CardContent>
      ) : (
        <CardContent className=" ">
          {!isModalOpen && (
            <div className="w-full h-[500px]">
              <MapContainer
                center={[-22.459831, -68.933872]}
                zoom={13}
                className="w-full h-full"
                style= { { height: '500px' } }
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <HeatmapLayer data={data} />
              </MapContainer>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  </div>
  );
};

export default HeatMap;

