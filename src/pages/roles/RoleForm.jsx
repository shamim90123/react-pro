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

export default function RoleForm({
   mode = "create",
   initialName = "",
   initialPermissions, // no default [] here
   onSubmit,
 }) {
  const navigate = useNavigate();
  const [roleName, setRoleName] = useState(initialName || "");
  const [selected, setSelected] = useState(new Set(initialPermissions || []));
  const [search, setSearch] = useState("");
  const [allPermissions, setAllPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [collapsed, setCollapsed] = useState({}); // { groupName: bool }
  const [expandAllFlag, setExpandAllFlag] = useState(true); // track current expand/collapse intent

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await RolesApi.listPermissions();
        setAllPermissions(Array.isArray(data) ? data : []);
      } catch (e) {
        await Swal.fire({
          icon: "error",
          title: "Unable to load permissions",
          text: e?.data?.message || e?.message || "Please try again.",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // when initial props change (edit mode re-open)
  useEffect(() => {
   if (mode !== "edit") return;
   setRoleName(initialName || "");
   setSelected(new Set(initialPermissions || []));
 }, [mode, initialName, initialPermissions]);

  const filtered = useMemo(() => {
    if (!search.trim()) return allPermissions;
    const q = search.toLowerCase();
    return allPermissions.filter((p) => p.toLowerCase().includes(q));
  }, [allPermissions, search]);

  const grouped = useMemo(() => groupPermissions(filtered), [filtered]);
  const allVisiblePerms = useMemo(() => Object.values(grouped).flat(), [grouped]);

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

  const setAllVisible = useCallback((checked) => {
    setSelected((s) => {
      const next = new Set(s);
      allVisiblePerms.forEach((p) => (checked ? next.add(p) : next.delete(p)));
      return next;
    });
  }, [allVisiblePerms]);

  const clearAll = useCallback(() => setSelected(new Set()), []);
  const selectAll = useCallback(() => setSelected(new Set(allPermissions)), [allPermissions]);

  const allSelectedVisible = useMemo(
    () => allVisiblePerms.length > 0 && allVisiblePerms.every((p) => selected.has(p)),
    [allVisiblePerms, selected]
  );
  const someSelectedVisible = useMemo(
    () => allVisiblePerms.some((p) => selected.has(p)) && !allSelectedVisible,
    [allVisiblePerms, selected, allSelectedVisible]
  );

  const selectedCount = selected.size;
  const groupsCount = Object.keys(grouped).length;
  const totalPerms = allPermissions.length;

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

  const goList = () => navigate("/roles");

  const toggleCollapseAll = () => {
    const next = !expandAllFlag;
    // if next is false => collapse all, if true => expand all
    const nextState = {};
    Object.keys(grouped).forEach((g) => (nextState[g] = !next)); // collapsed = !expand
    setCollapsed(nextState);
    setExpandAllFlag(next);
  };

  // chip remover
  const removeChip = (perm) => {
    setSelected((s) => {
      const next = new Set(s);
      next.delete(perm);
      return next;
    });
  };

  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-7xl">
      {/* Page header */}
      <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {mode === "edit" ? "Edit Role" : "Create Role"}
          </h1>
          <p className="text-sm text-gray-500">Define role name and assign permissions.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goList}
            className="btn-secondary"
          >
            Back to Roles
          </button>
          {/* <button
            type="submit"
            disabled={saving || !roleName.trim()}
            className="rounded-xl bg-[#282560] px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#1f1c4d] disabled:opacity-60"
          >
            {saving ? (mode === "edit" ? "Updating…" : "Creating…") : mode === "edit" ? "Update Role" : "Create Role"}
          </button> */}
        </div>
      </div>

      {/* Card */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Top section: name + toolbar */}
        <div className="border-b border-gray-100 px-5 pb-4 pt-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
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

            <div className="flex flex-col gap-3 md:items-end">
              <div className="relative w-full md:w-80">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search permissions (e.g., leads.update)"
                  className="w-full rounded-lg border border-gray-300 bg-white/80 px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Search permissions"
                />
                <span className="pointer-events-none absolute right-3 top-2.5 text-gray-400">🔎</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
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

                <button
                  type="button"
                  onClick={selectAll}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-50"
                >
                  Select all
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-50"
                >
                  Clear all
                </button>
                <button
                  type="button"
                  onClick={toggleCollapseAll}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-50"
                >
                  {expandAllFlag ? "Collapse all" : "Expand all"}
                </button>
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
              <div className="text-gray-500">Total permissions</div>
              <div className="text-base font-semibold text-gray-900">{totalPerms}</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
              <div className="text-gray-500">Selected</div>
              <div className="text-base font-semibold text-gray-900">{selectedCount}</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
              <div className="text-gray-500">Groups (visible)</div>
              <div className="text-base font-semibold text-gray-900">{groupsCount}</div>
            </div>
          </div>

          {/* Selected preview chips */}
          {/* {selectedCount > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {Array.from(selected).slice(0, 10).map((perm) => (
                <span
                  key={perm}
                  className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700"
                >
                  {perm}
                  <button
                    type="button"
                    onClick={() => removeChip(perm)}
                    className="rounded p-0.5 text-emerald-700 hover:bg-emerald-100"
                    aria-label={`Remove ${perm}`}
                    title="Remove"
                  >
                    ×
                  </button>
                </span>
              ))}
              {selectedCount > 10 && (
                <span className="text-xs text-gray-500">+{selectedCount - 10} more</span>
              )}
            </div>
          )} */}
        </div>

        {/* Permissions */}
        <div className="px-5 py-5">
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

                  const isCollapsed = collapsed[groupName] ?? false;

                  return (
                    <div key={groupName} className="p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              setCollapsed((c) => ({ ...c, [groupName]: !isCollapsed }))
                            }
                            className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                            aria-expanded={!isCollapsed}
                            aria-controls={`grp-${groupName}`}
                            title={isCollapsed ? "Expand" : "Collapse"}
                          >
                            {isCollapsed ? "▶" : "▼"}
                          </button>

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
                            <span className="text-base font-semibold text-gray-900">
                              {groupName}
                            </span>
                          </label>
                          <span className="text-xs text-gray-500">
                            {perms.length} item{perms.length > 1 ? "s" : ""}
                          </span>
                        </div>

                        {/* quick actions per-group */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setGroupAll(perms, true)}
                            className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                          >
                            Select
                          </button>
                          <button
                            type="button"
                            onClick={() => setGroupAll(perms, false)}
                            className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                          >
                            Clear
                          </button>
                        </div>
                      </div>

                      {!isCollapsed && (
                        <div
                          id={`grp-${groupName}`}
                          className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3"
                        >
                          {perms.map((perm) => (
                            <label
                              key={perm}
                              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50"
                            >
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
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="border-t border-gray-100 px-5 py-4">
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={goList}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !roleName.trim()}
              className="rounded-xl bg-[#282560] px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#1f1c4d] disabled:opacity-60"
            >
              {saving ? (mode === "edit" ? "Updating…" : "Creating…") : mode === "edit" ? "Update Role" : "Create Role"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
