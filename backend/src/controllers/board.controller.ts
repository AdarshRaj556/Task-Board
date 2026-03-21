import { Response } from "express";
import { AuthRequest } from "../types/authRequest";
import { createBoardService,addColumnService,deleteColumnService,renameColumnService } from "../services/board.services";

export const createBoard = async (req: AuthRequest, res: Response) => {
    try {
        const board = await createBoardService(
            req.params.projectId as string,
            req.body.name as string,
        );
        return res.status(201).json({
            message: "Board Created Successfully",
            data: board
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal Server Error"
        });

    }
};

export const addColumn= async (req:AuthRequest,res:Response)=>{
    try{
        const boardLastColumn= await addColumnService(
            req.params.boardId as string,
            req.body.name,
            req.body.wipLimit
        );
        return res.status(201).json({
            message:"Column added Successfully",
            data:boardLastColumn
        });
    }catch(err){
        return res.status(500).json({
            message: "Internal Server Error 1"
        });
    }
}

export const renameColumn = async (req:AuthRequest,res:Response)=>{
    try{
        const renameColumn= await renameColumnService(
            req.params.columnId as string,
            req.body.name,
        )
        return res.status(200).json({
            message:"Column Renamed Successfully",
            data:renameColumn
        })
    }catch(err){
        return res.status(500).json({
            message: "Internal Server Error 1"
        });
    }
}

export const deleteColumn = async (req:AuthRequest, res:Response)=>{
    try{
        const deleteColumn= await deleteColumnService(
            req.params.columnId as string,
            req.params.boardId as string,
        )
        return res.status(200).json({
            message: "Column deleted successfully",
            data:deleteColumn
        });
    }catch(err){
        return res.status(500).json({
            message: "Internal Server Error 1"
        });
    }
}