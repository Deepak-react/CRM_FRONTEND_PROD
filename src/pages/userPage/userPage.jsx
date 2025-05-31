import React, { useState, useEffect } from "react";
import {
  FaCrown,
  FaEnvelope,
  FaCity,
  FaIdCard,
  FaTh,
  FaBars,
} from "react-icons/fa";
import ProfileHeader from "../../Components/common/ProfileHeader";

const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("asc");
  const usersPerPage = 6;

  const getCompanyId = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    return payload.company_id;
  };

  useEffect(() => {
    const fetchUsers = async () => {
      const companyId = getCompanyId();
      if (!companyId) return alert("No company ID found in token");
      try {
        const response = await fetch("http://192.168.0.134:3000/api/users", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        const companyUsers = data.filter((user) => user.iCompany_id === companyId);
        setUsers(companyUsers);
        setFiltered(companyUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filteredUsers = users.filter(
      (user) =>
        user.cFull_name.toLowerCase().includes(value) ||
        user.cEmail.toLowerCase().includes(value) ||
        user.cUser_name.toLowerCase().includes(value) ||
        user.irole_id.toLowerCase().includes(value) ||
        user.icity?.toLowerCase().includes(value) ||
        user.cjob_title.toLowerCase().includes(value)
    );
    setFiltered(filteredUsers);
    setCurrentPage(1);
  };

  const handleSort = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newOrder);
    const sortedUsers = [...filtered].sort((a, b) =>
      newOrder === "asc"
        ? a.cFull_name.localeCompare(b.cFull_name)
        : b.cFull_name.localeCompare(a.cFull_name)
    );
    setFiltered(sortedUsers);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filtered.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const displayedUsers = filtered.slice(startIndex, startIndex + usersPerPage);

  return (
    <div className="p-6 bg-gradient-to-b from-slate-100 to-white min-h-screen rounded-3xl shadow-inner font-sans text-gray-800">
      <ProfileHeader />

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full sm:w-1/2 md:w-1/3 px-5 py-2.5 text-sm bg-white rounded-2xl border border-gray-300 shadow focus:ring-2 focus:ring-blue-300 outline-none transition-all"
        />
        <div className="flex gap-3 items-center">
          <button
            onClick={handleSort}
            className="px-4 py-2 rounded-xl text-sm bg-white border border-gray-300 shadow hover:bg-gray-50 transition-all"
          >
            ↕ Sort ({sortOrder})
          </button>
          <button
            onClick={() => setView("grid")}
            className={`p-2 rounded-xl border shadow-sm ${
              view === "grid" ? "bg-blue-600 text-white" : "bg-white text-gray-600"
            } transition-all hover:bg-blue-100`}
          >
            <FaTh />
          </button>
          <button
            onClick={() => setView("list")}
            className={`p-2 rounded-xl border shadow-sm ${
              view === "list" ? "bg-blue-600 text-white" : "bg-white text-gray-600"
            } transition-all hover:bg-blue-100`}
          >
            <FaBars />
          </button>
        </div>
      </div>

      {/* Grid View */}
      {view === "grid" ? (
       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
  {displayedUsers.map((user) => (
    <div
      key={user.iUser_id}
      className="bg-white rounded-3xl shadow-md hover:shadow-lg transition-all border border-gray-100 p-6"
    >
      <div className="flex items-center gap-4 mb-4">
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
            user.cFull_name
          )}&background=random&color=fff&rounded=true`}
          alt="Profile"
          className="w-14 h-14 rounded-full object-cover"
        />
        <div className="flex flex-1 items-center justify-between min-w-0">
          <h2 className="text-lg font-semibold text-gray-800 truncate">
            {user.cFull_name}
          </h2>

          {user.role?.cRole_name && (
            <span
              className={`ml-4 px-3 py-1  rounded-full text-xs font-semibold capitalize flex-shrink-0 ${
                user.role.cRole_name === "Administrator"
                  ? "bg-red-100 text-red-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {user.role.cRole_name}
            </span>
          )}
        </div>
      </div>
      <div className="text-sm text-gray-700 space-y-1">
        <p className="flex items-center gap-2">
          <FaEnvelope className="text-blue-500" /> {user.cEmail}
        </p>
        <p className="flex items-center gap-2">
          <FaCrown className="text-purple-500" /> {user.cjob_title || "N/A"}
        </p>
        <p className="flex items-center gap-2">
          <FaIdCard className="text-green-500" /> {user.irole_id || "N/A"}
        </p>
<div className="pt-2">
          <span
  className={`px-3 py-1 rounded-full text-xs font-semibold capitalize flex-shrink-0 ${
    user.role.bactive
      ? "bg-red-100 text-red-700"
      : "bg-green-100 text-green-700"
  }`}
>
  {user.role.bactive ? "Disabled" : "Active"}
</span></div>
      </div>
    </div>
  ))}
</div>

      ) : (
        // List View
       <div className="rounded-3xl shadow border border-gray-100 overflow-hidden">
  <div className="grid grid-cols-6 gap-2 sm:gap-4 px-4 py-3 bg-gray-100 font-semibold text-gray-600 text-center text-sm">
    <div>Profile</div>
    <div>Name</div>
    <div>Role</div>
    <div>Email</div>
    <div>Phone</div>
    <div>Address</div>
  </div>
  {displayedUsers.map((user) => (
    <div
      key={user.iUser_id}
      className="grid grid-cols-6 gap-2 sm:gap-4 px-4 py-3 text-center text-sm items-center border-t hover:bg-gray-50"
    >
      {/* Profile Picture */}
      <div className="flex justify-center">
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
            user.cFull_name
          )}&background=random&color=fff&rounded=true`}
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover"
        />
      </div>

      {/* Name */}
      <div className="truncate">{user.cFull_name}</div>

      {/* Role with badge */}
      <div className="flex justify-center">
        {user.role?.cRole_name ? (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
              user.role.cRole_name === "Administrator"
                ? "bg-red-100 text-red-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {user.role.cRole_name}
          </span>
        ) : (
          <span className="text-gray-400">N/A</span>
        )}
      </div>

      {/* Email */}
      <div className="truncate">{user.cEmail}</div>

      {/* Phone */}
      <div>{user.cPhone || "Nil"}</div>

      {/* Address */}
      <div className="truncate">{user.cAddress || "Nil"}</div>
    </div>
  ))}
</div>

      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8 flex-wrap">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-100 disabled:opacity-50"
          >
            Prev
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-2 text-sm rounded-xl shadow-sm ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-300 hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-100 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default UserPage;
