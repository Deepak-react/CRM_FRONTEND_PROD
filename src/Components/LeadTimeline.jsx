import React, { useEffect, useState } from "react";
import { ENDPOINTS } from "../api/constraints";

// Map activity types to colors for timeline dots and lines
const activityColors = {
  lead_created: "#28a745", // green
  follow_up: "#fd7e14", // orange
  proposal_sent: "#007bff", // blue
  comment_added: "#ffc107", // yellow
  assigned_to_user: "#6f42c1", // purple
  default: "#6c757d", // gray
};

const getActivityMessage = (activity) => {
  const { activitytype, data, user, performedbyid } = activity;
  const userName = user?.cFull_name || `User ${performedbyid}`;
  const rawMessage = data?.newStatus;

  const personalizeMessage = (msg) =>
    typeof msg === "string" ? msg.replace(`${performedbyid}`, userName) : msg;

  switch (activitytype) {
    case "lead_created":
      return personalizeMessage(rawMessage) || `Lead created by ${userName}.`;
    case "follow_up":
      return "Follow-up scheduled.";
    case "proposal_sent":
      return "Proposal sent to the client.";
    case "comment_added":
      return personalizeMessage(rawMessage) || `A comment was added by ${userName}.`;
    case "assigned_to_user":
      if (typeof rawMessage === "string" && rawMessage.includes("[object Object]")) {
        return `The lead was assigned by ${userName}.`;
      }
      return personalizeMessage(rawMessage) || `The lead was assigned by ${userName}.`;
    default:
      return personalizeMessage(rawMessage) ||
        activitytype.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
};

// Helper: Get color for a given activity type, fallback to default
const getActivityColor = (type) => activityColors[type] || activityColors.default;

export default function LeadTimeline({ leadId }) {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  const fetchActivityLog = async () => {
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
      const sortedHistory = data.sort(
        (a, b) => new Date(b.activitytimestamp) - new Date(a.activitytimestamp)
      );

      setHistory(sortedHistory);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(err.message || "Unable to fetch timeline data");
    }
  };

  useEffect(() => {
    if (leadId) fetchActivityLog();
  }, [leadId]);

  return (
    <div className="relative w-full h-[600px] overflow-y-auto px-6 py-10 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex flex-col items-center space-y-8 max-w-5xl mx-auto">

        {error && (
          <div className="text-red-700 bg-red-100 rounded-lg px-6 py-3 text-sm shadow-md w-full max-w-md text-center">
            {error}
          </div>
        )}

        {!error && history.length === 0 && (
          <div className="text-gray-500 text-sm italic">No activity found for this lead.</div>
        )}

        {history.map((entry, index) => {
          const isLeft = index % 2 === 0;
          const isLast = index === history.length - 1;
          const message = getActivityMessage(entry);

          const performedBy = entry.user?.cFull_name || `User ${entry.performedbyid || "System"}`;
          const date = new Date(entry.activitytimestamp);
          const humanReadable = date.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });

          const color = getActivityColor(entry.activitytype);

          return (
            <div
              key={entry.id || index}
              className="flex w-full relative min-h-[140px]"
              aria-label={`Timeline event: ${message}`}
            >
              {/* Left content */}
              <div className="w-1/2 flex justify-end pr-8">
                {isLeft && (
                  <article
                    className="bg-white border border-gray-200 rounded-3xl shadow-lg p-6 w-96 hover:shadow-xl transition-shadow duration-300"
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

              {/* Center timeline */}
              <div className="flex flex-col items-center w-0 relative">
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
                <span
                  className="absolute top-[10px]"
                  style={{
                    width: 48,
                    height: 4,
                    backgroundColor: color,
                    ...(isLeft ? { right: "calc(100% + 12px)" } : { left: "calc(100% + 12px)" }),
                  }}
                />
                {!isLast && (
                  <div className="flex flex-col items-center mt-2 space-y-1">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <span
                        key={i}
                        className="w-1 h-5 rounded-full opacity-60"
                        style={{ backgroundColor: color }}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Right content */}
              <div className="w-1/2 flex justify-start pl-8">
                {!isLeft && (
                  <article
                    className="bg-white border border-gray-200 rounded-3xl shadow-lg p-6 w-96 hover:shadow-xl transition-shadow duration-300"
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
  );
}
