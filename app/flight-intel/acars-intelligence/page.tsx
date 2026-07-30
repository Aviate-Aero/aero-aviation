"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Clock3,
  ExternalLink,
  Gauge,
  Loader2,
  MapPin,
  MessagesSquare,
  Plane,
  Radio,
  RefreshCw,
  Search,
  ShieldCheck,
  Signal,
} from "lucide-react";

type AirframesMessage = {
  id: string;
  timestamp: string;
  protocol: string;
  source: string | null;
  flight: string;
  flightStatus: string | null;
  tail: string;
  aircraftType: string | null;
  icaoHex: string | null;
  label: string | null;
  text: string | null;
  frequency: number | null;
  signalLevel: number | null;
  station: string | null;
  stationCountry: string | null;
  position: {
    latitude: number | null;
    longitude: number | null;
    altitude: number | null;
  };
};

type FeedMeta = {
  resultCount: number;
  totalCount: string | null;
  rateLimit: string | null;
  rateRemaining: string | null;
  rateReset: string | null;
  authenticated: boolean;
  rangeHours: number;
  retrievedAt: string;
};

type FeedResponse = {
  messages: AirframesMessage[];
  meta: FeedMeta;
};

const RANGE_OPTIONS = [
  { value: "6", label: "Last 6 hours" },
  { value: "24", label: "Last 24 hours" },
  { value: "168", label: "Last 7 days" },
];

function isFeedResponse(value: unknown): value is FeedResponse {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<FeedResponse>;
  return Array.isArray(candidate.messages) && Boolean(candidate.meta);
}

function getErrorMessage(value: unknown) {
  if (!value || typeof value !== "object") return "";
  const message = (value as { message?: unknown }).message;
  return typeof message === "string" ? message : "";
}

