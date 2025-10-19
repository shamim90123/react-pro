import { useEffect, useMemo, useState, useCallback } from "react";
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

/** Normalize any id to string for stable Set/map comparisons */
const normId = (v) => String(v ?? "");

/** Hard caps for one-shot lists (avoid paginating here; keep UI snappy) */
const PRODUCT_FETCH_LIMIT = 100;
const COMMENTS_PAGE_SIZE = 10;

export default function LeadContactPage() {
  // ---------- Routing ----------
  const { id: routeId } = useParams();
  const leadId = normId(routeId); // keep ids as strings

  // ---------- Lead & Contacts ----------
  const [lead, setLead] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentContactIndex, setCurrentContactIndex] = useState(null);
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [refreshingContacts, setRefreshingContacts] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

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

  // ---------- Products ----------
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState(new Set());

  // ---------- Comments (via hook) ----------
  const {
    items: comments,
    meta: commentsMeta,
    page: commentsPage,
    setPage: setCommentsPage,
    loading: loadingComments,
    add: addComment,
    remove: removeComment,
  } = useComments(leadId, COMMENTS_PAGE_SIZE);

  // ---------- Derived ----------
  const allSelected = useMemo(
    () => products.length > 0 && selectedProductIds.size === products.length,
    [products, selectedProductIds]
  );


  /** Load available products once */
  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await ProductsApi.list({ page: 1, perPage: PRODUCT_FETCH_LIMIT });

      // Accept different shapes safely
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
  }, []);

  /** Hydrate pre-selected products for this lead (source of truth = backend) */
  const hydrateSelectedProducts = useCallback(async () => {
    if (!leadId) return;
    try {
      const res = await LeadsApi.getProducts(leadId);
      const list = (res?.data || res || []).map((p) => normId(p.id));
      setSelectedProductIds(new Set(list));
    } catch (e) {
      console.error(e);
      // non-blocking
    }
  }, [leadId]);

  
  // ---------- Loaders ----------
  /**
   * Reload the lead and contacts from API and hydrate products selection (if API returns product_ids)
   */
  const reloadContacts = useCallback(
    async (silent = true) => {
      if (!leadId) return;
      if (!silent) setRefreshingContacts(true);
      try {
        const leadData = await LeadsApi.get(leadId);
        setLead(leadData);
        setContacts(leadData?.contacts || []);

        const prelinked = (leadData?.product_ids || []).map(normId);
        setSelectedProductIds(new Set(prelinked));
        hydrateSelectedProducts();
      } catch (e) {
        console.error(e);
        SweetAlert.error("Failed to refresh contacts");
      } finally {
        if (!silent) setRefreshingContacts(false);
      }
    },
    [leadId, hydrateSelectedProducts]
  );

  // ---------- Effects ----------
  // Initial load of lead + contacts
  useEffect(() => {
    reloadContacts(false);
  }, [reloadContacts]);

  // Initial load of products (doesn't depend on lead)
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Load selected products for this lead (ensures canonical set after mount / id change)
  useEffect(() => {
    hydrateSelectedProducts();
  }, [hydrateSelectedProducts]);

  // ---------- Contact UI helpers ----------
  const openAddContact = useCallback(() => {
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
      lead_id: leadId,
    });
  }, [leadId]);

  const openEditContact = useCallback(
    (index) => {
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
        id: c.id ?? null,
        lead_id: leadId || null,
      });
    },
    [contacts, leadId]
  );

  const onContactField = useCallback((field, value) => {
    setContactForm((s) => ({ ...s, [field]: value }));
  }, []);

  const submitContact = useCallback(
    async (e) => {
      e.preventDefault();
      if (!leadId) return;

      setContactSubmitting(true);
      try {
        // Optimistic local update
        const next = [...contacts];
        if (currentContactIndex === null) next.push(contactForm);
        else next[currentContactIndex] = contactForm;
        setContacts(next);

        // Persist the full array (as per your API)
        await LeadsApi.createContact(leadId, next);

        // Refresh from server to ensure canonical state
        await reloadContacts(true);

        setIsEditing(false);
        SweetAlert.success("Contact saved");
      } catch (err) {
        console.error(err);
        SweetAlert.error("Failed to save contact");
        await reloadContacts(true); // rollback to server truth
      } finally {
        setContactSubmitting(false);
      }
    },
    [leadId, contacts, currentContactIndex, contactForm, reloadContacts]
  );

  const onMakePrimary = useCallback(
    async (contact) => {
      try {
        // Optimistic: mark selected as primary locally
        setContacts((prev) => prev.map((c) => ({ ...c, is_primary: c.id === contact.id })));

        await LeadsApi.setPrimaryContact(contact.id);

        // Ensure single-primary state from backend (and any extra fields)
        await reloadContacts(true);

        SweetAlert.success("Primary contact updated.");
      } catch (e) {
        console.error(e);
        SweetAlert.error("Failed to update primary contact");
        await reloadContacts(true);
      }
    },
    [reloadContacts]
  );

  const onDeleteContact = useCallback(
    async (contact) => {
      if (deletingId === contact.id) return;

      const res = await SweetAlert.confirm({
        title: "Delete contact?",
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
        SweetAlert.error(e?.response?.data?.message || e?.message || "Failed to delete contact.");
        await reloadContacts(true);
      } finally {
        setDeletingId(null);
      }
    },
    [deletingId, reloadContacts]
  );

  // ---------- Product selection ----------
  const toggleProduct = useCallback((productId) => {
    const pid = normId(productId);
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      next.has(pid) ? next.delete(pid) : next.add(pid);
      return next;
    });
  }, []);

  const toggleAllProducts = useCallback(() => {
    if (allSelected) {
      setSelectedProductIds(new Set());
    } else {
      setSelectedProductIds(new Set(products.map((p) => normId(p.id))));
    }
  }, [allSelected, products]);

  const saveSelectedProducts = useCallback(async () => {
    if (!leadId) return;

    try {
      const result = await SweetAlert.confirm({
        title: "Save Product Selections?",
        text: "These products will be linked to the lead.",
        confirmButtonText: "Save",
      });
      if (!result.isConfirmed) return;

      const savedIds = Array.from(selectedProductIds); // already normalized
      await LeadsApi.assignProducts(leadId, savedIds);

      // Re-fetch canonical list from server (in case backend transforms)
      try {
        const res = await LeadsApi.getProducts(leadId);
        const fresh = new Set((res?.data || res || []).map((p) => normId(p.id)));
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
  }, [leadId, selectedProductIds]);

  // ---------- Render ----------
  if (!lead) {
    return (
      <div className="p-6">
        <UISkeleton count={15} height={20} style={{ marginTop: 10 }} />
      </div>
    );
  }

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
