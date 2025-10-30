import { useEffect, useMemo, useState } from "react";
import SimpleModal from "@/components/ui/SimpleModal";
import { LeadsApi } from "@/services/leads";
import { SweetAlert } from "@/components/ui/SweetAlert";


export default function LeadContactsModal({ open, onClose, lead }) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });

  // --- add form state ---
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    job_title: "",
    primary_status: false,
  });
  const canSave = useMemo(
    () => form.first_name.trim().length > 0 && form.last_name.trim().length > 0,
    [form.first_name, form.last_name]
  );

  // --- edit state ---
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    job_title: "",
  });
  const [editSaving, setEditSaving] = useState(false);

  // --- copied state (for UX feedback) ---
  const [copied, setCopied] = useState({ id: null, field: null });

  // --- helpers ---
  const splitName = (c = {}) => {
    const hasFirst = typeof c.first_name === "string" && c.first_name.length > 0;
    const hasLast = typeof c.last_name === "string" && c.last_name.length > 0;
    if (hasFirst || hasLast) return { first: c.first_name || "", last: c.last_name || "" };

    const name = (c.name || "").trim();
    if (!name) return { first: "", last: "" };
    const parts = name.split(/\s+/);
    return { first: parts[0] || "", last: parts.slice(1).join(" ") || "" };
  };

  const initials = (first = "", last = "") =>
    `${(first?.[0] || "").toUpperCase()}${(last?.[0] || "").toUpperCase()}` || "—";

  const getProductNames = (c) =>
    Array.isArray(c?.products)
      ? c.products.map((p) => (typeof p === "string" ? p : p?.name)).filter(Boolean)
      : [];

  const resetForm = () =>
    setForm({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      job_title: "",
      primary_status: false,
    });

  const copyToClipboard = async (value, id, field) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied({ id, field });
    setTimeout(() => setCopied({ id: null, field: null }), 1200);
  };

  // --- effects ---
  useEffect(() => {
    if (open && lead?.id) {
      setShowAdd(false);
      setEditingId(null);
      load(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lead?.id]);

  // --- data load (with normalization for first/last) ---
  const load = async (page = 1) => {
    try {
      setLoading(true);
      const res = await LeadsApi.listContacts(lead.id, { page, perPage: 10 });

      const normalized = (res.data || []).map((c) => {
        const { first, last } = splitName(c);
        return {
          ...c,
          first_name: c.first_name ?? first,
          last_name: c.last_name ?? last,
        };
      });

      setItems(normalized);
      setMeta(
        res.meta || {
          current_page: page,
          last_page: 1,
          total: normalized.length,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const title = `${lead?.lead_name || "Lead"} — Contacts`;

  // --- add handlers ---
  const handleAddContact = async (e) => {
    e?.preventDefault?.();
    if (!canSave) return;

    try {
      setSaving(true);
      await LeadsApi.createContact(lead.id, {
        first_name: form.first_name?.trim(),
        last_name: form.last_name?.trim(),
        email: form.email?.trim() || null,
        phone: form.phone?.trim() || null,
        job_title: form.job_title?.trim() || null,
        // department removed
        primary_status: !!form.primary_status, // maps to is_primary in API layer
      });

      resetForm();
      setShowAdd(false);
      await load(meta.current_page);
    } finally {
      setSaving(false);
    }
  };

  // --- edit handlers ---
  const startEdit = (c) => {
    const { first, last } = splitName(c);
    setEditingId(c.id);
    setEditForm({
      first_name: first,
      last_name: last,
      email: c.email || "",
      phone: c.phone || "",
      job_title: c.job_title || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (contactId) => {
    if (!editForm.first_name?.trim() || !editForm.last_name?.trim()) return;

    try {
      setEditSaving(true);
      await LeadsApi.updateContact(lead.id, contactId, {
        first_name: editForm.first_name?.trim(),
        last_name: editForm.last_name?.trim(),
        email: editForm.email?.trim() || null,
        phone: editForm.phone?.trim() || null,
        job_title: editForm.job_title?.trim() || null,
        // department removed
      });
      setEditingId(null);
      await load(meta.current_page);
    } finally {
      setEditSaving(false);
    }
  };

  // --- other actions ---
  const handleSetPrimary = async (contactId) => {
    try {
      setLoading(true);
      await LeadsApi.setPrimaryContact(contactId);
      await load(meta.current_page);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (contactId) => {
    // Ask for confirmation
    const res = await SweetAlert.confirm({
      title: "Delete contact?",
      text: "This action cannot be undone.",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmColor: "#dc2626", // Tailwind red-600 for emphasis
    });

    if (!res.isConfirmed) return;

    try {
      setLoading(true);
      await LeadsApi.removeContact(contactId);

      // Optional: success toast
      SweetAlert.success("Contact deleted");

      // Keep pagination tidy (stay on page unless it becomes empty)
      const nextCount = items.length - 1;
      const nextPage =
        nextCount <= 0 && meta.current_page > 1 ? meta.current_page - 1 : meta.current_page;

      await load(nextPage);
    } catch (e) {
      // Optional: error toast
      SweetAlert.error(
        e?.response?.data?.message || "Failed to delete the contact"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SimpleModal open={open} onClose={onClose} title={title}>
      {/* Add contact toggle + form */}
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          className="rounded-lg border px-3 py-1.5 text-sm hover:bg-white"
          onClick={() => setShowAdd((s) => !s)}
          disabled={editingId !== null}
          title={editingId ? "Finish editing first" : ""}
        >
          {showAdd ? "Cancel" : "Add Contact"}
        </button>
      </div>

      {showAdd && (
        <form
          onSubmit={handleAddContact}
          className="mb-4 grid grid-cols-1 gap-3 rounded-lg border p-3 md:grid-cols-2"
        >
          <div>
            <label className="mb-1 block text-xs text-gray-600">First Name *</label>
            <input
              type="text"
              className="w-full rounded border px-3 py-2 text-sm"
              value={form.first_name}
              onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-600">Last Name *</label>
            <input
              type="text"
              className="w-full rounded border px-3 py-2 text-sm"
              value={form.last_name}
              onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-600">Email</label>
            <input
              type="email"
              className="w-full rounded border px-3 py-2 text-sm"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-600">Phone</label>
            <input
              type="tel"
              className="w-full rounded border px-3 py-2 text-sm"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-600">Job Title</label>
            <input
              type="text"
              className="w-full rounded border px-3 py-2 text-sm"
              value={form.job_title}
              onChange={(e) => setForm((f) => ({ ...f, job_title: e.target.value }))}
            />
          </div>

          <div className="flex items-center gap-2 md:col-span-2">
            <input
              id="primary_status"
              type="checkbox"
              className="h-4 w-4"
              checked={form.primary_status}
              onChange={(e) => setForm((f) => ({ ...f, primary_status: e.target.checked }))}
            />
            <label htmlFor="primary_status" className="text-sm text-gray-700">
              Select primary contact
            </label>
          </div>

          <div className="md:col-span-2 flex items-center justify-end gap-2">
            <button
              type="button"
              className="btn-secondary rounded-lg px-4 py-2"
              onClick={() => {
                resetForm();
                setShowAdd(false);
              }}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              disabled={!canSave || saving}
            >
              {saving ? "Saving..." : "Save Contact"}
            </button>
          </div>
        </form>
      )}

      {/* List contacts */}
      {loading ? (
        <div className="space-y-2">
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
        </div>
      ) : items.length ? (
        <div className="space-y-3">
          {items.map((c, idx) => {
            const { first, last } = splitName(c);
            const fullName = `${first} ${last}`.trim() || c.name || "—";
            const prods = getProductNames(c);
            const isEditing = editingId === c.id;

            const emailCopied = copied.id === c.id && copied.field === "email";
            const phoneCopied = copied.id === c.id && copied.field === "phone";

            return (
              <div
                key={c.id}
                className={`rounded-lg border p-3 ${idx % 2 === 0 ? "bg-blue-50/50" : "bg-indigo-50/50"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: avatar + name/edit */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
                      {initials(first, last)}
                    </div>
                    <div className="min-w-0">
                      {isEditing ? (
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                          <input
                            className="rounded border px-2 py-1 text-sm"
                            placeholder="First name"
                            value={editForm.first_name}
                            onChange={(e) =>
                              setEditForm((f) => ({ ...f, first_name: e.target.value }))
                            }
                          />
                          <input
                            className="rounded border px-2 py-1 text-sm"
                            placeholder="Last name"
                            value={editForm.last_name}
                            onChange={(e) =>
                              setEditForm((f) => ({ ...f, last_name: e.target.value }))
                            }
                          />
                          <input
                            className="rounded border px-2 py-1 text-sm md:col-span-2"
                            placeholder="Email"
                            type="email"
                            value={editForm.email}
                            onChange={(e) =>
                              setEditForm((f) => ({ ...f, email: e.target.value }))
                            }
                          />
                          <input
                            className="rounded border px-2 py-1 text-sm"
                            placeholder="Phone"
                            value={editForm.phone}
                            onChange={(e) =>
                              setEditForm((f) => ({ ...f, phone: e.target.value }))
                            }
                          />
                          <input
                            className="rounded border px-2 py-1 text-sm"
                            placeholder="Job title"
                            value={editForm.job_title}
                            onChange={(e) =>
                              setEditForm((f) => ({ ...f, job_title: e.target.value }))
                            }
                          />
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-gray-900">{fullName}</span>
                            {c.primary_status && (
                              <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] text-emerald-700">
                                Primary Contact
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">{c.job_title || "—"}</div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right: actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    {!isEditing && c.email && (
                      <>
                        {/* <a
                          href={`mailto:${c.email}`}
                          className="rounded border px-2 py-1 text-xs text-indigo-700 hover:bg-white"
                          title="Send email"
                        >
                          Email
                        </a> */}
                        <button
                          type="button"
                          className="rounded border px-2 py-1 text-xs hover:bg-white"
                          onClick={() => copyToClipboard(c.email, c.id, "email")}
                          title="Copy email"
                        >
                          {emailCopied ? "Copied!" : "Copy email"}
                        </button>
                      </>
                    )}
                    {!isEditing && c.phone && (
                      <>
                        {/* <a
                          href={`tel:${c.phone}`}
                          className="rounded border px-2 py-1 text-xs text-indigo-700 hover:bg-white"
                          title="Call"
                        >
                          Call
                        </a> */}
                        <button
                          type="button"
                          className="rounded border px-2 py-1 text-xs hover:bg-white"
                          onClick={() => copyToClipboard(c.phone, c.id, "phone")}
                          title="Copy phone"
                        >
                          {phoneCopied ? "Copied!" : "Copy phone"}
                        </button>
                      </>
                    )}

                    {!isEditing && !c.primary_status && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(c.id)}
                        className="rounded border px-2 py-1 text-xs hover:bg-white"
                        title="Set primary"
                      >
                        Set primary
                      </button>
                    )}

                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => saveEdit(c.id)}
                          className="rounded border border-emerald-300 bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                          disabled={editSaving}
                          title="Save"
                        >
                          {editSaving ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="rounded border px-2 py-1 text-xs hover:bg-white"
                          title="Cancel"
                          disabled={editSaving}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(c)}
                          className="rounded border px-2 py-1 text-xs hover:bg-white"
                          title="Edit"
                          disabled={showAdd}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id)}
                          className="rounded border px-2 py-1 text-xs text-red-700 hover:bg-white"
                          title="Delete"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* non-edit extra fields */}
                {!isEditing && (
                  <>
                    <div className="mt-2 text-sm text-gray-700">
                      <div>Email: {c.email || "—"}</div>
                      <div>Phone: {c.phone || "—"}</div>
                      {/* department removed */}
                    </div>

                    {/* Products (chips) */}
                    {prods.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {prods.map((name, i) => (
                          <span
                            key={`${c.id}-prod-${i}`}
                            className="rounded-full border border-indigo-200 bg-white/70 px-2.5 py-0.5 text-xs text-indigo-800"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}

          {meta?.last_page > 1 && (
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Page {meta.current_page} of {meta.last_page} • Total {meta.total}
              </span>
              <div className="space-x-2">
                <button
                  className="rounded border px-3 py-1 text-sm hover:bg-white disabled:opacity-50"
                  disabled={meta.current_page <= 1}
                  onClick={() => load(meta.current_page - 1)}
                >
                  Prev
                </button>
                <button
                  className="rounded border px-3 py-1 text-sm hover:bg-white disabled:opacity-50"
                  disabled={meta.current_page >= meta.last_page}
                  onClick={() => load(meta.current_page + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No contacts found.</p>
      )}

      {/* footer */}
      <div className="mt-4 flex items-center justify-end border-t pt-3">
        <button type="button" onClick={onClose} className="btn-secondary rounded-lg px-4 py-2">
          Close
        </button>
      </div>
    </SimpleModal>
  );
}
