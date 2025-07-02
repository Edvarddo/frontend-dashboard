"use client"

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

const MapaCalorComponente = ({ data, isModal = false }) => {
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

    // Crear puntos para el mapa de calor (colores cálidos)
    const points = data.map((item) => [
      item.Junta_Vecinal.latitud,
      item.Junta_Vecinal.longitud,
      item.Junta_Vecinal.intensidad, // Intensidad de calor (más alto = más rojo)
    ])

    if (window.L && window.L.heatLayer) {
      const map = mapInstanceRef.current;

      // Multiplica puntos para simular mayor densidad
      const amplifiedPoints = points.flatMap(p => Array(2).fill(p)); // 🔥 5x cada punto

      heatLayerRef.current = L.heatLayer(amplifiedPoints, {
        radius: 60, // 🔼 Aumentado para cubrir más área
        blur: 25,   // 🔼 Más suave y amplio
        maxZoom: 17,
        gradient: {
          // 0.0: "rgba(255, 140, 0, 0.6)",    // naranja fuerte
          0.2: "rgba(255, 100, 0, 0.7)",    // naranja oscuro
          0.4: "rgba(255, 60, 0, 0.8)",     // rojo-naranja
          0.6: "rgba(220, 0, 0, 0.9)",      // rojo intenso
          0.8: "rgba(160, 0, 0, 1.0)",      // rojo oscuro
          1.0: "rgba(90, 0, 0, 1.0)",       // casi negro con rojo
        },
      }).addTo(map);
    }

    // Agregar marcadores invisibles para tooltips
    data.forEach((item, index) => {
      const marker = L.marker([item.Junta_Vecinal.latitud, item.Junta_Vecinal.longitud], {
        opacity: 0,
      }).addTo(mapInstanceRef.current)

      const tooltipContent = `
        <div class="p-3 bg-white shadow-lg min-w-[250px] rounded-lg border-2 border-red-200">
          <h3 class="font-bold mb-2 text-red-800 text-lg">${item.Junta_Vecinal.nombre}</h3>
          <div class="space-y-1 text-sm">
            <p class="text-red-700"><strong>🚨 Total pendientes:</strong> ${item.Junta_Vecinal.pendientes}</p>
            <p class="text-orange-700"><strong>⚠️ Casos urgentes:</strong> ${item.Junta_Vecinal.urgentes}</p>
            <p class="text-yellow-700"><strong>⏱️ Tiempo promedio:</strong> ${item.tiempo_promedio_pendiente}</p>
            <hr class="border-red-200 my-2">
            <p class="text-red-600"><strong>🏥 Asistencia Social:</strong> ${item["Asistencia Social"]}</p>
            <p class="text-orange-600"><strong>🛣️ Mantención de Calles:</strong> ${item["Mantención de Calles"]}</p>
            <p class="text-yellow-600"><strong>🛡️ Seguridad:</strong> ${item.Seguridad}</p>
            <p class="text-pink-600"><strong>🌳 Áreas verdes:</strong> ${item["Áreas verdes"]}</p>
            <hr class="border-red-200 my-2">
            <p class="text-red-500 text-xs"><strong>📅 Última publicación:</strong> ${new Date(item.ultima_publicacion).toLocaleDateString("es-AR")}</p>
          </div>
        </div>
      `

      marker.bindTooltip(tooltipContent, {
        permanent: false,
        direction: "top",
        offset: [0, -10],
        opacity: 1,
        className: "leaflet-tooltip-custom-calor",
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
          border: "2px solid #dc2626",
          zIndex: isModal ? 9999 : 1,
          position: "relative",
        }}
      />
      <style jsx global>{`
        .leaflet-tooltip-custom-calor {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
        .leaflet-tooltip-custom-calor .leaflet-tooltip-content {
          margin: 0 !important;
          padding: 0 !important;
        }
        /* Asegurar que el mapa del modal tenga z-index alto */
        .leaflet-container {
          z-index: ${isModal ? "9999" : "1"} !important;
          position: relative !important;
        }
        .leaflet-map-pane {
          z-index: ${isModal ? "9999" : "1"} !important;
        }
        .leaflet-tile-pane {
          z-index: ${isModal ? "9999" : "1"} !important;
        }
        .leaflet-overlay-pane {
          z-index: ${isModal ? "10000" : "2"} !important;
        }
      `}</style>
    </>
  )
}

export default MapaCalorComponente
