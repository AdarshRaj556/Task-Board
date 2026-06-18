import { useState } from "react"
import type { Project } from "../globalTypes"
import AddMember from "./addMember"
import styles from "./common.module.css"
type ProjectMetaDataProps={
    project:Project
}
export default function ProjectMetaData({project}:ProjectMetaDataProps){
    const [showAddMember,setShowAddMember]=useState(false);
    const [emails,setEmails]=useState<string[]>([""]);

    return (
        <div className={styles.meta}>
            <div className={styles.name}><span className={styles.bold}>Project Name: </span>{project.name}</div>
            <div className={styles.description}><span className={styles.bold}>Description: </span>{project.description || "—"}</div>
            <div className={styles.time}><span className={styles.bold}>Created: </span>{project.createdAt.toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short"
                })}
            </div>
            <div className={styles.time}><span className={styles.bold}>Updated: </span>{project.modifiedAt.toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short"
                })}</div>
            <button className={styles.addMemberBtn} onClick={() => setShowAddMember(true)}>
                + Add Member
            </button>
            {showAddMember && <AddMember emails={emails} setEmails={setEmails} projectId={project.id}/>}
        </div>
    )
}