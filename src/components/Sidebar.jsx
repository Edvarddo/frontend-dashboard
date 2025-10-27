"use client"

import { useContext, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { LogOut } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import logo from "../assets/logo_muni.png"
import AuthContext from "../contexts/AuthContext"
import SidebarSectionContext from "../contexts/SidebarSectionContext"

const Sidebar = ({ isOpened }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { authToken, setAuthToken, logout } = useContext(AuthContext)
  const { sections, setSelectedSection, selectedSection } = useContext(SidebarSectionContext)

  const mockUser = {
    name: "Juan Pérez",
    role: "Administrador",
    initials: "JP",
  }

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
        <div className="user-section sticky bottom-0">
          <div className="user-info">
            <Avatar className="h-10 w-10 bg-[#00A86B]">
              <AvatarFallback className="bg-[#00A86B] text-white font-semibold">{mockUser.initials}</AvatarFallback>
            </Avatar>
            <div className="user-details">
              <span className="user-name">{mockUser.name}</span>
              <span className="user-role">{mockUser.role}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-button" title="Cerrar sesión">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Sidebar
