import { fetchWithAuth } from "./fetchWithAuth";
import { parseResponse } from "../utils/parseResponse";

export const getNotifications = async () => {
    const res = await fetchWithAuth("/api/notifications", { method: "GET" });
    const json = await parseResponse(res);
    return json.data;
};

export const getUnreadCount = async (): Promise<number> => {
    const res = await fetchWithAuth("/api/notifications/unread-count", { method: "GET" });
    const json = await parseResponse(res);
    return json.data;
};

export const markAsRead = async (id: string) => {
    const res = await fetchWithAuth(`/api/notifications/${id}/read`, { method: "PATCH" });
    return await parseResponse(res);
};

export const markAllAsRead = async () => {
    const res = await fetchWithAuth("/api/notifications/read-all", { method: "PATCH" });
    return await parseResponse(res);
};
