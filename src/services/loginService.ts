import { api } from "@/adapters/api";

const resource = "/login";

type LoginResponse = {
  access_token: string;
  token_type: string;
};

export const login = async (username: string, password: string) => {
  const formData = new URLSearchParams()
  formData.append("username", username)
  formData.append("password", password)

  const res = await api
    .post<LoginResponse>(`${resource}/token`, formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    
  return res.data;
}

export const profile = async () => {
    const response = await api.get(`${resource}/profile`)
    return response.data
}