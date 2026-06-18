import { fetchWithAuth } from "./fetchWithAuth";
import { parseResponse } from "../utils/parseResponse";

export const addIssue = async (
    projectId: string, boardId: string, columnId: string,
    title: string, description: string, type: string, priority: string, dueDate?: string
) => {
    const res = await fetchWithAuth(`/api/project/board/issue/${projectId}/${boardId}/${columnId}/addIssue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, type, priority, ...(dueDate ? { dueDate } : {}) })
    });
    const data = await parseResponse(res);
    return data.data;
};

export const moveIssue = async (
    projectId: string, boardId: string, fromColumnId: string,
    toColumnId: string, issueId: string, toOrder: number
) => {
    const res = await fetchWithAuth(`/api/project/board/issue/${projectId}/${boardId}/${toColumnId}/${issueId}/changeColumn`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromColumnId, toOrder })
    });
    return await parseResponse(res);
};

export const assignIssue = async (projectId: string, issueId: string, assigneeId: string) => {
    const res = await fetchWithAuth(`/api/project/board/issue/${projectId}/${issueId}/${assigneeId}`, {
        method: "POST"
    });
    return await parseResponse(res);
};

export const editIssue = async (
    projectId: string, issueId: string,
    data: { title?: string; description?: string; priority?: string; dueDate?: string | null }
) => {
    const res = await fetchWithAuth(`/api/project/board/issue/${projectId}/${issueId}/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    const json = await parseResponse(res);
    return json.data;
};

export const deleteIssue = async (projectId: string, boardId: string, issueId: string) => {
    const res = await fetchWithAuth(`/api/project/board/issue/${projectId}/${boardId}/${issueId}`, {
        method: "DELETE"
    });
    return await parseResponse(res);
};

export const getIssueActivity = async (projectId: string, issueId: string) => {
    const res = await fetchWithAuth(`/api/project/board/issue/${projectId}/${issueId}/activity`, {
        method: "GET"
    });
    const json = await parseResponse(res);
    return json.data;
};
