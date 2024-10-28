import {useState} from 'react'
import logo from '../assets/logotipo-muni.png'
import { Link } from 'react-router-dom'
import {
  ChartPie,
  FileText,
  Megaphone,
  ChartNoAxesColumn,
  Map,
  LogOutIcon

} from 'lucide-react'
const Sidebar = ({
  isOpened
}) => {
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
      link: "/"
    },
    {
      title: "Reportes",
      icon: <ChartNoAxesColumn className='icon' />,
      link: "/"
    },
    {
      title: "Mapa",
      icon: <Map className='icon' />,
      link: "/"
    },
    // {
    //   title: "Descargar",
    //   icon: "bx bx-download",
    //   link: "/descargar"
    // },
  ]
  // section state
  const [selectedSection, setSelectedSection] = useState(sections[0].title)
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
                  {/* <i className={` icon`} data-lucide={`${section.icon}`}></i> */}
                  {section.icon}
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
              <LogOutIcon className='icon' />
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