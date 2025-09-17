'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { getCookie } from 'cookies-next';
import { errorToast } from '../../../util/toastHelper';

const ApplicationsList = () => {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const token = getCookie('authToken');
        const res = await axios.get('http://localhost:8080/api/v1/admin/applications', {
          withCredentials: true,
        });
        setApps(res.data.data.content);
      } catch (err) {
        errorToast('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Doctor Applications</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specialty</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {apps.map((app) => (
              <tr key={app.id}>
                <td className="px-6 py-4 whitespace-nowrap">{app.fullName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{app.specialty}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    app.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    app.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {app.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link href={`/admin/applications/${app.id}`}>
                    <button className="text-indigo-600 hover:text-indigo-900">Review</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApplicationsList;