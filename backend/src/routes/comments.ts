import express from 'express'
import { userAuth } from '../middlewares/userAuth';
import { projectMemberAuth } from '../middlewares/projectMemberAuth';
import { postComment } from '../controllers/comment.controller';

const commentRouter= express.Router();

commentRouter.post("/:boardId/:issueId/comments",userAuth,projectMemberAuth,postComment);




export {commentRouter}