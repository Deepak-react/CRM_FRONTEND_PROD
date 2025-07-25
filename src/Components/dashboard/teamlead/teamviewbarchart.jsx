import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { jwtDecode } from 'jwt-decode';
import { ENDPOINTS } from '../../../api/constraints';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-300 px-2 py-1 rounded text-sm shadow">
        <p className="font-semibold">{payload[0].payload.name}</p>
        <p>{payload[0].value} leads</p>
      </div>
    );
  }
  return null;
};

export default function LeadManagementCard() {
  const [showTeam, setShowTeam] = useState(false);
  const [showActiveMembers, setShowActiveMembers] = useState(false);
  const [showInactiveMembers, setShowInactiveMembers] = useState(false);
  const [leadsData, setLeadsData] = useState([]);
  const [teamMembersData, setTeamMembersData] = useState([]);
  const [childSubordinates, setChildSubordinates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentToken, setCurrentToken] = useState(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      //console.log("Token:", token);
      if (!token) throw new Error("Token not found.");
      const decoded = jwtDecode(token);
      if (!decoded.user_id) throw new Error("User ID missing in token.");
      setCurrentUserId(decoded.user_id);
      setCurrentToken(token);
    } catch (e) {
      setError(`Authentication error: ${e.message}`);
      setLoading(false);
    }
  }, []);

  const fetchLeadsAndTeamData = useCallback(async () => {
    if (!currentUserId || !currentToken) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${ENDPOINTS.MANAGER_REMINDER}/${currentUserId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error((await response.json()).message || "API error");

      const result = await response.json();

      setLeadsData(result.details?.lead || []);
      setTeamMembersData(result.details?.subordinates || []);
      setChildSubordinates(result.details?.childSubordinateIds || []);
console.log("Subordinates:", result.details?.subordinates);
console.log("Child Subordinates:", result.details?.childSubordinateIds);

    } catch (err) {
      setError(`Failed to fetch data: ${err.message}`);
      setLeadsData([]);
      setTeamMembersData([]);
      setChildSubordinates([]);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, currentToken]);

  useEffect(() => {
    fetchLeadsAndTeamData();
  }, [fetchLeadsAndTeamData]);

  const userLeadCountsById = leadsData.reduce((acc, lead) => {
    if (lead.bactive === true && lead.clead_owner) {
      acc[lead.clead_owner] = (acc[lead.clead_owner] || 0) + 1;
    }
    return acc;
  }, {});

  const chartData = teamMembersData
    .filter(member => member.bactive === true && userLeadCountsById[member.iUser_id] > 0)
    .map(member => ({
      name: member.cFull_name,
      leads: userLeadCountsById[member.iUser_id] || 0,
    }))
    .sort((a, b) => b.leads - a.leads);

  const filteredTeamList = teamMembersData
    .filter(member => {
      if (showActiveMembers) return member.bactive === true;
      if (showInactiveMembers) return member.bactive === false;
      return true;
    })
    .sort((a, b) => a.cFull_name.localeCompare(b.cFull_name));

  const handleShowAllMembers = () => {
    setShowActiveMembers(false);
    setShowInactiveMembers(false);
  };

  const handleShowActiveMembers = () => {
    setShowActiveMembers(true);
    setShowInactiveMembers(false);
  };

  const handleShowInactiveMembers = () => {
    setShowActiveMembers(false);
    setShowInactiveMembers(true);
  };

  if (loading) return <div className="flex justify-center items-center h-full text-gray-700">Loading data...</div>;
  if (error) return <div className="flex justify-center items-center h-full text-red-600 font-medium">{error}</div>;

  return (
    <div className="relative w-full h-80 max-w-full mx-auto [perspective:1000px]">
      <div className={`relative w-full h-full duration-700 transform-style-preserve-3d transition-transform ${showTeam ? '[transform:rotateY(180deg)]' : ''}`}>

        {/* Front View */}
        <div className="absolute w-full h-full bg-white rounded-md p-4 backface-hidden flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-700">Active Lead Distribution</h2>
            <button className="text-sm border px-3 py-1 rounded-md border-gray-300 text-gray-600 hover:bg-gray-100" onClick={() => setShowTeam(true)}>My Team</button>
          </div>
          {chartData.length > 0 ? (
            <div className="flex-grow flex items-end">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} label={{ value: 'Leads', angle: -90, position: 'insideLeft' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="leads" fill="#1f2937" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-10">No active lead data available for chart.</div>
          )}
        </div>

        {/* Back View */}
        <div className="absolute w-full h-full bg-white rounded-md p-4 backface-hidden [transform:rotateY(180deg)]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-700">Team Members</h2>
            <div className="flex space-x-2">
              <button className={`text-sm border px-3 py-1 rounded-md ${!showActiveMembers && !showInactiveMembers ? 'bg-blue-500 text-white' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`} onClick={handleShowAllMembers}>All</button>
              <button className={`text-sm border px-3 py-1 rounded-md ${showActiveMembers ? 'bg-green-500 text-white' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`} onClick={handleShowActiveMembers}>Active</button>
              <button className={`text-sm border px-3 py-1 rounded-md ${showInactiveMembers ? 'bg-red-500 text-white' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`} onClick={handleShowInactiveMembers}>Inactive</button>
              <button className="text-sm border px-3 py-1 rounded-md border-gray-300 text-gray-600 hover:bg-gray-100" onClick={() => setShowTeam(false)}>Back</button>
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
            {filteredTeamList.length > 0 ? (
              filteredTeamList.map((member) => {
                const subTeam = childSubordinates.filter(child => child.reports_to === member.iUser_id);
                return (
                  <div key={member.iUser_id} className="flex flex-col bg-gray-50 rounded-md p-3 hover:bg-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-semibold">
                          {member.cFull_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{member.cFull_name}</p>
                          <p className="text-xs text-gray-500">{member.bactive ? 'Active' : 'Inactive'} Team Member</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-600">{userLeadCountsById[member.iUser_id] || 0} Leads</span>
                    </div>
                    {subTeam.length > 0 && (
                      <div className="ml-10 mt-1 space-y-1">
                        {subTeam.map(child => (
                          <p key={child.iUser_id} className="text-xs text-gray-500">Manages: {child.cFull_name}</p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-500 py-10">
                No {showActiveMembers ? 'active' : showInactiveMembers ? 'inactive' : ''} team members found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
// } from 'recharts';
// import { jwtDecode } from 'jwt-decode';
// import { ENDPOINTS } from '../../../api/constraints';

// const CustomTooltip = ({ active, payload }) => {
//   if (active && payload && payload.length) {
//     return (
//       <div className="bg-white border border-gray-300 px-2 py-1 rounded text-sm shadow">
//         <p className="font-semibold">{payload[0].payload.name}</p>
//         <p>{payload[0].value} leads</p>
//       </div>
//     );
//   }
//   return null;
// };

// export default function LeadManagementCard() {
//   const [showTeam, setShowTeam] = useState(false);
//   const [showActiveMembers, setShowActiveMembers] = useState(false);
//   const [showInactiveMembers, setShowInactiveMembers] = useState(false);
//   const [leadsData, setLeadsData] = useState([]);
//   const [teamMembersData, setTeamMembersData] = useState([]);
//   const [childSubordinates, setChildSubordinates] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [currentUserId, setCurrentUserId] = useState(null);
//   const [currentToken, setCurrentToken] = useState(null);

//   useEffect(() => {
//     let extractedUserId = null;
//     let tokenFromStorage = null;

//     try {
//       tokenFromStorage = localStorage.getItem('token');
//       if (tokenFromStorage) {
//         const decodedToken = jwtDecode(tokenFromStorage);
//         extractedUserId = decodedToken.user_id;
//         if (!extractedUserId) throw new Error("User ID not found in token.");
//       } else {
//         throw new Error("Token not found. Please log in.");
//       }
//     } catch (e) {
//       setError(`Authentication error: ${e.message}`);
//       setLoading(false);
//       return;
//     }

//     if (extractedUserId && tokenFromStorage) {
//       setCurrentUserId(extractedUserId);
//       setCurrentToken(tokenFromStorage);
//     } else {
//       setError("Failed to obtain user ID or token.");
//       setLoading(false);
//     }
//   }, []);

//   const fetchLeadsAndTeamData = useCallback(async () => {
//     if (!currentUserId || !currentToken) {
//       setLoading(false);
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       const response = await fetch(`${ENDPOINTS.MANAGER_REMINDER}/${currentUserId}`, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${currentToken}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
//         throw new Error(errorData.message || "API error");
//       }

//       const result = await response.json();
//       setLeadsData(result.details?.lead || []);
//       setTeamMembersData(result.details?.subordinates || []);
//       setChildSubordinates(result.details?.childSubordinateIds || []);
//       console.log("Subordinates:", result.details?.subordinates);
//       console.log("Child Subordinates:", result.details?.childSubordinateIds);

//     } catch (err) {
//       setError(`Failed to fetch data: ${err.message}`);
//       setLeadsData([]);
//       setTeamMembersData([]);
//       setChildSubordinates([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [currentUserId, currentToken]);

//   useEffect(() => {
//     fetchLeadsAndTeamData();
//   }, [fetchLeadsAndTeamData]);

//   const userLeadCountsById = leadsData.reduce((acc, lead) => {
//     if (lead.bactive === true && lead.clead_owner) {
//       acc[lead.clead_owner] = (acc[lead.clead_owner] || 0) + 1;
//     }
//     return acc;
//   }, {});

//   const chartData = teamMembersData
//     .filter(member => member.bactive === true && userLeadCountsById[member.iUser_id] > 0)
//     .map(member => ({
//       name: member.cFull_name,
//       leads: userLeadCountsById[member.iUser_id] || 0,
//     }))
//     .sort((a, b) => b.leads - a.leads);

//   const filteredTeamList = teamMembersData
//     .filter(member => {
//       if (showActiveMembers) return member.bactive === true;
//       if (showInactiveMembers) return member.bactive === false;
//       return true;
//     })
//     .sort((a, b) => a.cFull_name.localeCompare(b.cFull_name));

//   const handleShowAllMembers = () => {
//     setShowActiveMembers(false);
//     setShowInactiveMembers(false);
//   };

//   const handleShowActiveMembers = () => {
//     setShowActiveMembers(true);
//     setShowInactiveMembers(false);
//   };

//   const handleShowInactiveMembers = () => {
//     setShowActiveMembers(false);
//     setShowInactiveMembers(true);
//   };

//   if (loading) {
//     return <div className="flex justify-center items-center h-full text-gray-700">Loading data...</div>;
//   }

//   if (error) {
//     return <div className="flex justify-center items-center h-full text-red-600 font-medium">{error}</div>;
//   }

//   return (
//     <div className="relative w-full h-80 max-w-full mx-auto [perspective:1000px]">
//       <div
//         className={`relative w-full h-full duration-700 transform-style-preserve-3d transition-transform ${showTeam ? '[transform:rotateY(180deg)]' : ''}`}
//       >
//         {/* Front: Lead Chart View */}
//         <div className="absolute w-full h-full bg-white rounded-md p-4 backface-hidden flex flex-col">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="font-semibold text-gray-700">Active Lead Distribution</h2>
//             <button
//               className="text-sm border px-3 py-1 rounded-md border-gray-300 text-gray-600 hover:bg-gray-100"
//               onClick={() => setShowTeam(true)}
//             >
//               My Team
//             </button>
//           </div>
//           {chartData.length > 0 ? (
//             <div className="flex-grow flex items-end">
//               <ResponsiveContainer width="100%" height={180}>
//                 <BarChart
//                   data={chartData}
//                   margin={{ top: 10, right: 20, left: 0, bottom: 30 }}
//                 >
//                   <XAxis
//                     dataKey="name"
//                     tick={{ fontSize: 10 }}
//                     interval={0}
//                     angle={-30}
//                     textAnchor="end"
//                   />
//                   <YAxis
//                     allowDecimals={false}
//                     tick={{ fontSize: 10 }}
//                     label={{ value: 'Leads', angle: -90, position: 'insideLeft' }}
//                   />
//                   <Tooltip content={<CustomTooltip />} />
//                   <Bar dataKey="leads" fill="#1f2937" radius={[4, 4, 0, 0]} barSize={20} />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           ) : (
//             <div className="text-center text-gray-500 py-10">No active lead data available for chart.</div>
//           )}
//         </div>

//         {/* Back: Team Members View */}
//         <div className="absolute w-full h-full bg-white rounded-md p-4 backface-hidden [transform:rotateY(180deg)]">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="font-semibold text-gray-700">Team Members</h2>
//             <div className="flex space-x-2">
//               <button
//                 className={`text-sm border px-3 py-1 rounded-md ${
//                   !showActiveMembers && !showInactiveMembers
//                     ? 'bg-blue-500 text-white'
//                     : 'border-gray-300 text-gray-600 hover:bg-gray-100'
//                 }`}
//                 onClick={handleShowAllMembers}
//               >
//                 All
//               </button>
//               <button
//                 className={`text-sm border px-3 py-1 rounded-md ${
//                   showActiveMembers
//                     ? 'bg-green-500 text-white'
//                     : 'border-gray-300 text-gray-600 hover:bg-gray-100'
//                 }`}
//                 onClick={handleShowActiveMembers}
//               >
//                 Active
//               </button>
//               <button
//                 className={`text-sm border px-3 py-1 rounded-md ${
//                   showInactiveMembers
//                     ? 'bg-red-500 text-white'
//                     : 'border-gray-300 text-gray-600 hover:bg-gray-100'
//                 }`}
//                 onClick={handleShowInactiveMembers}
//               >
//                 Inactive
//               </button>
//               <button
//                 className="text-sm border px-3 py-1 rounded-md border-gray-300 text-gray-600 hover:bg-gray-100"
//                 onClick={() => setShowTeam(false)}
//               >
//                 Back
//               </button>
//             </div>
//           </div>
//           <div className="max-h-60 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
//             {filteredTeamList.length > 0 ? (
//               filteredTeamList.map((member) => {
//                 const subTeam = childSubordinates.filter(
//                   (child) => child.reports_to === member.iUser_id
//                 );
//                 return (
//                   <div
//                     key={member.iUser_id}
//                     className="flex flex-col space-y-1 p-3 bg-gray-50 rounded-md hover:bg-gray-100"
//                   >
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center space-x-3">
//                         <div className="w-9 h-9 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-semibold">
//                           {member.cFull_name.charAt(0).toUpperCase()}
//                         </div>
//                         <div>
//                           <p className="text-sm font-medium text-gray-800">{member.cFull_name}</p>
//                           <p className="text-xs text-gray-500">
//                             {member.bactive ? 'Active' : 'Inactive'} Team Member
//                           </p>
//                         </div>
//                       </div>
//                       <span className="text-sm text-gray-600">
//                         {userLeadCountsById[member.iUser_id] || 0} Leads
//                       </span>
//                     </div>

//                     {subTeam.length > 0 && (
//                       <div className="text-xs text-gray-600 pl-12">
//                         <span className="font-medium text-gray-700">Manages: </span>
//                         {subTeam.map((child) => child.cFull_name).join(', ')}
//                       </div>
//                     )}
//                   </div>
//                 );
//               })
//             ) : (
//               <div className="text-center text-gray-500 py-10">
//                 No {showActiveMembers ? 'active' : showInactiveMembers ? 'inactive' : ''} team members found.
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
// } from 'recharts';
// import { jwtDecode } from 'jwt-decode';
// import { ENDPOINTS } from '../../../api/constraints';

// const CustomTooltip = ({ active, payload }) => {
//   if (active && payload && payload.length) {
//     return (
//       <div className="bg-white border border-gray-300 px-2 py-1 rounded text-sm shadow">
//         <p className="font-semibold">{payload[0].payload.name}</p>
//         <p>{payload[0].value} leads</p>
//       </div>
//     );
//   }
//   return null;
// };

// export default function LeadManagementCard() {
//   const [showTeam, setShowTeam] = useState(false);
//   const [showActiveMembers, setShowActiveMembers] = useState(false);
//   const [showInactiveMembers, setShowInactiveMembers] = useState(false);
//   const [leadsData, setLeadsData] = useState([]); 
//   const [teamMembersData, setTeamMembersData] = useState([]); 
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [currentUserId, setCurrentUserId] = useState(null);
//   const [currentToken, setCurrentToken] = useState(null);

//   useEffect(() => {
//     let extractedUserId = null;
//     let tokenFromStorage = null;

//     try {
//       tokenFromStorage = localStorage.getItem('token');
//       if (tokenFromStorage) {
//         const decodedToken = jwtDecode(tokenFromStorage);
//         extractedUserId = decodedToken.user_id;
//         if (!extractedUserId) {
//           throw new Error("User ID not found in token.");
//         }
//       } else {
//         throw new Error("Token not found. Please log in.");
//       }
//     } catch (e) {
//       setError(`Authentication error: ${e.message}`);
//       setLoading(false);
//       return;
//     }

//     if (extractedUserId && tokenFromStorage) {
//       setCurrentUserId(extractedUserId);
//       setCurrentToken(tokenFromStorage);
//     } else {
//       setError("Failed to obtain user ID or token.");
//       setLoading(false);
//     }
//   }, []); 
  
  
//   const fetchLeadsAndTeamData = useCallback(async () => {  
    
//     if (!currentUserId || !currentToken) {
//       setLoading(false);
//       return;
//     }

//     setLoading(true);
//     setError(null);
    
//     try {
//       const response = await fetch(`${ENDPOINTS.MANAGER_REMINDER}/${currentUserId}`, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${currentToken}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
//         throw new Error(errorData.message || "API error");
//       }

//       const result = await response.json();
//       // console.log("API response (TEAM_LEAD):", result); 

//       setLeadsData(result.details?.lead || []);

//       setTeamMembersData(result.details?.subordinates || []);

//     } catch (err) {
//       setError(`Failed to fetch data: ${err.message}`);
//       setLeadsData([]); 
//       setTeamMembersData([]); 
//     } finally {
//       setLoading(false); 
//     }
//   }, [currentUserId, currentToken]);

//   useEffect(() => {
//     fetchLeadsAndTeamData();
//   }, [fetchLeadsAndTeamData]); 

//   const userLeadCountsById = leadsData.reduce((acc, lead) => {
//     if (lead.bactive === true && lead.clead_owner) { 
//       acc[lead.clead_owner] = (acc[lead.clead_owner] || 0) + 1;
//     }
//     return acc;
//   }, {});
  
//   const chartData = teamMembersData
//     //.filter(member => userLeadCountsById[member.iUser_id] > 0) 
//     .filter(member => member.bactive === true && userLeadCountsById[member.iUser_id] > 0)
//     .map(member => ({
//       name: member.cFull_name,
//       leads: userLeadCountsById[member.iUser_id] || 0,
//     }))
//     .sort((a, b) => b.leads - a.leads); 

//   const filteredTeamList = teamMembersData
//     .filter(member => {
//       if (showActiveMembers) {
//         return member.bactive === true; 
//       }
//       if (showInactiveMembers) {
//         return member.bactive === false; 
//       }
//       return true; 
//     })
//     .sort((a, b) => a.cFull_name.localeCompare(b.cFull_name)); 

//   const handleShowAllMembers = () => {
//     setShowActiveMembers(false);
//     setShowInactiveMembers(false);
//   };

//   const handleShowActiveMembers = () => {
//     setShowActiveMembers(true);
//     setShowInactiveMembers(false);
//   };

//   const handleShowInactiveMembers = () => {
//     setShowActiveMembers(false);
//     setShowInactiveMembers(true);
//   };

//   if (loading) {
//     return <div className="flex justify-center items-center h-full text-gray-700">Loading data...</div>;
//   }

//   if (error) {
//     return <div className="flex justify-center items-center h-full text-red-600 font-medium">{error}</div>;
//   }

//   return (
//     <div className="relative w-full h-80 max-w-full mx-auto [perspective:1000px]">
//       <div
//         className={`relative w-full h-full duration-700 transform-style-preserve-3d transition-transform ${
//           showTeam ? '[transform:rotateY(180deg)]' : ''
//         }`}
//       >
//         {/* Front: Lead Chart View */}
//         <div className="absolute w-full h-full bg-white rounded-md p-4 backface-hidden flex flex-col">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="font-semibold text-gray-700">Active Lead Distribution</h2>
//             <button
//               className="text-sm border px-3 py-1 rounded-md border-gray-300 text-gray-600 hover:bg-gray-100"
//               onClick={() => setShowTeam(true)} 
//             >
//               My Team
//             </button>
//           </div>
//           {chartData.length > 0 ? (
//             <div className="flex-grow flex items-end">
//               <ResponsiveContainer width="100%" height={180}>
//                 <BarChart
//                   data={chartData}
//                   margin={{ top: 10, right: 20, left: 0, bottom: 30 }}
//                 >
//                   <XAxis
//                     dataKey="name"
//                     tick={{ fontSize: 10 }}
//                     interval={0}
//                     angle={-30}
//                     textAnchor="end"
//                   />
//                   <YAxis
//                     allowDecimals={false}
//                     tick={{ fontSize: 10 }}
//                     label={{ value: 'Leads', angle: -90, position: 'insideLeft' }}
//                   />
//                   <Tooltip content={<CustomTooltip />} />
//                   <Bar dataKey="leads" fill="#1f2937" radius={[4, 4, 0, 0]} barSize={20} />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           ) : (
//             <div className="text-center text-gray-500 py-10">No active lead data available for chart.</div>
//           )}
//         </div>

//         {/* Back: Team Members View */}
//         <div className="absolute w-full h-full bg-white rounded-md p-4 backface-hidden [transform:rotateY(180deg)]">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="font-semibold text-gray-700">Team Members</h2>
//             <div className="flex space-x-2">
//               {/* Filter buttons */}
//               <button
//                 className={`text-sm border px-3 py-1 rounded-md ${
//                   !showActiveMembers && !showInactiveMembers 
//                     ? 'bg-blue-500 text-white'
//                     : 'border-gray-300 text-gray-600 hover:bg-gray-100'
//                 }`}
//                 onClick={handleShowAllMembers}
//               >
//                 All
//               </button>
//               <button
//                 className={`text-sm border px-3 py-1 rounded-md ${
//                   showActiveMembers 
//                     ? 'bg-green-500 text-white'
//                     : 'border-gray-300 text-gray-600 hover:bg-gray-100'
//                 }`}
//                 onClick={handleShowActiveMembers}
//               >
//                 Active
//               </button>
//               <button
//                 className={`text-sm border px-3 py-1 rounded-md ${
//                   showInactiveMembers 
//                     ? 'bg-red-500 text-white'
//                     : 'border-gray-300 text-gray-600 hover:bg-gray-100'
//                 }`}
//                 onClick={handleShowInactiveMembers}
//               >
//                 Inactive
//               </button>
//               {/* Back button to flip to chart view */}
//               <button
//                 className="text-sm border px-3 py-1 rounded-md border-gray-300 text-gray-600 hover:bg-gray-100"
//                 onClick={() => setShowTeam(false)}
//               >
//                 Back
//               </button>
//             </div>
//           </div>
//           <div className="max-h-60 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
//             {filteredTeamList.length > 0 ? (
//               filteredTeamList.map((member) => ( 
//                 <div
//                   key={member.iUser_id} 
//                   className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100"
//                 >
//                   <div className="flex items-center space-x-3">
//                     <div className="w-9 h-9 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-semibold">
//                       {member.cFull_name.charAt(0).toUpperCase()}
//                     </div>
//                     <div>
//                       <p className="text-sm font-medium text-gray-800">{member.cFull_name}</p>
//                       <p className="text-xs text-gray-500">
//                         {member.bactive ? 'Active' : 'Inactive'} Team Member 
//                       </p>
//                     </div>
//                   </div>
//                   <span className="text-sm text-gray-600">
//                     {userLeadCountsById[member.iUser_id] || 0} Leads 
//                   </span>
//                 </div>
//               ))
//             ) : (
//               <div className="text-center text-gray-500 py-10">
//                 No {showActiveMembers ? 'active' : showInactiveMembers ? 'inactive' : ''} team members found.
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }