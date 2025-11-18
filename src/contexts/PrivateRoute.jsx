import { Navigate, Outlet } from "react-router-dom"
import useAuth from "../hooks/useAuth"
import { se } from "date-fns/locale"
import { set } from "date-fns"

export const PrivateRoute = ({ children, onlyAdmin = false }) => {
    const { authToken, isAdmin, rol, logout, setAuthMessage, setAuthToken } = useAuth()
    console.log("PrivateRoute - authToken:", authToken, "isAdmin:", isAdmin, "rol:", rol)

    const verifyTokenFormat = (token) => {
        const tokenArray = token?.split(".")
        if (tokenArray?.length !== 3) return false  
        return true
    }

    const isTokenValid = verifyTokenFormat(authToken)

    // 1) No hay token o es inválido → al login
    if (!authToken || !isTokenValid) {
        return <Navigate to="/login" replace />
    }

    // 2) Bloquear SIEMPRE a usuarios "vecino"
    // (ajusta el string según como venga tu rol: "VECINO", "vecino", etc.)
    if (rol?.toLowerCase() === "vecino" ) {
          logout()
        console.log(rol)
      
        setAuthMessage("Acceso denegado: su cuenta no tiene permisos para acceder al dashboard.")
        return (
            <Navigate
                to="/login"
                replace
            />
        )
    }


    // 3) Ruta solo para admin y el usuario NO es admin → acceso denegado
    //   if (onlyAdmin && !isAdmin) {
    //     return <Navigate to="/acceso-denegado" replace />
    //   }

    // 4) Autorizado → renderizar children o <Outlet />
    return children ? children : <Outlet />
}

export default PrivateRoute
