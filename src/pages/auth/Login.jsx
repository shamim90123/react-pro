// src/pages/auth/Login.jsx
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { SweetAlert } from "@/components/ui/SweetAlert";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post("/api/v1/login", {
        email: form.email,
        password: form.password,
      });

      // const accessToken = data?.access_token || data?.token || data?.data?.token;
      const accessToken = data?.token || data?.access_token || data?.data?.token;
      const me = data?.user || data?.data?.user || null;
      if (!accessToken) throw new Error("No token returned from API.");

      // await login({ token: accessToken, remember: form.remember });
      await login({ token: accessToken, remember: form.remember, me });

      SweetAlert.success("Signed in successfully");
      const to = location.state?.from?.pathname || "/dashboard";
      navigate(to, { replace: true });
    } catch (err) {
      const message = err?.response?.data?.message || err.message || "Login failed";
      SweetAlert.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900">
      <div className="bg-[#F9F7F1] rounded-3xl shadow-lg w-full max-w-md p-8">
        <div className="text-center mb-8">
          <img src="img/logo.png" alt="Logo" className="mx-auto h-16 w-auto mb-2 text-gray-900" />
          <p className="text-gray-500 mt-2 text-sm">Please login to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#282560] focus:border-[#282560] bg-white text-gray-900 placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                name="password"
                type={showPwd ? "text" : "password"}
                placeholder="Password"
                required
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#282560] focus:border-[#282560] bg-white text-gray-900 placeholder-gray-400 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="absolute inset-y-0 right-2 my-auto text-xs text-gray-600 hover:text-gray-800"
              >
                {showPwd ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                name="remember"
                type="checkbox"
                checked={form.remember}
                onChange={handleChange}
                className="h-4 w-4 border-gray-300 rounded focus:ring-blue-500"
              />
              Remember me
            </label>
            <a href="/forgot-password" className="text-sm hover:underline">Forgot password?</a>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-[#282560] hover:bg-[#1f1c4d] disabled:opacity-60 text-white rounded-xl text-sm font-medium shadow-sm transition"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {/* <p className="text-center text-sm text-gray-500 mt-6">
          Don’t have an account?{" "}
          <a href="/register" className="hover:underline font-medium">Sign up</a>
        </p> */}
      </div>
    </div>
  );
}
