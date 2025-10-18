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

  // Lead & Contacts
  const [lead, setLead] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentContactIndex, setCurrentContactIndex] = useState(null);
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "", email: "", phone: "", job_title: "", department: "", primary_status: "",
  });

  // Products
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState(new Set());

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

  // Load lead + contacts
  useEffect(() => {
    (async () => {
      try {
        const leadData = await LeadsApi.get(id);
        setLead(leadData);
        setContacts(leadData.contacts || []);
        const prelinked = leadData.product_ids || [];
        setSelectedProductIds(new Set(prelinked));
      } catch (e) {
        console.error(e);
        SweetAlert.error("Failed to load lead");
      }
    })();
  }, [id]);

  // Load products
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

  // Contacts handlers
  const openAddContact = () => {
    setIsEditing(true);
    setCurrentContactIndex(null);
    setContactForm({ name: "", email: "", phone: "", job_title: "", department: "", primary_status: "" });
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

  const onContactField = (field, value) => setContactForm((s) => ({ ...s, [field]: value }));

  const submitContact = async (e) => {
    e.preventDefault();
    setContactSubmitting(true);
    try {
      let updated = [];
      if (currentContactIndex === null) updated = [...contacts, contactForm];
      else {
        updated = [...contacts];
        updated[currentContactIndex] = contactForm;
      }
      setContacts(updated);
      await LeadsApi.createContact(id, updated);
      setIsEditing(false);
      SweetAlert.success("Contact saved");
    } catch (err) {
      console.error(err);
      SweetAlert.error("Failed to save contact");
    } finally {
      setContactSubmitting(false);
    }
  };

  const saveSelectedProducts = async () => {
    try {
      const result = await SweetAlert.confirm({
        title: "Save Product Selections?",
        text: "These products will be linked to the lead.",
        confirmButtonText: "Save",
      });
      if (!result.isConfirmed) return;
      await LeadsApi.assignProducts(id, Array.from(selectedProductIds));
      SweetAlert.success("Products saved");
    } catch (e) {
      console.error(e);
      SweetAlert.error("Failed to save products");
    }
  };

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

  if (!lead) return <div className="p-6">
      <UISkeleton count={15} height={20} style={{ marginTop: 10 }} />
    </div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <LeadHeader lead={lead} onAddContact={openAddContact} />

      {/* Contacts */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Lead Contacts</h2>
          <button
            onClick={openAddContact}
            className="rounded-lg bg-[#282560] px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
          >
            + Add Contact
          </button>
        </div>

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
