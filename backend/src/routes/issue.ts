import express from 'express'
import { userAuth } from '../middlewares/userAuth';
import { projectMemberAuth } from '../middlewares/projectMemberAuth';
import { addIssue, changeColumn, assignIssue, editIssue, deleteIssue, getIssueActivity } from '../controllers/issue.controller';
const issueRouter= express.Router();

issueRouter.post("/:projectId/:boardId/:columnId/addIssue", userAuth, projectMemberAuth, addIssue);

issueRouter.patch("/:projectId/:boardId/:toColumnId/:issueId/changeColumn", userAuth, projectMemberAuth, changeColumn);

issueRouter.post("/:projectId/:issueId/:assigneeId", userAuth, projectMemberAuth, assignIssue);

issueRouter.patch("/:projectId/:issueId/edit", userAuth, projectMemberAuth, editIssue);

issueRouter.delete("/:projectId/:boardId/:issueId", userAuth, projectMemberAuth, deleteIssue);

issueRouter.get("/:projectId/:issueId/activity", userAuth, projectMemberAuth, getIssueActivity);

export {issueRouter};
