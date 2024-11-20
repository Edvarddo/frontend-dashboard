import React from 'react'
import TopBar from '../TopBar'

const Anuncio = ({ isOpened, setIsOpened }) => {
  return (
    <>
      <TopBar title="Anuncio" handleOpenSidebar={() => setIsOpened(!isOpened)} />
    </>
  )
}

export default Anuncio