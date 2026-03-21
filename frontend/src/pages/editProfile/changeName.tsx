import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleApi } from "../../utils/handleApi";
import { editProfile } from "../../api/profile";

export function ChangeName(){
    const navigate=useNavigate();
    const [firstName,setFirstName]=useState("");
    const [middleName,setMiddleName]=useState("");
    const [lastName,setLastName]=useState("");
    const [error,setError]=useState("");
    const handleSubmit=async (e:React.FormEvent)=>{
        e.preventDefault();
        try{
            const data=await handleApi(editProfile,firstName,middleName,lastName);
            navigate("/profile");
            console.log(data);   
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
                    name="firstName"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e)=>{
                        setFirstName(e.target.value);
                    }}
                    required
                 />
                <input 
                    type="text"
                    name="middleName"
                    placeholder="Middle Name"
                    value={middleName}
                    onChange={(e)=>{
                        setMiddleName(e.target.value);
                    }}
                 />
                <input 
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e)=>{
                        setLastName(e.target.value);
                    }}
                />
                <button type="submit">Change Username</button>
            </form>
        </div>
    )
}