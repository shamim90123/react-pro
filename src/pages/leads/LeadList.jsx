// src/pages/LeadList.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LeadsApi } from "@/lib/leads";
import { SweetAlert } from "@/components/ui/SweetAlert";

export default function LeadList() {
  // -------------------- Router --------------------
  const navigate = useNavigate();

  // -------------------- State --------------------
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);

  // form
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    lead_id: undefined,
    lead_name: "",
    destination_id: "",
    city: "",
  });

  // list controls
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  // -------------------- Helpers --------------------
  const updateForm = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const resetForm = () =>
    setForm({ lead_id: undefined, lead_name: "", destination_id: "", city: "" });

  const formatDate = (iso) => {
    if (!iso) return "—";
    // Show local date (YYYY-MM-DD)
    try {
      const d = new Date(iso);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    } catch {
      return String(iso).slice(0, 10);
    }
  };

  const totalPages = useMemo(
    () => (total > 0 ? Math.ceil(total / perPage) : 1),
    [total, perPage]
  );

  const hasLeads = useMemo(() => (leads || []).length > 0, [leads]);

  // -------------------- API --------------------
  const fetchLeads = async ({ p = page, ps = perPage, q = query } = {}) => {
    setLoading(true);
    try {
      const res = await LeadsApi.list({ page: p, perPage: ps, q });
      // Laravel paginator expected: { data, meta, links }
      setLeads(res?.data || []);
      setTotal(res?.meta?.total ?? (res?.data?.length || 0));
    } catch (err) {
      console.error("Error fetching leads", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await LeadsApi.create({
        lead_id: form.lead_id, // optional for update
        lead_name: form.lead_name,
        destination_id: form.destination_id,
        city: form.city,
      });
      await fetchLeads({ p: 1 }); // refresh from first page so new item is visible
      setPage(1);
      setShowLeadForm(false);
      resetForm();
    } catch (err) {
      console.error("Error saving lead:", err);
      SweetAlert?.error?.("Failed to save lead");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLead = async (id) => {
    try {
      const result = await SweetAlert.confirm({
        title: "Delete Lead?",
        text: "This action cannot be undone.",
        confirmButtonText: "Yes, delete it",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        SweetAlert.info("Deleting...");
        await LeadsApi.remove(id);
        SweetAlert.success("Lead deleted successfully");
        // If last item on page deleted, pull previous page if possible
        const isLastItem = leads.length === 1 && page > 1;
        const newPage = isLastItem ? page - 1 : page;
        setPage(newPage);
        fetchLeads({ p: newPage });
      }
    } catch (err) {
      console.error("Error deleting lead:", err);
      SweetAlert.error("Failed to delete lead");
    }
  };

  // -------------------- Effects --------------------
  useEffect(() => {
    fetchLeads({ p: page, ps: perPage, q: query });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, perPage]);

  // simple debounce for search
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchLeads({ p: 1, ps: perPage, q: query });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // -------------------- Handlers --------------------
  const toggleLeadForm = () => {
    setShowLeadForm((s) => !s);
    if (showLeadForm) resetForm(); // closing: clear form
  };

  const handleEditLead = (id) => {
    const leadToEdit = leads.find((l) => l.id === id);
    if (!leadToEdit) return;
    setForm({
      lead_id: leadToEdit.id,
      lead_name: leadToEdit.lead_name || "",
      destination_id: leadToEdit.destination_id || "",
      city: leadToEdit.city || "",
    });
    setShowLeadForm(true);
  };

  const handleViewLead = (id) => navigate(`/leads/${id}/edit`);

  // -------------------- Render --------------------
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
          Lead List
        </h1>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search leads…"
              className="w-full sm:w-64 rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔎
            </span>
          </div>

          <button
            onClick={toggleLeadForm}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700 active:scale-[.99]"
          >
            + Add Lead
          </button>
        </div>
      </div>

      {/* Form (modal on mobile) */}
      {showLeadForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={toggleLeadForm}
          />
          <div className="relative w-full sm:max-w-2xl sm:rounded-xl bg-white shadow-xl p-4 sm:p-6 rounded-t-xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-800">
                {form.lead_id ? "Edit Lead" : "Add Lead"}
              </h2>
              <button
                onClick={toggleLeadForm}
                className="rounded-md p-2 hover:bg-gray-100"
                aria-label="Close"
              >
                ✖
              </button>
            </div>

            <LeadForm
              form={form}
              submitting={submitting}
              onChange={updateForm}
              onCancel={toggleLeadForm}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      )}

      {/* Desktop Table / Mobile Cards */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        {/* Table (md and up) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-100 text-xs font-semibold uppercase text-gray-600">
              <tr>
                <th className="px-6 py-3">Lead Name</th>
                <th className="px-6 py-3">City</th>
                <th className="px-6 py-3">Created At</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <RowLoading colSpan={4} />
              ) : hasLeads ? (
                leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b border-gray-100 bg-white hover:bg-gray-50"
                  >
                    <td
                      className="cursor-pointer px-6 py-3 font-medium text-gray-900 hover:underline"
                      onClick={() => handleViewLead(lead.id)}
                    >
                      {lead.lead_name}
                    </td>
                    <td className="px-6 py-3">{lead.city || "—"}</td>
                    <td className="px-6 py-3">
                      {formatDate(lead.created_at)}
                    </td>
                    <td className="space-x-2 px-6 py-3 text-right">
                      <button
                        onClick={() => handleViewLead(lead.id)}
                        className="inline-flex items-center gap-1 rounded-md bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 transition hover:bg-green-100"
                      >
                        👁️ View
                      </button>
                      <button
                        onClick={() => handleEditLead(lead.id)}
                        className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteLead(lead.id)}
                        className="inline-flex items-center gap-1 rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-100"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <RowEmpty colSpan={4} />
              )}
            </tbody>
          </table>
        </div>

        {/* Cards (mobile) */}
        <div className="md:hidden divide-y divide-gray-100">
          {loading ? (
            <MobileLoading />
          ) : hasLeads ? (
            leads.map((lead) => (
              <div key={lead.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="min-w-0 flex-1"
                    onClick={() => handleViewLead(lead.id)}
                  >
                    <div className="font-semibold text-gray-900">
                      {lead.lead_name}
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      <span className="block">
                        <strong className="text-gray-700">City:</strong>{" "}
                        {lead.city || "—"}
                      </span>
                      <span className="block">
                        <strong className="text-gray-700">Created:</strong>{" "}
                        {formatDate(lead.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col gap-2">
                    <button
                      onClick={() => handleViewLead(lead.id)}
                      className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEditLead(lead.id)}
                      className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteLead(lead.id)}
                      className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">No leads found.</div>
          )}
        </div>
      </div>

      {/* Footer controls */}
      <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <div className="text-sm text-gray-600">
          Total: <span className="font-medium">{total}</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Per page</label>
          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setPage(1);
            }}
            className="rounded-md border border-gray-300 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-2 text-sm text-gray-700">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==================== Sub-Components ==================== */

function LeadForm({ form, submitting, onChange, onCancel, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="flex w-full flex-wrap items-center gap-4">
      <div className="min-w-[220px] flex-1">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Lead Name
        </label>
        <input
          value={form.lead_name}
          onChange={(e) => onChange("lead_name", e.target.value)}
          placeholder="Lead Name"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      <div className="min-w-[220px] flex-1">
        <label className="mb-1 block text-sm font-medium text-gray-700">City</label>
        <input
          value={form.city}
          onChange={(e) => onChange("city", e.target.value)}
          placeholder="City"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      <div className="min-w-[220px] flex-1">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Destination
        </label>
        <select
          value={form.destination_id}
          onChange={(e) => onChange("destination_id", e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          required
        >
          <option value="">Select Destination</option>
          {/* Replace with real destinations from API if available */}
          <option value="1">Destination 1</option>
          <option value="2">Destination 2</option>
        </select>
      </div>

      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className={`rounded-lg px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors duration-200 ${
            submitting
              ? "cursor-not-allowed bg-blue-300"
              : "bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200"
          }`}
        >
          {submitting ? "Saving…" : form.lead_id ? "Update" : "Save"}
        </button>
      </div>
    </form>
  );
}

function RowLoading({ colSpan }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-2/3 rounded bg-gray-200" />
          <div className="h-4 w-1/2 rounded bg-gray-200" />
          <div className="h-4 w-3/4 rounded bg-gray-200" />
        </div>
      </td>
    </tr>
  );
}

function RowEmpty({ colSpan }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-6 text-center text-gray-500">
        No leads found.
      </td>
    </tr>
  );
}

function MobileLoading() {
  return (
    <div className="p-4">
      <div className="animate-pulse space-y-3">
        <div className="h-5 w-40 rounded bg-gray-200" />
        <div className="h-4 w-24 rounded bg-gray-200" />
        <div className="h-4 w-32 rounded bg-gray-200" />
      </div>
    </div>
  );
}
