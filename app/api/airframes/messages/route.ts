import { NextRequest } from "next/server";

const AIRFRAMES_MESSAGES_URL = "https://api.airframes.io/v1/messages";
const MAX_RESULTS = 25;

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};
}

function textValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function numberValue(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function cleanIdentifier(value: string | null, maxLength = 16) {
  if (!value) return "";
  return value.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, maxLength);
}

function transformMessage(value: unknown) {
  const message = asRecord(value);
  const station = asRecord(message.station);
  const airframe = asRecord(message.airframe);
  const flight = asRecord(message.flight);

  return {
    id: String(message.id ?? message.uuid ?? ""),
    timestamp:
      textValue(message.timestamp) ??
      textValue(message.createdAt) ??
      new Date().toISOString(),
    protocol:
      textValue(message.sourceType)?.toUpperCase() ??
      textValue(message.source)?.toUpperCase() ??
      "ACARS",
    source: textValue(message.source),
    flight:
      textValue(flight.flight) ??
      textValue(message.flightNumber) ??
      "Unknown flight",
    flightStatus: textValue(flight.status),
    tail:
      textValue(airframe.tail) ??
      textValue(message.tail) ??
      "Unknown tail",
    aircraftType: textValue(airframe.icaoType),
    icaoHex: textValue(airframe.icao) ?? textValue(message.fromHex),
    label: textValue(message.label),
    text: textValue(message.text) ?? textValue(message.data),
    frequency: numberValue(message.frequency),
    signalLevel: numberValue(message.level),
    station: textValue(station.ident),
    stationCountry: textValue(station.countryName),
    position: {
      latitude:
        numberValue(message.latitude) ?? numberValue(flight.latitude),
      longitude:
        numberValue(message.longitude) ?? numberValue(flight.longitude),
      altitude:
        numberValue(message.altitude) ?? numberValue(flight.altitude),
    },
  };
}

export async function GET(request: NextRequest) {
  const input = request.nextUrl.searchParams;
  const upstream = new URL(AIRFRAMES_MESSAGES_URL);
  const flight = cleanIdentifier(input.get("flight"));
  const tail = cleanIdentifier(input.get("tail"));
  const range = input.get("range");
  const requestedLimit = Number.parseInt(input.get("limit") ?? "18", 10);
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(requestedLimit, 1), MAX_RESULTS)
    : 18;

  upstream.searchParams.set("limit", String(limit));

  if (flight) upstream.searchParams.set("flight", flight);
  if (tail) upstream.searchParams.set("tail", tail);

  const rangeHours = range === "168" ? 168 : range === "24" ? 24 : 6;
  const since = new Date(Date.now() - rangeHours * 60 * 60 * 1000);
  upstream.searchParams.set("since", since.toISOString());

  const headers: HeadersInit = {
    Accept: "application/json",
  };
  const apiKey = process.env.AIRFRAMES_API_KEY?.trim();

  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  try {
    const response = await fetch(upstream, {
      headers,
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      const retryAfter = response.headers.get("retry-after");
      const message =
        response.status === 429
          ? `Airframes request limit reached. Try again${
              retryAfter ? ` in ${retryAfter} seconds` : " shortly"
            }.`
          : "Airframes could not return messages right now.";

      return Response.json(
        { message },
        { status: response.status === 429 ? 429 : 502 }
      );
    }

    const payload: unknown = await response.json();
    const messages = Array.isArray(payload)
      ? payload.map(transformMessage)
      : [];

    return Response.json(
      {
        messages,
        meta: {
          resultCount: messages.length,
          totalCount: response.headers.get("x-total-count"),
          rateLimit: response.headers.get("x-ratelimit-limit"),
          rateRemaining: response.headers.get("x-ratelimit-remaining"),
          rateReset: response.headers.get("x-ratelimit-reset"),
          authenticated: Boolean(apiKey),
          rangeHours,
          retrievedAt: new Date().toISOString(),
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch {
    return Response.json(
      { message: "Unable to connect to the Airframes community feed." },
      { status: 502 }
    );
  }
}
