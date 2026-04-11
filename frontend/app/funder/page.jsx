"use client";

import { useEffect, useMemo, useState } from "react";
import FunderLogin from "../../components/funder/FunderLogin";
import FunderDashboard from "../../components/funder/FunderDashboard";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getUiStatus(caseItem) {
  if (caseItem.case_status === "released") {
    return "released";
  }

  if (caseItem.case_status === "active") {
    return "confirmed";
  }

  return "pending";
}

function formatAnonymousId(caseId) {
  const compact = (caseId || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return `DID-${compact.slice(-6).padStart(6, "0")}`;
}

export default function FunderPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [amountInput, setAmountInput] = useState("5");
  const [createError, setCreateError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createdCase, setCreatedCase] = useState(null);

  async function loadDashboard() {
    setIsLoading(true);
    setDashboardError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to load the dashboard.");
      }

      setDashboard(data);
    } catch (error) {
      setDashboardError(
        error.message || "Unable to load funding cases right now."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    loadDashboard();
  }, [isLoggedIn]);

  const groupedCases = useMemo(() => {
    const cases = dashboard?.cases || [];

    const filteredCases = cases.filter((caseItem) => {
      const uiStatus = getUiStatus(caseItem);
      return statusFilter === "all" ? true : uiStatus === statusFilter;
    });

    const groups = filteredCases.reduce((collection, caseItem) => {
      const countryLabel = caseItem.country || "Country unavailable";

      if (!collection[countryLabel]) {
        collection[countryLabel] = [];
      }

      collection[countryLabel].push(caseItem);
      return collection;
    }, {});

    return Object.entries(groups).sort(([left], [right]) =>
      left.localeCompare(right)
    );
  }, [dashboard, statusFilter]);

  const confirmedCount = useMemo(() => {
    return (dashboard?.cases || []).filter(
      (caseItem) => getUiStatus(caseItem) === "confirmed"
    ).length;
  }, [dashboard]);

  function handleCredentialChange(event) {
    const { name, value } = event.target;
    setCredentials((current) => ({ ...current, [name]: value }));
  }

  function handleLogin(event) {
    event.preventDefault();
    setLoginError("");

    if (!credentials.email.trim() || !credentials.password.trim()) {
      setLoginError("Please enter an email and password to continue.");
      return;
    }

    setIsLoggedIn(true);
  }

  async function handleCreateFundingCase(event) {
    event.preventDefault();
    setCreateError("");
    setCreatedCase(null);

    const amount = Number(amountInput);

    if (!Number.isInteger(amount) || amount < 1 || amount > 1000) {
      setCreateError("Enter a whole XRP amount between 1 and 1000.");
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/fund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount_xrp: amount }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || data.message || "Unable to create funding case."
        );
      }

      setCreatedCase(data);
      await loadDashboard();
    } catch (error) {
      setCreateError(
        error.message || "Unable to create funding case right now."
      );
    } finally {
      setIsCreating(false);
    }
  }

  if (!isLoggedIn) {
    return (
      <FunderLogin
        credentials={credentials}
        loginError={loginError}
        onCredentialChange={handleCredentialChange}
        onSubmit={handleLogin}
      />
    );
  }

  return (
    <FunderDashboard
      onSignOut={() => {
        setIsLoggedIn(false);
        setCredentials({ email: "", password: "" });
      }}
      isLoading={isLoading}
      dashboardError={dashboardError}
      createError={createError}
      dashboard={dashboard}
      confirmedCount={confirmedCount}
      amountInput={amountInput}
      setAmountInput={setAmountInput}
      onCreateFundingCase={handleCreateFundingCase}
      isCreating={isCreating}
      createdCase={createdCase}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
      groupedCases={groupedCases}
      formatAnonymousId={formatAnonymousId}
      getUiStatus={getUiStatus}
    />
  );
}
