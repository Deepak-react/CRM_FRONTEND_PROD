import React from "react";
import ProfileHeader from "@/Components/common/ProfileHeader"; 
import TeamleadHeader from "@/Components/dashboard/teamlead/tlHeader"; 
import { ENDPOINTS  } from "../../api/constraints";
import { useEffect, useState } from "react";
import RemindersCard from "@/Components/dashboard/teamlead/tlremindercard";
import LeadsTable from "@/Components/dashboard/teamlead/tlLeadcard";
import LeadManagementCard from "@/Components/dashboard/teamlead/teamviewbarchart"; 
import TeamKPIStats from "@/Components/dashboard/teamlead/teamKPIcard";

const TeamviewDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [reminder, setReminderData] = useState(null);

    useEffect(() => {
      const storedUser = localStorage.getItem("user");
      const userObj = JSON.parse(storedUser);
    
      console.log("Stored User:", userObj);
    
      const fetchDashboardData = async () => {
        try {
          const response = await fetch(`${ENDPOINTS.DASHBOARD_MANAGER}/${userObj.iUser_id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userObj.jwtToken}`,
            },
          });
    
          if (!response.ok) {
            throw new Error("Failed to fetch teams dashboard data");
          }
    
          const data = await response.json();
          console.log("Teams dashboard Data:", data);
          setDashboardData(data);
    
        } catch (error) {
          console.error("Error fetching teams dashboard data:", error);
        }
      };


      const fetchReminders = async () => {
        console.log("Fetching reminders...",ENDPOINTS.REMINDERS);
        try {
          const response = await fetch(`${ENDPOINTS.REMINDERS}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userObj.jwtToken}`,
            },
          });
    
          if (!response.ok) {
            throw new Error("Failed to fetch teams dashboard data");
          }
    
          const data = await response.json();
          console.log("Teams dashboard Data for reminder:", data);
          setReminderData(data);
    
        } catch (error) {
          console.error("Error fetching teams dashboard data:", error);
        }
      };



    
      fetchDashboardData();
      fetchReminders();
    }, []);
    

// console.log("Dashboard Data:", dashboardData);
    if (dashboardData) {
      console.log("✅ Dashboard Data updated22:", dashboardData);
    }


    if (reminder) {
      console.log("✅ Reminder Data updated:", reminder.message);
    }



    const leads = dashboardData?.details?.leads || [];

const leadCount = leads.filter(item => item.bisConverted === false).length;
const leadData = leads.filter(item => item.bisConverted === false);
const dealCount = leads.filter(item => item.bisConverted === true).length;

const hotCount = leads.filter(lead => lead.lead_potential?.clead_name === "HOT").length;
const coldCount = leads.filter(lead => lead.lead_potential?.clead_name === "COLD").length;

     console.log("🔥 Hot Leads:", hotCount);

  return (
    <main className="w-full flex-1 p-6 bg-gray-50 mt-[0px] min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <TeamleadHeader />
        <ProfileHeader />
      </div>

      {/* Dashboard Content */}
      <div className="grid grid-cols-2 gap-6">
        <LeadManagementCard leads={leadData} team_members = {dashboardData?.details?.subordinateNames} />
        <TeamKPIStats leadCount={leadCount} dealCount={dealCount} hotLeadCount ={hotCount} coldLeadCount ={coldCount} />
        <LeadsTable data={leadData} />
        <RemindersCard reminder_data ={reminder?.message} />
      </div>
    </main>
  );
};

export default TeamviewDashboard;