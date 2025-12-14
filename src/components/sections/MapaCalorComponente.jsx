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

const MapaCalorComponente = ({ data, isModal = false, categorias }) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const heatLayerRef = useRef(null)
  const markersRef = useRef([])
  console.log("RENDERIZANDO MAPA CALOR 22222", categorias);
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
        // Asegurar que el marcador sea interactivo en modal
        interactive: true,
        bubblingMouseEvents: false,
      }).addTo(mapInstanceRef.current)


      const pendientes = item.Junta_Vecinal.pendientes || 0
      const urgentes = item.Junta_Vecinal.urgentes || 0

      const criticidadNivel =
        urgentes >= 6 ? "Alta" :
          urgentes >= 3 ? "Media" :
            "Baja"

      const criticidadClass =
        urgentes >= 6
          ? "bg-red-100 text-red-700 border-red-200"
          : urgentes >= 3
            ? "bg-orange-100 text-orange-700 border-orange-200"
            : "bg-emerald-100 text-emerald-700 border-emerald-200"

      const tooltipContent = `
  <div class="heatmap-tooltip relative z-[9999]">
    <div class="bg-white/95 backdrop-blur-md shadow-xl rounded-2xl border border-red-200 px-4 py-3 min-w-[260px]">

      <!-- HEADER -->
      <div class="flex items-start justify-between gap-2 mb-2">
        <h3 class="font-semibold text-red-800 text-sm leading-snug">
          ${item.Junta_Vecinal.nombre || "Sin nombre"}
        </h3>
        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${criticidadClass}">
          ● Criticidad ${criticidadNivel}
        </span>
      </div>

      <!-- MÉTRICAS PRINCIPALES -->
      <div class="grid grid-cols-3 gap-2 text-[11px] mb-2">
        <div class="flex flex-col items-center rounded-md bg-red-50 px-2 py-1">
          <span class="text-[10px] text-red-500 font-medium">Pendientes</span>
          <span class="text-sm font-bold text-red-700">${pendientes}</span>
        </div>
        <div class="flex flex-col items-center rounded-md bg-orange-50 px-2 py-1">
          <span class="text-[10px] text-orange-500 font-medium">Urgentes</span>
          <span class="text-sm font-bold text-orange-700">${urgentes}</span>
        </div>
        <div class="flex flex-col items-center rounded-md bg-amber-50 px-2 py-1">
          <span class="text-[10px] text-amber-600 font-medium">Promedio</span>
          <span class="text-[11px] font-semibold text-amber-700">
            ${item.tiempo_promedio_pendiente || "N/A"}
          </span>
        </div>
      </div>

      <!-- CATEGORÍAS -->
      <div class="border-t border-red-100 pt-2 mt-1">
        <p class="text-[10px] uppercase tracking-wide text-red-400 font-semibold mb-1">
          Categorías
        </p>
        <div class="space-y-1 text-[11px]">
          ${categorias
          .map(cat => {
            const cantidad = item[cat.nombre] || 0
            const isZero = cantidad === 0
            return `
                <div class="flex items-center justify-between gap-2">
                  <span class="flex items-center gap-1 text-red-700 ${isZero ? "opacity-50" : ""}">
                    <span class="inline-block w-1.5 h-1.5 rounded-full bg-red-400"></span>
                    ${cat.nombre}
                  </span>
                  <span class="font-semibold ${isZero ? "text-red-300" : "text-red-700"}">
                    ${cantidad}
                  </span>
                </div>
              `
          })
          .join("")}
        </div>
      </div>

      <!-- FOOTER -->
      <div class="border-t border-red-100 mt-2 pt-1 flex items-center justify-between text-[10px] text-red-500">
        <span class="inline-flex items-center gap-1">
          <span>📅</span>
          <span>Última publicación</span>
        </span>
        <span class="font-semibold text-red-600">
          ${item.ultima_publicacion
          ? new Date(item.ultima_publicacion).toLocaleDateString("es-AR")
          : "N/A"
        }
        </span>
      </div>
    </div>
  </div>
`

      marker.bindTooltip(tooltipContent, {
        permanent: false,
        direction: "top",
        offset: [0, -10],
        opacity: 1,
        className: "leaflet-tooltip-custom-calor",
        sticky: true, // Permite que el tooltip se mueva con el mouse
        ...(isModal && {
          pane: 'tooltipPane',
          zIndexOffset: 10017,
        }),
      })

      marker.on("mouseover", () => {
        marker.openTooltip()
      })

      marker.on("mouseout", () => {
        marker.closeTooltip()
      })

      markersRef.current.push(marker)
    })
  }, [data, isModal])

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
      <style dangerouslySetInnerHTML={{
        __html: `
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
          z-index: ${isModal ? "10015" : "1"} !important;
          position: relative !important;
        }
        .leaflet-map-pane {
          z-index: ${isModal ? "10015" : "1"} !important;
        }
        .leaflet-tile-pane {
          z-index: ${isModal ? "10015" : "1"} !important;
        }
        .leaflet-overlay-pane {
          z-index: ${isModal ? "10016" : "2"} !important;
        }
        .leaflet-tooltip-pane {
          z-index: ${isModal ? "10017" : "3"} !important;
        }
        .leaflet-marker-pane {
          z-index: ${isModal ? "10016" : "2"} !important;
        }
        `
      }} />
    </>
  )
}

export default MapaCalorComponente
