import { useState, useEffect } from "react";
import { ENDPOINTS } from "../../api/constraints";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import moment from "moment";

export default function SalesPipelineAnalysis() {
  const [pipelineData, setPipelineData] = useState(null);
  const [filter, setFilter] = useState("month");
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token not found");

        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        const { company_id } = JSON.parse(jsonPayload);
        if (!company_id) throw new Error("Company ID missing");

        const res = await fetch(
          `${ENDPOINTS.SALES_PIPLINE_ANALYSIS}/${company_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) throw new Error("API failed");

        const result = await res.json();
        setPipelineData(result);
        setLoading(false);
      } catch (e) {
        console.error("Error fetching sales pipeline data:", e.message);
        setError(e.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getDateLabelsForFilter = (filter) => {
    const labels = [];
    const today = moment();

    if (filter === "week") {
      const startOfWeek = today.startOf('week');
      for (let i = 0; i < 7; i++) {
        labels.push(startOfWeek.clone().add(i, 'days').format("ddd"));
      }
    } else if (filter === "month") {
      const daysInMonth = today.daysInMonth();
      for (let d = 1; d <= daysInMonth; d++) {
        labels.push(d.toString());
      }
    } else if (filter === "year") {
      labels.push(
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      );
    }
    return labels;
  };

  const generateChartData = () => {
    if (!pipelineData?.leadsByDate?.[filter]) return [];

    const leadData = pipelineData.leadsByDate[filter] || [];
    const labels = getDateLabelsForFilter(filter);
    const grouped = {};

    // Initialize with all possible labels
    labels.forEach((label) => {
      grouped[label] = { 
        label, 
        Active: 0, 
        Won: 0, 
        Lost: 0 
      };
    });

    // Process each lead
    leadData.forEach((lead) => {
      if (!lead.dcreated_dt) return;

      try {
        const date = moment(lead.dcreated_dt);
        let label = "";

        if (filter === "week") {
          label = date.format("ddd");
        } else if (filter === "month") {
          label = date.date().toString();
        } else if (filter === "year") {
          label = date.format("MMM");
        }

        if (grouped[label]) {
          if (lead.bactive && !lead.bisConverted) grouped[label].Active += 1;
          else if (lead.bisConverted) grouped[label].Won += 1;
          else if (!lead.bactive) grouped[label].Lost += 1;
        }
      } catch (e) {
        console.error("Error processing lead:", lead, e);
      }
    });

    return Object.values(grouped);
  };

  useEffect(() => {
    if (pipelineData) {
      setChartData(generateChartData());
    }
  }, [filter, pipelineData]);

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  if (!pipelineData) return <div className="p-6 text-gray-500">No data available</div>;

  const {
    activeUnconvertedLeads = 0,
    avgDealRatio = 0,
    convertionRatio = 0,
    expectedRevenueThisMonth = 0,
    leadsByDate = {},
  } = pipelineData;

  const cardData = [
    {
      title: "Total Pipeline Value",
      value: `₹${expectedRevenueThisMonth.toLocaleString("en-IN")}`,
    },
    {
      title: "No. Of Open Opportunities",
      value: activeUnconvertedLeads,
    },
    {
      title: "Won Ratio",
      value: `${Math.round(avgDealRatio)}%`,
    },
    {
      title: "Pipeline Coverage Ratio",
      value: `${convertionRatio.toFixed(2)}%`,
    },
  ];

  const totalProjectValue = leadsByDate?.[filter]
    ?.filter((lead) => lead.bactive && !lead.bisConverted)
    .reduce((sum, lead) => sum + (lead.iproject_value || 0), 0) || 0;

  const achievedPercentage = expectedRevenueThisMonth > 0
    ? Math.min(
        ((totalProjectValue / expectedRevenueThisMonth) * 100).toFixed(2),
        100
      )
    : 0;

  const pieData = [
    { name: "Achieved", value: parseFloat(achievedPercentage) },
    { name: "Remaining", value: parseFloat((100 - achievedPercentage).toFixed(2)) },
  ];

  const COLORS = ["#1B5E20", "#D9D9D9"];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
        <button
          onClick={() => navigate("/reportpage")}
          style={{
            color: "#6B7280",
            padding: "8px",
            borderRadius: "9999px",
            marginRight: "16px",
            fontSize: "24px",
            cursor: "pointer",
            background: "transparent",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background-color 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#E5E7EB")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          aria-label="Back to reports"
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-3xl font-bold mb-6 text-gray-800"
          style={{ margin: 0 }}>
          Sales Pipeline Analysis
        </h1>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {cardData.map((card, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition"
          >
            <div className="text-gray-500 text-sm">{card.title}</div>
            <div className="text-2xl font-bold text-gray-800 mt-2">
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">
              Sales Pipeline Performance
            </h2>
            <select
              className="border px-3 py-1 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="year">Year</option>
              <option value="month">Month</option>
              <option value="week">Week</option>
            </select>
          </div>
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData} 
                margin={{ top: 20, right: 30, left: 30, bottom: 15 }}
              >
                <XAxis
                  dataKey="label"
                  label={{
                    value: "Time Period",
                    position: "bottom",
                    offset: 25,
                    style: { fontSize: '14px', fill: '#555', fontWeight: 'bold' }
                  }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  label={{
                    value: "Number of Deals",
                    angle: -90,
                    position: "left",
                    offset: 0,
                    style: { fontSize: '14px', fill: '#555', fontWeight: 'bold' }
                  }}
                  tickLine={false}
                />
                <Tooltip />
                <Legend />
                <Bar dataKey="Active" stackId="a" fill="#0D47A1" name="Active" />
                <Bar dataKey="Won" stackId="a" fill="#61AAE5" name="Won" />
                <Bar dataKey="Lost" stackId="a" fill="#5D8FBF" name="Lost" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Expected Revenue Achievement
            </h2>
            <div className="relative w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value}%`, "Percentage"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="flex flex-col items-center mt-4">
            <div className="text-xl font-bold text-gray-800">
              ₹{expectedRevenueThisMonth.toLocaleString("en-IN")}
            </div>
            <div className="text-xs text-green-600">
              Achieved: {achievedPercentage}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              <span className="text-red-600">*</span>For this month
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}