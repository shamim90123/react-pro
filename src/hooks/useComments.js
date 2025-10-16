import { useEffect, useState } from "react";
import { LeadsApi } from "@/lib/leads";
import { SweetAlert } from "@/components/ui/SweetAlert";

const normalizeMeta = (raw, fallbackPerPage = 10) => {
  const meta = raw?.meta ?? {};
  const cp = meta.current_page ?? raw?.current_page ?? 1;
  const lp = meta.last_page ?? raw?.last_page ?? 1;
  const pp = meta.per_page ?? raw?.per_page ?? fallbackPerPage;
  const total = meta.total ?? raw?.total ?? (Array.isArray(raw?.data) ? raw.data.length : 0);
  return {
    current_page: Number(cp) || 1,
    last_page: Number(lp) || 1,
    per_page: Number(pp) || fallbackPerPage,
    total: Number(total) || 0,
  };
};

export function useComments(leadId, initialPerPage = 10) {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: initialPerPage, total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!leadId) return;
    setPage(1); // reset when lead changes
  }, [leadId]);

  useEffect(() => {
    if (!leadId) return;
    (async () => {
      setLoading(true);
      try {
        const res = await LeadsApi.listComments(leadId, { page, perPage: initialPerPage });
        const list = res?.data ?? res?.items ?? [];
        setItems(list);
        setMeta(normalizeMeta(res, initialPerPage));
      } catch (e) {
        console.error(e);
        SweetAlert.error("Failed to load comments");
        setItems([]);
        setMeta({ current_page: 1, last_page: 1, per_page: initialPerPage, total: 0 });
      } finally {
        setLoading(false);
      }
    })();
  }, [leadId, page, initialPerPage]);

    const add = async (text) => {
    if (!text?.trim()) return SweetAlert.error("Write a comment first");
    setAdding(true);
    try {
        await LeadsApi.addComment(leadId, { comment: text.trim() });

        // Optimistically bump total, and jump to page 1 (effect will fetch fresh list)
        setMeta((m) => ({ ...m, total: (m?.total ?? 0) + 1, current_page: 1 }));
        setPage(1);

        SweetAlert.success("Comment added");
    } catch (e) {
        console.error(e);
        SweetAlert.error("Failed to add comment");
    } finally {
        setAdding(false);
    }
    };


  // Helper: recompute page + meta after deletion, without refetch.
    function adjustAfterDelete(prevItems, deletedId, prevMeta) {
    const items = prevItems.filter((c) => c.id !== deletedId);
    const newTotal = Math.max(0, (prevMeta?.total ?? 0) - 1);
    const perPage = prevMeta?.per_page ?? 10;

    // How many pages exist after deletion?
    const newLastPage = Math.max(1, Math.ceil(newTotal / perPage));

    // If current page is now beyond last page (e.g., deleted the last item on the last page), step back.
    const newCurrentPage = Math.min(prevMeta?.current_page ?? 1, newLastPage);

    const newMeta = {
        ...prevMeta,
        total: newTotal,
        last_page: newLastPage,
        current_page: newCurrentPage,
    };

    return { items, meta: newMeta };
    }

    // Replace your remove() with this one
    const remove = async (commentId) => {
    const confirm = await SweetAlert.confirm({
        title: "Delete this comment?",
        text: "This action cannot be undone.",
        confirmButtonText: "Delete",
    });
    if (!confirm.isConfirmed) return;

    try {
        await LeadsApi.removeComment(leadId, commentId);

        // Optimistically update list + meta.total immediately
        setItems((prevItems) => {
        // Use functional meta update based on prev state to keep in sync
        let nextMetaSnapshot;
        setMeta((prevMeta) => {
            const adjusted = adjustAfterDelete(prevItems, commentId, prevMeta);
            nextMetaSnapshot = adjusted.meta; // capture for page sync below
            return adjusted.meta;
        });

        const after = prevItems.filter((c) => c.id !== commentId);
        // If the current page became empty *and* there is a previous page, jump to it.
        // We do the page change after meta is updated.
        if (after.length === 0 && (nextMetaSnapshot?.current_page ?? 1) < (meta?.current_page ?? 1)) {
            // Trigger a fetch to the previous page; UI count already correct from meta update.
            setPage(nextMetaSnapshot.current_page);
        }
        return after;
        });

        SweetAlert.success("Comment deleted");
    } catch (e) {
        console.error(e);
        SweetAlert.error("Failed to delete comment");
    }
    };


  return {
    items,
    meta,
    page,
    setPage,
    loading: loading || adding,
    add,
    remove,
  };
}
