import React, { useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const EditMunicipalResponseModal = ({ isOpen, onClose, response, onSave }) => {
  const [descripcion, setDescripcion] = React.useState(response?.descripcion || '')
  const [acciones, setAcciones] = React.useState(response?.acciones || '')

  useEffect(() => {
    if (response) {
      setDescripcion(response.descripcion || '')
      setAcciones(response.acciones || '')
    }
  }, [response])

  const handleSave = () => {
    onSave({ ...response, descripcion, acciones })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Respuesta Municipal</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="descripcion" className="text-right">
              Descripción
            </Label>
            <Textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="acciones" className="text-right">
              Acciones
            </Label>
            <Textarea
              id="acciones"
              value={acciones}
              onChange={(e) => setAcciones(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave}>
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EditMunicipalResponseModal

