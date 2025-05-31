import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { X, Search } from "lucide-react";
import axios from "axios";
import { useParams } from "react-router-dom";
import DatePicker from 'react-datepicker';
import TimePicker from 'react-time-picker';
const apiEndPoint = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("token");

const ReminderForm = () => {
  const { leadId } = useParams();
  const [showForm, setShowForm] = useState(false);
  const [isNewUser, setIsNewUser] = useState(true);
  const [users, setUsers] = useState([]);
  const [reminderList, setReminderList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterTime, setFilterTime] = useState("");

  const [form, setForm] = useState({
    title: "",
    content: "",
    reminderDate: "",
    time: "",
    priority: "Normal",
    assignt_to: "",
    ilead_id: Number(leadId),
  });

  useEffect(() => {
    const newUserFlag = localStorage.getItem("isNewUser");
    setIsNewUser(newUserFlag !== "false");
  }, []);

  useEffect(() => {
    localStorage.setItem("isNewUser", isNewUser ? "true" : "false");
  }, [isNewUser]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    if (!form.title || !form.content || !form.reminderDate || !form.time) return false;
    const selectedDateTime = new Date(`${form.reminderDate}T${form.time}`);
    const now = new Date();
    if (selectedDateTime < now) {
      toast.error("Reminder date and time must be in the future.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e, status) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    const data = { ...form, status };
    data.reminderDate = new Date(`${form.reminderDate}T${form.time}`).toISOString();
    data.assignt_to = Number(form.assignt_to);

    try {
      const response = await fetch(`${apiEndPoint}/reminder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(`Error: ${result.message || "Could not add reminder"}`);
        return;
      }

      setForm({
        title: "",
        content: "",
        reminderDate: "",
        time: "",
        priority: "Normal",
        assignt_to: "",
        ilead_id: Number(leadId),
      });

      toast.success(status === "submitted" ? "Reminder submitted" : "Saved as draft");
      getReminder();
      setShowForm(false);
    } catch (err) {
      toast.error("Submission failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getReminder = async () => {
    try {
      const response = await fetch(`${apiEndPoint}/reminder/get-reminder/${leadId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setReminderList(data.message);
      } else {
        toast.error("Failed to fetch reminders");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${apiEndPoint}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to load users", err);
    }
  };

  useEffect(() => {
    getReminder();
    fetchUsers();
  }, []);

  const filteredReminders = reminderList.filter((reminder) => {
    const matchesSearch = reminder.cremainder_title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = filterDate ? new Date(reminder.dremainder_dt).toISOString().slice(0, 10) === filterDate : true;
    const matchesTime = filterTime ? new Date(reminder.dremainder_dt).toTimeString().slice(0, 5) === filterTime : true;
    return matchesSearch && matchesDate && matchesTime;
  });

  return (
    <div className="relative min-h-screen bg-[#f8f8f8] p-6">
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm">
          <Search className="text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search reminders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent outline-none text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="border border-gray-300 rounded-full px-3 py-1 text-sm bg-white shadow-sm"
          />
          <input
            type="time"
            value={filterTime}
            onChange={(e) => setFilterTime(e.target.value)}
            className="border border-gray-300 rounded-full px-3 py-1 text-sm bg-white shadow-sm"
          />
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-md hover:bg-blue-700 transition"
          >
            + Add Reminder
          </button>
        </div>
      </div>

      <div className="flex flex-col divide-y divide-gray-200 bg-white rounded-3xl shadow-md overflow-hidden">
        {filteredReminders.length === 0 ? (
          <div className="text-center p-6 text-gray-500">No reminders match your criteria.</div>
        ) : (
          filteredReminders.map((reminder) => (
            <div key={reminder.iremainder_id} className="py-4 px-6 hover:bg-gray-50 transition duration-150">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-md font-semibold text-gray-900">📌 {reminder.cremainder_title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{reminder.cremainder_content}</p>
                  <div className="text-xs text-gray-500 mt-2">
                    Created by: <span className="font-medium">{reminder.created_by}</span>
                  </div>
                  <div className="text-xs mt-1 text-gray-600">Priority: <span className="font-semibold">{reminder.priority || 'Normal'}</span></div>
                  <div className="text-xs text-gray-600">Assigned to: <span className="font-semibold">{reminder.assigned_to}</span></div>
                </div>
                <div className="text-right text-sm text-gray-600">
                  <p className="font-medium text-blue-700">{new Date(reminder.dremainder_dt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-40 z-40" onClick={() => setShowForm(false)} />
          <div className={`fixed top-0 right-0 w-full max-w-xl h-full bg-white shadow-xl z-50 transition-transform duration-500 ${showForm ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="p-6 h-full overflow-y-auto relative">
              <button className="absolute top-4 right-4 text-gray-600 hover:text-black" onClick={() => setShowForm(false)}>
                <X size={24} />
              </button>
              <h2 className="font-semibold text-lg mt-5 mb-4">New Reminder</h2>
              <form onSubmit={(e) => handleSubmit(e, "submitted")}>
                <label className="block text-sm mb-2">Title *</label>
                <input className="w-full border p-2 mb-4 rounded-xl bg-gray-100" name="title" value={form.title} onChange={handleChange} maxLength={100} required />

                <label className="block text-sm mb-2">Description *</label>
                <textarea className="w-full border p-2 mb-4 rounded-xl h-24 bg-gray-100" name="content" maxLength={300} value={form.content} onChange={handleChange} required></textarea>

                <label className="block text-sm mb-2">Priority</label>
                <select name="priority" className="w-full border p-2 mb-4 rounded-xl bg-gray-100" value={form.priority} onChange={handleChange}>
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>

                <label className="block text-sm mb-2">Assign To</label>
                <select name="assignt_to" className="border p-2 mb-4 rounded-xl w-full bg-gray-100" value={form.assignt_to} onChange={handleChange}>
                  <option value="">Select User</option>
                  {users.map((user) => (
                    <option key={user.iUser_id} value={user.iUser_id}>
                      {user.cFull_name}
                    </option>
                  ))}
                </select>

                <label className="block text-sm mb-2">Date *</label>
                <input type="date" className="border p-2 mb-4 rounded-xl w-full bg-gray-100" name="reminderDate" value={form.reminderDate} onChange={handleChange} required />

                <label className="block text-sm mb-2">Time *</label>
                <input type="time" className="border p-2 mb-4 rounded-xl w-full bg-gray-100" name="time" value={form.time} onChange={handleChange} required />

                <div className="flex gap-4 mt-2">
                  <button type="submit" disabled={submitting} className="bg-blue-900 text-white px-4 py-2 rounded-full shadow-md hover:bg-blue-700">
                    {submitting ? "Saving..." : "Submit"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReminderForm;
