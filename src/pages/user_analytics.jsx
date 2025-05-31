import React from "react";
import ProgressBar from "../Components/common/ProgressBar";
import TabsBar from "../Components/common/TabsBar";
import ProfileHeader from "../Components/common/ProfileHeader";
import ProfileWithHistoryCard from "@/Components/common/ProfileWithHistoryCard";
import SalesFunnel from "../Components/user_analyticts_status";

const UserAnalyticsPage = () => {
  return (
    <>
      <ProfileHeader />

      {/* Progress Bar */}
      <div className="ms-[-670px]">
        <ProgressBar />
      </div>

      {/* Tabs Bar */}
      <div className="ms-[30px]">
        <TabsBar />
      </div>

      {/* Main Content Section */}
      <div className="flex px-2 gap-4">
        {/* LEFT: Profile + History */}
        <div className="w-[550px] min-h-screen mt-[20px]">
          <ProfileWithHistoryCard />
        </div>

        {/* RIGHT: Sales Funnel */}
        <div className=" w-full h-64  rounded mt-0 mx-0 ">
          <SalesFunnel />
        </div>
      </div>
      
    </>
  );
};

export default UserAnalyticsPage;
