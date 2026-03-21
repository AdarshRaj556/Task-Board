import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleApi } from "../../utils/handleApi";
import { editPassword } from "../../api/profile";
export function ChangePassword(){
    const navigate=useNavigate();
    const [oldPassword,setOldPassword]=useState("");
    const [newPassword,setNewPassword]=useState("");
    const [error,setError]=useState("");
    const handleSubmit=async (e:React.FormEvent)=>{
        e.preventDefault();
        try{
            const data=await handleApi(editPassword,oldPassword,newPassword);
            console.log(data); 
            navigate("/profile");  
        }catch(err:any){
            setError(err.message);
        }
    };
    return (
        <div>

            <form onSubmit={handleSubmit}>
                {error && <p>{error}</p>}
                <input 
                    type="text"
                    name="oldPassword"
                    placeholder="Old Password"
                    value={oldPassword}
                    onChange={(e)=>{
                        setOldPassword(e.target.value);
                    }}
                    required
                 />
                <input 
                    type="password"
                    name="newPassword"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e)=>{
                        setNewPassword(e.target.value);
                    }}
                 />
                 <button type="submit">Change Password</button>
            </form>

        </div>
    )
}