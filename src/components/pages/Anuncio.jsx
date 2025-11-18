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
import { API_ROUTES } from '../../api/apiRoutes'

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
    axiosPrivate.get(`${API_ROUTES.ANUNCIOS.ROOT}?page=${page}`)
      .then((response) => {
        // console.log(response?.data)
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
    // console.log(editedAnuncio)
    axiosPrivate.patch(API_ROUTES.ANUNCIOS.DETAIL(editedAnuncio.id), editedAnuncio)
      .then(response => {
        // console.log(response)
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
    // console.log("Imagen a eliminar:", listIndex);
    listIndex.forEach(async (index) => {
      try {
        const res = await axiosPrivate.delete(`${API_ROUTES.IMAGENES_ANUNCIOS.ROOT}${index}/`)
        // console.log("Imagen eliminada:", res);
      } catch (error) {
        // console.error("Error deleting image:", error)
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
        const res = await axiosPrivate.post(API_ROUTES.IMAGENES_ANUNCIOS.ROOT, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          }
        });
        // console.log("Imagen subida:", res);
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

    axiosPrivate.delete(API_ROUTES.ANUNCIOS.DETAIL(anuncioId))
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
        // console.error("Error deleting anuncio:", error)
        toast({
          title: "Error",
          description: "Hubo un problema al eliminar el anuncio. Por favor, intente nuevamente.",
          variant: "destructive",
          duration: 5000,
        })
      })
  }
  const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/de06451wd/"

  const getImageUrl = (path) => {
    if (!path) return ""
    if (path.startsWith("http")) return path
    return `${CLOUDINARY_BASE_URL}${path.replace(/^\/+/, "")}`
  }
  return (
    <>
      <TopBar handleOpenSidebar={handleOpenSidebar} title="Listado de Anuncios" />

      <div className="p-8">
        {/* Botón crear anuncio */}
        <div className="flex justify-end items-center mb-6">
          <Button
            onClick={() => navigate('/anuncio-formulario')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" /> Crear anuncio
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[...Array(4)].map((_, index) => (
              <Skeleton key={index} className="w-full h-60" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {listadoAnuncios?.map((anuncio) => {
              const isExpanded = expandedId === anuncio.id
              const descripcionLarga = anuncio.descripcion || ""
              const descripcionCorta =
                descripcionLarga.length > 260
                  ? descripcionLarga.slice(0, 260) + "..."
                  : descripcionLarga

              const tieneImagenes = anuncio.imagenes && anuncio.imagenes.length > 0
              const esUnaImagen = anuncio.imagenes && anuncio.imagenes.length === 1
              const masDeUnaImagen = anuncio.imagenes && anuncio.imagenes.length > 1

              // Si quieres seguir usando URLs completas para <img>, puedes dejar esto,
              // pero NO lo usaremos para ImageGallery.
              const imagesWithUrl = (anuncio.imagenes || []).map((img) => ({
                ...img,
                imagen: getImageUrl(img.imagen),
              }))

              // 🔥 ESTE ES EL IMPORTANTE PARA IMAGEGALLERY
              // Deja solo el path, sin repetir el baseURL
              const imagesGallery = (anuncio.imagenes || []).map((img) => ({
                ...img,
                imagen: img.imagen.startsWith("http")
                  ? img.imagen.replace("https://res.cloudinary.com/de06451wd/", "")
                  : img.imagen,
              }))

              return (
                <Card
                  key={anuncio.id}
                  className="overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all"
                >
                  {/* BLOQUE DE IMAGEN */}
                  <div className="relative w-full h-64 bg-slate-100 overflow-hidden">
                    {tieneImagenes ? (
                      esUnaImagen ? (
                        <img
                          src={getImageUrl(anuncio.imagenes[0].imagen)}
                          alt={anuncio.titulo}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full">
                          <ImageCarousel
                            images={anuncio.imagenes}
                            title={anuncio.titulo}
                            className="h-full w-full"
                          />
                        </div>
                      )
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">
                        Sin imágenes
                      </div>
                    )}

                    {/* Badges sobre la imagen */}
                    <div className="absolute bottom-3 left-3 flex gap-2">
                      <Badge className={estadoColors[anuncio.estado]}>
                        {anuncio.estado}
                      </Badge>

                      <Badge
                        variant="outline"
                        className="bg-white/80 backdrop-blur flex items-center gap-1"
                      >
                        <Tag className="h-3 w-3" />
                        {anuncio.categoria?.nombre}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="p-6 pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-xl font-semibold">
                        {anuncio.titulo}
                      </CardTitle>

                      <span className="text-xs text-slate-500 flex items-center whitespace-nowrap ml-4">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(anuncio.fecha).toLocaleDateString("es-CL", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="px-6 pb-6 pt-2">
                    {/* Descripción */}
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {isExpanded ? descripcionLarga : descripcionCorta}
                    </p>

                    {descripcionLarga.length > 260 && (
                      <div className="mt-2 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-emerald-700 hover:text-emerald-800"
                          onClick={() => toggleExpand(anuncio.id)}
                        >
                          {isExpanded ? "Ver menos" : "Ver más"}
                          {isExpanded ? (
                            <ChevronUp className="ml-1 h-3 w-3" />
                          ) : (
                            <ChevronDown className="ml-1 h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Acciones de imágenes */}
                    {tieneImagenes && (
                      <div className="mt-3 flex gap-2 flex-wrap">
                        {/* Solo 1 imagen -> maximizar */}
                        {esUnaImagen && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                              >
                                <Eye className="h-4 w-4" />
                                Ver imagen ampliada
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl w-full p-2">
                              <ImageGallery
                                images={imagesGallery}  // 👈 AQUÍ EL CAMBIO
                                title={anuncio.titulo}
                              />
                            </DialogContent>
                          </Dialog>
                        )}

                        {/* Varias imágenes -> galería completa */}
                        {masDeUnaImagen && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                Ver todas las imágenes ({anuncio.imagenes.length})
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl w-full p-2">
                              <ImageGallery
                                images={imagesGallery}  // 👈 AQUÍ TAMBIÉN
                                title={anuncio.titulo}
                              />
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    )}

                    {/* Footer: responsable + acciones */}
                    <div className="mt-6 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Users className="h-3 w-3" />
                        <span>Municipalidad de Calama</span>
                      </div>

                      <div className="flex gap-2">
                        {/* Editar */}
                        <Dialog
                          open={!!editingAnuncio && editingAnuncio?.id === anuncio.id}
                          onOpenChange={(open) => {
                            if (!open) setEditingAnuncio(null)
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditClick(anuncio)}
                            >
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

                        {/* Eliminar */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                ¿Está seguro de eliminar este anuncio?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteAnuncio(anuncio.id)}
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Paginación */}
        <div className="mt-8 flex justify-center">
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="mr-2 bg-emerald-600 hover:bg-emerald-700"
          >
            <ChevronLeft className="h-4 w-4 mr-2" /> Anterior
          </Button>

          <span className="mx-2 self-center">
            Página {currentPage} de {totalPages}
          </span>

          <Button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="ml-2 bg-emerald-600 hover:bg-emerald-700"
          >
            Siguiente <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </>
  )
}

export default Anuncio

