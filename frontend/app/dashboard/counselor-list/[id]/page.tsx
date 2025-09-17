"use client";

export const dynamic = 'force-dynamic';
import React, { useState, useEffect } from 'react';
import { getCounselorById } from '../api';
import { Counselor } from '../types';
import { Star, Mail, ShieldCheck, Calendar } from 'lucide-react'; // Removed unused Info
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
          // Optional: Normalize ratings here if you want a default (e.g., for unrated counselors)
          setCounselor({
            ...data,
            ratings: data.ratings ?? 0, // Default to 0 if missing/undefined
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
    <div className="bg-base-200 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="card lg:card-side bg-base-100 shadow-xl">
          <figure className="lg:w-1/3 p-8 flex flex-col items-center justify-center bg-primary/10">
            <img
              src={
                counselor.profileImageUrl ??
                `https://ui-avatars.com/api/?name=${encodeURIComponent(counselor.name)}&background=random&size=256`
              }
              alt={`Profile of ${counselor.name}`}
              className="rounded-full w-48 h-48 object-cover ring-4 ring-primary ring-offset-base-100 ring-offset-4"
            />
            <div className="mt-6 text-center">
              <h1 className="text-3xl font-bold">{counselor.name}</h1>
              <p className="text-lg text-accent mt-1">{counselor.specialization}</p>
            </div>
          </figure>
          <div className="card-body lg:w-2/3">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2 text-xl">
                <Star className="w-6 h-6 text-yellow-400" />
                <span className="font-bold">
                  {counselor.ratings != null ? counselor.ratings.toFixed(1) : 'N/A'}
                </span>
                <span className="text-sm text-base-content/60">
                  (Average Rating{counselor.ratings == null ? ' - No ratings yet' : ''})
                </span>
              </div>
              {counselor.acceptsInsurance && (
                <div className="badge badge-lg badge-success gap-2">
                  <ShieldCheck className="w-5 h-5" /> Accepts Insurance
                </div>
              )}
            </div>

            <h2 className="card-title text-2xl border-b pb-2 mb-4">Details</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <a href={`mailto:${counselor.email}`} className="link link-hover">
                  {counselor.email}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <span>
                  Joined on:{' '}
                  {counselor.createdAt
                    ? new Date(counselor.createdAt).toLocaleDateString()
                    : 'Unknown'}
                </span>
              </div>
              {/* Optional: Add more fields from response if needed */}
              {counselor.licenseNumber && (
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <span>License: {counselor.licenseNumber}</span>
                </div>
              )}
              {counselor.counselorStatus && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span>Status: {counselor.counselorStatus}</span>
                </div>
              )}
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-2">About</h3>
              <p className="text-base-content/80">
                {counselor.name} is a dedicated counselor specializing in{' '}
                {counselor.specialization}. With a focus on providing a safe and supportive
                environment, they help clients navigate challenges and foster personal growth.
                Contact them today to begin your journey.
              </p>
            </div>

            <div className="card-actions justify-end mt-6">
              <button className="btn btn-primary">Book a Session</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CounselorProfilePage;