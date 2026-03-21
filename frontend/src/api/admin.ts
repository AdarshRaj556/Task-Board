import type { ProjectRole } from "../globalTypes"
import { parseResponse } from "../utils/parseResponse";
import { fetchWithAuth } from "./fetchWithAuth"
export const addMemberToProject= async (emails:string[],role:ProjectRole,projectId:string)=>{
    const res= await fetchWithAuth(`/api/admin/project/addMember/${projectId}/${role}`,{
        headers:{
            "Content-Type":"application/json"
        },
        method:"POST",
        body:JSON.stringify({
            emails:emails
        }),
    });
    const data= await parseResponse(res);
    return data;
}


export const createProject =async (projectName:string,description:string)=>{
    const res= await fetchWithAuth("/api/admin/createProject",{
        headers:{
            "Content-Type":"application/json"
        },
        method:"POST",
        body:JSON.stringify({
            name:projectName,
            description,
        }),
    });
    const data= await parseResponse(res);
    return data;
}