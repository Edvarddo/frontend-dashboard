import { Route, Navigate, Outlet } from 'react-router-dom';
// import  AuthContext  from './AuthContext';
// import { useContext } from 'react';
import useAuth from '../hooks/useAuth';

export const PrivateRoute = ({children}) => {
    const { authToken, isAdmin } = useAuth();
    // decode jwt token
    
    const verifyTokenFormat = (token) => {
        const tokenArray = token?.split('.');
        console.log(tokenArray)
        if (tokenArray?.length !== 3) {
            return false;
        }
        return true;
    }
    const isTokenValid = verifyTokenFormat(authToken);
    return (
        <>
            {!(authToken && isTokenValid) ?  <Navigate to="/login" />:<Outlet />}
        </>
    )
};

export default PrivateRoute
