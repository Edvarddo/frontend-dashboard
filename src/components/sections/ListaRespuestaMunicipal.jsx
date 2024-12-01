import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export function ListaRespuestaMunicipal({ responses }) {
  console.log(responses)

  return (
    <div className="space-y-4">
      {responses.map((response) => (
        <Card key={response.id} className="w-full">
          <CardContent className="p-4">
            <div className="flex flex-col space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <Badge variant="outline">{response.situacion_inicial}</Badge>
                  <span>→</span>
                  <Badge variant="outline">{response.situacion_posterior}</Badge>
                </div>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(response.fecha), "dd/MM/yyyy HH:mm")}
                </span>
              </div>
              <div className="text-sm font-medium">
                Administrador: {response.usuario.nombre}
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-1">Descripción:</h4>
                <p className="text-sm">{response.descripcion}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-1">Acciones:</h4>
                <p className="text-sm">{response.acciones}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default ListaRespuestaMunicipal