// src/api/apiRoutes.js

// ==================================================
// BASE URL DEL BACKEND
// ==================================================
export const API_BASE_URL =
  import.meta.env.VITE_URL_PROD_VERCEL ?? "http://localhost:8000/api/v1/";

// Helper para construir la URL completa
export const apiUrl = (path) => `${API_BASE_URL}${path}`;

// ==================================================
//   RUTAS DE API (NO INCLUYEN /api/v1/)
// ==================================================
export const API_ROUTES = {
  // ----- AUTENTICACIÓN -----
  AUTH: {
    LOGIN: "token/",
    REFRESH: "token/refresh/",
    REGISTER: "registro/",
    VERIFY_USER: "verificar-usuario/",
    LOGOUT: "logout/",
  },

  // ----- USUARIOS -----
  USUARIOS: {
    ROOT: "usuarios/",
    DETAIL: (id) => `usuarios/${id}/`,
  },

  // ----- PUBLICACIONES -----
  PUBLICACIONES: {
    ROOT: "publicaciones/",
    DETAIL: (id) => `publicaciones/${id}/`,
    CON_HISTORIAL: "publicaciones/con-historial/",
    // Actualizado: Ahora apuntan al grupo de estadísticas
    POR_JUNTA: "estadisticas/publicaciones-junta/",
    RESUELTAS_POR_JUNTA: "estadisticas/resueltas-junta/",
  },

  // ----- CATEGORÍAS -----
  CATEGORIAS: {
    ROOT: "categorias/",
    DETAIL: (id) => `categorias/${id}/`,
  },

  // ----- DEPARTAMENTOS -----
  // Nota: Backend cambió 'departamentos-municipales' a 'departamentos'
  DEPARTAMENTOS: {
    ROOT: "departamentos/",
    DETAIL: (id) => `departamentos/${id}/`,
  },

  // ----- JUNTAS VECINALES -----
  JUNTAS_VECINALES: {
    ROOT: "juntas-vecinales/",
    DETAIL: (id) => `juntas-vecinales/${id}/`,
    PAGINATED: "juntas-vecinales-paginated/",
  },

  // ----- EVIDENCIAS -----
  EVIDENCIAS: {
    ROOT: "evidencias/",
    DETAIL: (id) => `evidencias/${id}/`,
  },

  // ----- RESPUESTAS MUNICIPALES -----
  // Nota: Backend cambió 'respuestas-municipales' a 'respuestas'
  RESPUESTAS_MUNICIPALES: {
    ROOT: "respuestas/",
    // Nota: El backend define esta acción como 'por-publicacion' dentro de 'respuestas'
    DETAIL: (id) => `respuestas/por-publicacion/${id}/`,
    ROOT_ID: (id) => `respuestas/${id}/`,
  },

  // ----- SITUACIONES -----
  // Nota: Backend cambió 'situaciones-publicaciones' a 'situaciones'
  SITUACIONES_PUBLICACIONES: {
    ROOT: "situaciones/",
    DETAIL: (id) => `situaciones/${id}/`,
  },

  // ----- ANUNCIOS -----
  // Nota: Backend cambió 'anuncios-municipales' a 'anuncios'
  ANUNCIOS: {
    ROOT: "anuncios/",
    DETAIL: (id) => `anuncios/${id}/`,
  },

  // ----- IMÁGENES ANUNCIOS -----
  IMAGENES_ANUNCIOS: {
    ROOT: "imagenes-anuncios/",
    DETAIL: (id) => `imagenes-anuncios/${id}/`,
  },

  // ----- USUARIO-DEPARTAMENTO -----
  // Nota: Backend usa plural 'usuarios-departamento'
  USUARIO_DEPARTAMENTO: {
    ROOT: "usuarios-departamento/",
    DETAIL: (id) => `usuarios-departamento/${id}/`,
  },

  // ----- EVIDENCIAS DE RESPUESTA -----
  // Nota: Backend usa plural 'evidencias-respuesta'
  EVIDENCIA_RESPUESTA: {
    ROOT: "evidencias-respuesta/",
    DETAIL: (id) => `evidencias-respuesta/${id}/`,
  },

  // ----- HISTORIAL -----
  HISTORIAL_MODIFICACIONES: {
    ROOT: "historial-modificaciones/",
    DETAIL: (id) => `historial-modificaciones/${id}/`,
  },

  // ----- AUDITORÍA -----
  // Nota: Backend usa plural 'auditorias'
  AUDITORIA: {
    ROOT: "auditorias/",
    DETAIL: (id) => `auditorias/${id}/`,
  },

  // ----- KANBAN -----
  TABLEROS: {
    ROOT: "tableros/",
    DETAIL: (id) => `tableros/${id}/`,
  },

  COLUMNAS: {
    ROOT: "columnas/",
    DETAIL: (id) => `columnas/${id}/`,
  },

  TAREAS: {
    ROOT: "tareas/",
    DETAIL: (id) => `tareas/${id}/`,
  },

  COMENTARIOS: {
    ROOT: "comentarios/",
    DETAIL: (id) => `comentarios/${id}/`,
  },

  // ----- REPORTES -----
  // Actualizado: Rutas movidas a 'v1/reportes/...'
  REPORTS: {
    EXPORT_EXCEL: "reportes/excel/",
    GENERATE_PDF: "reportes/pdf/",
  },

  // ----- NOTIFICACIONES -----
  // Agregado: Nuevas rutas detectadas en urls.py
  NOTIFICACIONES: {
    REGISTRAR: "notificaciones/registrar/",
    DESACTIVAR: "notificaciones/desactivar/",
    MIS_DISPOSITIVOS: "notificaciones/mis-dispositivos/",
  },

  // ----- ESTADÍSTICAS -----
  // Actualizado: Todas las rutas movidas a 'v1/estadisticas/...'
  STATS: {
    RESUMEN_ESTADISTICAS: "estadisticas/resumen/",
    PUBLICACIONES_POR_MES_Y_CATEGORIA: "estadisticas/publicaciones-mes-categoria/",
    PUBLICACIONES_POR_CATEGORIA: "estadisticas/publicaciones-categoria/",
    RESUELTOS_POR_MES: "estadisticas/resueltos-mes/",
    TASA_RESOLUCION_DEPARTAMENTO: "estadisticas/tasa-resolucion/",
    PUBLICACIONES_POR_JUNTA_VECINAL: "estadisticas/publicaciones-junta/",
    JUNTA_MAS_CRITICA: "estadisticas/junta-critica/",
    JUNTA_MAS_EFICIENTE: "estadisticas/junta-eficiente/",
    PUBLICACIONES_RESUELTAS_POR_JUNTA_VECINAL: "estadisticas/resueltas-junta/",
    ESTADISTICAS_DEPARTAMENTOS: "estadisticas/departamentos/",
    ESTADISTICAS_KANBAN: "estadisticas/kanban/",
    ESTADISTICAS_RESPUESTAS: "estadisticas/respuestas/",
    ESTADISTICAS_GESTION_DATOS: "estadisticas/gestion-datos/",
    ESTADISTICAS_HISTORIAL_MODIFICACIONES: "estadisticas/historial-modificaciones/",
  },
};