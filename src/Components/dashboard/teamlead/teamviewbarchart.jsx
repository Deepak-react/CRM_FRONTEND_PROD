import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Tooltip Component
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-300 px-2 py-1 rounded text-sm shadow">
        {payload[0].value} leads
      </div>
    );
  }
  return null;
};

export default function LeadManagementCard({ leads, team_members }) {
  const [showTeam, setShowTeam] = useState(false);

  // Count leads by user
  const userLeadCounts = leads.reduce((acc, lead) => {
    const userName = lead.user?.cFull_name || 'Unknown';
    acc[userName] = (acc[userName] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(userLeadCounts).map(([name, count]) => ({
    name,
    leads: count,
  }));

const teamList = [...new Set(team_members) ].map(name => ({ name }));

  return (
    <div className="relative w-full h-80 max-w-full mx-auto [perspective:1000px]">
      <div
        className={`relative w-full h-full duration-700 transform-style-preserve-3d transition-transform ${
          showTeam ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        {/* Front: Lead Chart */}
        <div className="absolute w-full h-full bg-white rounded-md p-4 backface-hidden">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-700">Lead Management</h2>
            <button
              className="text-sm border px-3 py-1 rounded-md border-gray-300 text-gray-600 hover:bg-gray-100"
              onClick={() => setShowTeam(true)}
            >
              My Team
            </button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="leads"
                fill="#1f2937"
                radius={[4, 4, 0, 0]}
                barSize={15}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Back: Team View */}
        <div className="absolute w-full h-full bg-white rounded-md p-4 backface-hidden [transform:rotateY(180deg)]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-700">My Team</h2>
            <button
              className="text-sm border px-3 py-1 rounded-md border-gray-300 text-gray-600 hover:bg-gray-100"
              onClick={() => setShowTeam(false)}
            >
              Back
            </button>
          </div>
        <div className="max-h-60 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
  {teamList.map((member, index) => (
    <div
      key={index}
      className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100"
    >
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-semibold">
          {member.name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">{member.name}</p>
          <p className="text-xs text-gray-500">Team Member</p>
        </div>
      </div>
    </div>
  ))}
</div>
        </div>
      </div>
    </div>
  );
}