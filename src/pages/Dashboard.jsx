import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardApi } from "@/services/dashboard";

export default function Overview() {
  const [stats, setStats] = useState({
    leads: 0,
    users: 0,
    products: 0,
    products_used: 0,
    leads_with_products: 0,
    avg_products_per_lead_all: 0,
    avg_products_per_active_lead: 0,
    top_products: [],
    stage_breakdown: [],
  });
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
          products_used: Number(data?.products_used ?? 0),
          leads_with_products: Number(data?.leads_with_products ?? 0),
          avg_products_per_lead_all: Number(data?.avg_products_per_lead_all ?? 0),
          avg_products_per_active_lead: Number(data?.avg_products_per_active_lead ?? 0),
          top_products: Array.isArray(data?.top_products) ? data.top_products : [],
          stage_breakdown: Array.isArray(data?.stage_breakdown) ? data.stage_breakdown : [],
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

  const Fmt2 = ({ value }) => (
    <span>{loading ? "—" : Number(value).toFixed(2)}</span>
  );

  const Card = ({ to, bg, textColor, label, value, isDecimal = false }) => (
    <Link
      to={to}
      className={`rounded-2xl border border-gray-200 ${bg} p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 block`}
    >
      <div className={`text-sm font-medium ${textColor}`}>{label}</div>
      <div className={`mt-1 text-3xl font-bold ${textColor}`}>
        {isDecimal ? <Fmt2 value={value} /> : <Fmt value={value} />}
      </div>
    </Link>
  );

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Overview</h2>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card
          to="/leads"
          bg="bg-indigo-100"
          textColor="text-indigo-800"
          label="Total Universities"
          value={stats.leads}
        />

        {/* <Card
          to="/users"
          bg="bg-teal-100"
          textColor="text-teal-800"
          label="Total Users"
          value={stats.users}
        /> */}

        <Card
          to="/products"
          bg="bg-amber-100"
          textColor="text-amber-800"
          label="Total Products"
          value={stats.products}
        />

        {/* NEW */}
        <Card
          to="/products"
          bg="bg-emerald-100"
          textColor="text-emerald-800"
          label="Products In Use"
          value={stats.products_used}
        />

        {/* NEW */}
        <Card
          to="/leads"
          bg="bg-sky-100"
          textColor="text-sky-800"
          label="Universities Using Products"
          value={stats.leads_with_products}
        />

        {/* Optional average */}
        <Card
          to="/products"
          bg="bg-fuchsia-100"
          textColor="text-fuchsia-800"
          label="Avg Products / Lead"
          value={stats.avg_products_per_lead_all}
          isDecimal
        />
      </div>

      {/* Optional: small lists */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900">Top Products by Lead Usage</h3>
          <ul className="mt-3 space-y-2">
            {(loading ? [] : stats.top_products).map((p) => (
              <li key={p.product_id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{p.name}</span>
                <span className="font-semibold text-gray-900">
                  {new Intl.NumberFormat().format(p.lead_count)}
                </span>
              </li>
            ))}
            {!loading && stats.top_products.length === 0 && (
              <li className="text-sm text-gray-500">No data</li>
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900">Stage Breakdown</h3>
          <ul className="mt-3 space-y-2">
            {(loading ? [] : stats.stage_breakdown).map((s) => (
              <li key={s.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{s.name}</span>
                <span className="font-semibold text-gray-900">
                  {new Intl.NumberFormat().format(s.items)}
                </span>
              </li>
            ))}
            {!loading && stats.stage_breakdown.length === 0 && (
              <li className="text-sm text-gray-500">No data</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
