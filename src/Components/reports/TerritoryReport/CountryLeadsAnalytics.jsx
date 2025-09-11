import React, { useEffect, useState } from "react";
import axios from "axios";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { ENDPOINTS } from '../../../api/constraints';

ChartJS.register(ArcElement, Tooltip, Legend);

const CountryLeadsAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCountryLeads = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(ENDPOINTS.TERRITORY_LEADS, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const leadsByCountry = response.data?.data?.leadsPerCountry || {};
        setData(leadsByCountry);
      } catch (err) {
        console.error("Failed to fetch country leads:", err);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchCountryLeads();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col items-center justify-center h-[280px]">
        <div className="w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-sm text-gray-500 mt-2">Loading country data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col items-center justify-center h-[280px]">
        <div className="text-sm text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col items-center justify-center h-[280px]">
        <div className="text-sm text-gray-500">No country leads data available.</div>
      </div>
    );
  }

  const chartData = {
    labels: Object.keys(data),
    datasets: [
      {
        label: "Leads",
        data: Object.values(data),
        backgroundColor: [
          '#b3f23dff',
          '#4d834fff',
          '#f1c40f',
          '#3498db',
          '#e74c3c',
          '#9b59b6',
        ],
        borderColor: '#fff', 
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true, 
        position: 'right', 
        labels: {
          color: '#6B7280',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 4,
        padding: 10,
      }
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 h-[280px] flex flex-col">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Leads by Country</h3>
      <div className="flex-grow w-full h-[200px]">
        <Pie data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default CountryLeadsAnalytics;