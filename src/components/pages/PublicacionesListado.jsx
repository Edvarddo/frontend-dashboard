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
  // const situaciones = [
  //   "Recibido",
  //   "En curso",
  //   "Resuelto"
  // ]
  const situaciones = [
    {nombre: "Recibido", value: "recibido"},
    {nombre: "En curso", value: "en_curso"},
    {nombre: "Resuelto", value: "resuelto"}
  ]

  // VALORES SELECCIONADOS FILTROS
  const [selectedCategoria, setSelectedCategoria] = useState(null)
  const [selectedSituacion, setSelectedSituacion] = useState(null)
  const [selectedJunta, setSelectedJunta] = useState(null)
  const [selectedIniDate, setSelectedIniDate] = useState(null)
  const [selectedEndDate, setSelectedEndDate] = useState(null)
  const [clearValues , setClearValues] = useState(false)
  // object filtros
  const [filtrosObj, setFiltrosObj] = useState({
    categoria: [],
    junta: [],
    situacion: [],
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
      // add loading state
      
      const [categorias, juntasVecinales] = await Promise.all(urls.map(url => fetch(url,{
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      }).then(res => res.json())))
      // change nombre_calle to nombre on juntasVecinales
      juntasVecinales.map(junta => {
        junta.nombre = junta.nombre_calle
        return junta
      })

      setCategorias(categorias)
      setJuntasVecinales(juntasVecinales)
      
    } catch (e) {
      setFilterError(e)
      
    }
  }
  useEffect(() => {

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

  useEffect(() => {

  }, [filtrosObj])
  const handleOpenSidebar = () => {
    setIsOpened(!isOpened)
  }
  const handleDownload = () => {
    // change the href to the correct url
    window.location.href = `https://proyecto-municipal-vercel.vercel.app/api/export-to-excel/${filtros ? "?" + filtros : ""}`


  }
  const aplicarFiltros = () => {
    // create url with filters object
    const categoriesParams = filtrosObj.categoria.join(",")
    const juntasParams = filtrosObj.junta.join(",")
    const situacionesParams = filtrosObj.situacion.join(",")



    const category = filtrosObj.categoria.length > 0 ? "categoria=" + categoriesParams + "&" : "",
      junta = filtrosObj.junta.length >0 ? "junta_vecinal=" + juntasParams + "&" : "",
      situation = filtrosObj.situacion.length >0 ? "situacion=" + situacionesParams + "&" : "",
      iniDate = selectedIniDate ? "fecha_publicacion_after=" + format(selectedIniDate, "yyyy-MM-dd") + "&" : "",
      endDate = selectedEndDate ? "fecha_publicacion_before=" + format(selectedEndDate, "yyyy-MM-dd")+ "&" : "",
      limitPerPage = publicacionesPorPagina ? "pagesize=" + publicacionesPorPagina + "&" : ""
    
    const filtros = `${category}${junta}${situation}${iniDate}${endDate}` 
    let url = `${api_url}publicaciones/?${category}${junta}${situation}${iniDate}${endDate}`

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
    // void filtersObj
    setFiltrosObj({
      categoria: [],
      junta: [],
      situacion: [],
      iniDate: null,
      endDate: null
    })
    setClearValues(!clearValues)
    
  }

  return (


    <>
      <TopBar handleOpenSidebar={handleOpenSidebar} title="Listado de publicaciones" />
      <main className=" p-4  bg-gray-100 ">
        <div className="bg-white m-4 p-6 rounded-lg shadow-md">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div>
              <h2 className="mb-2 font-semibold">Categoría</h2>
              <div>
              <MultiSelect clearValues = {clearValues} options={categorias} onValueChange={(val)=>{
                setFiltrosObj({ ...filtrosObj, categoria: val })
              }} />
            </div>
            </div>
            <div>
              <h2 className="mb-2 font-semibold">Estado de la publicación</h2>
              <div>
              <MultiSelect clearValues = {clearValues} options={situaciones} onValueChange={(val)=>{
                setFiltrosObj({ ...filtrosObj, situacion: val })
              }} />
            </div>
            </div>
            <div>
              <h2 className="mb-2 font-semibold">Junta vecinal</h2>
              <div>
              <MultiSelect clearValues = {clearValues} options={juntasVecinales} onValueChange={(val)=>{
                setFiltrosObj({ ...filtrosObj, junta: val })
              }} />
            </div>
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
            <Button disabled={loading} variant="outline" onClick={handleDownload} className="mb-3 bg-blue-500 hover:bg-blue-600 filter-btn w-full md:w-[unset]  ">

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
            loading={loading}
            setLoading={setLoading}
            url={url}
          />

        </div>


      </main>
    
    </>
      

    

  )
}