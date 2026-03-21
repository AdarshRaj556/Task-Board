import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleApi } from "../../utils/handleApi";
import { uploadAvatar } from "../../api/profile";

export function ChangeProfilePhoto() {
    const navigate=useNavigate();
    const [chooseFile, setChooseFile] = useState<File | null>(null);
    const [loading,setLoading]=useState(false);
    const [error, setError] = useState("");
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(loading) return;
        if (!chooseFile) {
            setError("Please select a file");
            return;
        }
        try{
            setLoading(true);
            const data = await handleApi(uploadAvatar, chooseFile);
            console.log(data);
            navigate("/profile");
        }catch (err: any) {
            setError(err.message);
        }finally{
            setLoading(false);
        }
    };
  return (
    <div>
        <form onSubmit={handleSubmit}>
        <input
            type="file"
            accept="image/*"
            onChange={(e) => {
            if (e.target.files) {
                setChooseFile(e.target.files[0]);
            }
            }}
        />
        <button type="submit" disabled={loading}>{loading? "Uploading...":"Upload"}</button>
        {error && <p>{error}</p>}
        </form>
    </div>
  );
}
