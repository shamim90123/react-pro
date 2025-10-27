import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { AuthApi } from "@/services/auth";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validatePasswordRules(pw) {
  const errors = [];
  if (pw.length < 8) errors.push("At least 8 characters");
  if (!/[a-z]/.test(pw)) errors.push("At least one lowercase letter");
  if (!/[A-Z]/.test(pw)) errors.push("At least one uppercase letter");
  if (!/[0-9]/.test(pw)) errors.push("At least one number");
  return errors;
}

// Optional: placeholder for future breach-check (uncompromised password)
async function isLikelyCompromised(_pw) {
  return false;
}

export default function ResetPassword() {
  const [sp] = useSearchParams();
  const navigate = useNavigate();

  const token = sp.get("token") || "";
  const emailFromLink = sp.get("email") || "";

  const [email, setEmail] = useState(emailFromLink);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  const tokenMissing = useMemo(() => !token, [token]);

  useEffect(() => setEmail(emailFromLink), [emailFromLink]);

  const setFieldTouched = (field) =>
    setTouched((t) => ({ ...t, [field]: true }));

  const validateAll = useCallback(
    async (opts = {}) => {
      const next = {};

      // token
      if (!token) next.token = "Reset token is missing or invalid.";

      // email
      const e = (email || "").trim();
      if (!e) next.email = "Email is required.";
      else if (!emailRegex.test(e)) next.email = "Enter a valid email address.";

      // password rules
      const pw = password || "";
      if (!pw) {
        next.password = "New password is required.";
      } else {
        const ruleErrors = validatePasswordRules(pw);
        if (ruleErrors.length) next.password = ruleErrors.join(" • ");
      }

      // confirm password
      if (!password2) next.password2 = "Confirm the new password.";
      else if (password2 !== password)
        next.password2 = "Passwords do not match.";

      // optional uncompromised check
      if (opts.checkPwned && !next.password) {
        try {
          const pwned = await isLikelyCompromised(pw);
          if (pwned) {
            next.password =
              "This password appears in public breach lists. Choose a different one.";
          }
        } catch {
          // ignore network issues
        }
      }

      setErrors(next);
      return next;
    },
    [token, email, password, password2]
  );

  // Inline re-validation
  useEffect(() => {
    if (Object.keys(touched).length) validateAll();
  }, [email, password, password2, touched, validateAll]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const next = await validateAll({ checkPwned: false });
    if (Object.keys(next).length > 0) {
      const first = Object.keys(next)[0];
      await Swal.fire({
        icon: "warning",
        title: "Please fix the highlighted fields",
        text: next[first],
      });
      return;
    }

    try {
      setSubmitting(true);
      await AuthApi.reset({
        token,
        email: email.trim().toLowerCase(),
        password,
        password_confirmation: password2,
      });
      await Swal.fire({
        icon: "success",
        title: "Password reset",
        text: "Password has been reset. Please log in.",
      });
      navigate("/login");
    } catch (err) {
      const firstValidationError =
        err?.data?.errors ? Object.values(err.data.errors)?.[0]?.[0] : null;

      const msg =
        err?.data?.message ||
        firstValidationError ||
        err?.message ||
        "Something went wrong.";

      await Swal.fire({
        icon: "error",
        title: "Reset failed",
        text: msg,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="min-h-screen grid place-items-center bg-gray-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Reset Password</h1>
        <p className="mt-1 text-sm text-gray-600">
          Create a new password for the account.
        </p>

        {tokenMissing ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              {errors.token ||
                "Reset token is missing. Open the link from the email or request a new one."}
            </div>
            <Link
              to="/forgot-password"
              className="text-blue-600 hover:underline text-sm"
            >
              Request a new link
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-800">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onBlur={() => setFieldTouched("email")}
                onChange={(e) => setEmail(e.target.value)}
                className={`mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 ${
                  touched.email && errors.email
                    ? "border-red-300 focus:ring-red-400"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                placeholder="name@example.com"
                autoComplete="email"
              />
              {touched.email && errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-800">
                New Password
              </label>
              <input
                type="password"
                required
                value={password}
                onBlur={() => setFieldTouched("password")}
                onChange={(e) => setPassword(e.target.value)}
                className={`mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 ${
                  touched.password && errors.password
                    ? "border-red-300 focus:ring-red-400"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                autoComplete="new-password"
              />
              <p className="mt-1 text-[11px] text-gray-500">
                Must be 8+ chars, include upper &amp; lower case letters and a
                number.
              </p>
              {touched.password && errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-800">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={password2}
                onBlur={() => setFieldTouched("password2")}
                onChange={(e) => setPassword2(e.target.value)}
                className={`mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 ${
                  touched.password2 && errors.password2
                    ? "border-red-300 focus:ring-red-400"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                autoComplete="new-password"
              />
              {touched.password2 && errors.password2 && (
                <p className="mt-1 text-xs text-red-600">{errors.password2}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || hasErrors}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
              title={hasErrors ? "Fix the errors before submitting" : "Reset password"}
            >
              {submitting ? "Resetting..." : "Reset password"}
            </button>

            <div className="text-center">
              <Link to="/login" className="text-sm text-blue-600 hover:underline">
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
