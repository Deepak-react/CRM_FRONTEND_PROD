import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box } from "@mui/material";
import ProfileCard from "../Components/common/ProfileCard";
import Comments from "../Components/commandshistory";
import RemainderPage from "../pages/RemainderPage";
import StatusBar from "./StatusBar";
import LeadTimeline from "../Components/LeadTimeline";
import ActionCard from "../Components/common/ActrionCard";
import { ENDPOINTS } from "../api/constraints";
import { usePopup } from "../context/PopupContext";

const LeadDetailView = () => {
  const { leadId } = useParams();
  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isDeal, setIsDeal] = useState(false);
  const [isLost, setIsLost] = useState(true); // true means active, false means lost
  const [leadData, setLeadData] = useState(null);
  const [leadLostDescription, setLeadLostDescription] = useState("");
  const [leadLostDescriptionTrue, setLeadLostDescriptionTrue] = useState(false);
  const { showPopup } = usePopup();

  const handleTabChange = (event, newValue) => setTabIndex(newValue);

  const convertToDeal = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${ENDPOINTS.CONVERT_TO_DEAL}/${leadId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        showPopup("Error", "Failed to update status!", "error");
        return;
      }

      showPopup("Success", "Lead converted to deal!", "success");
      setIsDeal(true);
    } catch (error) {
      console.error("Error occurred while converting the lead to deal", error);
    }
  };

  const handleLostClick = () => {
    setLeadLostDescriptionTrue(true);
  };

  const descriptionValueChange = (e) => {
    setLeadLostDescription(e.target.value);
  };

  const lostLead = async () => {
    try {
      const token = localStorage.getItem("token");
      let userId = null;
      if (token) {
        const base64Payload = token.split(".")[1];
        const decodedPayload = atob(base64Payload);
        const payloadObject = JSON.parse(decodedPayload);
        userId = payloadObject.user_id;
      } else {
        console.log("No token found.");
        return;
      }

      const response = await fetch(`${ENDPOINTS.CONVERT_TO_LOST}/${leadId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          action: "Lost",
          userId,
          description: leadLostDescription,
        }),
      });

      if (!response.ok) {
        showPopup("Error", "Failed to update lead as lost", "error");
        return;
      }

      const quotes = [
        "Not every door opens, but every knock builds experience 💪 Keep going 💥.",
        "Sometimes a 'no' is just redirection to a better opportunity 🔁✨",
        "Losses are lessons in disguise 📘 Next one’s yours!",
        "Strong minds build from setbacks 🧠💥 You got this!",
        "This one’s gone. But hey, champions always bounce back 🏆🔥",
      ];
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

      showPopup("Info", `Lead updated as lost. ${randomQuote}`, "info");
      setIsLost(false);
      setLeadLostDescription("");
      setLeadLostDescriptionTrue(false);
    } catch (error) {
      console.error("Error marking lead as lost:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await lostLead();
  };

  useEffect(() => {
    const fetchLeadData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${ENDPOINTS.LEAD}/${leadId}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch lead data");
        }

        const data = await response.json();
        setLeadData(data);
        setIsDeal(data.bisConverted);
        setIsLost(data.bactive); // true = active, false = lost
      } catch (error) {
        console.error("Error fetching lead data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeadData();
  }, [leadId]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 relative overflow-x-hidden">
      {/* Left Column */}
      <div className="w-full md:w-1/3 lg:w-1/4 p-4">
        <div className="sticky top-4 z-10">
          <ProfileCard leadId={leadId} />
          <ActionCard leadId={leadId} />
        </div>
      </div>

      {/* Right Column */}
      <div className="w-full md:w-full lg:w-full p-4">
        {/* Status Bar */}
       <div className="mb-4 flex items-center justify-between">
  <StatusBar leadId={leadId} leadData={leadData} />
  
  {!loading && isDeal && isLost && (
    <div className="flex items-center gap-2 text-green-600 text-lg font-semibold bg-green-50 px-4 py-2 rounded-full shadow">
      <span role="img" aria-label="deal">🎉</span> Deal
    </div>
  )}
</div>

        {/* Cupertino-style Tabs and Actions */}
        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-4 mb-4 w-full overflow-x-hidden">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 bg-gray-100 rounded-full p-1 shadow-inner w-full sm:w-auto">
            {["Activity", "Comments", "Reminders"].map((label, idx) => (
              <button
                key={label}
                onClick={() => handleTabChange(null, idx)}
                className={`px-5 py-2 text-sm font-semibold rounded-full transition-colors duration-200 ${
                  tabIndex === idx
                    ? "bg-white shadow text-blue-600"
                    : "text-gray-500 hover:bg-white hover:text-blue-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            {!loading && !isDeal && isLost && (
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-full shadow transition"
                onClick={convertToDeal}
              >
                Convert
              </button>
            )}
            {!loading && isLost && (
              <button
                className="bg-red-100 text-red-600 hover:bg-red-200 font-semibold py-2 px-6 rounded-full shadow-inner transition"
                onClick={handleLostClick}
              >
                Lost
              </button>
            )}
          </div>
        </div>

        {/* Tab Panels */}
        <Box className="mt-4 relative z-0">
          {tabIndex === 0 && <LeadTimeline leadId={leadId} />}
          {tabIndex === 1 && <Comments leadId={leadId} />}
          {tabIndex === 2 && <RemainderPage leadId={leadId} />}
        </Box>
      </div>

      {/* Lost Lead Modal */}
      {leadLostDescriptionTrue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-[90%] max-w-[60%]">
            <h2 className="text-xl font-bold mb-4">Why mark this lead as Lost?</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-medium">Description</label>
                <textarea
                  name="description"
                  value={leadLostDescription}
                  onChange={descriptionValueChange}
                  className="w-full border px-3 py-2 rounded resize-none min-h-[90px]"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setLeadLostDescriptionTrue(false)}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadDetailView;