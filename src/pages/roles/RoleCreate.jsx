// src/pages/roles/RoleCreate.jsx
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import RoleForm from "./RoleForm";
import { RolesApi } from "@/services/roles";

export default function RoleCreate() {
  const navigate = useNavigate();

  const handleSubmit = async (payload) => {
    try {
      await RolesApi.create(payload);
      await Swal.fire({ icon: "success", title: "Role created" });
      navigate("/roles", { replace: true });
    } catch (e) {
      await Swal.fire({ icon: "error", title: "Failed to create role", text: e?.data?.message || e?.message || "Please try again." });
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Create Role</h1>
        </div> */}
        <RoleForm mode="create" onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
