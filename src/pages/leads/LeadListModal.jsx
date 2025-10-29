import { useEffect, useState } from "react";
import SimpleModal from "@/components/ui/SimpleModal";
import { LeadsApi } from "@/services/leads";

export default function LeadDetailsModal({ open, onClose, lead, initialTab }) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const tab = initialTab || "contacts";

  useEffect(() => {
    if (open && lead?.id) load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lead?.id]);

  const load = async (page = 1) => {
    try {
      setLoading(true);
      if (tab === "contacts") {
        const res = await LeadsApi.listContacts(lead.id, { page, perPage: 10 });
        setItems(res.data);
        setMeta(res.meta || { current_page: page, last_page: 1, total: res.data?.length || 0 });
      } else {
        const res = await LeadsApi.listComments(lead.id, { page, perPage: 10 });
        setItems(res.data);
        setMeta(res.meta || { current_page: page, last_page: 1, total: res.data?.length || 0 });
      }
    } finally {
      setLoading(false);
    }
  };

  const title = `${lead?.lead_name || "Lead"} — ${tab === "contacts" ? "Contacts" : "Notes"}`;

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
          {tab === "contacts"
            ? items.map((c, idx) => (
                <div
                  key={c.id}
                  className={`rounded-lg border p-3 ${
                    idx % 2 === 0 ? "bg-blue-50" : "bg-indigo-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-gray-900">
                      {c.name || "—"}{" "}
                      {c.primary_status && (
                        <span className="ml-2 rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                          Primary
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
              ))
            : items.map((n, idx) => (
                 <div
                    key={n.id}
                    className={`rounded-lg border p-3 ${
                      idx % 2 === 0 ? "bg-[#f0f2f7]" : "bg-[#e4f1ff]"
                    }`}
                  >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">
                      {n.user?.name || "—"}
                    </div>
                    <div className="text-xs opacity-80">
                      {n.created_at
                        ? String(n.created_at).slice(0, 16).replace("T", " ")
                        : "—"}
                    </div>
                  </div>
                  <div className="mt-1 whitespace-pre-wrap text-sm">
                    {n.comment || n.body || "—"}
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
        <p className="text-sm text-gray-500">
          No {tab === "contacts" ? "contacts" : "notes"} found.
        </p>
      )}
    </SimpleModal>
  );
}
