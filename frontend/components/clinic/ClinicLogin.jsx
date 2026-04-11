"use client";

import Link from "next/link";

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

export default function ClinicLogin({
  credentials,
  loginError,
  onCredentialChange,
  onSubmit,
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#fff7fa_0%,_#f8fafc_100%)] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white p-8 shadow-[0_24px_60px_rgba(148,163,184,0.16)]">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <HerVoiceLogo />
            <div className="inline-flex w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
              Clinic portal
            </div>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Email
              <input
                type="email"
                name="email"
                value={credentials.email}
                onChange={onCredentialChange}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                placeholder="clinic@example.org"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Password
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={onCredentialChange}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                placeholder="Enter password"
              />
            </label>

            {loginError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {loginError}
              </div>
            ) : null}

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Sign in
            </button>
          </form>

          <Link
            href="/funder"
            className="text-sm font-medium text-slate-600 underline-offset-4 transition hover:text-slate-900 hover:underline"
          >
            Sign in as a funder instead
          </Link>
        </div>
      </div>
    </main>
  );
}
