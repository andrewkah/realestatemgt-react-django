"use client";
import { jwtDecode } from "jwt-decode";
import axios, { type AxiosInstance } from "axios";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import dayjs from "dayjs";
import type { JwtPayload } from "../types";

// call the base url from the env file.
const BASE_URL = process.env.BACKEND_BASE_URL || "http://localhost:8000/apps";


const useAxios = (): AxiosInstance => {
  const { authTokens, setUser, setAuthTokens } = useContext(AuthContext);
  const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${authTokens?.access}`,
    },
  });
  axiosInstance.interceptors.request.use(async (req) => {
    // If no tokens, skip refresh logic
    if (!authTokens?.access) {
      return req;
    }

    try {
      const user = jwtDecode<JwtPayload>(authTokens.access);

      if (user.exp) {
        const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1;
        console.log("Token expired?", isExpired);

        if (!isExpired) {
          // Token is still valid, proceed with request
          return req;
        }
      } else {
        console.log("No exp field found in token");
        return req;
      }

      // Token is expired, attempt to refresh
      if (!authTokens.refresh) {
        console.log("No refresh token available");
        // Clear tokens and redirect to login
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem("authTokens");
        return Promise.reject(new Error("No refresh token"));
      }

      console.log("Refreshing token...");
      const response = await axios.post(`${BASE_URL}/token/refresh/`, {
        refresh: authTokens.refresh,
      });

      // Update tokens
      localStorage.setItem("authTokens", JSON.stringify(response.data));
      setAuthTokens(response.data);
      setUser(jwtDecode(response.data.access));
      req.headers["Authorization"] = `Bearer ${response.data.access}`;

      return req;
    } catch (error) {
      console.error("Error in request interceptor:", error);
      // Clear tokens on error
      setAuthTokens(null);
      setUser(null);
      localStorage.removeItem("authTokens");
      return Promise.reject(error);
    }
  });
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const prevRequest = error?.config;

      if (error?.response?.status === 401 && !prevRequest?._retry) {
        prevRequest._retry = true;

        if (authTokens?.refresh) {
          try {
            const response = await axios.post(`${BASE_URL}/token/refresh/`, {
              refresh: authTokens.refresh,
            });

            localStorage.setItem("authTokens", JSON.stringify(response.data));
            setAuthTokens(response.data);
            setUser(jwtDecode(response.data.access));

            prevRequest.headers[
              "Authorization"
            ] = `Bearer ${response.data.access}`;
            return axiosInstance(prevRequest);
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            setAuthTokens(null);
            setUser(null);
            localStorage.removeItem("authTokens");
            return Promise.reject(refreshError);
          }
        }
      }

      return Promise.reject(error);
    }
  );
  //   axiosInstance.interceptors.response.use(
  //     (response) => {
  //       return response;
  //     },
  //     async (error) => {
  //       const prevRequest = error?.config;
  //       if (error?.response?.status === 401 && !prevRequest?.sent) {
  //         prevRequest.sent = true;
  //         const newAccessToken = await axios.post(`${BASE_URL}/token/refresh/`, {
  //           refresh: localStorage.getItem("refresh"),
  //         });
  //         prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
  //         return axiosInstance(prevRequest);
  //       }
  //       return Promise.reject(error);
  //     }
  //   );
  return axiosInstance;
};

export default useAxios;
