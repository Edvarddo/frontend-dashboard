import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from './TopBar'
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeftIcon } from 'lucide-react'
import useAxiosPrivate from '../hooks/useAxiosPrivate'
import { parse } from 'date-fns'
import { useToast } from "../hooks/use-toast"

const AnuncioFormulario = ({ setIsOpened, isOpened }) => {
  const axiosPrivate = useAxiosPrivate()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [categorias, setCategorias] = useState([])
  const [estado, setEstado] = useState(false)
  const [anuncio, setAnuncio] = useState({
    usuario: 1,
    titulo: '',
    subtitulo: '',
    descripcion: '',
    estado: '' ,
    categoria: '',
  })

  const handleStateChange = (checked) => {
    setEstado(checked)
    let festado = checked ? 'Publicado' : 'Pendiente'
    console.log(festado)
    setAnuncio({...anuncio, estado: festado})
  }

  const handleOpenSidebar = () => {
    setIsOpened(!isOpened)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log(anuncio)
    console.log("Formulario enviado")
    
    axiosPrivate.post('anuncios-municipales/', anuncio)
      .then(response => {
        console.log(response)
        toast({
          title: "Anuncio creado",
          description: "El anuncio ha sido creado exitosamente.",
          duration: 5000,
          className: "bg-green-500 text-white",
        })
        navigate("/anuncios", { state: { from: "anuncio-formulario" } })
      })
      .catch(error => {
        console.error("Error creating anuncio:", error)
        toast({
          title: "Error",
          description: "Hubo un problema al crear el anuncio. Por favor, intente nuevamente.",
          variant: "destructive",
          duration: 5000,
        })
      })
  }

  const extractCategoriesValues = (categories) => {
    return categories.map((category) => ({
      nombre: category.nombre,
      value: category.id
    }))
  }

  const fetchURLS = async (urls) => {
    try {
      const response = await axiosPrivate.get(urls)
      const categories = extractCategoriesValues(response.data)
      setCategorias(categories)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  useEffect(() => {
    fetchURLS('categorias/')
  }, [])

  return (
    <>
      <TopBar handleOpenSidebar={handleOpenSidebar} title="Crear anuncio" />
      <main className="p-6">
        <Card>
          <CardContent className="p-6">
            <Button 
              onClick={() => navigate("/anuncios", { state: { from: "anuncio-formulario" } })} 
              variant="outline" 
              className="mb-4 bg-white text-green-600 border-green-600 hover:bg-green-50 w-full lg:w-auto"
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              <span>Volver al listado</span>
            </Button>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título*</Label>
                  <Input
                    id="titulo"
                    required
                    placeholder="Ingrese el título"
                    value={anuncio.titulo}
                    onChange={(e) => setAnuncio({...anuncio, titulo: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subtitulo">Subtítulo</Label>
                  <Input
                    id="subtitulo"
                    placeholder="Ingrese el subtítulo"
                    value={anuncio.subtitulo}
                    onChange={(e) => setAnuncio({...anuncio, subtitulo: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría*</Label>
                  <Select
                    onValueChange={(value) => setAnuncio({...anuncio, categoria: parseInt(value)})}
                    required
                  >
                    <SelectTrigger id="categoria">
                      <SelectValue placeholder="Todas las categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((categoria) => (
                        <SelectItem
                          key={categoria.value}
                          value={categoria.value.toString()}
                        >
                          {categoria.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="estado" 
                      checked={estado}
                      onCheckedChange={(checked) => handleStateChange(checked)}
                    />
                    <Label htmlFor="estado" className="text-sm font-normal">
                      {estado ? 'Publicado' : 'Pendiente'}
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción*</Label>
                <Textarea
                  id="descripcion"
                  required
                  className="min-h-[150px]"
                  placeholder="Ingrese la descripción"
                  value={anuncio.descripcion}
                  onChange={(e) => setAnuncio({...anuncio, descripcion: e.target.value})}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  
                 type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                  Publicar anuncio
                </Button>
               
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  )
}

export default AnuncioFormulario