export default function AcarsIntelligencePage() {
  const router = useRouter();
  const [flight, setFlight] = useState("");
  const [tail, setTail] = useState("");
  const [range, setRange] = useState("6");
  const [data, setData] = useState<FeedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMessages = useCallback(
    async (filters?: { flight?: string; tail?: string; range?: string }) => {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        limit: "18",
        range: filters?.range ?? range,
      });
      const flightValue = (filters?.flight ?? flight).trim();
      const tailValue = (filters?.tail ?? tail).trim();

      if (flightValue) params.set("flight", flightValue);
      if (tailValue) params.set("tail", tailValue);

      try {
        const response = await fetch(
          `/api/airframes/messages?${params.toString()}`
        );
        const payload: unknown = await response.json();

        if (!response.ok) {
          setError(
            getErrorMessage(payload) ||
              "The Airframes community feed is temporarily unavailable."
          );
          return;
        }

        if (!isFeedResponse(payload)) {
          setError("Airframes returned an unexpected response.");
          return;
        }

        setData(payload);
      } catch {
        setError("Unable to reach the Airframes community feed.");
      } finally {
        setLoading(false);
      }
    },
    [flight, range, tail]
  );

  useEffect(() => {
    void loadMessages({ flight: "", tail: "", range: "6" });
    // Initial feed load only; searches are explicitly submitted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const protocols = useMemo(
    () => new Set(data?.messages.map((message) => message.protocol) ?? []).size,
    [data]
  );
  const positionedMessages = useMemo(
    () =>
      data?.messages.filter(
        (message) =>
          message.position.latitude !== null &&
          message.position.longitude !== null
      ).length ?? 0,
    [data]
  );

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void loadMessages();
  };

  const resetSearch = () => {
    setFlight("");
    setTail("");
    setRange("6");
    void loadMessages({ flight: "", tail: "", range: "6" });
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

        <div className="mb-9 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-sky-300">
                <Radio className="h-3.5 w-3.5" />
                Community data link
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Live feed
              </span>
            </div>

            <h1 className="text-4xl font-light tracking-tight text-zinc-100 md:text-6xl">
              ACARS Intelligence
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-400 md:text-lg">
              Explore aircraft communications captured through ACARS, VDL2,
              HFDL, and satellite links—an operational layer beyond traditional
              ADS-B tracking.
            </p>
          </div>
        </div>

        <div className="mb-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric
            icon={<MessagesSquare className="h-4 w-4 text-sky-400" />}
            label="Messages"
            value={loading ? "—" : String(data?.meta.resultCount ?? 0)}
          />
          <Metric
            icon={<Signal className="h-4 w-4 text-violet-400" />}
            label="Protocols"
            value={loading ? "—" : String(protocols)}
          />
          <Metric
            icon={<MapPin className="h-4 w-4 text-emerald-400" />}
            label="With position"
            value={loading ? "—" : String(positionedMessages)}
          />
          <Metric
            icon={<ShieldCheck className="h-4 w-4 text-amber-400" />}
            label="Access"
            value={data?.meta.authenticated ? "API key" : "Public"}
          />
        </div>

        <form
          onSubmit={submitSearch}
          className="mb-7 rounded-2xl border border-zinc-800/70 bg-zinc-900/55 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-5"
        >
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr_0.8fr_auto] lg:items-end">
            <SearchField
              id="acars-flight"
              label="Flight number"
              placeholder="e.g. BA326"
              value={flight}
              onChange={setFlight}
            />
            <SearchField
              id="acars-tail"
              label="Aircraft registration"
              placeholder="e.g. G-EUUB"
              value={tail}
              onChange={setTail}
            />
            <label className="block">
              <span className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
                History
              </span>
              <select
                value={range}
                onChange={(event) => setRange(event.target.value)}
                className="h-12 w-full rounded-xl border border-zinc-700 bg-black/50 px-4 text-sm text-zinc-200 outline-none transition focus:border-sky-500/70 focus:ring-2 focus:ring-sky-500/10"
              >
                {RANGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Search feed
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800/70 pt-4">
            <p className="flex items-center gap-2 text-xs text-zinc-500">
              <Clock3 className="h-3.5 w-3.5" />
              Times are shown in UTC. Results are cached briefly to protect the
              daily allowance.
            </p>
            <button
              type="button"
              onClick={resetSearch}
              className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 transition-colors hover:text-white"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset to live feed
            </button>
          </div>
        </form>

        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-medium text-zinc-100">
              Community message feed
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {data?.meta.retrievedAt
                ? `Updated ${formatUtc(data.meta.retrievedAt)}`
                : "Loading the latest captured communications"}
            </p>
          </div>
          {data?.meta.rateRemaining && (
            <span className="text-xs text-zinc-500">
              {data.meta.rateRemaining} of {data.meta.rateLimit ?? "—"} upstream
              requests remaining in this window
            </span>
          )}
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-rose-300" />
              <div>
                <h3 className="font-medium text-rose-100">Feed unavailable</h3>
                <p className="mt-1 text-sm text-rose-200/70">{error}</p>
              </div>
            </div>
          </div>
        ) : loading ? (
          <LoadingFeed />
        ) : data?.messages.length ? (
          <div className="space-y-3">
            {data.messages.map((message) => (
              <MessageRow key={message.id} message={message} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/45 px-6 py-16 text-center">
            <Radio className="mx-auto h-8 w-8 text-zinc-600" />
            <h3 className="mt-4 text-lg font-medium text-zinc-200">
              No communications found
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
              Try a broader time window or remove one of the filters. Community
              reception varies by aircraft, region, and protocol.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

function SearchField({
  id,
  label,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </span>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="h-12 w-full rounded-xl border border-zinc-700 bg-black/50 px-4 text-sm uppercase text-zinc-100 outline-none transition placeholder:normal-case placeholder:text-zinc-600 focus:border-sky-500/70 focus:ring-2 focus:ring-sky-500/10"
      />
    </label>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/45 px-4 py-4 backdrop-blur-xl">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-zinc-500">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-xl font-light text-zinc-100">{value}</p>
    </div>
  );
}

function MessageRow({ message }: { message: AirframesMessage }) {
  const hasPosition =
    message.position.latitude !== null &&
    message.position.longitude !== null;

  return (
    <article className="group overflow-hidden rounded-2xl border border-zinc-800/70 bg-zinc-900/45 transition hover:border-sky-500/30 hover:bg-zinc-900/65">
      <div className="grid lg:grid-cols-[190px_1fr]">
        <div className="border-b border-zinc-800/70 bg-black/20 p-5 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-3 lg:block">
            <span className="inline-flex rounded-full border border-sky-500/25 bg-sky-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-sky-300">
              {message.protocol}
            </span>
            <time className="text-xs text-zinc-500 lg:mt-4 lg:block">
              {formatUtc(message.timestamp)}
            </time>
          </div>
          <p className="mt-4 font-mono text-xs text-zinc-600">
            MSG {message.id.slice(-10)}
          </p>
        </div>

        <div className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <DataPoint
                icon={<Plane className="h-3.5 w-3.5" />}
                label="Flight"
                value={message.flight}
              />
              <DataPoint
                icon={<Gauge className="h-3.5 w-3.5" />}
                label="Aircraft"
                value={`${message.tail}${
                  message.aircraftType ? ` · ${message.aircraftType}` : ""
                }`}
              />
              {message.frequency !== null && (
                <DataPoint
                  icon={<Activity className="h-3.5 w-3.5" />}
                  label="Frequency"
                  value={`${message.frequency.toFixed(3)} MHz`}
                />
              )}
            </div>

            {message.label && (
              <span className="w-fit rounded-md border border-zinc-700 bg-black/30 px-2 py-1 font-mono text-xs text-zinc-400">
                Label {message.label}
              </span>
            )}
          </div>

          <div className="mt-5 rounded-xl border border-zinc-800/70 bg-black/25 px-4 py-3">
            <p
              className={`whitespace-pre-wrap break-words font-mono text-sm leading-relaxed ${
                message.text ? "text-zinc-300" : "italic text-zinc-600"
              }`}
            >
              {message.text ??
                "Link-layer communication received; no decoded text payload was available."}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-500">
            {message.station && (
              <span className="flex items-center gap-1.5">
                <Radio className="h-3.5 w-3.5" />
                {message.station}
                {message.stationCountry
                  ? ` · ${message.stationCountry}`
                  : ""}
              </span>
            )}
            {hasPosition && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {message.position.latitude?.toFixed(3)},{" "}
                {message.position.longitude?.toFixed(3)}
                {message.position.altitude !== null
                  ? ` · FL${Math.round(message.position.altitude / 100)}`
                  : ""}
              </span>
            )}
            {message.signalLevel !== null && (
              <span className="flex items-center gap-1.5">
                <Signal className="h-3.5 w-3.5" />
                {message.signalLevel} dB
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function DataPoint({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-zinc-600">
        {icon}
        {label}
      </span>
      <p className="mt-1 text-sm font-medium text-zinc-200">{value}</p>
    </div>
  );
}

function LoadingFeed() {
  return (
    <div className="space-y-3" aria-label="Loading Airframes messages">
      {[0, 1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-44 animate-pulse rounded-2xl border border-zinc-800/70 bg-zinc-900/45"
        />
      ))}
    </div>
  );
}

function formatUtc(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(date)} UTC`;
}
