import React, { useEffect, useState } from 'react';
import ProfileHeader from '@/Components/common/ProfileHeader';
import LeadToolbar from '@/Components/dashboard/LeadToolbar';
import { ENDPOINTS } from '../../api/constraints';
import Loader from '../../Components/common/Loader';

const LeadListViewPage = () => {
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('My Leads');
  const [sortAsc, setSortAsc] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeads = async () => {
      const token = localStorage.getItem('token');
      const user_data = localStorage.getItem('user');
      let user_data_parsed;

      try {
        user_data_parsed = JSON.parse(user_data);
      } catch (err) {
        console.error('Invalid user data in localStorage:', err);
        setError('User data is invalid');
        setLoading(false);
        return;
      }

      const userId = user_data_parsed?.iUser_id;
      if (!userId) {
        console.error('User ID not found.');
        setError('User ID not found');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${ENDPOINTS.BASE_URL_IS}/lead/user/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        if (!response.ok) throw new Error(`Failed to fetch leads: ${response.status}`);

        const data = await response.json();
        if (Array.isArray(data.details)) {
          setLeads(data.details);
        } else {
          throw new Error('Invalid data format');
        }
      } catch (error) {
        console.error('Error fetching leads:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  const filteredLeads = leads
    .filter((lead) => {
      if (activeTab === 'All Leads') return true;
      if (activeTab === 'My Leads') return lead.assignedTo === 'Shivakumar'; // TODO: Replace with dynamic name
      if (activeTab === 'Converted Leads') return lead.status === 'Converted';
      return true;
    })
    .filter((lead) =>
      lead.clead_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) =>
      sortAsc
        ? a.clead_name?.localeCompare(b.clead_name)
        : b.clead_name?.localeCompare(a.clead_name)
    );

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="flex justify-between items-center p-4 bg-white shadow-sm">
        <h1 className="text-xl font-semibold text-gray-800">Lead Management</h1>
        <ProfileHeader />
      </header>

      <main className="flex-1 p-4">
        <LeadToolbar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sortAsc={sortAsc}
          setSortAsc={setSortAsc}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {loading ? (
          <Loader />
        ) : error ? (
          <div className="mt-6 text-center text-red-500 font-medium">{error}</div>
        ) : (
          <div className="grid gap-4 mt-6">
            {filteredLeads.map((lead, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-2 transition-all hover:shadow-md"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800">{lead.clead_name}</h2>
                  <span className="text-sm text-gray-500">{lead.dmodified_dt}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <p><span className="font-medium">Organization:</span> {lead.corganization}</p>
                  <p><span className="font-medium">Phone:</span> {lead.iphone_no}</p>
                  <p><span className="font-medium">Email:</span> {lead.cemail}</p>
                  <p><span className="font-medium">Assigned To:</span> {lead.assignedTo}</p>
                  <p><span className="font-medium">Status:</span> {lead.lead_status?.clead_name}</p>
                  <p><span className="font-medium">Potential:</span> {lead.lead_potential?.clead_name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default LeadListViewPage;
