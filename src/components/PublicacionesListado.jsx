import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import { useState } from 'react'
import TablaPublicaciones from './TablaPublicaciones'

export default function PublicacionesListado({
  isOpened,
  setIsOpened
}) {
  const [currentPage, setCurrentPage] = useState(1)




  const publicacionesPorPagina = 3
  
  const handleOpenSidebar = () => {
    setIsOpened(!isOpened)
  }

  return (
    <div className="content">

      <div className="bg-[#00a86a28] min-h-screen">
        <header className="burger-btn p-4 flex items-center">
          <button 
            onClick={handleOpenSidebar}
          className="text-black mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-black text-2xl font-bold">Listado de publicaciones</h1>
        </header>

        <main className="bg-white m-4 p-6 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <h2 className="mb-2 font-semibold">Categoría</h2>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las categorías</SelectItem>
                  <SelectItem value="basura">Basura</SelectItem>
                  <SelectItem value="seguridad">Seguridad</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <h2 className="mb-2 font-semibold">Estado de la publicación</h2>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="en_curso">En curso</SelectItem>
                  <SelectItem value="resuelto">Resuelto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <h2 className="mb-2 font-semibold">Junta vecinal</h2>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las juntas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las juntas</SelectItem>
                  <SelectItem value="exotica">EXOTICA</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h2 className="mb-2 font-semibold">Fecha inicial</h2>
              <div className="flex">
                <input type="text" className="border rounded-l px-2 py-1 w-full" placeholder="Ej: 01-10-2024" />
                <Button variant="outline" className="rounded-l-none"><Calendar className="h-4 w-4" /></Button>
              </div>
            </div>
            <div>
              <h2 className="mb-2 font-semibold">Fecha fin</h2>
              <div className="flex">
                <input type="text" className="border rounded-l px-2 py-1 w-full" placeholder="Ej: 31-10-2024" />
                <Button variant="outline" className="rounded-l-none"><Calendar className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mb-6">
            <Button variant="outline">Limpiar filtros</Button>
            <Button className="bg-green-500 hover:bg-green-600 text-white">Aplicar filtros</Button>
          </div>

          <TablaPublicaciones
            currentPage={currentPage}
            publicacionesPorPagina={publicacionesPorPagina}
            setCurrentPage={setCurrentPage}
          />


        </main>
      </div>
    </div>
  )
}