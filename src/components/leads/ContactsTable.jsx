import ContactActions from "./ContactActions";

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
                className={`transition-colors ${i % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-indigo-50`}
              >
                <td className="px-4 py-3 text-gray-600">{i + 1}</td>

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

                <td className="px-4 py-3">{c.email || "—"}</td>
                <td className="px-4 py-3">{c.phone || "—"}</td>
                <td className="px-4 py-3">{c.job_title || "—"}</td>

                <td className="px-4 py-3 text-right">
                  <ContactActions
                    contact={c}
                    rowIndex={i}
                    onEdit={onEdit}
                    onMakePrimary={onMakePrimary}
                    onDelete={onDelete}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-6 py-6 text-center text-gray-500 italic bg-gray-50">
                No contacts found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
