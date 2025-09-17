"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryState, parseAsInteger, parseAsString, parseAsBoolean } from 'nuqs';
import { getCounselors } from './api';
import { Counselor, PaginatedCounselorsResponse } from './types';
import { Search, SlidersHorizontal, Star, ShieldCheck, ListRestart } from 'lucide-react';

// --- Reusable Components ---

const CounselorCard = ({ counselor }: { counselor: Counselor }) => (
  <Link href={`/dashboard/counselor-list/${counselor.id}`}>
    <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-base-300 h-full">
      <figure className="px-10 pt-10">
        <img 
          src={counselor.profileImageUrl || `https://ui-avatars.com/api/?name=${counselor.name}&background=random`} 
          alt={`Profile of ${counselor.name}`} 
          className="rounded-full w-24 h-24 object-cover ring ring-primary ring-offset-base-100 ring-offset-2"
        />
      </figure>
      <div className="card-body items-center text-center">
        <h2 className="card-title">{counselor.name}</h2>
        <p className="text-accent">{counselor.specialization}</p>
        <div className="flex items-center gap-2 mt-2">
          <Star className="w-5 h-5 text-yellow-400" />
          {/* This line is now fixed */}
          <span className="font-bold">{(counselor.ratings ?? 0).toFixed(1)}</span>
        </div>
        {counselor.acceptsInsurance && (
          <div className="badge badge-success gap-2 mt-2">
            <ShieldCheck className="w-4 h-4"/> Accepts Insurance
          </div>
        )}
      </div>
    </div>
  </Link>
);

const Pagination = ({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (page: number) => void }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i);

  return (
    <div className="join mt-8">
      {pages.map(page => (
        <button 
          key={page} 
          className={`join-item btn ${currentPage === page ? 'btn-active' : ''}`}
          onClick={() => onPageChange(page)}
        >
          {page + 1}
        </button>
      ))}
    </div>
  );
};

const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="card bg-base-100 shadow-xl border border-base-300">
                <div className="flex flex-col gap-4 w-full p-10">
                    <div className="skeleton h-32 w-32 rounded-full mx-auto"></div>
                    <div className="skeleton h-4 w-28 mx-auto"></div>
                    <div className="skeleton h-4 w-full"></div>
                    <div className="skeleton h-4 w-full"></div>
                </div>
            </div>
        ))}
    </div>
);

// --- Main Page Component ---

function CounselorsPageComponent() {
  const [data, setData] = useState<PaginatedCounselorsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  
  // State is managed in the URL for better UX
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(0));
  const [search, setSearch] = useQueryState('search', parseAsString.withDefault(''));
  const [specialization, setSpecialization] = useQueryState('spec', parseAsString.withDefault(''));
  const [acceptsInsurance, setAcceptsInsurance] = useQueryState('insurance', parseAsBoolean.withDefault(false));
  const [sort, setSort] = useQueryState('sort', parseAsString.withDefault('averageRating,desc'));

  // Local state for input fields before applying them to URL state
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
    setPage(0); // Reset to first page on new search
  };
  
  const resetFilters = () => {
    setSearch('');
    setLocalSearch('');
    setSpecialization('');
    setAcceptsInsurance(false);
    setSort('averageRating,desc');
    setPage(0);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold">Find Your Counselor</h1>
        <p className="text-lg text-base-content/70 mt-2">Connect with professionals who can help you on your journey.</p>
      </header>

      {/* --- Filter and Sort Controls --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 p-4 bg-base-200 rounded-lg">
        <form onSubmit={handleSearchSubmit} className="md:col-span-2">
            <label className="input input-bordered flex items-center gap-2">
                <input 
                    type="text" 
                    className="grow" 
                    placeholder="Search by name or keyword"
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                />
                <Search className="w-4 h-4 opacity-70" />
            </label>
        </form>
        <select 
          className="select select-bordered w-full"
          value={specialization}
          onChange={e => { setSpecialization(e.target.value); setPage(0); }}
        >
          <option value="">All Specializations</option>
          <option value="Anxiety">Anxiety</option>
          <option value="Depression">Depression</option>
          <option value="Trauma">Trauma</option>
          <option value="Relationship Issues">Relationship Issues</option>
        </select>
        <select 
          className="select select-bordered w-full"
          value={sort}
          onChange={e => { setSort(e.target.value); setPage(0); }}
        >
          <option value="averageRating,desc">Sort by Rating</option>
          <option value="user,name,asc">Sort by Name (A-Z)</option>
        </select>
        <div className="form-control md:col-span-2">
            <label className="cursor-pointer label">
                <span className="label-text">Only show counselors who accept insurance</span> 
                <input 
                    type="checkbox" 
                    className="toggle toggle-primary" 
                    checked={acceptsInsurance}
                    onChange={e => { setAcceptsInsurance(e.target.checked); setPage(0); }}
                />
            </label>
        </div>
        <div className='md:col-span-2 flex items-end justify-end'>
          <button onClick={resetFilters} className="btn btn-ghost">
            <ListRestart className="w-4 h-4" /> Reset
          </button>
        </div>
      </div>

      {/* --- Counselors Grid --- */}
      {loading ? (
        <LoadingSkeleton />
      ) : data && data.content.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.content.map(counselor => (
              <CounselorCard key={counselor.id} counselor={counselor} />
            ))}
          </div>
          <div className="flex justify-center mt-8">
            <Pagination currentPage={data.number} totalPages={data.totalPages} onPageChange={setPage} />
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold">No Counselors Found</h2>
          <p className="text-base-content/60 mt-2">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
}

// Wrap with Suspense for nuqs to work correctly
export default function CounselorsPage() {
    return (
        <Suspense fallback={<LoadingSkeleton />}>
            <CounselorsPageComponent />
        </Suspense>
    )
}