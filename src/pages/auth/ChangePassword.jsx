import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { AuthApi } from "@/services/auth";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext"; // ⬅️ use the context logout

function validatePasswordRules(pw) {
  const errors = [];
  if (!pw) errors.push("New password is required");
  else {
    if (pw.length < 8) errors.push("At least 8 characters");
    if (!/[a-z]/.test(pw)) errors.push("At least one lowercase letter");
    if (!/[A-Z]/.test(pw)) errors.push("At least one uppercase letter");
    if (!/[0-9]/.test(pw)) errors.push("At least one number");
  }
  return errors;
}

export default function ChangePassword() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [next2, setNext2] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const { logout } = useAuth(); // ⬅️ hard-logout after password change

  const setFieldTouched = (field) =>
    setTouched((t) => ({ ...t, [field]: true }));

  const validateAll = useCallback(() => {
    const nextErrors = {};

    // current password
    if (!current?.trim()) nextErrors.current = "Current password is required";

    // new password rules
    const ruleErrors = validatePasswordRules(next);
    if (ruleErrors.length) nextErrors.next = ruleErrors.join(" • ");

    // confirmation
    if (!next2) nextErrors.next2 = "Confirm the new password";
    else if (next2 !== next) nextErrors.next2 = "Passwords do not match";

    setErrors(nextErrors);
    return nextErrors;
  }, [current, next, next2]);

  // Re-validate fields on change when already touched
  useEffect(() => {
    if (Object.keys(touched).length) validateAll();
  }, [current, next, next2, touched, validateAll]);

  const onSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = validateAll();
    if (Object.keys(nextErrors).length) {
      const first = Object.keys(nextErrors)[0];
      await Swal.fire({
        icon: "warning",
        title: "Please fix the highlighted fields",
        text: nextErrors[first],
      });
      return;
    }

    try {
      setSubmitting(true);

      await AuthApi.change({
        current_password: current,
        password: next,
        password_confirmation: next2,
      });

      await Swal.fire({
        icon: "success",
        title: "Password changed",
        text: "Sign in again with the new password.",
      });

      // 🔒 Force logout (server invalidates tokens; client clears state + storage)
      logout(); // clears token & user via context
      navigate("/login", { replace: true });
    } catch (err) {
      const msg =
        err?.data?.message || err?.message || "Please try again.";

      await Swal.fire({
        icon: "error",
        title: "Unable to change password",
        text: msg,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="min-h-[calc(100vh-56px)] grid place-items-center bg-gray-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
        <h1 className="text-xl font-semibold text-gray-900">Change Password</h1>
        <p className="mt-1 text-sm text-gray-600">
          Update the account password. After updating, sign in again.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-800">
              Current Password
            </label>
            <input
              type="password"
              required
              value={current}
              onBlur={() => setFieldTouched("current")}
              onChange={(e) => setCurrent(e.target.value)}
              className={`mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 ${
                touched.current && errors.current
                  ? "border-red-300 focus:ring-red-400"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            {touched.current && errors.current && (
              <p className="mt-1 text-xs text-red-600">{errors.current}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-800">
              New Password
            </label>
            <input
              type="password"
              required
              value={next}
              onBlur={() => setFieldTouched("next")}
              onChange={(e) => setNext(e.target.value)}
              className={`mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 ${
                touched.next && errors.next
                  ? "border-red-300 focus:ring-red-400"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="••••••••"
              autoComplete="new-password"
            />
            <p className="mt-1 text-[11px] text-gray-500">
              Must be 8+ chars, include upper &amp; lower case letters and a number.
            </p>
            {touched.next && errors.next && (
              <p className="mt-1 text-xs text-red-600">{errors.next}</p>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-800">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={next2}
              onBlur={() => setFieldTouched("next2")}
              onChange={(e) => setNext2(e.target.value)}
              className={`mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 ${
                touched.next2 && errors.next2
                  ? "border-red-300 focus:ring-red-400"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="••••••••"
              autoComplete="new-password"
            />
            {touched.next2 && errors.next2 && (
              <p className="mt-1 text-xs text-red-600">{errors.next2}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || hasErrors}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
            title={hasErrors ? "Fix the errors before submitting" : "Update password"}
          >
            {submitting ? "Updating..." : "Update password"}
          </button>

          <div className="text-center">
            <Link to="/dashboard" className="text-sm text-blue-600 hover:underline">
              Back to Dashboard
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
