import React from 'react'
import TopBar from '../TopBar'
const RespuestasMunicipales = ({ isOpened, setIsOpened }) => {
  const handleOpenSidebar = () => {
    setIsOpened(!isOpened)
  }
  return (
    <>
      <TopBar title="Respuestas Municipales" handleOpenSidebar={handleOpenSidebar} />
      
      
    </>
  )
}

export default RespuestasMunicipales