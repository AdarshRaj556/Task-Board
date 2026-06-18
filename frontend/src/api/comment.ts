import { fetchWithAuth } from "./fetchWithAuth";
import { parseResponse } from "../utils/parseResponse";

export const getComments = async (projectId: string, boardId: string, issueId: string) => {
    const res = await fetchWithAuth(`/api/project/board/comment/${projectId}/${boardId}/${issueId}/comments`, {
        method: "GET"
    });
    const data = await parseResponse(res);
    return data.data;
};

export const postComment = async (projectId: string, boardId: string, issueId: string, comment: string) => {
    const res = await fetchWithAuth(`/api/project/board/comment/${projectId}/${boardId}/${issueId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment })
    });
    return await parseResponse(res);
};

export const editComment = async (projectId: string, boardId: string, issueId: string, commentId: string, comment: string) => {
    const res = await fetchWithAuth(`/api/project/board/comment/${projectId}/${boardId}/${issueId}/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment })
    });
    const json = await parseResponse(res);
    return json.data;
};

export const deleteComment = async (projectId: string, boardId: string, issueId: string, commentId: string) => {
    const res = await fetchWithAuth(`/api/project/board/comment/${projectId}/${boardId}/${issueId}/${commentId}`, {
        method: "DELETE"
    });
    return await parseResponse(res);
};
