import axios from "axios";
import { router } from "./router.js";

const api = axios.create({
  baseURL: "http://localhost:8000/",
});

// Interceptor para agregar el token a cada solicitud
api.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem("access");

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar token expirado
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {  // Si el token expiró
      const refreshToken = localStorage.getItem("refresh");
      if (!refreshToken) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        router.push("/login");  // Redirigir al login
        return Promise.reject(error);
      }

      try {
        const res = await axios.post("http://localhost:8000/token/refresh/", {
          refresh: refreshToken,
        });

        localStorage.setItem("access", res.data.access);
        api.defaults.headers.common["Authorization"] = `Bearer ${res.data.access}`;
        
        error.config.headers["Authorization"] = `Bearer ${res.data.access}`;
        console.log('hejsjs');
        
        return axios(error.config);
      } catch (refreshError) {
        console.error("Error al renovar el token");
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.dispatchEvent(new Event("auth-changed"));

        router.push("/login");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
