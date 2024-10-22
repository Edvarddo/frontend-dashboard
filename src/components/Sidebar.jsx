import {useState} from 'react'
import logo from '../assets/logotipo-muni.png'
import { Link } from 'react-router-dom'
const Sidebar = ({
  isOpened
}) => {
  const sections = [
    {
      title: "Dashboard",
      icon: "bx bx-pie-chart",
      link: "/dashboard"
    },
    {
      title: "Publicaciones",
      icon: "bx bx-file",
      link: "/"
    },
    {
      title: "Anuncios",
      icon: "bx bx-file",
      link: "/"
    },
    {
      title: "Reportes",
      icon: "bx bx-bar-chart-alt-2",
      link: "/"
    },
    {
      title: "Mapa",
      icon: "bx bx-map-alt",
      link: "/"
    },
    // {
    //   title: "Descargar",
    //   icon: "bx bx-download",
    //   link: "/descargar"
    // },
  ]
  // section state
  const [selectedSection, setSelectedSection] = useState(sections[1].title)
  return (
    <nav className={`sidebar ${!isOpened ? "closed" : ""}`}>
      <header className="sidebar-header">
        <div className="logo-cont">
          <img className='logo-image' src={logo} alt="Logo de la municipalidad" />
        </div>
        <span>Dashboard Municipal</span>
      </header>
      <div className="menu">
        <ul className="menu-list">
          {
            sections.map((section, index) => (
              
              <li key={index} className={`nav-link  ${selectedSection === section.title ? "active" : ""}`}>
                <Link to={section.link} onClick={() => setSelectedSection(section.title)}>
                  <i className={`${section.icon} icon`}></i>
                  <span className="text nav-text">
                    {section.title}
                  </span>
                </Link>
              </li>
            ))
          }


        </ul>


        <div className="bottom-menu">
          <li class="nav-link">
            <a href="#">
              <i class="bx bx-log-out icon"></i>
              <span class="text nav-text">
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