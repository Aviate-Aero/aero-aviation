import { NextRequest } from "next/server";

const ALLOWED_LAYERS = new Set([
  "clouds_new",
  "precipitation_new",
  "pressure_new",
  "wind_new",
  "temp_new",
]);

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      layer: string;
      z: string;
      x: string;
      y: string;
    }>;
  }
) {
  const { layer, z, x, y } = await context.params;

  if (!ALLOWED_LAYERS.has(layer)) {
    return new Response("Invalid weather layer", { status: 400 });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    return new Response("OpenWeather API key is missing", { status: 500 });
  }

  const zoom = Number(z);
  const tileX = Number(x);
  const tileY = Number(y);

  if (
    !Number.isInteger(zoom) ||
    !Number.isInteger(tileX) ||
    !Number.isInteger(tileY) ||
    zoom < 0 ||
    zoom > 18 ||
    tileX < 0 ||
    tileY < 0
  ) {
    return new Response("Invalid tile coordinates", { status: 400 });
  }

  const openWeatherUrl =
    `https://tile.openweathermap.org/map/${layer}/${z}/${x}/${y}.png` +
    `?appid=${apiKey}`;

  const upstreamResponse = await fetch(openWeatherUrl, {
    next: {
      revalidate: 600,
    },
  });

  if (!upstreamResponse.ok) {
    return new Response("Failed to fetch weather tile", {
      status: upstreamResponse.status,
    });
  }

  const imageBuffer = await upstreamResponse.arrayBuffer();

  return new Response(imageBuffer, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=600, s-maxage=600",
    },
  });
}