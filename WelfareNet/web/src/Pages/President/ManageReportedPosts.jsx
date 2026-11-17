import { useState } from 'react';
import { Flag, Eye, Trash2, CheckCircle, AlertTriangle, User, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from '../../config';
import { useQuery } from '@tanstack/react-query';

export default function ManageReportedPosts() {
    const navigate = useNavigate();

    const token = localStorage.getItem('token');

    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedReport, setSelectedReport] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDismissModal, setShowDismissModal] = useState(false);
    const [actionReason, setActionReason] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);  

    // Local overrides for status changes (dismiss/remove) since the backend
    // mutation hasn't been wired up yet — keyed by reportId.
    const [localOverrides, setLocalOverrides] = useState({});

    const fetchReportedPosts = async () => {
        try {
            const response = await axios.get('/newsfeed/reportedPosts', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('Fetched Posts: ', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching reported posts:', error);
            return [];
        }
    };

    const {
        data: reportedPosts = [],  // FIX: was named 'post', now correctly named 'reportedPosts'
        isLoading,
        isError,
        refetch
    } = useQuery({
        queryKey: ['reportedPosts'],
        queryFn: fetchReportedPosts,
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 60 * 60 * 1000 // 60 minutes
    });

    // Merge API data with any local status overrides
    const mergedPosts = reportedPosts.map(report => ({
        ...report,
        ...(localOverrides[report.reportId] || {})
    }));

    const handleBack = () => {
        navigate('/president/feed');
    };

    const handleViewPost = (postID) => {
        // FIX: was post.postId, now correctly uses post.post.postID
        alert(`View full post: /admin/newsfeed/post/${postID}`);
    };

    const handleRemovePost = (report) => {
        // FIX: was using post.id, now uses report.reportId
        setSelectedReport(report);
        setShowDeleteModal(true);
    };

    const confirmRemovePost = async () => {
        if (!actionReason.trim()) {
            alert('Please provide a reason for removing the post');
            return;
        }


        try{
            const response = await axios.post('/newsfeed/report/remove',{
                reason: actionReason
            },{
                params:{
                    reportId: selectedReport.reportId,
                    postId: selectedReport.post?.postID, 
                    memberID: selectedReport.post.author?.memberID
                },
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if(response.status === 200){
                setShowDeleteModal(false);
                setActionReason('');
                setSelectedReport(null);
                refetch(); // Refresh the list to reflect the removed post
                alert('Post removed successfully. User will be notified.')
            }
        }
        catch(error){
            console.error('Error dismissing reports:', error);
            alert('Failed to dismiss reports. Please try again.');
        }

        ;
    };

    const handleDismissReports = (report) => {
        // FIX: was using post.id, now uses report.reportId
        setSelectedReport(report);
        setShowDismissModal(true);
    };

    const confirmDismissReports = async () => {
        if (!actionReason.trim()) {
            alert('Please provide a reason for dismissing the reports');
            return;
        }

        try{
            const response = await axios.post('/newsfeed/report/dismiss',{
                reason: actionReason
            },{
                params:{
                    reportId: selectedReport.reportId,
                    memberID: selectedReport.reporter?.memberID
                },
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if(response.status === 200){
                setShowDismissModal(false);
                setActionReason('');
                setSelectedReport(null);
                refetch();
                alert('Reports dismissed. Post remains visible.');
            }
        }
        catch(error){
            console.error('Error dismissing reports:', error);
            alert('Failed to dismiss reports. Please try again.');
        }
    };

    const cancelAction = () => {
        setShowDeleteModal(false);
        setShowDismissModal(false);
        setActionReason('');
        setSelectedReport(null);
    };

    // FIX: filter now uses post.reportStatus (uppercase) instead of post.status
    const filteredPosts = mergedPosts.filter(report =>
        filterStatus === 'all' ||
        (report.reportStatus || '').toUpperCase() === filterStatus.toUpperCase()
    );

    // FIX: counts now use reportStatus instead of status
    const pendingCount = mergedPosts.filter(r =>
        (r.reportStatus || '').toUpperCase() === 'PENDING'
    ).length;
    const reviewedCount = mergedPosts.filter(r =>
        (r.reportStatus || '').toUpperCase() === 'REVIEWED'
    ).length;

    const getReasonColor = (reason) => {
        const colors = {
            'Spam': 'bg-orange-100 text-orange-700 border-orange-200',
            'Inappropriate Content': 'bg-red-100 text-red-700 border-red-200',
            'Hate Speech': 'bg-purple-100 text-purple-700 border-purple-200',
            'Harassment': 'bg-pink-100 text-pink-700 border-pink-200',
            'False Information': 'bg-yellow-100 text-yellow-700 border-yellow-200'
        };
        return colors[reason] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    // Helper: build a display timestamp from datePosted + timePosted
    // FIX: API has separate datePosted and timePosted fields, not a single 'timestamp'
    const formatTimestamp = (datePosted, timePosted) => {
        if (!datePosted) return '';
        const time = timePosted ? timePosted.substring(0, 5) : '';  // "HH:mm"
        return `${datePosted}${time ? ' at ' + time : ''}`;
    };

    return (
        <div className='min-h-screen bg-gradient-to-br from-[#7A5AF8] via-purple-600 to-[#5D45BC] p-4 md:p-8'>
            <div className="max-w-6xl mx-auto pt-28">
                <main className="transition-all duration-300 pt-4">
                    <div className="max-w-5xl mx-auto p-4">

                        {/* Header Section */}
                        <div className="bg-gradient-to-r from-purple-900 to-purple-800 rounded-3xl shadow-2xl p-8 md:p-10 mb-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24 blur-2xl"></div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="bg-white bg-opacity-20 p-3 rounded-2xl backdrop-blur-sm">
                                        <Flag className="w-8 h-8 text-red-500" />
                                    </div>
                                    <div>
                                        <h1 className="text-4xl font-bold tracking-tight">Reported Posts</h1>
                                    </div>
                                </div>
                                <p className="text-purple-100 text-lg">Review and manage community-reported content</p>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-sm mb-1">Total Reported</p>
                                        {/* FIX: was reportedPosts.length on the old empty state array */}
                                        <p className="text-3xl font-bold text-gray-900">{mergedPosts.length}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                                        <Flag className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-sm mb-1">Pending Review</p>
                                        <p className="text-3xl font-bold text-orange-600">{pendingCount}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                                        <AlertTriangle className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-sm mb-1">Reviewed</p>
                                        <p className="text-3xl font-bold text-green-600">{reviewedCount}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filter Buttons */}
                        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border border-gray-100">
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => setFilterStatus('all')}
                                    className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                                        filterStatus === 'all'
                                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    All ({mergedPosts.length})
                                </button>
                                {/* FIX: filter values now match uppercase API status values */}
                                <button
                                    onClick={() => setFilterStatus('PENDING')}
                                    className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                                        filterStatus === 'PENDING'
                                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Pending ({pendingCount})
                                </button>
                                <button
                                    onClick={() => setFilterStatus('REVIEWED')}
                                    className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                                        filterStatus === 'REVIEWED'
                                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Reviewed ({reviewedCount})
                                </button>
                            </div>
                        </div>

                        {/* Loading / Error States */}
                        {isLoading && (
                            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                                <p className="text-gray-500 text-lg">Loading reported posts...</p>
                            </div>
                        )}

                        {isError && (
                            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                                <AlertTriangle className="w-16 h-16 text-red-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">Failed to load reports</h3>
                                <button
                                    onClick={() => refetch()}
                                    className="mt-4 px-6 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all font-medium"
                                >
                                    Retry
                                </button>
                            </div>
                        )}

                        {/* Reported Posts List */}
                        {!isLoading && !isError && (
                            <div className="space-y-6">
                                {filteredPosts.map((report) => {
                                    // FIX: destructure from correct nested API fields
                                    const post = report.post;                          // nested post object
                                    const author = post?.author;                       // nested author object
                                    const reportStatus = (report.reportStatus || '').toUpperCase();
                                    const isReviewed = reportStatus === 'REVIEWED';
                                    const override = localOverrides[report.reportId] || {};

                                    return (
                                        <div
                                            key={report.reportId}  // FIX: was post.id, now report.reportId
                                            className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
                                        >
                                            {/* Colorful Top Border */}
                                            <div className={`h-2 ${
                                                !isReviewed
                                                    ? 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-500'
                                                    : override.action === 'removed'
                                                    ? 'bg-gradient-to-r from-red-500 via-red-600 to-red-700'
                                                    : 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500'
                                            }`}></div>

                                            <div className="p-6 md:p-8">
                                                {/* Status Badge */}
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                                                            <Flag className="w-6 h-6 text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-500">Report ID</p>
                                                            {/* FIX: was post.id, now report.reportId */}
                                                            <p className="font-bold text-gray-900">#{report.reportId}</p>
                                                        </div>
                                                    </div>
                                                    {isReviewed && (
                                                        <span className={`px-4 py-2 rounded-full text-sm font-semibold border flex items-center gap-2 ${
                                                            override.action === 'removed'
                                                                ? 'bg-red-100 text-red-700 border-red-200'
                                                                : 'bg-green-100 text-green-700 border-green-200'
                                                        }`}>
                                                            {override.action === 'removed'
                                                                ? <Trash2 className="w-4 h-4" />
                                                                : <CheckCircle className="w-4 h-4" />
                                                            }
                                                            {override.action === 'removed' ? 'POST REMOVED' : 'REPORTS DISMISSED'}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Post Content */}
                                                <div className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-200">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        {/* FIX: API has no avatar field; use a placeholder initial avatar */}
                                                        <div className="w-12 h-12 rounded-full border-2 border-purple-200 bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-bold text-lg">
                                                            {author?.fullName?.charAt(0)?.toUpperCase() || '?'}
                                                        </div>
                                                        <div>
                                                            {/* FIX: was post.author (string), now post.post.author.fullName */}
                                                            <h3 className="text-gray-900 font-semibold">{author?.fullName || 'Unknown'}</h3>
                                                            {/* FIX: was post.timestamp, now formatted from datePosted + timePosted */}
                                                            <p className="text-gray-500 text-sm">
                                                                {formatTimestamp(post?.datePosted, post?.timePosted)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* FIX: was post.content, now post.post.content */}
                                                    <p className="text-gray-800 leading-relaxed mb-4">{post?.content}</p>

                                                    {/* FIX: was post.media, now iterates post.post.images array */}
                                                    {post?.images && post.images.length > 0 && (
                                                        <div className="space-y-2">
                                                            {post.images.map(img => (
                                                                <div key={img} 
                                                                    className="rounded-xl overflow-hidden border border-gray-200"
                                                                    onClick={() => setSelectedImage(img)}
                                                                >
                                                                    <img
                                                                        src={img}
                                                                        alt="Post media"
                                                                        className="w-full h-48 object-cover"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                                                        {/* FIX: was post.likes (array), now post.post.likeCount (number) */}
                                                        <span>{post?.likeCount ?? 0} likes</span>
                                                        <span>•</span>
                                                        {/* FIX: was post.comments (array), now post.post.commentCount (number) */}
                                                        <span>{post?.commentCount ?? 0} comments</span>
                                                    </div>
                                                </div>

                                                {/* Reports Section */}
                                                {/* FIX: API returns a flat report (not post.reports[]), so display as a single report */}
                                                <div className="mb-6">
                                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                                                        Report Details
                                                    </h3>

                                                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <User className="w-4 h-4 text-gray-600" />
                                                                    {/* FIX: was report.reportedBy, now report.reporter.fullName */}
                                                                    <p className="font-semibold text-gray-900">
                                                                        {report.reporter?.fullName || 'Unknown'}
                                                                    </p>
                                                                </div>
                                                                {/* FIX: was report.reportedByEmail, now report.reporter.email */}
                                                                <p className="text-sm text-gray-600">{report.reporter?.email}</p>
                                                            </div>
                                                            {/* FIX: was report.reason (kept same field name, still correct) */}
                                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getReasonColor(report.reason)}`}>
                                                                {report.reason}
                                                            </span>
                                                        </div>
                                                        {/* FIX: API has no 'details' field; omit or show a dash */}
                                                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {/* FIX: was report.reportDate, now report.reportDate (same name, correct) */}
                                                            Reported on {report.reportDate}
                                                            {report.reportTime
                                                                ? ` at ${report.reportTime.substring(0, 5)}`
                                                                : ''}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Review Info */}
                                                {isReviewed && override.reviewedDate && (
                                                    <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
                                                        <p className="text-sm text-blue-900 mb-1">
                                                            <span className="font-semibold">Reviewed on:</span> {override.reviewedDate}
                                                        </p>
                                                        {override.actionReason && (
                                                            <p className="text-sm text-blue-900">
                                                                <span className="font-semibold">Reason:</span> {override.actionReason}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Action Buttons */}
                                                {/* FIX: was post.status === 'pending', now checks reportStatus */}
                                                {!isReviewed && (
                                                    <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200">
                                                        <button
                                                            onClick={() => handleDismissReports(report)}
                                                            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold shadow-md hover:shadow-lg hover:from-green-600 hover:to-emerald-600 transform hover:scale-105 transition-all"
                                                        >
                                                            <CheckCircle className="w-5 h-5" />
                                                            Dismiss Reports
                                                        </button>
                                                        <button
                                                            onClick={() => handleRemovePost(report)}
                                                            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold shadow-md hover:shadow-lg hover:from-red-600 hover:to-pink-600 transform hover:scale-105 transition-all"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                            Remove Post
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {filteredPosts.length === 0 && (
                                    <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                                        <Flag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Reports Found</h3>
                                        <p className="text-gray-500">No posts match the selected filter.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>

                {/* Remove Post Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <Trash2 className="w-6 h-6 text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Remove Post</h3>
                            </div>
                            <p className="text-gray-600 mb-4">
                                This will permanently remove the post from the community feed. Please provide a reason:
                            </p>
                            <textarea
                                value={actionReason}
                                onChange={(e) => setActionReason(e.target.value)}
                                rows="4"
                                placeholder="Reason for removing post..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none mb-6"
                            />
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={cancelAction}
                                    className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-all font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmRemovePost}
                                    className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-medium"
                                >
                                    Remove Post
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Dismiss Reports Modal */}
                {showDismissModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Dismiss Reports</h3>
                            </div>
                            <p className="text-gray-600 mb-4">
                                The post will remain visible. Please provide a reason for dismissing the reports:
                            </p>
                            <textarea
                                value={actionReason}
                                onChange={(e) => setActionReason(e.target.value)}
                                rows="4"
                                placeholder="Reason for dismissing reports..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none mb-6"
                            />
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={cancelAction}
                                    className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-all font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDismissReports}
                                    className="px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-medium"
                                >
                                    Dismiss Reports
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {selectedImage && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
                        onClick={() => setSelectedImage(null)}
                    >
                        <button
                            className="absolute top-5 right-5 text-white text-2xl"
                            onClick={() => setSelectedImage(null)}
                        >
                                ✕
                        </button>
                        <img
                        src={selectedImage}
                        alt="full"
                        className="max-h-[90%] max-w-[90%] rounded-lg shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                )}

            </div>
        </div>
    );
}