// src/pages/roles/RoleForm.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { RolesApi } from "@/services/roles";

// helper
function groupPermissions(perms = []) {
  const groups = {};
  perms.forEach((p) => {
    const [head] = p.split(".");
    if (!groups[head]) groups[head] = [];
    groups[head].push(p);
  });
  Object.keys(groups).forEach((k) => groups[k].sort());
  return Object.fromEntries(Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0])));
}

export default function RoleForm({ mode = "create", initialName = "", initialPermissions = [], onSubmit, onCancel }) {
  const navigate = useNavigate();
  const [roleName, setRoleName] = useState(initialName || "");
  const [selected, setSelected] = useState(new Set(initialPermissions));
  const [search, setSearch] = useState("");
  const [allPermissions, setAllPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await RolesApi.listPermissions();
        setAllPermissions(Array.isArray(data) ? data : []);
      } catch (e) {
        await Swal.fire({ icon: "error", title: "Unable to load permissions", text: e?.data?.message || e?.message || "Please try again." });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // when initial props change (edit mode re-open)
  useEffect(() => {
    setRoleName(initialName || "");
    setSelected(new Set(initialPermissions || []));
  }, [initialName, initialPermissions]);

  const filtered = useMemo(() => {
    if (!search.trim()) return allPermissions;
    const q = search.toLowerCase();
    return allPermissions.filter((p) => p.toLowerCase().includes(q));
  }, [allPermissions, search]);
  const grouped = useMemo(() => groupPermissions(filtered), [filtered]);

  const isChecked = useCallback((perm) => selected.has(perm), [selected]);
  const toggleOne = useCallback((perm) => {
    setSelected((s) => {
      const next = new Set(s);
      next.has(perm) ? next.delete(perm) : next.add(perm);
      return next;
    });
  }, []);
  const setGroupAll = useCallback((perms, checked) => {
    setSelected((s) => {
      const next = new Set(s);
      perms.forEach((p) => (checked ? next.add(p) : next.delete(p)));
      return next;
    });
  }, []);
  const allVisiblePerms = useMemo(() => Object.values(grouped).flat(), [grouped]);
  const setAllVisible = useCallback((checked) => {
    setSelected((s) => {
      const next = new Set(s);
      allVisiblePerms.forEach((p) => (checked ? next.add(p) : next.delete(p)));
      return next;
    });
  }, [allVisiblePerms]);

  const allSelectedVisible = useMemo(
    () => allVisiblePerms.length > 0 && allVisiblePerms.every((p) => selected.has(p)),
    [allVisiblePerms, selected]
  );
  const someSelectedVisible = useMemo(
    () => allVisiblePerms.some((p) => selected.has(p)) && !allSelectedVisible,
    [allVisiblePerms, selected, allSelectedVisible]
  );

  const submit = async (e) => {
    e.preventDefault();
    const name = roleName.trim();
    if (!name) {
      await Swal.fire({ icon: "warning", title: "Role name is required" });
      return;
    }
    const perms = Array.from(selected);
    setSaving(true);
    try {
      await onSubmit({ name, permissions: perms });
    } finally {
      setSaving(false);
    }
  };

   const RoleList = () => navigate('/roles');

  return (
    <form onSubmit={submit} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-800">Role name</label>
        <input
          type="text"
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
          placeholder="e.g., sales-manager"
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
          required
        />
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search permissions (e.g., leads.update)"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="pointer-events-none absolute right-3 top-2.5 text-gray-400">🔎</span>
        </div>

        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300"
            checked={allSelectedVisible}
            onChange={(e) => setAllVisible(e.target.checked)}
            ref={(el) => {
              if (el) el.indeterminate = someSelectedVisible;
            }}
          />
          <span className="text-sm text-gray-800">Select all (visible)</span>
        </label>
      </div>

      {/* Permissions */}
      <div className="rounded-xl border border-gray-100">
        {loading ? (
          <div className="p-6 text-sm text-gray-600">Loading permissions…</div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="p-6 text-sm text-gray-600">No permissions found.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {Object.entries(grouped).map(([groupName, perms]) => {
              const groupAllChecked = perms.every((p) => selected.has(p));
              const groupSomeChecked = perms.some((p) => selected.has(p)) && !groupAllChecked;

              return (
                <div key={groupName} className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300"
                          checked={groupAllChecked}
                          onChange={(e) => setGroupAll(perms, e.target.checked)}
                          ref={(el) => {
                            if (el) el.indeterminate = groupSomeChecked;
                          }}
                        />
                        <span className="text-base font-semibold text-gray-900">{groupName}</span>
                      </label>
                      <span className="text-xs text-gray-500">{perms.length} item{perms.length > 1 ? "s" : ""}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                    {perms.map((perm) => (
                      <label key={perm} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300"
                          checked={isChecked(perm)}
                          onChange={() => toggleOne(perm)}
                        />
                        <span className="text-sm text-gray-800">{perm}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center justify-end gap-3">
         <button
          type="button"
          onClick={RoleList}
          className="btn-secondary"
        >
          Cancel
        </button>
      
        <button
          type="submit"
          disabled={saving || !roleName.trim()}
          className="rounded-lg bg-[#282560] px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#1f1c4d] disabled:opacity-60"
        >
          {saving ? (mode === "edit" ? "Updating…" : "Creating…") : mode === "edit" ? "Update Role" : "Create Role"}
        </button>
      </div>
    </form>
  );
}
