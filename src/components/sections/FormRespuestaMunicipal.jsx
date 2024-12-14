"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import useAxiosPrivate from '../../hooks/useAxiosPrivate'
import { DialogClose } from "@radix-ui/react-dialog"
import { AlertCircle, Info } from 'lucide-react'
import { toast } from "@/hooks/use-toast"

const stateOrder = ["Pendiente", "Recibido", "En curso", "Resuelto", "No Resuelto"];
const finalStates = ["Resuelto", "No Resuelto"];

export function MunicipalResponseForm({ onSubmit, previousStatus, situationMap, statusConfig, publicacion, setPublicacion, id }) {
  const [description, setDescription] = useState("")
  const [actions, setActions] = useState("")
  const [currentStatus, setCurrentStatus] = useState("")
  const [fecha, setFecha] = useState("")
  const axiosPrivate = useAxiosPrivate()

  useEffect(() => {
    if (previousStatus === "En curso") {
      setCurrentStatus("Resuelto")
    } else {
      const currentIndex = stateOrder.indexOf(previousStatus);
      if (currentIndex < stateOrder.length - 1 && !finalStates.includes(previousStatus)) {
        setCurrentStatus(stateOrder[currentIndex + 1]);
      }
    }
  }, [previousStatus]);

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

    console.log(new Date(), "yyyy-MM-dd")
    // transform the date to "2024-12-03T01:26:50.825Z"
    const date = new Date().toISOString()

    if (finalStates.includes(previousStatus)) {
      return; // No permitir envío si el estado es final
    }
    onSubmit({
      usuario: 1,
      situacion_inicial: previousStatus,
      situacion_posterior: currentStatus,
      fecha: date,
      descripcion: description,
      acciones: actions,
    })
    changeStatus()

    setDescription("")
    setActions("")
  }

  const getNextStatus = () => {
    if (previousStatus === "En curso") {
      return ["Resuelto", "No Resuelto"];
    }
    const currentIndex = stateOrder.indexOf(previousStatus);
    return currentIndex < stateOrder.length - 1 && !finalStates.includes(previousStatus) ? [stateOrder[currentIndex + 1]] : null;
  }

  const nextStatus = getNextStatus();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-green-700">Nueva Respuesta Municipal</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {finalStates.includes(previousStatus) ? (
          <div className="text-center">
            <p className="text-amber-600 font-semibold mb-4">
              El proceso ha finalizado. No se pueden crear más respuestas municipales.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Info className="w-4 h-4 mr-2" />
                  Ver más información
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    <AlertCircle className="w-5 h-5 inline-block mr-2 text-amber-500" />
                    Proceso Finalizado
                  </DialogTitle>
                  <DialogDescription>
                    El estado actual es {previousStatus}, lo cual indica que el proceso ha concluido. 
                    No se pueden crear más respuestas municipales cuando el proceso está en un estado final.
                  </DialogDescription>
                </DialogHeader>
                <DialogClose asChild>
                  <Button variant="outline">Cerrar</Button>
                </DialogClose>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current-status">Estado Actual</Label>
                <Input id="current-status" value={previousStatus} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-status">Estado Nuevo</Label>
                {nextStatus ? (
                  <Select 
                    value={currentStatus} 
                    onValueChange={setCurrentStatus}
                    disabled={previousStatus !== "En curso"}
                  >
                    <SelectTrigger id="new-status">
                      <SelectValue>{currentStatus}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {nextStatus.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input id="new-status" value="Estado final alcanzado" disabled />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input id="date" value={format(new Date(), "dd/MM/yyyy")} 
              onChange={(e) => setFecha(e.target.value)} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea 
                id="description"
                placeholder="Ingrese una descripción de la respuesta..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="actions">Acciones</Label>
              <Textarea 
                id="actions"
                placeholder="Ingrese las acciones tomadas..."
                value={actions}
                onChange={(e) => setActions(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full  bg-green-500 hover:bg-green-600 text-white "
              disabled={finalStates.includes(previousStatus)}
            >
              Guardar Respuesta
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

export default MunicipalResponseForm

