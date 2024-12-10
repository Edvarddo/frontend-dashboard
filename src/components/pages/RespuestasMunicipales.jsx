import React, { useEffect, useState } from 'react'
import TopBar from '../TopBar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Calendar, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import useAxiosPrivate from '@/hooks/useAxiosPrivate'
import { format } from 'date-fns'

const RespuestasMunicipales = ({ isOpened, setIsOpened }) => {
  const [municipalResponses, setMunicipalResponses] = useState([])
  const [selectedResponse, setSelectedResponse] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const axiosPrivate = useAxiosPrivate()

  const handleOpenSidebar = () => {
    setIsOpened(!isOpened)
  }

  const getMunicipalResponses = async () => {
    try {
      const response = await axiosPrivate.get('respuestas-municipales/')
      console.log(response.data)
      setMunicipalResponses(response.data)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    getMunicipalResponses()
  }, [])

  const handleRowClick = (row) => {
    setSelectedResponse(row)
    setIsSidebarOpen(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setSelectedResponse(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveChanges = async () => {
    try {
      await axiosPrivate.put(`respuestas-municipales/${selectedResponse.id}/`, selectedResponse)
      getMunicipalResponses() // Refresh the data
      setIsSidebarOpen(false)
    } catch (error) {
      console.error('Error saving changes:', error)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Respuestas Municipales" handleOpenSidebar={handleOpenSidebar} />
      
      <div className="flex flex-1 overflow-hidden">
        <div className={`flex-1 p-6 bg-gray-50 overflow-auto transition-all duration-300 ${isSidebarOpen ? 'mr-80' : ''}`}>
          <Card>
            <CardHeader className="pb-0">
              <CardTitle>Respuestas Municipales</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search and Filter Section */}
              <div className="flex items-center gap-4 mb-6 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Buscar por código"
                    className="pl-10 h-10"
                  />
                </div>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 h-10"
                >
                  <Calendar className="h-4 w-4" />
                  Seleccionar fecha
                </Button>
              </div>

              {/* Table Section */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="font-medium text-gray-600">Código publicación</TableHead>
                      <TableHead className="font-medium text-gray-600">Descripción</TableHead>
                      <TableHead className="font-medium text-gray-600">Acciones</TableHead>
                      <TableHead className="font-medium text-gray-600">Fecha</TableHead>
                      <TableHead className="font-medium text-gray-600">Estado Previo</TableHead>
                      <TableHead className="font-medium text-gray-600">Estado Actual</TableHead>
                      <TableHead className="font-medium text-gray-600 text-right">Ver publicación</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {municipalResponses.map((row) => (
                      <TableRow 
                        key={row.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleRowClick(row)}
                      >
                        <TableCell className="font-medium text-gray-900">{row.publicacion.codigo}</TableCell>
                        <TableCell className="text-gray-600">{row.descripcion}</TableCell>
                        <TableCell className="text-gray-600">{row.acciones}</TableCell>
                        <TableCell className="text-gray-600">{format(new Date(row.fecha), "dd-MM-yyyy")}</TableCell>
                        <TableCell className="text-gray-600">{row.situacion_inicial}</TableCell>
                        <TableCell className="text-gray-600">{row.situacion_posterior}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="link" 
                            className="text-blue-600 hover:text-blue-700"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRowClick(row)
                            }}
                          >
                            Ver
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div 
          className={`fixed right-0  h-full w-80 bg-white  transform transition-transform duration-300 ease-in-out overflow-y-auto ${
            isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{ top: '64px' }} // Adjust this value to match your TopBar height
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Editar Respuesta Municipal</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {selectedResponse && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="codigo" className="block text-sm font-medium text-gray-700">Código publicación</label>
                  <Input id="codigo" value={selectedResponse.publicacion.codigo} readOnly className="mt-1" />
                </div>
                <div>
                  <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">Descripción</label>
                  <Input 
                    id="descripcion" 
                    name="descripcion"
                    value={selectedResponse.descripcion} 
                    onChange={handleInputChange}
                    className="mt-1" 
                  />
                </div>
                <div>
                  <label htmlFor="acciones" className="block text-sm font-medium text-gray-700">Acciones</label>
                  <Input 
                    id="acciones" 
                    name="acciones"
                    value={selectedResponse.acciones} 
                    onChange={handleInputChange}
                    className="mt-1" 
                  />
                </div>
                <div>
                  <label htmlFor="fecha" className="block text-sm font-medium text-gray-700">Fecha</label>
                  <Input 
                    id="fecha" 
                    name="fecha"
                    type="date"
                    value={format(new Date(selectedResponse.fecha), "yyyy-MM-dd")} 
                    onChange={handleInputChange}
                    className="mt-1" 
                  />
                </div>
                <div>
                  <label htmlFor="situacion_inicial" className="block text-sm font-medium text-gray-700">Estado Previo</label>
                  <Input 
                    id="situacion_inicial" 
                    name="situacion_inicial"
                    value={selectedResponse.situacion_inicial} 
                    onChange={handleInputChange}
                    className="mt-1" 
                  />
                </div>
                <div>
                  <label htmlFor="situacion_posterior" className="block text-sm font-medium text-gray-700">Estado Actual</label>
                  <Input 
                    id="situacion_posterior" 
                    name="situacion_posterior"
                    value={selectedResponse.situacion_posterior} 
                    onChange={handleInputChange}
                    className="mt-1" 
                  />
                </div>
                <Button className="w-full mt-4" onClick={handleSaveChanges}>Guardar cambios</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RespuestasMunicipales

