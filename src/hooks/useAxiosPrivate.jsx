import { axiosPrivate } from "../api/axios";
import { useEffect } from "react";
import useAuth from "./useAuth";
import useRefreshToken from "@/contexts/useRefreshToken";

const useAxiosPrivate = () => {
    const { authToken, isTokenExpired, setIsTokenExpired } = useAuth();
    const refreh  = useRefreshToken();
    useEffect(() => {
        const responseIntercept = axiosPrivate.interceptors.response.use(
            response => response,
            async (error) => {
                const originalRequest = error?.config;
                if (error?.response?.status === 401 && !originalRequest?.sent) {
                    originalRequest.sent = true;
                    const newAccessToken = await refreh();
                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    console.log('New access token: ', newAccessToken);
                    // console.log('Unauthorized');
                    // console.log(error.config)
                    // setIsTokenExpired(true);
                    return axiosPrivate(originalRequest);
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