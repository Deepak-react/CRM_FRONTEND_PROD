import React from "react";
import Sidebar from "@/Components/common/sidebar";
import ProfileHeader from "@/Components/common/ProfileHeader";
import ProfileWithHistoryCard from "@/Components/common/ProfileWithHistoryCard"; 
import NewComment from "@/Components/LeadManage/NewComments";

const LeadsManagePage = () => {
  return (
    <div className="flex">
      {/* Sidebar on the left */}
      <Sidebar />

      {/* Main content area */}
      <main className="flex-1 bg-gray-50 min-h-screen p-6">
        {/* Header section: Title left, ProfileHeader right */}
        <div className="flex justify-between items-start mb-6">
            <h1 className="text-2xl font-semibold text-gray-800 mt-0">Lead Management</h1>
            <ProfileHeader />
        </div>
        
          <div className="flex px-2 gap-4">
                  {/* LEFT: Profile + History */}
                  <div className="w-[550px] h-100vh">
                    <ProfileWithHistoryCard />
                    < NewComment />
                  </div>
                  <div className="w-full h-100vh mx-auto ms-10 mr-10 mt-[40px] shadow rounded bg-white">
                  < NewComment />
                  </div>
                </div>
          
        
      </main>
    </div>
  );
};

export default LeadsManagePage;
