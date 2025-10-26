// src/hooks/useComments.js
import { useEffect, useState } from "react";
import { LeadsApi } from "@/services/leads";
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
  const [editingId, setEditingId] = useState(null);

  

  const fetchPage = async (p = 1) => {
    setLoading(true);
    try {
      const res = await LeadsApi.listComments(leadId, { page: p, perPage: initialPerPage });
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
  };

  useEffect(() => {
    if (!leadId) return;
    setPage(1); // reset on lead change
  }, [leadId]);

  useEffect(() => {
    if (!leadId) return;
    fetchPage(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId, page]);

  // 🔧 FIX: If you're on page 1, show the new comment immediately.
  const add = async (text) => {
    if (!text?.trim()) return SweetAlert.error("Write a comment first");
    setAdding(true);
    try {
      const res = await LeadsApi.addComment(leadId, { comment: text.trim() });

      // Try to get the created comment from API response
      const created =
        res?.comment ?? // { comment: {...} }
        (Array.isArray(res?.data) ? res.data[0] : res?.data) ?? // sometimes APIs return data
        res; // fallback

      // Optimistically bump total
      setMeta((m) => ({ ...m, total: (m?.total ?? 0) + 1 }));

      if (page === 1) {
        if (created && created.id) {
          // Prepend locally (assumes newest-first ordering on page 1)
          setItems((prev) => [created, ...prev].slice(0, meta.per_page || initialPerPage));
        } else {
          // If API didn't return the created object, just refetch page 1
          await fetchPage(1);
        }
      } else {
        // If you're not on page 1, jump there so user sees the newest
        setPage(1);
      }

      SweetAlert.success("Comment added");
    } catch (e) {
      console.error(e);
      SweetAlert.error("Failed to add comment");
    } finally {
      setAdding(false);
    }
  };

  // (Keep your improved delete that updates meta.total immediately)
  const remove = async (commentId) => {
    const confirm = await SweetAlert.confirm({
      title: "Delete this comment?",
      text: "This action cannot be undone.",
      confirmButtonText: "Delete",
    });
    if (!confirm.isConfirmed) return;

    try {
      await LeadsApi.removeComment(leadId, commentId);

      // Optimistically update list + total
      setItems((prev) => prev.filter((c) => c.id !== commentId));
      setMeta((m) => {
        const newTotal = Math.max(0, (m?.total ?? 0) - 1);
        const perPage = m?.per_page ?? initialPerPage;
        const newLastPage = Math.max(1, Math.ceil(newTotal / perPage));
        const newCurrent = Math.min(m?.current_page ?? 1, newLastPage);
        // If we emptied the current page and can go back, do it
        if ((m?.current_page ?? 1) > newCurrent) setPage(newCurrent);
        return { ...m, total: newTotal, last_page: newLastPage, current_page: newCurrent };
      });

      SweetAlert.success("Comment deleted");
    } catch (e) {
      console.error(e);
      SweetAlert.error("Failed to delete comment");
    }
  };


const edit = async (commentId, newText) => {
  const text = newText?.trim();
  if (!text) return SweetAlert.error("Write a comment first");

  const idx = items.findIndex((c) => c.id === commentId);
  if (idx === -1) return;

  const prevItems = items;
  const optimistic = { ...items[idx], comment: text, updated_at: new Date().toISOString() };

  // optimistic update
  setItems((cur) => {
    const next = [...cur];
    next[idx] = optimistic;
    return next;
  });

  try {
    const res = await LeadsApi.updateComment(leadId, commentId, { comment: text });
    const updated = res?.comment ?? (Array.isArray(res?.data) ? res.data[0] : res?.data) ?? res ?? optimistic;
    setItems((cur) => {
      const i = cur.findIndex((c) => c.id === commentId);
      if (i === -1) return cur;
      const next = [...cur];
      next[i] = { ...optimistic, ...updated };
      return next;
    });
    SweetAlert.success("Comment updated");
  } catch (e) {
    console.error(e);
    setItems(prevItems); // rollback
    SweetAlert.error(e.message || "Failed to update comment");
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
    edit,
    editingId,
    setEditingId,
  };
}
