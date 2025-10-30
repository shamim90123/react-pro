import { useEffect, useState } from "react";
import SimpleModal from "@/components/ui/SimpleModal";
import { LeadsApi } from "@/services/leads";

export default function LeadContactsModal({ open, onClose, lead }) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });

  useEffect(() => {
    if (open && lead?.id) load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lead?.id]);

  const load = async (page = 1) => {
    try {
      setLoading(true);
      const res = await LeadsApi.listContacts(lead.id, { page, perPage: 10 });
      setItems(res.data);
      setMeta(res.meta || { current_page: page, last_page: 1, total: res.data?.length || 0 });
    } finally {
      setLoading(false);
    }
  };

  const title = `${lead?.lead_name || "Lead"} — Contacts`;

  return (
    <SimpleModal open={open} onClose={onClose} title={title}>
      {loading ? (
        <div className="space-y-2">
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
        </div>
      ) : items.length ? (
        <div className="space-y-3">
          {items.map((c, idx) => (
            <div
              key={c.id}
              className={`rounded-lg border p-3 ${idx % 2 === 0 ? "bg-blue-50" : "bg-indigo-50"}`}
            >
              <div className="flex items-center justify-between">
                <div className="font-medium text-gray-900">
                  {c.name || "—"}{" "}
                  {c.primary_status && (
                    <span className="ml-2 rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                      Primary Contact
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">{c.job_title || "—"}</div>
              </div>
              <div className="mt-1 text-sm text-gray-700">
                <div>Email: {c.email || "—"}</div>
                <div>Phone: {c.phone || "—"}</div>
                {c.department && <div>Department: {c.department}</div>}
              </div>
            </div>
          ))}

          {meta?.last_page > 1 && (
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Page {meta.current_page} of {meta.last_page} • Total {meta.total}
              </span>
              <div className="space-x-2">
                <button
                  className="rounded border px-3 py-1 text-sm disabled:opacity-50"
                  disabled={meta.current_page <= 1}
                  onClick={() => load(meta.current_page - 1)}
                >
                  Prev
                </button>
                <button
                  className="rounded border px-3 py-1 text-sm disabled:opacity-50"
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

      <div className="mt-4 flex items-center justify-end border-t pt-3">
        <button type="button" onClick={onClose} className="btn-secondary px-4 py-2 rounded-lg">
          Cancel
        </button>
      </div>
    </SimpleModal>
  );
}
