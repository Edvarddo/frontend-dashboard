"use client"

import { useContext, useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { ChevronDown, ChevronRight, LogOut } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import logo from "../assets/logo_muni.png"
import AuthContext from "../contexts/AuthContext"
import SidebarSectionContext from "../contexts/SidebarSectionContext"

const Sidebar = ({ isOpened }) => {
  const location = useLocation()
  const navigate = useNavigate()

  const { logout, nombre, rol } = useContext(AuthContext)
  const { sections, selectedSection, setSelectedSection } =
    useContext(SidebarSectionContext)

  const [openParent, setOpenParent] = useState(null)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // -------- Sincronizar sección seleccionada y acordeón con la URL --------
  useEffect(() => {
    const currentParent = sections.find((section) => {
      if (section.link === location.pathname) return true
      if (section.children?.length) {
        return section.children.some((child) => child.link === location.pathname)
      }
      return false
    })

    if (currentParent) {
      setSelectedSection(currentParent.title)
      if (currentParent.children?.length) {
        setOpenParent(currentParent.title)
      }
    }
  }, [location.pathname, sections, setSelectedSection])

  // ---------------------- Handlers ----------------------

  const handleParentClick = (section) => {
    const hasChildren = section.children && section.children.length > 0
    const isOpen = openParent === section.title

    setSelectedSection(section.title)

    if (hasChildren) {
      setOpenParent((prev) => (prev === section.title ? null : section.title))
      // si quieres que al abrir un padre navegue a su ruta base:
      if (section.link && !isOpen) {
        navigate(section.link)
      }
    } else if (section.link) {
      navigate(section.link)
    }
  }

  const handleChildClick = (child) => {
    navigate(child.link)
  }

  const handleLogoutClick = () => {
    setShowLogoutModal(true)
  }

  const confirmLogout = () => {
    setIsLoggingOut(true)
    setTimeout(() => {
      logout()
      setIsLoggingOut(false)
      setShowLogoutModal(false)
      navigate("/login")
    }, 1500)
  }

  const cancelLogout = () => {
    if (isLoggingOut) return
    setShowLogoutModal(false)
  }

  // ---------------------- Render ----------------------

  return (
    <>
      <nav
        className={
          `
    fixed inset-y-0 left-0 z-40
    flex flex-col
    bg-white border-r border-slate-200
    transition-transform duration-200
    w-72
    ${isOpened ? "translate-x-0" : "-translate-x-full"}
  `}
      >
        {/* HEADER MODERNO */}
        <div className="px-4 pt-6 pb-5 flex items-center gap-4 select-none">
          <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center overflow-hidden border border-slate-200">
            <img
              src={logo || "/placeholder.svg"}
              alt="Logo Municipalidad"
              className="h-11 w-11 object-contain"
            />
          </div>

          <div className="flex flex-col leading-tight">
            <span className="text-[17px] font-bold text-slate-900 tracking-tight">
              Dashboard
            </span>
            <span className="text-[17px] font-bold text-slate-900 tracking-tight">
              Municipal
            </span>
            <span className="text-[12px] font-medium text-slate-500 -mt-[1px]">
              SGI MD5 v.1.7.7
            </span>
          </div>
        </div>

        {/* MENÚ SCROLLEABLE */}
        <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-4">
          {sections?.map((section, index) => {
            const hasChildren = section.children && section.children.length > 0
            const isActiveParent = selectedSection === section.title
            const isOpen = openParent === section.title

            return (
              <div key={section.title} className="mb-2">
                {/* BOTÓN PADRE */}
                <button
                  type="button"
                  onClick={() => handleParentClick(section)}
                  className={`
          w-full flex items-center justify-between rounded-2xl px-4 py-3
          text-left
          transition-all duration-200 ease-out
          ${isActiveParent
                      ? "bg-green-600 text-white shadow-md"
                      : "bg-white text-slate-900 hover:bg-slate-100"
                    }
          ${index === 0 ? "mt-1" : ""}
        `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{section.icon}</span>
                    <span className="text-base font-semibold">
                      {section.title}
                    </span>
                  </div>

                  {hasChildren && (
                    <span
                      className={`
              ml-2
              transition-transform duration-200
              ${isOpen ? "rotate-180" : "rotate-0"}
            `}
                    >
                      {/* puedes usar solo ChevronDown y girarlo */}
                      <ChevronDown className="h-4 w-4" />
                    </span>
                  )}
                </button>

                {/* SUBMENÚ CON ANIMACIÓN SUAVE */}
                {hasChildren && (
                  <div
                    className={`
            ml-7 border-l border-slate-200 pl-4
            overflow-hidden
            transition-[max-height,opacity,margin] duration-300 ease-in-out
            ${isOpen ? "max-h-64 opacity-100 mt-1" : "max-h-0 opacity-0 mt-0"}
          `}
                  >
                    <div className="space-y-1 py-1">
                      {section.children.map((child) => {
                        const isChildActive = location.pathname === child.link

                        return (
                          <button
                            key={child.title}
                            type="button"
                            onClick={() => handleChildClick(child)}
                            className={`
                    flex w-full items-center gap-2 rounded-xl px-2 py-2 text-sm
                    transition-all duration-150
                    ${isChildActive
                                ? "bg-slate-100 text-slate-900 font-semibold"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                              }
                  `}
                          >
                            <span className="text-base">{child.icon}</span>
                            <span>{child.title}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* SECCIÓN USUARIO (FIJA ABAJO) */}
        <div className="border-t border-slate-200 px-4 py-4">
          <button
            type="button"
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3 hover:bg-slate-100 transition shadow-sm"
          >
            <Avatar className="h-10 w-10 bg-emerald-500">
              <AvatarFallback className="bg-emerald-500 text-white font-semibold">
                {nombre
                  ? nombre
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join("")
                  : "SC"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {nombre || "Usuario"}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {rol?.toLowerCase() || "administrador"}
              </p>
            </div>
            <div className="h-9 w-9 flex items-center justify-center rounded-full bg-white text-slate-600 border border-slate-200">
              <LogOut className="h-4 w-4" />
            </div>
          </button>
        </div>
      </nav>

      {/* MODAL LOGOUT */}
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
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-medium transition"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center py-6 gap-3">
                <div className="h-8 w-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
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
