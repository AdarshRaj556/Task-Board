# TaskBoard

A full-stack project management application similar to Jira/Linear, built with **Node.js + Express + Prisma (MongoDB)** on the backend and **React + TypeScript + Vite** on the frontend.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, React Router v6, CSS Modules |
| Backend | Node.js, Express, TypeScript, ts-node, nodemon |
| Database | MongoDB Atlas (via Prisma ORM) |
| Auth | JWT (access token 15 min) + Refresh token (7 days), HTTP-only cookies |
| File Upload | Cloudinary (profile avatars via multer) |

---

## Project Structure

```
Assignment_cop2/
├── backend/
│   ├── src/
│   │   ├── controllers/     # board, issue, comment controllers
│   │   ├── middlewares/     # userAuth, adminAuth, projectAdminAuth, projectMemberAuth
│   │   ├── routes/          # auth, profile, admin, project, board, issue, comments, notification
│   │   ├── services/        # board, issue, comment business logic
│   │   ├── utils/           # auditLog, notification, sanitizeUser, miscellaneous
│   │   └── index.ts         # Express app entry point (port 8080)
│   ├── prisma/schema.prisma # MongoDB data models
│   └── .env                 # DATABASE_URL, JWT keys, Cloudinary config
└── frontend/
    ├── src/
    │   ├── api/             # auth, profile, admin, board, issue, comment, project, notification
    │   ├── components/      # addMember, createProjectForm, projectMetaData, roleOption
    │   ├── pages/
    │   │   ├── Login, Signup
    │   │   ├── profile/     # ProfileNavbar (with notification bell), ProfileBody
    │   │   ├── editProfile/ # ChangeName, ChangePassword, ChangeAvatar
    │   │   ├── project/     # ProjectPage (boards list + members)
    │   │   └── board/       # BoardPage (kanban + drag-and-drop), IssueModal
    │   ├── utils/           # auth, handleApi, handleLogout, parseResponse
    │   └── globalTypes.ts   # Shared Prisma-derived types
    └── vite.config.ts       # Proxy: /api → http://localhost:8080
```

---

## Data Models

| Model | Key Fields |
|---|---|
| **User** | email (unique), firstName, lastName, password (bcrypt), role (ADMIN \| USER), avatarUrl, refreshToken |
| **Project** | name (unique), description |
| **ProjectMember** | userId, projectId, role (GLOBAL_ADMIN \| PROJECT_ADMIN \| MEMBER \| PROJECT_VIEWER) |
| **Board** | name, projectId |
| **Column** | name, boardId, order, wipLimit, isFinal |
| **Issue** | title, description, type (TASK \| STORY \| BUG), priority (LOW \| MEDIUM \| HIGH \| CRITICAL), order, columnId, boardId, reporterId, assigneeId, dueDate |
| **Comment** | comment, issueId, userId — supports @email mentions |
| **AuditLog** | issueId, type (STATUS_CHANGED \| ASSIGNEE_CHANGED \| COMMENT_*), oldValue, newValue |
| **Notification** | userId, actorId, issueId, commentId, type, message, isRead |

---

## API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/signup` | Register new user |
| POST | `/login` | Login, sets JWT cookies |
| POST | `/refresh` | Refresh access token |
| POST | `/logout` | Clear cookies, invalidate refresh token |

### Profile
| Method | Endpoint | Description |
|---|---|---|
| GET | `/profile` | Get current user |
| PATCH | `/profile/edit` | Update name fields |
| PATCH | `/profile/password` | Change password |
| POST | `/profile/avatar` | Upload avatar (Cloudinary) |
| GET | `/profile/projects` | Get user's project memberships |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| POST | `/admin/createProject` | Create project (ADMIN only) |
| POST | `/admin/project/addMember/:projectId/:role` | Add members by email |
| PATCH | `/admin/assignRole/:projectId/:userId/:role` | Change member role |

### Board
| Method | Endpoint | Description |
|---|---|---|
| GET | `/project/board/boards/:projectId` | List boards for a project |
| GET | `/project/board/:projectId/:boardId` | Get board with columns & issues |
| POST | `/project/board/createBoard/:projectId` | Create board (project admin) |
| POST | `/project/board/column/:projectId/:boardId` | Add column |
| PATCH | `/project/board/column/:projectId/:columnId` | Rename column (double-click in UI) |
| DELETE | `/project/board/column/:projectId/:boardId/:columnId` | Delete column |

