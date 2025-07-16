import React, { useState, useEffect, useCallback } from "react";
import { ENDPOINTS } from "../../../api/constraints";
import { jwtDecode } from "jwt-decode";

export default function RemindersCard() {
  const [remindersData, setRemindersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentToken, setCurrentToken] = useState(null);

  useEffect(() => {
    let extractedUserId = null;
    let tokenFromStorage = null;

    try {
      tokenFromStorage = localStorage.getItem('token');
      // console.log("Token from localStorage:", tokenFromStorage);
      if (tokenFromStorage) {
        const decodedToken = jwtDecode(tokenFromStorage);
        extractedUserId = decodedToken.user_id;
        // console.log("Extracted User ID:", extractedUserId);
        if (!extractedUserId) {
          throw new Error("User ID not found in token.");
        }
      } else {
        throw new Error("Authentication token not found in local storage.");
      }
    } catch (e) {
      console.error("Error retrieving or decoding token:", e);
      setError(`Authentication error: ${e.message}. Please log in again.`);
      setLoading(false);
      return;
    }

    if (extractedUserId && tokenFromStorage) {
      setCurrentUserId(extractedUserId);
      setCurrentToken(tokenFromStorage);
    } else {
      setError("User ID or authentication token is missing after processing.");
      setLoading(false);
    }
  }, []);

  const fetchReminders = useCallback(async () => {
    if (!currentUserId || !currentToken) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
    
      const apiUrl = `${ENDPOINTS.MANAGER_REMINDER}/${currentUserId}`; 
      // console.log("API URL:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
      });
      // console.log("Reminder response :", response);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(`HTTP error! status: ${response.status}, Details: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();
      // console.log("Fetched data:", result); 

      
      const usersReminders = result.details?.usersReminder || [];
      const activeReminders = usersReminders.filter(
        (reminder) => reminder.bactive === true
      );
      setRemindersData(activeReminders);

    } catch (err) {
      console.error("Error fetching reminders:", err);
      setError(`Failed to fetch reminders: ${err.message}. Please try again.`);
      setRemindersData([]);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, currentToken]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const now = new Date();

  const processedReminders = remindersData.map((reminder) => {
    const target = new Date(reminder.dremainder_dt);
    const timeRemainingMs = target - now;

    let remainingText = "Reminder time passed";

    if (timeRemainingMs > 0) {
      const diffSec = Math.floor(timeRemainingMs / 1000);
      const hours = Math.floor(diffSec / 3600);
      const minutes = Math.floor((diffSec % 3600) / 60);
      const seconds = diffSec % 60;

      remainingText = `Time left: ${hours}h ${minutes}m ${seconds}s`;
    }

    return {
      id: reminder.iremainder_id,
      name: reminder.cremainder_title || "Untitled Reminder",
      time: new Date(reminder.dremainder_dt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      remaining: remainingText,
      avatar: "/images/dashboard/grl.png",
    };
  }).sort((a, b) => {
    const timeA = new Date(remindersData.find(r => r.iremainder_id === a.id)?.dremainder_dt);
    const timeB = new Date(remindersData.find(r => r.iremainder_id === b.id)?.dremainder_dt);
    return timeA - timeB;
  });

  if (loading) {
    return <div className="text-center py-8 text-gray-700">Loading reminders...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600 font-medium">{error}</div>;
  }

  return (
    <div className="bg-white rounded-3xl p-6 w-full ">
      <h2 className="text-xl font-semibold mb-4">Reminders</h2>

      {processedReminders.length > 0 ? (
        <div className="space-y-4 max-h-[calc(4*4rem+3*1rem)] overflow-y-auto">
          {processedReminders.map(({ id, name, time, remaining, avatar }) => (
            <div
              key={id}
              className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center bg-gray-50 hover:bg-gray-100 transition p-4 rounded-lg space-y-2 sm:space-y-0"
            >
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <img
                  src={avatar}
                  alt={`${name} avatar`}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex flex-col flex-grow min-w-0">
                  <span className="font-medium text-gray-800 break-words">
                    {name}
                  </span>
                  <div className="text-sm text-gray-500 flex items-center gap-1 break-words">
                    <span role="img" aria-label="clock">
                      🕒
                    </span>
                    Meeting starts at {time}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-gray-200 px-3 py-1 rounded-full font-medium text-sm text-gray-700 flex-shrink-0 mt-2 sm:mt-0 sm:ml-4">
                <span role="img" aria-label="hourglass">
                  ⏳
                </span>
                {remaining}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-gray-500">No active reminders for the day</div>
      )}
    </div>
  );
}