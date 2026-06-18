import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getBoard, addColumn, deleteColumn as deleteColumnApi, renameColumn as renameColumnApi } from "../../api/board";
import { addIssue as addIssueApi, moveIssue } from "../../api/issue";
import { getProjectMembers } from "../../api/project";
import ProfileNavbar from "../profile/profileNavbar";
import IssueModal from "./IssueModal";
import styles from "./BoardPage.module.css";

type IssueUser = { id: string; firstName: string; lastName: string | null; avatarUrl?: string | null };

type Issue = {
  id: string; title: string; description: string; priority: string; type: string;
  columnId: string; boardId: string; reporterId: string; assigneeId: string | null;
  dueDate: string | null; createdAt: string;
  assignee: IssueUser | null; reporter: IssueUser;
};

type Column = { id: string; name: string; order: number; wipLimit: number; isFinal: boolean; boardId: string; issues: Issue[] };
type Board = { id: string; name: string; projectId: string; columns: Column[] };
type Member = { id: string; userId: string; role: string; user: { id: string; firstName: string; lastName: string | null; avatarUrl?: string | null } };
type NewIssueForm = { title: string; description: string; type: string; priority: string; dueDate: string };
const defaultForm: NewIssueForm = { title: "", description: "", type: "TASK", priority: "MEDIUM", dueDate: "" };

