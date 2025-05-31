import React, { useState, useMemo } from "react";

export default function LeadsTable({ data }) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 8;

  const leads = data?.map((item) => ({
    id: item.ilead_id,
    name: item.clead_name || "No Name",
    status: item.lead_status?.clead_name || "Unknown",
    assignedTo: item.user?.cFull_name || "Unassigned",
    modifiedBy: item.user_crm_lead_modified_byTouser?.cFull_name || "Unknown",
    time: new Date(item.dmodified_dt).toLocaleString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      day: "2-digit",
      month: "short",
    }),
    avatar: "/images/dashboard/grl.png",
  })) || [];

  const filteredLeads = useMemo(() => {
    const term = search.toLowerCase();
    return leads
      .filter(
        (lead) =>
          lead.name.toLowerCase().includes(term) ||
          lead.assignedTo.toLowerCase().includes(term)
      )
      .sort((a, b) => {
        const aIndex = a.name.toLowerCase().indexOf(term);
        const bIndex = b.name.toLowerCase().indexOf(term);
        return aIndex - bIndex;
      });
  }, [search, leads]);

  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);
  const currentLeads = filteredLeads.slice(
    (currentPage - 1) * leadsPerPage,
    currentPage * leadsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold text-gray-900">Leads</h2>
        <div className="flex gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-gray-700 placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
          />
          <a
            href="/leadcardview"
            className="text-blue-600 font-semibold hover:text-blue-700 flex items-center rounded-full px-4 py-2
              ring-1 ring-blue-300 hover:ring-blue-400 transition"
          >
            View All
          </a>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Modified By
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {currentLeads.length > 0 ? (
              currentLeads.map((lead) => (
                <tr
                  key={lead.id}
                  className="hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                >
                  <td className="px-6 py-2 whitespace-nowrap text-gray-900 font-medium">
                    {lead.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <img
                        src={lead.avatar}
                        alt={`${lead.assignedTo} avatar`}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="truncate max-w-[100px]">{lead.assignedTo}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <img
                        src={lead.avatar}
                        alt={`${lead.modifiedBy} avatar`}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex flex-col">
                        <span className="truncate max-w-[140px] font-semibold text-gray-900">
                          {lead.modifiedBy}
                        </span>
                        <span className="text-gray-400 text-xs truncate max-w-[160px]">
                          {lead.time}
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-400">
                  No leads found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6 select-none">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`rounded-full px-5 py-2 font-semibold text-sm transition
              ${
                currentPage === 1
                  ? "text-gray-400 border border-gray-300 cursor-not-allowed"
                  : "text-blue-600 border border-blue-400 hover:bg-blue-50"
              }`}
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`rounded-full px-5 py-2 font-semibold text-sm transition
              ${
                currentPage === totalPages
                  ? "text-gray-400 border border-gray-300 cursor-not-allowed"
                  : "text-blue-600 border border-blue-400 hover:bg-blue-50"
              }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
