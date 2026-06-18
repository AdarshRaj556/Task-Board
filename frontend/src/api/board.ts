import { fetchWithAuth } from "./fetchWithAuth";
import { parseResponse } from "../utils/parseResponse";

export const getBoards = async (projectId: string) => {
    const res = await fetchWithAuth(`/api/project/board/boards/${projectId}`, { method: "GET" });
    const data = await parseResponse(res);
    return data.data;
};

export const getBoard = async (projectId: string, boardId: string) => {
    const res = await fetchWithAuth(`/api/project/board/${projectId}/${boardId}`, { method: "GET" });
    const data = await parseResponse(res);
    return data.data;
};

export const createBoard = async (projectId: string, name: string) => {
    const res = await fetchWithAuth(`/api/project/board/createBoard/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
    });
    const data = await parseResponse(res);
    return data.data;
};

export const addColumn = async (projectId: string, boardId: string, name: string, wipLimit: number) => {
    const res = await fetchWithAuth(`/api/project/board/column/${projectId}/${boardId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, wipLimit })
    });
    const data = await parseResponse(res);
    return data.data;
};

export const renameColumn = async (projectId: string, columnId: string, name: string) => {
    const res = await fetchWithAuth(`/api/project/board/column/${projectId}/${columnId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
    });
    const data = await parseResponse(res);
    return data.data;
};

export const deleteColumn = async (projectId: string, boardId: string, columnId: string) => {
    const res = await fetchWithAuth(`/api/project/board/column/${projectId}/${boardId}/${columnId}`, {
        method: "DELETE"
    });
    return await parseResponse(res);
};
