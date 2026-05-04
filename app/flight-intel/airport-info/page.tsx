// app/page.tsx (or any client component)
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/buttons/Standard';
import { Starfield } from '@/components/ui/starfield/Standard';

export default function AirportSearch() {
  const [codeType, setCodeType] = useState<'iata' | 'icao'>('icao');
  const [code, setCode] = useState('');
  const [airport, setAirport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchAirport = async () => {
    setLoading(true);
    setError('');
    setAirport(null);

    try {
      const res = await fetch(
        `/api/aerodatabox/airports?codeType=${codeType}&code=${code}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Request failed');
      }
      setAirport(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative bg-black text-white overflow-hidden min-h-screen mt-40">
      <Starfield />

      <div className="relative z-20 container mx-auto px-6 lg:px-12 pt-24 pb-20">
        <motion.h1
          className="text-4xl md:text-5xl lg:text-6xl font-light mb-8"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
        >
          Airport Search
        </motion.h1>

        {/* Search Controls - fixed width input, aligned heights */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <select
            value={codeType}
            onChange={(e) => setCodeType(e.target.value as any)}
            className="h-12 bg-zinc-900 border border-zinc-800 rounded-lg px-4 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
          >
            <option value="icao">ICAO</option>
            <option value="iata">IATA</option>
          </select>

          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder={codeType === 'icao' ? 'e.g. OPIS' : 'e.g. ISB'}
            className="h-12 w-48 sm:w-56 bg-zinc-900 border border-zinc-800 rounded-lg px-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
          />

          <Button
            onClick={searchAirport}
            disabled={loading}
            className="h-12 bg-sky-500 hover:bg-sky-600 text-white px-8 rounded-full transition-all duration-[650ms] hover:scale-[1.02]"
          >
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 mb-8"
          >
            {error}
          </motion.p>
        )}

        {/* Airport Result */}
        {airport && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 md:p-8 backdrop-blur-sm"
          >
            <h2 className="text-2xl md:text-3xl font-light mb-4">
              {airport.fullName} ({airport.icao}/{airport.iata})
            </h2>

            <div className="space-y-3 text-zinc-300">
              {airport.shortName && <p>Short Name: {airport.shortName}</p>}
              {airport.municipalityName && <p>Municipality: {airport.municipalityName}</p>}
              {airport.country && (
                <p>Country: {airport.country.name} ({airport.country.code})</p>
              )}
              {airport.location && (
                <p>Location: {airport.location.lat}, {airport.location.lon}</p>
              )}
              {airport.elevation && (
                <p>
                  Elevation: {airport.elevation.feet} ft ({airport.elevation.meter} m)
                </p>
              )}
              {airport.continent && (
                <p>Continent: {airport.continent.name} ({airport.continent.code})</p>
              )}
              {airport.timeZone && <p>Time Zone: {airport.timeZone}</p>}
            </div>

            {airport.urls && (
              <div className="mt-6">
                <p className="text-zinc-400 mb-2">Links:</p>
                <ul className="flex flex-wrap gap-3">
                  {airport.urls.webSite && (
                    <li>
                      <a
                        href={airport.urls.webSite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors"
                      >
                        Official Website
                      </a>
                    </li>
                  )}
                  {airport.urls.wikipedia && (
                    <li>
                      <a
                        href={airport.urls.wikipedia}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors"
                      >
                        Wikipedia
                      </a>
                    </li>
                  )}
                  {airport.urls.twitter && (
                    <li>
                      <a
                        href={airport.urls.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors"
                      >
                        Twitter
                      </a>
                    </li>
                  )}
                  {airport.urls.liveAtc && (
                    <li>
                      <a
                        href={airport.urls.liveAtc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors"
                      >
                        LiveATC
                      </a>
                    </li>
                  )}
                  {airport.urls.flightRadar && (
                    <li>
                      <a
                        href={airport.urls.flightRadar}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors"
                      >
                        FlightRadar24
                      </a>
                    </li>
                  )}
                  {airport.urls.googleMaps && (
                    <li>
                      <a
                        href={airport.urls.googleMaps}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors"
                      >
                        Google Maps
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </main>
  );
}