import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LeadsApi } from "@/lib/leads";
import { SweetAlert } from "@/components/ui/SweetAlert";

export default function LeadViewPage() {
  const { leadId } = useParams(); // Get the lead ID from the URL
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const data = await LeadsApi.list({ q: leadId }); // Fetch lead by ID
        setLead(data[0]); // Assume the result is an array with one lead
      } catch (error) {
        SweetAlert.error(error.message || "Failed to fetch lead details");
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [leadId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="flex items-center justify-between bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-800">Lead Details</h1>
        <button
          onClick={() => navigate("/lead-list")}
          className="px-3 py-1.5 text-sm text-white rounded-lg"
          style={{ backgroundColor: "#282560" }}
        >
          Back
        </button>
      </header>

      <main className="flex-1 overflow-y-auto bg-white px-8 py-10">
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-600 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lead Name</label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100">{lead.name}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100">{lead.email}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100">{lead.phone}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100">{lead.city}</div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-600 mb-4">Comments</h2>
          <div className="w-full min-h-[10rem] px-3 py-2 border border-gray-300 rounded-lg bg-gray-100">{lead.comments}</div>
        </section>
      </main>
    </div>
  );
}
