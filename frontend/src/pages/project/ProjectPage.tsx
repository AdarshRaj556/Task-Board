import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getBoards, createBoard } from "../../api/board";
import { getProjectMembers } from "../../api/project";
import ProfileNavbar from "../profile/profileNavbar";
import styles from "./ProjectPage.module.css";

type Board = { id: string; name: string; projectId: string };
type Member = {
  id: string;
  userId: string;
  role: string;
  user: { id: string; firstName: string; lastName: string | null; email: string };
};

export default function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const role = (location.state as any)?.role as string | undefined;

  const [boards, setBoards] = useState<Board[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [boardName, setBoardName] = useState("");
  const [loading, setLoading] = useState(false);

  const canManage = role === "GLOBAL_ADMIN" || role === "PROJECT_ADMIN";

  useEffect(() => {
    if (!projectId) return;
    getBoards(projectId).then(setBoards).catch(console.error);
    getProjectMembers(projectId).then(setMembers).catch(console.error);
  }, [projectId]);

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || loading) return;
    try {
      setLoading(true);
      const board = await createBoard(projectId, boardName);
      setBoards(prev => [...prev, board]);
      setBoardName("");
      setShowCreateForm(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const roleLabel = (r: string) =>
    r.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className={styles.page}>
      <ProfileNavbar pageTitle="Project Boards" />
      <div className={styles.container}>

        {/* Back + create */}
        <div className={styles.topBar}>
          <button className={styles.back} onClick={() => navigate("/profile")}>← Back</button>
          {canManage && (
            <button className={styles.createBtn} onClick={() => setShowCreateForm(v => !v)}>
              {showCreateForm ? "✕ Cancel" : "+ New Board"}
            </button>
          )}
        </div>

        {/* Create form */}
        {showCreateForm && (
          <form className={styles.createForm} onSubmit={handleCreateBoard}>
            <input
              type="text"
              placeholder="Board name..."
              value={boardName}
              onChange={e => setBoardName(e.target.value)}
              required
              autoFocus
            />
            <button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </button>
          </form>
        )}

        {/* Boards */}
        <div>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Boards</span>
          </div>
          <div className={styles.boards}>
            {boards.length === 0 ? (
              <div className={styles.empty}>
                No boards yet.{canManage ? " Create one above." : ""}
              </div>
            ) : (
              boards.map(board => (
                <div
                  key={board.id}
                  className={styles.boardCard}
                  onClick={() => navigate(`/project/${projectId}/board/${board.id}`, { state: { role } })}
                >
                  <div className={styles.boardIcon}>📋</div>
                  <span className={styles.boardName}>{board.name}</span>
                  <span className={styles.arrow}>→</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Members */}
        {members.length > 0 && (
          <div className={styles.membersSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>Team Members</span>
            </div>
            <div className={styles.members}>
              {members.map(m => (
                <div key={m.id} className={styles.member}>
                  <div className={styles.memberAvatar}>
                    {m.user.firstName[0]}{m.user.lastName?.[0] ?? ""}
                  </div>
                  <span className={styles.memberName}>
                    {m.user.firstName} {m.user.lastName}
                  </span>
                  <span className={styles.memberEmail}>{m.user.email}</span>
                  <span className={styles.role}>{roleLabel(m.role)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
