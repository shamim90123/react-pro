// src/pages/roles/RoleEdit.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import RoleForm from "./RoleForm";
import { RolesApi } from "@/services/roles";

export default function RoleEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState({ name: "", permissions: [] });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await RolesApi.get(id);
        setRole({
          name: data?.name || "",
          permissions: (data?.permissions || []).map((p) => (typeof p === "string" ? p : p?.name)).filter(Boolean),
        });
      } catch (e) {
        await Swal.fire({ icon: "error", title: "Failed to load role", text: e?.data?.message || e?.message });
        navigate("/roles", { replace: true });
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  const handleSubmit = async (payload) => {
    try {
      await RolesApi.update(id, payload);
      await Swal.fire({ icon: "success", title: "Role updated" });
      navigate("/roles", { replace: true });
    } catch (e) {
      await Swal.fire({ icon: "error", title: "Failed to update role", text: e?.data?.message || e?.message || "Please try again." });
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Edit Role</h1>
        </div>
        <RoleForm
          mode="edit"
          initialName={role.name}
          initialPermissions={role.permissions}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
