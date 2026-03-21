import { ChangeName } from "./changeName";
import { ChangePassword } from "./changePassword";
import { ChangeProfilePhoto } from "./changeAvatar";
import styles from "./EditProfile.module.css"
import { useState } from "react";
export default function EditProfile() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  return (
    <div className={styles.editProfileContainer}>
      <h2>Edit Profile</h2>

      <div className={styles.optionButtons}>
        <button onClick={() => setSelectedOption("name")}>
          Change Name
        </button>

        <button onClick={() => setSelectedOption("password")}>
          Change Password
        </button>

        <button onClick={() => setSelectedOption("avatar")}>
          Change Profile Photo
        </button>
      </div>

      <hr />

      {selectedOption === "name" && <ChangeName />}
      {selectedOption === "password" && <ChangePassword />}
      {selectedOption === "avatar" && <ChangeProfilePhoto />}
      
    </div>
  );
}