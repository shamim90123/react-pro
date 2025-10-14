import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LeadsApi } from "@/lib/leads";
import { SweetAlert } from "@/components/ui/SweetAlert";

export default function LeadFormPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    firstname: "",
    lastname: "",
    job_title: "",
    phone: "",
    city: "",
    link: "",
    item_id: "",
    sams_pay: "",
    sams_manage: "",
    sams_platform: "",
    sams_pay_client_management: "",
    booked_demo: "",
    comments: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const update = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Lead name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      await LeadsApi.create(form);
      navigate("/lead-list");
    } catch (err) {
      SweetAlert.error(err.message || "Failed to save lead");
    } finally {
      setSubmitting(false);
    }
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

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-white px-8 py-10">
        <form onSubmit={handleSubmit} className="w-full">
          {/* Basic Info */}
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-600 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lead Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="e.g., John Doe / ACME University"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="example@domain.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="+8801XXXXXXXXX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  value={form.firstname}
                  onChange={(e) => update("firstname", e.target.value)}
                  placeholder="First name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  value={form.lastname}
                  onChange={(e) => update("lastname", e.target.value)}
                  placeholder="Last name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                <input
                  value={form.job_title}
                  onChange={(e) => update("job_title", e.target.value)}
                  placeholder="Admissions Lead / Manager"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  placeholder="e.g., Dhaka"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
                <input
                  value={form.link}
                  onChange={(e) => update("link", e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item ID</label>
                <input
                  value={form.item_id}
                  onChange={(e) => update("item_id", e.target.value)}
                  placeholder="Internal reference id"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </section>

          {/* Products & Booking */}
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-600 mb-4">Product Interests & Booking</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SAMS Pay</label>
                <input
                  type="text"
                  value={form.sams_pay}
                  onChange={(e) => update("sams_pay", e.target.value)}
                  placeholder="SAMS Pay"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SAMS Manage</label>
                <input
                  type="text"
                  value={form.sams_manage}
                  onChange={(e) => update("sams_manage", e.target.value)}
                  placeholder="SAMS Manage"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SAMS Platform</label>
                <input
                  type="text"
                  value={form.sams_platform}
                  onChange={(e) => update("sams_platform", e.target.value)}
                  placeholder="SAMS Platform"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SAMS Pay Client Management</label>
                <input
                  type="text"
                  value={form.sams_pay_client_management}
                  onChange={(e) => update("sams_pay_client_management", e.target.value)}
                  placeholder="SAMS Pay Client Management"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Booked Demo</label>
                <input
                  type="text"
                  value={form.booked_demo}
                  onChange={(e) => update("booked_demo", e.target.value)}
                  placeholder="Booked Demo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </section>

          {/* Comments */}
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-600 mb-4">Comments</h2>
            <textarea
              rows={8}
              value={form.comments}
              onChange={(e) => update("comments", e.target.value)}
              placeholder="Add internal notes or background info..."
              className="w-full min-h-[10rem] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </section>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white rounded-lg disabled:opacity-60"
              style={{ backgroundColor: "#282560" }}
              disabled={submitting}
            >
              {submitting ? "Saving…" : "Save Lead"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
