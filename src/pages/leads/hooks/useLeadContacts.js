import { useCallback, useEffect, useState } from "react";
import { LeadsApi } from "../api/leadsApi";
import { SweetAlert } from "@/components/ui/SweetAlert";

/**
 * Encapsulates lead + contacts lifecycle and mutations
 */
export function useLeadContacts(leadId) {
  const [lead, setLead] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // contact form UI state is kept here so the page stays dumb
  const [isEditing, setIsEditing] = useState(false);
  const [currentContactIndex, setCurrentContactIndex] = useState(null);
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [contactForm, setContactForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    job_title: "",
    department: "",
    primary_status: "",
    id: null,
    lead_id: null,
  });

  const onContactField = useCallback(
    (field, value) => setContactForm((s) => ({ ...s, [field]: value })),
    []
  );

  const load = useCallback(
    async (silent = true) => {
      if (!leadId) return;
      if (!silent) setRefreshing(true);
      try {
        const data = await LeadsApi.get(leadId);
        setLead(data);
        setContacts(data?.contacts || []);
      } catch (e) {
        console.error(e);
        SweetAlert.error("Failed to load lead/contacts");
      } finally {
        if (!silent) setRefreshing(false);
      }
    },
    [leadId]
  );

  useEffect(() => {
    load(false);
  }, [load]);

  const openAdd = useCallback(() => {
    setIsEditing(true);
    setCurrentContactIndex(null);
    setContactForm((f) => ({
      ...f,
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      job_title: "",
      department: "",
      primary_status: "",
      id: null,
      lead_id: leadId,
    }));
  }, [leadId]);

  const openEdit = useCallback(
    (index) => {
      const c = contacts[index];
      if (!c) return;
      setIsEditing(true);
      setCurrentContactIndex(index);
      setContactForm({
        first_name: c.first_name || "",
        last_name: c.last_name || "",
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

  const submit = useCallback(
    async (e) => {
      e?.preventDefault?.();
      if (!leadId) return;

      setContactSubmitting(true);
      try {
        // optimistic list update
        const next = [...contacts];
        if (currentContactIndex === null) next.push(contactForm);
        else next[currentContactIndex] = contactForm;
        setContacts(next);

        // persist the whole array (matches your API shape)
        await LeadsApi.createContact(leadId, next);

        // reload canonical
        await load(true);
        setIsEditing(false);
        SweetAlert.success("Contact saved");
      } catch (err) {
        console.error(err);
        SweetAlert.error("Failed to save contact");
        await load(true); // rollback
      } finally {
        setContactSubmitting(false);
      }
    },
    [leadId, contacts, currentContactIndex, contactForm, load]
  );

  const makePrimary = useCallback(
    async (contact) => {
      try {
        setContacts((prev) =>
          prev.map((c) => ({ ...c, is_primary: c.id === contact.id }))
        );
        await LeadsApi.setPrimaryContact(contact.id);
        await load(true);
        SweetAlert.success("Primary contact updated.");
      } catch (e) {
        console.error(e);
        SweetAlert.error("Failed to update primary contact");
        await load(true);
      }
    },
    [load]
  );

  const remove = useCallback(
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
        setContacts((prev) => prev.filter((c) => c.id !== contact.id));
        await LeadsApi.removeContact(contact.id);
        await load(true);
        SweetAlert.success("Contact deleted.");
      } catch (e) {
        console.error(e);
        SweetAlert.error(
          e?.response?.data?.message || e?.message || "Failed to delete contact."
        );
        await load(true);
      } finally {
        setDeletingId(null);
      }
    },
    [deletingId, load]
  );

  return {
    // data
    lead,
    contacts,
    refreshing,

    // contact form state
    isEditing,
    setIsEditing,
    currentContactIndex,
    contactSubmitting,
    contactForm,
    onContactField,

    // actions
    load,
    openAdd,
    openEdit,
    submit,
    makePrimary,
    remove,
  };
}
