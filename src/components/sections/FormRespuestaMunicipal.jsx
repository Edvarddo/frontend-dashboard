"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { format } from "date-fns"
import useAxiosPrivate from '../../hooks/useAxiosPrivate'

export function MunicipalResponseForm({ onSubmit, previousStatus, situationMap, statusConfig, publicacion, setPublicacion, id }) {
  const [description, setDescription] = useState("")
  const [actions, setActions] = useState("")
  const [responsiblePerson, setResponsiblePerson] = useState("")
  const [currentStatus, setCurrentStatus] = useState("")
  const axiosPrivate = useAxiosPrivate()

  const changeStatus = () => {
    const url = `publicaciones/${id}/`
    axiosPrivate.patch(url, { situacion: situationMap[currentStatus] })
    .then(response => {
      console.log(response)
      setPublicacion({ ...publicacion, situacion: { nombre: statusConfig[currentStatus].label } })
      console.log(response.data)
    })
    .catch(error => {
      console.log(error)
    })
  }
  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      usuario:1,
      situacion_inicial:previousStatus,
      situacion_posterior:currentStatus,
      fecha: format(new Date(), "yyyy-MM-dd"),
      descripcion:description,
      acciones:actions,
      
    })
    changeStatus()

    setDescription("")
    setActions("")
    setCurrentStatus("")
  }
  const handleNewStatus = (value) => {
    console.log(value)
    setCurrentStatus(value)
  }


  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-green-700">Nueva Respuesta Municipal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Estado Actual</Label>
              <Input value={previousStatus} disabled />
            </div>
            <div className="space-y-2">
              <Label>Estado Nuevo</Label>
              <Select onValueChange={handleNewStatus} value={currentStatus} required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="Recibido">Recibido</SelectItem>
                  <SelectItem value="En curso">En curso</SelectItem>
                  <SelectItem value="Resuelto">Resuelto</SelectItem>
                  <SelectItem value="No resuelto">No resuelto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Fecha</Label>
            <Input value={format(new Date(), "dd/MM/yyyy")} disabled />
          </div>
          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea 
              placeholder="Ingrese una descripción de la respuesta..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Acciones</Label>
            <Textarea 
              placeholder="Ingrese las acciones tomadas..."
              value={actions}
              onChange={(e) => setActions(e.target.value)}
              required
            />
          </div>
          {/* <div className="space-y-2">
            <Label>Responsable</Label>
            <Input 
              placeholder="Nombre del responsable"
              value={responsiblePerson}
              onChange={(e) => setResponsiblePerson(e.target.value)}
              required
            />
          </div> */}
          <Button type="submit" className="w-full">Guardar Respuesta</Button>
        </CardContent>
      </Card>
    </form>
  )
}

export default MunicipalResponseForm

