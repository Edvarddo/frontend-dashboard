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
  Tag,
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
          allowedRoles: ["jefe_departamento", "personal"],
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
        // GESTIÓN DE DATOS (HUB + NIETOS)
        {
          title: "Gestión de Datos",
          icon: <FileText className="w-4 h-4" />,
          link: "/gestion-datos",        // → HUB
          allowedRoles: ["administrador", "jefe_departamento"],
          children: [
            {
              title: "Categorías",
              link: "/gestion-datos/categorias",
              icon: <Tag className="w-4 h-4" />,
            },
            {
              title: "Departamentos",
              link: "/gestion-datos/departamentos",
              icon: <Building2 className="w-4 h-4" />,
            },
            {
              title: "Juntas Vecinales",
              link: "/gestion-datos/juntas-vecinales",
              icon: <Users className="w-4 h-4" />,
            },
          ],
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
      allowedRoles: ["administrador"],
      children: [
        {
          title: "Cuentas de Usuario",
          link: "/cuentas-usuario",
          icon: <Users className="w-4 h-4" />,
        },
        {
          title: "Tabla de Auditoría",
          link: "/auditoria",
          icon: <FileText className="w-4 h-4" />,
        },
      ],
    },
  ]

  const sections = useMemo(() => {
    // Función recursiva para filtrar menús
    const filterNodes = (nodes) => {
      // Usamos reduce para construir un nuevo array filtrado
      return nodes.reduce((acc, node) => {

        // 1. Verificación de Rol Directo:
        // Si no tiene 'allowedRoles', es público. Si tiene, verificamos si el rol del usuario está incluido.
        const hasPermission = !node.allowedRoles || node.allowedRoles.includes(rol);

        // Si no tiene permiso, lo saltamos (no se agrega al acumulador)
        if (!hasPermission) return acc;

        // Clonamos el nodo para no mutar el array original 'allSections'
        const newNode = { ...node };

        // 2. Procesar Hijos (Recursividad):
        if (newNode.children && newNode.children.length > 0) {
          newNode.children = filterNodes(newNode.children);

          // 3. Limpieza de Padres Vacíos:
          // Si después de filtrar los hijos, el array quedó vacío y el padre 
          // NO tiene un link directo (es solo un contenedor), no lo mostramos.
          if (newNode.children.length === 0 && !newNode.link) {
            return acc;
          }
        }

        // Si pasó todos los filtros, lo agregamos a la lista final
        acc.push(newNode);
        return acc;
      }, []);
    };

    return filterNodes(allSections);
  }, [rol]); // Se recalcula cada vez que cambia el rol

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

