import "dotenv/config";
import { PrismaClient, IssueType, PriorityType } from "./generated/prisma/client";

const prisma = new PrismaClient();

const USER_ID = "6a289a5de709bd9335408cd1";

async function main() {
  // 1. Make the user a global ADMIN
  await prisma.user.update({
    where: { id: USER_ID },
    data: { role: "ADMIN" }
  });
  console.log("✓ User promoted to ADMIN");

  // 2. Create two projects
  const project1 = await prisma.project.upsert({
    where: { name: "Phoenix App" },
    update: {},
    create: { name: "Phoenix App", description: "Rebuild the company's customer-facing web app with modern stack." }
  });
  const project2 = await prisma.project.upsert({
    where: { name: "Data Pipeline" },
    update: {},
    create: { name: "Data Pipeline", description: "ETL pipeline to ingest and transform sales data into the warehouse." }
  });
  console.log("✓ Projects created");

  // 3. Add user as GLOBAL_ADMIN to both projects
  for (const project of [project1, project2]) {
    await prisma.projectMember.upsert({
      where: { userId_projectId: { userId: USER_ID, projectId: project.id } },
      update: {},
      create: { userId: USER_ID, projectId: project.id, role: "GLOBAL_ADMIN" }
    });
  }
  console.log("✓ User added as GLOBAL_ADMIN to projects");

  // 4. Create a board for each project with default columns
  const board1 = await prisma.board.create({
    data: {
      name: "Sprint 1",
      projectId: project1.id,
      columns: {
        create: [
          { name: "To Do",      order: 1, wipLimit: 20, isFinal: false },
          { name: "In Progress",order: 2, wipLimit: 5,  isFinal: false },
          { name: "Review",     order: 3, wipLimit: 3,  isFinal: false },
          { name: "Done",       order: 4, wipLimit: 100,isFinal: true  }
        ]
      }
    },
    include: { columns: { orderBy: { order: "asc" } } }
  });

  const board2 = await prisma.board.create({
    data: {
      name: "Pipeline v1",
      projectId: project2.id,
      columns: {
        create: [
          { name: "Backlog",    order: 1, wipLimit: 50, isFinal: false },
          { name: "In Progress",order: 2, wipLimit: 4,  isFinal: false },
          { name: "Testing",   order: 3, wipLimit: 4,  isFinal: false },
          { name: "Released",  order: 4, wipLimit: 100,isFinal: true  }
        ]
      }
    },
    include: { columns: { orderBy: { order: "asc" } } }
  });
  console.log("✓ Boards created");

  // 5. Seed issues into board1
  const [todo, inprog, review, done] = board1.columns;

  const issuesBoard1 = [
    { columnId: todo.id,   title: "Set up authentication module",  description: "Implement JWT-based login and signup with refresh tokens.", type: IssueType.TASK,  priority: PriorityType.HIGH,     order: 1 },
    { columnId: todo.id,   title: "Design landing page mockup",    description: "Create Figma wireframes for the new landing page.",         type: IssueType.STORY, priority: PriorityType.MEDIUM,   order: 2 },
    { columnId: todo.id,   title: "Write API documentation",       description: "Document all REST endpoints using OpenAPI 3.0.",             type: IssueType.TASK,  priority: PriorityType.LOW,      order: 3 },
    { columnId: inprog.id, title: "Fix login redirect bug",        description: "After login, users are redirected to /home instead of /dashboard.", type: IssueType.BUG, priority: PriorityType.CRITICAL, order: 1 },
    { columnId: inprog.id, title: "Build project board UI",        description: "Implement the kanban board with drag-and-drop support.",    type: IssueType.STORY, priority: PriorityType.HIGH,     order: 2 },
    { columnId: review.id, title: "Add avatar upload feature",     description: "Allow users to upload a profile photo via Cloudinary.",     type: IssueType.TASK,  priority: PriorityType.MEDIUM,   order: 1 },
    { columnId: review.id, title: "Rate limiting on auth routes",  description: "Prevent brute-force attacks by adding rate limiting.",      type: IssueType.TASK,  priority: PriorityType.HIGH,     order: 2 },
    { columnId: done.id,   title: "Project scaffolding",           description: "Bootstrap the monorepo with backend and frontend.",         type: IssueType.TASK,  priority: PriorityType.LOW,      order: 1 },
    { columnId: done.id,   title: "Database schema design",        description: "Finalize Prisma schema with all models and relations.",      type: IssueType.TASK,  priority: PriorityType.HIGH,     order: 2 },
  ];

  for (const issue of issuesBoard1) {
    await prisma.issue.create({
      data: {
        boardId: board1.id,
        reporterId: USER_ID,
        dueDate: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000),
        ...issue
      }
    });
  }
  console.log("✓ Issues seeded for board1");

  // 6. Seed issues into board2
  const [backlog, inprog2, testing, released] = board2.columns;

  const issuesBoard2 = [
    { columnId: backlog.id,  title: "Define data source connectors",   description: "Map all upstream data sources: Salesforce, Postgres, S3.", type: IssueType.STORY, priority: PriorityType.HIGH,     order: 1 },
    { columnId: backlog.id,  title: "Schema migration scripts",        description: "Write idempotent SQL migration scripts for warehouse.",    type: IssueType.TASK,  priority: PriorityType.MEDIUM,   order: 2 },
    { columnId: inprog2.id,  title: "Build Salesforce ingestion job",  description: "Pull daily delta from Salesforce REST API into staging.",  type: IssueType.TASK,  priority: PriorityType.HIGH,     order: 1 },
    { columnId: inprog2.id,  title: "Null handling in transform layer",description: "Fix NullPointerException when revenue field is missing.",  type: IssueType.BUG,   priority: PriorityType.CRITICAL, order: 2 },
    { columnId: testing.id,  title: "Integration tests for ETL jobs",  description: "Write pytest tests covering happy path and edge cases.",   type: IssueType.TASK,  priority: PriorityType.MEDIUM,   order: 1 },
    { columnId: released.id, title: "Set up Airflow DAG skeleton",     description: "Initial DAG structure with task dependencies defined.",    type: IssueType.TASK,  priority: PriorityType.LOW,      order: 1 },
  ];

  for (const issue of issuesBoard2) {
    await prisma.issue.create({
      data: {
        boardId: board2.id,
        reporterId: USER_ID,
        dueDate: new Date(Date.now() + Math.random() * 21 * 24 * 60 * 60 * 1000),
        ...issue
      }
    });
  }
  console.log("✓ Issues seeded for board2");

  // 7. Add a couple of comments on the first issue
  const firstIssue = await prisma.issue.findFirst({ where: { boardId: board1.id } });
  if (firstIssue) {
    await prisma.comment.createMany({
      data: [
        { issueId: firstIssue.id, userId: USER_ID, comment: "Started working on this. Will use JWT with 15-min access tokens." },
        { issueId: firstIssue.id, userId: USER_ID, comment: "Refresh token flow done. Testing cookie persistence now." }
      ]
    });
    console.log("✓ Comments seeded");
  }

  console.log("\n✅ Seed complete! Log in as devtest@example.com / Test@1234");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
