"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { ComponentType } from "react";
import {
  Map as MapIcon,
  CloudSun,
  Wind,
  MapPin,
  type LucideProps,
} from "lucide-react";

const WeatherMap = dynamic(() => import("./weathermap"), {
  ssr: false,
  loading: () => (
    <p className="px-5 py-8 text-sm text-zinc-400">Loading map…</p>
  ),
});

const LiveWeather = dynamic(() => import("./liveWeather"), { ssr: false });
const AirPollution = dynamic(() => import("./airPollution"), { ssr: false });
const Geocoding = dynamic(() => import("./geocoding"), { ssr: false });

type View = "maps" | "live" | "air" | "geo";

const TABS: { id: View; label: string; icon: ComponentType<LucideProps> }[] = [
  { id: "maps", label: "Weather Maps", icon: MapIcon },
  { id: "live", label: "Live Weather", icon: CloudSun },
  { id: "air", label: "Air Pollution", icon: Wind },
  { id: "geo", label: "Geocoding", icon: MapPin },
];

export default function WeatherMapClient() {
  const [view, setView] = useState<View>("maps");

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white mt-40">
      <div className="relative z-20 mx-auto w-full max-w-[1600px] px-5 pt-8 lg:px-6">
        {/* Top-level view toggle */}
        <div className="inline-flex flex-wrap items-center gap-1 rounded-full border border-zinc-800 bg-zinc-950/80 p-1 backdrop-blur-md">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = view === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setView(tab.id)}
                className={[
                  "flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300",
                  active
                    ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                    : "border border-transparent text-zinc-400 hover:text-zinc-200",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {view === "maps" ? (
        <WeatherMap />
      ) : (
        <section className="relative z-20 mx-auto w-full max-w-[1600px] px-5 py-8 lg:px-6">
          {view === "live" && <LiveWeather />}
          {view === "air" && <AirPollution />}
          {view === "geo" && <Geocoding />}
        </section>
      )}
    </main>
  );
}
