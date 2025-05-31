import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { ENDPOINTS } from "../../api/constraints";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function LostLeadReports() {
  const [listData, setListData] = useState({});
  const [loading, setLoading] = useState(true);
  const [barData, setBarData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`${ENDPOINTS.LOST_LEADS}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          console.log("Can't fetch lost leads data", response);
          return;
        }

        const data = await response.json();
        setListData(data.data);

        const wonData = data.data.won_details || [];
        const lostData = data.data.lead_details || [];

        const wonByMonth = {};
        const lostByMonth = {};

        const getMonthName = (dateStr) => {
          const date = new Date(dateStr);
          return date.toLocaleString("default", { month: "short" });
        };

        for (const won of wonData) {
          if (won.created_at) {
            const month = getMonthName(won.created_at);
            wonByMonth[month] = (wonByMonth[month] || 0) + won.value;
          }
        }

        for (const lost of lostData) {
          if (lost.created_at) {
            const month = getMonthName(lost.created_at);
            lostByMonth[month] = (lostByMonth[month] || 0) + lost.value;
          }
        }

        const allMonths = Array.from(
          new Set([...Object.keys(wonByMonth), ...Object.keys(lostByMonth)])
        ).sort((a, b) => new Date(`2020-${a}-01`) - new Date(`2020-${b}-01`));

        const chartData = {
          labels: allMonths,
          datasets: [
            {
              label: "Lost Leads Amount",
              data: allMonths.map((month) => lostByMonth[month] || 0),
              backgroundColor: "#ff3b30",
            },
            {
              label: "Won Leads Amount",
              data: allMonths.map((month) => wonByMonth[month] || 0),
              backgroundColor: "#34c759",
            },
          ],
        };

        setBarData(chartData);
      } catch (error) {
        console.error("Error fetching report data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const cardData = [
    { title: "Total Counts", value: `${listData.totalCount || 0}` },
    { title: "Lost Percentage", value: `${listData.lostPercentage || 0} %` },
    { title: "Lost from Leads", value: `${listData.lostFromLeads || 0}` },
    { title: "Lost from Deals", value: `${listData.lostFromDeals || 0}` },
  ];

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: { stacked: false },
      y: { beginAtZero: true },
    },
  };

  const lead_details = listData.lead_details || [];

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 24,
        background: "linear-gradient(to bottom right, #f4f5f7, #e9ecf3)",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      {/* Cards and Chart Side-by-Side */}
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        {/* Left Side - Cards */}
       {/* Left Side - Card Container Box */}
<div
  style={{
    flex: 1,
    background: "white",
    borderRadius: 20,
    padding: 24,
    boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  }}
>
  {cardData.map((card, idx) => (
    <div
      key={idx}
      style={{
        background: "rgba(255, 255, 255, 0.75)",
        backdropFilter: "blur(12px)",
        borderRadius: 16,
        padding: "20px 16px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: 100,
        transition: "transform 0.2s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: "#333",
          opacity: 0.75,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {card.title}
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: "#111",
          marginTop: 6,
        }}
      >
        {card.value}
      </div>
    </div>
  ))}
</div>

        {/* Right Side - Bar Chart */}
        <div
          style={{
            flex: 1,
            background: "white",
            borderRadius: 20,
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            padding: 24,
            minWidth: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {barData ? (
            <Bar data={barData} options={barOptions} />
          ) : (
            <p>Loading Chart...</p>
          )}
        </div>
      </div>

      {/* Lost Leads Table */}
      <div
        style={{
          background: "white",
          borderRadius: 20,
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          padding: 24,
        }}
      >
        <h3 style={{ marginBottom: 16, fontSize: 20, fontWeight: 600, color: "#1c1c1e" }}>
          Lost Leads
        </h3>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="w-full border-collapse text-sm text-gray-800">
              <thead>
                <tr style={{ backgroundColor: "#f2f2f7", textAlign: "left" }}>
                  {["Lead Name", "Lead Owner", "Service", "Value", "Reason"].map((header) => (
                    <th
                      key={header}
                      className={`px-4 py-3 font-medium ${
                        header === "Value" ? "text-right" : "text-left"
                      }`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lead_details.length > 0 ? (
                  lead_details.map((lead, index) => (
                    <tr
                      key={index}
                      style={{
                        borderBottom: "1px solid #ececec",
                        transition: "background 0.3s",
                      }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">{lead.lead_name}</td>
                      <td className="px-4 py-3">{lead.lead_owner}</td>
                      <td className="px-4 py-3">{lead.service}</td>
                      <td className="px-4 py-3 text-right font-semibold text-blue-600">
                        ₹{lead.value}
                      </td>
                      <td className="px-4 py-3 text-red-500 font-medium">{lead.reason}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-500">
                      No lost leads found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
