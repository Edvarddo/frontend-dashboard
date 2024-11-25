import React from 'react'
import TopBar from '../TopBar'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Menu } from 'lucide-react'
const Anuncio = ({ isOpened, setIsOpened }) => {
  return (
    <>
      <TopBar title="Anuncio" handleOpenSidebar={() => setIsOpened(!isOpened)} />
      <main className="p-6">
          <Card>
            <CardContent className="p-6">
              <form className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título*</Label>
                    <Input id="titulo" required placeholder="Ingrese el título" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoría*</Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas las categorías" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Categoría 1</SelectItem>
                        <SelectItem value="2">Categoría 2</SelectItem>
                        <SelectItem value="3">Categoría 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción*</Label>
                  <Textarea
                    id="descripcion"
                    required
                    className="min-h-[150px]"
                    placeholder="Ingrese la descripción"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fecha">Fecha de publicación*</Label>
                    <Input
                      id="fecha"
                      type="date"
                      required
                      defaultValue="2024-10-31"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="autor">Autor*</Label>
                    <Input
                      id="autor"
                      required
                      placeholder="Ej: Municipalidad de Calama"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imagenes">Adjuntar imágenes</Label>
                  <Input id="imagenes" type="file" multiple accept="image/*" />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                    Publicar anuncio
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
    </>
  )
}

export default Anuncio