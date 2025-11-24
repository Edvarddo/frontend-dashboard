

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

const MapaFrioComponente = ({ data, isModal = false, categorias }) => {
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

    const generarEstrellasHTML = (puntuacion) => {
      const stars = [];
      const score = Math.round(puntuacion || 0);

      for (let i = 1; i <= 5; i++) {
        const filled = i <= score;
        // SVG de estrella (Lucide icon style)
        const colorClass = filled ? "text-yellow-400 fill-yellow-400" : "text-gray-300";
        const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="${filled ? '#facc15' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star ${colorClass}">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      `;
        stars.push(svg);
      }
      return `<div class="flex gap-0.5">${stars.join('')}</div>`;
    };

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
      const totalResueltas = item.Junta_Vecinal?.total_resueltas || 0
      const eficiencia = item.Junta_Vecinal?.eficiencia || 0
      const tiempoProm = item.tiempo_promedio_resolucion || "0 días"

      // Nuevos datos de satisfacción
      const calificacion = item.Junta_Vecinal?.calificacion_promedio || 0
      const totalValoraciones = item.Junta_Vecinal?.total_valoraciones || 0
      const estrellasHTML = generarEstrellasHTML(calificacion);

      const nivelDesempeno =
        eficiencia >= 90 ? "Excelente" :
          eficiencia >= 75 ? "Bueno" :
            eficiencia >= 50 ? "En mejora" :
              "Bajo"

      const nivelClass =
        eficiencia >= 90
          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
          : eficiencia >= 75
            ? "bg-blue-100 text-blue-700 border-blue-200"
            : eficiencia >= 50
              ? "bg-amber-100 text-amber-700 border-amber-200"
              : "bg-red-100 text-red-700 border-red-200"
      const tooltipContent = `
  <div class="coldmap-tooltip relative z-[9999]">
    <div class="bg-white/95 backdrop-blur-md shadow-xl rounded-2xl border border-blue-200 px-4 py-3 min-w-[260px]">

      <!-- HEADER -->
      <div class="flex items-start justify-between gap-2 mb-2">
        <h3 class="font-semibold text-blue-900 text-sm leading-snug">
          ${item.Junta_Vecinal?.nombre || "Sin nombre"}
        </h3>
        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${nivelClass}">
          ● Desempeño ${nivelDesempeno}
        </span>
      </div>

      <div class="bg-yellow-50/50 rounded-lg p-2 mb-2 border border-yellow-100">
               <div class="flex justify-between items-center">
                  <span class="text-[10px] font-semibold text-yellow-700 uppercase">Satisfacción Vecinal</span>
                  <span class="text-[10px] text-yellow-600 font-bold">${calificacion.toFixed(1)} / 5.0</span>
               </div>
               <div class="flex justify-between items-center mt-1">
                  ${estrellasHTML}
                  <span class="text-[9px] text-gray-500">(${totalValoraciones} votos)</span>
               </div>
      </div>

      <!-- MÉTRICAS PRINCIPALES -->
      <div class="grid grid-cols-3 gap-2 text-[11px] mb-2">
        <div class="flex flex-col items-center rounded-md bg-blue-50 px-2 py-1">
          <span class="text-[10px] text-blue-500 font-medium">Resueltas</span>
          <span class="text-sm font-bold text-blue-700">${totalResueltas}</span>
        </div>
        <div class="flex flex-col items-center rounded-md bg-cyan-50 px-2 py-1">
          <span class="text-[10px] text-cyan-600 font-medium">Eficiencia</span>
          <span class="text-sm font-bold text-cyan-700">${eficiencia}%</span>
        </div>
        <div class="flex flex-col items-center rounded-md bg-indigo-50 px-2 py-1">
          <span class="text-[10px] text-indigo-600 font-medium">Promedio</span>
          <span class="text-[11px] font-semibold text-indigo-700">
            ${tiempoProm}
          </span>
        </div>
      </div>

      <!-- CATEGORÍAS DINÁMICAS -->
      <div class="border-t border-blue-100 pt-2 mt-1">
        <p class="text-[10px] uppercase tracking-wide text-blue-400 font-semibold mb-1">
          Categorías resueltas
        </p>
        <div class="space-y-1 text-[11px]">
          ${categorias?.map(cat => {
        const cantidad = item[cat.nombre] || 0
        const isZero = cantidad === 0
        return `
              <div class="flex items-center justify-between gap-2">
                <span class="flex items-center gap-1 text-blue-700 ${isZero ? "opacity-50" : ""}">
                  <span class="inline-block w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  ${cat.nombre}
                </span>
                <span class="font-semibold ${isZero ? "text-blue-300" : "text-blue-700"}">
                  ${cantidad}
                </span>
              </div>
            `
      }).join("")}
        </div>
      </div>

      <!-- FOOTER -->
      <div class="border-t border-blue-100 mt-2 pt-1 flex items-center justify-between text-[10px] text-blue-500">
        <span class="inline-flex items-center gap-1">
          <span>📅</span>
          <span>Última resolución</span>
        </span>
        <span class="font-semibold text-blue-700">
          ${item.ultima_resolucion
          ? new Date(item.ultima_resolucion).toLocaleDateString("es-AR")
          : "Sin fecha"
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
