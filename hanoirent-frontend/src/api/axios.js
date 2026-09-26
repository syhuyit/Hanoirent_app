import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api", // Địa chỉ Backend Spring Boot
  headers: {
    "Content-Type": "application/json",
  },
});
// Tự động chèn JWT token vào Header của mọi request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
export default API;
