import React, { useState, useEffect } from 'react';
import { Check, X, Eye, Download, Clock, CheckCircle, XCircle, UserCheck, Search, Filter, Calendar, Mail, Phone, MapPin, Home } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from '../../config';

// Mock data
const mockRequests = [
  {
    requestId: 1,
    fullName: "John Doe",
    email: "john.doe@example.com",
    contactNumber: "+94 77 123 4567",
    address: "123 Galle Road, Colombo 03",
    houseNo: "A-45",
    proofDocumentUrl: "https://example.com/proof1.pdf",
    status: "PENDING",
    rejectionReason: null,
    submittedAt: "2024-02-10T09:30:00",
    processedAt: null
  },
  {
    requestId: 2,
    fullName: "Jane Smith",
    email: "jane.smith@example.com",
    contactNumber: "+94 71 987 6543",
    address: "456 Kandy Road, Malabe",
    houseNo: "B-12",
    proofDocumentUrl: "https://example.com/proof2.pdf",
    status: "APPROVED",
    rejectionReason: null,
    submittedAt: "2024-02-09T14:20:00",
    processedAt: "2024-02-10T10:15:00"
  },
  {
    requestId: 3,
    fullName: "Mike Johnson",
    email: "mike.j@example.com",
    contactNumber: "+94 76 555 8888",
    address: "789 Parliament Road, Colombo 07",
    houseNo: "C-78",
    proofDocumentUrl: "https://example.com/proof3.pdf",
    status: "REJECTED",
    rejectionReason: "Proof document is not clear. Please resubmit with a higher quality scan.",
    submittedAt: "2024-02-08T11:45:00",
    processedAt: "2024-02-09T09:30:00"
  },
  {
    requestId: 4,
    fullName: "Sarah Williams",
    email: "sarah.w@example.com",
    contactNumber: "+94 75 222 3333",
    address: "321 Negombo Road, Wattala",
    houseNo: "D-56",
    proofDocumentUrl: "https://example.com/proof4.pdf",
    status: "PENDING",
    rejectionReason: null,
    submittedAt: "2024-02-11T16:00:00",
    processedAt: null
  },
  {
    requestId: 5,
    fullName: "David Brown",
    email: "david.brown@example.com",
    contactNumber: "+94 72 444 5555",
    address: "654 Baseline Road, Colombo 09",
    houseNo: "E-23",
    proofDocumentUrl: "https://example.com/proof5.pdf",
    status: "APPROVED",
    rejectionReason: null,
    submittedAt: "2024-02-07T08:15:00",
    processedAt: "2024-02-08T14:45:00"
  }
];

