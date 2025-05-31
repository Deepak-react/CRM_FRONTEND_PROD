import React, { useState, useEffect } from 'react';
import LeadCardView from './LeadcardView';
import LeadForm from '@/Components/LeadForm';

const AllLeadsPage = () => {
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('My Leads');
  const [sortAsc, setSortAsc] = useState(true);
  const [viewMode, setViewMode] = useState('card');
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const mockLeads = Array(100).fill().map((_, index) => {
      const statusOptions = ['Contacted', 'Pending', 'Follow-up'];
      const leadOptions = ['Hot', 'Warm', 'Cold'];
      const categoryOptions = ['My Leads', 'All Leads', 'Converted Leads'];
      const modifiedDate = new Date();
      modifiedDate.setDate(modifiedDate.getDate() - Math.floor(Math.random() * 30));
      
    });
    setLeads(mockLeads);
  }, []);

  const filteredLeads = leads
    .filter((lead) => activeTab === 'All Leads' || lead.category === activeTab)
    .filter((lead) =>
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((lead) =>
      !selectedDate || new Date(lead.modifiedDateObject).toDateString() === selectedDate.toDateString()
    )
    .sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      return sortAsc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });

  return (
    <div className="flex font-[system-ui,-apple-system,BlinkMacSystemFont]">
      <main className="flex-1 bg-[#F8F8F8] min-h-screen p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold text-gray-900">Leads</h1>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-800 transition duration-200"
          >
            + New Lead
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm mb-6">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3 px-4 py-2 rounded-xl border border-gray-300 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black"
          />
          <div className="flex gap-3 items-center">
            {['My Leads', 'All Leads', 'Converted Leads'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl ${
                  activeTab === tab
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } transition duration-200`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="px-3 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
          >
            {sortAsc ? 'A → Z' : 'Z → A'}
          </button>
          <button
            onClick={() => setViewMode(viewMode === 'card' ? 'list' : 'card')}
            className="px-3 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
          >
            {viewMode === 'card' ? 'List View' : 'Card View'}
          </button>
        </div>

        {viewMode === 'card' && <LeadCardView leads={filteredLeads} />}
        {viewMode === 'list' && <LeadListView leads={filteredLeads} />}

        {showForm && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white w-full md:w-3/4 lg:w-1/2 max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl relative p-6">
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl"
                onClick={() => setShowForm(false)}
              >
                &times;
              </button>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Create New Lead</h2>
              <LeadForm onClose={() => setShowForm(false)} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AllLeadsPage;
