'use client';
import React, { useEffect, useState } from 'react';
import StatCard from '../../components/admin/StatCard';
import axios from 'axios';
import { errorToast } from '../../../util/toastHelper';
import { getCookie } from 'cookies-next';

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = getCookie('authToken');
        const res = await axios.get('http://localhost:8080/api/v1/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data.data);
      } catch (err) {
        errorToast('Failed to load dashboard');
      }
    };
    fetchStats();
  }, []);

  if (!stats) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Applications" value={stats.totalApplications} icon="📄" color="blue" />
        <StatCard title="Pending" value={stats.pendingApplications} icon="⏳" color="yellow" />
        <StatCard title="Approved" value={stats.approvedApplications} icon="✅" color="green" />
        <StatCard title="Rejected" value={stats.rejectedApplications} icon="❌" color="red" />
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        <p className="text-gray-600 mt-2">You have {stats.recentApplications} new applications in the last 7 days.</p>
      </div>
    </div>
  );
};

export default Dashboard;