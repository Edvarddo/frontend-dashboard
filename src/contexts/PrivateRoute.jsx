import { Route, Navigate, Outlet } from 'react-router-dom';
import  AuthContext  from './AuthContext';
import { useContext } from 'react';

export const PrivateRoute = ({children}) => {
    const useAuth = useContext(AuthContext)
    console.log(children)
    const { authToken } = useAuth;
    const verifyTokenFormat = (token) => {
        const tokenArray = token?.split('.');
        console.log(tokenArray)
        if (tokenArray?.length !== 3) {
            return false;
        }
        return true;
    }
    const isTokenValid = verifyTokenFormat(authToken);
    console.log(isTokenValid)
    // const { authToken } = useAuth();
    
    

    return (
        <>
            {!(authToken && isTokenValid) ?  <Navigate to="/" />:children}
        
        
        </>
    )
};

export default PrivateRoute
