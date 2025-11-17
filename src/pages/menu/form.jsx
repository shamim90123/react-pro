import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MenuApi } from "@/services/Menus";

const initialForm = {
  name: "",
  icon: "",
  route: "",
  parent_id: "",
  sort_order: 0,
  is_active: 1,
  permission_name: "",
};

export default function MenuFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const title = id ? "Edit Menu" : "Add Menu";

  const canSave = useMemo(
    () => form.name.trim().length > 0 && !saving,
    [form.name, saving]
  );

  // Load parent menus
  useEffect(() => {
    (async () => {
      try {
        const list = await MenuApi.parents();
        setParents(list);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // Load menu for edit
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const data = await MenuApi.show(id);
        setForm({
          name: data?.name ?? "",
          icon: data?.icon ?? "",
          route: data?.route ?? "",
          parent_id: data?.parent_id ?? "",
          sort_order: data?.sort_order ?? 0,
          is_active: data?.is_active ?? 1,
          permission_name: data?.permission_name ?? "",
        });
      } catch {
        setError("Failed to load menu.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSave) return;

    try {
      setSaving(true);

      const payload = { ...form, name: form.name.trim() };

      if (id) await MenuApi.update(id, payload);
      else await MenuApi.create(payload);

      navigate("/menus");
    } catch {
      setError("Error saving menu.");
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-3">{title}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Menu Name *</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Icon */}
        <div>
          <label className="block text-sm font-medium mb-1">Icon (Lucide)</label>
          <input
            type="text"
            name="icon"
            value={form.icon}
            onChange={handleChange}
            placeholder="e.g. Users, Settings, LayoutDashboard"
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Route */}
        <div>
          <label className="block text-sm font-medium mb-1">Route</label>
          <input
            type="text"
            name="route"
            value={form.route}
            onChange={handleChange}
            placeholder="/dashboard/users"
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Parent Menu */}
        <div>
          <label className="block text-sm font-medium mb-1">Parent Menu</label>
          <select
            name="parent_id"
            value={form.parent_id}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">None (Main Menu)</option>
            {parents.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-sm font-medium mb-1">Sort Order</label>
          <input
            type="number"
            name="sort_order"
            value={form.sort_order}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Permission Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Permission Name</label>
          <input
            type="text"
            name="permission_name"
            value={form.permission_name}
            onChange={handleChange}
            placeholder="menu.view, lead.create, user.manage"
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/menus")}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            {saving ? "Saving…" : id ? "Save Changes" : "Save"}
          </button>
        </div>

      </form>
    </div>
  );
}
