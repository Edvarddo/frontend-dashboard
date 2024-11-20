import React from 'react'
import TopBar from '../TopBar'

const Reporte = ({ isOpened, setIsOpened }) => {
  return (
    <>
      <TopBar title="Reporte" handleOpenSidebar={() => setIsOpened(!isOpened)} />
    </>
  )
}

export default Reporte