import type {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
  Position,
} from "geojson";
import { NextRequest, NextResponse } from "next/server";

const AWC_API_BASE = "https://aviationweather.gov/api/data";
const CACHE_SECONDS = 180;

type AdvisoryKind = "AIRMET" | "SIGMET";

type NormalizedAdvisoryProperties = {
  id: string;
  advisoryKind: AdvisoryKind;
  product: string;
  hazard: string;
  qualifier: string | null;
  validFrom: string | null;
  validTo: string | null;
  altitudeLow: string | null;
  altitudeHigh: string | null;
  movement: string | null;
  issuingOffice: string | null;
  firName: string | null;
  rawText: string | null;
};

type SourceDefinition = {
  endpoint: "airsigmet" | "isigmet" | "gairmet" | "airmet";
  product: string;
  advisoryKind: AdvisoryKind;
};

type BoundingBox = {
  south: number;
  west: number;
  north: number;
  east: number;
};

const SOURCES: SourceDefinition[] = [
  {
    endpoint: "airsigmet",
    product: "Domestic SIGMET",
    advisoryKind: "SIGMET",
  },
  {
    endpoint: "isigmet",
    product: "International SIGMET",
    advisoryKind: "SIGMET",
  },
  {
    endpoint: "gairmet",
    product: "G-AIRMET",
    advisoryKind: "AIRMET",
  },
  {
    endpoint: "airmet",
    product: "Alaska AIRMET",
    advisoryKind: "AIRMET",
  },
];

export async function GET(request: NextRequest) {
  const bboxValue = request.nextUrl.searchParams.get("bbox")?.trim();
  const bbox = bboxValue ? parseBoundingBox(bboxValue) : null;

  if (bboxValue && !bbox) {
    return NextResponse.json(
      {
        message:
          "Invalid bbox. Use south,west,north,east with valid latitude and longitude values.",
      },
      { status: 400 }
    );
  }

  const results = await Promise.allSettled(
    SOURCES.map((source) => fetchAdvisorySource(source))
  );

  const features: Feature<Geometry, NormalizedAdvisoryProperties>[] = [];
  const unavailableSources: string[] = [];

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      unavailableSources.push(SOURCES[index].product);
      console.error(
        `Aviation Weather Center ${SOURCES[index].product} request failed:`,
        result.reason
      );
      return;
    }

    features.push(...result.value);
  });

  if (unavailableSources.length === SOURCES.length) {
    return NextResponse.json(
      { message: "Aviation advisory data is temporarily unavailable." },
      { status: 502 }
    );
  }

  const visibleFeatures = bbox
    ? features.filter((feature) => geometryIntersectsBbox(feature.geometry, bbox))
    : features;

  const collection: FeatureCollection<
    Geometry,
    NormalizedAdvisoryProperties
  > & {
    meta: {
      fetchedAt: string;
      unavailableSources: string[];
    };
  } = {
    type: "FeatureCollection",
    features: visibleFeatures,
    meta: {
      fetchedAt: new Date().toISOString(),
      unavailableSources,
    },
  };

  return NextResponse.json(collection, {
    headers: {
      "Cache-Control": "public, max-age=60, stale-while-revalidate=120",
    },
  });
}

async function fetchAdvisorySource(source: SourceDefinition) {
  const url = new URL(`${AWC_API_BASE}/${source.endpoint}`);
  url.searchParams.set("format", "geojson");

  const response = await fetch(url, {
    headers: {
      Accept: "application/geo+json, application/json",
      "User-Agent": "Aero-Aviation-Flight-Tracker/1.0",
    },
    next: { revalidate: CACHE_SECONDS },
  });

  if (response.status === 204) return [];

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as FeatureCollection<
    Geometry,
    GeoJsonProperties
  >;

  if (data.type !== "FeatureCollection" || !Array.isArray(data.features)) {
    throw new Error("Unexpected GeoJSON response");
  }

  return data.features
    .filter(
      (feature): feature is Feature<Geometry, GeoJsonProperties> =>
        Boolean(feature?.geometry)
    )
    .filter((feature) => isRelevantForecast(feature.properties, source))
    .map((feature, index) => ({
      type: "Feature" as const,
      geometry: feature.geometry,
      properties: normalizeProperties(feature.properties, source, index),
    }));
}

function normalizeProperties(
  properties: GeoJsonProperties,
  source: SourceDefinition,
  index: number
): NormalizedAdvisoryProperties {
  const props = properties ?? {};
  const hazard = stringValue(props.hazard) ?? "Unspecified hazard";
  const seriesId =
    stringValue(props.seriesId) ??
    stringValue(props.tag) ??
    stringValue(props.region) ??
    String(index + 1);

  return {
    id: `${source.endpoint}-${seriesId}-${index}`,
    advisoryKind: source.advisoryKind,
    product: source.product,
    hazard,
    qualifier:
      source.endpoint === "airsigmet"
        ? null
        : stringValue(props.qualifier) ?? stringValue(props.severity) ?? null,
    validFrom:
      stringValue(props.validTimeFrom) ??
      stringValue(props.issueTime) ??
      null,
    validTo:
      stringValue(props.validTimeTo) ?? stringValue(props.validTime) ?? null,
    altitudeLow: formatAltitude(props, source, "low"),
    altitudeHigh: formatAltitude(props, source, "high"),
    movement: formatMovement(props, source),
    issuingOffice: stringValue(props.icaoId) ?? null,
    firName:
      stringValue(props.firName) ??
      stringValue(props.zone) ??
      stringValue(props.region) ??
      null,
    rawText:
      stringValue(props.rawAirSigmet) ?? stringValue(props.rawSigmet) ?? null,
  };
}

