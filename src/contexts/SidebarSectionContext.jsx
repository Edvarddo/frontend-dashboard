// src/contexts/AuthContext.jsx
import { GearIcon } from '@radix-ui/react-icons';
import { ChartNoAxesColumn, ChartPie, FileText, Megaphone, Map, Settings, Thermometer, Book, StickyNote, User2 } from 'lucide-react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
const SidebarSectionContext = createContext();


export const SidebarSectionProvider = ({ children }) => {
 
  const sections = [
    {
      title: "Dashboard",
      icon: <ChartPie className='icon' />,
      link: "/dashboard"
    },
    {
      title: "Publicaciones",
      icon: <FileText className='icon' />,
      link: "/listado-publicaciones"
    },
    {
      title: "Anuncios",
      icon: <Megaphone className='icon' />,
      link: "/anuncios"
    },
    // {
    //   title: "Reportes",
    //   icon: <ChartNoAxesColumn className='icon' />,
    //   link: "/reportes"
    // },
    {
    title: "Mapa Térmico",
    link: "/mapa",
    icon: <Thermometer className='icon ' />,
    isSpecial: true, // Marcador especial para el mapa térmico
  },
    // {
    //   title: "Descargar",
    //   icon: "bx bx-download",
    //   link: "/descargar"
    // },
    // {
    //   title: "Respuestas municipales",
    //   icon: <FileText className='icon' />,
    //   link: "/respuestas-municipales"
    // }
    {
      title: "Gestion de datos",
      icon: <Settings className='icon' />,
      // gear icon para este
      
      link: "/gestion-datos"
    },
    {
      title: "Historial de modificaciones",
      // otro icono we que no sea filetext
      icon: <FileText className='icon' />,
      link: "/historial-modificacion-publicaciones"
    },
    // tabla de auditoria
    {
      title: "Auditoría",
      icon: <Book className='icon' />,
      link: "/auditoria"
    },
    {
      // kanban board
      title: "Kanban",
      icon: <StickyNote className='icon' />,
      link: "/kanban"
    },
    // cuentas de usuario
    {
      title: "Cuentas de usuario",
      icon: <User2 className='icon' />,
      link: "/cuentas-usuario"
    }
  ]
  
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

