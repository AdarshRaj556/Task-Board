import { Request } from "express";
import bcrypt from 'bcrypt';
function isEditabel(req:Request){
    const allowedUpdates=["firstName","middleName","lastName"];
    for (let key in req.body){
        let flag:boolean=false;
        for (let i=0;i<allowedUpdates.length;i++){
            flag=flag||(allowedUpdates[i]==key)
        }
        if (flag==false){
            return flag;
        }
    }
    return true;

}

async function isValidPassword(password:string,passwordInDb:string):Promise<boolean>{
    const isOk=await bcrypt.compare(password,passwordInDb);
    return isOk;
}
export {isEditabel,isValidPassword};