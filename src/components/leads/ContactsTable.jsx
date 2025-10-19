export default function ContactsTable({ contacts = [], onEdit, onMakePrimary, onDelete }) {
  return (
    <div className="mb-6 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100 text-gray-700">
            <th className="w-12 px-4 py-3 text-left font-semibold">#</th>
            <th className="px-4 py-3 text-left font-semibold">Name</th>
            <th className="px-4 py-3 text-left font-semibold">Email</th>
            <th className="px-4 py-3 text-left font-semibold">Phone</th>
            <th className="px-4 py-3 text-left font-semibold">Job Title</th>
            <th className="px-4 py-3 text-left font-semibold">Actions</th>
          </tr>
        </thead>

        <tbody className="text-gray-700">
          {contacts.length > 0 ? (
            contacts.map((c, i) => (
              <tr
                key={c.id ?? i}
                className={`transition-colors ${
                  i % 2 === 0 ? "bg-gray-50" : "bg-white"
                } hover:bg-indigo-50`}
              >
                {/* Serial */}
                <td className="px-4 py-3 text-gray-600">{i + 1}</td>

                {/* Name + Primary badge */}
                <td className="px-4 py-3 font-medium text-gray-800">
                  <div className="flex items-center gap-2">
                    <span>{c.name}</span>
                    {Number(c.is_primary) === 1 && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 border border-green-200">
                        Primary
                      </span>
                    )}
                  </div>
                </td>


                {/* Other columns */}
                <td className="px-4 py-3">{c.email || "—"}</td>
                <td className="px-4 py-3">{c.phone || "—"}</td>
                <td className="px-4 py-3">{c.job_title || "—"}</td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {!c.is_primary && (
                      <button
                        onClick={() => onMakePrimary?.(c)}
                        className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                      >
                        Make Primary
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(i)}
                      className="rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete?.(c)}
                      className="rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={6}
                className="px-6 py-6 text-center text-gray-500 italic bg-gray-50"
              >
                No contacts found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
