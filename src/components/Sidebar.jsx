import React, { useContext, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import logo from '../assets/logo_muni.png'
import AuthContext from '../contexts/AuthContext'
import SidebarSectionContext from '../contexts/SidebarSectionContext'

const Sidebar = ({ isOpened }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { authToken, setAuthToken, logout } = useContext(AuthContext)
  const { sections, setSelectedSection, selectedSection } = useContext(SidebarSectionContext)

  useEffect(() => {
    const currentSection = sections.find(section => section.link === location.pathname)
    if (currentSection) {
      setSelectedSection(currentSection.title)
    }
  }, [location, sections, setSelectedSection])

  const handleLogout = () => {
    setTimeout(() => {
      logout()
      navigate('/login')
    }, 1000)
  }

  return (
    <nav className={`sidebar ${!isOpened ? "closed" : ""}`}>
      <header className="sidebar-header">
        <div className="logo-cont">
          <img className="logo-image" src={logo} alt="Logo de la municipalidad" />
        </div>
        <span>Dashboard Municipal</span>
      </header>
      <div className="menu">
        <ul className="menu-list">
          {sections?.map((section, index) => (
            <li 
              key={index} 
              className={`nav-link ${selectedSection === section?.title ? "active" : ""}`}
            >
              <Link 
                to={section?.link} 
                onClick={() => setSelectedSection(section?.title)}
              >
                {section?.icon}
                <span className="text nav-text leading-6">
                  {section?.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="bottom-menu">
          <li className="nav-link">
            <a
              onClick={handleLogout}
              href="#"
            >
              <LogOut className="icon" />
              <span className="text nav-text">
                Cerrar sesión
              </span>
            </a>
          </li>
        </div>
      </div>
    </nav>
  )
}

export default Sidebar

