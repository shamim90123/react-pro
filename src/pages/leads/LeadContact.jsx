import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { LeadsApi } from "@/lib/leads";
import { ProductsApi } from "@/lib/products";
import { SweetAlert } from "@/components/ui/SweetAlert";

/* =========================================================
   Lead Contact Page (with Comments)
========================================================= */
export default function LeadContactPage() {
  const { id } = useParams();

  // -------- Lead & Contacts --------
  const [lead, setLead] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentContactIndex, setCurrentContactIndex] = useState(null);
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    job_title: "",
    department: "",
    primary_status: "",
  });

  // -------- Products --------
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState(new Set()); // Set<number|string>

  // -------- Comments --------
  const [comments, setComments] = useState([]);
  const [commentsMeta, setCommentsMeta] = useState(null); // paginator meta or null
  const [loadingComments, setLoadingComments] = useState(false);
  const [addingComment, setAddingComment] = useState(false);
  const [newComment, setNewComment] = useState("");

  // Derived
  const allSelected = useMemo(
    () => products.length > 0 && selectedProductIds.size === products.length,
    [products, selectedProductIds]
  );

  /* ---------------- API: Load Lead + Contacts (+ maybe comments) ---------------- */
  useEffect(() => {
    (async () => {
      try {
        const leadData = await LeadsApi.get(id);
        setLead(leadData);
        setContacts(leadData.contacts || []);

        // If your show() returns comments inline, use them.
        if (Array.isArray(leadData.comments)) {
          setComments(leadData.comments);
          setCommentsMeta(null);
        } else {
          // Otherwise, load comments paginated
          await loadComments(1);
        }

        // Pre-select already linked products if available in response
        const prelinked = leadData.product_ids || [];
        setSelectedProductIds(new Set(prelinked));
      } catch (e) {
        console.error(e);
        SweetAlert.error("Failed to load lead");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /* ---------------- API: Load Products ---------------- */
  useEffect(() => {
    (async () => {
      setLoadingProducts(true);
      try {
        const res = await ProductsApi.list({ page: 1, perPage: 100 });
        setProducts(res?.data || res || []);
      } catch (e) {
        console.error(e);
        SweetAlert.error("Failed to load products");
      } finally {
        setLoadingProducts(false);
      }
    })();
  }, []);

  /* ---------------- Contacts: Actions ---------------- */
  const openAddContact = () => {
    setIsEditing(true);
    setCurrentContactIndex(null);
    setContactForm({
      name: "",
      email: "",
      phone: "",
      job_title: "",
      department: "",
      primary_status: "",
    });
  };

  const openEditContact = (index) => {
    const c = contacts[index];
    if (!c) return;
    setIsEditing(true);
    setCurrentContactIndex(index);
    setContactForm({
      name: c.name || "",
      email: c.email || "",
      phone: c.phone || "",
      job_title: c.job_title || "",
      department: c.department || "",
      primary_status: c.primary_status || "",
    });
  };

  const onContactField = (field, value) =>
    setContactForm((s) => ({ ...s, [field]: value }));

  const submitContact = async (e) => {
    e.preventDefault();
    setContactSubmitting(true);
    try {
      let updated = [];
      if (currentContactIndex === null) {
        updated = [...contacts, contactForm];
      } else {
        updated = [...contacts];
        updated[currentContactIndex] = contactForm;
      }
      setContacts(updated);
      await LeadsApi.createContact(id, updated); // uses your existing API signature
      setIsEditing(false);
      SweetAlert.success("Contact saved");
    } catch (err) {
      console.error(err);
      SweetAlert.error("Failed to save contact");
    } finally {
      setContactSubmitting(false);
    }
  };

  const cancelContact = () => {
    setIsEditing(false);
    setContactForm({
      name: "",
      email: "",
      phone: "",
      job_title: "",
      department: "",
      primary_status: "",
    });
  };

  /* ---------------- Products: Actions ---------------- */
  const toggleProduct = (productId) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      next.has(productId) ? next.delete(productId) : next.add(productId);
      return next;
    });
  };

  const toggleAllProducts = () => {
    if (allSelected) setSelectedProductIds(new Set());
    else setSelectedProductIds(new Set(products.map((p) => p.id)));
  };

  const saveSelectedProducts = async () => {
    try {
      const result = await SweetAlert.confirm({
        title: "Save Product Selections?",
        text: "These products will be linked to the lead.",
        confirmButtonText: "Save",
      });
      if (!result.isConfirmed) return;

      // Assumes you’ve implemented this in LeadsApi
      await LeadsApi.assignProducts(id, Array.from(selectedProductIds));
      SweetAlert.success("Products saved");
    } catch (e) {
      console.error(e);
      SweetAlert.error("Failed to save products");
    }
  };

  /* ---------------- Comments: API + Actions ---------------- */
  const loadComments = async (page = 1) => {
    setLoadingComments(true);
    try {
      const res = await LeadsApi.listComments(id, { page, perPage: 10 });
      setComments(res?.data || []);
      setCommentsMeta(res?.meta || null);
    } catch (e) {
      console.error(e);
      SweetAlert.error("Failed to load comments");
    } finally {
      setLoadingComments(false);
    }
  };

  const submitNewComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return SweetAlert.error("Write a comment first");
    setAddingComment(true);
    try {
      await LeadsApi.addComment(id, { comment: newComment.trim() });
      setNewComment("");
      // Reload first page (assuming newest first)
      await loadComments(1);
      SweetAlert.success("Comment added");
    } catch (err) {
      console.error(err);
      SweetAlert.error("Failed to add comment");
    } finally {
      setAddingComment(false);
    }
  };

  const deleteComment = async (commentId) => {
    const confirm = await SweetAlert.confirm({
      title: "Delete this comment?",
      text: "This action cannot be undone.",
      confirmButtonText: "Delete",
    });
    if (!confirm.isConfirmed) return;

    try {
      await LeadsApi.removeComment(id, commentId);
      // Optimistic update
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      SweetAlert.success("Comment deleted");
    } catch (err) {
      console.error(err);
      SweetAlert.error("Failed to delete comment");
    }
  };

  /* ---------------- Render ---------------- */
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {!lead ? (
        <p>Loading lead details...</p>
      ) : (
        <>
          {/* Header & Lead Meta */}
          <LeadHeader lead={lead} onAddContact={openAddContact} />

          {/* Contacts */}
          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">Lead Contacts</h2>

            {contacts?.length ? (
              <ContactsTable contacts={contacts} onEdit={openEditContact} />
            ) : (
              <p className="mb-6">
                No contacts available. Click <b>“Add Contact”</b> to add one.
              </p>
            )}

            {isEditing && (
              <ContactForm
                form={contactForm}
                submitting={contactSubmitting}
                onFieldChange={onContactField}
                onCancel={cancelContact}
                onSubmit={submitContact}
              />
            )}
          </section>

          {/* Products */}
          <ProductsSection
            products={products}
            loading={loadingProducts}
            selectedIds={selectedProductIds}
            allSelected={allSelected}
            onToggle={toggleProduct}
            onToggleAll={toggleAllProducts}
            onSave={saveSelectedProducts}
          />

          {/* Comments */}
          <CommentsSection
            loading={loadingComments || addingComment}
            comments={comments}
            meta={commentsMeta}
            newComment={newComment}
            onNewCommentChange={setNewComment}
            onSubmit={submitNewComment}
            onDelete={deleteComment}
            onPageChange={loadComments}
          />
        </>
      )}
    </div>
  );
}

