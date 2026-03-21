import express from 'express'
import { userAuth } from '../middlewares/userAuth';
import { createBoard,addColumn,deleteColumn, renameColumn } from '../controllers/board.controller';
import { projectAdminAuth } from '../middlewares/projectAdminAuth';
const boardRouter= express.Router();


boardRouter.post("/createBoard/:projectId",userAuth, projectAdminAuth,createBoard)  

boardRouter.post("/column/:projectId/:boardId",userAuth,projectAdminAuth,addColumn);

boardRouter.patch("/column/:projectId/:columnId",userAuth,projectAdminAuth,renameColumn)

boardRouter.delete("/column/:projectId/:boardId/:columnId",userAuth,projectAdminAuth,deleteColumn)

export {boardRouter}