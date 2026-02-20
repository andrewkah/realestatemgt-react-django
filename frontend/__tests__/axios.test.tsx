import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

// Hoist mocks before imports
const mockDayjs = vi.hoisted(() => vi.fn());
const mockDayjsUnix = vi.hoisted(() => vi.fn());
const mockJwtDecode = vi.hoisted(() => vi.fn());

// Mock dependencies
vi.mock("jwt-decode", () => ({
  jwtDecode: mockJwtDecode,
}));

// Mock dayjs properly
vi.mock("dayjs", () => ({
  default: Object.assign(mockDayjs, {
    unix: mockDayjsUnix,
  }),
}));

import dayjs from "dayjs";
import { jwtDecode } from "jwt-decode";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("Axios Instance with Interceptors", () => {
  let mockAxios: MockAdapter;
  let setAuthTokens: ReturnType<typeof vi.fn>;
  let setUser: ReturnType<typeof vi.fn>;
  let authTokens: { access: string; refresh: string } | null;
  let axiosInstance: any;

  const BASE_URL = "http://localhost:8000";
  const validAccessToken = "valid.access.token";
  const validRefreshToken = "valid.refresh.token";
  const expiredAccessToken = "expired.access.token";

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    localStorageMock.clear();

    // Reset dayjs mocks
    mockDayjs.mockReturnValue({
      unix: vi.fn().mockReturnValue(Math.floor(Date.now() / 1000)),
    } as any);
    mockDayjsUnix.mockReturnValue({
      diff: vi.fn().mockReturnValue(3600000), // Default: 1 hour from now
    } as any);

    // Setup mock functions
    setAuthTokens = vi.fn((tokens) => {
      authTokens = tokens;
    });
    setUser = vi.fn();

    // Initialize with valid tokens
    authTokens = {
      access: validAccessToken,
      refresh: validRefreshToken,
    };

    // Setup axios mock
    mockAxios = new MockAdapter(axios);

    // Create axios instance with interceptors
    axiosInstance = axios.create({
      baseURL: BASE_URL,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authTokens?.access}`,
      },
    });

    // Setup request interceptor
    axiosInstance.interceptors.request.use(async (req: any) => {
      if (!authTokens?.access) {
        return req;
      }

      try {
        const user: any = jwtDecode(authTokens.access);
        if (user.exp) {
          const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1;

          if (!isExpired) {
            return req;
          }
        } else {
          return req;
        }

        if (!authTokens.refresh) {
          setAuthTokens(null);
          setUser(null);
          localStorage.removeItem("authTokens");
          return Promise.reject(new Error("No refresh token"));
        }

        const response = await axios.post(`${BASE_URL}/auth/token/refresh/`, {
          refresh: authTokens.refresh,
        });

        localStorage.setItem("authTokens", JSON.stringify(response.data));
        setAuthTokens(response.data);
        setUser(jwtDecode(response.data.access));
        req.headers["Authorization"] = `Bearer ${response.data.access}`;
        return req;
      } catch (error) {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem("authTokens");
        return Promise.reject(error);
      }
    });

    // Setup response interceptor
    axiosInstance.interceptors.response.use(
      (response: any) => response,
      async (error: any) => {
        const prevRequest = error?.config;
        if (error?.response?.status === 401 && !prevRequest?._retry) {
          prevRequest._retry = true;
          if (authTokens?.refresh) {
            try {
              const response = await axios.post(
                `${BASE_URL}/auth/token/refresh/`,
                {
                  refresh: authTokens.refresh,
                }
              );
              localStorage.setItem("authTokens", JSON.stringify(response.data));
              setAuthTokens(response.data);
              setUser(jwtDecode(response.data.access));
              prevRequest.headers[
                "Authorization"
              ] = `Bearer ${response.data.access}`;
              return axiosInstance(prevRequest);
            } catch (refreshError) {
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
  });

  afterEach(() => {
    mockAxios.reset();
  });

  describe("Request Interceptor", () => {
    it("should proceed with request when token is valid", async () => {
      // Mock valid token
      const futureTimestamp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const mockDecodedToken = { exp: futureTimestamp };
      vi.mocked(jwtDecode).mockReturnValue(mockDecodedToken);

      mockDayjs.mockReturnValue({
        unix: vi.fn().mockReturnValue(Math.floor(Date.now() / 1000)),
      } as any);

      mockDayjsUnix.mockReturnValue({
        diff: vi.fn().mockReturnValue(3600000), // 1 hour in milliseconds (positive = not expired)
      } as any);

      mockAxios.onGet("/test").reply(200, { data: "success" });

      const response = await axiosInstance.get("/test");

      expect(response.status).toBe(200);
      expect(setAuthTokens).not.toHaveBeenCalled();
      expect(setUser).not.toHaveBeenCalled();
    });

    it("should refresh token when access token is expired", async () => {
      // Mock expired token
      const pastTimestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const mockDecodedToken = { exp: pastTimestamp };
      vi.mocked(jwtDecode).mockReturnValue(mockDecodedToken);

      mockDayjs.mockReturnValue({
        unix: vi.fn().mockReturnValue(Math.floor(Date.now() / 1000)),
      } as any);

      mockDayjsUnix.mockReturnValue({
        diff: vi.fn().mockReturnValue(0), // Expired (diff < 1)
      } as any);

      // Mock refresh token response
      const newTokens = {
        access: "new.access.token",
        refresh: "new.refresh.token",
      };
      mockAxios.onPost(`${BASE_URL}/auth/token/refresh/`).reply(200, newTokens);
      mockAxios.onGet("/test").reply(200, { data: "success" });

      await axiosInstance.get("/test");

      expect(setAuthTokens).toHaveBeenCalledWith(newTokens);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "authTokens",
        JSON.stringify(newTokens)
      );
      expect(setUser).toHaveBeenCalled();
    });

    it("should proceed with request when no access token exists", async () => {
      authTokens = null;
      axiosInstance.defaults.headers["Authorization"] = "";

      mockAxios.onGet("/test").reply(200, { data: "success" });

      const response = await axiosInstance.get("/test");

      expect(response.status).toBe(200);
      expect(jwtDecode).not.toHaveBeenCalled();
    });

    it("should clear tokens when no refresh token is available and access token is expired", async () => {
      authTokens = { access: expiredAccessToken, refresh: "" };

      const pastTimestamp = Math.floor(Date.now() / 1000) - 3600;
      const mockDecodedToken = { exp: pastTimestamp };
      vi.mocked(jwtDecode).mockReturnValue(mockDecodedToken);

      mockDayjs.mockReturnValue({
        unix: vi.fn().mockReturnValue(Math.floor(Date.now() / 1000)),
      } as any);

      mockDayjsUnix.mockReturnValue({
        diff: vi.fn().mockReturnValue(0),
      } as any);

      mockAxios.onGet("/test").reply(200, { data: "success" });

      await expect(axiosInstance.get("/test")).rejects.toThrow(
        "No refresh token"
      );

      expect(setAuthTokens).toHaveBeenCalledWith(null);
      expect(setUser).toHaveBeenCalledWith(null);
      expect(localStorage.removeItem).toHaveBeenCalledWith("authTokens");
    });

    it("should proceed when token has no exp field", async () => {
      const mockDecodedToken = {}; // No exp field
      vi.mocked(jwtDecode).mockReturnValue(mockDecodedToken);

      mockAxios.onGet("/test").reply(200, { data: "success" });

      const response = await axiosInstance.get("/test");

      expect(response.status).toBe(200);
      expect(setAuthTokens).not.toHaveBeenCalled();
    });

    it("should clear tokens when token refresh fails", async () => {
      const pastTimestamp = Math.floor(Date.now() / 1000) - 3600;
      const mockDecodedToken = { exp: pastTimestamp };
      vi.mocked(jwtDecode).mockReturnValue(mockDecodedToken);

      mockDayjs.mockReturnValue({
        unix: vi.fn().mockReturnValue(Math.floor(Date.now() / 1000)),
      } as any);

      mockDayjsUnix.mockReturnValue({
        diff: vi.fn().mockReturnValue(0),
      } as any);

      mockAxios.onPost(`${BASE_URL}/auth/token/refresh/`).reply(400, {
        error: "Invalid refresh token",
      });

      await expect(axiosInstance.get("/test")).rejects.toBeTruthy();

      expect(setAuthTokens).toHaveBeenCalledWith(null);
      expect(setUser).toHaveBeenCalledWith(null);
      expect(localStorage.removeItem).toHaveBeenCalledWith("authTokens");
    });
  });

  describe("Response Interceptor", () => {
    it("should return response for successful requests", async () => {
      mockAxios.onGet("/test").reply(200, { data: "success" });

      const response = await axiosInstance.get("/test");

      expect(response.status).toBe(200);
      expect(response.data).toEqual({ data: "success" });
    });

    it("should refresh token and retry on 401 error", async () => {
      const newTokens = {
        access: "new.access.token",
        refresh: "new.refresh.token",
      };

      // First request fails with 401
      mockAxios
        .onGet("/test")
        .replyOnce(401)
        .onGet("/test")
        .replyOnce(200, { data: "success" });

      mockAxios.onPost(`${BASE_URL}/auth/token/refresh/`).reply(200, newTokens);

      const response = await axiosInstance.get("/test");

      expect(response.status).toBe(200);
      expect(setAuthTokens).toHaveBeenCalledWith(newTokens);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "authTokens",
        JSON.stringify(newTokens)
      );
      expect(setUser).toHaveBeenCalled();
    });

    it("should not retry 401 error more than once", async () => {
      mockAxios
        .onGet("/test")
        .reply(401)
        .onPost(`${BASE_URL}/auth/token/refresh/`)
        .reply(200, {
          access: "new.access.token",
          refresh: "new.refresh.token",
        });

      try {
        await axiosInstance.get("/test");
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        expect(error.config._retry).toBe(true);
      }
    });

    it("should clear tokens when refresh fails on 401", async () => {
      mockAxios
        .onGet("/test")
        .reply(401)
        .onPost(`${BASE_URL}/auth/token/refresh/`)
        .reply(400, { error: "Invalid refresh token" });

      await expect(axiosInstance.get("/test")).rejects.toBeTruthy();

      expect(setAuthTokens).toHaveBeenCalledWith(null);
      expect(setUser).toHaveBeenCalledWith(null);
      expect(localStorage.removeItem).toHaveBeenCalledWith("authTokens");
    });

    it("should reject error for non-401 status codes", async () => {
      mockAxios.onGet("/test").reply(500, { error: "Server error" });

      await expect(axiosInstance.get("/test")).rejects.toBeTruthy();

      expect(setAuthTokens).not.toHaveBeenCalled();
    });

    it("should not attempt refresh when no refresh token exists on 401", async () => {
      authTokens = { access: validAccessToken, refresh: "" };
      mockAxios.onGet("/test").reply(401);

      await expect(axiosInstance.get("/test")).rejects.toBeTruthy();

      expect(mockAxios.history.post.length).toBe(0);
    });
  });
});