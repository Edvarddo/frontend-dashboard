// src/components/AnuncioFormulario.jsx
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
import { ArrowLeftIcon, Loader2 } from 'lucide-react'
import useAxiosPrivate from '../hooks/useAxiosPrivate'
import { useToast } from "../hooks/use-toast"
import { format, set } from 'date-fns'
import { es } from 'date-fns/locale'
import FileUpload from './FileUpload'; // Importa el nuevo componente
import useFileHandling from '../hooks/useFileHandling'; // Importa el nuevo hook
import { API_ROUTES } from "@/api/apiRoutes"

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
  const [isUploading, setIsUploading] = useState(false)

  const {
    files,
    isDragging,
    uploadProgress,
    setUploadProgress,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    removeFile,
  } = useFileHandling();


  const handleStateChange = (checked) => {
    setEstado(checked)

  }

  const handleOpenSidebar = () => {
    setIsOpened(!isOpened)
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const date = new Date().toISOString()
    const festado = estado ? 'Publicado' : 'Pendiente'
    setIsUploading(true);
    setUploadProgress({});

    try {
      const anuncioData = {
        usuario: 1,
        titulo: anuncio.titulo,
        subtitulo: anuncio.subtitulo,
        estado: festado,
        descripcion: anuncio.descripcion,
        categoria: anuncio.categoria,
        fecha: date,
        autor: anuncio.autor
      };

      const anuncioResponse = await axiosPrivate.post(
        API_ROUTES.ANUNCIOS.ROOT,
        anuncioData
      );

      const anuncioId = anuncioResponse?.data?.id;

      if (files.length > 0) {
        for (const image of files) {
          const formData = new FormData();
          formData.append("anuncio", anuncioId)
          formData.append("anuncio_id", anuncioId);
          formData.append("imagen", image?.file);
          formData.append("extension", image?.file?.name?.split(".")?.pop());
          formData.append('nombre', image?.file?.name);
          formData.append('peso', image?.file?.size);

          await axiosPrivate.post(API_ROUTES.IMAGENES_ANUNCIOS.ROOT, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (progressEvent) => {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
              setUploadProgress((prev) => ({ ...prev, [image.id]: progress }))
            },
          });
        }
      }

      toast({
        title: "Éxito",
        description: "El anuncio fue creado correctamente.",
        variant: "custom",
        className: "bg-green-500 text-white",
      });

      // 3. Finalizar y navegar
      navigate("/anuncios");
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al crear el anuncio o subir las imágenes.",
        variant: "destructive",
      });
      console.error(error);
      setIsUploading(false); // Solo para en error
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
    fetchURLS(API_ROUTES.CATEGORIAS.ROOT)
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
                    disabled
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

              <FileUpload
                files={files}
                isDragging={isDragging}
                handleFileChange={handleFileChange}
                handleDragOver={handleDragOver}
                handleDragLeave={handleDragLeave}
                handleDrop={handleDrop}
                removeFile={removeFile}
                isUploading={isUploading}
                setUploadProgress={setUploadProgress}
                uploadProgress={uploadProgress}
              />

              {isUploading && !files.length && ( // Mostrar solo si no hay archivos
                <div className="flex items-center justify-center space-x-2 mt-4">
                  <Loader2 className="h-5 w-5 animate-spin text-green-600" />
                  <span className="text-green-600">Guardando anuncio...</span>
                </div>
              )}
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