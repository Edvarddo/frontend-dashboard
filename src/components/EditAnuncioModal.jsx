import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, X, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const EditAnuncioModal = ({ anuncio, onSave, onClose, categorias, deleteImage, uploadNewImages }) => {
  const [editedAnuncio, setEditedAnuncio] = useState({
    id: anuncio?.id,
    usuario: 1,
    titulo: anuncio?.titulo,
    subtitulo: anuncio?.subtitulo,
    descripcion: anuncio?.descripcion,
    categoria: anuncio?.categoria?.id,
    estado: anuncio?.estado
  })
  const [existingImages, setExistingImages] = useState(anuncio?.imagenes || [])
  const [newFiles, setNewFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [imagesIdDelete, setImagesIdDelete] = useState([])
  const [newImages, setNewImages] = useState([])

  const handleChange = (e) => {
    const { name, value } = e.target
    setEditedAnuncio(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    addNewFiles(files)
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
    addNewFiles(files)
  }

  const addNewFiles = (files) => {
    const newFileObjects = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }))
    setNewImages(prev => [...prev, ...newFileObjects])
    setNewFiles(prev => [...prev, ...newFileObjects])
  }

  const removeExistingImage = (index) => {
    setImagesIdDelete(prev => [...prev, existingImages[index].id])
    setExistingImages(prev => {
      const updated = [...prev]
      updated.splice(index, 1)
      return updated
    })
  }

  const removeNewFile = (index) => {
    setNewImages(prev => {
      const updated = [...prev]
      updated.splice(index, 1)
      return updated
    })
    setNewFiles(prev => {
      const updated = [...prev]
      URL.revokeObjectURL(updated[index].preview)
      updated.splice(index, 1)
      return updated
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsUploading(true)
    console.log(anuncio)
    await uploadNewImages(newImages, anuncio.id)
    await onSave(editedAnuncio)
    if (imagesIdDelete.length > 0) {
      await deleteImage(imagesIdDelete)
    }
    setIsUploading(false)
  }

  useEffect(() => {
    return () => {
      newFiles.forEach(fileObj => {
        URL.revokeObjectURL(fileObj.preview)
      })
    }
  }, [existingImages, newFiles])

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Editar Anuncio</DialogTitle>
        </DialogHeader>
        
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="space-y-6 py-4">
            <div>
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                name="titulo"
                value={editedAnuncio.titulo}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="subtitulo">Subtítulo</Label>
              <Input
                id="subtitulo"
                name="subtitulo"
                value={editedAnuncio.subtitulo}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                name="descripcion"
                value={editedAnuncio.descripcion}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="categoria">Categoría</Label>
              <Select
                name="categoria"
                value={editedAnuncio.categoria?.toString()}
                onValueChange={(value) => setEditedAnuncio(prev => ({ ...prev, categoria: parseInt(value) }))}
              >
                <SelectTrigger>
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
            <div>
              <Label htmlFor="estado">Estado</Label>
              <Select
                name="estado"
                value={editedAnuncio.estado}
                onValueChange={(value) => handleChange({ target: { name: 'estado', value } })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Publicado">Publicado</SelectItem>
                  {/* <SelectItem value="Borrador">Borrador</SelectItem> */}
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Image upload section */}
            <div className="space-y-4">
              {existingImages.length > 0 && (
                <div className="space-y-2">
                  <Label>Imágenes existentes</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {existingImages.map((image, index) => (
                      <div key={image.id} className="relative">
                        <img
                          src={`https://res.cloudinary.com/de06451wd/${image.imagen}`}
                          alt={`Imagen ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => removeExistingImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label>Agregar nuevas imágenes</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                    isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Upload className="h-8 w-8 text-gray-400" />
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
              </div>

              {newFiles.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm text-gray-500 mb-2">
                    {newFiles.length} {newFiles.length === 1 ? 'nuevo archivo' : 'nuevos archivos'}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {newFiles.map((fileObj, index) => (
                      <div key={index} className="relative">
                        <img
                          src={fileObj.preview}
                          alt={`Nueva imagen ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => removeNewFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button 
            className="bg-emerald-600 hover:bg-emerald-700" 
            onClick={handleSubmit} 
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar cambios'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default EditAnuncioModal

