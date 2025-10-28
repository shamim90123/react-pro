// src/pages/users/form.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UsersApi } from "@/services/users";
import { RolesApi } from "@/services/roles";              // ✅ NEW
import { SweetAlert } from "@/components/ui/SweetAlert";

export default function UserFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = useMemo(() => Boolean(id), [id]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",                                          // 🔄 start empty; set after roles load
  });

  const [roles, setRoles] = useState([]);              // ✅ dynamic list
  const [rolesLoading, setRolesLoading] = useState(true);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  // Load roles (names)
  useEffect(() => {
    (async () => {
      try {
        setRolesLoading(true);
        const names = await RolesApi.listNames();      // e.g., ["admin","user","manager"]
        setRoles(names);
        // Preselect a sensible default if creating
        if (!isEdit) {
          setForm(s => ({ ...s, role: names?.[0] || "" }));
        }
      } catch (e) {
        SweetAlert.error(e?.data?.message || e?.message || "Failed to load roles");
      } finally {
        setRolesLoading(false);
      }
    })();
  }, [isEdit]);

  // Load user for edit
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        setLoading(true);
        const data = await UsersApi.get(id);
        // data.roles could be ["admin"] or array of role objects; normalize to first name
        const firstRole =
          Array.isArray(data?.roles) && data.roles.length
            ? (typeof data.roles[0] === "string" ? data.roles[0] : data.roles[0]?.name)
            : "";
        setForm({
          name: data?.name ?? "",
          email: data?.email ?? "",
          password: "",
          role: firstRole || "",
        });
      } catch (e) {
        SweetAlert.error(e?.message || "Failed to load user");
        navigate("/users", { replace: true });
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name?.trim()) return SweetAlert.error("Name is required");
    if (!form.email?.trim()) return SweetAlert.error("Email is required");
    if (!isEdit && !form.password) return SweetAlert.error("Password is required");
    if (!form.role) return SweetAlert.error("Select a role");

    setSaving(true);
    try {
      if (isEdit) {
        const payload = { name: form.name, email: form.email, roles: [form.role] }; // ✅ send array
        if (form.password) payload.password = form.password;
        await UsersApi.update(id, payload);
        SweetAlert.success("User updated");
      } else {
        const payload = { ...form, roles: [form.role] }; // ✅ send array
        delete payload.role;
        await UsersApi.create(payload);
        SweetAlert.success("User created");
      }
      navigate("/users", { replace: true });
    } catch (e) {
      SweetAlert.error(e?.data?.message || e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading user…</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">
          {isEdit ? "Edit User" : "Create New User"}
        </h1>
        <p className="text-sm text-gray-500">Fill in the user details below.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-2xl border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-xl focus:ring-1 focus:ring-[#282560] focus:border-[#282560]"
              placeholder="Full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-xl focus:ring-1 focus:ring-[#282560] focus:border-[#282560]"
              placeholder="Email address"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password {isEdit && <span className="text-gray-400">(leave blank to keep)</span>}
            </label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-xl focus:ring-1 focus:ring-[#282560] focus:border-[#282560]"
              placeholder={isEdit ? "New password (optional)" : "Password"}
              {...(isEdit ? {} : { required: true })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-xl bg-white focus:ring-1 focus:ring-[#282560] focus:border-[#282560]"
              disabled={rolesLoading}
            >
              {rolesLoading && <option>Loading…</option>}
              {!rolesLoading && roles.length === 0 && <option value="">No roles found</option>}
              {!rolesLoading &&
                roles.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button type="button" onClick={() => navigate("/users")} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
            {saving ? "Saving…" : isEdit ? "Update User" : "Create User"}
          </button>
        </div>
      </form>
    </div>
  );
}
