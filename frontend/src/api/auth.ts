export const loginUser = async (email: string, password: string) => {
  const res = await fetch("/api/login", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message);
  }
  return data;
};


export const signUpUser = async (firstName:string,middleName:string,lastName:string,email: string, password: string) => {
  const res = await fetch("/api/signup", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      firstName,
      middleName,
      lastName,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message);
  }

  return data;
};

export const refreshAccessToken= async ()=>{
  const res= await fetch("/api/refresh",{
    method:"POST",
    credentials:"include"
  });
  if (!res.ok){
    throw new Error("Refresh token Expired");
  }
  return await res.json();
}