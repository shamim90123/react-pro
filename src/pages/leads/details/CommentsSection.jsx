import { useMemo, useRef, useState } from "react";

// --- Utils ---
function formatDateTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso ?? "";
  }
}

function avatarInitial(name) {
  if (!name) return "U";
  const parts = String(name).trim().split(" ").filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function CommentsSection({
  loading,
  comments = [],
  meta,               // { current_page, last_page, total }
  page,
  onPageChange,       // (n) => void
  onAdd,              // (text) => Promise<void>
  onDelete,           // (id) => Promise<void>
  onEdit,             // (id, text) => Promise<void>
  maxLength = 1000,
}) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const remaining = useMemo(() => maxLength - (text?.length || 0), [text, maxLength]);
  const canSubmit = !loading && !submitting && text.trim().length > 0 && remaining >= 0;

  const textareaRef = useRef(null);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!canSubmit) return;
    setSubmitting(true);
    const val = text.trim();
    try {
      if (editingId) {
        await onEdit(editingId, val);
        setEditingId(null);
      } else {
        await onAdd(val);
      }
      setText("");
      textareaRef.current?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  const onKeyDown = (e) => {
    const hotkey = (e.ctrlKey || e.metaKey) && e.key === "Enter";
    if (hotkey && canSubmit) handleSubmit(e);
  };

  // Pagination helpers
  const lastPage = meta?.last_page ?? 1;
  const current = clamp(page ?? 1, 1, lastPage);

  const pageItems = useMemo(() => {
    const pages = [];
    const push = (p) => pages.push(p);
    if (lastPage <= 7) {
      for (let i = 1; i <= lastPage; i++) push(i);
    } else {
      const addRange = (s, e) => { for (let i = s; i <= e; i++) push(i); };
      push(1);
      if (current > 4) push("…");
      addRange(Math.max(2, current - 1), Math.min(lastPage - 1, current + 1));
      if (current < lastPage - 3) push("…");
      push(lastPage);
    }
    return pages;
  }, [current, lastPage]);

  return (
    <section className="mt-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-gray-800">Comments</h2>
        <div className="text-sm text-gray-500">
          Page {meta?.current_page ?? 1} of {meta?.last_page ?? 1} • {meta?.total ?? comments.length} total
        </div>
      </div>

      {/* Composer (Add + Edit) */}
      <form onSubmit={handleSubmit} className="mb-5 rounded-lg border border-gray-200 bg-gray-50 p-3">
        {editingId && (
          <div className="mb-2 text-xs text-gray-500">Editing comment #{editingId}</div>
        )}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Write a comment…  (Ctrl/⌘ + Enter to submit)"
          rows={3}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none"
          maxLength={maxLength}
        />
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className={remaining < 0 ? "text-red-600" : "text-gray-500"}>
            {remaining >= 0 ? `${remaining} characters left` : `${-remaining} over limit`}
          </span>
          <div className="flex items-center gap-2">
            {editingId && (
              <button
                type="button"
                onClick={() => { setEditingId(null); setText(""); }}
                className="rounded-md border border-gray-300 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={!canSubmit}
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (editingId ? "Updating…" : "Adding…") : (editingId ? "Update Comment" : "Add Comment")}
            </button>
          </div>
        </div>
      </form>

      {/* List */}
      <div className="rounded-lg border border-gray-200">
        {loading && comments.length === 0 ? (
          <div className="space-y-3 p-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`rounded-md p-3 ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                <div className="mb-2 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gray-200" />
                  <div className="h-3 w-40 animate-pulse rounded bg-gray-200" />
                </div>
                <div className="h-3 w-full animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : comments.length ? (
          <ul className="divide-y">
            {comments.map((c, idx) => {
              const striped = idx % 2 === 0 ? "bg-gray-50" : "bg-white";
              // const userName = c?.user?.name ?? "User";
             const userName =
                  (c?.author?.name && c.author.name !== "Unknown"
                    ? c.author.name
                    : c?.user?.name || c?.contact?.name || "User");

              return (
                <li key={c.id} className={`${striped} px-4 py-3`}>
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: avatar + content (FIX: render actual content) */}
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
                        {avatarInitial(userName)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2 text-xs text-gray-600">
                          <b className="text-gray-800">{userName}</b>
                          <span className="text-gray-400">• {formatDateTime(c?.created_at)}</span>
                        </div>
                        <p className="mt-1 whitespace-pre-wrap break-words text-sm text-gray-800">
                          {c?.comment}
                        </p>
                      </div>
                    </div>

                    {/* Right: actions */}
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditingId(c.id);
                          setText(String(c.comment ?? ""));
                          setTimeout(() => textareaRef.current?.focus(), 0);
                        }}
                        disabled={loading}
                        className="rounded-md px-2 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Edit"
                      >
                        Edit
                      </button>

                      <button
                        onClick={async () => {
                          if (deletingId) return;
                          try {
                            setDeletingId(c.id);
                            await onDelete(c.id);
                            if (editingId === c.id) {
                              setEditingId(null);
                              setText("");
                            }
                          } finally {
                            setDeletingId(null);
                          }
                        }}
                        disabled={deletingId === c.id || loading}
                        className="rounded-md px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Delete"
                      >
                        {deletingId === c.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="px-6 py-10 text-center text-gray-500">
            No comments yet. Be the first to add one.
          </div>
        )}
      </div>

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => onPageChange(clamp(current - 1, 1, lastPage))}
            disabled={current <= 1 || loading}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Previous
          </button>

          <div className="flex items-center gap-1">
            {pageItems.map((p, i) =>
              p === "…" ? (
                <span key={`e-${i}`} className="px-2 text-sm text-gray-500">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  disabled={p === current || loading}
                  className={[
                    "min-w-8 rounded-md px-2.5 py-1.5 text-sm",
                    p === current
                      ? "bg-indigo-600 font-semibold text-white"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50",
                  ].join(" ")}
                >
                  {p}
                </button>
              )
            )}
          </div>

          <button
            onClick={() => onPageChange(clamp(current + 1, 1, lastPage))}
            disabled={current >= lastPage || loading}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
