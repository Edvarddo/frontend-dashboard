import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Plus, ChevronDown, ChevronUp, Eye, Edit, Trash2, Calendar, Tag, MapPin, Users, Clock, ChevronLeft, ChevronRight, X, Upload } from 'lucide-react'
import Image from '../../assets/placeholder.svg'
import TopBar from "../TopBar"
import { useNavigate } from 'react-router-dom'
import useAxiosPrivate from '@/hooks/useAxiosPrivate'
import axios, { axiosPrivate } from '@/api/axios'
import { Skeleton } from '../ui/skeleton'
import ImageCarousel from '../ImageCarousel'
import ImageGallery from '../ImageGallery'
import { useToast } from "../../hooks/use-toast"
import EditAnuncioModal from '../EditAnuncioModal'
import { format, addHours, isAfter } from 'date-fns'
import { DialogClose } from '@radix-ui/react-dialog'

const estadoColors = {
  'Publicado': 'bg-green-100 text-green-800',
  'Pendiente': 'bg-blue-100 text-blue-800'
}

const Anuncio = ({ setIsOpened, isOpened }) => {
  const [expandedId, setExpandedId] = useState(null)
  const [listadoAnuncios, setListadoAnuncios] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [editingAnuncio, setEditingAnuncio] = useState(null)
  const [categorias, setCategorias] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { toast } = useToast()
  const axiosPrivate = useAxiosPrivate()
  const navigate = useNavigate()

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

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id)
  }

  const handleOpenSidebar = () => {
    setIsOpened(!isOpened)
  }

  const fetchAnuncios = (page = 1) => {
    setIsLoading(true)
    axiosPrivate.get(`anuncios-municipales/?page=${page}`)
      .then((response) => {
        console.log(response?.data)
        setListadoAnuncios(response?.data?.results)
        setTotalPages(Math.ceil(response?.data?.count / 5)) // Assuming 5 items per page
        setIsLoading(false)
      })
      .catch((error) => {
        console.error(error)
        setIsLoading(false)
      })
  }

  useEffect(() => {
    fetchAnuncios(currentPage)
  }, [currentPage])

  const handleEditClick = (anuncio) => {
    setEditingAnuncio(anuncio)
  }

  const handleSaveEdit = (editedAnuncio) => {
    console.log(editedAnuncio)
    axiosPrivate.patch(`anuncios-municipales/${editedAnuncio.id}/`, editedAnuncio)
      .then(response => {
        console.log(response)
        toast({
          title: "Anuncio actualizado",
          description: "El anuncio ha sido actualizado exitosamente.",
          duration: 5000,
          className: "bg-green-500 text-white",
        })
        fetchAnuncios(currentPage)
        setEditingAnuncio(null)
      })
      .catch(error => {
        console.error("Error updating anuncio:", error)
        toast({
          title: "Error",
          description: "Hubo un problema al actualizar el anuncio. Por favor, intente nuevamente.",
          variant: "destructive",
          duration: 5000,
        })
      })
  }

  const deleteImage = async (listIndex) => {
    console.log("Imagen a eliminar:", listIndex);
    listIndex.forEach(async (index) => {
      try {
        const res = await axiosPrivate.delete(`imagenes-anuncios/${index}/`)
        console.log("Imagen eliminada:", res);
      } catch (error) {
        console.error("Error deleting image:", error)
      }
    })
  }

  const uploadNewImages = async (images, anuncioId) => {
    for (const image of images) {
      const formData = new FormData()
      formData.append("anuncio", anuncioId)
      formData.append("anuncio_id", anuncioId);
      formData.append("imagen", image?.file);
      formData.append("extension", image?.file?.name?.split(".")?.pop());
      try {
        const res = await axiosPrivate.post("/imagenes-anuncios/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          }
        });
        console.log("Imagen subida:", res);
      } catch (error) {
        console.error("Error uploading image:", error)
      }
    }
  }

  const handleDeleteAnuncio = (anuncioId) => {
    // const anuncio = listadoAnuncios.find(a => a.id === anuncioId);
    // const publicationDate = new Date(anuncio.fecha);
    // const deletionDeadline = addHours(publicationDate, 1);
    // const now = new Date();
    // console.log("Fecha de publicación:", publicationDate);
    // console.log("Fecha de eliminación:", deletionDeadline);
    // console.log("Fecha actual:", now);

    // console.log(isAfter(now, deletionDeadline ));
    // console.log(isAfter(publicationDate, deletionDeadline ));
    

    // return;
    // if (isAfter(now, deletionDeadline)) {
    //   toast({
    //     title: "No se puede eliminar",
    //     description: "El tiempo de eliminación ha expirado. No se puede eliminar anuncios después de 1 hora de su publicación.",
    //     duration: 5000,
    //     className: "bg-red-500 text-white",
    //   });
    //   return;
    // }

    axiosPrivate.delete(`anuncios-municipales/${anuncioId}/`)
      .then(() => {
        toast({
          title: "Anuncio eliminado",
          description: "El anuncio ha sido eliminado exitosamente.",
          duration: 5000,
          className: "bg-green-500 text-white",
        })
        setListadoAnuncios(prevAnuncios => prevAnuncios.filter(a => a.id !== anuncioId))
        if (listadoAnuncios.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1)
        } else {
          fetchAnuncios(currentPage)
        }
      })
      .catch(error => {
        console.error("Error deleting anuncio:", error)
        toast({
          title: "Error",
          description: "Hubo un problema al eliminar el anuncio. Por favor, intente nuevamente.",
          variant: "destructive",
          duration: 5000,
        })
      })
  }

  return (
    <>
      <TopBar handleOpenSidebar={handleOpenSidebar} title="Anuncios" />
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Listado de Anuncios</h1>
          <Button
            onClick={() => navigate('/anuncio-formulario')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="mr-2 h-4 w-4" /> Crear anuncio
          </Button>
        </div>
        <div className="space-y-4">
          {isLoading ? (
            [...Array(5)].map((_, index) => (
              <Skeleton key={index} className="w-full h-24" />
            ))
          ) : (
            listadoAnuncios?.map((anuncio) => (
              <Collapsible
                key={anuncio.id}
                open={expandedId === anuncio.id}
              >
                <Card>
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between w-full">
                      <CardTitle className="text-lg">{anuncio.titulo}</CardTitle>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0"
                          onClick={() => toggleExpand(anuncio.id)}
                        >
                          {expandedId === anuncio.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className={estadoColors[anuncio.estado]}>{anuncio.estado}</Badge>
                      <span className="text-sm text-gray-500 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" /> {
                          new Date(anuncio.fecha).toLocaleDateString('es-CL', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        }
                      </span>
                      <span className="text-sm text-gray-500 flex items-center">
                        <Tag className="h-4 w-4 mr-1" /> {anuncio.categoria.nombre}
                      </span>
                    </div>
                  </CardHeader>
                  <CollapsibleContent>
                    {anuncio.imagenes && anuncio.imagenes.length > 0 && (
                      <div className="px-4 pb-4 ">
                        <div className=' flex justify-center'>
                          <ImageCarousel images={anuncio.imagenes} title={anuncio.titulo} />
                        </div>
                        {anuncio.imagenes.length > 1 && (
                          <Dialog>
                            <DialogTrigger asChild className=''>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2 "
                              >
                                Ver todas las imágenes ({anuncio.imagenes.length})
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl w-full p-2  ">
                              <ImageGallery images={anuncio.imagenes} title={anuncio.titulo} />
                            </DialogContent>
                            
                          </Dialog>
                        )}
                      </div>
                    )}
                    <CardContent className="p-4 pt-0">
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">Descripción</h4>
                        <p className="text-sm text-gray-700">
                          {anuncio.descripcion.length > 200
                            ? anuncio.descripcion.substring(0, 200) + '...'
                            : anuncio.descripcion}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-semibold mb-1">Responsable</h4>
                          <p className="text-sm text-gray-700 flex items-center">
                            <Users className="h-4 w-4 mr-1" /> {"Municipalidad de calama"}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Dialog open={!!editingAnuncio} onOpenChange={() => setEditingAnuncio(anuncio)}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => handleEditClick(anuncio)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <EditAnuncioModal
                              anuncio={editingAnuncio}
                              onSave={handleSaveEdit}
                              onClose={() => setEditingAnuncio(null)}
                              categorias={categorias}
                              deleteImage={deleteImage}
                              uploadNewImages={uploadNewImages}
                            />
                          </DialogContent>
                        </Dialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Está seguro de eliminar este anuncio?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Esto eliminará permanentemente el anuncio
                                y removerá los datos de nuestros servidores.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteAnuncio(anuncio.id)}>
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))
          )}
        </div>
        <div className="mt-4 flex justify-center">
          <Button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="mr-2 bg-emerald-600 hover:bg-emerald-700"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>
          <span className="mx-2 self-center">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="ml-2 bg-emerald-600 hover:bg-emerald-700"
          >
            Siguiente
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </>
  )
}

export default Anuncio

