import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaPhone, FaGlobe } from 'react-icons/fa';
import { LayoutGrid, List, Filter, RotateCw } from 'lucide-react';
import ProfileHeader from '../../Components/common/ProfileHeader';
import Loader from '../../Components/common/Loader';
import { ENDPOINTS } from '../../api/constraints';

const LeadCardViewPage = () => {
  const [allLeads, setAllLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);

  const leadsPerPage = 9;
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async (page = 1, limit = 1000) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      const res = await fetch(`${ENDPOINTS.BASE_URL_IS}/lead/user/${user.iUser_id}?page=${page}&limit=${limit}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const data = await res.json();
      const leads = Array.isArray(data.details) ? data.details : [];
      const sorted = leads.sort((a, b) => new Date(b.dmodified_dt) - new Date(a.dmodified_dt));
      setAllLeads(sorted);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setAllLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterApply = () => {
    setCurrentPage(1);
    setShowFilterModal(false);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'hot': return 'bg-red-700 text-white';
      case 'warm': return 'bg-yellow-500 text-white';
      case 'cold': return 'bg-blue-700 text-white';
      case 'new': return 'bg-sky-600 text-white';
      case 'contacted': return 'bg-green-500 text-white';
      case 'interested': return 'bg-purple-600 text-white';
      default: return 'bg-yellow-300 text-gray-700';
    }
  };

  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : '-';

  const isWithinDateRange = (date) => {
    const d = new Date(date);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(new Date(toDate).setHours(23, 59, 59, 999)) : null;
    return (!from || d >= from) && (!to || d <= to);
  };

  const filteredLeads = allLeads.filter((lead) => {
    const match = (text) => text?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch =
      match(lead.clead_name) || match(lead.corganization) || match(lead.cemail) || match(lead.iphone_no);
    const matchesDate = isWithinDateRange(lead.dmodified_dt);
    return matchesSearch && matchesDate;
  });

  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);
  const displayedLeads = filteredLeads.slice((currentPage - 1) * leadsPerPage, currentPage * leadsPerPage);

  const goToLeadDetail = (id) => navigate(`/leaddetailview/${id}`);

  return (
    <div className="max-w-full mx-auto p-4 bg-white rounded-2xl shadow-md space-y-6">
      <ProfileHeader />

      {/* Search & Controls */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search leads..."
          className="px-4 py-2 w-full sm:w-auto border border-gray-300 bg-gray-50 rounded-full shadow-inner placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
        <div className="flex gap-2 items-center">
          <button onClick={() => fetchLeads()} title="Refresh" className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition">
            <RotateCw size={18} />
          </button>
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded-full ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
            <LayoutGrid size={18} />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded-full ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
            <List size={18} />
          </button>
          <button onClick={() => setShowFilterModal(true)} className={`p-2 rounded-full ${showFilterModal ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 space-y-4 w-full max-w-md">
            <h2 className="text-lg font-medium text-gray-800">Filter by Date</h2>
            <label className="block text-sm text-gray-700">
              From
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-400"
              />
            </label>
            <label className="block text-sm text-gray-700">
              To
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-400"
              />
            </label>
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded-full bg-gray-200 text-gray-700" onClick={() => setShowFilterModal(false)}>
                Cancel
              </button>
              <button className="px-4 py-2 rounded-full bg-blue-600 text-white" onClick={handleFilterApply}>
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leads Display */}
      {loading ? (
        <Loader />
      ) : filteredLeads.length === 0 ? (
        <div className="text-center text-gray-500">No leads found.</div>
      ) : viewMode === 'list' ? (
        <div className="overflow-hidden rounded-2xl shadow-md border border-gray-200">
          <div className="grid grid-cols-6 gap-4 px-4 py-3 bg-gray-50 text-gray-800 text-sm font-medium">
            <div>Name</div>
            <div>Org</div>
            <div>Email</div>
            <div>Phone</div>
            <div>Modified</div>
            <div>Status</div>
          </div>
          {displayedLeads.map((lead) => (
            <div
              key={lead.ilead_id}
              onClick={() => goToLeadDetail(lead.ilead_id)}
              className="grid grid-cols-6 gap-4 px-4 py-3 border-t hover:bg-gray-100 cursor-pointer text-sm text-gray-700 transition"
            >
              <div>{lead.clead_name}</div>
              <div>{lead.corganization}</div>
              <div>{lead.cemail}</div>
              <div>{lead.iphone_no}</div>
              <div>{formatDate(lead.dmodified_dt)}</div>
              <div>
                <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(lead.lead_status?.clead_name)}`}>
                  {lead.lead_status?.clead_name || 'N/A'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedLeads.map((lead) => {
//            const label = lead.cservices || 'N/A';
            const isConverted = lead.bisconverted === true || lead.bisconverted === 'true' && lead.bactive === true || lead.bactive === 'true';
            const isActive = lead.bactive === true || lead.bactive === 'true' && lead.isConverted === false || lead.isConverted ==='false' ;
            const isFasle = lead.bactive === false || lead.bactive === 'false' ;
            const isWebsiteLead = lead.website_lead === true || lead.website_lead === 'true';

            return (
              <div
                key={lead.ilead_id}
                onClick={() => goToLeadDetail(lead.ilead_id)}
                className="p-5 rounded-2xl border border-gray-200 bg-white shadow-md hover:shadow-lg transition cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800">{lead.clead_name}</h2>
                  
                  {isFasle && <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">Lost</span>}
                  {isConverted && <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">Deal</span>}
                  {isActive && <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">Lead</span>}
                  {isWebsiteLead && <span className="px-3 py-1 text-blue-700  "><FaGlobe/></span>}
               
                </div>
                <p className="text-sm text-gray-500">Org: {lead.corganization || '-'}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaEnvelope /> {lead.cemail || '-'}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaPhone /> {lead.iphone_no || '-'}
                </div>
                <p className="text-sm text-gray-500">Last Modified: {formatDate(lead.dmodified_dt)}</p>
                <div className="flex gap-2 flex-wrap mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(lead.lead_status?.clead_name)}`}>
                    {lead.lead_status?.clead_name || 'N/A'}
                  </span>
                 </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-full bg-gray-200 disabled:opacity-50 text-sm"
          >
            Prev
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded-full text-sm ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-full bg-gray-200 disabled:opacity-50 text-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default LeadCardViewPage;
