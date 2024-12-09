import React, { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowDownIcon, CheckCircle2Icon, ClockIcon, AlertCircleIcon, XCircleIcon, ArrowLeftIcon, ArrowRight, ArrowRightIcon, Edit2Icon, Trash2Icon } from 'lucide-react'
import { format } from "date-fns"
import EditMunicipalResponseModal from '../EditMunicipalResponseModal'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

const getStateIcon = (state) => {
  switch (state) {
    case 'Pendiente': return <AlertCircleIcon className="h-6 w-6 text-yellow-500" />
    case 'Recibido': return <ClockIcon className="h-6 w-6 text-blue-500" />
    case 'En curso': return <ClockIcon className="h-6 w-6 text-purple-500" />
    case 'Resuelto': return <CheckCircle2Icon className="h-6 w-6 text-green-500" />
    case 'No resuelto': return <XCircleIcon className="h-6 w-6 text-red-500" />
    default: return <AlertCircleIcon className="h-6 w-6 text-gray-500" />
  }
}

const getStateColor = (state) => {
  switch (state) {
    case 'Pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'Recibido': return 'bg-blue-100 text-blue-800 border-blue-300'
    case 'En curso': return 'bg-purple-100 text-purple-800 border-purple-300'
    case 'Resuelto': return 'bg-green-100 text-green-800 border-green-300'
    case 'No resuelto': return 'bg-red-100 text-red-800 border-red-300'
    default: return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

const ResponseSkeleton = () => (
  <div className="relative pl-8">
    <span className="absolute left-0 flex items-center justify-center w-8 h-8 bg-white rounded-full ring-8 ring-white">
      <Skeleton className="h-6 w-6 rounded-full" />
    </span>
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-6 w-20" />
          </div>
          <div>
            <Skeleton className="h-4 w-20 mb-1" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-20 mb-1" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
)

export function MunicipalResponsesList({ responses, loading, onEditResponse, onDeleteResponse }) {
  const [editingResponse, setEditingResponse] = useState(null)

  const handleEditClick = (response) => {
    setEditingResponse(response)
  }

  const handleCloseModal = () => {
    setEditingResponse(null)
  }

  const handleSaveEdit = (updatedResponse) => {
    onEditResponse(updatedResponse)
    setEditingResponse(null)
  }

  const handleDeleteLastResponse = () => {
    if (responses.length > 0) {
      onDeleteResponse(responses[responses.length - 1].id)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8 relative before:absolute before:inset-0 before:left-4 before:h-full before:w-0.5 before:bg-gray-200">
        {[...Array(3)].map((_, index) => (
          <ResponseSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (responses.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <AlertCircleIcon className="h-12 w-12 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-700">No hay respuestas municipales</h3>
            <p className="text-sm text-gray-500">Aún no se han registrado respuestas para esta publicación.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-8 relative before:absolute before:inset-0 before:left-4 before:h-full before:w-0.5 before:bg-gray-200">
        {responses.map((response, index) => (
          <div key={index} className="relative pl-8">
            <span className="absolute left-0 flex items-center justify-center w-8 h-8 bg-white rounded-full ring-8 ring-white">
              {getStateIcon(response.situacion_posterior)}
            </span>
            <Card className="w-full">
              <CardContent className="p-4">
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">
                      {format(new Date(response.fecha), "dd/MM/yyyy HH:mm")}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-500">
                        {response.usuario.nombre}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(response)}
                        className="p-1"
                      >
                        <Edit2Icon className="h-4 w-4" />
                        <span className="sr-only">Editar respuesta</span>
                      </Button>
                      {index === responses.length - 1 && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="p-1 text-red-600 hover:text-red-700"
                            >
                              <Trash2Icon className="h-4 w-4" />
                              <span className="sr-only">Eliminar respuesta</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Esto eliminará permanentemente la última respuesta municipal.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDeleteLastResponse}>
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={`${getStateColor(response.situacion_inicial)} px-2 py-1 text-xs font-medium border`}>
                      {response.situacion_inicial}
                    </Badge>
                    <ArrowRightIcon className="h-4 w-4 text-gray-400 transform " />
                    <Badge className={`${getStateColor(response.situacion_posterior)} px-2 py-1 text-xs font-medium border`}>
                      {response.situacion_posterior}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Descripción:</h4>
                    <p className="text-sm text-gray-600">{response.descripcion}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Acciones:</h4>
                    <p className="text-sm text-gray-600">{response.acciones}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
      <EditMunicipalResponseModal
        isOpen={!!editingResponse}
        onClose={handleCloseModal}
        response={editingResponse}
        onSave={handleSaveEdit}
      />
    </>
  )
}

export default MunicipalResponsesList

