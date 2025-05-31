import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

import { ENDPOINTS } from "../../api/constraints";
import ProfileHeader from "@/Components/common/ProfileHeader";
import TeamleadHeader from "@/Components/dashboard/teamlead/tlHeader";
import KPIStats from "@/Components/dashboard/teamlead/tlKPIcards";
import RemindersCard from "@/Components/dashboard/teamlead/tlremindercard";
import LeadsTable from "@/Components/dashboard/teamlead/tlLeadcard";
import DealsTable from "@/Components/dashboard/teamlead/tlDealcard";

const LeadsDashboard = () => {
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    const userObj = JSON.parse(storedUser);
    setUser(userObj);

    // Show popup only if not already shown
    const hasSeenIntro = localStorage.getItem("hasSeenDashboardIntro");
    if (!hasSeenIntro) {
      setShowPopup(true);
      localStorage.setItem("hasSeenDashboardIntro", "true");
    }

    const fetchDashboardData = async () => {
      try {
        const response = await fetch(
          `${ENDPOINTS.DASHBOARD_USER}/${userObj.iUser_id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userObj.jwtToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const data = await response.json();
        setDashboardData(data);
        console.log("✅ Dashboard Data:", data);
      } catch (error) {
        console.error("❌ Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="flex mt-[-80px]">
      {/* Main Content */}
      <main className="w-full flex-1 p-6 bg-gray-50 mt-[80px] min-h-screen">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <TeamleadHeader />
          <ProfileHeader />
        </div>

        {/* Show Logged In User Info */}
        {/* {user && (
          <div className="mb-6 text-gray-800 text-lg font-medium">
            Welcome,{user.name}
            <span className="font-bold">{user.name || user.email}</span>!
            <br />
            <span className="text-sm text-gray-600">
              Role: {user.role || "N/A"}
            </span>
          </div>
        )} */}

        {/* Dashboard Content */}
        <div className="grid grid-cols-2 gap-6">
          <KPIStats data={dashboardData?.details} />
          <RemindersCard reminder_data={dashboardData?.details?.reminders} />
          <LeadsTable data={dashboardData?.details?.leads} />
          <DealsTable data={dashboardData?.details?.deals} />
        </div>
      </main>

      {/* First Login Feature Popup */}
    <Dialog
  open={showPopup}
  onClose={() => setShowPopup(false)}
  PaperProps={{
    sx: {
      borderRadius: 3,              // larger rounded corners (24px)
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',  // soft shadow
      padding: 2,
      minWidth: { xs: '280px', sm: '320px', md: '400px' },
      bgcolor: '#F9F9F9',           // very light gray background
    },
  }}
>
  <DialogTitle
    sx={{
      fontWeight: 600,
      fontSize: '1.25rem',
      color: '#1C1C1E',             // dark text, close to iOS style
      textAlign: 'center',
      pb: 0,
      pt: 2,
      userSelect: 'none',
    }}
  >
    🎉 🎉 Welcome to the New Dashboard! 🎉 🎉
  </DialogTitle>

  <DialogContent
    dividers
    sx={{
      fontSize: '0.9rem',
      color: '#3C3C4399',           // subtle gray text
      lineHeight: 1.5,
      pt: 1,
      pb: 2,
      '& ul': {
        paddingLeft: 3,
        marginTop: 1,
        listStyleType: 'disc',
        '& li': {
          marginBottom: 1,
          userSelect: 'none',
        },
      },
    }}
  >
    🎉 Here are some of the new features:
    <ul>
      <li>🔍 Improved Lead & Deal Tracking</li>
      <li>📅 Smart Reminders with Alerts</li>
      <li>📊 Enhanced KPI Insights</li>
      <li>⚡ Faster performance and UI upgrades</li>
      <li>🎙️ Voice to Text Functionality</li>
    </ul>
  </DialogContent>

  <DialogActions
    sx={{
      justifyContent: 'center',
      pb: 2,
      pt: 0,
    }}
  >
    <Button
      onClick={() => setShowPopup(false)}
      variant="contained"
      sx={{
        bgcolor: '#007AFF',     // iOS blue button
        color: 'white',
        fontWeight: 600,
        borderRadius: '9999px', // pill shape
        textTransform: 'none',
        px: 4,
        py: 1.5,
        boxShadow: '0 4px 8px rgba(0, 122, 255, 0.3)',
        '&:hover': {
          bgcolor: '#005BBB',
          boxShadow: '0 6px 12px rgba(0, 91, 187, 0.4)',
        },
      }}
    >
      Got it!
    </Button>
  </DialogActions>
</Dialog>
    </div>
  );
};

export default LeadsDashboard;
