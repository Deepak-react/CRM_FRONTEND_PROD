// src/userPage/acheivementPage.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ENDPOINTS } from '../../api/constraints';
import { UserContext } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';

// Reusable ToggleSwitch component
const ToggleSwitch = ({ label, isChecked, onToggle }) => (
    <div className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
        <span className="text-gray-700 font-medium">{label}</span>
        <div
            onClick={onToggle}
            className={`relative w-12 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ease-in-out ${
                isChecked ? 'bg-blue-600' : 'bg-gray-300'
            }`}
        >
            <div
                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                    isChecked ? 'translate-x-5' : 'translate-x-0'
                }`}
            ></div>
        </div>
    </div>
);

function AcheivementDashboard({ userId }) {
    const { users } = useContext(UserContext);
    const currentUser = users ? users.find(user => user.iUser_id === userId) : null;
    const currentUserName = currentUser ? currentUser.cFull_name : 'Loading...';
    const navigate = useNavigate();

    const [achievements, setAchievements] = useState({
        totalLeadClosed: 0,
        dealCovertioRatio: 0,
        totalRevenueAmount: 0,
        totalLeads: 0,
        highestValueLead: { iproject_value: 0, dcreated_dt: null, convertToDealTime: null },
        highestAchievedMonth: { month: '', count: 0 },
        historicalRevenueData: [],
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    // State variable to explicitly trigger data fetch when filter is applied or cleared
    const [filterTrigger, setFilterTrigger] = useState(0); 
    // State to manage the behavior of setting default dates only on the first load
    const [isInitialLoad, setIsInitialLoad] = useState(true); 

    // --- Helper Functions for Formatting ---
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (isoString) => {
        if (!isoString) return 'Nil';
        const date = new Date(isoString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const formatTime = (isoString) => {
        if (!isoString) return 'Nil';
        const date = new Date(isoString);
        return date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    // --- Data Fetching Logic (memoized) ---
    const fetchAchievements = useCallback(async (start, end) => {
        setLoading(true);
        setError(null);
        const authToken = localStorage.getItem("token");

        if (!authToken) {
            setError("Authentication token missing. Please log in.");
            setLoading(false);
            toast.error("Please login to view achievements.");
            return;
        }
        if (!userId) {
            setError("User ID missing. Cannot fetch achievements.");
            setLoading(false);
            return;
        }

        // Validation for date range before fetching
        if (start && end && new Date(start) > new Date(end)) {
            toast.error("Start date cannot be after end date.");
            setLoading(false);
            setAchievements(prev => ({ ...prev, historicalRevenueData: [] })); 
            return;
        }

        try {
            // Construct the URL and append the date filters. 
            // This is where the filter parameters are sent to the backend.
            const url = new URL(`${ENDPOINTS.USER_ACHIEVEMENTS}/${userId}`);
            
            if (start) {
                url.searchParams.append('startDate', start);
            }
            if (end) {
                url.searchParams.append('endDate', end);
            }

            // console.log(`Fetching achievements from: ${url.toString()}`);

            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            // console.log("Fetched achievement data:", data);

            setAchievements({
                totalLeadClosed: data.totalLeadClosed || 0,
                totalLeads: data.totalLeads || 0,
                dealCovertioRatio: data.dealCovertioRatio || 0,
                totalRevenueAmount: data.totalRevenueAmount || 0,
                highestValueLead: data.highestValueLead || { iproject_value: 0, dcreated_dt: null, convertToDealTime: null },
                highestAchievedMonth: data.highestAchievedMonth || { month: '', count: 0 },
                // This array should contain data filtered by dcreated_dt on the backend
                historicalRevenueData: Array.isArray(data.totalRevenue) ? data.totalRevenue : [], 
            });

        } catch (err) {
            console.error("Error fetching achievements:", err);
            setError(err.message);
            toast.error(`Error loading achievements: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    // --- useEffect for Fetching and Initial Load ---
    useEffect(() => {
        // Function to set the current month as default dates (YYYY-MM-DD)
        const setInitialDates = () => {
            const today = new Date();
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

            const formatForInput = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            const defaultStartDate = formatForInput(firstDayOfMonth);
            const defaultEndDate = formatForInput(lastDayOfMonth);

            setStartDate(defaultStartDate);
            setEndDate(defaultEndDate);
            return { defaultStartDate, defaultEndDate };
        };

        if (userId) {
            let start = startDate;
            let end = endDate;

            // If it's the initial load, set the current month's dates and fetch data
            if (isInitialLoad) {
                const dates = setInitialDates();
                start = dates.defaultStartDate;
                end = dates.defaultEndDate;
                setIsInitialLoad(false); 
            }
            
            // Trigger the fetch using the determined dates
            fetchAchievements(start, end);
        } else {
            setLoading(false);
        }
        
    }, [userId, fetchAchievements, filterTrigger, isInitialLoad]);

    // Handler for triggering the filter when the apply icon is clicked
    const handleFilterIconClick = () => {
        if (!startDate && !endDate) {
            toast.warn("Please select at least a start or end date to filter.");
            return;
        }
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            toast.error("Start date cannot be after end date.");
            return;
        }
        // Increment filterTrigger to initiate useEffect fetch with new dates
        setFilterTrigger(prev => prev + 1); 
        toast.info(`Applying filter...`);
    };

    // Handler for clearing the date filter when the clear icon is clicked
    const handleClearFilterIconClick = () => {
        if (!startDate && !endDate) {
            toast.info("Filter is already clear.");
            return;
        }
        setStartDate('');
        setEndDate('');
        // Increment filterTrigger to initiate useEffect fetch with cleared dates (all time)
        setFilterTrigger(prev => prev + 1);
        toast.info("Date filter cleared. Showing all-time data.");
    };

    // Navigate to the user deals page when clicking "Total Deals Closed"
    const handleTotalDealsClosedClick = () => {
        navigate(`/userdeals/${userId}`); 
    };

    if (loading) {
        // ... (Loading state UI) ...
        return (
            <div className="min-h-screen p-5 font-sans text-gray-800 flex justify-center items-center">
                <p className="text-xl font-semibold">Achievement Dashboard {currentUserName}...</p>
                <ToastContainer />
            </div>
        );
    }

    if (error) {
        // ... (Error state UI) ...
        return (
            <div className="min-h-screen p-5 font-sans text-gray-800 flex justify-center items-center">
                <p className="text-xl font-semibold text-red-600">Error: {error}</p>
                <ToastContainer />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-5 text-gray-800 bg-gray-50">
            <div className="dashboard-container mx-auto p-8 rounded-lg bg-white shadow-xl border border-gray-200">
                
                <h2 className="text-3xl md:text-4xl font-extrabold mb-8 text-blue-900 border-b-4 border-blue-400 pb-3 text-center tracking-tight animate-fade-in-down">
                    Achievements Dashboard
                </h2>

                <div className="achievement-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {/* Achievement Cards (UI structure remains the same) */}
                    
                    {/* Card 1: Total Deals Closed */}
                    <div 
                        className="achievement-card bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-lg border border-blue-200 flex flex-col justify-between transform transition-transform duration-300 hover:scale-102 cursor-pointer" 
                        onClick={handleTotalDealsClosedClick} 
                    >
                        <div className="achievement-card-title text-base text-blue-800 font-medium mb-2">Total Deals Closed</div>
                        <div className="achievement-card-metric text-2xl font-bold text-blue-900 mb-2">{achievements.totalLeadClosed}</div>
                        <div className="achievement-card-trend flex items-center text-sm text-green-600 font-semibold">
                            <span className="arrow mr-1 text-lg">&#x25B2;</span>
                            +Overview
                        </div>
                    </div>

                    {/* Card 2: Revenue Generated */}
                    <div className="achievement-card bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-lg border border-green-200 flex flex-col justify-between transform transition-transform duration-300 hover:scale-102">
                        <div className="achievement-card-title text-base text-green-800 font-medium mb-2">Revenue Generated</div>
                        <div className="achievement-card-metric text-2xl font-bold text-green-900 mb-2">
                            {formatCurrency(achievements.totalRevenueAmount)}
                        </div>
                        <div className="achievement-card-trend flex items-center text-sm text-green-600 font-semibold">
                            <span className="arrow mr-1 text-lg">&#x25B2;</span>
                            +Overview
                        </div>
                    </div>

                    {/* Card 3: Lead Conversion Ratio */}
                    <div className="achievement-card bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-lg border border-purple-200 flex flex-col justify-between transform transition-transform duration-300 hover:scale-102">
                        <div className="achievement-card-title text-base text-purple-800 font-medium mb-2">Lead Conversion Ratio</div>
                        <div className="achievement-card-metric text-2xl font-bold text-purple-900 mb-2">{achievements.dealCovertioRatio}%</div>
                        <div className="achievement-card-trend flex items-center text-sm text-green-600 font-semibold">
                            <span className="arrow mr-1 text-lg">&#x25B2;</span>
                            +Overview
                        </div>
                    </div>

                    {/* Card 4: Highest Value Deal Closed */}
                    <div className="achievement-card bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl shadow-lg border border-red-200 flex flex-col justify-between transform transition-transform duration-300 hover:scale-102">
                        <div className="achievement-card-title text-base text-red-800 font-medium mb-2">Highest Value Deal Closed</div>
                        <div className="achievement-card-metric text-2xl font-bold text-red-900 mb-2">
                            {formatCurrency(achievements.highestValueLead?.iproject_value || 0)}
                        </div>
                        <div className="achievement-card-trend flex items-center text-sm text-red-600 font-semibold">
                            {achievements.highestValueLead?.convertToDealTime ? ` on ${formatDate(achievements.highestValueLead.convertToDealTime)}` : '-'}
                        </div>
                    </div>

                    {/* Card 5: Most Active Month */}
                    <div className="achievement-card bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl shadow-lg border border-yellow-200 flex flex-col justify-between transform transition-transform duration-300 hover:scale-102">
                        <div className="achievement-card-title text-base text-yellow-800 font-medium mb-2">Most Active Month</div>
                        <div className="achievement-card-metric text-2xl font-bold text-yellow-900 mb-2">
                            {achievements.highestAchievedMonth?.month ? new Date(achievements.highestAchievedMonth.month).toLocaleString('en-IN', { month: 'long', year: 'numeric' }) : 'Nil'}
                        </div>
                        <div className="achievement-card-trend flex items-center text-sm text-yellow-600 font-semibold">
                            {achievements.highestAchievedMonth?.count ? ` with ${achievements.highestAchievedMonth.count} achievements` : '+Overview'}
                        </div>
                    </div>

                    {/* Card 6: Total Leads */}
                    <div className="achievement-card bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-xl shadow-lg border border-teal-200 flex flex-col justify-between transform transition-transform duration-300 hover:scale-102">
                        <div className="achievement-card-title text-base text-teal-800 font-medium mb-2">Total Leads</div>
                        <div className="achievement-card-metric text-2xl font-bold text-teal-900 mb-2">{achievements.totalLeads}</div>
                        <div className="achievement-card-trend flex items-center text-sm text-green-600 font-semibold">
                            <span className="arrow mr-1 text-lg">&#x25B2;</span>
                            +Overview
                        </div>
                    </div>
                </div>

                <div className="historical-section-header flex flex-col sm:flex-row justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Historical Revenue Details</h2>
                    <div className="date-filter-inputs flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                        {/* <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="block w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 shadow-sm transition duration-200"
                            aria-label="Start Date"
                        />
                        <span className="text-gray-600 font-medium hidden sm:block">to</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="block w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 shadow-sm transition duration-200"
                            aria-label="End Date"
                        /> */}
                        
                        {/* Apply Filter Icon */}
                        <i 
                            className="fas fa-filter text-blue-600 hover:text-blue-800 text-2xl cursor-pointer transition-colors duration-200"
                            onClick={handleFilterIconClick}
                            title="Apply Date Filter"
                        ></i>
                        
                        {/* Clear Filter Icon */}
                        <i 
                            className="fas fa-xmark text-red-600 hover:text-red-800 text-2xl cursor-pointer transition-colors duration-200"
                            onClick={handleClearFilterIconClick}
                            title="Clear Filter"
                        ></i>
                    </div>
                </div>

                <div className="overflow-x-auto overflow-y-scroll h-[550px] shadow-lg rounded-lg border border-gray-200">
                    <table className="historical-table w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="p-4 text-center border-b border-gray-200 font-semibold text-gray-700 uppercase text-sm whitespace-nowrap">S.No</th>
                                <th className="p-4 text-center border-b border-gray-200 font-semibold text-gray-700 uppercase text-sm whitespace-nowrap">Project Values</th>
                                <th className="p-4 text-center border-b border-gray-200 font-semibold text-gray-700 uppercase text-sm whitespace-nowrap">Created Date</th>
                                <th className="p-4 text-center border-b border-gray-200 font-semibold text-gray-700 uppercase text-sm whitespace-nowrap">Conversion Time</th> 
                            </tr>
                        </thead>
                        <tbody>
                            {achievements.historicalRevenueData.length > 0 ? (
                                achievements.historicalRevenueData.map((row, index) => (
                                    <tr key={row.iProject_id || index} className="hover:bg-gray-50 transition-colors duration-150">
                                        <td className={`p-4 text-center border-b border-gray-200 text-gray-800 ${index === achievements.historicalRevenueData.length - 1 ? 'border-b-0' : ''}`}>
                                            {index + 1}
                                        </td>
                                        <td className={`p-4 text-center border-b border-gray-200 text-gray-800 ${index === achievements.historicalRevenueData.length - 1 ? 'border-b-0' : ''}`}>
                                            {formatCurrency(row.iproject_value)}
                                        </td>
                                        <td className={`p-4 text-center border-b border-gray-200 text-gray-800 ${index === achievements.historicalRevenueData.length - 1 ? 'border-b-0' : ''}`}>
                                            {formatDate(row.dcreated_dt)}
                                        </td>
                                        <td className={`p-4 text-center border-b border-gray-200 text-gray-800 ${index === achievements.historicalRevenueData.length - 1 ? 'border-b-0' : ''}`}>
                                            {formatTime(row.convertToDealTime)} 
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="p-6 text-center text-gray-500 bg-white">No historical revenue data available for the selected dates.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        </div>
    );
}

export default AcheivementDashboard;