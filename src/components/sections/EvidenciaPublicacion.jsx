import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { FileIcon, ImageIcon } from 'lucide-react'

const EvidenciaPublicacion = ({ loading, publicacion, handleDownload }) => {
  return (
    <>
      <Card>
      <CardHeader>
        <CardTitle className="text-green-700">Evidencias de la publicación</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`p-1 ${publicacion?.evidencias?.length > 0 ? "grid grid-cols-1 md:grid-cols-2 gap-4" : ""}`}>
          {loading ? (
            // 3 skeleton cards
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
                  <img src={`https://res.cloudinary.com/de06451wd/${evidencia.archivo}`} alt={evidencia.nombre} className="w-full h-48 object-cover" />
                  <div className="flex justify-between items-center mt-2">
                    <p>{evidencia.nombre}</p>
                    <Button variant="outline" className="text-green-600" onClick={() => handleDownload(evidencia.id, evidencia.archivo)}>
                      <FileIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 w-full">
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
    </>
  )
}

export default EvidenciaPublicacion