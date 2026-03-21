import { getUserProject } from "../../api/profile";
 import { useEffect, useState, useRef } from "react"; 
 import ProjectMetaData from "../../components/projectMetaData";
  import type { Project } from "../../globalTypes"; 
  import styles from "./profileBody.module.css"; 
  type UserProject = { 
    id: string 
    userId: string 
    projectId: string 
    role: string 
    createdAt: string 
    project: Project }
export default function ProfileBody(){
  const [projects,setProjects] = useState<UserProject[]>([]);
  const [project,setProject] = useState<UserProject>();
  const [showMetaData,setShowMetaData] = useState(false);
  const [metaPos, setMetaPos] = useState({ top: 0, left: 0 });
  function handleHover(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
      setMetaPos({
        top: rect.top+ window.scrollY,
        left: rect.right+2
      });
  }
  const metaRef = useRef<HTMLDivElement>(null);
  useEffect(()=>{
    async function fetchProjects() {
      const data = await getUserProject();
      setProjects(data);
    }
    fetchProjects();
  },[]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if(metaRef.current && !metaRef.current.contains(e.target as Node)){
        setShowMetaData(false);
      }
    }
    if(showMetaData){
      document.addEventListener("click",handleClick);
    }
    return ()=>{
      document.removeEventListener("click",handleClick);
    }
  },[showMetaData]);
  return (
    <>
 
      <div className={styles.container}>
        <div className={styles.sidebar}>
          <div className={styles.heading}>Projects</div>
        {projects.map((p)=>(
          <div className={styles.project} key={p.id} onMouseEnter={(e)=>{
              setProject(p);
              setShowMetaData(true);
              handleHover(e);
            }}>{p.project.name}
          </div>
        ))}
        </div>
        <div>task</div>
      </div>
      {showMetaData && project && (
        <div className={styles.meta}
          style={{
            top: metaPos.top,
            left: metaPos.left
          }}
          ref={metaRef}
          onClick={(e)=>{
            e.stopPropagation();
          }}>
          <ProjectMetaData project={project.project}/>
        </div>
      )}
  
    </>
  )
}