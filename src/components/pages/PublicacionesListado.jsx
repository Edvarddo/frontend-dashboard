import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar, Download } from "lucide-react"
import { useEffect, useState, useContext } from "react"
import TablaPublicaciones from "../TablaPublicaciones"
// date fns and popover
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, set } from "date-fns"
import {
  CalendarIcon,
  ArrowLeftIcon,
  FilterIcon,
  DownloadIcon,
  HomeIcon,
  FileTextIcon,
  BellIcon,
  BarChartIcon,
} from "lucide-react"
import axios from "axios"
import TopBar from "../TopBar"
import { BASE_URL } from "../../api/axios"
import useAxiosPrivate from "../../hooks/useAxiosPrivate"
import { API_ROUTES } from "../../api/apiRoutes"
import AuthContext from "../../contexts/AuthContext"
import useFilters from "../../hooks/useFilters"
import FilterContainer from "../filters/FilterContainer"
import FilterMultiSelect from "../filters/FilterMultiSelect"
import FilterDatePicker from "../filters/FilterDatePicker"

export default function PublicacionesListado({ isOpened, setIsOpened }) {
  const { departamento } = useContext(AuthContext) // <-- string con nombre del depto o null
  const axiosPrivate = useAxiosPrivate()

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

  // Hook de filtros
  const { filters, setFilter, resetFilters, getQueryParams } = useFilters({
    categoria: [],
    junta_vecinal: [],
    situacion: [],
    departamento: [],
    fecha_publicacion: { from: null, to: null },
  })

  const fetchURLS = async (urls) => {
    try {
      const [categorias, juntasVecinales, departamentos, osituaciones] =
        await Promise.all(urls.map((url) => axiosPrivate(url).then((res) => res.data)))

      // cambiar nombre_junta a nombre en juntasVecinales
      juntasVecinales.forEach((junta) => {
        junta.nombre = junta.nombre_junta
      })

      setCategorias(categorias)
      setJuntasVecinales(juntasVecinales)
      setDepartamentos(departamentos)
      setSituaciones(osituaciones)
    } catch (e) {
      setFilterError(e)
    }
  }

  useEffect(() => {
    fetchURLS([
      API_ROUTES.CATEGORIAS.ROOT,
      API_ROUTES.JUNTAS_VECINALES.ROOT,
      API_ROUTES.DEPARTAMENTOS.ROOT,
      API_ROUTES.SITUACIONES_PUBLICACIONES.ROOT,
    ])
    console.log(BASE_URL, axiosPrivate)
  }, [])

  const handleOpenSidebar = () => {
    setIsOpened(!isOpened)
  }

  /**
   * Helper: aplica el departamento (si existe) a un string de query params.
   * - queryParams: string tipo "categoria=1&situacion=2"
   * Devuelve un string con departamento agregado si no estaba.
   */
  const withDepartamentoParam = (queryParams) => {
    // Si NO hay departamento en el contexto → devolvemos tal cual (vista general)
    if (!departamento || typeof departamento !== "string" || !departamento.trim()) {
      return queryParams
    }

    const searchParams = new URLSearchParams(queryParams || "")

    // Si ya viene un departamento desde filtros (admin) lo respetamos
    if (!searchParams.has("departamento")) {
      searchParams.set("departamento", departamento) // usamos el nombre del departamento
    }

    return searchParams.toString()
  }

  const handleDownload = async (reportType = "excel") => {
    try {
      const token = localStorage.getItem("token") // O "authToken" según tu sistema
      let queryParams = getQueryParams()

      // Forzamos el departamento si el usuario tiene uno asignado
      queryParams = withDepartamentoParam(queryParams)

      // Determinar la URL según el tipo de reporte solicitado
      const endpoint =
        reportType === "pdf"
          ? API_ROUTES.REPORTS.GENERATE_PDF // Asegúrate de tener esta ruta definida
          : API_ROUTES.REPORTS.EXPORT_EXCEL

      const response = await axios.get(`${endpoint}?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob", // Importante: le dice a axios que es un archivo binario
      })

      // 1. Intentar obtener el nombre del archivo desde el backend
      // El backend envía: Content-Disposition: inline; filename="reporte_20231129.pdf"
      let filename = `reporte.${reportType === "pdf" ? "pdf" : "xlsx"}`

      const disposition = response.headers["content-disposition"]
      if (disposition && disposition.indexOf("filename=") !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        const matches = filenameRegex.exec(disposition)
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, "")
        }
      }

      // 2. Crear el objeto Blob con el tipo correcto
      // El backend ya envía el content-type correcto (application/pdf o application/vnd...)
      const blob = new Blob([response.data], {
        type: response.headers["content-type"]
      })

      // 3. Generar link de descarga
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", filename) // Usamos el nombre que vino del backend

      document.body.appendChild(link)
      link.click()

      // 4. Limpieza
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)

    } catch (error) {
      console.error("Error al descargar el archivo:", error)
      // Aquí podrías mostrar un toast o notificación de error
    }
  }

  const aplicarFiltros = () => {
    let queryParams = getQueryParams()

    // Forzar departamento si el usuario tiene uno
    queryParams = withDepartamentoParam(queryParams)
    console.log("Query params con departamento (si aplica):", queryParams)
    const limitPerPage = publicacionesPorPagina
      ? `&pagesize=${publicacionesPorPagina}`
      : ""

    const baseUrl = API_ROUTES.PUBLICACIONES.ROOT
    const finalUrl = `${baseUrl}?${queryParams}${limitPerPage}`

    console.log(finalUrl)
    setUrl(finalUrl)
    setCurrentPage(1)
  }

  const limpiarFiltrosHandler = () => {
    resetFilters()
    setUrl(null)
  }

  // Opcional: si quieres que al entrar el jefe/personal vea
  // automáticamente sus publicaciones SIN tocar "Aplicar filtros",
  // puedes descomentar este efecto:
  //
  // useEffect(() => {
  //   if (departamento) {
  //     aplicarFiltros()
  //   }
  // }, [departamento])

  return (
    <>
      <TopBar handleOpenSidebar={handleOpenSidebar} title="Listado de publicaciones" />
      <main className="p-4 bg-gray-100">
        <div className="m-4">
          <FilterContainer>
            <FilterMultiSelect
              label="Categoría"
              options={categorias}
              value={filters.categoria}
              onChange={(val) => setFilter("categoria", val)}
            />
            <FilterMultiSelect
              label="Estado de la publicación"
              options={situaciones}
              value={filters.situacion}
              onChange={(val) => setFilter("situacion", val)}
            />
            <FilterDatePicker
              label="Rango de fechas"
              dateRange={filters.fecha_publicacion}
              setDateRange={(val) => setFilter("fecha_publicacion", val)}
              setIsValid={setIsValid}
            />
            <FilterMultiSelect
              label="Junta vecinal"
              options={juntasVecinales}
              value={filters.junta_vecinal}
              onChange={(val) => setFilter("junta_vecinal", val)}
            />
            <FilterMultiSelect
              omitionFilterDepartment={departamento ? true : false}
              label="Departamento"
              options={departamentos}
              value={filters.departamento}
              onChange={(val) => setFilter("departamento", val)}
            />
          </FilterContainer>

          <div className="flex justify-between flex-wrap mb-6 btn-section p-1 bg-white rounded-b-lg shadow-md -mt-2 px-6 pb-6">
            <Button
              disabled={loading || !isDownloadAvailable}
              variant="outline"
              onClick={handleDownload}
              className="mb-3 bg-blue-500 hover:bg-blue-600 filter-btn w-full md:w-[unset]"
            >
              <span className="text-white flex justify-items-center justify-center">
                <Download className="mr-2 h-4 w-4" />
                Descargar datos
              </span>
            </Button>

            <div className="filter-btn-cont w-full md:w-[unset]">
              <Button
                onClick={limpiarFiltrosHandler}
                className="w-full mb-2 mr-2 md:w-[unset] filter-btn"
                variant="outline"
              >
                Limpiar filtros
              </Button>
              <Button
                disabled={isValid}
                onClick={aplicarFiltros}
                className="w-full md:w-[unset] bg-green-500 hover:bg-green-600 text-white filter-btn"
              >
                Aplicar filtros
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white m-4 p-6 rounded-lg shadow-md">
          <TablaPublicaciones
            departamento={departamento}
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
