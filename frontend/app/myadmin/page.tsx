"use client"
import React, { useState, useEffect } from 'react';
import { FiUsers, FiUserCheck, FiUserX, FiClock, FiEye, FiSearch, FiFilter, FiDownload } from 'react-icons/fi';
import { HiOutlineDocumentText, HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi';
import { BiRefresh } from 'react-icons/bi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Mock data matching the backend structure
const mockDashboardData = {
  totalApplications: 156,
  pendingApplications: 23,
  approvedApplications: 98,
  rejectedApplications: 35,
  totalUsers: 1240,
  totalCounselors: 98,
  activeUsers: 834,
  recentApplications: 12
};

const mockApplications = [
  {
    id: 1,
    email: "dr.sarah.johnson@email.com",
    fullName: "Dr. Sarah Johnson",
    phoneNumber: "+1234567890",
    medicalLicenseNumber: "MD123456",
    specialty: "Clinical Psychology",
    yearsOfExperience: "8",
    currentWorkplace: "City Mental Health Center",
    medicalSchool: "Harvard Medical School",
    graduationYear: 2015,
    bio: "Experienced clinical psychologist specializing in anxiety and depression treatment.",
    status: "PENDING",
    adminComments: null,
    reviewedBy: null,
    reviewedAt: null,
    createdAt: "2024-01-15T10:30:00",
    updatedAt: "2024-01-15T10:30:00",
    hasRequiredDocuments: true
  },
  {
    id: 2,
    email: "dr.michael.chen@email.com",
    fullName: "Dr. Michael Chen",
    phoneNumber: "+1234567891",
    medicalLicenseNumber: "MD789012",
    specialty: "Psychiatry",
    yearsOfExperience: "12",
    currentWorkplace: "Metropolitan Hospital",
    medicalSchool: "Stanford University School of Medicine",
    graduationYear: 2011,
    bio: "Board-certified psychiatrist with expertise in mood disorders and psychopharmacology.",
    status: "APPROVED",
    adminComments: "Excellent credentials and experience. Approved for platform access.",
    reviewedBy: "admin@mindigo.com",
    reviewedAt: "2024-01-14T15:45:00",
    createdAt: "2024-01-10T09:15:00",
    updatedAt: "2024-01-14T15:45:00",
    hasRequiredDocuments: true
  },
  {
    id: 3,
    email: "dr.emily.davis@email.com",
    fullName: "Dr. Emily Davis",
    phoneNumber: "+1234567892",
    medicalLicenseNumber: "MD345678",
    specialty: "Counseling Psychology",
    yearsOfExperience: "5",
    currentWorkplace: "Private Practice",
    medicalSchool: "UCLA School of Medicine",
    graduationYear: 2018,
    bio: "Specializing in trauma therapy and EMDR treatment for adults and adolescents.",
    status: "ADDITIONAL_INFO_REQUIRED",
    adminComments: "Please provide updated medical license certificate. Current document is expired.",
    reviewedBy: "admin@mindigo.com",
    reviewedAt: "2024-01-13T11:20:00",
    createdAt: "2024-01-12T14:22:00",
    updatedAt: "2024-01-13T11:20:00",
    hasRequiredDocuments: false
  }
];

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(mockDashboardData);
  const [applications, setApplications] = useState(mockApplications);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    status: '',
    comments: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);

  const itemsPerPage = 10;

  // Filter applications based on search and status
  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentApplications = filteredApplications.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'ADDITIONAL_INFO_REQUIRED':
        return 'bg-orange-100 text-orange-800';
      case 'UNDER_REVIEW':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED':
        return <HiOutlineCheckCircle className="w-4 h-4" />;
      case 'REJECTED':
        return <HiOutlineXCircle className="w-4 h-4" />;
      default:
        return <FiClock className="w-4 h-4" />;
    }
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  const handleReviewApplication = (application) => {
    setSelectedApplication(application);
    setReviewData({ status: '', comments: '' });
    setReviewModal(true);
  };

  const submitReview = async () => {
    if (!reviewData.status) {
      toast.error('Please select a status');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update application status
      const updatedApplications = applications.map(app => 
        app.id === selectedApplication.id 
          ? { 
              ...app, 
              status: reviewData.status,
              adminComments: reviewData.comments,
              reviewedBy: 'admin@mindigo.com',
              reviewedAt: new Date().toISOString()
            }
          : app
      );
      
      setApplications(updatedApplications);
      setReviewModal(false);
      toast.success('Application reviewed successfully');
      
      // Update dashboard stats
      const newStats = { ...dashboardData };
      if (reviewData.status === 'APPROVED') {
        newStats.approvedApplications += 1;
        newStats.pendingApplications -= 1;
      } else if (reviewData.status === 'REJECTED') {
        newStats.rejectedApplications += 1;
        newStats.pendingApplications -= 1;
      }
      setDashboardData(newStats);
      
    } catch (error) {
      toast.error('Failed to review application');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, bgColor }) => (
    <div className={`${bgColor} rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value.toLocaleString()}</p>
        </div>
        <Icon className={`w-8 h-8 ${color}`} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-blue-700 to-cyan-400">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
              <p className="text-blue-100">Manage counselor applications and monitor platform statistics</p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all duration-200"
            >
              <BiRefresh className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Applications" 
            value={dashboardData.totalApplications} 
            icon={HiOutlineDocumentText}
            color="text-blue-600"
            bgColor="bg-white bg-opacity-90"
          />
          <StatCard 
            title="Pending Review" 
            value={dashboardData.pendingApplications} 
            icon={FiClock}
            color="text-yellow-600"
            bgColor="bg-white bg-opacity-90"
          />
          <StatCard 
            title="Approved" 
            value={dashboardData.approvedApplications} 
            icon={FiUserCheck}
            color="text-green-600"
            bgColor="bg-white bg-opacity-90"
          />
          <StatCard 
            title="Total Users" 
            value={dashboardData.totalUsers} 
            icon={FiUsers}
            color="text-purple-600"
            bgColor="bg-white bg-opacity-90"
          />
        </div>

        {/* Applications Table */}
        <div className="bg-white bg-opacity-90 rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <h2 className="text-2xl font-bold text-gray-800">Counselor Applications</h2>
              
              <div className="flex space-x-4">
                {/* Search */}
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search applications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="ADDITIONAL_INFO_REQUIRED">Info Required</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{application.fullName}</div>
                        <div className="text-sm text-gray-500">{application.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{application.specialty}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{application.yearsOfExperience} years</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                        <span>{application.status.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(application.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleViewApplication(application)}
                        className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      {application.status === 'PENDING' && (
                        <button
                          onClick={() => handleReviewApplication(application)}
                          className="text-green-600 hover:text-green-900 transition-colors duration-200"
                        >
                          <HiOutlineCheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredApplications.length)} of {filteredApplications.length} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 border rounded text-sm ${
                      currentPage === page
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Application Modal */}
      {showModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">Application Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedApplication.fullName}</p>
                    <p><span className="font-medium">Email:</span> {selectedApplication.email}</p>
                    <p><span className="font-medium">Phone:</span> {selectedApplication.phoneNumber}</p>
                    <p><span className="font-medium">Medical License:</span> {selectedApplication.medicalLicenseNumber}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Professional Information</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Specialty:</span> {selectedApplication.specialty}</p>
                    <p><span className="font-medium">Experience:</span> {selectedApplication.yearsOfExperience} years</p>
                    <p><span className="font-medium">Current Workplace:</span> {selectedApplication.currentWorkplace}</p>
                    <p><span className="font-medium">Medical School:</span> {selectedApplication.medicalSchool}</p>
                    <p><span className="font-medium">Graduation Year:</span> {selectedApplication.graduationYear}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Biography</h4>
                <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{selectedApplication.bio}</p>
              </div>
              
              {selectedApplication.adminComments && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Admin Comments</h4>
                  <p className="text-gray-600 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    {selectedApplication.adminComments}
                  </p>
                  <div className="text-sm text-gray-500 mt-2">
                    Reviewed by: {selectedApplication.reviewedBy} on {new Date(selectedApplication.reviewedAt).toLocaleString()}
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedApplication.status)}`}>
                    {getStatusIcon(selectedApplication.status)}
                    <span>{selectedApplication.status.replace('_', ' ')}</span>
                  </span>
                  <span className="text-sm text-gray-500">
                    Applied: {new Date(selectedApplication.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                {selectedApplication.status === 'PENDING' && (
                  <button
                    onClick={() => {
                      setShowModal(false);
                      handleReviewApplication(selectedApplication);
                    }}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Review Application
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">Review Application</h3>
                <button
                  onClick={() => setReviewModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-600 mb-2">Reviewing application for: <span className="font-medium">{selectedApplication.fullName}</span></p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Decision *</label>
                  <select
                    value={reviewData.status}
                    onChange={(e) => setReviewData({...reviewData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select decision...</option>
                    <option value="APPROVED">Approve Application</option>
                    <option value="REJECTED">Reject Application</option>
                    <option value="ADDITIONAL_INFO_REQUIRED">Request Additional Information</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
                  <textarea
                    value={reviewData.comments}
                    onChange={(e) => setReviewData({...reviewData, comments: e.target.value})}
                    rows={4}
                    placeholder="Add your comments (optional for approval, required for rejection or additional info requests)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setReviewModal(false)}
                  disabled={loading}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReview}
                  disabled={loading || !reviewData.status}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Submit Review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" />
    </div>
  );
};

export default AdminDashboard;