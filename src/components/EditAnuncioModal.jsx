import {useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


const EditAnuncioModal = ({ anuncio, onSave, onClose, categorias }) => {
  const [editedAnuncio, setEditedAnuncio] = useState({
    id: anuncio?.id,
    usuario: 1,
    titulo: anuncio?.titulo,
    subtitulo: anuncio?.subtitulo,
    descripcion: anuncio?.descripcion,
    categoria: anuncio?.categoria.id,
    estado: anuncio?.estado
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setEditedAnuncio(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(editedAnuncio)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          value={editedAnuncio?.categoria?.toString()}
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
            <SelectItem value="Borrador">Borrador</SelectItem>
            <SelectItem value="Pendiente">Pendiente</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end space-x-2">
        <Button className="w-full" type="submit">Guardar cambios</Button>
      </div>
    </form>
  )
}

export default EditAnuncioModal