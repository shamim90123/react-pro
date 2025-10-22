import { useParams } from "react-router-dom";
import { useMemo } from "react";
import { normId } from "@/utils/id";
import { useComments } from "@/hooks/useComments";
import { useLeadContacts } from "@/hooks/useLeadContacts";
import { useLeadProducts } from "@/hooks/useLeadProducts";

import LeadHeader from "@/components/leads/LeadHeader";
import ContactsTable from "@/components/leads/ContactsTable";
import ContactForm from "@/components/leads/ContactForm";
import ProductsSection from "@/components/leads/ProductsSection";
import CommentsSection from "@/components/leads/CommentsSection";
import UISkeleton from "@/components/ui/UISkeleton";

const COMMENTS_PAGE_SIZE = 10;

export default function LeadContactPage() {
  const { id: routeId } = useParams();
  const leadId = useMemo(() => normId(routeId), [routeId]);

  // Lead + Contacts
  const {
    lead,
    contacts,
    refreshing,
    isEditing,
    setIsEditing,
    contactSubmitting,
    contactForm,
    onContactField,
    openAdd: openAddContact,
    openEdit: openEditContact,
    submit: submitContact,
    makePrimary: onMakePrimary,
    remove: onDeleteContact,
  } = useLeadContacts(leadId);

  // Products
  const {
    products,
    loadingProducts,
    selectedProductIds,
    allSelected,
    toggleProduct,
    toggleAllProducts,
    saveSelectedProducts,
  } = useLeadProducts(leadId);

  // Comments
  const {
    items: comments,
    meta: commentsMeta,
    page: commentsPage,
    setPage: setCommentsPage,
    loading: loadingComments,
    add: addComment,
    remove: removeComment,
  } = useComments(leadId, COMMENTS_PAGE_SIZE);

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
            {refreshing ? (
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

        {isEditing && (
          <ContactForm
            form={contactForm}
            submitting={contactSubmitting}
            onFieldChange={onContactField}
            onCancel={() => setIsEditing(false)}
            onSubmit={submitContact}
          />
        )}

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
