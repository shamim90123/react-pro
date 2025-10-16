import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { LeadsApi } from "@/lib/leads";
import { ProductsApi } from "@/lib/products";
import { SweetAlert } from "@/components/ui/SweetAlert";

/* =========================================================
   Lead Contact Page
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

  // Derived
  const allSelected = useMemo(
    () => products.length > 0 && selectedProductIds.size === products.length,
    [products, selectedProductIds]
  );

  /* ---------------- API: Load Lead + Contacts ---------------- */
  useEffect(() => {
    (async () => {
      try {
        const leadData = await LeadsApi.get(id);
        setLead(leadData);
        setContacts(leadData.contacts || []);

        // Pre-select already linked products if available in response
        const prelinked = leadData.product_ids || [];
        setSelectedProductIds(new Set(prelinked));
      } catch (e) {
        console.error(e);
        SweetAlert.error("Failed to load lead");
      }
    })();
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

      await LeadsApi.assignProducts(id, Array.from(selectedProductIds));
      SweetAlert.success("Products saved");
    } catch (e) {
      console.error(e);
      SweetAlert.error("Failed to save products");
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
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
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
