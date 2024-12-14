import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { FileIcon, ImageIcon, ZoomInIcon, DownloadIcon, CalendarIcon, FileTypeIcon, HashIcon, ArchiveIcon } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import JSZip from 'jszip'

const EvidenciaPublicacion = ({ loading, publicacion }) => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const { toast } = useToast()

  const openImageViewer = (evidencia) => {
    setSelectedImage(evidencia)
    setIsDialogOpen(true)
  }

  const handleDownload = async (id, archivo) => {
    try {
      const response = await fetch(`https://res.cloudinary.com/de06451wd/${archivo}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `evidencia_${id}.${archivo.split('.').pop()}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Descarga exitosa",
        description: "La imagen se ha descargado correctamente.",
        duration: 3000,
        className: "bg-green-500 text-white",
      })
    } catch (error) {
      console.error('Error downloading image:', error)
      toast({
        title: "Error en la descarga",
        description: "No se pudo descargar la imagen. Por favor, intente nuevamente.",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  const handleDownloadAll = async () => {
    if (!publicacion?.evidencias?.length) return

    setIsDownloading(true)
    const zip = new JSZip()

    try {
      for (const evidencia of publicacion.evidencias) {
        const response = await fetch(`https://res.cloudinary.com/de06451wd/${evidencia.archivo}`)
        const blob = await response.blob()
        zip.file(`evidencia_${evidencia.id}.${evidencia.extension}`, blob)
      }

      const content = await zip.generateAsync({ type: "blob" })
      const url = window.URL.createObjectURL(content)
      const link = document.createElement('a')
      link.href = url
      link.download = `evidencias_publicacion_${publicacion.id}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Descarga exitosa",
        description: "Todas las evidencias se han descargado correctamente.",
        duration: 3000,
        className: "bg-green-500 text-white",
      })
    } catch (error) {
      console.error('Error downloading all images:', error)
      toast({
        title: "Error en la descarga",
        description: "No se pudieron descargar todas las imágenes. Por favor, intente nuevamente.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-green-700">Evidencias de la publicación</CardTitle>
          <Button
            variant="outline"
            className="text-green-600"
            onClick={handleDownloadAll}
            disabled={loading || isDownloading || !publicacion?.evidencias?.length}
          >
            <ArchiveIcon className="w-4 h-4 mr-2" />
            {isDownloading ? "Descargando..." : "Descargar todas"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className={`p-1 ${publicacion?.evidencias?.length > 0 ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : ""}`}>
            {loading ? (
              [1, 2, 3].map((item) => (
                <Card key={item} className="w-full">
                  <CardContent className="p-4">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-4 w-full mt-2" />
                  </CardContent>
                </Card>
              ))
            ) : publicacion?.evidencias?.length > 0 ? (
              publicacion.evidencias.map((evidencia) => (
                <Card key={evidencia.id} className="w-full">
                  <CardContent className="p-4">
                    <div className="relative group">
                      <img 
                        src={`https://res.cloudinary.com/de06451wd/${evidencia.archivo}`} 
                        alt={`Evidencia ${evidencia.id}`}
                        className="w-full h-48 object-cover rounded-md cursor-pointer"
                        onClick={() => openImageViewer(evidencia)}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="secondary" 
                          size="icon"
                          onClick={() => openImageViewer(evidencia)}
                          className="mr-2"
                        >
                          <ZoomInIcon className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="icon"
                          onClick={() => handleDownload(evidencia.id, evidencia.archivo)}
                        >
                          <DownloadIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm truncate">Evidencia {evidencia.id}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 w-full col-span-full">
                <div className="bg-gray-100 p-4 rounded-full mb-4">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No hay evidencias disponibles</h3>
                <p className="text-sm text-gray-500">No se encontraron imágenes para esta publicación</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl p-0 gap-0">
          <div className="flex h-[80vh]">
            {/* Image Panel */}
            <div className="flex-1 bg-black flex items-center justify-center p-4">
              {selectedImage && (
                <img
                  src={`https://res.cloudinary.com/de06451wd/${selectedImage.archivo}`}
                  alt={`Evidencia ${selectedImage.id}`}
                  className="max-h-full max-w-full object-contain"
                />
              )}
            </div>

            {/* Details Panel */}
            <div className="w-80 border-l bg-white p-6 overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Detalles de la imagen</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-2">
                      <HashIcon className="w-4 h-4 mt-1 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">ID</p>
                        <p className="text-sm text-gray-600">{selectedImage?.id}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <CalendarIcon className="w-4 h-4 mt-1 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Fecha de carga</p>
                        <p className="text-sm text-gray-600">
                          {selectedImage && format(new Date(selectedImage.fecha), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <FileTypeIcon className="w-4 h-4 mt-1 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Tipo de archivo</p>
                        <p className="text-sm text-gray-600">{selectedImage?.extension.toUpperCase()}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <FileIcon className="w-4 h-4 mt-1 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Ruta del archivo</p>
                        <p className="text-sm text-gray-600 break-all">{selectedImage?.archivo}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    
                    className="w-full  bg-green-500 hover:bg-green-600 text-white "
                    onClick={() => selectedImage && handleDownload(selectedImage.id, selectedImage.archivo)}
                  >
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    Descargar imagen
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default EvidenciaPublicacion

