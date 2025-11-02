import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { SweetAlert } from "@/components/ui/SweetAlert";
import { LeadsApi } from "@/pages/leads/api/leadsApi"
import { UsersApi } from "@/services/users"; // must expose .list(): GET /api/users -> { data: [...] }

function initials(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}

export default function LeadHeader({ lead, onManagerUpdated }) {
  const navigate = useNavigate();

  // derive current manager
  const currentManager = lead?.account_manager || null; // { id, name }
  const [manager, setManager] = useState(currentManager);
  useEffect(() => setManager(lead?.account_manager || null), [lead?.account_manager]);

  // edit popover
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(manager?.id ?? "");

  // close popover on outside click
  const popoverRef = useRef(null);
  useEffect(() => {
    const onDocClick = (e) => {
      if (!isOpen) return;
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [isOpen]);

  const openEditor = async () => {
    setIsOpen((v) => !v);
    if (!isOpen && users.length === 0) {
      try {
        setUsersLoading(true);
        const res = await UsersApi.list(); // should return { data: [...] }
        setUsers(res?.data || []);
      } catch (e) {
        console.error(e);
        SweetAlert.error("Failed to load users");
      } finally {
        setUsersLoading(false);
      }
    }
  };

  const handleSave = async () => {
    const normalized = selectedUserId === "" ? null : Number(selectedUserId);
    const prevManager = manager;

    try {
      setSaving(true);

      // optimistic UI
      const picked = users.find((u) => Number(u.id) === normalized) || null;
      setManager(picked ? { id: picked.id, name: picked.name } : null);

      // API call (Axios wrapper returns res.data)
      await LeadsApi.assignAccountManager(lead.id, normalized);

      // notify parent if provided
      onManagerUpdated?.({
        ...lead,
        account_manager_id: normalized,
        account_manager: picked ? { id: picked.id, name: picked.name } : null,
      });

      SweetAlert.success("Account manager updated");
      setIsOpen(false);
    } catch (e) {
      console.error(e);
      // revert
      setManager(prevManager);
      SweetAlert.error(e?.message || "Could not update account manager");
    } finally {
      setSaving(false);
    }
  };

  // keep select value aligned when lead changes
  useEffect(() => {
    setSelectedUserId(manager?.id ?? "");
  }, [manager?.id]);

  return (
    <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header Row */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-gray-800">
          {/* Flag before lead name */}
          {lead?.destination?.iso_3166_2 && (
            <img
              src={`/flags/1x1/${lead.destination.iso_3166_2.toLowerCase()}.svg`}
              alt={lead?.destination?.name || "Flag"}
              title={lead?.destination?.name || ""}
              className="h-6 w-6 rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/img/no-img.png";
              }}
            />
          )}
          {lead.lead_name || "Unnamed Lead"}
        </h1>

        <button
          onClick={() => navigate("/leads")}
          className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
        >
          ← Back to List
        </button>
      </div>

      {/* Lead Info */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Destination */}
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
          <p className="text-xs uppercase text-gray-500">Country</p>
          <p className="mt-1 text-sm font-medium text-gray-800">
            {lead.destination?.name ?? "—"}
          </p>
        </div>

        {/* City */}
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
          <p className="text-xs uppercase text-gray-500">City</p>
          <p className="mt-1 text-sm font-medium text-gray-800">
            {lead.city || "—"}
          </p>
        </div>

        {/* Account Manager (view + edit) */}
        <div className="relative rounded-lg border border-gray-100 bg-gray-50 p-4" ref={popoverRef}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase text-gray-500">Account Manager</p>
              <div className="mt-1 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-800">
                  {manager?.name ? initials(manager.name) : "—"}
                </div>
                <p className="text-sm font-medium text-gray-800">
                  {manager?.name || "—"}
                </p>
              </div>
            </div>

            {/* Edit button */}
            <button
              type="button"
              onClick={openEditor}
              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
              title="Edit account manager"
            >
              {/* Pencil icon */}
              <svg
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M13.586 3.586a2 2 0 012.828 2.828l-9.5 9.5a1 1 0 01-.293.195l-3 1a1 1 0 01-1.27-1.27l1-3a1 1 0 01.195-.293l9.5-9.5zM12 5l3 3" />
              </svg>
            </button>
          </div>

          {/* Popover */}
          {isOpen && (
            <div className="absolute right-3 top-14 z-10 w-72 rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                Select Manager
              </label>
              <select
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                disabled={usersLoading || saving}
              >
                <option value="">— None —</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
              {usersLoading && (
                <p className="mt-1 text-xs text-gray-400">Loading users…</p>
              )}

              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUserId(manager?.id ?? "");
                    setIsOpen(false);
                  }}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
