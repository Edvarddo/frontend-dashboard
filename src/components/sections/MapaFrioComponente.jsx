

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix para los iconos de Leaflet en Next.js
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

const MapaFrioComponente = ({ data, isModal = false }) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const heatLayerRef = useRef(null)
  const markersRef = useRef([])

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Inicializar el mapa
    mapInstanceRef.current = L.map(mapRef.current).setView([-22.459831, -68.933872], 15)

    // Agregar capa de OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapInstanceRef.current)

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current || !data || data.length === 0) return

    // Limpiar marcadores y capas anteriores
    markersRef.current.forEach((marker) => {
      mapInstanceRef.current.removeLayer(marker)
    })
    markersRef.current = []

    if (heatLayerRef.current) {
      mapInstanceRef.current.removeLayer(heatLayerRef.current)
    }

    // Crear puntos para el mapa de frío (colores fríos)
    const points = data.map((item) => [
      item.Junta_Vecinal.latitud,
      item.Junta_Vecinal.longitud,
      item.Junta_Vecinal.intensidad_frio, // Intensidad de frío (más alto = más azul)
    ])

    // Crear capa de calor con gradiente frío
    if (window.L && window.L.heatLayer) {
      heatLayerRef.current = L.heatLayer(points, {
        radius: 60, // 🔼 Aumentado para cubrir más área
        blur: 25,   // 🔼 Más suave y amplio
        maxZoom: 17,
        // Gradiente de colores fríos (azul a cyan)
        gradient: {
          // 0.0: "rgba(0, 0, 180, 0.4)",       // azul oscuro visible
          0.2: "rgba(0, 60, 220, 0.6)",      // azul eléctrico
          0.4: "rgba(0, 120, 255, 0.75)",    // azul saturado
          0.6: "rgba(0, 200, 255, 0.9)",     // cyan puro
          0.8: "rgba(180, 240, 255, 0.95)",  // celeste muy claro
          1.0: "rgba(255, 255, 255, 1.0)",   // blanco hielo para máximo
        },
      }).addTo(mapInstanceRef.current)
    }

    // Agregar marcadores invisibles para tooltips
    data.forEach((item, index) => {
      const marker = L.marker([item.Junta_Vecinal.latitud, item.Junta_Vecinal.longitud], {
        opacity: 0,
      }).addTo(mapInstanceRef.current)

      const tooltipContent = `
        <div class="p-3 bg-white shadow-lg min-w-[250px] rounded-lg border-2 border-blue-200">
          <h3 class="font-bold mb-2 text-blue-800 text-lg">${item.Junta_Vecinal.nombre}</h3>
          <div class="space-y-1 text-sm">
            <p class="text-blue-700"><strong>✅ Total resueltas:</strong> ${item.Junta_Vecinal.total_resueltas}</p>
            <p class="text-cyan-700"><strong>📊 Eficiencia:</strong> ${item.Junta_Vecinal.eficiencia}%</p>
            <p class="text-indigo-700"><strong>⏱️ Tiempo promedio:</strong> ${item.tiempo_promedio_resolucion}</p>
            <hr class="border-blue-200 my-2">
            <p class="text-blue-600"><strong>🏥 Asistencia Social:</strong> ${item["Asistencia Social"]}</p>
            <p class="text-cyan-600"><strong>🛣️ Mantención de Calles:</strong> ${item["Mantención de Calles"]}</p>
            <p class="text-indigo-600"><strong>🛡️ Seguridad:</strong> ${item.Seguridad}</p>
            <p class="text-teal-600"><strong>🌳 Áreas verdes:</strong> ${item["Áreas verdes"]}</p>
            <hr class="border-blue-200 my-2">
            <p class="text-blue-500 text-xs"><strong>📅 Última resolución:</strong> ${new Date(item.ultima_resolucion).toLocaleDateString("es-AR")}</p>
          </div>
        </div>
      `

      marker.bindTooltip(tooltipContent, {
        permanent: false,
        direction: "top",
        offset: [0, -10],
        opacity: 1,
        className: "leaflet-tooltip-custom-frio",
      })

      marker.on("mouseover", () => {
        marker.openTooltip()
      })

      marker.on("mouseout", () => {
        marker.closeTooltip()
      })

      markersRef.current.push(marker)
    })
  }, [data])

  // Cargar leaflet.heat dinámicamente
  useEffect(() => {
    if (typeof window !== "undefined" && !window.L?.heatLayer) {
      const script = document.createElement("script")
      script.src = "https://cdn.jsdelivr.net/npm/leaflet.heat@0.2.0/dist/leaflet-heat.js"
      script.async = true
      document.head.appendChild(script)

      return () => {
        document.head.removeChild(script)
      }
    }
  }, [])

  return (
    <>
      <div
        ref={mapRef}
        className="w-full"
        style={{
          height: isModal ? "calc(95vh - 120px)" : "500px",
          borderRadius: "8px",
          border: "2px solid #3b82f6",
        }}
      />
      <style jsx global>{`
        .leaflet-tooltip-custom-frio {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
        .leaflet-tooltip-custom-frio .leaflet-tooltip-content {
          margin: 0 !important;
          padding: 0 !important;
        }
      `}</style>
    </>
  )
}

export default MapaFrioComponente
