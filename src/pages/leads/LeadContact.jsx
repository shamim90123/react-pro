import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { LeadsApi } from "@/services/leads";
import { ProductsApi } from "@/services/products";
import { SweetAlert } from "@/components/ui/SweetAlert";

import LeadHeader from "@/components/leads/LeadHeader";
import ContactsTable from "@/components/leads/ContactsTable";
import ContactForm from "@/components/leads/ContactForm";
import ProductsSection from "@/components/leads/ProductsSection";
import CommentsSection from "@/components/leads/CommentsSection";
import { useComments } from "@/hooks/useComments";
import UISkeleton from "@/components/ui/UISkeleton";

export default function LeadContactPage() {
  const { id } = useParams();
const normId = (v) => String(v);
  // Lead & Contacts
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
    id: null,
    lead_id: null,
  });

  // Products
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState(new Set());

  // UI helpers
  const [deletingId, setDeletingId] = useState(null);
  const [refreshingContacts, setRefreshingContacts] = useState(false);

  // Comments (via hook)
  const {
    items: comments,
    meta: commentsMeta,
    page: commentsPage,
    setPage: setCommentsPage,
    loading: loadingComments,
    add: addComment,
    remove: removeComment,
  } = useComments(id, 10);

  const allSelected = useMemo(
    () => products.length > 0 && selectedProductIds.size === products.length,
    [products, selectedProductIds]
  );

  // ---------- Helper: reload lead + contacts from API ----------
