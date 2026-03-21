import { useState } from "react";
import { handleApi } from "../utils/handleApi";
import { createProject } from "../api/admin";
import { useNavigate } from "react-router-dom";
import styles from "./common.module.css"
export default function CreateProjectForm() {
    const [projectName, setProjectName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;
        try {
            setLoading(true);
            const data = await handleApi(createProject, projectName, description);
            console.log(data);
            setProjectName("");
            setDescription("");
            navigate("/profile");
        } catch (err: any) {
            console.log(err.message);
        } finally {
            setLoading(false);
        }
    };
    return (
        <form className={styles.createProjectForm} onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Project Name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
            />
            <textarea
                // type="text"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
            />
            <button type="submit" className={styles.button} disabled={loading}>
                {loading ? "Creating..." : "Submit"}
            </button>
        </form>
    );
}