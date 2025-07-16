// src/pages/UserReportPage.jsx
import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import AcheivementDashboard from '../userPage/acheivementPage';
import UserDeals from './userDeal';
import { UserContext } from '../../context/UserContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserReportPage = () => {
    const { userId: urlUserId } = useParams();
    const { users } = useContext(UserContext);

    const parsedUserId = urlUserId ? parseInt(urlUserId, 10) : null;

    // console.log("UserReportPage DEBUG: URL userId param:", urlUserId);
    // console.log("UserReportPage DEBUG: Parsed userId being passed to children:", parsedUserId);

    // This block should prevent rendering AcheivementDashboard or UserDeals
    // if the userId is initially invalid.
    if (!parsedUserId || isNaN(parsedUserId)) {
        console.warn("UserReportPage: Initial userId is invalid/missing. User is likely navigating to an incorrect URL or parameter is malformed.");
        toast.error("Invalid User ID provided in the URL. Please check the URL.");
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <p className="text-xl text-red-600">Invalid User ID. Please check the URL (e.g., /userreports/123).</p>
                <ToastContainer />
            </div>
        );
    }

    const currentUser = users ? users.find(user => user.iUser_id === parsedUserId) : null;
    const currentUserName = currentUser ? currentUser.cFull_name : 'Loading User...';

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                User Report for <span className="text-blue-600">{currentUserName}</span>
            </h1>

            {/* Both receive the SAME parsedUserId */}
            <AcheivementDashboard userId={parsedUserId} />

            <div className="mt-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Deals Overview</h2>
                <UserDeals userId={parsedUserId} />
            </div>
            <ToastContainer />
        </div>
    );
};

export default UserReportPage;