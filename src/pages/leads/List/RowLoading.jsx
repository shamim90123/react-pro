export default function RowLoading({ colSpan = 7 }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-2/3 rounded bg-gray-200" />
          <div className="h-4 w-1/2 rounded bg-gray-200" />
          <div className="h-4 w-3/4 rounded bg-gray-200" />
        </div>
      </td>
    </tr>
  );
}
