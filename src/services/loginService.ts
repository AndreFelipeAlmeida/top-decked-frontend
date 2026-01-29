import { api } from "@/adapters/api";

const resource = "login";

type LoginResponse = {
  access_token: string;
  token_type: string;
};

export const login = (username: string, password: string) => {
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  return api.post<LoginResponse, URLSearchParams>(
    `${resource}/token`,
    formData,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
}