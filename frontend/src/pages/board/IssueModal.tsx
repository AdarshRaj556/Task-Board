import { useEffect, useState } from "react";
import { getComments, postComment as postCommentApi, editComment as editCommentApi, deleteComment as deleteCommentApi } from "../../api/comment";
import { moveIssue, assignIssue as assignIssueApi, editIssue as editIssueApi, deleteIssue as deleteIssueApi, getIssueActivity } from "../../api/issue";
import RichTextEditor from "../../components/RichTextEditor";
import styles from "./IssueModal.module.css";

type IssueUser = { id: string; firstName: string; lastName: string | null; avatarUrl?: string | null };

type Issue = {
  id: string; title: string; description: string; priority: string; type: string;
  columnId: string; boardId: string; reporterId: string; assigneeId: string | null;
  dueDate: string | null; createdAt: string;
  assignee: IssueUser | null; reporter: IssueUser;
};

type Column = { id: string; name: string };
type Member = { id: string; userId: string; user: { id: string; firstName: string; lastName: string | null; avatarUrl?: string | null } };
type Comment = {
  id: string; comment: string; createdAt: string; updatedAt: string;
  user: { id: string; firstName: string; lastName: string | null; avatarUrl?: string | null };
};
type AuditEntry = { id: string; type: string; oldValue: string; newValue: string; createdAt: string };

type Props = {
  issue: Issue; columns: Column[]; members: Member[];
  projectId: string; boardId: string; currentColumnName: string;
  onClose: () => void; onRefresh: () => void;
};

function username(u: { firstName: string; lastName: string | null }) {
  return `${u.firstName}${u.lastName ? " " + u.lastName : ""}`;
}

function Avatar({ user }: { user: { firstName: string; avatarUrl?: string | null } }) {
  if (user.avatarUrl) return <img src={user.avatarUrl} className={styles.avatar} alt="" />;
  return <div className={styles.avatarPlaceholder}>{user.firstName[0]}</div>;
}

const currentUserId = () => localStorage.getItem("userId") ?? "";

