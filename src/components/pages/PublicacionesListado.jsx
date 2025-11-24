import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar, Download } from "lucide-react"
import { useEffect, useState } from 'react'
import TablaPublicaciones from '../TablaPublicaciones'
// date fns and popover
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { set } from "date-fns"
import { CalendarIcon, ArrowLeftIcon, FilterIcon, DownloadIcon, HomeIcon, FileTextIcon, BellIcon, BarChartIcon } from "lucide-react"
import axios from "axios"
import TopBar from "../TopBar"
import { BASE_URL } from '../../api/axios'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
// IMPORTEMOS EL ARCHIVO APIROUTES DE LA CARPETA API
import { API_ROUTES } from '../../api/apiRoutes'

import useFilters from '../../hooks/useFilters'
import FilterContainer from '../filters/FilterContainer'
import FilterMultiSelect from '../filters/FilterMultiSelect'
import FilterDatePicker from '../filters/FilterDatePicker'

export default function PublicacionesListado({
  isOpened,
  setIsOpened
}) {
  const axiosPrivate = useAxiosPrivate();
  // PARAMETROS URL
  const [currentPage, setCurrentPage] = useState(1)
  const [url, setUrl] = useState(null)
  const [publicacionesPorPagina, setPublicacionesPorPagina] = useState(5)

  // OPCIONES SELECT
  const [categorias, setCategorias] = useState([])
  const [juntasVecinales, setJuntasVecinales] = useState([])
  const [departamentos, setDepartamentos] = useState([])
  const [situaciones, setSituaciones] = useState([])

  const [isDownloadAvailable, setIsDownloadAvailable] = useState(false)
  const [loading, setLoading] = useState(false)
  // VALIDACIÓN
  const [isValid, setIsValid] = useState(false)
  const [filterError, setFilterError] = useState(null)

  // Use the new hook
  const { filters, setFilter, resetFilters, getQueryParams } = useFilters({
    categoria: [],
    junta_vecinal: [],
    situacion: [],
    departamento: [],
    fecha_publicacion: { from: null, to: null }
  });


  const fetchURLS = async (urls) => {
    try {
      const [categorias, juntasVecinales, departamentos, osituaciones] = await Promise.all(
        urls.map(url => axiosPrivate(url).then(res => res.data))
      );

      // cambiar nombre_junta a nombre en juntasVecinales
      juntasVecinales.forEach(junta => {
        junta.nombre = junta.nombre_junta;
      });

      setCategorias(categorias);
      setJuntasVecinales(juntasVecinales);
      setDepartamentos(departamentos);
      setSituaciones(osituaciones);

    } catch (e) {
      setFilterError(e);
    }
  }
  useEffect(() => {
    // USEMOS EL ARCHIVO APIROUTES DE LA CARPETA API
    fetchURLS([
      API_ROUTES.CATEGORIAS.ROOT,
      API_ROUTES.JUNTAS_VECINALES.ROOT,
      API_ROUTES.DEPARTAMENTOS.ROOT,
      API_ROUTES.SITUACIONES_PUBLICACIONES.ROOT
    ])
    console.log(BASE_URL, axiosPrivate)

  }, [])

  const handleOpenSidebar = () => {
    setIsOpened(!isOpened)
  }

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem("authToken"); // Obtén el token desde el almacenamiento local
      const queryParams = getQueryParams();
      const response = await axios.get(`${API_ROUTES.PUBLICACIONES.EXPORT_TO_EXCEL}?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Incluye el token en los encabezados
        },
        responseType: "blob", // Asegúrate de manejar la respuesta como un archivo blob
      });

      // Crear una URL para el archivo y desencadenar la descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Opcional: Usa una fecha o nombre personalizado para el archivo
      const filename = `publicaciones_${new Date().toISOString().split("T")[0]}.xlsx`;
      link.setAttribute("download", filename);

      document.body.appendChild(link);
      link.click();

      // Limpia el elemento creado
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error al descargar el archivo:", error);
    }
  };

  const aplicarFiltros = () => {
    const queryParams = getQueryParams();
    const limitPerPage = publicacionesPorPagina ? `&pagesize=${publicacionesPorPagina}` : "";
    let url = `${API_ROUTES.PUBLICACIONES.ROOT}?${queryParams}${limitPerPage}`;

    console.log(url);
    setUrl(url);
    setCurrentPage(1);
  }

  const limpiarFiltrosHandler = () => {
    resetFilters();
    setUrl(null);
  }

  return (
    <>
      <TopBar handleOpenSidebar={handleOpenSidebar} title="Listado de publicaciones" />
      <main className=" p-4  bg-gray-100 ">
        <div className="m-4">
          <FilterContainer>
            <FilterMultiSelect
              label="Categoría"
              options={categorias}
              value={filters.categoria}
              onChange={(val) => setFilter('categoria', val)}
            />
            <FilterMultiSelect
              label="Estado de la publicación"
              options={situaciones}
              value={filters.situacion}
              onChange={(val) => setFilter('situacion', val)}
            />
            <FilterDatePicker
              label="Rango de fechas"
              dateRange={filters.fecha_publicacion}
              setDateRange={(val) => setFilter('fecha_publicacion', val)}
              setIsValid={setIsValid}
            />
            <FilterMultiSelect
              label="Junta vecinal"
              options={juntasVecinales}
              value={filters.junta_vecinal}
              onChange={(val) => setFilter('junta_vecinal', val)}
            />
            <FilterMultiSelect
              label="Departamento"
              options={departamentos}
              value={filters.departamento}
              onChange={(val) => setFilter('departamento', val)}
            />
          </FilterContainer>

          <div className="flex justify-between flex-wrap mb-6 btn-section p-1 bg-white rounded-b-lg shadow-md -mt-2 px-6 pb-6">
            <Button disabled={loading || !isDownloadAvailable} variant="outline" onClick={handleDownload} className="mb-3 bg-blue-500 hover:bg-blue-600 filter-btn w-full md:w-[unset]">
              <span className="text-white flex justify-items-center justify-center">
                <Download className="mr-2 h-4 w-4" />
                Descargar datos
              </span>
            </Button>

            <div className="filter-btn-cont w-full md:w-[unset]">
              <Button onClick={limpiarFiltrosHandler} className="w-full mb-2 mr-2 md:w-[unset] filter-btn" variant="outline">Limpiar filtros</Button>
              <Button disabled={isValid} onClick={aplicarFiltros} className="w-full md:w-[unset] bg-green-500 hover:bg-green-600 text-white filter-btn">Aplicar filtros</Button>
            </div>
          </div>

        </div>
        <div className="bg-white m-4  p-6 rounded-lg shadow-md">
          <TablaPublicaciones
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            publicacionesPorPagina={publicacionesPorPagina}
            setPublicacionesPorPagina={setPublicacionesPorPagina}
            loading={loading}
            setLoading={setLoading}
            url={url}
            setDownloadIsAvailable={setIsDownloadAvailable}
          />

        </div>


      </main>

    </>
  )
}