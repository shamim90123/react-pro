import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LeadsApi } from "@/lib/leads"; // API for fetching leads and creating contacts

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

  // Fetch lead details and existing contacts
  useEffect(() => {
    const fetchLead = async () => {
      const leadData = await LeadsApi.get(id); // Fetch the lead by ID
      setLead(leadData);
      setContacts(leadData.contacts || []);
    };
    fetchLead();
  }, [id]);

  const addContact = () => {
    setIsEditing(true);
    setFormData({
      name: "",
      email: "",
      phone: "",
      job_title: "",
      department: "",
      primary_status: "",
    }); // Reset form for adding new contact
  };

  const editContact = (index) => {
    setIsEditing(true);
    setCurrentContactIndex(index);
    const contactToEdit = contacts[index];
    setFormData({
      name: contactToEdit.name,
      email: contactToEdit.email,
      phone: contactToEdit.phone,
      job_title: contactToEdit.job_title,
      department: contactToEdit.department,
      primary_status: contactToEdit.primary_status,
    });
  };

  const handleContactChange = (field, value) => {
    setFormData((prevData) => ({ ...prevData, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    try {
      // If adding a new contact
      if (currentContactIndex === null) {
        // Add the new contact to the list
        const updatedContacts = [...contacts, formData];
        setContacts(updatedContacts);
        await LeadsApi.createContact(id, updatedContacts); // Send the data to the API
      } else {
        // If editing an existing contact, update the contact at the current index
        const updatedContacts = [...contacts];
        updatedContacts[currentContactIndex] = formData; // Replace the old contact with the new one
        setContacts(updatedContacts);
        await LeadsApi.createContact(id, updatedContacts); // Send the updated contacts to the API
      }

      setIsEditing(false); // Close the form after submission
      navigate("/lead-list"); // Redirect back to the lead list
    } catch (err) {
      console.error("Error adding/editing contacts:", err);
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {lead ? (
        <>
          {/* Lead Info in Same Row with Better Design */}
          <div className="bg-white shadow-sm p-6 mb-6 rounded-lg flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-semibold text-gray-800">{lead.lead_name}</h1>
              <p className="text-lg text-gray-600"><strong>City:</strong> {lead.city}</p>
              <p className="text-lg text-gray-600"><strong>Email:</strong> {lead.email}</p>
              <p className="text-lg text-gray-600"><strong>Phone:</strong> {lead.phone}</p>
            </div>
            {/* Add Contact Button in the Header */}
            <button
              onClick={addContact}
              className="px-4 py-2 text-sm text-white bg-[#282560] rounded-lg"
            >
              + Add Contact
            </button>
          </div>

          {/* Lead Contacts */}
          <h2 className="text-xl font-semibold mb-4">Lead Contacts</h2>
          {contacts.length > 0 ? (
            <div className="overflow-x-auto mb-6">
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
                  {contacts.map((contact, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-4 py-2">{contact.name}</td>
                      <td className="px-4 py-2">{contact.email}</td>
                      <td className="px-4 py-2">{contact.phone}</td>
                      <td className="px-4 py-2">{contact.job_title}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => editContact(index)}
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
            <p>No contacts available. Click "Add Contact" to add one.</p>
          )}

          {/* Show Form for Adding/Editing Contact */}
          {(isEditing && (formData || contacts.length === 0)) && (
            <form onSubmit={handleSubmit} className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <div className="grid gap-6 mb-6">
                <input
                  value={formData.name || ""}
                  onChange={(e) => handleContactChange("name", e.target.value)}
                  placeholder="Contact Name"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  value={formData.email || ""}
                  onChange={(e) => handleContactChange("email", e.target.value)}
                  placeholder="Contact Email"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  value={formData.phone || ""}
                  onChange={(e) => handleContactChange("phone", e.target.value)}
                  placeholder="Phone"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  value={formData.job_title || ""}
                  onChange={(e) => handleContactChange("job_title", e.target.value)}
                  placeholder="Job Title"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  value={formData.department || ""}
                  onChange={(e) => handleContactChange("department", e.target.value)}
                  placeholder="Department"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  value={formData.primary_status || ""}
                  onChange={(e) => handleContactChange("primary_status", e.target.value)}
                  placeholder="Primary Status"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={cancelForm}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-white rounded-lg bg-[#282560]"
                  disabled={submitting}
                >
                  {submitting ? "Saving…" : "Save Contacts"}
                </button>
              </div>
            </form>
          )}
        </>
      ) : (
        <p>Loading lead details...</p>
      )}
    </div>
  );
}
