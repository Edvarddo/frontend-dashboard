import {useState, useContext, useEffect} from 'react'
import logo from '../assets/logo_muni.png'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';
import {
  ChartPie,
  FileText,
  Megaphone,
  ChartNoAxesColumn,
  Map,
  LogOutIcon

} from 'lucide-react'
import { Button } from './ui/button'
import { set } from 'date-fns';
import AuthContext from '../contexts/AuthContext';
import  SidebarSectionContext  from '../contexts/SidebarSectionContext'
// import {useSidebar} from '../contexts/SidebarSectionContext'
import { useLocation } from 'react-router-dom';
const Sidebar = ({
  isOpened
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const useAuth = useContext(AuthContext)
  const useSidebar = useContext(SidebarSectionContext) 
  console.log(useSidebar)
  console.log(useAuth)
  const { sections, setSelectedSection, selectedSection } = useSidebar;
  const { authToken, setAuthToken } = useAuth;
  const handleLogout = () => {
    console.log('Cerrar Sesión')
    setTimeout(() => {
      setAuthToken(null);
      localStorage.removeItem('authToken');
      navigate('/login');
    }, 1000);

  }
  // const { sections, setSelectedSection, selectedSection } = useSidebar()
  // console.log(useSidebar)
  // console.log(sections)
  
  
  // section state
  // const [selectedSection, setSelectedSection] = useState(sections[1].title)
  useEffect(() => {
    const section = sections.find(section => section.link === location.pathname);
    if (section) {
      setSelectedSection(section.title);
    }
  }, [location]);

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
            sections?.map((section, index) => (
              
              <li key={index} className={`nav-link  ${selectedSection === section?.title ? "active" : ""}`}>
                <Link to={section?.link} onClick={() => setSelectedSection(section?.title)}>
                  {section?.icon}
                  <span className="text nav-text">
                    {section?.title}
                  </span>
                </Link>
              </li>
            ))
          }


        </ul>
        <div className="bottom-menu">
          <li class="nav-link">
            {/* button */}
            

              <a
               onClick={handleLogout}
               href="#">
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