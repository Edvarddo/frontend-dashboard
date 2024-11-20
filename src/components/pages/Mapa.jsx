import React from 'react'
import TopBar from '../TopBar'

const Mapa = ({ isOpened, setIsOpened }) => {
  return (
    <>
      <TopBar title="Mapa" handleOpenSidebar={() => setIsOpened(!isOpened)} />
    </>
  )
}

export default Mapa