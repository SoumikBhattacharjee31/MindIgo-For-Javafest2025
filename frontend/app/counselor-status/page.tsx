"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { ToastContainer } from 'react-toastify';
import { successToast, errorToast } from '../../util/toastHelper';

interface CounselorStatus {
  status: string;
  verificationNotes?: string;
  verifiedAt?: string;
  canLogin: boolean;
}

const CounselorStatusPage = () => {
  const [status, setStatus] = useState<CounselorStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCounselorStatus();
  }, []);

  const fetchCounselorStatus = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/v1/auth/counselor-status', {
        withCredentials: true
      });

      if (response.data.success) {
        setStatus(response.data.data);
      } else {
        errorToast('Failed to fetch status');
      }
    } catch (error) {
      console.error('Error fetching counselor status:', error);
      errorToast('Error fetching status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusMessage = () => {
    if (!status) return '';

    switch (status.status) {
      case 'PENDING_VERIFICATION':
        return 'Your counselor registration is under review. We will notify you once the admin completes the verification process.';
      case 'APPROVED':
        return 'Congratulations! Your counselor account has been approved. You can now log in and start using the platform.';
      case 'REJECTED':
        return 'Unfortunately, your counselor application has been rejected. Please contact support for more information.';
      case 'SUSPENDED':
        return 'Your counselor account has been suspended. Please contact support for assistance.';
      default:
        return 'Unknown status';
    }
  };

  const getStatusColor = () => {
    if (!status) return 'text-gray-600';

    switch (status.status) {
      case 'PENDING_VERIFICATION':
        return 'text-yellow-600';
      case 'APPROVED':
        return 'text-green-600';
      case 'REJECTED':
        return 'text-red-600';
      case 'SUSPENDED':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-blue-700 to-cyan-400 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-blue-700 to-cyan-400 flex items-center justify-center">
      <div className="bg-white bg-opacity-90 p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Counselor Status</h1>
          
          {status && (
            <div className="space-y-4">
              <div className={`text-lg font-semibold ${getStatusColor()}`}>
                Status: {status.status.replace('_', ' ')}
              </div>
              
              <p className="text-gray-700">
                {getStatusMessage()}
              </p>
              
              {status.verificationNotes && (
                <div className="bg-gray-100 p-3 rounded">
                  <p className="text-sm text-gray-600">
                    <strong>Admin Notes:</strong> {status.verificationNotes}
                  </p>
                </div>
              )}
              
              {status.verifiedAt && (
                <p className="text-sm text-gray-500">
                  Verified on: {new Date(status.verifiedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
          
          <div className="mt-6 space-y-3">
            {status?.canLogin && (
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition duration-200"
              >
                Login to Dashboard
              </button>
            )}
            
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition duration-200"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default CounselorStatusPage;