import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LeadsApi } from "@/lib/leads"; // Correct API import

export default function LeadFormPage({ onClose }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    lead_name: "",
    destination_id: "",
    city: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const updateForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    try {
      await LeadsApi.create(form); // API call to create a new lead
      navigate("/lead-list"); // Redirect to lead list after creating a lead
    } catch (err) {
      console.error("Error creating lead:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-semibold text-gray-800">Create New Lead</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 mb-6">
          <input
            value={form.lead_name}
            onChange={(e) => updateForm("lead_name", e.target.value)}
            placeholder="Lead Name"
            className="px-3 py-2 border border-gray-300 rounded-lg"
            required
          />
          <input
            value={form.city}
            onChange={(e) => updateForm("city", e.target.value)}
            placeholder="City"
            className="px-3 py-2 border border-gray-300 rounded-lg"
            required
          />
          <select
            value={form.destination_id}
            onChange={(e) => updateForm("destination_id", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
            required
          >
            <option value="">Select Destination</option>
            <option value="1">Destination 1</option>
            <option value="2">Destination 2</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm text-white rounded-lg bg-[#282560]"
            disabled={submitting}
          >
            {submitting ? "Saving…" : "Save Lead"}
          </button>
        </div>
      </form>
    </div>
  );
}
