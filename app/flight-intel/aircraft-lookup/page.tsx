"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Fingerprint,
  Gauge,
  Hash,
  History,
  Loader2,
  Plane,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";

type SearchMode = "reg" | "icao24";

type Registration = {
  reg: string;
  active: boolean;
  hexIcao?: string | null;
  airlineName?: string | null;
  registrationDate?: string | null;
};

type Aircraft = {
  id: number;
  reg: string;
  active: boolean;
  serial?: string | null;
  hexIcao?: string | null;
  airlineName?: string | null;
  iataType?: string | null;
  iataCodeShort?: string | null;
  icaoCode?: string | null;
  model?: string | null;
  modelCode?: string | null;
  numSeats?: number | null;
  rolloutDate?: string | null;
  firstFlightDate?: string | null;
  deliveryDate?: string | null;
  registrationDate?: string | null;
  typeName?: string | null;
  numEngines?: number | null;
  engineType?: string | null;
  isFreighter: boolean;
  productionLine?: string | null;
  ageYears?: number | null;
  verified: boolean;
  numRegistrations: number;
};

type LookupResponse = {
  aircraft: Aircraft;
  registrations: Registration[];
  registrationHistoryAvailable: boolean;
};

type Suggestion = {
  id: number;
  reg: string;
  hexIcao?: string | null;
  model?: string | null;
  airlineName?: string | null;
};

function getErrorMessage(value: unknown) {
  if (!value || typeof value !== "object") return "";
  const message = (value as { message?: unknown }).message;
  return typeof message === "string" ? message : "";
}

function isLookupResponse(value: unknown): value is LookupResponse {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<LookupResponse>;
  return Boolean(candidate.aircraft) && Array.isArray(candidate.registrations);
}

