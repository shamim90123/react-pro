function Overview() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Overview</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="text-sm text-gray-500">Leads</div>
          <div className="mt-1 text-2xl font-bold text-gray-900">128</div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="text-sm text-gray-500">Active Campaigns</div>
          <div className="mt-1 text-2xl font-bold text-gray-900">6</div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="text-sm text-gray-500">Conversion</div>
          <div className="mt-1 text-2xl font-bold text-gray-900">4.7%</div>
        </div>
      </div>
    </div>
  );
}

export default Overview;
