import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { ENDPOINTS } from "../../api/constraints";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm p-4 ${className}`}>
      {children}
    </div>
  );
}

function CardContent({ children }) {
  return <div className="py-2">{children}</div>;
}

export default function SalesByStageReport() {
  const [tableData, setTableData] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`${ENDPOINTS.STAGE_LEADS}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Can't fetch stage leads data: ${response.status}`);
        }

        const { data } = await response.json();

        const stages = [
          "New",
          "Contacted",
          "Qualification",
          "Follow-up",
          "Negotiation",
          "Won"
        ];

        const transformedData = stages.map((stage) => {
          const stageData = data[stage] || {
            totalLeads: 0,
            totalValue: 0,
            avgDays: 0,
            leads: []
          };
          return {
            stage,
            opp: stageData.totalLeads,
            val: stageData.totalValue,
            deal:
              stageData.totalLeads > 0
                ? Math.round(stageData.totalValue / stageData.totalLeads)
                : 0,
            days: stageData.avgDays,
            conv:
              stage === "Won"
                ? 100
                : Math.round(
                    (stageData.totalLeads / (data.New?.totalLeads || 1)) * 100
                  ),
            win:
              stage === "Won"
                ? 100
                : Math.round(
                    (stageData.totalLeads / (data.New?.totalLeads || 1)) * 50
                  )
          };
        });

        setTableData(transformedData);

        setChartData({
          labels: transformedData.map((row) => row.stage),
          datasets: [
            {
              label: "Average Days in Stage",
              data: transformedData.map((row) => row.days),
              borderColor: "#0A84FF",
              backgroundColor: "#D6ECFF",
              fill: false,
              tension: 0.4
            }
          ]
        });
      } catch (error) {
        console.error("Error fetching report data:", error);
        setError("Failed to load sales stage data. Please try again later.");
      }
    };

    fetchData();
  }, []);

  const totalOpportunities = tableData.reduce((a, c) => a + c.opp, 0);
  const totalValue = tableData.reduce((a, c) => a + c.val, 0);
  const winRate =
    tableData.length > 0
      ? Math.round(
          ((tableData.find((row) => row.stage === "Won")?.opp || 0) /
            (totalOpportunities || 1)) *
            100
        )
      : 0;
  const weightedPipelineValue = Math.round(totalValue * (winRate / 100));
  const conversionNext = 85;
  const lostOpportunities =
    totalOpportunities -
    (tableData.find((row) => row.stage === "Won")?.opp || 0);

  if (error) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <h2 className="text-2xl font-bold mb-4">
          Opportunity Summary by Sales Stage
        </h2>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] text-gray-800">
      <div className="flex-1 p-6 md:p-10">
        <h2 className="text-3xl font-semibold mb-8 text-gray-900">
          Opportunity Summary by Sales Stage
        </h2>

        {/* Top Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-[#E6F0FF]">
              <CardContent>
                <p className="text-sm font-medium text-blue-800">
                  No Of Opportunities
                </p>
                <h3 className="text-2xl font-bold">{totalOpportunities}</h3>
              </CardContent>
            </Card>
            <Card className="bg-[#D1FAE5]">
              <CardContent>
                <p className="text-sm font-medium text-green-800">
                  Total Lead Value
                </p>
                <h3 className="text-2xl font-bold">₹{totalValue.toLocaleString()}</h3>
              </CardContent>
            </Card>
            <Card className="bg-[#FEF3C7]">
              <CardContent>
                <p className="text-sm font-medium text-yellow-800">
                  Pipeline Value
                </p>
                <h3 className="text-2xl font-bold">₹{weightedPipelineValue.toLocaleString()}</h3>
              </CardContent>
            </Card>
            <Card className="bg-[#E9D5FF]">
              <CardContent>
                <p className="text-sm font-medium text-purple-800">Win Rate</p>
                <h3 className="text-2xl font-bold">{winRate}%</h3>
              </CardContent>
            </Card>
            <Card className="bg-[#FCE7F3]">
              <CardContent>
                <p className="text-sm font-medium text-pink-800">
                  Conversion % (Next)
                </p>
                <h3 className="text-2xl font-bold">{conversionNext}%</h3>
              </CardContent>
            </Card>
            <Card className="bg-[#FECACA]">
              <CardContent>
                <p className="text-sm font-medium text-red-800">
                  Lost Opportunities
                </p>
                <h3 className="text-2xl font-bold">{lostOpportunities}</h3>
              </CardContent>
            </Card>
          </div>

          {/* Line Chart */}
          <Card className="col-span-1 h-[360px] overflow-hidden">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Average Age in Stage
            </h3>
            <div className="relative h-[260px]">
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                      labels: {
                        color: "#111",
                        font: { size: 12 },
                      },
                    },
                    tooltip: {
                      backgroundColor: "#1C1C1E",
                      titleColor: "#fff",
                      bodyColor: "#E5E7EB",
                      padding: 8,
                      borderColor: "#3B82F6",
                      borderWidth: 1,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: "Avg Days",
                        color: "#6B7280",
                      },
                      ticks: {
                        color: "#4B5563",
                      },
                      grid: {
                        drawBorder: false,
                        color: "#E5E7EB",
                      },
                    },
                    x: {
                      title: {
                        display: true,
                        text: "Sales Stage",
                        color: "#6B7280",
                      },
                      ticks: {
                        color: "#4B5563",
                      },
                      grid: {
                        display: false,
                      },
                    },
                  },
                }}
              />
            </div>
          </Card>
        </div>

        {/* Table */}
        <div className="mt-10 bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">
            Sales Pipeline Performance by Stage
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-700">
              <thead>
                <tr className="bg-gray-50 text-gray-500 border-b text-xs">
                  <th className="px-4 py-2">S.No</th>
                  <th className="px-4 py-2">Sales Stage</th>
                  <th className="px-4 py-2">Opportunities</th>
                  <th className="px-4 py-2">Total Value</th>
                  <th className="px-4 py-2">Avg. Deal Size</th>
                  <th className="px-4 py-2">Avg Days</th>
                  <th className="px-4 py-2">Conversion %</th>
                  <th className="px-4 py-2">Win %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tableData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-2">{idx + 1}</td>
                    <td className="px-4 py-2">{row.stage}</td>
                    <td className="px-4 py-2">{row.opp}</td>
                    <td className="px-4 py-2">₹{row.val.toLocaleString()}</td>
                    <td className="px-4 py-2">₹{row.deal.toLocaleString()}</td>
                    <td className="px-4 py-2">{row.days}</td>
                    <td className="px-4 py-2">{row.conv}%</td>
                    <td className="px-4 py-2">{row.win}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
