import axiosInstance from "@/lib/axios";

export type LoginResponse = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: "admin" | "manager" | "client";
    name: string;
    forcePasswordChange: boolean;
  };
};

export type RefreshResponse = {
  accessToken: string;
};

export type UpdateProfileResponse = {
  user: {
    id: string;
    email: string;
    role: string;
    name: string;
    forcePasswordChange: boolean;
  };
};

export type CreateManagerResponse = {
  manager: {
    id: string;
    email: string;
  };
  credentials: {
    email: string;
    password: string;
  };
};

export type CreateClientResponse = {
  client?: {
    id?: string;
    _id?: string;
    /** Public slug for routes, e.g. `cli_…` */
    clientId?: string;
    email: string;
    name?: string;
  };
  credentials?: {
    email: string;
    password: string;
  };
};

export type ListClientsResponse = {
  clients?: Array<{
    _id?: string;
    id?: string;
    /** Public client id for URLs (`/dashboard/:clientId`), preferred over Mongo `_id` */
    clientId?: string;
    email: string;
    name?: string;
    isActive?: boolean;
    createdAt?: string;
  }>;
};

export const authApi = {
  login(email: string, password: string) {
    return axiosInstance.post<never, LoginResponse>("/api/auth/login", {
      email,
      password,
    });
  },
  refresh() {
    return axiosInstance.post<never, RefreshResponse>("/api/auth/refresh", {});
  },
  changePassword(currentPassword: string, newPassword: string) {
    return axiosInstance.post("/api/auth/change-password", {
      currentPassword,
      newPassword,
    });
  },
  updateProfile(name: string) {
    return axiosInstance.patch<never, UpdateProfileResponse>("/api/auth/profile", {
      name,
    });
  },
  logout() {
    return axiosInstance.post("/api/auth/logout", {});
  },
};

export const adminApi = {
  createManager(email?: string) {
    const payload = email && email.trim() ? { email: email.trim() } : {};
    return axiosInstance.post<never, CreateManagerResponse>("/api/admin/managers", payload);
  },
  listManagers() {
    return axiosInstance.get<never, { managers: Array<{ id: string; email: string; isActive: boolean; createdAt: string; clientsCount: number }> }>("/api/admin/managers");
  },
  toggleManager(id: string, isActive: boolean) {
    return axiosInstance.patch(`/api/admin/managers/${id}`, { isActive });
  },
  deleteManager(id: string) {
    return axiosInstance.delete(`/api/admin/managers/${id}`);
  },
};

export const managerApi = {
  createClient(email: string, name: string) {
    return axiosInstance.post<never, CreateClientResponse>("/api/manager/clients", { email, name });
  },
  listClients() {
    return axiosInstance.get<never, ListClientsResponse>("/api/manager/clients");
  },
  getClient(clientId: string) {
    return axiosInstance.get(`/api/manager/clients/${clientId}`);
  },
  toggleClient(clientId: string, isActive: boolean) {
    return axiosInstance.patch(`/api/manager/clients/${clientId}`, { isActive });
  },
  createReport(clientId: string, payload: unknown) {
    return axiosInstance.post(`/api/manager/clients/${clientId}/reports`, payload);
  },
  listReports(clientId: string) {
    return axiosInstance.get(`/api/manager/clients/${clientId}/reports`);
  },
  updateReport(clientId: string, reportId: string, payload: unknown) {
    return axiosInstance.patch(
      `/api/manager/clients/${clientId}/reports/${reportId}`,
      payload,
    );
  },
  deleteReport(clientId: string, reportId: string) {
    return axiosInstance.delete(
      `/api/manager/clients/${clientId}/reports/${reportId}`,
    );
  },
};

export const clientApi = {
  listReports() {
    return axiosInstance.get("/api/client/reports");
  },
  getReport(reportId: string) {
    return axiosInstance.get(`/api/client/reports/${reportId}`);
  },
};
