import { fetchWithAuth } from "./fetchWithAuth";
import { parseResponse } from "../utils/parseResponse";
export const getUserProfile = async () => {
  const res = await fetchWithAuth("/api/profile", {
    method: "GET"
  });
  const data=await parseResponse(res);
  return data.user;
};

export const getUserProject = async () => {
  const res = await fetchWithAuth("/api/profile/projects", {
    method: "GET"
  });
  const data=await parseResponse(res);
  return data.data;
};

export const editProfile = async (firstName: string,middleName: string,lastName: string) => {
  const res = await fetchWithAuth("/api/profile/edit", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      firstName,
      middleName,
      lastName
    })
  });
  const data=await parseResponse(res);
  return data;
};


export const editPassword = async (oldPassword: string,newPassword: string) => {
  const res = await fetchWithAuth("/api/profile/editPassword", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      oldPassword,
      newPassword
    })
  });
  const data=await parseResponse(res);
  return data;
};


export const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append("avatar", file);
  const res = await fetchWithAuth("/api/profile/avatar", {
    method: "POST",
    body: formData
  });
  const data=await parseResponse(res);
  return data;
};

export const logout = async () => {
  const res = await fetchWithAuth("/api/logout", {
    method: "POST"
  });
  const data=await parseResponse(res);
  return data;
};