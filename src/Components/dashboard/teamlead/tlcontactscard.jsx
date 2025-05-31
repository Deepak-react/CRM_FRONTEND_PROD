import React from "react";

export default function ContactsTable() {
  return (
    <div
      style={{ overflow: "hidden" }}
      className="bg-white rounded-md p-4 w-full max-w-[550px] h-[300px] mx-auto overflow-x-auto"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Contacts</h2>
        <div className="w-full flex justify-between items-center mb-4">
          <div className="flex-1 flex justify-center">
            <input
              type="text"
              placeholder="Search"
              className="border border-gray-800 rounded-full px-3 py-1 text-sm focus:outline-none"
            />
          </div>
          <a href="#" className="text-sm text-black hover:underline ml-4">
            View All
          </a>
        </div>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-black border-b">
            <th className="py-2">S. No</th>
            <th>Name</th>
            <th>Status</th>
            <th>Assigned To</th>
            <th>Modified by</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="border-b last:border-0">
              <td className="py-2">{lead.id}</td>
              <td>{lead.name}</td>
              <td>
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                  {lead.status}
                </span>
              </td>
              <td className="py-2">
                <div className="flex items-center gap-2">
                  <img
                    src={lead.avatar}
                    alt=""
                    className="w-6 h-6 rounded-full"
                  />
                  <span>{lead.assignedTo}</span>
                </div>
              </td>
              <td className="py-2">
                <div className="flex items-center gap-2">
                  <img
                    src={lead.avatar}
                    alt=""
                    className="w-6 h-6 rounded-full"
                  />
                  <div className="flex flex-col">
                    <span>{lead.modifiedBy}</span>
                    <span className="text-gray-400 text-xs">{lead.time}</span>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
