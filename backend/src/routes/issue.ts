import express from 'express'
import { userAuth } from '../middlewares/userAuth';
import { projectMemberAuth } from '../middlewares/projectMemberAuth';
import { addIssue,changeColumn ,assignIssue} from '../controllers/issue.controller';
const issueRouter= express.Router();


issueRouter.post("/:projectId/:boardId/:columnId/addIssue",userAuth,projectMemberAuth,addIssue);


issueRouter.patch("/:projectId/:boardId/:toColumnId/:issueId/changeColumn",userAuth,projectMemberAuth,changeColumn);

issueRouter.post("/:projectId/:issueId/:assineeId",userAuth,projectMemberAuth,assignIssue);







export {issueRouter};