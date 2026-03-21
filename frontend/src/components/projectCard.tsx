import ProjectMetaData from "./projectMetaData";
import type { Project } from "../globalTypes";
type projectCardProps={
    project: Project
    activeProjectId: string | null
    setActiveProjectId: React.Dispatch<React.SetStateAction<string | null>>
}
export default function ProjectCard({project,activeProjectId,setActiveProjectId}:projectCardProps){
  const showMeta = activeProjectId === project.id;
  return (
    <>
      <div>
        <div onClick={()=>{setActiveProjectId(project.id);}}>{project.name}</div>
      </div>
        {showMeta && <ProjectMetaData project={project}/>}
    </>
  )
}