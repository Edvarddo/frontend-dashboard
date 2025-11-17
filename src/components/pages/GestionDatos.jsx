// GestionDatosMain.jsx
import { useEffect, useMemo, useCallback, useState, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin, Tag, Building2, BarChart3, Settings, ArrowRight, Plus, Eye, Edit } from "lucide-react"
import TopBar from "../TopBar"
import GestionJuntaVecinal from "./GestionJuntaVecinal"
import GestionCategoria from "./GestionCategoria"
import GestionDepartamento from "./GestionDepartamento"
import useAxiosPrivate from "@/hooks/useAxiosPrivate"
import { API_ROUTES } from "@/api/apiRoutes"


// --- Adaptador: normaliza llaves del backend -> front
const adaptEstadisticas = (raw) => ({
  juntasVecinales: {
    total: raw?.juntasVecinales?.total ?? 0,
    habilitadas: raw?.juntasVecinales?.activas ?? raw?.juntasVecinales?.habilitadas ?? 0,
    pendientes: raw?.juntasVecinales?.pendientes ?? 0,
    deshabilitadas: raw?.juntasVecinales?.inactivas ?? raw?.juntasVecinales?.deshabilitadas ?? 0,
  },
  categorias: {
    total: raw?.categorias?.total ?? 0,
    activos: raw?.categororias?.activos ?? raw?.categorias?.activas ?? raw?.categorias?.habilitados ?? 0,
    deshabilitados: raw?.categororias?.deshabilitados ?? raw?.categorias?.inactivas ?? raw?.categorias?.deshabilitados ?? 0,
  },
  departamentos: {
    total: raw?.departamentos?.total ?? 0,
    activos: raw?.departamentos?.activos ?? raw?.departamentos?.habilitados ?? 0,
    deshabilitados: raw?.departamentos?.inactivos ?? raw?.departamentos?.deshabilitados ?? 0,
  },
})

// --- Placeholder simple para carga (si no usas Skeleton de shadcn)
const LoadingBar = () => (
  <div className="h-8 w-24 rounded bg-green-100 animate-pulse" />
)

const GestionDatosMain = () => {
  const [vistaActual, setVistaActual] = useState("hub")
  const [seccionActual, setSeccionActual] = useState(null)
  const [isPending, startTransition] = useTransition()

  const handleNavegar = useCallback((seccionId, _accion) => {
    startTransition(() => {
      if (seccionId === "juntas-vecinales") setVistaActual("juntas-vecinales")
      else if (seccionId === "categorias") setVistaActual("categorias")
      else if (seccionId === "departamentos") setVistaActual("departamentos")
      setSeccionActual(seccionId)
    })
  }, [])

  const handleVolver = useCallback(() => {
    startTransition(() => {
      setVistaActual("hub")
      setSeccionActual(null)
    })
  }, [])

  if (vistaActual === "juntas-vecinales") return <GestionJuntaVecinal onVolver={handleVolver} />
  if (vistaActual === "categorias") return <GestionCategoria onVolver={handleVolver} />
  if (vistaActual === "departamentos") return <GestionDepartamento onVolver={handleVolver} />

  // (Opcional) Loader global mientras cambia de vista
  // if (isPending) return <div className="p-6 text-gray-500">Cargando…</div>

  return <GestionDatos onNavigate={handleNavegar} />
}

