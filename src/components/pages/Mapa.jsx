import { useEffect, useState, useCallback } from 'react'
import TopBar from '../TopBar'
import useAxiosPrivate from '@/hooks/useAxiosPrivate'
import { format } from "date-fns"
import MapaCalorSeccion from '../sections/MapaCalorSeccion'
import MapaFrioSeccion from '../sections/MapaFrioSeccion'

// para los filtros utilizar esto: https://clubdelamusica-pruebas.com/api/v1/publicaciones-por-junta-vecinal?categoria=[Seguridad] (ejemplo)
// para los filtros utilizar esto: https://clubdelamusica-pruebas.com/api/v1/publicaciones-por-junta-vecinal?junta_vecinal=[Junta 1] (ejemplo)


const Mapa = () => {
  const axiosPrivate = useAxiosPrivate()

  const [isLoading, setIsLoading] = useState(true)
  const [juntas, setJuntas] = useState([])
  const [categorias, setCategorias] = useState([])
  const [data, setData] = useState([])
  const [dataFrio, setDataFrio] = useState([])
  const [selectedFilters, setSelectedFilters] = useState({
    junta: [],
    categoria: [],
  })
  const [isValid, setIsValid] = useState(false)
  const [dateRange, setDateRange] = useState({ from: null, to: null })
  const [clearValues, setClearValues] = useState(false)
  // get data para mapa de calor
  const fetchData = useCallback(async (queryParams) => {
    setIsLoading(true);
    const url = queryParams ? `/publicaciones-por-junta-vecinal/?${queryParams}` : '/publicaciones-por-junta-vecinal/';
    try {
      const response = await axiosPrivate.get(url);
      console.log(response.data);
      setData(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [axiosPrivate])

  // get data para mapa de frío (publicaciones resueltas)
  const fetchDataFrio = useCallback(async (queryParams) => {
    setIsLoading(true);
    const url = queryParams ? `/publicaciones-resueltas-por-junta-vecinal/?${queryParams}` : '/publicaciones-resueltas-por-junta-vecinal/';
    try {
      const response = await axiosPrivate.get(url);
      console.log('Datos frío:', response.data);
      setDataFrio(response.data);
    } catch (error) {
      console.error('Error cargando datos frío:', error);
    } finally {
      setIsLoading(false);
    }
  }, [axiosPrivate])

  const fetchJuntas = useCallback(async () => {
    try {
      const response = await axiosPrivate.get('/juntas-vecinales/');
      const transformedJuntas = response.data.map(junta => ({
        id: junta.id,
        nombre: junta.nombre_junta,
      }));
      console.log(transformedJuntas);
      setJuntas(transformedJuntas);
    } catch (error) {
      console.error(error);
    }
  }, [axiosPrivate])

  const fetchCategorias = useCallback(async () => {
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
  }, [axiosPrivate])
  useEffect(() => {
    fetchJuntas();
    fetchCategorias()
  }, [fetchJuntas, fetchCategorias])

  useEffect(() => {
    fetchData();
    fetchDataFrio();
  }, [clearValues, fetchData, fetchDataFrio]);
  const getQueryParams = () => {
    const juntas = selectedFilters.junta
    const categorias = selectedFilters.categoria
    const juntasQuery = juntas.length > 0 ? `junta_vecinal=${juntas.join(',')}` + '&' : ''
    const categoriasQuery = categorias.length > 0 ? `categoria=${categorias.join(',')}` + '&' : ''
    const iniDate = dateRange?.from ? "fecha_publicacion_after=" + format(dateRange?.from, "yyyy-MM-dd") + '&' : ""
    const endDate = dateRange?.to ? "fecha_publicacion_before=" + format(dateRange?.to, "yyyy-MM-dd") + '&' : ""
    // const filtrosQuery = `${categoriasQuery}&${juntasQuery}&${iniDate}&${endDate}`
    let filtrosQuery = `${categoriasQuery}${juntasQuery}${iniDate}${endDate}`
    filtrosQuery = filtrosQuery.slice(0, -1);
    console.log(filtrosQuery)
    return filtrosQuery;
  }

  const applyFilters = () => {
    console.log('aplicando filtros');
    console.log(getQueryParams())
    console.log(dateRange)
    fetchData(getQueryParams());
    fetchDataFrio(getQueryParams()); // También aplicar filtros al mapa de frío
  }

  const limpiarFiltros = () => {
    setSelectedFilters({
      junta: [],
      categoria: []
    });
    setDateRange({ from: null, to: null });
    setClearValues(!clearValues);
  }

  return (
    <>

      <TopBar optionalbg={"bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 text-white shadow-lg "} title={"Análisis Térmico Municipal"} />

      <div className='p-8'>

        <MapaCalorSeccion
          data={data}
          isLoading={isLoading}
          juntas={juntas}
          categorias={categorias}
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
          applyFilters={applyFilters}
          limpiarFiltros={limpiarFiltros}
          clearValues={clearValues}
          dateRange={dateRange}
          setDateRange={setDateRange}
          setIsValid={setIsValid}
          isValid={isValid}
        />

        {/* <StatsTable data={data} isLoading={isLoading} setIsLoading={setIsLoading} /> */}
        <MapaFrioSeccion
          data={dataFrio}
          isLoading={isLoading}
          juntas={juntas}
          categorias={categorias}
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
          applyFilters={applyFilters}
          limpiarFiltros={limpiarFiltros}
          clearValues={clearValues}
          dateRange={dateRange}
          setDateRange={setDateRange}
          setIsValid={setIsValid}
          isValid={isValid}
        />
      </div>


    </>
  )
}

export default Mapa

