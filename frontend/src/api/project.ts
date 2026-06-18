import { fetchWithAuth } from "./fetchWithAuth";
import { parseResponse } from "../utils/parseResponse";

export const getProjectMembers = async (projectId: string) => {
    const res = await fetchWithAuth(`/api/project/allMember/${projectId}`, { method: "GET" });
    const data = await parseResponse(res);
    return data.data;
};
