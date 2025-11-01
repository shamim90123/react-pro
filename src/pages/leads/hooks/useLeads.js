import { useCallback, useEffect, useMemo, useState } from "react";
import { LeadsApi } from "../services/leads";
import { UsersApi } from "@/services/users";
import { SweetAlert } from "@/components/ui/SweetAlert";

const emptyForm = { lead_id: undefined, lead_name: "", destination_id: "", city: "" };

export function useLeads() {
  // ---------- UI / Modal state ----------
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLead, setDetailsLead] = useState(null);
  const [detailsTab, setDetailsTab] = useState("contacts"); // or "notes"

  const openDetails = useCallback((lead, tab) => {
    setDetailsLead(lead);
    setDetailsTab(tab);
    setDetailsOpen(true);
  }, []);
  const closeDetails = useCallback(() => setDetailsOpen(false), []);

  // ---------- Data state ----------
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [assigning, setAssigning] = useState({}); // { [leadId]: boolean }

  const [leads, setLeads] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);

  // ---------- Form state ----------
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const updateForm = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);
  const resetForm = useCallback(() => setForm(emptyForm), []);

  const toggleLeadForm = useCallback(() => {
    setShowLeadForm((s) => {
      if (s) resetForm(); // closing
      return !s;
    });
  }, [resetForm]);

  const hasLeads = useMemo(() => (leads || []).length > 0, [leads]);

  // ---------- API: fetch ----------
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await LeadsApi.list({ page: 1, perPage: 10 });
      setLeads(res.data || []);
    } catch (err) {
      console.error("Error fetching leads", err);
      SweetAlert.error("Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserList = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await UsersApi.userlist();
      setUsers(res.data || []);
    } catch (err) {
      console.error("Error fetching users", err);
      SweetAlert.error("Failed to fetch users");
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const fetchCountries = useCallback(async () => {
    try {
      const res = await LeadsApi.getCountries();
      setCountries(res.data || []);
    } catch (err) {
      console.error("Error fetching countries", err);
      // not critical to block UI
    }
  }, []);

  // ---------- API: mutations ----------
  const handleAssignAccountManager = useCallback(
    async (leadId, userId) => {
      setAssigning((m) => ({ ...m, [leadId]: true }));
      const prevLeads = JSON.parse(JSON.stringify(leads));
      const normalized = userId === "" || userId == null ? null : Number(userId);

      try {
        // optimistic update
        setLeads((ls) =>
          ls.map((l) =>
            l.id === leadId
              ? {
                  ...l,
                  account_manager_id: normalized,
                  account_manager:
                    users.find((u) => String(u.id) === String(normalized)) || null,
                }
              : l
          )
        );

        await LeadsApi.assignAccountManager(leadId, normalized);
        SweetAlert.success("Account manager updated");
      } catch (e) {
        console.error(e);
        setLeads(prevLeads); // revert
        SweetAlert.error(e?.message || "Could not update account manager");
      } finally {
        setAssigning((m) => ({ ...m, [leadId]: false }));
      }
    },
    [leads, users]
  );

  const handleUniversityFormSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setSubmitting(true);
      try {
        await LeadsApi.create({
          lead_id: form.lead_id,
          lead_name: form.lead_name,
          destination_id: form.destination_id,
          city: form.city,
        });
        await fetchLeads();
        setShowLeadForm(false);
        resetForm();
        SweetAlert.success("University saved");
      } catch (err) {
        console.error("Error saving lead:", err);
        SweetAlert.error("Failed to save");
      } finally {
        setSubmitting(false);
      }
    },
    [form, fetchLeads, resetForm]
  );

  const handleDeleteLead = useCallback(
    async (id) => {
      try {
        const result = await SweetAlert.confirm({
          title: "Delete Lead?",
          text: "This action cannot be undone.",
          confirmButtonText: "Yes, delete it",
          cancelButtonText: "Cancel",
        });

        if (result.isConfirmed) {
          SweetAlert.info("Deleting...");
          await LeadsApi.remove(id);
          SweetAlert.success("Lead deleted successfully");
          fetchLeads();
        }
      } catch (err) {
        console.error("Error deleting lead:", err);
        SweetAlert.error("Failed to delete lead");
      }
    },
    [fetchLeads]
  );

  // ---------- Effects ----------
  useEffect(() => {
    fetchLeads();
    fetchCountries();
    fetchUserList();
  }, [fetchLeads, fetchCountries, fetchUserList]);

  return {
    // ui
    detailsOpen,
    detailsLead,
    detailsTab,
    openDetails,
    closeDetails,

    // data
    users,
    usersLoading,
    assigning,
    leads,
    countries,
    loading,
    hasLeads,

    // form
    showLeadForm,
    submitting,
    form,
    updateForm,
    resetForm,
    toggleLeadForm,

    // handlers
    handleAssignAccountManager,
    handleUniversityFormSubmit,
    handleDeleteLead,

    // misc
    refetch: fetchLeads,
  };
}
