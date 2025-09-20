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
  MapPin,
  Clock,
  Award,
  Heart,
  Sparkles,
} from "lucide-react";

// --- Reusable Components ---

const CounselorCard = ({ counselor }: { counselor: Counselor }) => (
  <Link href={`/dashboard/counselor/${counselor.id}`} className="block h-full group">
    <div className="card bg-gradient-to-br from-white via-white to-slate-50/30 shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-200/60 rounded-3xl overflow-hidden h-full flex flex-col relative backdrop-blur-sm group-hover:border-primary/30 group-hover:-translate-y-2">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-secondary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-4 right-8 w-2 h-2 bg-primary/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100 animate-pulse"></div>
        <div className="absolute top-12 right-16 w-1 h-1 bg-secondary/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-300 animate-pulse"></div>
        <div className="absolute bottom-16 left-8 w-1.5 h-1.5 bg-accent/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-500 animate-pulse"></div>
      </div>

      <div className="relative bg-gradient-to-b from-primary/5 via-primary/3 to-transparent p-8 pt-10 pb-6 text-center">
        {/* Profile Image with enhanced styling */}
        <div className="relative inline-block">
          <img
            src={
              counselor.profileImageUrl ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                counselor.name
              )}&background=6366f1&color=fff&size=256&font-size=0.4&rounded=true&bold=true`
            }
            alt={`Profile of ${counselor.name}`}
            className="rounded-full w-32 h-32 object-cover mx-auto ring-4 ring-white/80 shadow-xl group-hover:scale-110 group-hover:ring-primary/30 transition-all duration-500 relative z-10"
            loading="lazy"
          />
          {/* Glow effect behind image */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-lg scale-110 opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>
          
          {/* Online status indicator */}
          <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-400 rounded-full border-3 border-white shadow-lg z-20 flex items-center justify-center">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Insurance Badge */}
        {counselor.acceptsInsurance && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 animate-bounce">
            <ShieldCheck className="w-3.5 h-3.5" />
            Insurance
          </div>
        )}

        {/* Specialty Badge */}
        <div className="absolute top-4 left-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg opacity-90">
          <Award className="w-3.5 h-3.5 inline mr-1" />
          Expert
        </div>
      </div>

      <div className="card-body p-8 flex-grow flex flex-col justify-between relative z-10">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2 group-hover:from-primary group-hover:to-secondary transition-all duration-500">
              {counselor.name}
            </h3>
            <p className="text-primary/80 font-medium text-sm tracking-wide uppercase mb-1">
              {counselor.specialization}
            </p>
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-center gap-6 pt-2">
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1.5 rounded-full">
              <Star className="w-4 h-4 text-amber-500 fill-current" />
              <span className="font-semibold text-amber-700 text-sm">
                {(counselor.ratings ?? 0).toFixed(1)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">
                {new Date().getFullYear() - new Date(counselor.createdAt).getFullYear()}+ yrs
              </span>
            </div>
          </div>

          {/* Experience indicator */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-4 border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Experience</span>
              <Heart className="w-4 h-4 text-rose-400" />
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-1000 group-hover:w-full" 
                   style={{ width: `${Math.min(100, ((new Date().getFullYear() - new Date(counselor.createdAt).getFullYear()) / 10) * 100)}%` }}>
              </div>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="mt-6 text-center">
          <div className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-2xl font-semibold text-sm shadow-lg transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            View Profile
          </div>
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
    <div className="flex justify-center items-center gap-2 mt-12">
      <button
        className={`px-4 py-2 rounded-2xl font-medium transition-all duration-300 ${
          currentPage === 0 
            ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
            : "bg-white text-slate-700 hover:bg-primary hover:text-white shadow-md hover:shadow-lg hover:-translate-y-0.5"
        }`}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
      >
        ← Previous
      </button>

      <div className="flex gap-1">
        {getPageNumbers().map((page, idx) =>
          typeof page === "number" ? (
            <button
              key={idx}
              className={`w-10 h-10 rounded-xl font-semibold transition-all duration-300 ${
                currentPage === page - 1
                  ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg scale-110"
                  : "bg-white text-slate-700 hover:bg-slate-100 shadow-md hover:shadow-lg hover:-translate-y-0.5"
              }`}
              onClick={() => onPageChange(page - 1)}
            >
              {page}
            </button>
          ) : (
            <span key={idx} className="w-10 h-10 flex items-center justify-center text-slate-400">
              ...
            </span>
          )
        )}
      </div>

      <button
        className={`px-4 py-2 rounded-2xl font-medium transition-all duration-300 ${
          currentPage === totalPages - 1 
            ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
            : "bg-white text-slate-700 hover:bg-primary hover:text-white shadow-md hover:shadow-lg hover:-translate-y-0.5"
        }`}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
      >
        Next →
      </button>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
    {Array.from({ length: 9 }).map((_, i) => (
      <div
        key={i}
        className="bg-gradient-to-br from-white to-slate-50 shadow-lg rounded-3xl border border-slate-200/60 h-96 flex flex-col overflow-hidden"
      >
        <div className="p-8 pt-10 pb-6 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="w-32 h-32 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full mx-auto animate-pulse"></div>
        </div>
        <div className="p-8 flex-grow flex flex-col justify-between">
          <div className="space-y-4 text-center">
            <div className="h-6 bg-gradient-to-r from-slate-200 to-slate-300 rounded-2xl animate-pulse"></div>
            <div className="h-4 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl mx-auto w-3/4 animate-pulse"></div>
            <div className="flex justify-center gap-4 pt-2">
              <div className="h-6 w-16 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full animate-pulse"></div>
              <div className="h-6 w-16 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="mt-6">
            <div className="h-12 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl animate-pulse"></div>
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
        console.log('Fetching with params:', params); // Debug log
        const result = await getCounselors(params);
        setData(result);
      } catch (error) {
        console.error("Failed to fetch counselors:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    
    // Add a small delay to ensure state is properly updated
    const timeoutId = setTimeout(fetchData, 50);
    return () => clearTimeout(timeoutId);
  }, [page, search, specialization, acceptsInsurance, sort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(localSearch);
    setPage(0);
  };

  const handlePageChange = (newPage: number) => {
    console.log('Changing page to:', newPage); // Debug log
    setPage(newPage);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/50">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-primary/3 to-secondary/3 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-accent/3 to-primary/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-secondary/2 to-transparent rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <header className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-secondary/10 px-6 py-2 rounded-full text-primary font-semibold text-sm mb-6 border border-primary/20">
            <Sparkles className="w-4 h-4" />
            Professional Mental Health Support
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-slate-800 via-primary to-secondary bg-clip-text text-transparent mb-4 leading-tight">
            Find Your Perfect
            <br />
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Counselor Match
            </span>
          </h1>
          <p className="text-xl text-slate-600 mt-4 max-w-2xl mx-auto leading-relaxed">
            Connect with certified professionals who understand your journey and are ready to support your mental wellness goals.
          </p>
        </header>

        {/* Enhanced Filter Section */}
        <div className="bg-white/70 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-slate-200/50 mb-12">
          <div className="flex flex-wrap items-end gap-6 mb-6">
            <div className="flex-grow min-w-[300px]">
              <label className="block text-sm font-semibold text-slate-700 mb-3">Search Counselors</label>
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className="relative">
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by name, specialization, or approach..."
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    className="w-full pl-12 pr-20 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-300 text-slate-700 placeholder-slate-400"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-primary to-secondary text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>

            <div className="w-full sm:w-auto min-w-[200px]">
              <label className="block text-sm font-semibold text-slate-700 mb-3">Specialization</label>
              <select
                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-300 text-slate-700"
                value={specialization}
                onChange={(e) => {
                  setSpecialization(e.target.value);
                  setPage(0);
                }}
              >
                <option value="">All Specialties</option>
                <option value="Anxiety">🧘 Anxiety Management</option>
                <option value="Depression">💙 Depression Support</option>
                <option value="Trauma">🌟 Trauma Recovery</option>
                <option value="Relationship Issues">💕 Relationship Counseling</option>
              </select>
            </div>

            <div className="w-full sm:w-auto min-w-[200px]">
              <label className="block text-sm font-semibold text-slate-700 mb-3">Sort By</label>
              <select
                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-300 text-slate-700"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(0);
                }}
              >
                <option value="averageRating,desc">⭐ Highest Rated</option>
                <option value="user,name,asc">🔤 Name (A-Z)</option>
                <option value="createdAt,desc">🆕 Newest First</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-slate-100">
            <label className="flex items-center gap-4 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={acceptsInsurance}
                  onChange={(e) => {
                    setAcceptsInsurance(e.target.checked);
                    setPage(0);
                  }}
                />
                <div className={`w-12 h-6 rounded-full transition-all duration-300 ${
                  acceptsInsurance ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 'bg-slate-300'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-lg transform transition-transform duration-300 ${
                    acceptsInsurance ? 'translate-x-6' : 'translate-x-0.5'
                  } mt-0.5`}></div>
                </div>
              </div>
              <span className="font-semibold text-slate-700 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                Accepts Insurance
              </span>
            </label>

            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <ListRestart className="w-5 h-5" />
              Reset All Filters
            </button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <LoadingSkeleton />
        ) : data && data.content.length > 0 ? (
          <>
            <div className="mb-8">
              <p className="text-slate-600 text-center text-lg">
                Found <span className="font-bold text-primary">{data.totalElements}</span> counselors ready to help
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.content.map((counselor, index: number) => (
                <div 
                  key={counselor.id} 
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CounselorCard counselor={counselor} />
                </div>
              ))}
            </div>
            <Pagination
              currentPage={data.number}
              totalPages={data.totalPages}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <div className="text-center py-20 px-8 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-200/50 shadow-xl">
            <div className="mx-auto w-32 h-32 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mb-8 shadow-lg">
              <Search className="w-16 h-16 text-amber-500" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">No counselors found</h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto text-lg leading-relaxed">
              We couldn't find any counselors matching your criteria. Try adjusting your filters to discover more professionals.
            </p>
            <button 
              onClick={resetFilters} 
              className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-3 mx-auto"
            >
              <Sparkles className="w-5 h-5" />
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
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