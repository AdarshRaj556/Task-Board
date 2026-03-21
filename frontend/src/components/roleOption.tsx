import type React from "react"
import type {ProjectRole, GlobalRole} from "../globalTypes"
import styles from "./common.module.css"
type RoleProp={
    setRole:React.Dispatch<React.SetStateAction<ProjectRole>>
}
export default function RoleOption({setRole}:RoleProp){
    const UserRole=localStorage.getItem("globalRole") as GlobalRole;
    return (
        <div className={styles.options}>
            <div>Select Role</div>
            {UserRole==="ADMIN" && (
                <div  className={styles.option} onClick={()=>{setRole("PROJECT_ADMIN")}}>&#9702; Project Admin</div>
            )}
            <div className={styles.option} onClick={()=>{setRole("MEMBER")}}>&#9702;Project Member</div>
            <div className={styles.option} onClick={()=>{setRole("PROJECT_VEIWER")}}>&#9702;Project Viewer</div>
        </div>
    )
}