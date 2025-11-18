import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/de06451wd/"

const getCloudinaryPath = (value) => {
  if (!value) return ""
  // si viene URL completa, dejamos solo el path
  if (value.startsWith("http")) {
    return value.split(CLOUDINARY_BASE_URL)[1] || ""
  }
  return value
}

const ImageCarousel = ({ images = [], title = "", className = "" }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!images.length) return null

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)
  }

  const currentSrc =
    CLOUDINARY_BASE_URL + getCloudinaryPath(images[currentIndex].imagen)

  return (
    <div className={`relative w-full h-full ${className}`}>
      <img
        src={currentSrc}
        alt={`Imagen ${currentIndex + 1} de ${title}`}
        className="w-full h-full object-cover rounded-lg"
      />

      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white"
            onClick={prevImage}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white"
            onClick={nextImage}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white px-2 py-1 rounded-full text-xs">
            {currentIndex + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  )
}

export default ImageCarousel
