import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
    notes: "",
  });
  const [errors, setErrors] = useState({});

  const update = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Lead name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    addLead(form);
    navigate("/lead-list");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-800">Create New Lead</h1>
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-1.5 text-sm text-white rounded-lg"
          style={{ backgroundColor: "#282560" }}
        >
          Back
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-white px-8 py-10">
        <form onSubmit={handleSubmit} className="w-full">

          <section className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Lead Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lead Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="e.g., John Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.name && (
                  <p className="text-xs text-red-600 mt-1">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="example@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1">{errors.email}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
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
             
            </div>
          </section>

          {/* Section: Notes */}
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-600 mb-4">Notes</h2>
            <textarea
              rows={8}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Add internal notes or background info..."
              className="w-full min-h-[10rem] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </section>

          {/* Actions BELOW the fields (right-aligned) */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
             <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white rounded-lg"
              style={{
                backgroundColor: "#282560",
                transition: "background-color 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#1e1b4a")}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#282560")}
            >
              Save Lead
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
