import React, { useEffect, useState } from "react";
import { ENDPOINTS } from "../api/constraints";

// Map activity types to colors for timeline dots and lines
const activityColors = {
  lead_created: "#28a745", // green
  follow_up: "#fd7e14", // orange
  proposal_sent: "#007bff", // blue
  comment_added: "#ffc107", // yellow
  assigned_to_user: "#6f42c1", // purple
  default: "#28a745", // green (fallback)
};

// Helper function to get activity-specific messages
const getActivityMessage = (activity) => {
  const { activitytype, data, user, performedbyid } = activity;
  const userName = user?.cFull_name || `User ${performedbyid || 'System'}`; // Fallback for performedbyid

  // Helper to replace generic user IDs with actual names in messages
  const personalizeMessage = (msg) =>
    typeof msg === "string" ? msg.replace(`User ${performedbyid}`, userName).replace(`${performedbyid}`, userName) : msg; // Ensure both forms are replaced

  switch (activitytype) {
    case "lead_created":
      return personalizeMessage(data?.newStatus) || `Lead created by ${userName}.`;
    case "follow_up":
      // Assuming `data.notes` or similar would contain follow-up details if available
      return `Follow-up scheduled by ${userName}.`;
    case "proposal_sent":
      return `Proposal sent to the client by ${userName}.`;
    case "comment_added":
      return personalizeMessage(data?.newStatus) || `A comment was added by ${userName}.`;
    case "assigned_to_user":
      // Refined logic to handle [object Object] more gracefully
      if (typeof data?.newStatus === "string" && data.newStatus.includes("[object Object]")) {
        return `The lead was assigned by ${userName}.`;
      }
      return personalizeMessage(data?.newStatus) || `The lead was assigned by ${userName}.`;
    default:
      // Capitalize and replace underscores for unhandled types
      return (
        personalizeMessage(data?.newStatus) ||
        activitytype.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      );
  }
};

// Helper: Get color for a given activity type, fallback to default
const getActivityColor = (type) => activityColors[type] || activityColors.default;

