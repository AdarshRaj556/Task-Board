import { useState } from "react";
import ProfileNavbar from "./profileNavbar";
import ProfileBody from "./profileBody";

export default function Profile() {
  const [search, setSearch] = useState("");
  return (
    <>
      <ProfileNavbar showSearch search={search} onSearch={setSearch} />
      <ProfileBody search={search} />
    </>
  );
}
