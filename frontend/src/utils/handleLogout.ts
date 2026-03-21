import { logout } from "../api/profile";
import type { NavigateFunction } from "react-router-dom";

async function handleLogout(navigate: NavigateFunction) {
  try {
    await logout();
    navigate("/", { replace: true });
  } catch (err) {
    console.log(err);
  }
}

export { handleLogout };