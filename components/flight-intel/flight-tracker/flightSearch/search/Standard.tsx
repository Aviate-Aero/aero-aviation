'use client';

import { useState, useEffect } from 'react';
import { Search, Plane, Building2 } from 'lucide-react';
import { Input } from '@/components/input/Standard';
import { Button } from '@/components/buttons/Standard';
import { Tabs, TabsList, TabsTrigger } from '@/components/tabs/Standard';

interface FlightSearchProps {
  onSearch: (params: any, type: string) => void | Promise<void>;
  isLoading: boolean;
}

export default function FlightSearch({
  onSearch,
  isLoading,
}: FlightSearchProps) {
  const [searchType, setSearchType] = useState<
    'flight' | 'airport' | 'airline'
  >('flight');

  const [query, setQuery] = useState('');

  useEffect(() => {
    setQuery('');
  }, [searchType]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const cleanQuery = query.trim();

    if (!cleanQuery) return;

    const params: any = {};

    if (searchType === 'flight') {
      params.flights = cleanQuery;
    } else if (searchType === 'airport') {
      params.airports = cleanQuery.toUpperCase();
    } else if (searchType === 'airline') {
      params.operating_as = cleanQuery;
    }

    onSearch(params, searchType);
  };

  return (
    <div className="space-y-4">
      <Tabs
        value={searchType}
        onValueChange={(value: any) => setSearchType(value)}
        className="w-full"
      >
        <TabsList className="inline-flex w-auto bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 p-1 rounded-full">
          <TabsTrigger
            value="flight"
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-zinc-400 data-[state=active]:bg-sky-500/20 data-[state=active]:text-sky-400 data-[state=active]:border data-[state=active]:border-sky-500/30 transition-all duration-300"
          >
            <Plane className="w-4 h-4" />
            <span className="hidden sm:inline">Flight</span>
          </TabsTrigger>

          <TabsTrigger
            value="airport"
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-zinc-400 data-[state=active]:bg-sky-500/20 data-[state=active]:text-sky-400 data-[state=active]:border data-[state=active]:border-sky-500/30 transition-all duration-300"
          >
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Airport</span>
          </TabsTrigger>

          <TabsTrigger
            value="airline"
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-zinc-400 data-[state=active]:bg-sky-500/20 data-[state=active]:text-sky-400 data-[state=active]:border data-[state=active]:border-sky-500/30 transition-all duration-300"
          >
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">Airline</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder={
            searchType === 'flight'
              ? 'Enter flight number (e.g., UA123)'
              : searchType === 'airport'
                ? 'Enter airport code (e.g., JFK, LHR)'
                : 'Enter airline name or code'
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-black/40 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-sky-500 focus:ring-sky-500/30 rounded-full h-[42px]"
        />

        <Button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="bg-sky-500 hover:bg-sky-600 text-white rounded-full px-5 h-[42px] shadow-lg shadow-sky-500/20 transition-all duration-300 disabled:opacity-50"
        >
          <Search className="w-4 h-4 mr-2" />
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
      </form>
    </div>
  );
}