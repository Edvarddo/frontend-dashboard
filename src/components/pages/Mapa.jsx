import React, { useEffect, useState } from 'react'
import TopBar from '../TopBar'
import { MapContainer, TileLayer, useMap, Tooltip } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.heat'
import { Card } from '@radix-ui/themes'
import { CardContent, CardHeader, CardTitle } from '../ui/card'
import HeatMap from '../sections/HeatMap'
import HeatCircleMap from '../sections/HeatCircleMap'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import StatsTable from '../sections/StatsMapTable'
import useAxiosPrivate from '@/hooks/useAxiosPrivate'

// para los filtros utilizar esto: https://clubdelamusica-pruebas.com/api/v1/publicaciones-por-junta-vecinal?categoria=[Seguridad] (ejemplo)
// para los filtros utilizar esto: https://clubdelamusica-pruebas.com/api/v1/publicaciones-por-junta-vecinal?junta_vecinal=[Junta 1] (ejemplo)


const Mapa = ({ isOpened, setIsOpened }) => {
  const axiosPrivate = useAxiosPrivate()
  console.log('==========================')
  // const datas = [
  //   {
  //     "Junta_Vecinal": {
  //       "latitud": -22.459831,
  //       "longitud": -68.933872,
  //       "nombre": "Junta 1",
  //       "total_publicaciones": 7,
  //       "intensidad": 0.3333333333333333
  //     },
  //     "Asistencia Social": 2,
  //     "Mantención de Calles": 2,
  //     "Seguridad": 2,
  //     "Áreas verdes": 1
  //   },
  //   {
  //     "Junta_Vecinal": {
  //       "latitud": -22.457217,
  //       "longitud": -68.919495,
  //       "nombre": "Junta 2",
  //       "total_publicaciones": 4,
  //       "intensidad": 0.19047619047619047
  //     },
  //     "Áreas verdes": 2,
  //     "Asistencia Social": 1,
  //     "Seguridad": 1
  //   },
  //   {
  //     "Junta_Vecinal": {
  //       "latitud": -22.458974,
  //       "longitud": -68.947353,
  //       "nombre": "Junta 3",
  //       "total_publicaciones": 10,
  //       "intensidad": 0.47619047619047616
  //     },
  //     "Mantención de Calles": 3,
  //     "Seguridad": 3,
  //     "Áreas verdes": 2,
  //     "Asistencia Social": 2
  //   },
  //   {
  //     "Junta_Vecinal": {
  //       "latitud": -22.461503,
  //       "longitud": -68.925289,
  //       "nombre": "Junta 4",
  //       "total_publicaciones": 15,
  //       "intensidad": 0.7142857142857143
  //     },
  //     "Seguridad": 5,
  //     "Mantención de Calles": 4,
  //     "Asistencia Social": 3,
  //     "Áreas verdes": 3
  //   },
  //   {
  //     "Junta_Vecinal": {
  //       "latitud": -22.455689,
  //       "longitud": -68.939178,
  //       "nombre": "Junta 5",
  //       "total_publicaciones": 6,
  //       "intensidad": 0.2857142857142857
  //     },
  //     "Áreas verdes": 3,
  //     "Seguridad": 2,
  //     "Asistencia Social": 1
  //   },
  //   {
  //     "Junta_Vecinal": {
  //       "latitud": -22.463821,
  //       "longitud": -68.941324,
  //       "nombre": "Junta 6",
  //       "total_publicaciones": 12,
  //       "intensidad": 0.5714285714285714
  //     },
  //     "Mantención de Calles": 5,
  //     "Seguridad": 3,
  //     "Asistencia Social": 2,
  //     "Áreas verdes": 2
  //   },
  //   {
  //     "Junta_Vecinal": {
  //       "latitud": -22.456912,
  //       "longitud": -68.929567,
  //       "nombre": "Junta 7",
  //       "total_publicaciones": 8,
  //       "intensidad": 0.38095238095238093
  //     },
  //     "Seguridad": 4,
  //     "Asistencia Social": 2,
  //     "Áreas verdes": 1,
  //     "Mantención de Calles": 1
  //   },
  //   {
  //     "Junta_Vecinal": {
  //       "latitud": -22.460278,
  //       "longitud": -68.936777,
  //       "nombre": "Junta 8",
  //       "total_publicaciones": 9,
  //       "intensidad": 0.42857142857142855
  //     },
  //     "Mantención de Calles": 3,
  //     "Áreas verdes": 3,
  //     "Seguridad": 2,
  //     "Asistencia Social": 1
  //   },
  //   {
  //     "Junta_Vecinal": {
  //       "latitud": -22.454123,
  //       "longitud": -68.944588,
  //       "nombre": "Junta 9",
  //       "total_publicaciones": 5,
  //       "intensidad": 0.23809523809523808
  //     },
  //     "Asistencia Social": 2,
  //     "Seguridad": 2,
  //     "Áreas verdes": 1
  //   },
  //   {
  //     "Junta_Vecinal": {
  //       "latitud": -22.462745,
  //       "longitud": -68.922070,
  //       "nombre": "Junta 10",
  //       "total_publicaciones": 11,
  //       "intensidad": 0.5238095238095238
  //     },
  //     "Seguridad": 4,
  //     "Mantención de Calles": 3,
  //     "Asistencia Social": 2,
  //     "Áreas verdes": 2
  //   }
  // ];
  const [isLoading, setIsLoading] = useState(true)
  const [selectedJunta, setSelectedJunta] = useState('all')
  const [selectedCategoria, setSelectedCategoria] = useState('all')
  const [juntas, setJuntas] = useState([])
  const [categorias, setCategorias] = useState([])
  const [data, setData] = useState([])
  const [selectedFilters, setSelectedFilters] = useState({ junta: [], categoria: [] });
  // const juntas = [...new Set(data.map(item => item.Junta_Vecinal.nombre))]
  // const categorias = ['Asistencia Social', 'Mantención de Calles', 'Seguridad', 'Áreas verdes']
  const HeatmapLayer = () => {
    const map = useMap();
    const [activePoint, setActivePoint] = useState(null);

    useEffect(() => {
      if (!map) return;

      const points = data.map(item => [
        item.Junta_Vecinal.latitud,
        item.Junta_Vecinal.longitud,
        item.Junta_Vecinal.intensidad * 20
      ]);

      const heat = L.heatLayer(points, {
        radius: 30,
        blur: 15,
        maxZoom: 17,
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

    }, [map]);

    return null;
  };
  useEffect(() => {
    console.log(selectedFilters)
  }, [selectedFilters])
  // get data
  const fetchData = async (queryParams) => {
    setIsLoading(true);
    const url = queryParams ? `/publicaciones-por-junta-vecinal/?${queryParams}` : '/publicaciones-por-junta-vecinal/';
    try {
      
      const response = await axiosPrivate.get(url);
      console.log(response.data);
      // add datas to data
      // response.data.push(...datas);
      setData(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }
  const fetchJuntas = async () => {
    try {
      const response = await axiosPrivate.get('/juntas-vecinales/');
      // console.log(response.data);
      // transform juntas
      const transformedJuntas = response.data.map(junta => ({
        id: junta.id,
        nombre: junta.nombre_junta,
      }));
      console.log(transformedJuntas);
      setJuntas(transformedJuntas);
    } catch (error) {
      console.error(error);
    }
  }
  const fetchCategorias = async () => {
    try {
      const response = await axiosPrivate.get('/categorias/');
      console.log(response.data);
      const transformedCategorias = response.data.map(categoria => ({
        id: categoria.id,
        nombre: categoria.nombre,
      }));
      console.log(transformedCategorias);
      setCategorias(transformedCategorias);
    } catch (error) {
      console.error(error);
    }
  }
  useEffect(() => {
    fetchData();
    fetchJuntas();
    fetchCategorias();
  }, []);
  const getQueryParams = () => {
    const juntas = selectedFilters.junta
    const categorias = selectedFilters.categoria
    // junta_vecinal=[Junta 1],[Junta 2]
    // categoria=[Seguridad],[Áreas verdes]
    const juntasQuery = juntas.length > 0 ? `junta_vecinal=${juntas.join(',')}` : ''
    const categoriasQuery = categorias.length > 0 ? `categoria=${categorias.join(',')}` : ''
    // categoria&junta_vecinal
    const filtrosQuery = `${categoriasQuery}&${juntasQuery}` 
    // if juntasQuery or categoriasQuery is empty, remove the & from the query
    if(juntasQuery || categoriasQuery) {
      return filtrosQuery.replace('&', '')
    }
    return filtrosQuery;
  }

  const applyFilters = () => {
    console.log('aplicando filtros');
    console.log(getQueryParams())
    fetchData(getQueryParams());
    
  }


  return (
    <>
      <TopBar title="Mapa" handleOpenSidebar={() => setIsOpened(!isOpened)} />
      <div className='p-8'>
        <HeatCircleMap 
          data={data} 
          isLoading={isLoading} 
          juntas={juntas}
          categorias={categorias}
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
          applyFilters={applyFilters}
          />
        <StatsTable data={data} isLoading={isLoading} setIsLoading={setIsLoading} />
      </div>

      
    </>
  )
}

export default Mapa

