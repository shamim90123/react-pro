import { useMemo, useState } from "react";
import { LeadsApi } from "../../api/leadsApi";
import { SweetAlert } from "@/components/ui/SweetAlert";

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

export default function ModalContactList({ items, meta, leadId, onReload }) {
  // local edit state
  const [editingId, setEditingId] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    job_title: "",
  });

  // local copy feedback
  const [copied, setCopied] = useState({ id: null, field: null });

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

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (contactId) => {
    if (!editForm.first_name?.trim() || !editForm.last_name?.trim()) return;
    try {
      setEditSaving(true);
      await LeadsApi.updateContact(leadId, contactId, {
        first_name: editForm.first_name?.trim(),
        last_name: editForm.last_name?.trim(),
        email: editForm.email?.trim() || null,
        phone: editForm.phone?.trim() || null,
        job_title: editForm.job_title?.trim() || null,
      });
      setEditingId(null);
      await onReload(meta.current_page);
    } finally {
      setEditSaving(false);
    }
  };

  const handleSetPrimary = async (contactId) => {
    await LeadsApi.setPrimaryContact(contactId);
    await onReload(meta.current_page);
  };

  const handleDelete = async (contactId) => {
    const res = await SweetAlert.confirm({
      title: "Delete contact?",
      text: "This action cannot be undone.",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmColor: "#dc2626",
    });
    if (!res.isConfirmed) return;

    await LeadsApi.removeContact(contactId);
    SweetAlert.success("Contact deleted");

    const nextCount = items.length - 1;
    const nextPage =
      nextCount <= 0 && meta.current_page > 1 ? meta.current_page - 1 : meta.current_page;

    await onReload(nextPage);
  };

  const copyToClipboard = async (value, id, field) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
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

  const hasPages = useMemo(() => (meta?.last_page || 1) > 1, [meta?.last_page]);

  return (
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
                        onChange={(e) => setEditForm((f) => ({ ...f, first_name: e.target.value }))}
                      />
                      <input
                        className="rounded border px-2 py-1 text-sm"
                        placeholder="Last name"
                        value={editForm.last_name}
                        onChange={(e) => setEditForm((f) => ({ ...f, last_name: e.target.value }))}
                      />
                      <input
                        className="rounded border px-2 py-1 text-sm md:col-span-2"
                        placeholder="Email"
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                      />
                      <input
                        className="rounded border px-2 py-1 text-sm"
                        placeholder="Phone"
                        value={editForm.phone}
                        onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                      />
                      <input
                        className="rounded border px-2 py-1 text-sm"
                        placeholder="Job title"
                        value={editForm.job_title}
                        onChange={(e) => setEditForm((f) => ({ ...f, job_title: e.target.value }))}
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
                  <button
                    type="button"
                    className="rounded border px-2 py-1 text-xs hover:bg-white"
                    onClick={() => copyToClipboard(c.email, c.id, "email")}
                    title="Copy email"
                  >
                    {emailCopied ? "Copied!" : "Copy email"}
                  </button>
                )}

                {!isEditing && c.phone && (
                  <button
                    type="button"
                    className="rounded border px-2 py-1 text-xs hover:bg-white"
                    onClick={() => copyToClipboard(c.phone, c.id, "phone")}
                    title="Copy phone"
                  >
                    {phoneCopied ? "Copied!" : "Copy phone"}
                  </button>
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

      {hasPages && (
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Page {meta.current_page} of {meta.last_page} • Total {meta.total}
          </span>
          <div className="space-x-2">
            <button
              className="rounded border px-3 py-1 text-sm hover:bg-white disabled:opacity-50"
              disabled={meta.current_page <= 1}
              onClick={() => onReload(meta.current_page - 1)}
            >
              Prev
            </button>
            <button
              className="rounded border px-3 py-1 text-sm hover:bg-white disabled:opacity-50"
              disabled={meta.current_page >= meta.last_page}
              onClick={() => onReload(meta.current_page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
