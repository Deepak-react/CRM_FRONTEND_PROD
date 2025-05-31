import React from "react";
import ProgressBar from "../Components/common/ProgressBar";
import TabsBar from "../Components/common/TabsBar";
import ProfileHeader from "../Components/common/ProfileHeader";
import Comments from "@/Components/commandshistory";
//import ProfileWithHistoryCard from "@/components/common/ProfileWithHistoryCard"; 


const Commandpage = () => {
  return (
    <>
     <ProfileHeader />
     
     <div className="ms-[-700px]">
      <ProgressBar />
      </div>
      <div className="">
      <TabsBar />
      </div>
      <div className="flex px-2 gap-4">
        {/* LEFT: Profile + History */}
        <div className="w-[550px] h-100vh">
          <ProfileWithHistoryCard />
        </div>
    <div className="w-full h-[-100px] ms-10 mr-10 mt-[40px] overflow-x-hidden shadow rounded bg-white">
      <Comments />
    </div>
    </div>
    </>
  );
};

export default Commandpage;
