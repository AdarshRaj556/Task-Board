import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../src/pages/Login";
import Signup from "../src/pages/Signup";
import Profile from "./pages/profile/profile";
import EditProfile from "./pages/editProfile/EditProfile";
import ProjectPage from "./pages/project/ProjectPage";
import BoardPage from "./pages/board/BoardPage";

function App() {
    return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile/>}/>
        <Route path="/profile/editProfile" element={<EditProfile/>}/>
        <Route path="/project/:projectId" element={<ProjectPage/>}/>
        <Route path="/project/:projectId/board/:boardId" element={<BoardPage/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;