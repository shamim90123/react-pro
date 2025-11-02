import { useEffect, useState } from "react";
import SimpleModal from "@/components/ui/SimpleModal";
import UISkeleton from "@/components/ui/UISkeleton";
import { LeadsApi } from "../../api/leadsApi";
import ModalContactForm from "./ModalContactForm";
import ModalContactList from "./ModalContactList";

export default function ModalContact({ open, onClose, lead }) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [showAdd, setShowAdd] = useState(false);

  const title = `${lead?.lead_name || "Lead"} — Contacts`;

  // load contacts
  const load = async (page = 1) => {
    if (!lead?.id) return;
    try {
      setLoading(true);
      const res = await LeadsApi.listContacts(lead.id, { page, perPage: 10 });

      // normalize first/last if backend sometimes returns `name`
      const normalized = (res.data || []).map((c) => {
        const hasFirst = typeof c.first_name === "string" && c.first_name.length > 0;
        const hasLast = typeof c.last_name === "string" && c.last_name.length > 0;
        if (hasFirst || hasLast) return c;

        const name = (c.name || "").trim();
        if (!name) return { ...c, first_name: "", last_name: "" };
        const parts = name.split(/\s+/);
        return { ...c, first_name: parts[0] || "", last_name: parts.slice(1).join(" ") || "" };
      });

      setItems(normalized);
      setMeta(
        res.meta || { current_page: page, last_page: 1, total: normalized.length }
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && lead?.id) {
      setShowAdd(false);
      load(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lead?.id]);

  // create contact (payload comes from form)
  const handleCreate = async (payload) => {
    await LeadsApi.createContact(lead.id, payload);
    setShowAdd(false);
    await load(meta.current_page);
  };

  return (
    <SimpleModal open={open} onClose={onClose} title={title}>
      {/* Add contact toggle */}
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          className="rounded-lg border px-3 py-1.5 text-sm hover:bg-white"
          onClick={() => setShowAdd((s) => !s)}
        >
          {showAdd ? "Cancel" : "Add Contact"}
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <ModalContactForm
          onCreate={handleCreate}
          onCancel={() => setShowAdd(false)}
        />
      )}

      {/* List / Loading / Empty */}
      {loading ? (
        <div className="space-y-2">
          <UISkeleton height={16} width="75%" />
          <UISkeleton height={16} width="66%" />
          <UISkeleton height={16} width="50%" />
        </div>
      ) : items.length ? (
        <ModalContactList
          items={items}
          meta={meta}
          leadId={lead.id}
          onReload={load}
        />
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
