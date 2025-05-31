import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ITEMS_PER_PAGE = 8;

export default function DealsTable({ data }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const deals =
    data?.map((item) => ({
      id: item.ilead_id,
      name: item.clead_name || "No Name",
      status: item.lead_status?.clead_name || "Unknown",
      assignedTo: item.clead_owner_name || "Unassigned",
      modifiedBy: item.user?.cFull_name || item.modified_by || "Unknown",
      time: new Date(item.dmodified_dt).toLocaleString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        day: "2-digit",
        month: "short",
      }),
      avatar: "/images/dashboard/grl.png",
    })) || [];

  const filteredDeals = useMemo(() => {
    const term = search.toLowerCase();
    return deals
      .filter(
        (deal) =>
          deal.name.toLowerCase().includes(term) ||
          deal.assignedTo.toLowerCase().includes(term)
      )
      .sort((a, b) => {
        const aIndex = a.name.toLowerCase().indexOf(term);
        const bIndex = b.name.toLowerCase().indexOf(term);
        return aIndex - bIndex;
      });
  }, [search, deals]);

  const totalPages = Math.ceil(filteredDeals.length / ITEMS_PER_PAGE);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const paginatedDeals = filteredDeals.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="bg-white rounded-3xl p-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h2 className="text-2xl font-semibold text-black">Deals</h2>
        <input
          type="search"
          placeholder="Search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full sm:w-64 px-4 py-2 rounded-full border border-gray-300 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
          aria-label="Search deals"
          spellCheck="false"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table
          className="min-w-full divide-y divide-gray-200 text-sm"
          style={{ tableLayout: "fixed" }}
        >
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[40%]">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[40%]">
                Modified By
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {paginatedDeals.length > 0 ? (
              paginatedDeals.map((deal) => (
                <tr
                  key={deal.id}
                  onClick={() => navigate(`/leaddetailview/${deal.id}`)}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <td
                    className="px-6 py-4 text-gray-900 font-medium truncate"
                    title={deal.name}
                  >
                    {deal.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-medium truncate">
                      {deal.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={deal.avatar}
                        alt={`${deal.modifiedBy || "User"} avatar`}
                        className="w-8 h-8 rounded-full object-cover border border-gray-200"
                      />
                      <div className="flex flex-col overflow-hidden">
                        <span className="truncate text-black font-medium max-w-[200px]">
                          {deal.modifiedBy}
                        </span>
                        <span className="text-gray-400 text-xs max-w-[220px] truncate">
                          {deal.time}
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="py-8 text-center text-gray-400 italic select-none"
                >
                  No deals found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-6 select-none">
        <button
          className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
            currentPage === 1
              ? "text-gray-400 border-gray-200 cursor-not-allowed"
              : "text-blue-600 border-gray-300 hover:bg-blue-50"
          }`}
          onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages || 1}
        </span>

        <button
          className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
            currentPage === totalPages || totalPages === 0
              ? "text-gray-400 border-gray-200 cursor-not-allowed"
              : "text-blue-600 border-gray-300 hover:bg-blue-50"
          }`}
          onClick={() =>
            currentPage < totalPages && setCurrentPage(currentPage + 1)
          }
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Next
        </button>
      </div>
    </div>
  );
}
