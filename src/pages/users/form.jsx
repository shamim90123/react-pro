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
    role: "",
    image: null,
  });

  const [roles, setRoles] = useState([]);              // ✅ dynamic list
  const [rolesLoading, setRolesLoading] = useState(true);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

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
          image: null,
        });
        
        // Set image preview if user has an image
        if (data?.image_url) {
          setImagePreview(data.image_url);
        }
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        SweetAlert.error('Please select a valid image file (JPEG, PNG, GIF, WebP)');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        SweetAlert.error('Image size should be less than 5MB');
        return;
      }

      setForm((prev) => ({ ...prev, image: file }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setForm((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
    
    // If editing existing user with image, mark it for deletion
    if (isEdit && imagePreview && !imagePreview.startsWith('blob:')) {
      setForm((prev) => ({ ...prev, removeImage: true }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name?.trim()) return SweetAlert.error("Name is required");
    if (!form.email?.trim()) return SweetAlert.error("Email is required");
    if (!isEdit && !form.password) return SweetAlert.error("Password is required");
    if (!form.role) return SweetAlert.error("Select a role");

    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('name', form.name.trim());
      payload.append('email', form.email.trim());
      payload.append('role', form.role);

      // Append password if provided (or required for create)
      if (form.password) {
        payload.append('password', form.password);
      }

      // Append image if selected
      if (form.image) {
        payload.append('image', form.image);
      }

      // Handle image removal
      if (form.removeImage) {
        payload.append('remove_image', 'true');
      }

      if (isEdit) {
        // For file uploads, use POST with _method=PUT
        payload.append('_method', 'PUT');
        await UsersApi.update(id, payload);
        SweetAlert.success("User updated");
      } else {
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
          {/* Profile Image Upload */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-3">Profile Image</label>
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* Image Preview */}
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Profile preview"
                    className="h-24 w-24 rounded-full border-2 border-gray-200 object-cover shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-sm transition hover:bg-red-600"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Upload Area */}
              <div className="flex-1">
                <div className="flex flex-col gap-3">
                  <label
                    htmlFor="user-image"
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#282560] focus:ring-offset-2 ${
                      imagePreview ? 'sm:py-4' : 'py-8'
                    }`}
                  >
                    <svg
                      className="mb-2 h-8 w-8 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">
                      {imagePreview ? 'Change image' : 'Upload profile image'}
                    </span>
                    <span className="mt-1 text-xs text-gray-500">
                      PNG, JPG, GIF, WebP up to 5MB
                    </span>
                  </label>
                  <input
                    id="user-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  
                  {!imagePreview && (
                    <p className="text-xs text-gray-500">
                      Optional: Add a profile image for better identification
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

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