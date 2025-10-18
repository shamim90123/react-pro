import React from "react";

export default function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  showRange = true,
  showFirstLast = true,
  disabled = false,
  className = "",
}) {
  const totalPages = Math.max(1, Math.ceil((total || 0) / (pageSize || 1)));
  const current = Math.min(Math.max(page || 1, 1), totalPages);

  const start = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const end = Math.min(current * pageSize, total || 0);

  const canPrev = current > 1 && !disabled;
  const canNext = current < totalPages && !disabled;

  const goFirst = () => canPrev && onPageChange?.(1);
  const goPrev = () => canPrev && onPageChange?.(current - 1);
  const goNext = () => canNext && onPageChange?.(current + 1);
  const goLast = () => canNext && onPageChange?.(totalPages);

  return (
    <div
      className={
        "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 " +
        className
      }
    >
      {showRange && (
        <div className="text-xs text-gray-600">
          Showing{" "}
          <span className="font-medium">{start}</span>–
          <span className="font-medium">{end}</span> of{" "}
          <span className="font-medium">{total || 0}</span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <label className="text-xs text-gray-600">Rows per page</label>
        <select
          className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={pageSize}
          disabled={disabled}
          onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
          aria-label="Rows per page"
        >
          {pageSizeOptions.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1">
          {showFirstLast && (
            <button
              onClick={goFirst}
              disabled={!canPrev}
              className="px-2 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50"
              aria-label="First page"
              title="First"
            >
              «
            </button>
          )}
          <button
            onClick={goPrev}
            disabled={!canPrev}
            className="px-2 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50"
            aria-label="Previous page"
            title="Previous"
          >
            Prev
          </button>

          <span className="px-2 text-xs text-gray-600">
            Page <strong>{current}</strong> of <strong>{totalPages}</strong>
          </span>

          <button
            onClick={goNext}
            disabled={!canNext}
            className="px-2 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50"
            aria-label="Next page"
            title="Next"
          >
            Next
          </button>
          {showFirstLast && (
            <button
              onClick={goLast}
              disabled={!canNext}
              className="px-2 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50"
              aria-label="Last page"
              title="Last"
            >
              »
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
