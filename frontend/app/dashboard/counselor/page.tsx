// app/dashboard/counselors/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useQueryState,
  parseAsInteger,
  parseAsString,
  parseAsBoolean,
} from "nuqs";
import { getCounselors } from "./api";
import { Counselor, PaginatedCounselorsResponse } from "./types";
import {
  Search,
  SlidersHorizontal,
  Star,
  ShieldCheck,
  ListRestart,
} from "lucide-react";

// --- Reusable Components ---

const CounselorCard = ({ counselor }: { counselor: Counselor }) => (
  <Link href={`/dashboard/counselor/${counselor.id}`} className="block h-full">
    <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 border border-base-200 rounded-2xl overflow-hidden h-full flex flex-col group">
      <div className="relative bg-gradient-to-b from-primary/10 to-transparent p-6 pt-8 pb-4 text-center">
        <img
          src={
            counselor.profileImageUrl ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              counselor.name
            )}&background=random&size=256`
          }
          alt={`Profile of ${counselor.name}`}
          className="rounded-full w-28 h-28 object-cover mx-auto ring-4 ring-white shadow-md group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {counselor.acceptsInsurance && (
          <div className="absolute top-4 right-4 badge badge-success badge-sm gap-1">
            <ShieldCheck className="w-3 h-3" /> Ins.
          </div>
        )}
      </div>
      <div className="card-body p-6 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="card-title text-xl font-semibold mb-1 line-clamp-1">
            {counselor.name}
          </h3>
          <p className="text-sm text-accent mb-3 line-clamp-1">
            {counselor.specialization}
          </p>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="font-medium text-sm">
              {(counselor.ratings ?? 0).toFixed(1)}
            </span>
          </div>
          <span className="text-xs text-base-content/60">
            Since {new Date(counselor.createdAt).getFullYear()}
          </span>
        </div>
      </div>
    </div>
  </Link>
);

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className="join mt-10 justify-center flex flex-wrap gap-1">
      <button
        className={`join-item btn btn-sm ${
          currentPage === 0 ? "btn-disabled" : ""
        }`}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
      >
        «
      </button>

      {getPageNumbers().map((page, idx) =>
        typeof page === "number" ? (
          <button
            key={idx}
            className={`join-item btn btn-sm ${
              currentPage === page - 1
                ? "btn-active btn-primary text-white"
                : ""
            }`}
            onClick={() => onPageChange(page - 1)}
          >
            {page}
          </button>
        ) : (
          <span key={idx} className="join-item btn btn-sm btn-disabled">
            ...
          </span>
        )
      )}

      <button
        className={`join-item btn btn-sm ${
          currentPage === totalPages - 1 ? "btn-disabled" : ""
        }`}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
      >
        »
      </button>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
    {Array.from({ length: 9 }).map((_, i) => (
      <div
        key={i}
        className="card bg-base-200 shadow animate-pulse rounded-2xl border border-base-200 h-80 flex flex-col"
      >
        <div className="p-6 pt-8 pb-4 bg-base-100/50">
          <div className="skeleton h-28 w-28 rounded-full mx-auto"></div>
        </div>
        <div className="card-body p-6 flex-grow flex flex-col justify-between">
          <div className="space-y-3">
            <div className="skeleton h-5 w-3/4 mx-auto"></div>
            <div className="skeleton h-4 w-1/2 mx-auto"></div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="skeleton h-4 w-16"></div>
            <div className="skeleton h-4 w-12"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// --- Main Page Component ---

function CounselorsPageComponent() {
  const [data, setData] = useState<PaginatedCounselorsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(0));
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault("")
  );
  const [specialization, setSpecialization] = useQueryState(
    "spec",
    parseAsString.withDefault("")
  );
  const [acceptsInsurance, setAcceptsInsurance] = useQueryState(
    "insurance",
    parseAsBoolean.withDefault(false)
  );
  const [sort, setSort] = useQueryState(
    "sort",
    parseAsString.withDefault("averageRating,desc")
  );

  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          size: 9,
          sort,
          ...(search && { search }),
          ...(specialization && { specialization }),
          ...(acceptsInsurance && { acceptsInsurance }),
        };
        const result = await getCounselors(params);
        setData(result);
      } catch (error) {
        console.error("Failed to fetch counselors:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, search, specialization, acceptsInsurance, sort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(localSearch);
    setPage(0);
  };

  const resetFilters = () => {
    setSearch("");
    setLocalSearch("");
    setSpecialization("");
    setAcceptsInsurance(false);
    setSort("averageRating,desc");
    setPage(0);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Find Your Counselor
        </h1>
        <p className="text-lg text-base-content/70 mt-2">
          Connect with professionals who can help you on your journey.
        </p>
      </header>

      {/* Filter Section */}
      <div className="bg-base-100 p-6 rounded-2xl shadow-sm mb-10 space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-grow min-w-[250px]">
            <form onSubmit={handleSearchSubmit} className="relative">
              <label className="input input-bordered flex items-center gap-3 w-full pl-4 pr-12 bg-base-200">
                <Search className="w-5 h-5 opacity-70" />
                <input
                  type="text"
                  placeholder="Search counselors..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="grow bg-transparent placeholder:text-base-content/60"
                />
              </label>
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm"
              >
                Go
              </button>
            </form>
          </div>

          <div className="w-full sm:w-auto">
            <select
              className="select select-bordered w-full max-w-xs bg-base-200"
              value={specialization}
              onChange={(e) => {
                setSpecialization(e.target.value);
                setPage(0);
              }}
            >
              <option value="">All Specialties</option>
              <option value="Anxiety">Anxiety</option>
              <option value="Depression">Depression</option>
              <option value="Trauma">Trauma</option>
              <option value="Relationship Issues">Relationship Issues</option>
            </select>
          </div>

          <div className="w-full sm:w-auto">
            <select
              className="select select-bordered w-full max-w-xs bg-base-200"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(0);
              }}
            >
              <option value="averageRating,desc">⭐ Highest Rated</option>
              <option value="user,name,asc">🔤 A-Z Name</option>
              <option value="createdAt,desc">🆕 Newest First</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <label className="cursor-pointer label flex items-center gap-3">
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={acceptsInsurance}
              onChange={(e) => {
                setAcceptsInsurance(e.target.checked);
                setPage(0);
              }}
            />
            <span className="label-text font-medium">Accepts Insurance</span>
          </label>

          <button
            onClick={resetFilters}
            className="btn btn-outline btn-sm gap-2 normal-case"
          >
            <SlidersHorizontal className="w-4 h-4" /> Reset Filters
          </button>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <LoadingSkeleton />
      ) : data && data.content.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.content.map((counselor) => (
              <CounselorCard key={counselor.id} counselor={counselor} />
            ))}
          </div>
          <div className="flex justify-center mt-12">
            <Pagination
              currentPage={data.number}
              totalPages={data.totalPages}
              onPageChange={setPage}
            />
          </div>
        </>
      ) : (
        <div className="text-center py-20 px-6 bg-base-100 rounded-2xl">
          <div className="mx-auto w-24 h-24 rounded-full bg-warning/10 flex items-center justify-center mb-6">
            <Search className="w-12 h-12 text-warning" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No counselors found</h2>
          <p className="text-base-content/70 mb-6 max-w-md mx-auto">
            Try adjusting your filters or search terms. We’re sure you’ll find
            the perfect match!
          </p>
          <button onClick={resetFilters} className="btn btn-primary btn-wide">
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default function CounselorsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <CounselorsPageComponent />
    </Suspense>
  );
}
