import {Request} from 'express'


export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}


export function isStrongPassword(password: string): boolean {
    if (typeof password !== "string"){
        throw new Error("password must be string");
    }
    if (password.length < 8){
        throw new Error("Enter atleast 8 character");
    }
    if (!/[A-Z]/.test(password)){
        throw new Error("password include capital letter");
    }
    if (!/[a-z]/.test(password)){
        throw new Error("password include small letter");
    }
    if (!/\d/.test(password)){
        throw new Error("password should contain digit");
    }
    if (!/[@$!%*?&]/.test(password)){
        throw new Error("password should contain special charater");
    }
    return true;
}


const validateSignup=(req:Request)=>{
    const {firstName ,email,password}=req.body;
    if (firstName.length<=2){
        throw new Error("low length of first name");
    }
    if (!validateEmail(email)){
        throw new Error("not valid email");
    }
    isStrongPassword(password);
}

export {validateSignup};