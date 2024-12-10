import { axiosPrivate } from "../api/axios";
import { useEffect } from "react";
import useAuth from "./useAuth";

const useAxiosPrivate = () => {
    const { authToken, isTokenExpired, setIsTokenExpired } = useAuth();

    useEffect(() => {
        const responseIntercept = axiosPrivate.interceptors.response.use(
            response => response,
            error => {
                if (error.response.status === 401) {
                    console.log('Unauthorized');
                    console.log(error.config)
                    setIsTokenExpired(true);
                }
                return Promise.reject(error);
            }
        );

        const requestIntercept = axiosPrivate.interceptors.request.use(
            config => {
                if (!config.headers['Authorization']) {
                    config.headers['Authorization'] = `Bearer ${authToken}`;
                }
                return config;
            }, (error) => Promise.reject(error)
        );

        return () => {
            axiosPrivate.interceptors.request.eject(requestIntercept);
            axiosPrivate.interceptors.response.eject(responseIntercept);
        }
    }, [authToken]);

    return axiosPrivate;
};

export default useAxiosPrivate;