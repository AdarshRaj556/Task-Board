import { useEffect,useState } from "react";
import { getUserProfile,} from "../../api/profile";
import styles from "./ProfileNavbar.module.css";
import { handleLogout } from "../../utils/handleLogout"
import { useNavigate } from "react-router-dom";
import type { GlobalRole } from "../../globalTypes";
import CreateProjectForm from "../../components/createProjectForm";
type User={
    firstName:string;
    middleName:string;
    lastName:string;
    email:string;
    avatarUrl?:string;
    role:GlobalRole;
};

export default function ProfileNavbar(){
    const [user,setUser]= useState<User|null>(null);
    const [menuOpen,setMenuOpen]=useState(false);
    const [showImage,setShowImage]=useState(false);
    const navigate=useNavigate();
    const [showCreateForm,setShowCreateForm]=useState(false);
    useEffect(()=>{
        async function loadUser(){
            try{
                const data= await getUserProfile();
                setUser(data);
            }catch(err){
                console.log(err);
            }
        }
        loadUser();
    },[]);
    useEffect(() => {
        function handleClick() {
          setMenuOpen(false);
          setShowImage(false);
        }
        document.addEventListener("click", handleClick);
        return () => {
          document.removeEventListener("click", handleClick);
        };
    }, []);
    if (!user) return null;
    return (
      <div className={styles.navbar}>
        <div className={styles.left}>
          {user?`Hello ${user.firstName} ${user?.middleName} ${user?.lastName}`:"Hello"}
        </div>
        <div className={styles.center}>
          <input type="text" placeholder="Search Project..." className={styles.search} />
        </div>
        <div className={styles.right}>
          {user?.role==="ADMIN" && (
            <button className={styles.createBtn}  onClick={()=>{
              setShowCreateForm(true);
            }} >
              Create Project
            </button>
          )}
          <div className={styles.profile}>
            <img src={user?.avatarUrl} alt="profile" className={styles.avatar} onMouseEnter={
              (e)=>{
                e.stopPropagation();
                setMenuOpen(!menuOpen)
              }} onClick={
              (e)=>{
                e.stopPropagation();
                setShowImage(true);
              }
            }/>
            {showCreateForm &&(
                <CreateProjectForm />
            )}
            {menuOpen && (
              <div className={styles.dropdown} onMouseEnter={(e)=>{
                e.stopPropagation();
              }}>
                <div className={styles.dropdownItem}>{user.email}</div>
                <div className={styles.dropdownItem} onClick={()=>{
                  navigate("/profile/editProfile")
                }}>Edit Profile</div>
                <div className={styles.logout} onClick={()=>{
                  handleLogout(navigate)
                }}>Logout</div>
              </div>
            )}
            {showImage && (
              <div className={styles.imageOverlay} onClick={()=>setShowImage(false)}>
                <img src={user?.avatarUrl} className={styles.fullImage}/>
              </div>
            )}
          </div>
        </div>
      </div>
    )

}