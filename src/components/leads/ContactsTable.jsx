export default function ContactsTable({ contacts = [], onEdit }) {
  return (
    <div className="mb-6 overflow-x-auto rounded-lg border border-gray-100 bg-white">
      <table className="min-w-full table-auto">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Email</th>
            <th className="px-4 py-2 text-left">Phone</th>
            <th className="px-4 py-2 text-left">Job Title</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((c, i) => (
            <tr key={i} className="border-b">
              <td className="px-4 py-2">{c.name}</td>
              <td className="px-4 py-2">{c.email}</td>
              <td className="px-4 py-2">{c.phone}</td>
              <td className="px-4 py-2">{c.job_title}</td>
              <td className="px-4 py-2">
                <button onClick={() => onEdit(i)} className="text-blue-600 hover:underline">
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
