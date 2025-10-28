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
import DatePicker from "../DatePicker"
import MultiSelect from "../MultiSelect"
import axios from "axios"
import TopBar from "../TopBar"
import { BASE_URL } from '../../api/axios'
import useAxiosPrivate from '../../hooks/useAxiosPrivate'


import Filters from "../Filters"

export default function PublicacionesListado({
  isOpened,
  setIsOpened
}) {
  const axiosPrivate = useAxiosPrivate();
  // PARAMETROS URL
  const [currentPage, setCurrentPage] = useState(1)
  const [url, setUrl] = useState(null)
  const [filtros, setFiltros] = useState(null)
  const [publicacionesPorPagina, setPublicacionesPorPagina] = useState(5)

  // OPCIONES SELECT
  const [categorias, setCategorias] = useState([])
  const [juntasVecinales, setJuntasVecinales] = useState([])
  const [departamentos, setDepartamentos] = useState([])
  const [situaciones, setSituaciones] = useState([])
  // const situaciones = [
  //   "Recibido",
  //   "En curso",
  //   "Resuelto"
  // ]
  // const situaciones = [
  //   { nombre: "Recibido", value: "recibido" },
  //   { nombre: "En curso", value: "en_curso" },
  //   { nombre: "Resuelto", value: "resuelto" }
  // ]

  // VALORES SELECCIONADOS FILTROS
  const [selectedCategoria, setSelectedCategoria] = useState(null)
  const [selectedSituacion, setSelectedSituacion] = useState(null)
  const [selectedJunta, setSelectedJunta] = useState(null)
  const [selecteDepto, setSelectedDepto] = useState(null)
  const [dateRange, setDateRange] = useState({ from: null, to: null })
  const [clearValues, setClearValues] = useState(false)
  const [isDownloadAvailable, setIsDownloadAvailable] = useState(false)
  // object filtros
  const [filtrosObj, setFiltrosObj] = useState({
    categoria: [],
    junta: [],
    situacion: [],
    departamentos: [],
    iniDate: null,
    endDate: null
  })
  const [loading, setLoading] = useState(false)
  // VALIDACIÓN
  const [isValid, setIsValid] = useState(false)
  const [filterError, setFilterError] = useState(null)

  const api_url = import.meta.env.VITE_URL_PROD_VERCEL
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

    fetchURLS([
      `categorias/`,
      `juntas-vecinales/`,
      `departamentos-municipales/`,
      `situaciones-publicaciones/`
    ])
    console.log(BASE_URL, axiosPrivate)

  }, [])
  // useEffect(() => {
  //   const category = selectedCategoria ? "categoria=" + selectedCategoria + "&" : "",
  //     junta = selectedJunta ? "junta_vecinal=" + selectedJunta + "&" : "",
  //     situation = selectedSituacion ? "situacion=" + selectedSituacion + "&" : "",
  //     departamento = selecteDepto ? "departamento=" + selecteDepto + "&" : "",
  //     iniDate = dateRange?.from ? "fecha_publicacion_after=" + format(dateRange?.from, "yyyy-MM-dd") + "&" : "",
  //     endDate = dateRange?.to ? "fecha_publicacion_before=" + format(dateRange?.to, "yyyy-MM-dd") + "&" : "",
  //     limitPerPage = publicacionesPorPagina ? "pagesize=" + publicacionesPorPagina + "&" : ""
  //   const filtros = `${category}${junta}${situation}${departamento}${iniDate}${endDate}`
  //   setFiltros(filtros)
  // }, [selectedCategoria, selectedJunta, selectedSituacion, dateRange, publicacionesPorPagina, selecteDepto])

  useEffect(() => {

  }, [filtrosObj])
  const handleOpenSidebar = () => {
    setIsOpened(!isOpened)
  }
  const handleDownload = async () => {
    try {
      const token = localStorage.getItem("authToken"); // Obtén el token desde el almacenamiento local
      const response = await axios.get(`${api_url}export-to-excel/?${filtros}`, {
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
  const getQueryParams = () => {
    // crear los parametros de consulta desde el objeto filtrosObj
    const categoriesParams = filtrosObj.categoria.join(",")
    const juntasParams = filtrosObj.junta.join(",")
    const situacionesParams = filtrosObj.situacion.join(",")
    const departamentosParams = filtrosObj.departamentos.join(",")



    const category = filtrosObj.categoria.length > 0 ? "categoria=" + categoriesParams + "&" : "",
      junta = filtrosObj.junta.length > 0 ? "junta_vecinal=" + juntasParams + "&" : "",
      situation = filtrosObj.situacion.length > 0 ? "situacion=" + situacionesParams + "&" : "",
      departamento = filtrosObj.departamentos.length > 0 ? "departamento=" + departamentosParams + "&" : "",
      iniDate = dateRange?.from ? "fecha_publicacion_after=" + format(dateRange?.from, "yyyy-MM-dd") + "&" : "",
      endDate = dateRange?.to ? "fecha_publicacion_before=" + format(dateRange?.to, "yyyy-MM-dd") + "&" : "",
      limitPerPage = publicacionesPorPagina ? "pagesize=" + publicacionesPorPagina : ""


    const filtros = `${category}${junta}${situation}${departamento}${iniDate}${endDate}${limitPerPage}`
    // borrar ultimo & si existe
    return filtros
  }

  const aplicarFiltros = () => {

    const filtros = getQueryParams()
    // return;
    let url = `${api_url}publicaciones/?${filtros}`
    console.log(url)

    console.log(filtros)
    console.log(filtrosObj.categoria.length)

    setUrl(url)
    setFiltros(filtros)
    setCurrentPage(1)
  }
  const limpiarFiltros = () => {
    setSelectedCategoria(null)
    setSelectedSituacion(null)
    setSelectedJunta(null)
    setSelectedDepto(null)
    setDateRange({ from: null, to: null })
    setUrl(null)
    setFiltrosObj({
      categoria: [],
      junta: [],
      situacion: [],
      departamentos: [],
      iniDate: null,
      endDate: null
    })
    setClearValues(!clearValues)

  }

  return (


    <>
      <TopBar handleOpenSidebar={handleOpenSidebar} title="Listado de publicaciones" />
      <main className=" p-4  bg-gray-100 ">
        <div className="m-4">
          <Filters
            clearValues={clearValues}
            categorias={categorias}
            situaciones={situaciones}
            juntasVecinales={juntasVecinales}
            departamentos={departamentos}
            setFiltrosObj={setFiltrosObj}
            filtrosObj={filtrosObj}
            dateRange={dateRange}
            setDateRange={setDateRange}
            setIsValid={setIsValid}
            isValid={isValid}
            loading={loading}
            handleDownload={handleDownload}
            limpiarFiltros={limpiarFiltros}
            aplicarFiltros={aplicarFiltros}
            showDownload={true}
            isDownloadAvailable={isDownloadAvailable}
          />

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