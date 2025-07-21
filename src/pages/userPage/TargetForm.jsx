import React, { useState, useEffect, useCallback } from 'react';
import { X } from "lucide-react";
import {  ENDPOINTS } from '../../api/constraints'; 

export default function SalesForm({ onClose }) {
  // const ENDPOINTS = {
  //   // USER_POST: "http://192.168.1.75:3000/api/user-target",
  //   USER_POST: ENDPOINTS.USER_POST,
  //   USER_GET: ENDPOINTS.USERS,
  // };

  const getCurrentDateTimeLocal = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const token = localStorage.getItem("token");

  const decodeToken = (t) => {
    if (!t) return null;
    try {
      const payload = JSON.parse(atob(t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      return payload;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  const tokenPayload = decodeToken(token);
  const currentUserId = tokenPayload?.user_id || tokenPayload?.iUser_id || null;
  const getCompanyId = () => tokenPayload?.company_id || tokenPayload?.iCompany_id || null;

  const [formData, setFormData] = useState({
    salesValue: '',
    formDate: getCurrentDateTimeLocal(),
    toDate: '',
    assignedTo: '', // Will store cFull_name
    assignedBy: currentUserId?.toString() || '',
    createdBy: currentUserId?.toString() || '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [companyUsers, setCompanyUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [usersError, setUsersError] = useState(null);

  const fetchCompanyUsers = useCallback(async () => {
    const companyId = getCompanyId();
    if (!companyId) {
      setUsersError("Company ID not found in token.");
      return;
    }

    try {
      const response = await fetch(ENDPOINTS.USERS, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
            console.log("users", response.data)


      if (!response.ok) {
        throw new Error("Failed to fetch users.");
      }

      const data = await response.json();
      const filtered = data.filter(user =>
  user.iCompany_id === companyId && (user.bactive === true || user.bactive === 1 || user.bactive === "true")
);


      setCompanyUsers(filtered); // ✅ FIXED

      const currentUser = filtered.find(user => user.iUser_id === currentUserId);
      if (currentUser) {
        setCurrentUser(currentUser);
        setFormData(prev => ({
          ...prev,
          assignedBy: currentUser.iUser_id.toString(),
          createdBy: currentUser.iUser_id.toString(),
        }));
      }

      if (filtered.length === 1 && !formData.assignedTo) {
        setFormData(prev => ({
          ...prev,
          assignedTo: filtered[0].cFull_name,
        }));
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsersError("Failed to load users. Please try again.");
    }
  }, [token, currentUserId, formData.assignedTo]);

  useEffect(() => {
    fetchCompanyUsers();
  }, [fetchCompanyUsers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.salesValue) {
      newErrors.salesValue = 'Sales Value is required';
    } else {
      const val = parseFloat(formData.salesValue);
      if (isNaN(val)) {
        newErrors.salesValue = 'Must be a valid number';
      } else if (val <= 0) {
        newErrors.salesValue = 'Must be a positive number';
      } else if (val > 99999999) {
        newErrors.salesValue = 'Cannot exceed 99,999,999';
      }
    }

    if (!formData.formDate) newErrors.formDate = 'From Date is required';
    if (!formData.toDate) newErrors.toDate = 'To Date is required';
    if (!formData.assignedTo) newErrors.assignedTo = 'Assigned To is required';

    if (formData.formDate && formData.toDate && new Date(formData.formDate) >= new Date(formData.toDate)) {
      newErrors.toDate = 'To Date must be after From Date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const formatDate = (dt) => `${dt.replace('T', ' ')}:00`;

    const body = {
      salesValue: parseFloat(formData.salesValue),
      fromDate: formatDate(formData.formDate),
      toDate: formatDate(formData.toDate),
      assignedTo: formData.assignedTo, // cFull_name
      assignedBy: parseInt(formData.assignedBy),
      createdBy: parseInt(formData.createdBy),
    };

    try {
      const res = await fetch(ENDPOINTS.USER_POST, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Submission failed');

      setSubmissionMessage('Sales target submitted successfully!');

      setFormData(prev => ({
        ...prev,
        salesValue: '',
        formDate: getCurrentDateTimeLocal(),
        toDate: '',
        assignedTo: '',
      }));

      setTimeout(() => onClose(), 1500);
    } catch (err) {
      console.error("Submission error:", err);
      setErrors({ submit: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50 z-50">
      <form onSubmit={handleSubmit} className="relative bg-white p-6 rounded-xl max-w-2xl w-full">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500"><X /></button>
        <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">Set Sales Target</h2>

        {submissionMessage && <div className="bg-green-100 p-3 rounded text-green-700 mb-4">{submissionMessage}</div>}
        {errors.submit && <div className="bg-red-100 p-3 rounded text-red-700 mb-4">{errors.submit}</div>}
        {usersError && <div className="bg-red-100 p-3 rounded text-red-700 mb-4">Error: {usersError}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       

          <div>
            <label className="block mb-1">From Date <span className='text-red-600'>*</span></label>
            <input
              type="datetime-local"
              name="formDate"
              value={formData.formDate}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
            {errors.formDate && <p className="text-red-500 text-sm mt-1">{errors.formDate}</p>}
          </div>

          <div>
            <label className="block mb-1">To Date <span className='text-red-600'>*</span></label>
            <input
              type="datetime-local"
              name="toDate"
              value={formData.toDate}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
            {errors.toDate && <p className="text-red-500 text-sm mt-1">{errors.toDate}</p>}
          </div>
             <div>
            <label className="block mb-1">Sales Value <span className='text-red-600'>*</span></label>
            <input
              type="number"
              name="salesValue"
              value={formData.salesValue}
              onChange={handleChange}
              max="99999999"
              min="1"
              step="0.01"
              className="w-full border p-2 rounded"
            />
            {errors.salesValue && <p className="text-red-500 text-sm mt-1">{errors.salesValue}</p>}
          </div>

          <div>
            <label className="block mb-1">Assigned To <span className='text-red-600'>*</span></label>
            <select
              name="assignedTo"
              value={companyUsers.find(user => user.
cUser_name
 === formData.assignedTo)?.cUser_name|| ''}
              onChange={(e) => {
                const selectedId = e.target.value;
                const selectedUser = companyUsers.find(u => u.cUser_name.toString() === selectedId);
                setFormData(prev => ({
                  ...prev,
                  assignedTo: selectedUser?.cUser_name || ''
                }));
              }}
              className="w-full border p-2 rounded"
            >
              <option value="">Select User</option>
              {companyUsers.map(user => (
                <option key={user.iUser_id} value={user.iUser_id}>
                  {user.cFull_name}
                </option>
              ))}
            </select>
            {errors.assignedTo && <p className="text-red-500 text-sm mt-1">{errors.assignedTo}</p>}
          </div>

          <div>
            <label className="block mb-1">Assigned By</label>
            <div className="bg-gray-100 p-2 rounded text-gray-700 font-medium">
              {currentUser?.cFull_name || 'Loading...'}
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Set Target'}
          </button>
        </div>
      </form>
    </div>
  );
}
