import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useLeadsStore } from "../../store/leads";

const STATUSES = ["New", "Contacted", "Qualified", "Won", "Lost"];

export default function LeadFormPage() {
  const navigate = useNavigate();
  const addLead = useLeadsStore((s) => s.addLead);

  const [form, setForm] = useState({
    name: "",
    email: "",
    status: "New",
    date: new Date().toISOString().slice(0, 10),
  });
  const [errors, setErrors] = useState({});

  const update = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Lead name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      e.email = "Enter a valid email.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    addLead(form);            // persist in global store
    navigate("/leads");       // redirect to list
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-800">Create Lead</h1>
          <button
            onClick={() => navigate(-1)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Back
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Lead Name</label>
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., John Doe"
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="example@email.com"
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => update("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Created At</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Create Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
