'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { getCookie } from 'cookies-next';
import { successToast, errorToast, warningToast } from '../../../../util/toastHelper';
import ReviewModal from '../../../components/admin/ReviewModal';

const ApplicationDetail = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState<'APPROVE' | 'REJECT' | 'REQUEST_INFO'>('APPROVE');

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const token = getCookie('authToken');
        const res = await axios.get(`http://localhost:8082/api/v1/admin/applications/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setApp(res.data.data);
      } catch (err) {
        errorToast('Failed to load application');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchApp();
  }, [id]);

  const handleReview = async (comments: string) => {
    try {
      const token = getCookie('authToken');
      const res = await axios.post(
        'http://localhost:8082/api/v1/admin/applications/review',
        {
          applicationId: id,
          status: action === 'APPROVE' ? 'APPROVED' : action === 'REJECT' ? 'REJECTED' : 'PENDING',
          comments,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      successToast(res.data.message);
      router.push('/admin/applications');
    } catch (err) {
      errorToast('Review failed');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="mb-4 text-indigo-600 hover:underline"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-6">Review Application</h1>

      <div className="bg-white p-6 rounded-lg shadow space-y-6">
        <div><strong>Name:</strong> {app.fullName}</div>
        <div><strong>Email:</strong> {app.email}</div>
        <div><strong>Specialty:</strong> {app.specialty}</div>
        <div><strong>Status:</strong> {app.status}</div>
        <div><strong>Bio:</strong> {app.bio}</div>

        <div>
          <h3 className="font-semibold mb-2">Documents</h3>
          <ul className="space-y-2">
            {app.documents?.map((doc: any) => (
              <li key={doc.id}>
                <a href={doc.fileUrl} target="_blank" className="text-blue-600 underline">
                  {doc.documentType}: {doc.fileName}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => { setAction('APPROVE'); setShowModal(true); }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Approve
          </button>
          <button
            onClick={() => { setAction('REJECT'); setShowModal(true); }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reject
          </button>
          <button
            onClick={() => { setAction('REQUEST_INFO'); setShowModal(true); }}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Request Info
          </button>
        </div>
      </div>

      {showModal && (
        <ReviewModal
          action={action}
          onClose={() => setShowModal(false)}
          onSubmit={handleReview}
        />
      )}
    </div>
  );
};

export default ApplicationDetail;