### Issues
| Method | Endpoint | Description |
|---|---|---|
| POST | `/project/board/issue/:projectId/:boardId/:columnId/addIssue` | Create issue |
| PATCH | `/project/board/issue/:projectId/:boardId/:toColumnId/:issueId/changeColumn` | Move issue (WIP enforced) |
| POST | `/project/board/issue/:projectId/:issueId/:assigneeId` | Assign issue |
| PATCH | `/project/board/issue/:projectId/:issueId/edit` | Edit title, description, priority, dueDate |
| DELETE | `/project/board/issue/:projectId/:boardId/:issueId` | Delete issue |
| GET | `/project/board/issue/:projectId/:issueId/activity` | Get audit trail for issue |

### Comments
| Method | Endpoint | Description |
|---|---|---|
| GET | `/project/board/comment/:projectId/:boardId/:issueId/comments` | Get comments |
| POST | `/project/board/comment/:projectId/:boardId/:issueId/comments` | Post comment (@mention support) |
| PATCH | `/project/board/comment/:projectId/:boardId/:issueId/:commentId` | Edit own comment |
| DELETE | `/project/board/comment/:projectId/:boardId/:issueId/:commentId` | Delete own comment |

### Notifications
| Method | Endpoint | Description |
|---|---|---|
| GET | `/notifications` | Get user's notifications (last 50) |
| GET | `/notifications/unread-count` | Get unread count |
| PATCH | `/notifications/read-all` | Mark all as read |
| PATCH | `/notifications/:id/read` | Mark one as read |

### Project
| Method | Endpoint | Description |
|---|---|---|
| GET | `/project/allMember/:projectId` | List project members |
| PATCH | `/project/update/:projectId` | Update project name/description |

---

## Frontend Pages

| Route | Page | Description |
|---|---|---|
| `/` | Login | Email + password login |
| `/signup` | Signup | Register with name, email, password |
| `/profile` | Profile | Sidebar project list + project cards grid. Navbar search + notification bell. |
| `/profile/editProfile` | Edit Profile | Change name, password, or avatar photo |
| `/project/:projectId` | Project Page | List of boards, create board (admin), members list |
| `/project/:id/board/:id` | Board Page | Kanban board — drag-and-drop issues between columns, add/rename/delete columns |

---

## Role System

| Role | Scope | Permissions |
|---|---|---|
| ADMIN | Global | Create projects, manage all users |
| USER | Global | Can be added to projects by admins |
| GLOBAL_ADMIN | Project | Full project control (boards, columns, members) |
| PROJECT_ADMIN | Project | Manage boards and columns, add members |
| MEMBER | Project | Create/edit/delete issues, post/edit/delete own comments |
| PROJECT_VIEWER | Project | Read-only access |

---

## Key Features

- **JWT Auth** — 15-min access tokens refreshed automatically on 401 responses
- **Kanban board** — drag-and-drop issues between columns using native HTML5 Drag and Drop API
- **WIP limits enforced** — moves to full columns are blocked server-side with a clear error message
- **Issue management** — create, edit (title/description/priority/due date), delete issues
- **Issue modal** — Details tab (assign, move, edit, delete) + Activity tab (full audit timeline)
- **Comments** — post, edit own, delete own; @email mention support triggers notifications
- **Notification center** — bell icon in navbar, unread badge, mark-as-read, polls every 30s
- **Audit log** — every status change, assignee change, and comment stored and viewable per issue
- **Avatar upload** — profile photos on Cloudinary; DiceBear initials avatar as fallback
- **Project search** — real-time search filters sidebar and cards grid

---

## Running Locally

### Prerequisites
- Node.js 18+
- MongoDB Atlas cluster

### Backend
```bash
cd backend
npm install
npm start          # ts-node on port 8080, hot-reload via nodemon
```

### Frontend
```bash
cd frontend
npm install
npm run dev        # Vite dev server on http://localhost:5173
                   # Proxies /api/* → http://localhost:8080
```

### Environment Variables (`backend/.env`)
```env
DATABASE_URL="mongodb+srv://..."
JWT_SECRET_KEYS="your-secret"
JWT_REFRESH_KEYS="your-refresh-secret"
CLOUDINARY_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
```
