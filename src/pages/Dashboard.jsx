import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

  const Card = ({ to, bg, textColor, label, value }) => (
    <Link
      to={to}
      className={`rounded-2xl border border-gray-200 ${bg} p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 block`}
    >
      <div className={`text-sm font-medium ${textColor}`}>{label}</div>
      <div className={`mt-1 text-3xl font-bold ${textColor}`}>
        <Fmt value={value} />
      </div>
    </Link>
  );

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Overview</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card
          to="/leads"
          bg="bg-indigo-100"
          textColor="text-indigo-800"
          label="Total Universities"
          value={stats.leads}
        />

        <Card
          to="/users"
          bg="bg-teal-100"
          textColor="text-teal-800"
          label="Total Users"
          value={stats.users}
        />

        <Card
          to="/products"
          bg="bg-amber-100"
          textColor="text-amber-800"
          label="Total Products"
          value={stats.products}
        />
      </div>
    </div>
  );
}
