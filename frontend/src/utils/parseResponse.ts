export const parseResponse = async (res: Response) => {
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("Invalid server response");
  }
  if (!res.ok) {
    throw new Error(data?.message || "Request failed");
  }
  return data;
};