/* =========================================================
   Subcomponents
========================================================= */

/** Lead title + meta row + Add Contact button */
function LeadHeader({ lead, onAddContact }) {
  return (
    <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h1 className="text-3xl font-semibold text-gray-800">{lead.lead_name}</h1>
      </div>

      <table className="min-w-full table-auto">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-2 text-left">City</th>
            <th className="px-4 py-2 text-left">Email</th>
            <th className="px-4 py-2 text-left">Phone</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td className="px-4 py-2">{lead.city || "—"}</td>
            <td className="px-4 py-2">{lead.email || "—"}</td>
            <td className="px-4 py-2">{lead.phone || "—"}</td>
          </tr>
        </tbody>
      </table>

      <div className="mt-4 flex justify-end">
        <button
          onClick={onAddContact}
          className="rounded-lg bg-[#282560] px-4 py-2 text-sm text-white transition-colors hover:opacity-90"
        >
          + Add Contact
        </button>
      </div>
    </div>
  );
}

/** Contacts listing table */
function ContactsTable({ contacts = [], onEdit }) {
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
                <button
                  onClick={() => onEdit(i)}
                  className="text-blue-600 hover:underline"
                >
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

/** Add/Edit contact form */
function ContactForm({ form, submitting, onFieldChange, onCancel, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="mt-6 rounded-lg bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold">Contact Information</h3>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Input value={form.name} onChange={(v) => onFieldChange("name", v)} placeholder="Contact Name" />
        <Input value={form.email} onChange={(v) => onFieldChange("email", v)} placeholder="Contact Email" />
        <Input value={form.phone} onChange={(v) => onFieldChange("phone", v)} placeholder="Phone" />
        <Input value={form.job_title} onChange={(v) => onFieldChange("job_title", v)} placeholder="Job Title" />
        <Input value={form.department} onChange={(v) => onFieldChange("department", v)} placeholder="Department" />
        <Input
          value={form.primary_status}
          onChange={(v) => onFieldChange("primary_status", v)}
          placeholder="Primary Status"
        />
      </div>

      <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save Contact"}
        </button>
      </div>
    </form>
  );
}

/** Products section (table + actions) */
function ProductsSection({
  products = [],
  loading = false,
  selectedIds,
  allSelected,
  onToggle,
  onToggleAll,
  onSave,
}) {
  return (
    <section className="mt-10 rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Products</h2>
        <div className="text-sm text-gray-500">
          {loading ? "Loading products…" : `${products.length} total`}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-2 text-left">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={allSelected}
                    onChange={onToggleAll}
                  />
                  <span className="text-sm font-medium text-gray-700">Select All</span>
                </label>
              </th>
              <th className="px-4 py-2 text-left">Product</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                  Loading…
                </td>
              </tr>
            ) : products.length ? (
              products.map((p) => {
                const active = p.status === "active" || p.status === 1;
                return (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={selectedIds.has(p.id)}
                        onChange={() => onToggle(p.id)}
                      />
                    </td>
                    <td className="px-4 py-2 font-medium text-gray-800">
                      {p.name || p.title || `#${p.id}`}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs ${
                          active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={onSave}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={selectedIds.size === 0}
        >
          Save Selected Products
        </button>
      </div>
    </section>
  );
}

/** Comments section (list + form + pagination) */
function CommentsSection({
  loading,
  comments = [],
  meta, // Laravel paginator meta or null
  newComment,
  onNewCommentChange,
  onSubmit,
  onDelete,
  onPageChange,
}) {
  const currentPage = meta?.current_page ?? 1;
  const lastPage = meta?.last_page ?? 1;

  return (
    <section className="mt-10 rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Comments</h2>
        {meta ? (
          <div className="text-sm text-gray-500">
            Page {currentPage} of {lastPage} • {meta?.total ?? comments.length} total
          </div>
        ) : (
          <div className="text-sm text-gray-500">{comments.length} total</div>
        )}
      </div>

      {/* Add comment */}
      <form onSubmit={onSubmit} className="mb-6">
        <textarea
          value={newComment}
          onChange={(e) => onNewCommentChange(e.target.value)}
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
        {loading ? (
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
      {meta && lastPage > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            Previous
          </button>
          <div className="text-sm text-gray-600">
            {currentPage} / {lastPage}
          </div>
          <button
            onClick={() => onPageChange(Math.min(lastPage, currentPage + 1))}
            disabled={currentPage >= lastPage}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}

/** Small controlled input helper */
function Input({ value, onChange, placeholder }) {
  return (
    <input
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-gray-300 px-3 py-2"
    />
  );
}

/** tiny helper for readable timestamps */
function formatDateTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso ?? "";
  }
}
