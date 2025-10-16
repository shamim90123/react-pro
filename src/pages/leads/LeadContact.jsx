import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LeadsApi } from "@/lib/leads";
import { ProductsApi } from "@/lib/products";
import { SweetAlert } from "@/components/ui/SweetAlert";

export default function LeadContactPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lead, setLead] = useState(null);
  const [contacts, setContacts] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentContactIndex, setCurrentContactIndex] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    job_title: "",
    department: "",
    primary_status: "",
  });

  // ---------------- Products State ----------------
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState(new Set()); // store IDs
  const allSelected = products.length > 0 && selectedProductIds.size === products.length;

  // Fetch lead + contacts
  useEffect(() => {
    const fetchLead = async () => {
      const leadData = await LeadsApi.get(id);
      setLead(leadData);
      setContacts(leadData.contacts || []);

      // If API returns already-linked product IDs, pre-select
      const prelinked = leadData.product_ids || []; // adjust if your API returns another key
      setSelectedProductIds(new Set(prelinked));
    };
    fetchLead();
  }, [id]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        // Adjust params as your ProductsApi supports (search, page, etc.)
        const res = await ProductsApi.list({ page: 1, perPage: 100 });
        // If your API returns { data: [] } use res.data
        setProducts(res.data || res || []);
      } catch (e) {
        console.error("Error loading products:", e);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  // ---------------- Contacts logic ----------------
  const addContact = () => {
    setIsEditing(true);
    setCurrentContactIndex(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      job_title: "",
      department: "",
      primary_status: "",
    });
  };

  const editContact = (index) => {
    setIsEditing(true);
    setCurrentContactIndex(index);
    const c = contacts[index];
    setFormData({
      name: c.name || "",
      email: c.email || "",
      phone: c.phone || "",
      job_title: c.job_title || "",
      department: c.department || "",
      primary_status: c.primary_status || "",
    });
  };

  const handleContactChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let updatedContacts;
      if (currentContactIndex === null) {
        updatedContacts = [...contacts, formData];
      } else {
        updatedContacts = [...contacts];
        updatedContacts[currentContactIndex] = formData;
      }
      setContacts(updatedContacts);
      await LeadsApi.createContact(id, updatedContacts);

      setIsEditing(false);
      SweetAlert.success("Contact saved");
      // navigate("/lead-list"); // keep you on page so you can select products
    } catch (err) {
      console.error("Error adding/editing contacts:", err);
      SweetAlert.error("Failed to save contact");
    } finally {
      setSubmitting(false);
    }
  };

  const cancelForm = () => {
    setIsEditing(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      job_title: "",
      department: "",
      primary_status: "",
    });
  };

  // ---------------- Products selection handlers ----------------
  const toggleProduct = (productId) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const toggleAllProducts = () => {
    if (allSelected) {
      setSelectedProductIds(new Set());
    } else {
      setSelectedProductIds(new Set(products.map((p) => p.id)));
    }
  };

  const saveSelectedProducts = async () => {
    try {
      // Confirm save
      const result = await SweetAlert.confirm({
        title: "Save Product Selections?",
        text: "These products will be linked to the lead.",
        confirmButtonText: "Save",
      });
      if (!result.isConfirmed) return;

      // 🔧 Adjust this to your backend API. Example: LeadsApi.assignProducts(leadId, productIds)
      await LeadsApi.assignProducts(id, Array.from(selectedProductIds));

      SweetAlert.success("Products saved");
    } catch (e) {
      console.error("Error saving products:", e);
      SweetAlert.error("Failed to save products");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {lead ? (
        <>
          {/* Lead Header */}
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
                onClick={addContact}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                + Add Contact
              </button>
            </div>
          </div>

          {/* Contacts */}
          <h2 className="mb-4 text-xl font-semibold">Lead Contacts</h2>
          {contacts.length > 0 ? (
            <div className="mb-6 overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="border-b">
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
                          onClick={() => editContact(i)}
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
          ) : (
            <p className="mb-6">No contacts available. Click "Add Contact" to add one.</p>
          )}

          {/* Contact Form */}
          {(isEditing && (formData || contacts.length === 0)) && (
            <form onSubmit={handleSubmit} className="mt-6 rounded-lg bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold">Contact Information</h3>
              <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <input
                  value={formData.name || ""}
                  onChange={(e) => handleContactChange("name", e.target.value)}
                  placeholder="Contact Name"
                  className="rounded-lg border border-gray-300 px-3 py-2"
                />
                <input
                  value={formData.email || ""}
                  onChange={(e) => handleContactChange("email", e.target.value)}
                  placeholder="Contact Email"
                  className="rounded-lg border border-gray-300 px-3 py-2"
                />
                <input
                  value={formData.phone || ""}
                  onChange={(e) => handleContactChange("phone", e.target.value)}
                  placeholder="Phone"
                  className="rounded-lg border border-gray-300 px-3 py-2"
                />
                <input
                  value={formData.job_title || ""}
                  onChange={(e) => handleContactChange("job_title", e.target.value)}
                  placeholder="Job Title"
                  className="rounded-lg border border-gray-300 px-3 py-2"
                />
                <input
                  value={formData.department || ""}
                  onChange={(e) => handleContactChange("department", e.target.value)}
                  placeholder="Department"
                  className="rounded-lg border border-gray-300 px-3 py-2"
                />
                <input
                  value={formData.primary_status || ""}
                  onChange={(e) => handleContactChange("primary_status", e.target.value)}
                  placeholder="Primary Status"
                  className="rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={cancelForm}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                  disabled={submitting}
                >
                  {submitting ? "Saving…" : "Save Contact"}
                </button>
              </div>
            </form>
          )}

          {/* ---------------- Products with Checkboxes ---------------- */}
          <div className="mt-10 rounded-lg bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Products</h2>
              <div className="text-sm text-gray-500">
                {loadingProducts ? "Loading products…" : `${products.length} total`}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-2 text-left">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={allSelected}
                          onChange={toggleAllProducts}
                        />
                        <span className="text-sm font-medium text-gray-700">Select All</span>
                      </label>
                    </th>
                    <th className="px-4 py-2 text-left">Product</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {loadingProducts ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                        Loading…
                      </td>
                    </tr>
                  ) : products.length ? (
                    products.map((p) => (
                      <tr key={p.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2">
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={selectedProductIds.has(p.id)}
                            onChange={() => toggleProduct(p.id)}
                          />
                        </td>
                        <td className="px-4 py-2 font-medium text-gray-800">
                          {p.name || p.title || `#${p.id}`}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs ${
                              p.status === "active" || p.status === 1
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {p.status === "active" || p.status === 1 ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))
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
                onClick={saveSelectedProducts}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={selectedProductIds.size === 0}
              >
                Save Selected Products
              </button>
            </div>
          </div>
        </>
      ) : (
        <p>Loading lead details...</p>
      )}
    </div>
  );
}
