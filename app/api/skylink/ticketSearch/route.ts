import { NextRequest, NextResponse } from "next/server";

type ErrorResponse = {
  message: string;
  status?: number;
};

export async function GET(request: NextRequest) {
  try {
    const rapidApiKey = process.env.SKYLINK_RAPIDAPI_KEY;
    const rapidApiHost =
      process.env.SKYLINK_RAPIDAPI_HOST || "skylink-api.p.rapidapi.com";
    const baseUrl =
      process.env.SKYLINK_BASE_URL || "https://skylink-api.p.rapidapi.com";

    if (!rapidApiKey) {
      return NextResponse.json<ErrorResponse>(
        { message: "Skylink API configuration is missing." },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);

    const origin = searchParams.get("origin")?.trim().toUpperCase();
    const destination = searchParams.get("destination")?.trim().toUpperCase();
    const date = searchParams.get("date")?.trim();
    const passengers = Number(searchParams.get("passengers") ?? "1");

    if (!origin || origin.length !== 3) {
      return NextResponse.json<ErrorResponse>(
        { message: "Origin must be a 3-letter IATA code, e.g. LHR." },
        { status: 400 }
      );
    }

    if (!destination || destination.length !== 3) {
      return NextResponse.json<ErrorResponse>(
        { message: "Destination must be a 3-letter IATA code, e.g. JFK." },
        { status: 400 }
      );
    }

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json<ErrorResponse>(
        { message: "Date is required in YYYY-MM-DD format." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(passengers) || passengers < 1 || passengers > 9) {
      return NextResponse.json<ErrorResponse>(
        { message: "Passengers must be between 1 and 9." },
        { status: 400 }
      );
    }

    const url = new URL(`${baseUrl}/tickets/search`);

    url.searchParams.set("origin", origin);
    url.searchParams.set("destination", destination);
    url.searchParams.set("date", date);
    url.searchParams.set("passengers", String(passengers));

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "x-rapidapi-key": rapidApiKey,
        "x-rapidapi-host": rapidApiHost,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type");

    const data = contentType?.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      return NextResponse.json<ErrorResponse>(
        {
          message:
            typeof data === "object" && data && "message" in data
              ? String(data.message)
              : "Failed to fetch ticket search results.",
          status: response.status,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Skylink ticket search API error:", error);

    return NextResponse.json<ErrorResponse>(
      { message: "Internal server error while searching tickets." },
      { status: 500 }
    );
  }
}