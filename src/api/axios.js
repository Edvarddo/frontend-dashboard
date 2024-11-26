import axios from 'axios';
export const BASE_URL = import.meta.env.VITE_URL_PROD_VERCEL;

export default axios.create({
  baseURL: BASE_URL,
});

export const axiosPrivate = axios.create({
  baseURL: BASE_URL,
});
