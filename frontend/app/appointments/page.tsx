// app/appointments/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Users,
  ArrowRight,
  Star,
  Clock,
  Shield,
  Heart,
  CheckCircle,
  Loader2,
  User,
  Stethoscope,
  BookOpen,
  Award,
} from "lucide-react";

// Mock function to get user role - replace with actual auth logic
const getUserRole = async (): Promise<"CLIENT" | "COUNSELOR" | null> => {
  // This would typically come from your auth context or API call
  // For demo purposes, we'll return null to show the selection interface
  return null;
};

const AppointmentsLandingPage = () => {
  const [userRole, setUserRole] = useState<"CLIENT" | "COUNSELOR" | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const role = await getUserRole();
        if (role) {
          // Auto-redirect if user role is already known
          router.push(
            role === "CLIENT"
              ? "/appointments/client"
              : "/appointments/counselor"
          );
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error checking user role:", error);
        setLoading(false);
      }
    };

    checkUserRole();
  }, [router]);

  const handleRoleSelect = (role: "CLIENT" | "COUNSELOR") => {
    setUserRole(role);
    // In a real app, you might want to save this selection
    router.push(
      role === "CLIENT" ? "/appointments/client" : "/appointments/counselor"
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium text-lg">
            Loading appointments...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 lg:py-24">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <Calendar className="w-10 h-10 text-white" />
              </div>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Mental Health
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {" "}
                Appointments
              </span>
            </h1>

            <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Connect with qualified mental health professionals or manage your
              counseling practice with our comprehensive appointment system
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/50 shadow-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Secure & Private
                </h3>
                <p className="text-gray-600">
                  HIPAA-compliant platform ensuring your privacy and
                  confidentiality
                </p>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/50 shadow-lg">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Qualified Professionals
                </h3>
                <p className="text-gray-600">
                  Licensed therapists and counselors with verified credentials
                </p>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/50 shadow-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Flexible Scheduling
                </h3>
                <p className="text-gray-600">
                  Book appointments that fit your schedule, available 7 days a
                  week
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role Selection Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Experience
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Whether you're seeking mental health support or providing
            professional counseling services, we have the right tools for you
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Client Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-xl"></div>
            <div className="relative bg-white rounded-3xl p-8 lg:p-12 shadow-xl border-2 border-gray-100 group-hover:border-blue-200 transition-all duration-300 cursor-pointer">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <User className="w-12 h-12 text-white" />
                </div>

                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  I'm a Client
                </h3>
                <p className="text-lg text-gray-600 mb-8 max-w-md">
                  Looking for mental health support? Find qualified therapists,
                  book appointments, and manage your therapy journey.
                </p>

                {/* Client Features */}
                <div className="space-y-4 mb-8 text-left w-full max-w-md">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">
                      Browse qualified therapists
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">
                      Schedule appointments easily
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Track your progress</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Secure messaging</span>
                  </div>
                </div>

                <button className="group/btn flex items-center space-x-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl">
                  <span>Get Started as Client</span>
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-200" />
                </button>

                <div className="mt-6 flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span>4.9/5 rating</span>
                  </div>
                  <span>•</span>
                  <span>50,000+ sessions completed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Counselor Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-xl"></div>
            <div className="relative bg-white rounded-3xl p-8 lg:p-12 shadow-xl border-2 border-gray-100 group-hover:border-indigo-200 transition-all duration-300 cursor-pointer">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Stethoscope className="w-12 h-12 text-white" />
                </div>

                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  I'm a Counselor
                </h3>
                <p className="text-lg text-gray-600 mb-8 max-w-md">
                  Professional therapist or counselor? Manage your practice,
                  appointments, and client relationships efficiently.
                </p>

                {/* Counselor Features */}
                <div className="space-y-4 mb-8 text-left w-full max-w-md">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Manage your schedule</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">
                      Client management tools
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Analytics & reporting</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">
                      Professional dashboard
                    </span>
                  </div>
                </div>

                <button className="group/btn flex items-center space-x-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl">
                  <span>Access Counselor Dashboard</span>
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-200" />
                </button>

                <div className="mt-6 flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Award className="w-4 h-4 text-indigo-400" />
                    <span>Licensed professionals</span>
                  </div>
                  <span>•</span>
                  <span>500+ therapists</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-blue-100 text-lg">
              Join our growing community of mental health advocates
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">50K+</div>
              <div className="text-blue-100">Sessions Completed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-blue-100">Licensed Therapists</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">4.9/5</div>
              <div className="text-blue-100">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-blue-100">Available Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Take the first step towards better mental health or grow your
          counseling practice
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => handleRoleSelect("CLIENT")}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Find a Therapist
          </button>
          <button
            onClick={() => handleRoleSelect("COUNSELOR")}
            className="border-2 border-gray-300 hover:border-indigo-500 text-gray-700 hover:text-indigo-600 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200"
          >
            Join as Counselor
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsLandingPage;
