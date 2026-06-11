"use client";

import dynamic from "next/dynamic";

const WeatherMap = dynamic(() => import("./weathermap"), {
  ssr: false,
  loading: () => <p>Loading map...</p>,
});

export default function WeatherMapClient() {
  return <WeatherMap />;
}