const RegistrationRequestManagement = () => {
  const token = localStorage.getItem('token');
  const queryClient = useQueryClient();

  const [filter, setFilter] = useState('PENDING');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState('PENDING');

  const fetchRequestsByStatus = async () => {
    try {
      // If status is 'ALL', don't send status param to get all records
      const params = status === 'ALL' ? {} : { status: status };
      
      const response = await axios.get('/member/registration/requests', {
        params: params,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Fetched requests: ', response.data);
      return response?.data ?? [];
    }
    catch (error) {
      console.log('Error occured while fetching requests!', error);
      return [];
    }
  }

  // Fetch all requests for accurate counts
  const fetchAllRequests = async () => {
    try {
      const response = await axios.get('/member/registration/requests/getAll', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response?.data ?? [];
    }
    catch (error) {
      console.log('Error fetching all requests for counts:', error);
      return [];
    }
  }

  const {
    data: requests = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['requests', status],
    queryFn: fetchRequestsByStatus,
    staleTime: 5 * 60 * 1000, //fetch after 5mins
    gcTime: 30 * 60 * 1000 // Keep in memory 60mins (formerly cacheTime)
  });

  // Fetch all requests for accurate status counts
  const {
    data: allRequests = [],
  } = useQuery({
    queryKey: ['allRequests'],
    queryFn: fetchAllRequests,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000
  });

  // Use allRequests when status is 'ALL', otherwise use the filtered requests
  const dataToFilter = status === 'ALL' ? allRequests : requests;
  
  const filteredRequests = dataToFilter
    .filter(req => 
      req.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.requestId.toString().includes(searchQuery)
    );

  const handleApprove = async (requestId) => {
    setProcessing(true);

    try {
      // Make API call to approve
      await axios.post(`/member/registration/requests/${requestId}/approve`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Refetch both queries after successful approval
      await Promise.all([
        refetch(),
        queryClient.invalidateQueries(['allRequests'])
      ]);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (requestId) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setProcessing(true);

    try {
      // Make API call to reject
      await axios.post(`/member/registration/requests/${requestId}/reject`, {
        rejectionReason: rejectionReason
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Refetch both queries after successful rejection
      await Promise.all([
        refetch(),
        queryClient.invalidateQueries(['allRequests'])
      ]);
      setSelectedRequest(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-lg shadow-yellow-200',
      APPROVED: 'bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-lg shadow-green-200',
      REJECTED: 'bg-gradient-to-r from-rose-400 to-red-500 text-white shadow-lg shadow-red-200'
    };

    const icons = {
      PENDING: <Clock className="w-4 h-4" />,
      APPROVED: <CheckCircle className="w-4 h-4" />,
      REJECTED: <XCircle className="w-4 h-4" />
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold ${styles[status]}`}>
        {icons[status]}
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusCount = (statusType) => {
    if (statusType === 'ALL') return allRequests.length;
    return allRequests.filter(req => req.status === statusType).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7A5AF8] via-purple-600 to-[#5D45BC] p-8">
      <div className="max-w-7xl mx-auto pt-34">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900  to-purple-800 rounded-2xl p-8 mb-6 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center">
                <UserCheck size={40} className="text-purple-900" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Registration Requests</h1>
                <p className="text-purple-100 text-lg">Review and manage user applications with ease</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-purple-100">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 w-full lg:max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((statusOption) => {
                const statusColors = {
                  ALL: filter === statusOption ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                  PENDING: filter === statusOption ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                  APPROVED: filter === statusOption ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                  REJECTED: filter === statusOption ? 'bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                };
                
                return (
                  <button
                    key={statusOption}
                    onClick={() => { 
                      setFilter(statusOption);
                      setStatus(statusOption);
                    }}
                    className={`px-5 py-2.5 rounded-xl font-semibold transition-all transform hover:scale-105 ${statusColors[statusOption]}`}
                  >
                    {statusOption} <span className="ml-1 opacity-90">({getStatusCount(statusOption)})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Requests List */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-4 text-lg">Loading requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center">
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Filter className="w-12 h-12 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No requests found</h3>
            <p className="text-gray-500 text-lg">No {filter.toLowerCase()} requests match your search.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredRequests.map((request) => (
              <div 
                key={request.requestId} 
                className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 border border-gray-100 overflow-hidden"
              >
                <div className="p-6 md:p-8">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {request.fullName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">
                          {request.fullName}
                        </h3>
                        <p className="text-gray-500 font-medium">Request ID: #{request.requestId}</p>
                      </div>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium mb-1">Email Address</p>
                        <p className="text-gray-900 font-medium">{request.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium mb-1">Contact Number</p>
                        <p className="text-gray-900 font-medium">{request.contactNumber}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium mb-1">Address</p>
                        <p className="text-gray-900 font-medium">{request.address}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Home className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium mb-1">House Number</p>
                        <p className="text-gray-900 font-medium">{request.houseNo}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium mb-1">Submitted At</p>
                        <p className="text-gray-900 font-medium">{formatDate(request.submittedAt)}</p>
                      </div>
                    </div>
                    
                    {request.processedAt && (
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-5 h-5 text-pink-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium mb-1">Processed At</p>
                          <p className="text-gray-900 font-medium">{formatDate(request.processedAt)}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Rejection Reason */}
                  {request.rejectionReason && (
                    <div className="mb-6 p-5 bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 rounded-xl">
                      <p className="text-sm text-red-600 font-bold mb-2">REJECTION REASON</p>
                      <p className="text-red-900 font-medium">{request.rejectionReason}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    {request.proofDocumentUrl && (
                      <button
                        onClick={() => window.open(request.proofDocumentUrl, '_blank')}
                        className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        <Download className="w-5 h-5" />
                        View Document
                      </button>
                    )}
                    
                    {request.status === 'PENDING' && (
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <Eye className="w-5 h-5" />
                        Review Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform animate-slideUp">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 rounded-t-3xl">
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                Review Registration Request
              </h2>
            </div>

            <div className="p-8">
              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    {selectedRequest.fullName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-purple-600 font-semibold mb-1">Full Name</p>
                    <p className="text-xl font-bold text-gray-900">{selectedRequest.fullName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <p className="text-sm text-blue-600 font-semibold mb-1">Email</p>
                    <p className="text-lg font-bold text-gray-900 break-all">{selectedRequest.email}</p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-xl">
                    <p className="text-sm text-green-600 font-semibold mb-1">Contact Number</p>
                    <p className="text-lg font-bold text-gray-900">{selectedRequest.contactNumber}</p>
                  </div>
                  
                  <div className="p-4 bg-orange-50 rounded-xl md:col-span-2">
                    <p className="text-sm text-orange-600 font-semibold mb-1">Address</p>
                    <p className="text-lg font-bold text-gray-900">{selectedRequest.address}</p>
                  </div>
                  
                  <div className="p-4 bg-pink-50 rounded-xl">
                    <p className="text-sm text-pink-600 font-semibold mb-1">House Number</p>
                    <p className="text-lg font-bold text-gray-900">{selectedRequest.houseNo}</p>
                  </div>
                </div>
                
                {selectedRequest.proofDocumentUrl && (
                  <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
                    <p className="text-sm text-indigo-600 font-semibold mb-3">Proof Document</p>
                    <button
                      onClick={() => window.open(selectedRequest.proofDocumentUrl, '_blank')}
                      className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-bold shadow-lg transform hover:scale-105 transition-all"
                    >
                      <Download className="w-5 h-5" />
                      Open Document
                    </button>
                  </div>
                )}
              </div>

              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Rejection Reason (Required if rejecting)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide a clear reason for rejection..."
                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none font-medium"
                  rows={4}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleApprove(selectedRequest.requestId)}
                  disabled={processing}
                  className="flex-1 min-w-[150px] inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-lg shadow-xl transform hover:scale-105"
                >
                  <Check className="w-6 h-6" />
                  {processing ? 'Processing...' : 'Approve'}
                </button>
                
                <button
                  onClick={() => handleReject(selectedRequest.requestId)}
                  disabled={processing}
                  className="flex-1 min-w-[150px] inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-xl hover:from-rose-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-lg shadow-xl transform hover:scale-105"
                >
                  <X className="w-6 h-6" />
                  {processing ? 'Processing...' : 'Reject'}
                </button>
                
                <button
                  onClick={() => {
                    setSelectedRequest(null);
                    setRejectionReason('');
                  }}
                  disabled={processing}
                  className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 disabled:opacity-50 transition-all font-bold text-lg transform hover:scale-105"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RegistrationRequestManagement;