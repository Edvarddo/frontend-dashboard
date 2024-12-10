// src/contexts/AuthContext.jsx
import { ChartNoAxesColumn, ChartPie, FileText, Megaphone, Map } from 'lucide-react';
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
      title: "Mapa",
      icon: <Map className='icon' />,
      link: "/mapa"
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

