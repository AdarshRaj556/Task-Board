import { Response } from "express";

export type ApiResponse<T = unknown> = {success: boolean;message: string;data?: T;error?: any;};


export function handleSuccess<T>(res: Response,statusCode: number,message: string,data: T): Response<ApiResponse<T>> {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
}


export function handleError(res: Response,statusCode: number,message: string,error?: any): Response<ApiResponse<null>> {
    return res.status(statusCode).json({
        success: false,
        message,
        error: error ?? null,
    });
}