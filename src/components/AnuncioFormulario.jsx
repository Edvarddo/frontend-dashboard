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
import { ArrowLeftIcon, Upload, X, Loader2 } from 'lucide-react'
import useAxiosPrivate from '../hooks/useAxiosPrivate'
import { useToast } from "../hooks/use-toast"
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

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
    estado: '',
    categoria: '',
    fecha_publicacion: format(new Date(), 'yyyy-MM-dd'),
    autor: 'Municipalidad de Calama'
  })
  const [selectedFiles, setSelectedFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleStateChange = (checked) => {
    setEstado(checked)
    let festado = checked ? 'Publicado' : 'Pendiente'
    setAnuncio({ ...anuncio, estado: festado })
  }

  const handleOpenSidebar = () => {
    setIsOpened(!isOpened)
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    addFiles(files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    addFiles(files)
  }

  const addFiles = (files) => {
    const newFiles = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }))
    setSelectedFiles(prevFiles => [...prevFiles, ...newFiles])
  }

  const removeFile = (index) => {
    setSelectedFiles(prevFiles => {
      const updatedFiles = [...prevFiles]
      URL.revokeObjectURL(updatedFiles[index].preview)
      updatedFiles.splice(index, 1)
      return updatedFiles
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const anuncioData = {
        usuario: 1,
        titulo: anuncio.titulo,
        subtitulo: anuncio.subtitulo,
        estado: anuncio.estado,
        descripcion: anuncio.descripcion,
        categoria: anuncio.categoria,
        fecha: anuncio.fecha_publicacion,
        autor: anuncio.autor
      };
      console.log(selectedFiles)

      const anuncioResponse = await axiosPrivate.post(
        "anuncios-municipales/",
        anuncioData
      );

      if (selectedFiles.length !== 0) {
        setIsUploading(true);
        const anuncioId = anuncioResponse?.data?.id;
        console.log(selectedFiles)

        for (const image of selectedFiles) {
          const formData = new FormData();
          formData.append("anuncio", anuncioId)
          formData.append("anuncio_id", anuncioId);
          formData.append("imagen", image?.file);
          formData.append("extension", image?.file?.name?.split(".")?.pop());

          await axiosPrivate.post("/imagenes-anuncios/", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            }
          });
          toast({
            title: "Éxito",
            description: "El anuncio y las imágenes fueron creados correctamente.",
            variant: "custom",
            className: "bg-green-500 text-white",
          });
        }
      }

      toast({
        title: "Éxito",
        description: "El anuncio fue creado correctamente.",
        variant: "custom",
        className: "bg-green-500 text-white",
      });

      navigate("/anuncios");
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al crear el anuncio o subir las imágenes.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

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

  useEffect(() => {
    return () => {
      selectedFiles.forEach(fileObj => {
        URL.revokeObjectURL(fileObj.preview)
      })
    }
  }, [selectedFiles])

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
                    onChange={(e) => setAnuncio({ ...anuncio, titulo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subtitulo">Subtítulo</Label>
                  <Input
                    id="subtitulo"
                    placeholder="Ingrese el subtítulo"
                    value={anuncio.subtitulo}
                    onChange={(e) => setAnuncio({ ...anuncio, subtitulo: e.target.value })}
                  />
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
                  onChange={(e) => setAnuncio({ ...anuncio, descripcion: e.target.value })}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría*</Label>
                  <Select
                    onValueChange={(value) => setAnuncio({ ...anuncio, categoria: parseInt(value) })}
                    required
                  >
                    <SelectTrigger id="categoria">
                      <SelectValue placeholder="Seleccione una categoría" />
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
                  <Label htmlFor="fecha_publicacion">Fecha de publicación*</Label>
                  <Input
                    id="fecha_publicacion"
                    type="date"
                    required
                    value={anuncio.fecha_publicacion}
                    onChange={(e) => setAnuncio({ ...anuncio, fecha_publicacion: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="autor">Autor*</Label>
                <Input
                  id="autor"
                  required
                  placeholder="Ej: Municipalidad de Calama"
                  value={anuncio.autor}
                  onChange={(e) => setAnuncio({ ...anuncio, autor: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="estado"
                  checked={estado}
                  onCheckedChange={handleStateChange}
                />
                <Label htmlFor="estado">Publicar inmediatamente</Label>
              </div>

              <div className="space-y-2">
                <Label>Adjuntar imágenes</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 transition-colors ${isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300'
                    }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Upload className="h-8 w-4 text-gray-400" />
                    <div className="text-center">
                      <Label
                        htmlFor="imagenes"
                        className="text-green-600 hover:text-green-700 cursor-pointer"
                      >
                        Seleccione archivos
                      </Label>
                      <span className="text-gray-500"> o arrastre y suelte aquí</span>
                    </div>
                    <Input
                      id="imagenes"
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/jpeg, image/png, image/gif"
                    />
                  </div>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm text-gray-500 mb-2">
                      {selectedFiles.length} {selectedFiles.length === 1 ? 'archivo seleccionado' : 'archivos seleccionados'}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {selectedFiles.map((fileObj, index) => (
                        <div key={index} className="relative">
                          <img
                            src={fileObj.preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isUploading && (
                  <div className="flex items-center justify-center space-x-2 mt-4">
                    <Loader2 className="h-5 w-5 animate-spin text-green-600" />
                    <span className="text-green-600">Subiendo imágenes...</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  disabled={isUploading}
                >
                  {isUploading ? 'Publicando...' : 'Publicar anuncio'}
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

