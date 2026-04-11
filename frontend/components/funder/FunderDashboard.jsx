"use client";

const BRAND_COLOR = "#993556";

function HerVoiceLogo() {
  return (
    <div className="flex items-center gap-3">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 20.2s-6.95-4.32-8.97-8.44C1.6 8.84 3.12 5.5 6.3 4.63c2.04-.56 4.14.18 5.7 1.98 1.56-1.8 3.66-2.54 5.7-1.98 3.18.87 4.7 4.21 3.27 7.13C18.95 15.88 12 20.2 12 20.2Z"
          fill={BRAND_COLOR}
          fillOpacity="0.15"
          stroke={BRAND_COLOR}
          strokeWidth="1.5"
        />
        <path
          d="M12 8.2v4.1M9.95 10.25h4.1"
          stroke={BRAND_COLOR}
          strokeLinecap="round"
          strokeWidth="1.6"
        />
      </svg>
      <span className="text-lg font-semibold tracking-tight text-slate-900">
        HerVoice
      </span>
    </div>
  );
}

function getStatusClasses(status) {
  if (status === "released") {
    return "border-teal-200 bg-teal-50 text-teal-700";
  }

  if (status === "confirmed") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

function formatStatusLabel(status) {
  if (status === "released") return "Released";
  if (status === "confirmed") return "Confirmed";
  return "Pending";
}

function DashboardSpinner({ text = "Loading dashboard data..." }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
      <span>{text}</span>
    </div>
  );
}