export default function BoardPage() {
  const { projectId, boardId } = useParams<{ projectId: string; boardId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const role = (location.state as any)?.role as string | undefined;

  const [board, setBoard] = useState<Board | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [selectedIssueColumnName, setSelectedIssueColumnName] = useState("");
  const [addIssueColId, setAddIssueColId] = useState<string | null>(null);
  const [newIssueForm, setNewIssueForm] = useState<NewIssueForm>(defaultForm);
  const [submittingIssue, setSubmittingIssue] = useState(false);
  const [showAddCol, setShowAddCol] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [newColWip, setNewColWip] = useState(10);
  const [addingCol, setAddingCol] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [renamingColId, setRenamingColId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // Drag state
  const dragIssueId = useRef<string | null>(null);
  const dragFromColId = useRef<string | null>(null);
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);

  const canManage = role === "GLOBAL_ADMIN" || role === "PROJECT_ADMIN";

  useEffect(() => {
    if (!projectId || !boardId) return;
    getBoard(projectId, boardId).then(setBoard).catch(console.error);
    getProjectMembers(projectId).then(setMembers).catch(console.error);
  }, [projectId, boardId, refreshKey]);

  const refresh = () => setRefreshKey(k => k + 1);

  const handleOpenIssue = (issue: Issue, columnName: string) => {
    setSelectedIssue(issue);
    setSelectedIssueColumnName(columnName);
  };

  const handleAddIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !boardId || !addIssueColId || submittingIssue) return;
    try {
      setSubmittingIssue(true);
      await addIssueApi(projectId, boardId, addIssueColId, newIssueForm.title, newIssueForm.description, newIssueForm.type, newIssueForm.priority, newIssueForm.dueDate || undefined);
      setNewIssueForm(defaultForm);
      setAddIssueColId(null);
      refresh();
    } catch (err: any) { alert(err.message); }
    finally { setSubmittingIssue(false); }
  };

  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !boardId || addingCol) return;
    try {
      setAddingCol(true);
      await addColumn(projectId, boardId, newColName, newColWip);
      setNewColName(""); setNewColWip(10); setShowAddCol(false); refresh();
    } catch (err: any) { alert(err.message); }
    finally { setAddingCol(false); }
  };

  const handleDeleteColumn = async (columnId: string) => {
    if (!projectId || !boardId) return;
    if (!confirm("Delete this column and all its issues?")) return;
    try { await deleteColumnApi(projectId, boardId, columnId); refresh(); }
    catch (err: any) { alert(err.message); }
  };

  const handleRenameColumn = async (columnId: string) => {
    if (!renameValue.trim() || !projectId) return;
    try {
      await renameColumnApi(projectId, columnId, renameValue.trim());
      setRenamingColId(null); setRenameValue(""); refresh();
    } catch (err: any) { alert(err.message); }
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, issueId: string, fromColId: string) => {
    dragIssueId.current = issueId;
    dragFromColId.current = fromColId;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColId(colId);
  };

  const handleDrop = async (e: React.DragEvent, toColId: string) => {
    e.preventDefault();
    setDragOverColId(null);
    const issueId = dragIssueId.current;
    const fromColId = dragFromColId.current;
    dragIssueId.current = null;
    dragFromColId.current = null;
    if (!issueId || !fromColId || !projectId || !boardId || fromColId === toColId) return;
    try {
      await moveIssue(projectId, boardId, fromColId, toColId, issueId, 999);
      refresh();
    } catch (err: any) { alert(err.message); }
  };

  const handleDragEnd = () => { setDragOverColId(null); dragIssueId.current = null; dragFromColId.current = null; };

  if (!board) return <><ProfileNavbar pageTitle="Board" /><div className={styles.empty}>Loading board...</div></>;

  return (
    <div className={styles.page}>
      <ProfileNavbar pageTitle={board.name} />
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(`/project/${projectId}`, { state: { role } })}>← Back</button>
        <h2>{board.name}</h2>
        {canManage && (
          showAddCol ? (
            <form className={styles.addColForm} onSubmit={handleAddColumn}>
              <input type="text" placeholder="Column name" value={newColName} onChange={e => setNewColName(e.target.value)} required autoFocus />
              <input type="number" placeholder="WIP" value={newColWip} min={1} onChange={e => setNewColWip(Number(e.target.value))} />
              <button type="submit" disabled={addingCol}>{addingCol ? "..." : "Add"}</button>
              <button type="button" onClick={() => setShowAddCol(false)}>✕</button>
            </form>
          ) : (
            <button className={styles.addColBtn} onClick={() => setShowAddCol(true)}>+ Column</button>
          )
        )}
      </div>

      <div className={styles.board}>
        {board.columns.map(col => {
          const isOverWip = col.issues.length >= col.wipLimit;
          const isDragOver = dragOverColId === col.id;
          return (
            <div
              key={col.id}
              className={`${styles.column} ${isDragOver ? styles.dragOver : ""}`}
              onDragOver={e => handleDragOver(e, col.id)}
              onDrop={e => handleDrop(e, col.id)}
              onDragLeave={() => setDragOverColId(null)}
            >
              <div className={styles.columnHeader}>
                {renamingColId === col.id ? (
                  <input
                    className={styles.renameInput}
                    value={renameValue}
                    autoFocus
                    onChange={e => setRenameValue(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") handleRenameColumn(col.id);
                      if (e.key === "Escape") { setRenamingColId(null); setRenameValue(""); }
                    }}
                    onBlur={() => { setRenamingColId(null); setRenameValue(""); }}
                  />
                ) : (
                  <span
                    className={styles.columnName}
                    title={canManage ? "Double-click to rename" : undefined}
                    onDoubleClick={canManage ? () => { setRenamingColId(col.id); setRenameValue(col.name); } : undefined}
                  >
                    {col.name}
                  </span>
                )}
                <span className={`${styles.columnCount} ${isOverWip ? styles.wipWarning : ""}`}>
                  {col.issues.length}/{col.wipLimit}
                </span>
                {canManage && !col.isFinal && (
                  <button className={styles.deleteColBtn} onClick={() => handleDeleteColumn(col.id)} title="Delete column">✕</button>
                )}
              </div>

              <div className={styles.issues}>
                {col.issues.map(issue => {
                  const p = issue.priority.toLowerCase();
                  const t = issue.type.toLowerCase();
                  return (
                    <div
                      key={issue.id}
                      className={styles.issueCard}
                      draggable
                      onDragStart={e => handleDragStart(e, issue.id, col.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => handleOpenIssue(issue, col.name)}
                    >
                      <div className={styles.issueTitle}>{issue.title}</div>
                      <div className={styles.issueMeta}>
                        <div style={{ display: "flex", gap: 4 }}>
                          <span className={`${styles.badge} ${styles[p as keyof typeof styles]}`}>{issue.priority}</span>
                          <span className={`${styles.badge} ${styles[t as keyof typeof styles]}`}>{issue.type}</span>
                        </div>
                        {issue.assignee
                          ? issue.assignee.avatarUrl
                            ? <img src={issue.assignee.avatarUrl} className={styles.assigneeSmall} alt="" />
                            : <div className={styles.assigneePlaceholder}>{issue.assignee.firstName[0]}</div>
                          : <div className={styles.assigneePlaceholder}>?</div>
                        }
                      </div>
                    </div>
                  );
                })}
              </div>

              {addIssueColId === col.id ? (
                <form className={styles.addIssueForm} onSubmit={handleAddIssue}>
                  <input type="text" placeholder="Issue title *" value={newIssueForm.title} onChange={e => setNewIssueForm(f => ({ ...f, title: e.target.value }))} required autoFocus />
                  <textarea placeholder="Description" value={newIssueForm.description} onChange={e => setNewIssueForm(f => ({ ...f, description: e.target.value }))} />
                  <div className={styles.formRow}>
                    <select value={newIssueForm.type} onChange={e => setNewIssueForm(f => ({ ...f, type: e.target.value }))}>
                      <option value="TASK">Task</option>
                      <option value="BUG">Bug</option>
                      <option value="STORY">Story</option>
                    </select>
                    <select value={newIssueForm.priority} onChange={e => setNewIssueForm(f => ({ ...f, priority: e.target.value }))}>
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>
                  <input type="date" value={newIssueForm.dueDate} onChange={e => setNewIssueForm(f => ({ ...f, dueDate: e.target.value }))} />
                  <div className={styles.formActions}>
                    <button type="submit" className={styles.submitBtn} disabled={submittingIssue}>{submittingIssue ? "Adding..." : "Add Issue"}</button>
                    <button type="button" className={styles.cancelBtn} onClick={() => { setAddIssueColId(null); setNewIssueForm(defaultForm); }}>Cancel</button>
                  </div>
                </form>
              ) : (
                <button className={styles.addIssueBtn} onClick={() => setAddIssueColId(col.id)}>+ Add Issue</button>
              )}
            </div>
          );
        })}

        {board.columns.length === 0 && (
          <div className={styles.empty}>No columns yet. {canManage ? "Add one above." : ""}</div>
        )}
      </div>

      {selectedIssue && (
        <IssueModal
          issue={selectedIssue}
          columns={board.columns}
          members={members}
          projectId={projectId!}
          boardId={boardId!}
          currentColumnName={selectedIssueColumnName}
          onClose={() => setSelectedIssue(null)}
          onRefresh={refresh}
        />
      )}
    </div>
  );
}
