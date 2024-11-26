import {useState } from 'react'
import { Button } from "@/components/ui/button"

import { ChevronLeft, ChevronRight,} from 'lucide-react'

const ImageGallery = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)
  }

  return (
    <div className="relative w-full  flex items-center justify-center">
      <img
        src={"https://res.cloudinary.com/de06451wd/"+images[currentIndex].imagen}
        alt={`Imagen ${currentIndex + 1} de ${title}`}
        className="max-w-full max-h-full object-contain"
      />
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-2 top-1/2 transform -translate-y-1/2"
        onClick={prevImage}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 transform -translate-y-1/2"
        onClick={nextImage}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-sm">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  )
}

export default ImageGallery