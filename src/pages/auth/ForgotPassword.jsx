import { useState } from "react";
import { AuthApi } from "@/services/auth";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setSubmitting(true);
      await AuthApi.forgot(email.trim());
      await Swal.fire({
        icon: "success",
        title: "Check inbox",
        text: "If the email exists, a reset link has been sent.",
        confirmButtonText: "OK",
      });
      navigate("/login");
    } catch (e) {
      await Swal.fire({
        icon: "info",
        title: "Email sent (if exists)",
        text: "If the email exists, a reset link has been sent.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gray-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Forgot Password</h1>
        <p className="mt-1 text-sm text-gray-600">
          Enter the account email to receive a reset link.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-800">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="name@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? "Sending..." : "Send reset link"}
          </button>

          <div className="text-center">
            <Link to="/login" className="text-sm text-blue-600 hover:underline">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
