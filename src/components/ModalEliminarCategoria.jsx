"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Trash2, AlertTriangle } from "lucide-react"

export function ModalEliminarCategoria({ categoria, onEliminar, onCancel }) {
  const [open, setOpen] = useState(false)
  const [eliminando, setEliminando] = useState(false)

  const handleEliminar = async () => {
    setEliminando(true)
    try {
      await onEliminar(categoria.id)
      setOpen(false)
    } catch (error) {
      console.error("Error al eliminar categoría:", error)
    } finally {
      setEliminando(false)
    }
  }

  const handleCancel = () => {
    setOpen(false)
    onCancel?.()
  }

  return (
    <>
      {/* Botón que abre el modal */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      {/* Modal de confirmación */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className=" mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-lg font-semibold text-gray-900">¿Eliminar categoría?</DialogTitle>
            <DialogDescription className="text-sm text-gray-600 mt-2">
              Esta acción no se puede deshacer. La categoría{" "}
              <span className="font-medium text-gray-900">"{categoria.nombre}"</span> será eliminada permanentemente del
              sistema.
            </DialogDescription>
          </DialogHeader>

          {/* Información adicional de la categoría */}
          <div className="bg-gray-50 rounded-lg p-4 my-4">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 text-sm">{categoria.nombre}</h4>
                {categoria.descripcion && <p className="text-xs text-gray-600 mt-1">{categoria.descripcion}</p>}
                <p className="text-xs text-gray-500 mt-2">ID: {categoria.id}</p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={eliminando}
              className="flex-1 sm:flex-none bg-transparent"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleEliminar}
              disabled={eliminando}
              className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700"
            >
              {eliminando ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar categoría
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
