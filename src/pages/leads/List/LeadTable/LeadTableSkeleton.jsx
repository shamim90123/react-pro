import UISkeleton from "@/components/ui/UISkeleton";

export default function LeadTableSkeleton({
  rows = 10,
  height = 12,
  columnWidths = [24, 140, 240, 90, 80, 72, 120], // SL, AM, Uni, Contacts, Notes, Status, Actions
}) {
  const cellClasses = [
    "px-4 py-3",                 // SL
    "px-6 py-3",                 // Account Manager
    "px-6 py-3",                 // University Name
    "px-6 py-3",                 // Contacts
    "px-6 py-3",                 // Notes
    "px-6 py-3",                 // Status
    "px-6 py-3 text-right",      // Actions
  ];

  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={`sk-${r}`} className="h-12">
          {columnWidths.map((w, c) => (
            <td key={`skc-${r}-${c}`} className={cellClasses[c]}>
              <UISkeleton height={height} width={w} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
