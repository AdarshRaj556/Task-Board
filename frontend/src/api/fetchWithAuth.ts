import { refreshAccessToken } from "./auth";

export const fetchWithAuth = async (url: string,options: RequestInit = {}): Promise<Response> => {
  let res = await fetch(url, {
    ...options,
    credentials: "include"
  });
  if (res.status === 401) {
    await refreshAccessToken();
    res = await fetch(url, {
      ...options,
      credentials: "include"
    });
  }
  return res;
};