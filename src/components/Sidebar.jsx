"use client"

import { useContext, useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { LogOut } from 'lucide-react'
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
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const mockUser = {
    name: "Juan Pérez",
    role: "Administrador",
    initials: "JP",
  }

  useEffect(() => {
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

  const handleLogoutClick = () => {
    setShowLogoutModal(true)
  }

  const confirmLogout = () => {
  setIsLoggingOut(true)

  setTimeout(() => {
    logout()
    navigate("/login")
  }, 1800) // 1.8 segundos de loading suave
}

  const cancelLogout = () => {
    setShowLogoutModal(false)
  }

  return (
    <>
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
                    <AvatarFallback className="bg-[#00A86B] text-white font-semibold">{nombre ? nombre.split(" ").map((n) => n[0]).join("") : mockUser.initials}</AvatarFallback>
                  </Avatar>
                  <div className="user-details">
                    <span className="user-name">{nombre ? nombre : mockUser.name}</span>
                    <span className="user-role">{rol ? rol : mockUser.role}</span>
                  </div>
                </div>
                <button onClick={handleLogoutClick} className="logout-button" title="Cerrar sesión">
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {showLogoutModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-w-full mx-4">
      <h2 className="text-lg font-semibold mb-2 text-gray-900">
        Cerrar sesión
      </h2>

      {!isLoggingOut ? (
        <>
          <p className="text-gray-600 mb-6">
            ¿Estás seguro de que deseas cerrar sesión?
          </p>

          <div className="flex gap-3 justify-end">
            <button
              onClick={cancelLogout}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-900 hover:bg-gray-300 font-medium transition"
            >
              Cancelar
            </button>

            <button
              onClick={confirmLogout}
              className="px-4 py-2 rounded-lg bg-[#00A86B] text-white hover:bg-[#008C5A] font-medium transition"
            >
              Cerrar sesión
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center py-6 gap-3">
          {/* Spinner */}
          <div className="h-8 w-8 border-2 border-[#00A86B] border-t-transparent rounded-full animate-spin"></div>

          {/* Texto */}
          <p className="text-gray-700 font-medium">
            Cerrando sesión…
          </p>
        </div>
      )}
    </div>
  </div>
)}
    </>
  )
}

export default Sidebar
