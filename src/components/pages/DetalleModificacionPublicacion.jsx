"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ArrowLeft,
  Calendar,
  MapPin,
  FileText,
  Edit,
  AlertCircle,
  Clock,
  Shield,
  Monitor,
  History,
  CheckCircle,
  XCircle,
} from "lucide-react"
import TopBar from "../TopBar"
import { useLocation, useNavigate } from 'react-router-dom';

const DetalleModificacionPublicacion = ({ datos }) => {
  const navigate = useNavigate();

  const location = useLocation();
  const datosCompletos = location.state?.datosCompletos || datos;
  console.log("Datos recibidos:", )
  const { modificacion, publicacion, todasLasModificaciones } = datosCompletos

  const onVolver = () => {
    console.log("Volviendo al historial de modificaciones")
    navigate("/historial-modificacion-publicaciones")
  }

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const formatearFechaCorta = (fecha) => {
    return new Date(fecha).toLocaleString("es-AR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getEstadoBadge = (estado) => {
    const colores = {
      Reportado: "bg-yellow-100 text-yellow-800 border-yellow-300",
      "En proceso": "bg-blue-100 text-blue-800 border-blue-300",
      Resuelto: "bg-green-100 text-green-800 border-green-300",
      Pendiente: "bg-gray-100 text-gray-800 border-gray-300",
      Urgente: "bg-red-100 text-red-800 border-red-300",
    }
    return colores[estado] || "bg-gray-100 text-gray-800 border-gray-300"
  }

  const getImpactoBadge = (impacto) => {
    const colores = {
      Bajo: "bg-green-100 text-green-800 border-green-300",
      Medio: "bg-yellow-100 text-yellow-800 border-yellow-300",
      Alto: "bg-red-100 text-red-800 border-red-300",
    }
    return colores[impacto] || "bg-gray-100 text-gray-800 border-gray-300"
  }

  const getCampoIcon = (campo) => {
    const iconos = {
      Estado: <AlertCircle className="w-4 h-4 text-blue-500" />,
      Ubicación: <MapPin className="w-4 h-4 text-red-500" />,
      Descripción: <FileText className="w-4 h-4 text-green-500" />,
      Prioridad: <Clock className="w-4 h-4 text-orange-500" />,
      Categoría: <Edit className="w-4 h-4 text-purple-500" />,
    }
    return iconos[campo] || <Edit className="w-4 h-4 text-gray-500" />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <TopBar title="Detalle de Modificación" icon={<Edit className="h-6 w-6 text-blue-600" />} />
      {/* <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-semibold text-gray-900">Detalle de Modificación</h1>
          </div>
        </div>
      </div> */}

      <div className="p-6 space-y-6">
        {/* Botón para volver */}
        <Button variant="outline" onClick={onVolver} className="mb-4 bg-white">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al Historial
        </Button>

        {/* Información de la modificación principal */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
            <CardTitle className="flex items-center gap-3">
              <Edit className="w-6 h-6 text-blue-600" />
              Modificación #{modificacion.id}
              {/* <Badge className={`${getImpactoBadge(modificacion.impacto)}`}>Impacto {modificacion.impacto}</Badge> */}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Información básica */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="font-medium text-gray-900">Fecha y hora</div>
                    <div className="text-sm text-gray-600">{formatearFecha(modificacion.fecha)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={modificacion.usuario_info.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {modificacion.usuario_info.nombre
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-gray-900">{modificacion.usuario_info.nombre}</div>
                    <div className="text-sm text-gray-600">
                      {modificacion.usuario_info.rol} • {modificacion.usuario_info.departamento}
                    </div>
                    <div className="text-xs text-gray-500">{modificacion.usuario_info.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="font-medium text-gray-900">Dirección IP</div>
                    <div className="text-sm text-gray-600 font-mono">{modificacion.ip_address}</div>
                  </div>
                </div>
              </div>

              {/* Detalles del cambio */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {getCampoIcon(modificacion.campo_modificado)}
                  <div>
                    <div className="font-medium text-gray-900">Campo modificado</div>
                    <div className="text-sm text-gray-600">{modificacion.campo_modificado}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-medium text-gray-900">Cambio realizado</div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      <XCircle className="w-3 h-3 mr-1" />
                      {modificacion.valor_anterior}
                    </Badge>
                    <span className="text-gray-400">→</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {modificacion.valor_nuevo}
                    </Badge>
                  </div>
                </div>

                <div>
                  <div className="font-medium text-gray-900 mb-2">Motivo de la modificación</div>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">{modificacion.motivo}</div>
                </div>

                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="font-medium text-gray-900">Estado de aprobación</div>
                    <div className="text-sm text-gray-600">{modificacion.aprobada_por}</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información de la publicación afectada */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 w-5 text-green-600" />
              Publicación Afectada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <div className="font-medium text-gray-900">ID de Publicación</div>
                  <div className="text-sm text-gray-600 font-mono">{publicacion.publicacion_id}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Título</div>
                  <div className="text-sm text-gray-600">{publicacion.titulo}</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <div>
                    <div className="font-medium text-gray-900">Ubicación</div>
                    <div className="text-sm text-gray-600">{publicacion.ubicacion}</div>
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Estado actual</div>
                  <Badge className={`${getEstadoBadge(publicacion.estado_actual)} mt-1`}>
                    {publicacion.estado_actual}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Historial completo de modificaciones de esta publicación */}
        {todasLasModificaciones && todasLasModificaciones.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-purple-600" />
                Historial Completo de Modificaciones ({todasLasModificaciones.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Campo</TableHead>
                      <TableHead>Cambio</TableHead>
                      <TableHead>Impacto</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {todasLasModificaciones
                      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                      .map((mod) => (
                        <TableRow
                          key={mod.id}
                          className={mod.id === modificacion.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""}
                        >
                          <TableCell className="font-mono text-xs">{formatearFechaCorta(mod.fecha)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={mod.usuario_info.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="text-xs">
                                  {mod.usuario_info.nombre
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="text-sm font-medium">
                                  {mod.usuario_info.nombre}
                                  {mod.id === modificacion.id && (
                                    <Badge variant="outline" className="ml-2 text-xs">
                                      Actual
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500">{mod.usuario_info.rol}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getCampoIcon(mod.campo_modificado)}
                              <span className="text-sm">{mod.campo_modificado}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                                {mod.valor_anterior}
                              </Badge>
                              <span className="text-gray-400">→</span>
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                {mod.valor_nuevo}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`text-xs ${getImpactoBadge(mod.impacto)}`}>{mod.impacto}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs">
                              {mod.aprobada_por === "Pendiente de aprobación" ? (
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                  Pendiente
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  Aprobada
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Información adicional */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información Técnica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">ID de Modificación:</span>
                <span className="font-mono text-sm">{modificacion.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ID de Usuario:</span>
                <span className="font-mono text-sm">{modificacion.usuario_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Dirección IP:</span>
                <span className="font-mono text-sm">{modificacion.ip_address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Timestamp:</span>
                <span className="font-mono text-sm">{modificacion.fecha}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumen del Cambio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">Antes:</div>
                <div className="font-medium text-red-700">{modificacion.valor_anterior}</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">Después:</div>
                <div className="font-medium text-green-700">{modificacion.valor_nuevo}</div>
              </div>
              <div className="text-center text-gray-500 text-sm">
                Modificación realizada el {formatearFechaCorta(modificacion.fecha)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default DetalleModificacionPublicacion
