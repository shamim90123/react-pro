import { useState } from "react";

function formatDateTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso ?? "";
  }
}

export default function CommentsSection({
  loading,
  comments = [],
  meta,               // { current_page, last_page, total }
  page,
  onPageChange,       // (n) => void
  onAdd,              // (text) => Promise<void>
  onDelete,           // (id) => Promise<void>
}) {
  const [text, setText] = useState("");

  return (
    <section className="mt-10 rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Comments</h2>
        <div className="text-sm text-gray-500">
          Page {meta?.current_page ?? 1} of {meta?.last_page ?? 1} • {meta?.total ?? comments.length} total
        </div>
      </div>

      {/* Add comment */}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await onAdd(text);
          setText("");
        }}
        className="mb-6"
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Adding…" : "Add Comment"}
          </button>
        </div>
      </form>

      {/* Comments list */}
      <div className="rounded-lg border border-gray-100">
        {loading && comments.length === 0 ? (
          <div className="px-4 py-6 text-center text-gray-500">Loading comments…</div>
        ) : comments.length ? (
          <ul className="divide-y">
            {comments.map((c) => (
              <li key={c.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm text-gray-600">
                      <b>{c?.user?.name ?? "User"}</b>{" "}
                      <span className="text-gray-400">• {formatDateTime(c.created_at)}</span>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-gray-800">{c.comment}</p>
                  </div>
                  <button
                    onClick={() => onDelete(c.id)}
                    className="text-sm text-red-600 hover:underline"
                    title="Delete"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-4 py-6 text-center text-gray-500">No comments yet.</div>
        )}
      </div>

      {/* Pagination */}
      {(meta?.last_page ?? 1) > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1 || loading}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            Previous
          </button>
          <div className="text-sm text-gray-600">
            {page} / {meta?.last_page}
          </div>
          <button
            onClick={() => onPageChange(Math.min(meta.last_page, page + 1))}
            disabled={page >= meta.last_page || loading}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
