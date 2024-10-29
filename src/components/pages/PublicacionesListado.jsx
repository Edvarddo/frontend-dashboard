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
export default function PublicacionesListado({
  isOpened,
  setIsOpened
}) {
  // PARAMETROS URL
  const [currentPage, setCurrentPage] = useState(1)
  const [url, setUrl] = useState(null)
  const [filtros, setFiltros] = useState(null)
  const [publicacionesPorPagina, setPublicacionesPorPagina] = useState("5")

  // OPCIONES SELECT
  const [categorias, setCategorias] = useState([])
  const [juntasVecinales, setJuntasVecinales] = useState([])
  const situaciones = [
    "Recibido",
    "En curso",
    "Resuelto"
  ]

  // VALORES SELECCIONADOS FILTROS
  const [selectedCategoria, setSelectedCategoria] = useState(null)
  const [selectedSituacion, setSelectedSituacion] = useState(null)
  const [selectedJunta, setSelectedJunta] = useState(null)
  const [selectedIniDate, setSelectedIniDate] = useState(null)
  const [selectedEndDate, setSelectedEndDate] = useState(null)

  // VALIDACIÓN
  const [isValid, setIsValid] = useState(false)
  const [filterError, setFilterError] = useState(null)

  const api_url = import.meta.env.VITE_URL_PROD_VERCEL
  const fetchURLS = async (urls) => {
    try {
      const [categorias, juntasVecinales] = await Promise.all(urls.map(url => fetch(url).then(res => res.json())))
      setCategorias(categorias)
      setJuntasVecinales(juntasVecinales)

    } catch (e) {
      setFilterError(e)
    }
  }
  useEffect(() => {
    console.log("fetching urls", api_url)
    fetchURLS([
      `${api_url}categorias/`,
      `${api_url}juntas-vecinales/`
    ])

  }, [])
  useEffect(() => {
    const category = selectedCategoria ? "categoria=" + selectedCategoria + "&" : "",
      junta = selectedJunta ? "junta_vecinal=" + selectedJunta + "&" : "",
      situation = selectedSituacion ? "situacion=" + selectedSituacion + "&" : "",
      iniDate = selectedIniDate ? "fecha_publicacion_after=" + format(selectedIniDate, "yyyy-MM-dd") + "&" : "",
      endDate = selectedEndDate ? "fecha_publicacion_before=" + format(selectedEndDate, "yyyy-MM-dd")+ "&" : "",
      limitPerPage = publicacionesPorPagina ? "pagesize=" + publicacionesPorPagina + "&" : ""
    const filtros = `${category}${junta}${situation}${iniDate}${endDate}` 
    setFiltros(filtros)
  }, [selectedCategoria, selectedJunta, selectedSituacion, selectedIniDate, selectedEndDate, publicacionesPorPagina])

  const handleOpenSidebar = () => {
    setIsOpened(!isOpened)
  }
  const handleDownload = () => {
    // change the href to the correct url
    window.location.href = `https://proyecto-municipal-vercel-a4o9opiq6-scarrizozs-projects.vercel.app/api/export-to-excel/${filtros ? "?" + filtros : ""}`


  }
  const aplicarFiltros = () => {

    const category = selectedCategoria ? "categoria=" + selectedCategoria + "&" : "",
      junta = selectedJunta ? "junta_vecinal=" + selectedJunta + "&" : "",
      situation = selectedSituacion ? "situacion=" + selectedSituacion + "&" : "",
      iniDate = selectedIniDate ? "fecha_publicacion_after=" + format(selectedIniDate, "yyyy-MM-dd") + "&" : "",
      endDate = selectedEndDate ? "fecha_publicacion_before=" + format(selectedEndDate, "yyyy-MM-dd")+ "&" : "",
      limitPerPage = publicacionesPorPagina ? "pagesize=" + publicacionesPorPagina + "&" : ""
    
    const filtros = `${category}${junta}${situation}${iniDate}${endDate}` 
    let url = `${api_url}publicaciones/?${category}${junta}${situation}${iniDate}${endDate}`
    console.log("aplicando filtros", filtros)
    setUrl(url)
    setFiltros(filtros)
    setCurrentPage(1)
  }
  const limpiarFiltros = () => {
    setSelectedCategoria(null)
    setSelectedSituacion(null)
    setSelectedJunta(null)
    setSelectedIniDate(null)
    setSelectedEndDate(null)
    setUrl(null)
  }

  return (


    <div className="bg-gray-100 min-h-screen min-w-[400px]">
      <header className="burger-btn p-4 flex items-center bg-[#00A86B]">
        <button
          onClick={handleOpenSidebar}
          className="text-white mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-white text-3xl font-bold">Listado de publicaciones</h1>
      </header>

      <main className=" p-4  bg-gray-100 ">
        <div className="bg-white m-4 p-6 rounded-lg shadow-md">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <h2 className="mb-2 font-semibold">Categoría</h2>
              <Select
                value={selectedCategoria ? selectedCategoria : ""}
                onValueChange={(val) => { setSelectedCategoria(val) }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Todas las categorías</SelectItem>
                  {
                    categorias?.map(categoria => (
                      <SelectItem key={categoria?.id} value={categoria?.nombre.toString()}>{categoria?.nombre}</SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
            <div>
              <h2 className="mb-2 font-semibold">Estado de la publicación</h2>
              <Select
                value={selectedSituacion ? selectedSituacion : ""}
                onValueChange={(val) => { setSelectedSituacion(val) }}
              >
                <SelectTrigger>

                  <SelectValue
                    placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Todas las categorías</SelectItem>
                  {
                    situaciones.map(situacion => (
                      <SelectItem key={situacion} value={situacion}>{situacion}</SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
            <div>
              <h2 className="mb-2 font-semibold">Junta vecinal</h2>
              <Select
                value={selectedJunta ? selectedJunta : ""}
                onValueChange={(val) => { setSelectedJunta(val) }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas las juntas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Todas las juntas</SelectItem>
                  {
                    juntasVecinales.map(junta => (
                      <SelectItem key={junta.id} value={junta.nombre_calle.toString()}>{junta.nombre_calle} {junta.numero_calle}</SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h2 className="mb-2 font-semibold">Fecha inicial</h2>
              <div className="flex">
                <DatePicker
                  selectedDate={selectedIniDate}
                  setSelectedDate={setSelectedIniDate}
                  setIsValid={setIsValid}
                  isValid={isValid}
                />
              </div>
            </div>
            <div>
              <h2 className="mb-2 font-semibold">Fecha fin</h2>
              <div className="flex">
                {/* <input type="text" className="border rounded-l px-2 py-1 w-full" placeholder="Ej: 31-10-2024" /> */}


                <DatePicker
                  selectedDate={selectedEndDate}
                  setSelectedDate={setSelectedEndDate}
                  setIsValid={setIsValid}
                  isValid={isValid}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between flex-wrap  mb-6 btn-section  p-1">
            <Button variant="outline" onClick={handleDownload} className="mb-3 bg-blue-500 hover:bg-blue-600 filter-btn w-full md:w-[unset]  ">

              <span className="text-white flex justify-items-center justify-center">
                <Download className="mr-2 h-4 w-4" />
                Descargar datos
              </span>


            </Button>
            <div className="filter-btn-cont w-full md:w-[unset] ">
              <Button onClick={limpiarFiltros} className="w-full mb-2 mr-2 md:w-[unset] filter-btn" variant="outline">Limpiar filtros</Button>
              <Button disabled={isValid } onClick={aplicarFiltros}  className="w-full md:w-[unset] bg-green-500 hover:bg-green-600 text-white filter-btn">Aplicar filtros</Button>

            </div>
          </div>
        </div>
        <div className="bg-white m-4  p-6 rounded-lg shadow-md">
          <TablaPublicaciones
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            publicacionesPorPagina={publicacionesPorPagina}
            setPublicacionesPorPagina={setPublicacionesPorPagina}
            url={url}
          />

        </div>


      </main>

    </div>

  )
}