// when reloading lead (if backend returns product_ids)
const reloadContacts = async (silent = true) => {
  if (!silent) setRefreshingContacts(true);
  try {
    const leadData = await LeadsApi.get(id);
    setLead(leadData);
    setContacts(leadData.contacts || []);
    const prelinked = (leadData.product_ids || []).map(normId);
    setSelectedProductIds(new Set(prelinked));
  } catch (e) {
    console.error(e);
    SweetAlert.error("Failed to refresh contacts");
  } finally {
    if (!silent) setRefreshingContacts(false);
  }
};

  // Initial load
  useEffect(() => {
    reloadContacts(false);
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load products
  useEffect(() => {
  (async () => {
    setLoadingProducts(true);
    try {
      const res = await ProductsApi.list({ page: 1, perPage: 100 });

      const items =
        Array.isArray(res?.data) ? res.data :
        Array.isArray(res?.data?.data) ? res.data.data :
        Array.isArray(res) ? res : [];

      setProducts(items);
    } catch (e) {
      console.error(e);
      SweetAlert.error("Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  })();
}, []);


  // ---------- Contacts handlers ----------
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
      id: null,
      lead_id: id,
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
      id: c.id || null,
      lead_id: id || null,
    });
  };

  const onContactField = (field, value) =>
    setContactForm((s) => ({ ...s, [field]: value }));

  const submitContact = async (e) => {
    e.preventDefault();
    setContactSubmitting(true);
    try {
      // Optimistic local update (optional)
      let updated = [];
      if (currentContactIndex === null) {
        updated = [...contacts, contactForm];
      } else {
        updated = [...contacts];
        updated[currentContactIndex] = contactForm;
      }
      setContacts(updated);

      // Persist to API (your endpoint accepts full array)
      await LeadsApi.createContact(id, updated);

      // Pull the canonical list from server
      await reloadContacts(true);

      setIsEditing(false);
      SweetAlert.success("Contact saved");
    } catch (err) {
      console.error(err);
      SweetAlert.error("Failed to save contact");
      // Roll back to server state
      await reloadContacts(true);
    } finally {
      setContactSubmitting(false);
    }
  };

//   useEffect(() => {
//   (async () => {
//     try {
//       const res = await LeadsApi.getProducts(id);
//       const preselected = new Set((res?.data || []).map(p => p.id));
//       setSelectedProductIds(preselected);
//     } catch (e) {
//       console.error(e);
//     }
//   })();
// }, [id]);

useEffect(() => {
  (async () => {
    try {
      const res = await LeadsApi.getProducts(id);
      const preselected = new Set((res?.data || res || []).map(p => normId(p.id)));
      setSelectedProductIds(preselected);
    } catch (e) { console.error(e); }
  })();
}, [id]);

  const onMakePrimary = async (contact) => {
    try {
      // Optimistic: mark selected as primary locally
      setContacts((prev) =>
        prev.map((c) => ({ ...c, is_primary: c.id === contact.id }))
      );

      await LeadsApi.setPrimaryContact(contact.id);

      // Ensure single-primary state from backend (and any extra fields)
      await reloadContacts(true);

      SweetAlert.success("Primary contact updated.");
    } catch (e) {
      console.error(e);
      SweetAlert.error("Failed to update primary contact");
      await reloadContacts(true);
    }
  };

  const onDeleteContact = async (contact) => {
    if (deletingId === contact.id) return;

    const res = await SweetAlert.confirm({
      title: `Delete contact?`,
      text: `“${contact.name}” will be permanently removed.`,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });
    if (!res.isConfirmed) return;

    try {
      setDeletingId(contact.id);

      // Optimistic remove
      setContacts((prev) => prev.filter((c) => c.id !== contact.id));

      await LeadsApi.removeContact(contact.id);

      // In case backend auto-promoted a fallback primary
      await reloadContacts(true);

      SweetAlert.success("Contact deleted.");
    } catch (e) {
      console.error(e);
      SweetAlert.error(
        e?.response?.data?.message || e?.message || "Failed to delete contact."
      );
      await reloadContacts(true);
    } finally {
      setDeletingId(null);
    }
  };

  // ---------- Products ----------
const saveSelectedProducts = async () => {
  try {
    const result = await SweetAlert.confirm({
      title: "Save Product Selections?",
      text: "These products will be linked to the lead.",
      confirmButtonText: "Save",
    });
    if (!result.isConfirmed) return;

    const savedIds = Array.from(selectedProductIds); // already normalized
    await LeadsApi.assignProducts(id, savedIds);

    // Re-fetch the canonical list from server (in case backend transforms it)
    try {
      const res = await LeadsApi.getProducts(id);
      const fresh = new Set((res?.data || res || []).map(p => normId(p.id)));
      setSelectedProductIds(fresh);
    } catch {
      // fallback: at least keep what we just saved
      setSelectedProductIds(new Set(savedIds));
    }

    SweetAlert.success("Products saved");
  } catch (e) {
    console.error(e);
    SweetAlert.error("Failed to save products");
  }
};



  // const toggleProduct = (productId) => {
  //   setSelectedProductIds((prev) => {
  //     const next = new Set(prev);
  //     next.has(productId) ? next.delete(productId) : next.add(productId);
  //     return next;
  //   });
  // };

  // const toggleAllProducts = () => {
  //   if (allSelected) setSelectedProductIds(new Set());
  //   else setSelectedProductIds(new Set(products.map((p) => p.id)));
  // };

  // toggles
const toggleProduct = (productId) => {
  const pid = normId(productId);
  setSelectedProductIds((prev) => {
    const next = new Set(prev);
    next.has(pid) ? next.delete(pid) : next.add(pid);
    return next;
  });
};

const toggleAllProducts = () => {
  // If you want "select all visible" instead of all products, use `filtered`
  // Otherwise keep using all `products`:
  if (allSelected) setSelectedProductIds(new Set());
  else setSelectedProductIds(new Set(products.map(p => normId(p.id))));
};

  if (!lead)
    return (
      <div className="p-6">
        <UISkeleton count={15} height={20} style={{ marginTop: 10 }} />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <LeadHeader lead={lead} onAddContact={openAddContact} />

      {/* Contacts */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            University Contacts
            {refreshingContacts ? (
              <span className="ml-2 text-sm text-gray-500">(refreshing...)</span>
            ) : null}
          </h2>
          <button
            onClick={openAddContact}
            className="rounded-lg bg-[#282560] px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
          >
            + Add Contact
          </button>
        </div>

        {contacts?.length ? (
          <ContactsTable
            contacts={contacts}
            onEdit={openEditContact}
            onMakePrimary={onMakePrimary}
            onDelete={onDeleteContact}
          />
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
            onCancel={() => setIsEditing(false)}
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
        loading={loadingComments}
        comments={comments}
        meta={commentsMeta}
        page={commentsPage}
        onPageChange={setCommentsPage}
        onAdd={addComment}
        onDelete={removeComment}
      />
    </div>
  );
}