export default function AircraftLookupPage() {
  const router = useRouter();
  const [mode, setMode] = useState<SearchMode>("reg");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<LookupResponse | null>(null);
  const searchAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeSuggestions = (event: MouseEvent) => {
      if (!searchAreaRef.current?.contains(event.target as Node)) {
        setSuggestionsOpen(false);
      }
    };
    document.addEventListener("mousedown", closeSuggestions);
    return () => document.removeEventListener("mousedown", closeSuggestions);
  }, []);

  useEffect(() => {
    const cleanQuery = query.trim();

    if (mode !== "reg" || cleanQuery.length < 4) {
      setSuggestions([]);
      setSuggestionsOpen(false);
      setSuggesting(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSuggesting(true);
      try {
        const response = await fetch(
          `/api/aerodatabox/aircraft?action=autocomplete&q=${encodeURIComponent(
            cleanQuery
          )}`,
          { signal: controller.signal }
        );
        const data: unknown = await response.json();
        const nextSuggestions =
          response.ok &&
          data &&
          typeof data === "object" &&
          Array.isArray((data as { suggestions?: unknown }).suggestions)
            ? ((data as { suggestions: Suggestion[] }).suggestions ?? [])
            : [];
        setSuggestions(nextSuggestions);
        setSuggestionsOpen(nextSuggestions.length > 0);
      } catch (caughtError) {
        if (
          !(caughtError instanceof DOMException) ||
          caughtError.name !== "AbortError"
        ) {
          setSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) setSuggesting(false);
      }
    }, 400);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [mode, query]);

  const activeRegistration = useMemo(
    () =>
      result?.registrations.find((registration) => registration.active) ??
      result?.registrations[0],
    [result]
  );

  const searchAircraft = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const cleanQuery = query.trim().toUpperCase();

    if (!cleanQuery) {
      setError("Enter a tail number or Mode-S address.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setSuggestionsOpen(false);

    try {
      const response = await fetch(
        `/api/aerodatabox/aircraft?action=lookup&searchBy=${mode}&q=${encodeURIComponent(
          cleanQuery
        )}`
      );
      const data: unknown = await response.json();

      if (!response.ok) {
        setError(getErrorMessage(data) || "Aircraft lookup failed.");
        return;
      }

      if (!isLookupResponse(data)) {
        setError("AeroDataBox returned an unexpected aircraft response.");
        return;
      }

      setResult(data);
    } catch {
      setError("Unable to connect to aircraft lookup.");
    } finally {
      setLoading(false);
    }
  };

  const selectSuggestion = (suggestion: Suggestion) => {
    setQuery(suggestion.reg);
    setSuggestionsOpen(false);
    setSuggestions([]);
  };

  const changeMode = (nextMode: SearchMode) => {
    setMode(nextMode);
    setQuery("");
    setSuggestions([]);
    setSuggestionsOpen(false);
    setResult(null);
    setError("");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <section className="relative z-20 mx-auto w-full max-w-7xl px-4 pb-24 pt-44 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => router.push("/flight-intel")}
          className="mb-7 inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Flight Core Intelligence
        </button>

        <div className="mb-9 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="mt-4 text-4xl font-light tracking-tight text-zinc-100 md:text-6xl">
              Aircraft Lookup
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-400 md:text-lg">
              Identify an aircraft by registration or Mode-S address, inspect
              technical details, and trace its known registration history.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/flight-intel/airline-fleet")}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/70 px-4 py-2.5 text-sm text-zinc-200 transition-colors hover:border-sky-500/50 hover:text-sky-300"
          >
            Browse airline fleets
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={searchAircraft}
          className="rounded-2xl border border-zinc-800/70 bg-zinc-900/55 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl"
        >
          <div className="mb-5 flex w-fit rounded-xl border border-zinc-800 bg-black/40 p-1">
            <ModeButton
              active={mode === "reg"}
              onClick={() => changeMode("reg")}
            >
              Tail number
            </ModeButton>
            <ModeButton
              active={mode === "icao24"}
              onClick={() => changeMode("icao24")}
            >
              Mode-S
            </ModeButton>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div ref={searchAreaRef} className="relative">
              <label
                htmlFor="aircraft-query"
                className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-zinc-500"
              >
                {mode === "reg"
                  ? "Aircraft registration"
                  : "ICAO 24-bit address"}
              </label>
              <div className="relative">
                <input
                  id="aircraft-query"
                  value={query}
                  onChange={(event) =>
                    setQuery(
                      event.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9-]/g, "")
                        .slice(0, 10)
                    )
                  }
                  onFocus={() =>
                    suggestions.length > 0 && setSuggestionsOpen(true)
                  }
                  placeholder={mode === "reg" ? "e.g. PH-BXO" : "e.g. 48418A"}
                  autoComplete="off"
                  className="h-12 w-full rounded-xl border border-zinc-700 bg-black/50 px-4 pr-11 font-mono text-sm uppercase text-zinc-100 outline-none transition placeholder:font-sans placeholder:normal-case placeholder:text-zinc-600 focus:border-sky-500/70 focus:ring-2 focus:ring-sky-500/10"
                />
                {suggesting && (
                  <Loader2 className="absolute right-4 top-3.5 h-5 w-5 animate-spin text-sky-400" />
                )}
              </div>

              {suggestionsOpen && (
                <div className="absolute z-40 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-950 p-1.5 shadow-2xl shadow-black/70">
                  {suggestions.map((suggestion) => (
                    <button
                      key={`${suggestion.id}-${suggestion.reg}`}
                      type="button"
                      onClick={() => selectSuggestion(suggestion)}
                      className="flex w-full items-center justify-between gap-4 rounded-lg px-3 py-3 text-left transition-colors hover:bg-sky-500/10"
                    >
                      <span>
                        <span className="block font-mono text-sm font-medium text-zinc-100">
                          {suggestion.reg}
                        </span>
                        <span className="mt-0.5 block text-xs text-zinc-500">
                          {[suggestion.airlineName, suggestion.model]
                            .filter(Boolean)
                            .join(" · ") || "Aircraft record"}
                        </span>
                      </span>
                      <span className="font-mono text-xs text-zinc-600">
                        {suggestion.hexIcao ?? "—"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-sky-500 px-6 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {loading ? "Identifying..." : "Identify aircraft"}
            </button>
          </div>

          <p className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
            <Activity className="h-3.5 w-3.5 text-sky-400" />
            Tail-number suggestions appear after four characters. Mode-S uses
            six hexadecimal characters.
          </p>
        </form>

        {error && (
          <div className="mt-6 rounded-2xl border border-rose-500/25 bg-rose-500/10 p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-rose-300" />
              <div>
                <h2 className="font-medium text-rose-100">
                  Aircraft not available
                </h2>
                <p className="mt-1 text-sm text-rose-200/70">{error}</p>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-7 space-y-6">
            <section className="overflow-hidden rounded-2xl border border-zinc-800/70 bg-zinc-900/55 backdrop-blur-xl">
              <div className="border-b border-zinc-800/70 bg-gradient-to-r from-sky-500/10 via-transparent to-transparent p-6 md:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-sky-500/30 bg-sky-500/10">
                      <Plane className="h-7 w-7 text-sky-300" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-mono text-3xl font-medium text-white md:text-4xl">
                          {result.aircraft.reg}
                        </h2>
                        <StatusBadge active={result.aircraft.active} />
                        {result.aircraft.verified && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/25 bg-sky-500/10 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-sky-300">
                            <ShieldCheck className="h-3 w-3" />
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-lg text-zinc-300">
                        {result.aircraft.model ??
                          result.aircraft.typeName ??
                          "Unknown aircraft type"}
                      </p>
                      <p className="mt-1 text-sm text-zinc-500">
                        {result.aircraft.airlineName ??
                          "Operator not identified"}
                        {result.aircraft.productionLine
                          ? ` · ${result.aircraft.productionLine}`
                          : ""}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <HeroMetric
                      label="Mode-S"
                      value={result.aircraft.hexIcao ?? "—"}
                    />
                    <HeroMetric
                      label="ICAO type"
                      value={
                        result.aircraft.icaoCode ??
                        result.aircraft.modelCode ??
                        "—"
                      }
                    />
                    <HeroMetric
                      label="Serial"
                      value={result.aircraft.serial ?? "—"}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-px bg-zinc-800/60 sm:grid-cols-2 lg:grid-cols-4">
                <DetailCell
                  icon={<Clock3 className="h-4 w-4" />}
                  label="Aircraft age"
                  value={
                    result.aircraft.ageYears !== null &&
                    result.aircraft.ageYears !== undefined
                      ? `${result.aircraft.ageYears.toFixed(1)} years`
                      : "Not recorded"
                  }
                />
                <DetailCell
                  icon={<Users className="h-4 w-4" />}
                  label="Seats"
                  value={
                    result.aircraft.isFreighter
                      ? "Freighter"
                      : result.aircraft.numSeats?.toString() ?? "Not recorded"
                  }
                />
                <DetailCell
                  icon={<Gauge className="h-4 w-4" />}
                  label="Engines"
                  value={
                    result.aircraft.numEngines
                      ? `${result.aircraft.numEngines} · ${
                          result.aircraft.engineType ?? "type unknown"
                        }`
                      : "Not recorded"
                  }
                />
                <DetailCell
                  icon={<CalendarDays className="h-4 w-4" />}
                  label="First flight"
                  value={formatDate(result.aircraft.firstFlightDate)}
                />
              </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
              <section className="rounded-2xl border border-zinc-800/70 bg-zinc-900/50 p-6 backdrop-blur-xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="flex items-center gap-2 text-xl font-medium text-zinc-100">
                      <History className="h-5 w-5 text-sky-400" />
                      Registration history
                    </h2>
                    <p className="mt-2 text-sm text-zinc-500">
                      Known registrations and operators associated with this
                      airframe.
                    </p>
                  </div>
                  <span className="rounded-full border border-zinc-700 bg-black/30 px-3 py-1 text-xs text-zinc-400">
                    {result.registrations.length} record
                    {result.registrations.length === 1 ? "" : "s"}
                  </span>
                </div>

                {result.registrationHistoryAvailable &&
                result.registrations.length ? (
                  <div className="mt-6 space-y-0">
                    {result.registrations.map((registration, index) => (
                      <RegistrationRow
                        key={`${registration.reg}-${registration.hexIcao ?? index}`}
                        registration={registration}
                        isLast={index === result.registrations.length - 1}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 rounded-xl border border-zinc-800 bg-black/20 p-5 text-sm text-zinc-500">
                    No historical registrations are available for this
                    airframe.
                  </div>
                )}
              </section>

              <aside className="space-y-4">
                <InfoCard
                  label="Current assignment"
                  rows={[
                    ["Registration", activeRegistration?.reg ?? result.aircraft.reg],
                    [
                      "Assigned",
                      formatDate(
                        activeRegistration?.registrationDate ??
                          result.aircraft.registrationDate
                      ),
                    ],
                    [
                      "Delivery",
                      formatDate(result.aircraft.deliveryDate),
                    ],
                    [
                      "Rollout",
                      formatDate(result.aircraft.rolloutDate),
                    ],
                  ]}
                />

                <button
                  type="button"
                  onClick={() => router.push("/flight-intel/airline-fleet")}
                  className="group flex w-full items-center justify-between rounded-2xl border border-sky-500/25 bg-sky-500/10 p-5 text-left transition hover:bg-sky-500/15"
                >
                  <span>
                    <span className="block text-sm font-medium text-sky-100">
                      Explore operator fleet
                    </span>
                    <span className="mt-1 block text-xs text-sky-200/50">
                      Open the airline fleet search tool
                    </span>
                  </span>
                  <ArrowRight className="h-5 w-5 text-sky-400 transition-transform group-hover:translate-x-1" />
                </button>
              </aside>
            </div>

            <p className="text-center text-xs text-zinc-600">
              Aircraft identity data provided by AeroDataBox. Records depend on
              available source coverage and should be independently verified
              for safety-critical use.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-sky-500 text-white"
          : "text-zinc-500 hover:text-zinc-200"
      }`}
    >
      {children}
    </button>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-medium uppercase tracking-wider ${
        active
          ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
          : "border-zinc-700 bg-zinc-800/60 text-zinc-400"
      }`}
    >
      {active ? (
        <CheckCircle2 className="h-3 w-3" />
      ) : (
        <AlertCircle className="h-3 w-3" />
      )}
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-28 rounded-xl border border-zinc-800 bg-black/25 px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-600">
        {label}
      </p>
      <p className="mt-1 font-mono text-sm font-medium text-zinc-200">{value}</p>
    </div>
  );
}

function DetailCell({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-zinc-950/90 p-5">
      <p className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-zinc-600">
        <span className="text-sky-400">{icon}</span>
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-zinc-200">{value}</p>
    </div>
  );
}

function RegistrationRow({
  registration,
  isLast,
}: {
  registration: Registration;
  isLast: boolean;
}) {
  return (
    <div className="relative grid grid-cols-[28px_1fr] gap-3">
      <div className="relative flex justify-center">
        <span
          className={`relative z-10 mt-1.5 h-3 w-3 rounded-full border-2 ${
            registration.active
              ? "border-sky-300 bg-sky-500 shadow-[0_0_12px_rgba(14,165,233,0.6)]"
              : "border-zinc-600 bg-zinc-900"
          }`}
        />
        {!isLast && (
          <span className="absolute bottom-0 top-4 w-px bg-zinc-800" />
        )}
      </div>
      <div className="pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-base font-medium text-zinc-100">
            {registration.reg}
          </span>
          {registration.active && (
            <span className="text-[10px] font-medium uppercase tracking-wider text-sky-300">
              Current
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-zinc-400">
          {registration.airlineName ?? "Operator not recorded"}
        </p>
        <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-600">
          <span>{formatDate(registration.registrationDate)}</span>
          {registration.hexIcao && (
            <span className="font-mono">Mode-S {registration.hexIcao}</span>
          )}
        </p>
      </div>
    </div>
  );
}

function InfoCard({
  label,
  rows,
}: {
  label: string;
  rows: [string, string][];
}) {
  return (
    <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/50 p-5 backdrop-blur-xl">
      <h3 className="flex items-center gap-2 text-sm font-medium text-zinc-200">
        <Hash className="h-4 w-4 text-sky-400" />
        {label}
      </h3>
      <dl className="mt-4 divide-y divide-zinc-800/70">
        {rows.map(([key, value]) => (
          <div
            key={key}
            className="flex items-center justify-between gap-4 py-3 text-sm"
          >
            <dt className="text-zinc-600">{key}</dt>
            <dd className="text-right text-zinc-300">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