export default function FunderDashboard({
  onSignOut,
  isLoading,
  dashboardError,
  createError,
  dashboard,
  confirmedCount,
  amountInput,
  setAmountInput,
  onCreateFundingCase,
  isCreating,
  createdCase,
  statusFilter,
  setStatusFilter,
  groupedCases,
  formatAnonymousId,
  getUiStatus,
}) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#fff8fa_0%,_#f8fafc_48%,_#ffffff_100%)]">
      <header className="border-b border-white/70 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <HerVoiceLogo />
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-semibold text-slate-900">
                HerVoice Funding Network
              </div>
              <div className="text-xs text-slate-500">Verified NGO account</div>
            </div>
            <button
              type="button"
              onClick={onSignOut}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        {isLoading ? <DashboardSpinner /> : null}

        {dashboardError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {dashboardError}
          </div>
        ) : null}

        {createError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {createError}
          </div>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-white/70 bg-white p-6 shadow-[0_20px_50px_rgba(148,163,184,0.12)]">
            <div className="mb-4">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                Funding overview
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                XRPL funding and voucher activity across the network.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["Total cases", dashboard?.total_cases ?? 0],
                ["XRP locked", `${dashboard?.total_xrp_locked ?? 0} XRP`],
                ["XRP released", `${dashboard?.total_xrp_released ?? 0} XRP`],
                ["Confirmed", confirmedCount],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-3xl border border-slate-100 bg-slate-50 p-5"
                >
                  <div className="text-sm font-medium text-slate-500">{label}</div>
                  <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/70 bg-white p-6 shadow-[0_20px_50px_rgba(148,163,184,0.12)]">
            <div className="mb-4">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                Care operations
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Live counts from clinics, patient cases, appointments, and proofs.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["Clinics", dashboard?.total_clinics ?? 0],
                ["Patient cases", dashboard?.total_patient_cases ?? 0],
                ["Appointments", dashboard?.total_appointments ?? 0],
                [
                  "Completed appointments",
                  dashboard?.total_completed_appointments ?? 0,
                ],
                ["Proofs submitted", dashboard?.total_proofs_submitted ?? 0],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-3xl border border-slate-100 bg-slate-50 p-5"
                >
                  <div className="text-sm font-medium text-slate-500">{label}</div>
                  <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/70 bg-white p-6 shadow-[0_20px_50px_rgba(148,163,184,0.12)]">
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Funding cases
              </h1>
              <p className="text-sm text-slate-500">
                The current dashboard API does not yet expose patient countries,
                so cases are grouped under a fallback country label when needed.
              </p>
            </div>

            <form
              onSubmit={onCreateFundingCase}
              className="grid gap-3 rounded-3xl border border-slate-100 bg-slate-50 p-4 md:grid-cols-[1fr_auto]"
            >
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                  Amount in XRP
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    step="1"
                    value={amountInput}
                    onChange={(event) => setAmountInput(event.target.value)}
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                    placeholder="5"
                  />
                </label>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="mt-auto inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ backgroundColor: BRAND_COLOR }}
                >
                  Create funding case
                </button>
              </div>

              {isCreating ? (
                <div className="md:col-span-2">
                  <DashboardSpinner text="Creating XRPL escrow..." />
                </div>
              ) : null}

              {createdCase ? (
                <div className="grid gap-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm md:col-span-2 md:grid-cols-2">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                      Case ID
                    </div>
                    <div className="mt-2 break-all font-mono text-emerald-950">
                      {createdCase.case_id}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                      Voucher ID
                    </div>
                    <div className="mt-2 break-all font-mono text-emerald-950">
                      {createdCase.voucher_id}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                      Amount
                    </div>
                    <div className="mt-2 font-semibold text-emerald-950">
                      {createdCase.amount_xrp} XRP
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                      Status
                    </div>
                    <div className="mt-2 font-semibold text-emerald-950">
                      {createdCase.status}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                      Escrow tx hash
                    </div>
                    <div className="mt-2 break-all font-mono text-emerald-950">
                      {createdCase.escrow_tx_hash}
                    </div>
                  </div>
                </div>
              ) : null}
            </form>

            <div className="flex flex-wrap gap-3">
              {[
                ["all", "All"],
                ["pending", "Pending"],
                ["confirmed", "Confirmed"],
                ["released", "Released"],
              ].map(([value, label]) => {
                const isActive = statusFilter === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setStatusFilter(value)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? "text-white"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                    }`}
                    style={isActive ? { backgroundColor: BRAND_COLOR } : {}}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-6">
            {groupedCases.length ? (
              groupedCases.map(([country, cases]) => (
                <div key={country} className="rounded-3xl border border-slate-100">
                  <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
                    <div className="text-sm font-semibold text-slate-900">
                      {country}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100 text-left">
                      <thead className="bg-white">
                        <tr className="text-xs uppercase tracking-[0.18em] text-slate-400">
                          <th className="px-5 py-4 font-semibold">Anonymous ID</th>
                          <th className="px-5 py-4 font-semibold">Voucher</th>
                          <th className="px-5 py-4 font-semibold">Amount</th>
                          <th className="px-5 py-4 font-semibold">Status</th>
                          <th className="px-5 py-4 font-semibold">Clinic confirmed</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white text-sm text-slate-700">
                        {cases.map((caseItem) => {
                          const status = getUiStatus(caseItem);
                          const clinicConfirmed =
                            caseItem.case_status === "released" ||
                            caseItem.voucher_status === "redeemed";

                          return (
                            <tr key={caseItem.case_id}>
                              <td className="px-5 py-4 font-mono text-slate-900">
                                {formatAnonymousId(caseItem.case_id)}
                              </td>
                              <td className="px-5 py-4 font-mono text-xs text-slate-600">
                                {caseItem.voucher_id || "Not issued"}
                              </td>
                              <td className="px-5 py-4 font-medium text-slate-900">
                                {caseItem.amount_xrp} XRP
                              </td>
                              <td className="px-5 py-4">
                                <span
                                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                                    status
                                  )}`}
                                >
                                  {formatStatusLabel(status)}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <span
                                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                                    clinicConfirmed
                                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                      : "border-slate-200 bg-slate-50 text-slate-600"
                                  }`}
                                >
                                  {clinicConfirmed ? "Yes" : "No"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
                No funding cases match this filter yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