export default function LeadTimeline({ leadId }) {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Added loading state

  const fetchActivityLog = async () => {
    setLoading(true); // Set loading true when fetching starts
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${ENDPOINTS.BASE_URL_IS}/lead-activity-log/${leadId}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch activity log (Status: ${response.status})`);
      }

      const data = await response.json();
      // Sort in descending order (newest first)
      const sortedHistory = data.sort(
        (a, b) => new Date(b.activitytimestamp) - new Date(a.activitytimestamp)
      );

      setHistory(sortedHistory);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(err.message || "Unable to fetch timeline data");
    } finally {
      setLoading(false); // Set loading false when fetching ends (success or error)
    }
  };

  useEffect(() => {
    if (leadId) {
      fetchActivityLog();
    } else {
      setHistory([]); // Clear history if leadId is not provided
      setLoading(false);
    }
  }, [leadId]);

  return (
    <div className="relative  w-full px-4 py-10 bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Container for timeline content - ensures centering and max width */}
      <div className=" h-[130vh] mx-auto"> 
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Lead Activity Timeline</h2>
        
        {loading && (
          <div className="text-center text-gray-500 text-lg">Loading activity history...</div>
        )}

        {error && !loading && (
          <div className="text-red-700 bg-red-100 rounded-lg px-6 py-3 text-sm shadow-md w-full max-w-md mx-auto text-center">
            {error}
          </div>
        )}

        {!error && !loading && history.length === 0 && (
          <div className="text-gray-500 text-sm italic text-center py-4">No activity found for this lead.</div>
        )}

        {/* Timeline visualization container - makes it scrollable if content exceeds height */}
        {/* Adjust the h-[...] value based on your layout. For example, h-[calc(100vh-200px)] 
            if you have a header/footer taking up 200px, or just remove the fixed height 
            and overflow-y-auto if you want the page to scroll naturally. */}
        <div className="flex flex-col items-center space-y-8 h-full overflow-y-auto">

          {history.map((entry, index) => {
            // Alternate content side
            const isLeft = index % 2 === 0;
            const isLast = index === history.length - 1;
            const message = getActivityMessage(entry);

            const performedBy = entry.user?.cFull_name || `User ${entry.performedbyid || "System"}`;
            const date = new Date(entry.activitytimestamp);

            // Format the date using 'en-GB' for DD/MM/YYYY and ensure AM/PM is uppercase
            const humanReadable = date.toLocaleString("en-GB", {
              day: "numeric",
              month: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            }).toUpperCase(); // Converts 'am'/'pm' to 'AM'/'PM'

            const color = getActivityColor(entry.activitytype);

            return (
              <div
                key={entry.id || index}
                className="flex w-full relative min-h-[170px]" // ms-[-100px] removed to ensure centering
                aria-label={`Timeline event: ${message}`}
              >
                {/* Left content column */}
                <div className="w-1/2 flex justify-end pr-8">
                  {isLeft && (
                    <article
                      className="bg-white rounded-3xl p-6 w-96 hover:shadow-xl transition-shadow duration-300"
                      role="region"
                      aria-live="polite"
                    >
                      <h3
                        className="text-lg font-semibold text-gray-900 mb-1"
                        style={{ color }}
                      >
                        Activity
                      </h3>
                      <p className="text-gray-700 text-base">{message}</p>
                      <footer className="mt-4 flex items-center space-x-3 text-sm text-gray-500">
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(performedBy)}`}
                          alt={`Avatar of ${performedBy}`}
                          className="w-7 h-7 rounded-full shadow-sm border border-gray-300"
                          loading="lazy"
                        />
                        <time dateTime={date.toISOString()}>{humanReadable}</time>
                      </footer>
                    </article>
                  )}
                </div>

                {/* Center timeline (Dot and Lines) */}
                <div className="flex flex-col items-center w-0 relative">
                  {/* Activity dot */}
                  <span
                    className="block rounded-full border-4 border-white shadow-md"
                    style={{
                      width: 24,
                      height: 24,
                      backgroundColor: color,
                      zIndex: 10,
                    }}
                    aria-hidden="true"
                  />
                  
                  {/* Horizontal connection line from dot to card */}
                  <span
                    className="absolute top-[10px]"
                    style={{
                      width: 25,
                      height: 4,
                      backgroundColor: color,
                      // Position based on which side the card is
                      ...(isLeft ? { right: "calc(100% + 12px)" } : { left: "calc(100% + 12px)" }),
                    }}
                    aria-hidden="true"
                  />
                  
                  {/* Vertical tracking line (between dots) */}
                  {!isLast && (
                    <div
                      className="w-1 rounded-full mt-2"
                      style={{
                        height: "100px", // Limits the line's height to create consistent spacing
                        backgroundColor: color,
                        opacity: 0.6,
                      }}
                      aria-hidden="true"
                    />
                  )}
                </div>

                {/* Right content column */}
                <div className="w-1/2 flex justify-start pl-8">
                  {!isLeft && (
                    <article
                      className="bg-white rounded-3xl shadow-lg p-6 w-96 hover:shadow-xl transition-shadow duration-300"
                      role="region"
                      aria-live="polite"
                    >
                      <h3
                        className="text-lg font-semibold text-gray-900 mb-1"
                        style={{ color }}
                      >
                        Activity
                      </h3>
                      <p className="text-gray-700 text-base">{message}</p>
                      <footer className="mt-4 flex items-center space-x-3 text-sm text-gray-500">
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(performedBy)}`}
                          alt={`Avatar of ${performedBy}`}
                          className="w-7 h-7 rounded-full shadow-sm border border-gray-300"
                          loading="lazy"
                        />
                        <time dateTime={date.toISOString()}>{humanReadable}</time>
                      </footer>
                    </article>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}