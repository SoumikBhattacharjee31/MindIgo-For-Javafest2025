// app/dashboard/counselor/[id]/page.tsx
"use client";

export const dynamic = 'force-dynamic';
import React, { useState, useEffect } from 'react';
import { getCounselorById } from '../api';
import { Counselor } from '../types';
import { Star, Mail, ShieldCheck, Calendar, Info } from 'lucide-react';
import { useParams } from 'next/navigation';

const LoadingProfile = () => (
  <div className="container mx-auto px-4 py-8 animate-pulse">
    <div className="flex flex-col md:flex-row gap-8">
      <div className="md:w-1/3 flex flex-col items-center">
        <div className="skeleton h-48 w-48 rounded-full mb-4"></div>
        <div className="skeleton h-6 w-3/4 mb-2"></div>
        <div className="skeleton h-4 w-1/2"></div>
      </div>
      <div className="md:w-2/3">
        <div className="skeleton h-8 w-1/3 mb-6"></div>
        <div className="skeleton h-4 w-full mb-2"></div>
        <div className="skeleton h-4 w-full mb-2"></div>
        <div className="skeleton h-4 w-5/6"></div>
      </div>
    </div>
  </div>
);

const CounselorProfilePage = () => {
  const params = useParams();
  const id = params.id as string;

  const [counselor, setCounselor] = useState<Counselor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchCounselor = async () => {
        setLoading(true);
        try {
          const data = await getCounselorById(id);
          setCounselor({
            ...data,
            ratings: data.ratings ?? 0,
          });
        } catch (error) {
          setCounselor(null);
          console.error("Failed to fetch counselor details", error);
        } finally {
          setLoading(false);
        }
      };
      fetchCounselor();
    }
  }, [id]);

  if (loading) return <LoadingProfile />;
  if (!counselor) return <div className="text-center py-20">Counselor not found.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 py-10">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="card bg-base-100 shadow-2xl rounded-3xl overflow-hidden">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-primary to-secondary p-8 md:p-12 text-white relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <img
                src={
                  counselor.profileImageUrl ??
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(counselor.name)}&background=random&size=512`
                }
                alt={`Profile of ${counselor.name}`}
                className="rounded-full w-36 h-36 md:w-48 md:h-48 object-cover ring-4 ring-white shadow-xl"
              />
              <div className="text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{counselor.name}</h1>
                <p className="text-xl opacity-90 mb-4">{counselor.specialization}</p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="font-bold">
                      {counselor.ratings != null ? counselor.ratings.toFixed(1) : 'N/A'}
                    </span>
                    <span className="text-sm opacity-80">
                      ({counselor.ratings == null ? 'No ratings' : 'Average'})
                    </span>
                  </div>
                  {counselor.acceptsInsurance && (
                    <div className="badge badge-lg badge-success gap-2">
                      <ShieldCheck className="w-5 h-5" /> Accepts Insurance
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-6 md:p-10">
            <div className="grid md:grid-cols-2 gap-10">
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Info className="w-6 h-6 text-primary" /> About Me
                </h2>
                <p className="text-lg leading-relaxed text-base-content/90">
                  I’m {counselor.name}, a licensed counselor specializing in {counselor.specialization}. 
                  I believe in creating a safe, non-judgmental space where you can explore your thoughts and feelings. 
                  My approach is client-centered and tailored to your unique needs.
                </p>
                
                {counselor.licenseNumber && (
                  <div className="mt-6 p-4 bg-base-200 rounded-xl">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-primary" /> Credentials
                    </h3>
                    <p className="text-sm">License #: {counselor.licenseNumber}</p>
                    {counselor.counselorStatus && (
                      <p className="text-sm mt-1">
                        Status: <span className="badge badge-neutral badge-sm">{counselor.counselorStatus}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Mail className="w-6 h-6 text-primary" /> Contact & Info
                </h2>
                <div className="space-y-5">
                  <div className="flex items-start gap-4 p-4 bg-base-200 rounded-xl">
                    <Mail className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Email</div>
                      <a href={`mailto:${counselor.email}`} className="link link-primary">
                        {counselor.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-base-200 rounded-xl">
                    <Calendar className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Member Since</div>
                      <div>
                        {counselor.createdAt
                          ? new Date(counselor.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'Unknown'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t">
                  <button className="btn btn-primary btn-wide">
                    📅 Book a Session
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CounselorProfilePage;