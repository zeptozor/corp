"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDebounce } from "use-debounce";

interface Position {
  id: string;
  title: string;
  users: {
    id: string;
    name: string;
  }[];
}

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [debouncedSearch] = useDebounce(searchTerm, 500);

  useEffect(() => {
    const fetchPositions = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams(
          debouncedSearch ? { search: debouncedSearch } : {}
        );
        const response = await fetch(`/api/positions?${params}`);
        if (!response.ok) throw new Error("Failed to fetch positions");
        const data = await response.json();
        setPositions(data);
      } catch (err) {
        setError("Failed to load positions");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPositions();
  }, [debouncedSearch]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Positions</h1>
          <input
            type="text"
            placeholder="Search positions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-8">{error}</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {positions.map((position) => (
              <Link
                key={position.id}
                href={`/positions/${position.id}`}
                className="block p-6 border border-gray-200 rounded-lg hover:border-indigo-500 transition-colors"
              >
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  {position.title}
                </h2>
                <p className="text-sm text-gray-500">
                  {position.users.length} member{position.users.length !== 1 ? 's' : ''}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}