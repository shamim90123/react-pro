import { useEffect, useState, useMemo } from "react";
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
  const Fmt2 = ({ value, digits = 2 }) => (
    <span>{loading ? "—" : Number(value).toFixed(digits)}</span>
  );

  const Card = ({ to, bg, textColor, label, children }) => (
    <Link
      to={to}
      className={`rounded-2xl border border-gray-200 ${bg} p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 block`}
    >
      <div className={`text-sm font-medium ${textColor}`}>{label}</div>
      {children}
    </Link>
  );

  // Derived: Products In Use percentage
  const productsInUse = useMemo(() => {
    const used = stats.products_used || 0;
    const total = stats.products || 0;
    const pct = total > 0 ? (used / total) * 100 : 0;
    return { used, total, pct: Number.isFinite(pct) ? pct : 0 };
  }, [stats.products_used, stats.products]);

  // Derived: Universities Using Products percentage
  const unisUsingProducts = useMemo(() => {
    const used = stats.leads_with_products || 0;
    const total = stats.leads || 0;
    const pct = total > 0 ? (used / total) * 100 : 0;
    return { used, total, pct: Number.isFinite(pct) ? pct : 0 };
  }, [stats.leads_with_products, stats.leads]);

  // Derived: Avg products/lead progress vs catalogue size (avg / products)
  const avgPerLeadProgress = useMemo(() => {
    const avgAll = stats.avg_products_per_lead_all || 0;
    const totalProducts = stats.products || 0;
    const pct = totalProducts > 0 ? (avgAll / totalProducts) * 100 : 0;
    return { avgAll, totalProducts, pct: Number.isFinite(pct) ? pct : 0 };
  }, [stats.avg_products_per_lead_all, stats.products]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Overview</h2>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Universities */}
        <Card
          to="/leads"
          bg="bg-indigo-100"
          textColor="text-indigo-800"
          label="Total Universities"
        >
          <div className="mt-1 text-3xl font-bold text-indigo-800">
            <Fmt value={stats.leads} />
          </div>
        </Card>

        {/* Products In Use */}
        <Card
          to="/products"
          bg="bg-emerald-100"
          textColor="text-emerald-800"
          label="Products In Use"
        >
          <div className="mt-1 flex items-baseline gap-2">
            <div className="text-3xl font-extrabold text-emerald-800">
              {loading ? "—" : `${productsInUse.pct.toFixed(0)}%`}
            </div>
            <div className="text-sm text-emerald-800/80">
              {loading ? "—" : `${productsInUse.used} / ${productsInUse.total}`}
            </div>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-emerald-200">
            <div
              className="h-2 rounded-full bg-emerald-600 transition-all duration-300"
              style={{ width: loading ? "0%" : `${Math.min(100, Math.max(0, productsInUse.pct))}%` }}
            />
          </div>
        </Card>

        {/* Universities Using Products */}
        <Card
          to="/leads"
          bg="bg-sky-100"
          textColor="text-sky-800"
          label="Universities Using Products"
        >
          <div className="mt-1 flex items-baseline gap-2">
            <div className="text-3xl font-extrabold text-sky-800">
              {loading ? "—" : `${unisUsingProducts.pct.toFixed(0)}%`}
            </div>
            <div className="text-sm text-sky-800/80">
              {loading ? "—" : `${unisUsingProducts.used} / ${unisUsingProducts.total}`}
            </div>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-sky-200">
            <div
              className="h-2 rounded-full bg-sky-600 transition-all duration-300"
              style={{ width: loading ? "0%" : `${Math.min(100, Math.max(0, unisUsingProducts.pct))}%` }}
            />
          </div>
        </Card>

        {/* Avg Products / Lead */}
        {/* <Card
          to="/products"
          bg="bg-fuchsia-100"
          textColor="text-fuchsia-800"
          label="Avg Products / Lead"
        >
          <div className="mt-1 text-3xl font-bold text-fuchsia-800">
            <Fmt2 value={stats.avg_products_per_lead_all} />
          </div>
          <div className="mt-1 text-xs text-fuchsia-800/80">
            Active Leads Avg: <Fmt2 value={stats.avg_products_per_active_lead} digits={2} />
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-fuchsia-200">
            <div
              className="h-2 rounded-full bg-fuchsia-600 transition-all duration-300"
              style={{
                width: loading
                  ? "0%"
                  : `${Math.min(100, Math.max(0, avgPerLeadProgress.pct))}%`,
              }}
              title={
                loading
                  ? ""
                  : `Avg vs Catalogue: ${avgPerLeadProgress.avgAll} of ${avgPerLeadProgress.totalProducts}`
              }
            />
          </div>
        </Card> */}
      </div>

      {/* Small lists */}
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
