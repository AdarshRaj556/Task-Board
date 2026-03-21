import type { ProjectRole, GlobalRole } from "../../backend/generated/prisma/enums"

import type {
  User,
  Project,
  ProjectMember,
  Prisma
} from "../../backend/generated/prisma/client"

export type { ProjectMember, User, Project, ProjectRole, GlobalRole }

export type UserWithMemberships = Prisma.UserGetPayload<{
  include: { memberships: true }
}>

export type ProjectWithMembers = Prisma.ProjectGetPayload<{
  include: { memberships: true }
}>

export type ProjectMemberFull = Prisma.ProjectMemberGetPayload<{
  include: {
    user: true
    project: true
  }
}>