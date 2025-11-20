// src/contexts/AuthContext.jsx
import { GearIcon } from '@radix-ui/react-icons';
import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import {
  LayoutDashboard,
  FileSearch,
  FileText,
  ListTree,
  Building2,
  Map,
  Megaphone,
  PlusCircle,
  Users,
} from "lucide-react";
const SidebarSectionContext = createContext();

export const SidebarSectionProvider = ({ children }) => {

  const { rol } = useAuth()

   const allSections = [
  // --------------------------
  // 1. INICIO
  // --------------------------
  {
    title: "Inicio",
    icon: <LayoutDashboard className="w-5 h-5" />,
    link: "/dashboard",
  },

  // --------------------------
  // 2. PUBLICACIONES Y CASOS
  // --------------------------
  {
    title: "Publicaciones y Casos",
    icon: <FileSearch className="w-5 h-5" />,
    children: [
      {
        title: "Listado de Publicaciones",
        link: "/listado-publicaciones",
        icon: <ListTree className="w-4 h-4" />,
      },
      {
        title: "Historial de Modificaciones",
        link: "/historial-modificacion-publicaciones",
        icon: <FileText className="w-4 h-4" />,
      },
    ],
  },

  // --------------------------
  // 3. GESTIÓN MUNICIPAL
  // --------------------------
  {
    title: "Gestión Municipal",
    icon: <Building2 className="w-5 h-5" />,
    children: [
      {
        title: "Respuestas Municipales",
        link: "/respuestas-municipales",
        icon: <FileText className="w-4 h-4" />,
      },
      {
        title: "Gestión de Datos",
        link: "/gestion-datos",
        icon: <FileText className="w-4 h-4" />,
      },
    ],
  },

  // --------------------------
  // 4. MAPA
  // --------------------------
  {
    title: "Mapa",
    icon: <Map className="w-5 h-5" />,
    link: "/mapa",
  },

  // --------------------------
  // 5. ANUNCIOS Y COMUNICACIONES
  // --------------------------
  {
    title: "Anuncios y Comunicaciones",
    icon: <Megaphone className="w-5 h-5" />,
    children: [
      {
        title: "Listado de Anuncios",
        link: "/anuncios",
        icon: <FileText className="w-4 h-4" />,
      },
      {
        title: "Crear Anuncio",
        link: "/anuncio-formulario",
        icon: <PlusCircle className="w-4 h-4" />,
      },
    ],
  },

  // --------------------------
  // 6. ADMINISTRACIÓN (solo admins)
  // --------------------------
  {
    title: "Administración",
    icon: <Users className="w-5 h-5" />,
    children: [
      {
        title: "Cuentas de Usuario",
        link: "/cuentas-usuario",
        icon: <Users className="w-4 h-4" />,
      },
    ],
    isAdminOnly: true,
  },
];

  const sections = useMemo(() => {
    return allSections.filter(section => {
      // Si la sección no tiene 'allowedRoles', se muestra a todos
      if (!section.allowedRoles) {
        return true;
      }
      // Si tiene 'allowedRoles', verifica si el rol del usuario está incluido
      return rol && section.allowedRoles.includes(rol);
    });
  }, [rol]); // Depende del rol del usuario

  const [selectedSection, setSelectedSection] = useState("");

  return (
    <SidebarSectionContext.Provider value={
      {
        setSelectedSection,
        sections,
        selectedSection
      }}>
      {children}
    </SidebarSectionContext.Provider>
  );
};

export const useSidebar = () => useContext(SidebarSectionContext);
export default SidebarSectionContext;

