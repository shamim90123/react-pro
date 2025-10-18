// src/lib/token.js
const KEY = "auth_token";

export const tokenStore = {
  get() {
    return localStorage.getItem(KEY) || sessionStorage.getItem(KEY) || "";
  },
  set(token, remember = false) {
    // remember=true -> localStorage, else sessionStorage
    if (remember) {
      localStorage.setItem(KEY, token);
      sessionStorage.removeItem(KEY);
    } else {
      sessionStorage.setItem(KEY, token);
      localStorage.removeItem(KEY);
    }
  },
  clear() {
    localStorage.removeItem(KEY);
    sessionStorage.removeItem(KEY);
  },
};
