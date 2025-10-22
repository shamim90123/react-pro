import { useEffect, useMemo, useRef, useState } from "react";

export default function AccountManagerCell({
  lead,
  users,
  usersLoading,
  assigning,
  handleAssignAccountManager,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const isBusy = assigning[lead.id] || usersLoading;
  const wrapRef = useRef(null);

  const currentUserName = useMemo(() => {
    if (!lead?.account_manager_id) return null;
    const match = users.find((u) => String(u.id) === String(lead.account_manager_id));
    return match?.name || lead?.account_manager?.name || "—";
  }, [lead?.account_manager_id, lead?.account_manager, users]);

  // close edit on outside / ESC
  useEffect(() => {
    if (!isEditing) return;
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setIsEditing(false);
    };
    const onEsc = (e) => e.key === "Escape" && setIsEditing(false);
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [isEditing]);

  const onChange = async (e) => {
    const value = e.target.value || null;
    await handleAssignAccountManager(lead.id, value);
    setIsEditing(false);
  };

  return (
    <td className="px-6 py-3">
      <div ref={wrapRef} className="min-w-[220px]">
        {!isEditing ? (
          <div className="flex items-center gap-1 text-gray-900">
            <p
              className={`truncate text-sm ${
                currentUserName ? "font-medium text-gray-900" : "text-gray-500"
              }`}
            >
              {currentUserName || "No account manager"}
            </p>

            {/* tiny icon placed right next to name */}
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              disabled={isBusy}
              className={`inline-flex h-5 w-5 items-center justify-center rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 ${
                isBusy ? "cursor-not-allowed" : ""
              }`}
              title={currentUserName ? "Edit" : "Add"}
              aria-label={currentUserName ? "Edit account manager" : "Add account manager"}
            >
              {currentUserName ? (
                // pencil
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16.862 3.487a2.121 2.121 0 1 1 3 3L8.5 17.85l-4 1 1-4 11.362-11.363z" />
                </svg>
              ) : (
                // plus
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeWidth={1.8} d="M12 5v14M5 12h14" />
                </svg>
              )}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <select
              autoFocus
              className={`w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-60 ${
                isBusy ? "cursor-not-allowed" : ""
              }`}
              value={lead.account_manager_id ?? ""}
              onChange={onChange}
              disabled={isBusy}
            >
              <option value="">— Select —</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Cancel"
              title="Cancel"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeWidth={1.8} d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {usersLoading && <p className="mt-1 text-xs text-gray-400">Loading users…</p>}
      </div>
    </td>
  );
}
