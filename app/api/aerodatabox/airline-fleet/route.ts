import { NextRequest, NextResponse } from "next/server";

type ErrorResponse = {
  message: string;
  status?: number;
};

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.AERODATABOX_API_KEY;
    const baseUrl = process.env.AERODATABOX_BASE_URL;

    if (!apiKey || !baseUrl) {
      return NextResponse.json<ErrorResponse>(
        { message: "AeroDataBox API configuration is missing." },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);

    const airlineCode = searchParams.get("airlineCode")?.trim().toUpperCase();

    if (!airlineCode || airlineCode.length < 2 || airlineCode.length > 3) {
      return NextResponse.json<ErrorResponse>(
        {
          message:
            "Invalid airline code. Use ICAO code like KLM, PIA, UAE, QTR.",
        },
        { status: 400 }
      );
    }

    const requestedPageSize = Number(searchParams.get("pageSize") ?? "20");
    const safePageSize = Math.min(Math.max(requestedPageSize, 1), 100);

    const requestedPageOffset = Number(searchParams.get("pageOffset") ?? "0");
    const safePageOffset = Math.max(requestedPageOffset, 0);

    const withRegistrations =
      searchParams.get("withRegistrations") === "true";

    const url = new URL(`${baseUrl}/airlines/${airlineCode}/aircrafts`);

    url.searchParams.set("pageSize", String(safePageSize));
    url.searchParams.set("pageOffset", String(safePageOffset));
    url.searchParams.set("withRegistrations", String(withRegistrations));

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        "x-api-market-key": apiKey,
      },
      cache: "no-store",
    });

    if (response.status === 204) {
      return NextResponse.json(
        {
          totalCount: 0,
          pageOffset: safePageOffset,
          pageSize: safePageSize,
          hasNextPage: false,
          count: 0,
          items: [],
        },
        { status: 200 }
      );
    }

    const contentType = response.headers.get("content-type");

    const data = contentType?.includes("application/json")
      ? await response.json()
      : null;

    if (!response.ok) {
      return NextResponse.json<ErrorResponse>(
        {
          message: data?.message || "Failed to fetch airline fleet.",
          status: response.status,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("AeroDataBox airline fleet API error:", error);

    return NextResponse.json<ErrorResponse>(
      { message: "Internal server error while fetching airline fleet." },
      { status: 500 }
    );
  }
}