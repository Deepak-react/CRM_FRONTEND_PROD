import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ENDPOINTS } from '../../api/constraints'; 


function HistoryDashboard({ userId }) {
    //console.log("HistoryDashboard: Received userId prop:", userId);

    // State for the dynamic Activity History table
    const [activityData, setActivityData] = useState([]);
    // State for the remainder history table (static, as per your code)
    // REMOVED: As per the comment in your original code, this table was commented out.
    // Keeping it out for the sharpened UI, assuming it's not currently in use.
    // If you need it, we can add it back with the new styles.

    // State for the numerical summaries (Total Act. Logged, etc.)
    const [summaryMetrics, setSummaryMetrics] = useState({
        totalLogsByUser: 0,
        totalActivityByUser: 0,
        totalReminder: 0,
        totalCalendarEvent: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchActivityHistory = async () => {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem("token");
            if (!userId || !token) {
                console.error("HistoryDashboard: fetchActivityHistory: Authentication error: userId prop or token missing.");
                setError("Authentication required. Please log in.");
                setLoading(false);
                return;
            }

            // console.log(`HistoryDashboard: Initiating API call to ${ENDPOINTS.ACTIVITY_HISTORY}/${userId}`);

            try {
                const response = await axios.get(`${ENDPOINTS.ACTIVITY_HISTORY}/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                // console.log("HistoryDashboard: Raw API Response for Activity History:", response.data);

                setSummaryMetrics({
                    totalLogsByUser: response.data.totalLogsByUser || 0,
                    totalActivityByUser: response.data.totalActivityByUser || 0,
                    totalReminder: response.data.totalReminder || 0,
                    totalCalendarEvent: response.data.totalCalendarEvent || 0,
                });

                if (Array.isArray(response.data?.fetchAllRemainderByUser)) {
                    const mappedActivityData = response.data.fetchAllRemainderByUser.map(remainder => ({
                        id: remainder.iremainder_id,
                        activitytype: remainder.cremainder_title || 'Remainder',
                        lead_name: remainder.lead ?.clead_name || '-',
                        priority: remainder.priority || '-' , // Use cFull_name if available
                        activitytimestamp: remainder.dremainder_dt,
                    }));
                    setActivityData(mappedActivityData);
                    // console.log("HistoryDashboard: Mapped Remainder data to Activity History table:", mappedActivityData);
                } else {
                    console.warn("HistoryDashboard: 'fetchAllRemainderByUser' array not found or not an array in API response for Activity History. Setting activityData to empty.");
                    setActivityData([]);
                }

            } catch (err) {
                console.error("HistoryDashboard: Failed to fetch activity history:", err.response?.data || err.message || err);
                setError(`Failed to load history data: ${err.response?.data?.message || err.message || 'Unknown error'}`);
                setActivityData([]);
                setSummaryMetrics({
                    totalLogsByUser: 0,
                    totalActivityByUser: 0,
                    totalReminder: 0,
                    totalCalendarEvent: 0,
                });
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchActivityHistory();
        } else {
            console.warn("HistoryDashboard: userId prop is undefined or null, skipping activity history fetch.");
            setLoading(false);
            setError("User ID not provided. Cannot fetch history.");
        }
    }, [userId]); // Dependency array: Re-run when userId prop changes

    // Helper for formatting date and time
    const formatDateTime = (isoString) => {
        if (!isoString) return '-';
        try {
            return new Date(isoString).toLocaleString('en-IN', {
                month: 'numeric',

                year: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });
        } catch (e) {
            console.error("Error formatting date:", isoString, e);
            return 'Invalid Date';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 p-6">
                <div className="text-xl font-semibold text-gray-700">Loading History Dashboard...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 p-6">
                <div className="p-8 max-w-lg w-full bg-red-50 rounded-xl shadow-lg border border-red-200 text-red-700 text-center">
                    <h2 className="text-2xl font-bold mb-4 text-red-800">Error Loading Data</h2>
                    <p className="text-lg">{error}</p>
                    <p className="mt-4 text-sm text-red-600">Please try refreshing the page or contact support if the issue persists.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans p-4 md:p-6">
            <div className="dashboard-container mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-200">
                <h2 className="text-3xl md:text-4xl font-extrabold mb-8 text-blue-00 border-b-4 border-blue-400 pb-3 text-center tracking-tight animate-fade-in-down">
                    Activity & Reminder History
                </h2>

                {/* Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-md border border-blue-200 flex flex-col justify-between transform transition-transform duration-300 hover:scale-102">
                        <div className="text-base text-blue-800 font-semibold mb-2">Total Logs</div>
                        <div className="text-2xl font-bold text-blue-900 mb-2">{summaryMetrics.totalLogsByUser.toLocaleString()}</div>
                        <div className="flex items-center text-sm text-green-600 font-medium">
                            <span className="mr-1 text-lg">&#x25B2;</span>+Overview
                        </div>
                    </div>
                    <div className="bg-gradient-to
                    -br from-green-50 to-green-100 p-6 rounded-xl shadow-md border border-green-200 flex flex-col justify-between transform transition-transform duration-300 hover:scale-102">
                        <div className="text-base text-green-800 font-semibold mb-2">Total Activities</div>
                        <div className="text-2xl font-bold text-green-900 mb-2">{summaryMetrics.totalActivityByUser.toLocaleString()}</div>
                        <div className="flex items-center text-sm text-green-600 font-medium">
                            <span className="mr-1 text-lg">&#x25B2;</span>+Overview
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl shadow-md border border-yellow-200 flex flex-col justify-between transform transition-transform duration-300 hover:scale-102">
                        <div className="text-base text-yellow-800 font-semibold mb-2">Total Reminders</div>
                        <div className="text-2xl font-bold text-yellow-900 mb-2">{summaryMetrics.totalReminder.toLocaleString()}</div>
                        <div className="flex items-center text-sm text-green-600 font-medium">
                            <span className="mr-1 text-lg">&#x25B2;</span>+Overview
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-md border border-purple-200 flex flex-col justify-between transform transition-transform duration-300 hover:scale-102">
                        <div className="text-base text-purple-800 font-semibold mb-2">Total Calendar Events</div>
                        <div className="text-2xl font-bold text-purple-900 mb-2">{summaryMetrics.totalCalendarEvent.toLocaleString()}</div>
                        <div className="flex items-center text-sm text-green-600 font-medium">
                            <span className="mr-1 text-lg">&#x25B2;</span>+Overview
                        </div>
                    </div>
                </div>

                {/* Dynamic Activity History Table */}
                <div className="historical-section-header flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Recent Activity Reminders</h2>
                    {/* Removed "View All" link as per your original code's comment */}
                </div>

                <div className="overflow-x-auto shadow-lg overflow-y-scroll h-[40vh]  rounded-xl border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200 bg-white overflow-y-scroll">
                        <thead className="bg-gray-50 font-semibold text-lg">
                            <tr>
                                
                                <th scope="col" className="px-6 py-3 text-center break-words font-semibold text-lg text-gray-800 uppercase tracking-wider">S.No</th>
                                  <th scope="col" className="px-6 py-3 text-center break-words font-semibold text-lg text-gray-800 uppercase tracking-wider">Lead Name</th>
                                <th scope="col" className="px-6 py-3 text-center break-words  font-semibold text-lg text-gray-800 uppercase tracking-wider">Reminder Title</th>
                              
                                <th scope="col" className="px-6 py-3 text-center break-words  font-semibold text-lg text-gray-800 uppercase tracking-wider">Priority</th>
                                <th scope="col" className="px-6 py-3 text-center break-words  font-semibold text-lg text-gray-800 uppercase tracking-wider">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {activityData.length > 0 ? activityData.map((item, index) => (
                                <tr key={item.id || `activity-${index}`} className="hover:bg-blue-50 transition-colors duration-150 ease-in-out">
                                    <td className="px-6 py-4 whitespace-nowrap text-center break-words  text-sm font-medium text-gray-900">{index + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center break-words text-sm text-gray-700">{item.lead_name}</td>

                                    <td className="px-6 py-4 whitespace-nowrap text-center break-words  text-sm text-gray-700 capitalize">{item.activitytype?.replace(/_/g, ' ')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center break-words text-sm text-gray-700">{item.priority || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center break-words  text-sm text-gray-700">{formatDateTime(item.activitytimestamp)}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-lg text-gray-500">No recent activity found.</td>
                                </tr>
                            )}
                        </tbody>

                    </table>
                </div>
            </div>                                
        </div>
    );
}


export default HistoryDashboard;