function isRelevantForecast(
  properties: GeoJsonProperties,
  source: SourceDefinition
) {
  if (source.endpoint !== "gairmet") return true;

  const validTime = parseDate(properties?.validTime);
  if (!validTime) return true;

  const differenceMinutes = Math.abs(validTime.getTime() - Date.now()) / 60_000;
  return differenceMinutes <= 100;
}

function formatAltitude(
  props: Record<string, unknown>,
  source: SourceDefinition,
  bound: "low" | "high"
) {
  if (source.endpoint === "airsigmet") {
    const values =
      bound === "low"
        ? [numberValue(props.altitudeLow1), numberValue(props.altitudeLow2)]
        : [numberValue(props.altitudeHi1), numberValue(props.altitudeHi2)];
    return formatFeet(selectAltitude(values, bound));
  }

  const value = bound === "low" ? props.base : props.top;

  if (source.endpoint === "gairmet") {
    const numeric = numberValue(value);
    if (numeric != null) return formatFeet(numeric * 100);
    return stringValue(value);
  }

  if (source.endpoint === "airmet") {
    const numeric = numberValue(value);
    if (numeric != null) return formatFeet(numeric * 1_000);
    return stringValue(value);
  }

  return formatFeet(numberValue(value)) ?? stringValue(value);
}

function formatMovement(
  props: Record<string, unknown>,
  source: SourceDefinition
) {
  const direction =
    source.endpoint === "airsigmet" ? props.movementDir : props.dir;
  const speed =
    source.endpoint === "airsigmet" ? props.movementSpd : props.spd;
  const directionText = stringValue(direction);
  const speedValue = numberValue(speed);

  if (!directionText && speedValue == null) return null;
  if (!directionText || directionText === "-") {
    return speedValue ? `${speedValue} kt` : "Stationary";
  }

  return `${directionText.padStart(3, "0")}°${
    speedValue != null ? ` at ${speedValue} kt` : ""
  }`;
}

function selectAltitude(
  values: Array<number | null>,
  bound: "low" | "high"
) {
  const validValues = values.filter((value): value is number => value != null);
  if (!validValues.length) return null;
  return bound === "low" ? Math.min(...validValues) : Math.max(...validValues);
}

function formatFeet(value: number | null) {
  if (value == null) return null;
  if (value >= 18_000) return `FL${Math.round(value / 100)}`;
  return `${Math.round(value).toLocaleString("en-US")} ft`;
}

function parseBoundingBox(value: string): BoundingBox | null {
  const parts = value.split(",").map((part) => Number(part.trim()));
  if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) {
    return null;
  }

  const [south, west, north, east] = parts;
  if (
    south < -90 ||
    south > 90 ||
    north < -90 ||
    north > 90 ||
    west < -180 ||
    west > 180 ||
    east < -180 ||
    east > 180 ||
    south >= north
  ) {
    return null;
  }

  return { south, west, north, east };
}

function geometryIntersectsBbox(geometry: Geometry, bbox: BoundingBox) {
  const positions: Position[] = [];
  collectGeometryPositions(geometry, positions);
  if (!positions.length) return false;

  const longitudes = positions.map(([longitude]) => longitude);
  const latitudes = positions.map(([, latitude]) => latitude);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);

  const latitudeOverlaps =
    maxLatitude >= bbox.south && minLatitude <= bbox.north;
  if (!latitudeOverlaps) return false;

  return bbox.west <= bbox.east
    ? maxLongitude >= bbox.west && minLongitude <= bbox.east
    : maxLongitude >= bbox.west || minLongitude <= bbox.east;
}

function collectGeometryPositions(
  geometry: Geometry,
  positions: Position[]
) {
  if (geometry.type === "GeometryCollection") {
    geometry.geometries.forEach((child) =>
      collectGeometryPositions(child, positions)
    );
    return;
  }

  collectPositions(geometry.coordinates, positions);
}

function collectPositions(value: unknown, positions: Position[]) {
  if (!Array.isArray(value)) return;

  if (
    value.length >= 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number"
  ) {
    positions.push(value as Position);
    return;
  }

  value.forEach((child) => collectPositions(child, positions));
}

function stringValue(value: unknown) {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function numberValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function parseDate(value: unknown) {
  const text = stringValue(value);
  if (!text) return null;
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
}