export default function IssueModal({ issue, columns, members, projectId, boardId, currentColumnName, onClose, onRefresh }: Props) {
  const [tab, setTab] = useState<"details" | "activity">("details");
  const [comments, setComments] = useState<Comment[]>([]);
  const [activity, setActivity] = useState<AuditEntry[]>([]);
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [moveToColumnId, setMoveToColumnId] = useState(issue.columnId);
  const [moving, setMoving] = useState(false);
  const [assigneeId, setAssigneeId] = useState(issue.assigneeId ?? "");
  const [assigning, setAssigning] = useState(false);

  // Edit issue state
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState(issue.title);
  const [editDesc, setEditDesc] = useState(issue.description);
  const [editPriority, setEditPriority] = useState(issue.priority);
  const [editDueDate, setEditDueDate] = useState(issue.dueDate ? issue.dueDate.slice(0, 10) : "");
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    getComments(projectId, boardId, issue.id).then(setComments).catch(console.error);
  }, [issue.id, projectId, boardId]);

  useEffect(() => {
    if (tab === "activity") {
      getIssueActivity(projectId, issue.id).then(setActivity).catch(console.error);
    }
  }, [tab, issue.id, projectId]);

  const reloadComments = () => getComments(projectId, boardId, issue.id).then(setComments).catch(console.error);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.replace(/<[^>]*>/g, "").trim() || postingComment) return;
    try {
      setPostingComment(true);
      await postCommentApi(projectId, boardId, issue.id, commentText);
      setCommentText("");
      await reloadComments();
    } catch (err: any) { alert(err.message); }
    finally { setPostingComment(false); }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editingCommentText.trim()) return;
    try {
      await editCommentApi(projectId, boardId, issue.id, commentId, editingCommentText.trim());
      setEditingCommentId(null);
      await reloadComments();
    } catch (err: any) { alert(err.message); }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Delete this comment?")) return;
    try {
      await deleteCommentApi(projectId, boardId, issue.id, commentId);
      await reloadComments();
    } catch (err: any) { alert(err.message); }
  };

  const handleMove = async () => {
    if (moveToColumnId === issue.columnId || moving) return;
    try {
      setMoving(true);
      await moveIssue(projectId, boardId, issue.columnId, moveToColumnId, issue.id, 999);
      onRefresh();
    } catch (err: any) { alert(err.message); }
    finally { setMoving(false); }
  };

  const handleAssign = async () => {
    if (!assigneeId || assigning) return;
    try {
      setAssigning(true);
      await assignIssueApi(projectId, issue.id, assigneeId);
      onRefresh();
    } catch (err: any) { alert(err.message); }
    finally { setAssigning(false); }
  };

  const handleSaveEdit = async () => {
    if (savingEdit) return;
    try {
      setSavingEdit(true);
      await editIssueApi(projectId, issue.id, {
        title: editTitle, description: editDesc, priority: editPriority,
        dueDate: editDueDate || null
      });
      setEditMode(false);
      onRefresh();
    } catch (err: any) { alert(err.message); }
    finally { setSavingEdit(false); }
  };

  const handleDeleteIssue = async () => {
    if (!confirm(`Delete issue "${issue.title}"? This cannot be undone.`)) return;
    try {
      await deleteIssueApi(projectId, boardId, issue.id);
      onRefresh();
      onClose();
    } catch (err: any) { alert(err.message); }
  };

  const priorityClass = issue.priority.toLowerCase() as keyof typeof styles;
  const typeClass = issue.type.toLowerCase() as keyof typeof styles;

  const auditLabel: Record<string, string> = {
    STATUS_CHANGED: "Status changed",
    ASSIGNEE_CHANGED: "Assignee changed",
    COMMENT_ADDED: "Comment added",
    COMMENT_EDITED: "Comment edited",
    COMMENT_DELETED: "Comment deleted",
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.modalHeader}>
          {editMode
            ? <input className={styles.editTitleInput} value={editTitle} onChange={e => setEditTitle(e.target.value)} />
            : <h2>{issue.title}</h2>
          }
          <div className={styles.headerActions}>
            {editMode ? (
              <>
                <button className={styles.saveBtn} onClick={handleSaveEdit} disabled={savingEdit}>{savingEdit ? "Saving..." : "Save"}</button>
                <button className={styles.cancelEditBtn} onClick={() => { setEditMode(false); setEditTitle(issue.title); setEditDesc(issue.description); setEditPriority(issue.priority); setEditDueDate(issue.dueDate ? issue.dueDate.slice(0,10) : ""); }}>Cancel</button>
              </>
            ) : (
              <>
                <button className={styles.editBtn} onClick={() => setEditMode(true)}>Edit</button>
                <button className={styles.deleteBtn} onClick={handleDeleteIssue}>Delete</button>
              </>
            )}
            <button className={styles.closeBtn} onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Badges */}
        <div className={styles.badges}>
          <span className={`${styles.badge} ${styles[priorityClass]}`}>{issue.priority}</span>
          <span className={`${styles.badge} ${styles[typeClass]}`}>{issue.type}</span>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab === "details" ? styles.activeTab : ""}`} onClick={() => setTab("details")}>Details</button>
          <button className={`${styles.tab} ${tab === "activity" ? styles.activeTab : ""}`} onClick={() => setTab("activity")}>Activity</button>
        </div>

        {tab === "details" && (
          <>
            <div className={styles.section}>
              <span className={styles.label}>Description</span>
              {editMode
                ? <textarea className={styles.editDescInput} value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={3} />
                : <div className={styles.description}>{issue.description || <em>No description</em>}</div>
              }
            </div>

            <div className={styles.row}>
              <div className={styles.section}>
                <span className={styles.label}>Status</span>
                <span className={styles.value}>{currentColumnName}</span>
              </div>
              <div className={styles.section}>
                <span className={styles.label}>Priority</span>
                {editMode
                  ? <select className={styles.select} value={editPriority} onChange={e => setEditPriority(e.target.value)}>
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  : <span className={styles.value}>{issue.priority}</span>
                }
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.section}>
                <span className={styles.label}>Reporter</span>
                <div className={styles.assigneeRow}>
                  <Avatar user={issue.reporter} />
                  <span className={styles.value}>{username(issue.reporter)}</span>
                </div>
              </div>
              <div className={styles.section}>
                <span className={styles.label}>Assignee</span>
                <div className={styles.assigneeRow}>
                  {issue.assignee
                    ? <><Avatar user={issue.assignee} /><span className={styles.value}>{username(issue.assignee)}</span></>
                    : <span className={styles.value}>Unassigned</span>
                  }
                </div>
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.section}>
                <span className={styles.label}>Due Date</span>
                {editMode
                  ? <input type="date" className={styles.select} value={editDueDate} onChange={e => setEditDueDate(e.target.value)} />
                  : <span className={styles.value}>{issue.dueDate ? new Date(issue.dueDate).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "—"}</span>
                }
              </div>
            </div>

            {members.length > 0 && (
              <div className={styles.section}>
                <span className={styles.label}>Assign To</span>
                <div className={styles.actionRow}>
                  <select className={styles.select} value={assigneeId} onChange={e => setAssigneeId(e.target.value)}>
                    <option value="">Select member...</option>
                    {members.map(m => <option key={m.userId} value={m.userId}>{username(m.user)}</option>)}
                  </select>
                  <button className={styles.actionBtn} onClick={handleAssign} disabled={!assigneeId || assigning}>
                    {assigning ? "..." : "Assign"}
                  </button>
                </div>
              </div>
            )}

            <div className={styles.section}>
              <span className={styles.label}>Move to Column</span>
              <div className={styles.actionRow}>
                <select className={styles.select} value={moveToColumnId} onChange={e => setMoveToColumnId(e.target.value)}>
                  {columns.map(col => <option key={col.id} value={col.id}>{col.name}</option>)}
                </select>
                <button className={styles.actionBtn} onClick={handleMove} disabled={moveToColumnId === issue.columnId || moving}>
                  {moving ? "..." : "Move"}
                </button>
              </div>
            </div>

            <hr className={styles.divider} />

            <div className={styles.commentsSection}>
              <h3>Comments ({comments.length})</h3>
              {comments.length === 0
                ? <div className={styles.noComments}>No comments yet.</div>
                : comments.map(c => (
                  <div key={c.id} className={styles.commentItem}>
                    <Avatar user={c.user} />
                    <div className={styles.commentBody}>
                      <strong>{username(c.user)}</strong>
                      {editingCommentId === c.id
                        ? <div className={styles.commentEditRow}>
                            <RichTextEditor value={editingCommentText} onChange={setEditingCommentText} minHeight={50} />
                            <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                              <button className={styles.actionBtn} onClick={() => handleEditComment(c.id)}>Save</button>
                              <button className={styles.cancelEditBtn} onClick={() => setEditingCommentId(null)}>Cancel</button>
                            </div>
                          </div>
                        : <div className={styles.commentHtml} dangerouslySetInnerHTML={{ __html: c.comment }} />
                      }
                      <div className={styles.commentMeta}>
                        {new Date(c.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                        {c.user.id === currentUserId() && editingCommentId !== c.id && (
                          <span className={styles.commentActions}>
                            <button onClick={() => { setEditingCommentId(c.id); setEditingCommentText(c.comment); }}>Edit</button>
                            <button onClick={() => handleDeleteComment(c.id)}>Delete</button>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              }
              <form className={styles.commentForm} onSubmit={handlePostComment}>
                <div style={{ flex: 1 }}>
                  <RichTextEditor value={commentText} onChange={setCommentText} placeholder="Add a comment…" minHeight={60} />
                  <div className={styles.mentionHint}>
                    💡 Type <strong>@email@domain.com</strong> to mention someone — they'll get a notification
                  </div>
                </div>
                <button className={styles.actionBtn} type="submit" disabled={postingComment || !commentText.replace(/<[^>]*>/g, "").trim()}>
                  {postingComment ? "..." : "Post"}
                </button>
              </form>
            </div>
          </>
        )}

        {tab === "activity" && (
          <div className={styles.activitySection}>
            {activity.length === 0
              ? <div className={styles.noComments}>No activity yet.</div>
              : activity.map(a => (
                <div key={a.id} className={styles.activityItem}>
                  <div className={styles.activityDot} />
                  <div className={styles.activityContent}>
                    <span className={styles.activityType}>{auditLabel[a.type] ?? a.type}</span>
                    {a.oldValue && <span className={styles.activityOld}>{a.oldValue}</span>}
                    {a.newValue && <><span className={styles.activityArrow}>→</span><span className={styles.activityNew}>{a.newValue}</span></>}
                    <span className={styles.activityTime}>{new Date(a.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </div>
    </div>
  );
}
