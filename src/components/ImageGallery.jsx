import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from 'lucide-react'

const ImageGallery = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)
  const [imagesLoaded, setImagesLoaded] = useState([])

  useEffect(() => {
    // Preload all images and find the tallest one
    const imageObjects = images.map((image) => {
      const img = new Image()
      img.src = `https://res.cloudinary.com/de06451wd/${image.imagen}`
      return img
    })

    Promise.all(
      imageObjects.map(
        (image) =>
          new Promise((resolve) => {
            if (image.complete) {
              resolve({ width: image.naturalWidth, height: image.naturalHeight })
            } else {
              image.onload = () => {
                resolve({ width: image.naturalWidth, height: image.naturalHeight })
              }
            }
          })
      )
    ).then((dimensions) => {
      setImagesLoaded(dimensions)
      // Find the optimal container height based on aspect ratios
      const maxHeight = Math.min(
        window.innerHeight * 0.8,
        Math.max(...dimensions.map((d) => (d.height / d.width) * Math.min(window.innerWidth * 0.8, 1200)))
      )
      setContainerHeight(maxHeight)
    })
  }, [images])

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)
  }

  if (!containerHeight) {
    return (
      <div className="w-full h-96 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Cargando imágenes...</p>
      </div>
    )
  }

  return (
    <div 
      className="relative w-full bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden"
      style={{ height: `${containerHeight}px` }}
    >
      <div className="relative w-full h-full">
        {images.map((image, index) => (
          <img
            key={image.imagen}
            src={`https://res.cloudinary.com/de06451wd/${image.imagen}`}
            alt={`Imagen ${index + 1} de ${title}`}
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ease-in-out z-0 ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          />
        ))}
      </div>
      
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white z-20"
            onClick={prevImage}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white z-20"
            onClick={nextImage}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded-full text-sm z-20">
            {currentIndex + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  )
}

export default ImageGallery

