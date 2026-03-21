import React, { useState } from "react";
import RoleOption from "./roleOption";
import styles from "./common.module.css"
import { addMemberToProject } from "../api/admin";
type AddMemberProps={
    emails:string[],
    projectId:string,
    setEmails:React.Dispatch<React.SetStateAction<string[]>>
};
import type { ProjectRole } from "../globalTypes";
import { handleApi } from "../utils/handleApi";
export default function AddMember({emails,setEmails,projectId}:AddMemberProps){
    const [role,setRole]=useState<ProjectRole>("MEMBER");
    const [showOption,setShowOption]=useState(false);
    const addField=()=>{
        setEmails([...emails,""]);
    }
    const handleSubmit=  async (e:React.FormEvent)=>{
        e.preventDefault();
        try{
            const data= await handleApi(addMemberToProject,emails,role,projectId)
            console.log("user added successfully",data);
            setEmails([""]);
        }catch(err:any){
            alert(err.message)
        }
    }
    const handleChange=(idx:number,value:string)=>{
        const currEmails=[...emails];
        currEmails[idx]=value;
        setEmails(currEmails);
    }
    return (
        <div className={styles.inputData}>
            {
                emails.map((email,idx)=>(
                    <input className={styles.emails}
                        key={idx}
                        type="email" 
                        value={email}
                        onChange={(e)=>{
                            handleChange(idx,e.target.value);
                        }}
                        placeholder="Enter Email"
                    />
                ))
            }
            <button className={styles.button} onClick={addField}>Add More Members...</button>
             {!showOption && (
                <div>
                <span>Role: {role}</span>
                <button className={styles.button} onClick={() => setShowOption(true)}>
                    Change Role
                </button>
                </div>
            )}

            {showOption && (
                <div>
                <RoleOption
                    setRole={(r) => {
                    setRole(r);
                    setShowOption(false);
                    }}
                />
                </div>
            )}
            <button className={styles.button} onClick={handleSubmit}>Submit</button>
        </div>
    )
}