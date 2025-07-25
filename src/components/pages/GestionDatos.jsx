
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Tag, Building2, BarChart3, Settings, ArrowRight, Plus, Eye, Edit } from "lucide-react"
import TopBar from "../TopBar"
import GestionJuntaVecinal from "./GestionJuntaVecinal"
import GestionCategoria from "./GestionCategoria"
// Agregar la importación del nuevo componente
import GestionDepartamento from "./GestionDepartamento"
const estadisticas = {
  juntasVecinales: {
    total: 45,
    activas: 38,
    pendientes: 5,
    inactivas: 2,
  },
  categorias: {
    total: 12,
    activas: 10,
    inactivas: 2,
  },
  departamentos: {
    total: 8,
    activos: 7,
    inactivos: 1,
  },
}
const GestionDatosMain = () => {
  const [vistaActual, setVistaActual] = useState("hub")
  const [seccionActual, setSeccionActual] = useState(null)

  const handleNavegar = (seccionId, accion) => {
    console.log(`Navegando a: ${seccionId} - ${accion}`)
    console.log(seccionId, accion)

    if (seccionId === "juntas-vecinales") {
      setVistaActual("juntas-vecinales")
      setSeccionActual(seccionId)
    } else if (seccionId === "categorias") {
      // Aquí se navegaría a la vista de categorías cuando esté implementada
      setVistaActual("categorias")
      setSeccionActual(seccionId)
      console.log("Navegando a Categorías - Próximamente")
    } else if (seccionId === "departamentos") {
      setVistaActual("departamentos")
      setSeccionActual(seccionId)
      // Aquí se navegaría a la vista de departamentos cuando esté implementada
      console.log("Navegando a Departamentos - Próximamente")
    }
  }

  const handleVolver = () => {
    setVistaActual("hub")
    setSeccionActual(null)
  }

  if (vistaActual === "juntas-vecinales") {
    return <GestionJuntaVecinal onVolver={handleVolver} />
  }
  if (vistaActual === "categorias") {
    return <GestionCategoria onVolver={handleVolver} />
  }
   if (vistaActual === "departamentos") {
    return <GestionDepartamento onVolver={handleVolver} />
  }

  return <GestionDatos onNavigate={handleNavegar} />
}
const GestionDatos = ({onNavigate}) => {
  
  const [seccionSeleccionada, setSeccionSeleccionada] = useState("juntas-vecinales")
  const secciones = [
    {
      id: "juntas-vecinales",
      titulo: "Juntas Vecinales",
      descripcion: "Gestiona las juntas vecinales del municipio",
      icono: MapPin,
      color: "bg-green-700",
      colorHover: "hover:bg-green-800",
      estadisticas: estadisticas.juntasVecinales,
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
      estadisticas: estadisticas.categorias,
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
      estadisticas: estadisticas.departamentos,
      acciones: [
        { label: "Ver todos", icono: Eye, variant: "outline" },
        { label: "Agregar nuevo", icono: Plus, variant: "default" },
        { label: "Gestionar", icono: Settings, variant: "secondary" },
      ],
    },
  ]
   const seccionActual = secciones.find((s) => s.id === seccionSeleccionada)
   const handleNavegar = (seccionId, accion) => {
    if (onNavigate) {
      onNavigate(seccionId, accion)
    }
  }
  return (
     <>
      <TopBar title="Gestión de Datos" icon="bx bx-database" isOpened={true} setIsOpened={() => {}} />

      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header con estadísticas generales */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Panel de Gestión de Datos</h1>
          <p className="text-gray-600">
            Administra las juntas vecinales, categorías y departamentos del sistema municipal
          </p>
        </div>

        {/* Tarjetas de estadísticas generales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Juntas Vecinales - Verde más oscuro */}
          <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Total Juntas Vecinales</p>
                  <p className="text-3xl font-bold">{estadisticas.juntasVecinales.total}</p>
                </div>
                <MapPin className="h-12 w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          {/* Categorías - Verde medio */}
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Total Categorías</p>
                  <p className="text-3xl font-bold">{estadisticas.categorias.total}</p>
                </div>
                <Tag className="h-12 w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          {/* Departamentos - Verde más claro */}
          <Card className="bg-gradient-to-r from-green-400 to-green-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Total Departamentos</p>
                  <p className="text-3xl font-bold">{estadisticas.departamentos.total}</p>
                </div>
                <Building2 className="h-12 w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Layout principal con menú lateral y contenido */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Menú lateral de secciones */}
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
                        className={`w-full text-left p-4 flex items-center gap-3 transition-colors ${
                          isSelected
                            ? "bg-green-50 border-r-4 border-green-600 text-green-700"
                            : "hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        <IconoSeccion className={`h-5 w-5 ${isSelected ? "text-green-600" : "text-gray-500"}`} />
                        <div className="flex-1">
                          <div className="font-medium">{seccion.titulo}</div>
                          <div className="text-sm text-gray-500">{seccion.estadisticas.total} elementos</div>
                        </div>
                        {isSelected && <ArrowRight className="h-4 w-4 text-green-600" />}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Área de contenido principal */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${seccionActual.color} text-white`}>
                    <seccionActual.icono className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{seccionActual.titulo}</CardTitle>
                    <p className="text-gray-600 mt-1">{seccionActual.descripcion}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Estadísticas detalladas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-gray-900">{seccionActual.estadisticas.total}</div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>

                  {seccionActual.id === "juntas-vecinales" && (
                    <>
                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-700">{seccionActual.estadisticas.activas}</div>
                        <div className="text-sm text-green-600">Activas</div>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-yellow-700">
                          {seccionActual.estadisticas.pendientes}
                        </div>
                        <div className="text-sm text-yellow-600">Pendientes</div>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-red-700">{seccionActual.estadisticas.inactivas}</div>
                        <div className="text-sm text-red-600">Inactivas</div>
                      </div>
                    </>
                  )}

                  {(seccionActual.id === "categorias" || seccionActual.id === "departamentos") && (
                    <>
                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-700">
                          {seccionActual.estadisticas.activas || seccionActual.estadisticas.activos}
                        </div>
                        <div className="text-sm text-green-600">Activos</div>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-red-700">
                          {seccionActual.estadisticas.inactivas || seccionActual.estadisticas.inactivos}
                        </div>
                        <div className="text-sm text-red-600">Inactivos</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-gray-700">-</div>
                        <div className="text-sm text-gray-600">-</div>
                      </div>
                    </>
                  )}
                </div>

                {/* Acciones rápidas */}
                {/* <div>
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
                </div> */}

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

                {/* Botón principal de navegación */}
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