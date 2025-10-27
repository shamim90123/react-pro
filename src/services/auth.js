// src/services/auth.js
import api from "./api";

export const AuthApi = {
  forgot: (email) =>
    api.post("/api/v1/password/forgot", { email }),

  reset: (payload /* { token, email, password, password_confirmation } */) =>
    api.post("/api/v1/password/reset", payload),

  change: (payload /* { current_password, password, password_confirmation } */) =>
    api.post("/api/v1/password/change", payload),
};
