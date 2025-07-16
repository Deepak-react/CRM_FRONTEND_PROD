import React, { useState, useEffect, useRef } from 'react';
import { FaCheckSquare, FaRegSquare, FaUserAlt, FaClock, FaPlus, FaChevronLeft, FaChevronRight, FaMicrophone } from 'react-icons/fa';
import { Drawer, CircularProgress, Snackbar, Alert } from '@mui/material'; // Removed TextField and Button as they weren't directly used in the provided snippet for MUI imports
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { ENDPOINTS } from "../api/constraints"; // Ensure this path is correct
import Slide from '@mui/material/Slide';
import { useNavigate } from 'react-router-dom';

// Utility for Snackbar transitions
function SlideTransition(props) {
  return <Slide {...props} direction="down" />;
}

// Helper function to get start of day in local time for date comparison
const getStartOfDayInLocalTime = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Helper function to get end of day in local time for date comparison
const getEndOfDayInLocalTime = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

// MeetFormDrawer Component - for creating calendar events
const MeetFormDrawer = ({ open, onClose, selectedDate, onCreated, setSnackbar }) => {
  const initialFormData = {
    ctitle: '',
    devent_startdt: '',
    cdescription: '',
    icreated_by: '',
    iupdated_by: '',
    devent_end: '',
    dupdated_at: new Date().toISOString(),
    recurring_task: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);




  useEffect(() => {
  if (open && selectedDate) {
    const now = new Date(); // Already in IST if your system/browser is
    const initialStartDateTime = new Date(selectedDate);

    if (initialStartDateTime.toDateString() === now.toDateString()) {
      initialStartDateTime.setHours(now.getHours() , 0, 0, 0);

      if (initialStartDateTime < now) {
        initialStartDateTime.setHours(now.getHours(), now.getMinutes()  , 0, 0);
      }
    } else {
      initialStartDateTime.setHours(9, 0, 0, 0);
    }

    // ✅ Format to 'datetime-local' (local time, no shift needed)
    const toDatetimeLocal = (date) => {
      const pad = (n) => (n < 10 ? "0" + n : n);
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    const formattedLocal = toDatetimeLocal(initialStartDateTime);

    setFormData(prev => ({
      ...prev,
      devent_startdt: formattedLocal,
      devent_end: '',
    }));
  }
}, [open, selectedDate]);





  useEffect(() => {
    if (!recognitionRef.current) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setSnackbar({
          open: true,
          message: "Speech Recognition not supported by your browser.",
          severity: 'error'
        });
        return;
      }
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setFormData(prev => ({ ...prev, cdescription: prev.cdescription + transcript }));
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setSnackbar({
          open: true,
          message: `Speech recognition error: ${event.error}`,
          severity: 'error'
        });
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
    };
  }, [isListening, setSnackbar]);

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      setSnackbar({
        open: true,
        message: "Speech Recognition is not available.",
        severity: 'error'
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        setFormData(prev => ({ ...prev, cdescription: prev.cdescription + ' ' }));
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        setSnackbar({
          open: true,
          message: "Error starting voice input. Please ensure microphone access is granted.",
          severity: 'error'
        });
        setIsListening(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const startDateLocal = new Date(formData.devent_startdt);
    const now = new Date();

    if (startDateLocal < now) {
      setSnackbar({
        open: true,
        message: 'ℹ️ Start date and time cannot be in the past!',
        severity: 'info'
      });
      return;
    }

    if (formData.devent_end) {
      const endDateLocal = new Date(formData.devent_end);
      if (endDateLocal < startDateLocal) {
        setSnackbar({
          open: true,
          message: 'ℹ️ End date cannot be before start date!',
          severity: 'info'
        });
        return;
      }
    }

    const user_data_parsed = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    const finalData = {
      ...formData,
      devent_startdt: startDateLocal.toISOString(),
      devent_end: formData.devent_end ? new Date(formData.devent_end).toISOString() : null,
      icreated_by: user_data_parsed.iUser_id,
      iupdated_by: user_data_parsed.iUser_id,
      dupdated_at: new Date().toISOString(),
      recurring_task: formData.recurring_task || null
    };

    setLoading(true);
    try {
      const response = await fetch(ENDPOINTS.CREATE_EVENT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(finalData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message: `❌ Failed to create calendar event: ${errorData.message || 'Try again!'}`,
          severity: 'error',
        });
        return;
      }

      setSnackbar({
        open: true,
        message: '✅ Calendar Event created successfully!',
        severity: 'success',
      });
      setFormData(initialFormData); 
      onCreated();
      onClose(); 

    } catch (error) {
      console.error('Submission error:', error);
      setSnackbar({
        open: true,
        message: '🚨 Something went wrong while creating the reminder.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <div className={`fixed top-0 right-0 h-full w-[50%] sm:w-[400px] md:w-[360px] bg-white rounded-l-2xl shadow-2xl z-50 transition-all duration-500 ease-in-out transform ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="relative p-6 h-full overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-black transition duration-200"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">Calendar Event</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.ctitle}
                onChange={(e) => setFormData({ ...formData, ctitle: e.target.value })}
                placeholder="Calendar Event title"
                className="w-full px-4 py-2 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                maxLength={100}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Description</label>
              <div className="relative">
                <textarea
                  value={formData.cdescription}
                  onChange={(e) => setFormData({ ...formData, cdescription: e.target.value })}
                  placeholder="Optional details…"
                  className="w-full px-4 py-2 rounded-xl bg-gray-100 h-28 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition pr-10"
                  maxLength={300}
                />
                <button
                  type="button"
                  onClick={handleMicClick}
                  className={`absolute top-3 right-3 transition ${isListening ? 'text-red-500' : 'text-gray-500 hover:text-blue-600'}`}
                  title={isListening ? "Stop listening" : "Start voice input"}
                >
                  <FaMicrophone className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Start Date<span className="text-red-500">*</span></label>
              <input
                type="datetime-local"
                value={formData.devent_startdt}
                onChange={(e) => setFormData({ ...formData, devent_startdt: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">End Date <span className="text-red-500">*</span></label>
              <input
                type="datetime-local"
                value={formData.devent_end}
                onChange={(e) => setFormData({ ...formData, devent_end: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Recurring Task</label>
              <select
                name="recurring_task"
                value={formData.recurring_task ?? ""}
                onChange={(e) => setFormData({ ...formData, recurring_task: e.target.value === "" ? null : e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="">None</option>
                <option value="Quarter">Quarter</option>
                <option value="Half_year">Half-year</option>
                <option value="Year">Year</option>
              </select>
            </div>
            <div className="flex justify-center mt-6">
              <button
                type="submit"
                className="w-full py-2 bg-black hover:bg-gray-900 text-white rounded-xl text-sm font-medium transition disabled:opacity-50"
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Drawer>
  );
};

// Main CalendarView Component
const CalendarView = () => {
  const [msg, setMsg] = useState(''); // Not directly used in UI, consider removing if not needed
  const [reminderList, setReminderList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reminders, setReminders] = useState([]); // Reminders for the selected date
  const [calendarEvents, setCalendarEvents] = useState([]); // Calendar events for the selected date
  const [loading, setLoading] = useState(true);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [activeTab, setActiveTab] = useState('reminders');
  const [loggedInUserName, setLoggedInUserName] = useState(''); // Not directly used in UI, consider removing if not needed
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showEnded, setShowEnded] = useState(false);
  const navigate = useNavigate();

  // Auto-populate fromDate and toDate with current month's start and end
  useEffect(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const formatForInput = (date) => date.toISOString().slice(0, 10); // YYYY-MM-DD

    setFromDate(formatForInput(firstDayOfMonth));
    setToDate(formatForInput(lastDayOfMonth));
  }, []); // Run once on component mount

  useEffect(() => {
    const user_data = localStorage.getItem("user");
    if (user_data) {
      try {
        const user_data_parsed = JSON.parse(user_data);
        setLoggedInUserName(user_data_parsed.cUser_Name); // Set logged-in user name
      } catch (error) {
        console.error("Failed to parse user data from localStorage:", error);
      }
    }
  }, []);

  // Fetch reminders and events for the *currently selected* date on the calendar
  const fetchRemindersAndEventsForSelectedDate = async (date = selectedDate) => {
    const user_data = localStorage.getItem("user");
    const user_data_parsed = JSON.parse(user_data);
    let dates = new Date(date);
    // Convert to UTC start of day for consistent API querying
    let utcStartOfDay = new Date(Date.UTC(
      dates.getFullYear(),
      dates.getMonth(),
      dates.getDate(),
      0, 0, 0, 0
    ));
    let formattedDate = utcStartOfDay.toISOString();
    formattedDate = formattedDate.replace('.000Z', 'Z'); // Ensure correct ISO format with 'Z'

    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${ENDPOINTS.FOLLOW_UP}?id=${user_data_parsed.iUser_id}&eventDate=${formattedDate}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch data');
      }

      const data = await response.json();
      setReminders(data.reminders || []); // Reminders for the calendar view
      setCalendarEvents(data.calender_event || []); // Events for the calendar view

    } catch (error) {
      console.error("Error fetching reminders/events for selected date:", error);
      setSnackbar({
        open: true,
        message: `Failed to load data for selected date: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Toggle reminder status
  const toggleReminder = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${ENDPOINTS.TOGGLE_REMINDER}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to toggle reminder status');
      }

      // Update reminders state for the calendar view
      setReminders(prevReminders => prevReminders.map(reminder =>
        reminder.iremainder_id === id ? { ...reminder, bactive: !reminder.bactive } : reminder
      ));
      // Update reminderList for the "All Reminders" tab
      setReminderList(prevList => prevList.map(reminder =>
        reminder.iremainder_id === id ? { ...reminder, bactive: !reminder.bactive } : reminder
      ));

      setSnackbar({
        open: true,
        message: 'Reminder status updated!',
        severity: 'success'
      });
    } catch (error) {
      console.error("Error toggling reminder:", error);
      setSnackbar({
        open: true,
        message: `Failed to update reminder: ${error.message}`,
        severity: 'error'
      });
    }
  };

  // Fetch all user reminders for the "All Reminders" tab
  const fetchAllUserReminders = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const response = await fetch(`${ENDPOINTS.USER_REMINDER}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error in fetching user reminders");
      }

      const data = await response.json();
      setReminderList(data.data || []); // This populates the data for the 'All Reminders' tab
    } catch (e) {
      console.error("Can't fetch all user reminders:", e);
      setMsg("Can't fetch user reminders"); // Consider removing this state if not used for UI
      setSnackbar({
        open: true,
        message: `Failed to load all reminders: ${e.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort logic for table data
  const filterAndSortItems = (items, dateKey, contentKey, endTimeKey = null, showEndedState, applyDateFilters) => {
    const now = new Date(); // Current time for comparison

    const filtered = items.filter((item) => {
      const searchMatch =
        (item?.[contentKey]?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (item?.created_by?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (item?.assigned_to?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (item?.lead_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (item?.ctitle?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (item?.cdescription?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (item?.recurring_task?.toLowerCase() || '').includes(searchTerm.toLowerCase());

      const itemStartDateTime = new Date(item[dateKey]);
      const itemEndDateTime = endTimeKey && item[endTimeKey] ? new Date(item[endTimeKey]) : itemStartDateTime;

      let dateRangeMatch = true;
      let timeStatusMatch = true;

      if (applyDateFilters) {
        const from = fromDate ? getStartOfDayInLocalTime(fromDate) : null;
        const to = toDate ? getEndOfDayInLocalTime(toDate) : null;

        dateRangeMatch = (!from || itemEndDateTime >= from) && (!to || itemStartDateTime <= to);

        // Logic for "Show Ended" vs "Show Upcoming"
        if (showEndedState) { // If "Show Ended" is active, show only items that have ended
          timeStatusMatch = itemEndDateTime <= now;
        } else { // If "Show Upcoming" is active, show only items that are in the future or ongoing
          timeStatusMatch = itemEndDateTime > now;
        }
      }

      return searchMatch && dateRangeMatch && timeStatusMatch;
    });

    // Sorting logic
    return filtered.sort((a, b) => {
      const sortDateA = endTimeKey && a[endTimeKey] ? new Date(a[endTimeKey]) : new Date(a[dateKey]);
      const sortDateB = endTimeKey && b[endTimeKey] ? new Date(b[endTimeKey]) : new Date(b[dateKey]);

      if (showEndedState && applyDateFilters) {
        return sortDateB.getTime() - sortDateA.getTime(); // Newest first for ended
      } else {
        return sortDateA.getTime() - sortDateB.getTime(); // Oldest first for upcoming
      }
    });
  };

  const currentTabItems = activeTab === 'reminders'
    ? filterAndSortItems(reminderList, 'dremainder_dt', 'cremainder_content', null, showEnded, true)
    : filterAndSortItems(calendarEvents, 'devent_startdt', 'ctitle', 'devent_end', false, false); // Calendar events generally don't have an "ended" filter from this view

  // Pagination logic
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedCurrentItems = currentTabItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(currentTabItems.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // // Navigation functions
  // const goToDetail = (id) => {
  //       navigate(`/leaddetailview/${id}`);
  //   };

  // const goToCalendarEventDetail = (id) => {
  //   console.log(`Navigating to calendar event detail for ID: ${id}`);
  //   if (id) {
  //     // IMPORTANT: Replace '/calendareventdetail/${id}' with your actual route for calendar event details
  //     navigate(`/leaddetailview/${id}`);
  //   } else {
  //     console.warn("Attempted to navigate to calendar event detail with a falsy ID:", id);
  //     setSnackbar({
  //       open: true,
  //       message: 'Calendar Event ID not found for navigation.',
  //       severity: 'warning'
  //     });
  //   }
  // };

  // Callback after creating an event to refresh data
  const handleItemCreated = () => {
    fetchRemindersAndEventsForSelectedDate(); // Refresh for current calendar date
    fetchAllUserReminders(); // Refresh for "All Reminders" list
  };

  // Effects to re-fetch data based on dependencies
  useEffect(() => {
    fetchRemindersAndEventsForSelectedDate();
  }, [selectedDate]); // Re-fetch when calendar date changes

  useEffect(() => {
    fetchAllUserReminders(); // Fetch all reminders on component mount
  }, []);

  // Reset pagination when filters/tabs change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, showEnded, searchTerm, fromDate, toDate, reminderList, calendarEvents]);

  // Helper to format date for table display
  const formatDateForTable = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date'; // Handle invalid date strings
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).replace(',', ''); // Remove comma for cleaner display
  };

  return (
    <div>
      {/* Top Section: Calendar and Daily Reminders/Events */}
      <div className="flex w-full p-8 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl shadow-black/10 hover:scale-[1.01] transition-transform duration-300">
        {/* Calendar Column */}
        <div className="w-1/2 flex flex-col mb-1 mr-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 transition-transform duration-300 hover:scale-[1.01]">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              className="border-none w-full"
              // Custom navigation labels to use Chevron icons
              navigationLabel={({ date, view, label }) => (
                <div className="flex items-center justify-between px-6 mb-2">
                  <FaChevronLeft
                    className="text-gray-600 hover:text-black cursor-pointer transition"
                    onClick={() => setSelectedDate(prevDate => {
                      const newDate = new Date(prevDate);
                      newDate.setMonth(newDate.getMonth() - 1);
                      return newDate;
                    })}
                  />
                  <span className="text-xl font-semibold text-gray-800">
                    {date.toLocaleString('default', { month: 'long' })} {date.getFullYear()}
                  </span>
                  <FaChevronRight
                    className="text-gray-600 hover:text-black cursor-pointer transition"
                    onClick={() => setSelectedDate(prevDate => {
                      const newDate = new Date(prevDate);
                      newDate.setMonth(newDate.getMonth() + 1);
                      return newDate;
                    })}
                  />
                </div>
              )}
              // Hide default navigation buttons
              prevLabel={null}
              nextLabel={null}
              // Custom tile styling for selected date and today
              tileClassName={({ date }) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Normalize to start of day
                const selected = new Date(selectedDate);
                selected.setHours(0, 0, 0, 0); // Normalize to start of day

                const tile = new Date(date);
                tile.setHours(0, 0, 0, 0); // Normalize to start of day

                if (tile.getTime() === selected.getTime()) {
                  return 'bg-black text-white rounded-full';
                } else if (tile.getTime() === today.getTime()) {
                  return 'text-blue-600 font-bold';
                }
                return 'hover:bg-gray-200 transition rounded-full';
              }}
            />

            <div className="flex gap-4 mt-6 justify-center">
              <button
                onClick={() => setOpenDrawer(true)}
                className="w-[180px] bg-black hover:bg-gray-800 text-white py-2 px-4 rounded-xl flex items-center justify-center shadow-md transition"
              >
                <FaPlus className="mr-2" />
                Create Calendar Event
              </button>

              <button
                onClick={() => window.open("https://meet.google.com/landing", "_blank")}
                className="w-[200px] bg-black hover:bg-gray-800 text-white py-2 px-4 rounded-xl flex items-center justify-center shadow-md transition"
              >
                <b className="text-white font-bold mr-1">G</b>
                <span>Create Meet</span>
              </button>
            </div>
          </div>
        </div>

        {/* Reminders and Calendar Events for Selected Date Column */}
        <div className="max-h-[395px] overflow-y-auto bg-white rounded-2xl shadow-lg p-6 space-y-6 pr-2 w-1/2 transition-transform duration-300 hover:scale-[1.01]">
          <h2 className="text-xl font-bold text-gray-800">Reminders for {selectedDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</h2>
          <div className="flex gap-6 text-sm mb-4 text-gray-600">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span> Reminder
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> Calendar Event
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-full">
              <CircularProgress size={30} color="inherit" />
            </div>
          ) : reminders.length > 0 ? (
            reminders.map(reminder => (
              <div key={reminder.iremainder_id} className="border-b pb-4 last:border-0 transition-all">
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleReminder(reminder.iremainder_id)}
                    className="text-gray-400 hover:text-black transition mt-1"
                  >
                    {reminder.bactive ? (
                      <FaCheckSquare className="text-black text-lg" />
                    ) : (
                      <FaRegSquare className="text-lg" />
                    )}
                  </button>

                  <div className="flex-1 space-y-1">
                    <h3 className="text-md font-semibold text-gray-800">{reminder.cremainder_title}</h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaUserAlt className="mr-2 text-xs" />
                      Created By: <span className="font-medium">{reminder.created_by}</span> {/* Assuming 'created_by' exists */}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaUserAlt className="mr-2 text-xs" />
                      Assigned To: <span className="font-medium">{reminder.assigned_to}</span>
                    </div>
                    <p className="text-sm text-gray-600">{reminder.cremainder_content}</p>
                    <div
                      className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold
                      ${reminder.priority === 'High'
                          ? 'bg-red-100 text-red-800'
                          : reminder.priority === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                    >
                      Priority: {reminder.priority}
                    </div>
                  </div>

                  <div className="text-xs text-black bg-yellow-400 px-3 py-1 rounded-full flex items-center">
                    <FaClock className="mr-1" />
                    {formatDateForTable(reminder.dremainder_dt)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No reminders found for this date.</p>
          )}

          <h2 className="text-xl font-bold text-gray-800 pt-2">Calendar Events for {selectedDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</h2>
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <CircularProgress size={30} color="inherit" />
            </div>
          ) : calendarEvents.length > 0 ? (
            calendarEvents.map(event => (
              <div key={event.icalender_event} className="border-b pb-4 last:border-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-md font-semibold text-gray-800">{event.ctitle}</h3>
                    <p className="text-sm text-gray-600">{event.cdescription}</p>
                  </div>
                  <div className="text-xs text-white bg-blue-600 px-3 py-1 rounded-full flex items-center">
                    <FaClock className="mr-1" />
                    {formatDateForTable(event.devent_startdt)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No calendar events for this date.</p>
          )}
        </div>

        <MeetFormDrawer
          open={openDrawer}
          onClose={() => setOpenDrawer(false)}
          selectedDate={selectedDate}
          setSnackbar={setSnackbar}
          onCreated={handleItemCreated}
        />
      </div>

      {/* Bottom Section: All Reminders/Calendar Events Table */}
      <div className="w-full rounded-xl p-5 bg-white shadow-sm border border-gray-200 mt-10">
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-3 px-6 text-lg font-semibold ${activeTab === 'reminders' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'
              } transition-colors duration-200`}
            onClick={() => {
              setActiveTab('reminders');
              setShowEnded(false); // Reset showEnded when switching tabs
            }}
          >
            📅 All Reminders
          </button>
          <button
            className={`py-3 px-6 text-lg font-semibold ${activeTab === 'calendarEvents' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'
              } transition-colors duration-200`}
            onClick={() => {
              setActiveTab('calendarEvents');
              setShowEnded(false); // Reset showEnded when switching tabs
            }}
          >
            🗓️ All Calendar Events
          </button>
        </div>

        {/* Filter/Search for Reminders Tab */}
        {activeTab === 'reminders' && (
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 mb-5">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <label htmlFor="search" className="text-gray-700 font-medium text-sm">
                Search:
              </label>
              <input
                type="search"
                id="search"
                className="w-full md:w-60 px-3 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none placeholder-gray-400 text-gray-900 transition duration-150 shadow-sm"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <label className="text-gray-700 font-medium text-sm">From:</label>
              <input
                type="date"
                className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-900"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />

              <label className="text-gray-700 font-medium text-sm">To:</label>
              <input
                type="date"
                className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-900"
                value={toDate || ''}
                onChange={(e) => {
                  const newToDate = e.target.value;
                  if (fromDate && new Date(newToDate) < new Date(fromDate)) {
                    setSnackbar({
                      open: true,
                      message: 'To date should be after From date',
                      severity: 'error',
                    });
                    setToDate(''); // Clear invalid To date
                    return;
                  }
                  setToDate(newToDate);
                }}
              />

              <button
                className="text-blue-500 hover:text-blue-700 text-sm font-semibold"
                onClick={() => {
                  setFromDate('');
                  setToDate('');
                }}
                title="Clear Dates"
              >
                Clear
              </button>

              <button
                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
                onClick={() => setShowEnded(!showEnded)}
              >
                {showEnded ? 'Show Upcoming' : 'Show Ended'}
              </button>
            </div>
          </div>
        )}

        {(fromDate || toDate) && activeTab === 'reminders' && (
          <p className="text-xs text-blue-600 mb-4 font-medium tracking-wide">
            Filter:{' '}
            {fromDate && <strong>{new Date(fromDate).toLocaleDateString('en-GB')}</strong>}
            {fromDate && toDate && ' to '}
            {toDate && <strong>{new Date(toDate).toLocaleDateString('en-GB')}</strong>}
            {' '} ({showEnded ? 'Ended' : 'Upcoming'})
          </p>
        )}

        {loading ? (
          <div className="min-h-[180px] flex items-center justify-center">
            <CircularProgress size={40} color="inherit" />
          </div>
        ) : paginatedCurrentItems.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-xs">
            <table className="min-w-full text-sm text-gray-800 table-auto">
              <thead className="bg-gray-50 uppercase text-xs font-semibold tracking-wide">
                <tr>
                  <th className="px-4 py-3 border-b text-center w-[60px]">S.no</th>
                  {activeTab === 'reminders' ? (
                    <>

                      <th className="px-4 py-3 border-b text-left w-[12%]">Lead</th>
                      <th className="px-4 py-3 border-b text-center w-[35%]">Reminder</th>
                      <th className="px-4 py-3 border-b text-left w-[12%]">Created by</th> 
                      <th className="px-4 py-3 border-b text-left w-[12%]">Assigned to</th> 
                      <th className="px- py-3 border-b text-left w-[20%] whitespace-nowrap">Date</th>
                    </>
                  ) : (
                    <>
                      <th className="px-4 py-3 border-b text-left w-[16%]">Event Title</th>
                      <th className="px-4 py-3 border-b text-center w-[30%]">Description</th>
                      <th className="px-4 py-3 border-b text-left w-[15%]">Recurring Task</th>
                      <th className="px-11 py-3 border-b text-left w-[15%] whitespace-nowrap">Start Date</th>
                      <th className="px-11 py-3 border-b text-left w-[15%] whitespace-nowrap">End Date</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {paginatedCurrentItems.map((item, index) => (
                  <tr
                    key={activeTab === 'reminders' ? item.iremainder_id : item.icalender_event}
                    onClick={
                      activeTab === 'reminders' && item.ilead_id
                        ? () => {
                          // console.log("Clicked reminder row. Navigating to lead ID:", item.ilead_id);
                          goToDetail(item.ilead_id);
                        }
                        : activeTab === 'calendarEvents' && item.icalender_event
                          ? () => {
                            // console.log("Clicked calendar event row. Navigating to event ID:", item.icalender_event);
                            goToCalendarEventDetail(item.icalender_event);
                          }
                          : null // If no valid ID for navigation, do nothing
                    }
                    className="bg-white hover:bg-blue-50 transition duration-150 ease-in-out cursor-pointer"
                  >
                    <td className="px-4 py-3 border-b text-center font-medium align-top">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    {activeTab === 'reminders' ? (
                      <>

                        <td className="px-4 py-3 border-b align-top break-words">
                          {item.lead_name}
                        </td>
                        
                        <td className="px-4 py-3 border-b align-top break-words">
                          {item.cremainder_content}
                        </td>
                        <td className="px-4 py-3 border-b align-top break-words">
                          {item.created_by}
                        </td>
                        <td className="px-4 py-3 border-b align-top break-words">
                          {item.assigned_to}
                        </td>

                        <td className="px-4 py-3 border-b align-top whitespace-nowrap">
                          {new Date(item.dremainder_dt).toLocaleString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true // To show AM/PM
                          }).replace(/\//g, '-').toUpperCase()}
                        </td>
                        

                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 border-b align-top break-words">
                          {item.ctitle}
                        </td>
                        <td className="px-4 py-3 border-b align-top break-words">
                          {item.cdescription || '-'}
                        </td>
                        <td className="px-4 py-3 border-b align-top break-words">
                          {item.recurring_task || 'None'}
                        </td>
                       

                        <td className="px-4 py-3 border-b align-top whitespace-nowrap">
                          {new Date(item.devent_startdt).toLocaleString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          }).replace(/\//g, '-').toUpperCase()}
                        </td>

                        <td className="px-4 py-3 border-b align-top whitespace-nowrap">
                          {new Date(item.devent_end).toLocaleString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          }).replace(/\//g, '-').toUpperCase()}
                        </td>
                        
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="flex justify-end p-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 mx-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-4 py-2 mx-1 rounded-md ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 mx-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="min-h-[180px] flex items-center justify-center text-gray-400 text-base font-medium">
            <p>No {showEnded && activeTab === 'reminders' ? 'ended' : 'upcoming'} {activeTab === 'reminders' ? 'reminders' : 'calendar events'} found.</p>
          </div>
        )}
      </div>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        TransitionComponent={SlideTransition}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          variant="filled"
          sx={{
            backgroundColor: snackbar.severity === 'success' ? '#4caf50' : '#f44336',
            color: 'white',
            fontWeight: 600,
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default CalendarView;