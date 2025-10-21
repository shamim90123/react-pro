import { useEffect, useState } from "react";
import { DashboardApi } from "@/services/dashboard";

export default function Overview() {
  const [stats, setStats] = useState({ leads: 0, users: 0, products: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await DashboardApi.getOverview();
        setStats({
          leads: Number(data?.leads ?? 0),
          users: Number(data?.users ?? 0),
          products: Number(data?.products ?? 0),
        });
      } catch (e) {
        console.error("Overview stats error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const Fmt = ({ value }) => (
    <span>{loading ? "—" : new Intl.NumberFormat().format(value)}</span>
  );

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Overview</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Leads */}
        <div className="rounded-2xl border border-gray-200 bg-indigo-100 p-5 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="text-sm font-medium text-indigo-800">Total Universities  </div>
          <div className="mt-1 text-3xl font-bold text-indigo-900">
            <Fmt value={stats.leads} />
          </div>
        </div>

        {/* Users */}
        <div className="rounded-2xl border border-gray-200 bg-teal-100 p-5 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="text-sm font-medium text-teal-800">Total Users</div>
          <div className="mt-1 text-3xl font-bold text-teal-900">
            <Fmt value={stats.users} />
          </div>
        </div>

        {/* Products */}
        <div className="rounded-2xl border border-gray-200 bg-amber-100 p-5 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="text-sm font-medium text-amber-800">Total Products</div>
          <div className="mt-1 text-3xl font-bold text-amber-900">
            <Fmt value={stats.products} />
          </div>
        </div>
      </div>
    </div>
  );
}