const GestionDatos = ({ onNavigate }) => {
  const axiosPrivate = useAxiosPrivate()
  const [loading, setLoading] = useState(false)
  const [estadisticasDatos, setEstadisticasDatos] = useState(adaptEstadisticas({}))
  const [seccionSeleccionada, setSeccionSeleccionada] = useState("juntas-vecinales")

  // Secciones memoizadas para evitar recrear objetos en cada render
  const secciones = useMemo(
    () => [
      {
        id: "juntas-vecinales",
        titulo: "Juntas Vecinales",
        descripcion: "Gestiona las juntas vecinales del municipio",
        icono: MapPin,
        color: "bg-green-700",
        colorHover: "hover:bg-green-800",
        estadisticas: estadisticasDatos.juntasVecinales,
        acciones: [
          { label: "Ver todas", icono: Eye, variant: "outline" },
          { label: "Agregar nueva", icono: Plus, variant: "default" },
          { label: "Gestionar", icono: Settings, variant: "secondary" },
        ],
      },
      {
        id: "categorias",
        titulo: "Categorías",
        descripcion: "Administra las categorías de publicaciones",
        icono: Tag,
        color: "bg-green-600",
        colorHover: "hover:bg-green-700",
        estadisticas: estadisticasDatos.categorias,
        acciones: [
          { label: "Ver todas", icono: Eye, variant: "outline" },
          { label: "Agregar nueva", icono: Plus, variant: "default" },
          { label: "Gestionar", icono: Edit, variant: "secondary" },
        ],
      },
      {
        id: "departamentos",
        titulo: "Departamentos",
        descripcion: "Configura los departamentos municipales",
        icono: Building2,
        color: "bg-green-500",
        colorHover: "hover:bg-green-600",
        estadisticas: estadisticasDatos.departamentos,
        acciones: [
          { label: "Ver todos", icono: Eye, variant: "outline" },
          { label: "Agregar nuevo", icono: Plus, variant: "default" },
          { label: "Gestionar", icono: Settings, variant: "secondary" },
        ],
      },
    ],
    [estadisticasDatos]
  )

  const seccionActual = useMemo(
    () => secciones.find((s) => s.id === seccionSeleccionada),
    [secciones, seccionSeleccionada]
  )

  const handleNavegar = useCallback(
    (seccionId, accion) => {
      onNavigate?.(seccionId, accion)
    },
    [onNavigate]
  )

  // Fetch con cancelación + adaptación de datos
  useEffect(() => {
    console.log("Fetching estadísticas de gestión de datos...")
    const ctrl = new AbortController()
    let isMounted = true

    const fetchEstadisticas = async () => {
      const startTime = Date.now()
      try {
        setLoading(true)
        const response = await axiosPrivate.get(
          API_ROUTES.STATS.ESTADISTICAS_GESTION_DATOS,
          { signal: ctrl.signal }
        )

        if (!isMounted) return

        setEstadisticasDatos(adaptEstadisticas(response.data))
      } catch (error) {
        if (
          error.name !== "CanceledError" &&
          error.name !== "AbortError"
        ) {
          console.error("Error al obtener estadísticas:", error)
        }
      } finally {
        if (!isMounted) return

        const elapsed = Date.now() - startTime
        const MIN_DURATION = 500 // ms

        // Garantiza que el skeleton se vea al menos 500ms
        if (elapsed < MIN_DURATION) {
          setTimeout(() => {
            if (isMounted) setLoading(false)
          }, MIN_DURATION - elapsed)
        } else {
          setLoading(false)
        }
      }
    }

    fetchEstadisticas()

    return () => {
      isMounted = false
      ctrl.abort()
    }
  }, [axiosPrivate])

  // Ícono capitalizado (evita <seccionActual.icono/> en minúscula)
  const IconoActual = seccionActual.icono

  return (
    <>
      <TopBar title="Gestión de Datos" icon="bx bx-database" isOpened={true} setIsOpened={() => { }} />

      <div className="p-6 bg-gray-50 min-h-screen">

        {/* Tarjetas de estadísticas generales + Skeleton o loading bar*/}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {
            loading ? (
              <>
                <Skeleton className="h-28 w-full rounded-lg" />
                <Skeleton className="h-28 w-full rounded-lg" />
                <Skeleton className="h-28 w-full rounded-lg" />
              </>
            ) : null
          }
          {
            !loading && (
              <>
                <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                  {
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100">Total Juntas Vecinales</p>
                          <p className="text-3xl font-bold">
                            {loading ? <LoadingBar /> : estadisticasDatos.juntasVecinales.total}
                          </p>
                        </div>
                        <MapPin className="h-12 w-12 text-green-200" />
                      </div>
                    </CardContent>
                  }

                </Card>

                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100">Total Categorías</p>
                        <p className="text-3xl font-bold">
                          {loading ? <LoadingBar /> : estadisticasDatos.categorias.total}
                        </p>
                      </div>
                      <Tag className="h-12 w-12 text-green-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-400 to-green-500 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100">Total Departamentos</p>
                        <p className="text-3xl font-bold">
                          {loading ? <LoadingBar /> : estadisticasDatos.departamentos.total}
                        </p>
                      </div>
                      <Building2 className="h-12 w-12 text-green-200" />
                    </div>
                  </CardContent>
                </Card>
              </>
            )
          }

        </div>

        {/* Layout principal */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Menú lateral */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Secciones</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {secciones.map((seccion) => {
                    const IconoSeccion = seccion.icono
                    const isSelected = seccionSeleccionada === seccion.id
                    return (
                      <button
                        key={seccion.id}
                        onClick={() => setSeccionSeleccionada(seccion.id)}
                        className={`w-full text-left p-4 flex items-center gap-3 transition-colors ${isSelected
                          ? "bg-green-50 border-r-4 border-green-600 text-green-700"
                          : "hover:bg-gray-50 text-gray-700"
                          }`}
                      >
                        <IconoSeccion className={`h-5 w-5 ${isSelected ? "text-green-600" : "text-gray-500"}`} />
                        <div className="flex-1">
                          <div className="font-medium">{seccion.titulo}</div>
                          {
                            loading ? (
                              <LoadingBar />
                            ) : null
                          }
                          {
                            !loading && (
                              <>
                                <div className="text-sm text-gray-500">
                                  {seccion.estadisticas?.total ?? 0} elementos
                                </div>
                              </>
                            )
                          }

                        </div>
                        {isSelected && <ArrowRight className="h-4 w-4 text-green-600" />}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contenido principal */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${seccionActual.color} text-white`}>
                    <IconoActual className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{seccionActual.titulo}</CardTitle>
                    <p className="text-gray-600 mt-1">{seccionActual.descripcion}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Estadísticas detalladas */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {/* add skeleton */}
                  {
                    loading ? (
                      <>
                        <Skeleton className="h-20 w-full rounded-lg" />
                        <Skeleton className="h-20 w-full rounded-lg" />
                        <Skeleton className="h-20 w-full rounded-lg" />
                      </>
                    ) : null
                  }
                  {
                    !loading && (

                      <>
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-gray-900">
                            {seccionActual.estadisticas?.total ?? 0}
                          </div>
                          <div className="text-sm text-gray-600">Total</div>
                        </div>

                        {seccionActual.id === "juntas-vecinales" && (
                          <>
                            <div className="bg-green-50 p-4 rounded-lg text-center">
                              <div className="text-2xl font-bold text-green-700">
                                {seccionActual.estadisticas?.habilitadas ?? 0}
                              </div>
                              <div className="text-sm text-green-600">Habilitados</div>
                            </div>

                            <div className="bg-red-50 p-4 rounded-lg text-center">
                              <div className="text-2xl font-bold text-red-700">
                                {seccionActual.estadisticas?.deshabilitadas ?? 0}
                              </div>
                              <div className="text-sm text-red-600">Deshabilitados</div>
                            </div>
                          </>
                        )}

                        {(seccionActual.id === "categorias" || seccionActual.id === "departamentos") && (
                          <>
                            <div className="bg-green-50 p-4 rounded-lg text-center">
                              <div className="text-2xl font-bold text-green-700">
                                {seccionActual.estadisticas?.activos ?? 0}
                              </div>
                              <div className="text-sm text-green-600">Habilitados</div>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg text-center">
                              <div className="text-2xl font-bold text-red-700">
                                {seccionActual.estadisticas?.deshabilitados ?? 0}
                              </div>
                              <div className="text-sm text-red-600">Deshabilitados</div>
                            </div>
                          </>
                        )}
                      </>
                    )
                  }

                </div>

                {/* Información adicional */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-start gap-3">
                    <BarChart3 className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900">Información</h4>
                      <p className="text-sm text-green-700 mt-1">
                        {seccionActual.id === "juntas-vecinales" &&
                          "Las juntas vecinales son organizaciones comunitarias que representan los intereses de los vecinos ante el municipio."}
                        {seccionActual.id === "categorias" &&
                          "Las categorías ayudan a organizar y clasificar las publicaciones municipales para una mejor gestión."}
                        {seccionActual.id === "departamentos" &&
                          "Los departamentos municipales son las unidades administrativas que gestionan diferentes áreas del gobierno local."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Acciones rápidas (opcional) */}
                {/* 
                <div>
                  <h3 className="text-lg font-semibold mb-4">Acciones Rápidas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {seccionActual.acciones.map((accion, index) => {
                      const IconoAccion = accion.icono
                      return (
                        <Button
                          key={index}
                          variant={accion.variant}
                          className={`h-auto p-4 flex flex-col items-center gap-2 ${
                            accion.variant === "default" ? "bg-green-600 hover:bg-green-700 text-white" : ""
                          }`}
                          onClick={() => handleNavegar(seccionActual.id, accion.label.toLowerCase())}
                        >
                          <IconoAccion className="h-6 w-6" />
                          <span>{accion.label}</span>
                        </Button>
                      )
                    })}
                  </div>
                </div>
                */}

                {/* Botón principal */}
                <div className="pt-4 border-t">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    size="lg"
                    onClick={() => handleNavegar(seccionActual.id, "gestionar")}
                  >
                    <Settings className="h-5 w-5 mr-2" />
                    Ir a Gestión de {seccionActual.titulo}
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}

export default GestionDatosMain