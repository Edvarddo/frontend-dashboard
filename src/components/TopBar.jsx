"use client"

const TopBar = ({ handleOpenSidebar, title, optionalbg }) => {
  return (
    <header className={`burger-btn p-4 flex items-center  ${optionalbg ? optionalbg : "bg-[#00A86B]"}`}>
      <button onClick={handleOpenSidebar} className="text-white mr-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <span></span>
      <h1 className="text-white text-3xl font-bold">{title}</h1>
    </header>
  )
}

export default TopBar
