// src/api/apiRoutes.js

// ==================================================
// BASE URL DEL BACKEND
// ==================================================
//
// En tu archivo .env o .env.local define:
// VITE_URL_PROD_VERCEL="http://localhost:8000/api/v1/"
//
// Esa es la ruta EXACTA desde donde responde tu backend
//
export const API_BASE_URL =
  import.meta.env.VITE_URL_PROD_VERCEL ?? "http://localhost:8000/api/v1/";

// Helper para construir la URL completa | No es necesaria la configuracion e interceptor lo tienen axios.js
export const apiUrl = (path) => `${API_BASE_URL}${path}`;

// ==================================================
//   RUTAS DE API (NO INCLUYEN /api/v1/)
// ==================================================
//
// Como API_BASE_URL YA TIENE /api/v1/,
// las rutas internas empiezan directamente desde "/"
// para evitar duplicaciones como /api/v1/v1/... !!!
//
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
    POR_JUNTA: "publicaciones-por-junta-vecinal/",
    RESUELTAS_POR_JUNTA: "publicaciones-resueltas-por-junta-vecinal/",
  },

  // ----- CATEGORÍAS -----
  CATEGORIAS: {
    ROOT: "categorias/",
    DETAIL: (id) => `categorias/${id}/`,
  },

  // ----- DEPARTAMENTOS -----
  DEPARTAMENTOS: {
    ROOT: "departamentos-municipales/",
    DETAIL: (id) => `departamentos-municipales/${id}/`,
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
  RESPUESTAS_MUNICIPALES: {
    ROOT: "respuestas-municipales/",
    DETAIL: (id) => `respuestas-municipales/por-publicacion/${id}/`,
    ROOT_ID: (id) => `respuestas-municipales/${id}/`,
  },

  // ----- SITUACIONES -----
  SITUACIONES_PUBLICACIONES: {
    ROOT: "situaciones-publicaciones/",
    DETAIL: (id) => `situaciones-publicaciones/${id}/`,
  },

  // ----- ANUNCIOS -----
  ANUNCIOS: {
    ROOT: "anuncios-municipales/",
    DETAIL: (id) => `anuncios-municipales/${id}/`,
  },

  // ----- IMÁGENES ANUNCIOS -----
  IMAGENES_ANUNCIOS: {
    ROOT: "imagenes-anuncios/",
    DETAIL: (id) => `imagenes-anuncios/${id}/`,
  },

  // ----- USUARIO-DEPARTAMENTO -----
  USUARIO_DEPARTAMENTO: {
    ROOT: "usuario-departamento/",
    DETAIL: (id) => `usuario-departamento/${id}/`,
  },

  // ----- EVIDENCIAS DE RESPUESTA -----
  EVIDENCIA_RESPUESTA: {
    ROOT: "evidencia-respuesta/",
    DETAIL: (id) => `evidencia-respuesta/${id}/`,
  },

  // ----- HISTORIAL -----
  HISTORIAL_MODIFICACIONES: {
    ROOT: "historial-modificaciones/",
    DETAIL: (id) => `historial-modificaciones/${id}/`,
  },

  // ----- AUDITORÍA -----
  AUDITORIA: {
    ROOT: "auditoria/",
    DETAIL: (id) => `auditoria/${id}/`,
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
  REPORTS: {
    EXPORT_EXCEL: "export-to-excel/",
    GENERATE_PDF: "generate-pdf-report/",
  },

  // ----- ESTADÍSTICAS -----
  STATS: {
    PUBLICACIONES_POR_MES_Y_CATEGORIA: "publicaciones-por-mes-y-categoria/",
    PUBLICACIONES_POR_CATEGORIA: "publicaciones-por-categoria/",
    RESUMEN_ESTADISTICAS: "resumen-estadisticas/",
    RESUELTOS_POR_MES: "resueltos-por-mes/",
    TASA_RESOLUCION_DEPARTAMENTO: "tasa-resolucion-departamento/",
    PUBLICACIONES_POR_JUNTA_VECINAL: "publicaciones-por-junta-vecinal/",
    ESTADISTICAS_DEPARTAMENTOS: "estadisticas-departamentos/",
    ESTADISTICAS_KANBAN: "estadisticas-kanban/",
    ESTADISTICAS_RESPUESTAS: "estadisticas-respuestas/",
    ESTADISTICAS_GESTION_DATOS: "estadisticas-gestion-datos/",
    JUNTA_MAS_CRITICA: "junta-mas-critica/",
    PUBLICACIONES_RESUELTAS_POR_JUNTA_VECINAL:
      "publicaciones-resueltas-por-junta-vecinal/",
    JUNTA_MAS_EFICIENTE: "junta-mas-eficiente/",
    ESTADISTICAS_HISTORIAL_MODIFICACIONES:
      "estadisticas-historial-modificaciones/",
  },
};
