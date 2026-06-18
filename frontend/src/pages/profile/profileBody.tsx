import { getUserProject } from "../../api/profile";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ProjectMetaData from "../../components/projectMetaData";
import type { Project } from "../../globalTypes";
import styles from "./profileBody.module.css";

type UserProject = {
  id: string;
  userId: string;
  projectId: string;
  role: string;
  createdAt: string;
  project: Project;
};

type Props = { search?: string };

export default function ProfileBody({ search = "" }: Props) {
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [project, setProject] = useState<UserProject>();
  const [showMetaData, setShowMetaData] = useState(false);
  const [metaPos, setMetaPos] = useState({ top: 0, left: 0 });
  const metaRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const filtered = projects.filter(p =>
    p.project.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleHover(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    setMetaPos({ top: rect.top + window.scrollY, left: rect.right + 4 });
  }

  useEffect(() => {
    getUserProject().then(setProjects).catch(console.error);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (metaRef.current && !metaRef.current.contains(e.target as Node)) {
        setShowMetaData(false);
      }
    }
    if (showMetaData) document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [showMetaData]);

  const goTo = (p: UserProject) =>
    navigate(`/project/${p.projectId}`, { state: { role: p.role } });

  const roleLabel = (role: string) =>
    role.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

  return (
    <>
      <div className={styles.container}>
        {/* Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <span className={styles.sidebarTitle}>Projects</span>
            {filtered.length > 0 && (
              <span className={styles.sidebarCount}>{filtered.length}</span>
            )}
          </div>
          {filtered.length === 0 && search ? (
            <div style={{ padding: "10px 8px", fontSize: "13px", color: "#9ca3af" }}>
              No matches for "{search}"
            </div>
          ) : (
            filtered.map(p => (
              <div
                className={styles.project}
                key={p.id}
                title={p.project.name}
                onMouseEnter={e => { setProject(p); setShowMetaData(true); handleHover(e); }}
                onClick={() => goTo(p)}
              >
                <span className={styles.projectDot} />
                {p.project.name}
              </div>
            ))
          )}
        </div>

        {/* Main area */}
        <div className={styles.main}>
          <div className={styles.mainHeader}>
            <div className={styles.mainHeading}>
              {search ? `Results for "${search}"` : "My Projects"}
            </div>
            {filtered.length > 0 && (
              <span className={styles.resultCount}>
                {filtered.length} project{filtered.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className={styles.emptyMain}>
              <div className={styles.emptyIcon}>{search ? "🔍" : "📋"}</div>
              <div className={styles.emptyText}>
                {search ? "No projects found" : "No projects yet"}
              </div>
              <div className={styles.emptySubText}>
                {search
                  ? `Nothing matches "${search}". Try a different search.`
                  : "Ask an admin to create a project and add you to it."}
              </div>
            </div>
          ) : (
            <div className={styles.cards}>
              {filtered.map(p => (
                <div key={p.id} className={styles.card} onClick={() => goTo(p)}>
                  <div className={styles.cardIcon}>📁</div>
                  <div className={styles.cardName} title={p.project.name}>{p.project.name}</div>
                  <div className={styles.cardDesc}>{p.project.description || "No description provided."}</div>
                  <div className={styles.cardFooter}>
                    <span className={styles.cardRole}>{roleLabel(p.role)}</span>
                    <span className={styles.cardArrow}>→</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showMetaData && project && (
        <div
          className={styles.meta}
          style={{ top: metaPos.top, left: metaPos.left }}
          ref={metaRef}
          onClick={e => e.stopPropagation()}
        >
          <ProjectMetaData project={project.project} />
        </div>
      )}
    </>
  );
}
