"use client"

import { useContext, useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { LogOut } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import logo from "../assets/logo_muni.png"
import AuthContext from "../contexts/AuthContext"
import SidebarSectionContext from "../contexts/SidebarSectionContext"
import { Skeleton } from "@/components/ui/skeleton"

const Sidebar = ({ isOpened }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { authToken, setAuthToken, logout, nombre, rol, departamento } = useContext(AuthContext)
  const { sections, setSelectedSection, selectedSection } = useContext(SidebarSectionContext)
  const [isLoadingUser, setIsLoadingUser] = useState(true)

  const mockUser = {
    name: "Juan Pérez",
    role: "Administrador",
    // function to get initials from name
    initials: "JP",
  }

  useEffect(() => {
    // Simula una carga de datos del usuario
    const timer = setTimeout(() => {
      setIsLoadingUser(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const currentSection = sections.find((section) => section.link === location.pathname)

    if (currentSection) {
      setSelectedSection(currentSection.title)
    }
  }, [location, sections, setSelectedSection])

  const handleLogout = () => {
    setTimeout(() => {
      logout()
      navigate("/login")
    }, 1000)
  }

  return (
    <nav className={`sidebar ${!isOpened ? "closed" : ""}`}>
      <header className="sidebar-header">
        <div className="logo-cont">
          <img className="logo-image" src={logo || "/placeholder.svg"} alt="Logo de la municipalidad" />
        </div>
        <span>Dashboard Municipal</span>
      </header>
      <div className="menu">
        <div className="menu-scrollable">
          <ul className="menu-list">
            {sections?.map((section, index) => (
              <li
                key={index}
                className={`${selectedSection === section?.title ? "active" : ""} ${section.isSpecial ? "special" : "normal"}`}
              >
                <Link
                  to={section?.link}
                  onClick={() => setSelectedSection(section?.title)}
                  className={` flex items-center gap-2`}
                >
                  {section?.icon}
                  <span className={`text-sm `}>{section.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {/* USER SECTION */}
        <div className="user-section sticky bottom-0">
          {isLoadingUser ? (
            <div className="user-info">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="user-details flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ) : (
            <>
              <div className="user-info">
                <Avatar className="h-10 w-10 bg-[#00A86B]">
                  {/* initials for avatar */}
                  <AvatarFallback className="bg-[#00A86B] text-white font-semibold">{nombre ? nombre.split(" ").map((n) => n[0]).join("") : mockUser.initials}</AvatarFallback>
                </Avatar>
                <div className="user-details">
                  <span className="user-name">{nombre ? nombre : mockUser.name}</span>
                  <span className="user-role">{rol ? rol : mockUser.role}</span>
                </div>
              </div>
              <button onClick={handleLogout} className="logout-button" title="Cerrar sesión">
                <LogOut className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Sidebar
