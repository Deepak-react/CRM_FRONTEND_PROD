
import React, { useState, useEffect } from 'react';
import { FaCheckSquare, FaRegSquare, FaUserAlt, FaClock, FaPlus, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Drawer, TextField, Button, CircularProgress, Snackbar, Alert } from '@mui/material';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { ENDPOINTS } from "../api/constraints";
import { ImCross } from "react-icons/im";
import Slide from '@mui/material/Slide';


function SlideTransition(props) {
 return <Slide {...props} direction="down" />;
}



// import ReminderForm from './src/Components/RemainderForm';
// Dummy API functions (keep this the same)
const dummyApi = {
 
 createMeet: (meetData) => new Promise((resolve) => {
 
 setTimeout(() => resolve({
 data: {
 ...meetData,
 id: Math.floor(Math.random() * 1000),
 client: "New Client",
 completed: false,
 description: `Meeting scheduled at ${meetData.time}`
 }
 }), 800);
 }),

 toggleReminder: () => new Promise((resolve) => {
 setTimeout(() => resolve({ success: true }), 300);
 })
};

// MeetFormDrawer Component (keep this the same)
const MeetFormDrawer = ({ open, onClose, selectedDate, onCreated, setOpenDrawer, setSnackbar }) => {


const initialFormData = {
 ctitle: '',
 devent_startdt: '',
 cdescription: '',
 icreated_by: '',
 iupdated_by: '',
 devent_end: '',
 dupdated_at: new Date().toISOString().split('.')[0] + 'Z'
};

const [formData, setFormData] = useState(initialFormData);

 const [loading, setLoading] = useState(false);


 const handleSubmit = async (e) => {
 e.preventDefault();

 const startDate = new Date(formData.devent_startdt);
 const now = new Date();

 // Check if the selected start date is in the past
 if (startDate < now.setSeconds(0, 0)) {
 setSnackbar({
 open: true,
 message: 'ℹ️ Please select a future date and time!',

 severity: 'info'
 });
 return; // Prevent submission
 }

 const startTime = startDate.toISOString().split('.')[0] + 'Z';
 const user_data = localStorage.getItem("user");
 const user_data_parsed = JSON.parse(user_data);

 formData.devent_startdt = startTime;
 formData.icreated_by = user_data_parsed.iUser_id;
 formData.iupdated_by = user_data_parsed.iUser_id;
 formData.devent_end = startTime; // Same as start, adjust if needed
 formData.dupdated_at = new Date().toISOString().split('.')[0] + 'Z';

 console.log('Form data ready for submission:', formData);

 setLoading(true);
 const token = localStorage.getItem("token");

 try {
 const response = await fetch(`${ENDPOINTS.CREATE_EVENT}`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 ...(token && { Authorization: `Bearer ${token}` }),
 },
 body: JSON.stringify(formData),
 });
 setFormData(initialFormData);
 
 if (!response.ok) {
 setSnackbar({
 open: true,
 message: '❌ Failed to create reminder. Try again!',
 severity: 'error',
 });
 return;
 }

 setSnackbar({
 open: true,
 message: '✅ Reminder created successfully!',
 severity: 'success',
 });


 
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

      {/* Close Button */}
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

      {/* Header */}
      <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">Create Reminder</h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Title */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Title <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={formData.ctitle}
            onChange={(e) => setFormData({ ...formData, ctitle: e.target.value })}
            placeholder="Reminder title"
            className="w-full px-4 py-2 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            maxLength={100}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Description</label>
          <textarea
            value={formData.cdescription}
            onChange={(e) => setFormData({ ...formData, cdescription: e.target.value })}
            placeholder="Optional details…"
            className="w-full px-4 py-2 rounded-xl bg-gray-100 h-28 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            maxLength={300}
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Date & Time <span className="text-red-500">*</span></label>
          <input
            type="datetime-local"
            value={formData.devent_startdt}
            onChange={(e) => setFormData({ ...formData, devent_startdt: e.target.value })}
            className="w-full px-4 py-2 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-center mt-6">
          <button
            type="submit"
            className="w-full py-2 bg-black hover:bg-gray-900 text-white rounded-xl text-sm font-medium transition disabled:opacity-50"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  </div>
</Drawer>


 );
};

const CalendarView = () => {






 const [msg,setMsg]=useState('');
const [reminderList,setReminderList]=useState([])
 // State declarations for all variables being used
 const [selectedDate, setSelectedDate] = useState(new Date());

 const [reminders, setReminders] = useState([]);
 const [allReminder, setAllReminder] = useState([]);

const [calendarEvents, setCalendarEvents] = useState([]);


 const [loading, setLoading] = useState(true);
 const [openDrawer, setOpenDrawer] = useState(false);
 const [snackbar, setSnackbar] = useState({
 open: false,
 message: '',
 severity: 'success'
 });
 const [draftToEdit, setDraftToEdit] = useState(null); // For editing drafts

 // Define all functions being used
 const fetchReminders = async (date = selectedDate) => {
 const user_data = localStorage.getItem("user");
 const user_data_parsed = JSON.parse(user_data);
 console.log("User Data:", user_data_parsed.iUser_id); // Log the user data

 let dates = new Date(date);

// Step 2: Create a new UTC date with desired time: 00:00:00 (12:00 AM)
let utcDate = new Date(Date.UTC(
 dates.getUTCFullYear(),
 dates.getUTCMonth(),
 dates.getUTCDate() + 1, // adjust if needed
 0, 0, 0 // 12:00 AM UTC
));

// Step 3: Convert to ISO string

let formattedDate = utcDate.toISOString(); // e.g. "2025-05-08T00:00:00.000Z"

// Optional: remove milliseconds
formattedDate = formattedDate.replace('.000', '');

console.log(formattedDate); // → "2025-05-08T00:00:00Z"
console.log("new date is", new Date())
 
 setLoading(true);
 try {
 const token = localStorage.getItem("token");

 console.log("Fetching reminders for date:", ENDPOINTS.REMINDERS); // Log the date being fetched
 const response = await fetch(`${ENDPOINTS.FOLLOW_UP}?id=${user_data_parsed.iUser_id}&eventDate=${formattedDate}`, {
 method: 'GET',
 headers: {
 'Content-Type': 'application/json',
 Authorization: `Bearer ${token}`
 }
});


const data = await response.json(); // Parse the response body
console.log("Parsed Response Data:", data); // Now you can see the actual JSON
 setReminders(data.reminders || []);

 // setAllReminder(allReminderData || []);

 setCalendarEvents(data.calender_event || []);
 console.log("The reminder response is :", reminders); // Log the user data

 } catch (error) {
 setSnackbar({
 open: true,
 message: 'Failed to load reminders',
 severity: 'error'
 });
 }
 finally {
 setLoading(false);
 }
 };

 const toggleReminder = async (id) => {
 try {
 await dummyApi.toggleReminder(id);
 setReminders(reminders.map(reminder => 
 reminder.id === id ? {...reminder, completed: !reminder.completed} : reminder
 ));
 } catch (error) {
 setSnackbar({
 open: true,
 message: 'Failed to update reminder',
 severity: 'error'
 });
 }
 };

 //Reminder list for user 

 const UserReminder=async()=>{
 const token = localStorage.getItem("token");
 try {
 const response =await fetch(`${ENDPOINTS.USER_REMINDER}`,{
 headers: {
 'Content-Type': 'application/json',
 Authorization: `Bearer ${token}`
 }
 
 }

 )

 if(!response.ok){
 setMsg("Error in fetching user reminder")
 }

 const data=await response.json();
 console.log("reminder data",data)
 const reminderLists=data.data;
 setReminderList(reminderLists)
 } catch (e) {
 setMsg("can't fetch reminders")
 }
 }

 // const ReminderTable = ({ reminderList }) => {
 
 
// function ReminderComponent({ reminderList }) {
 const [searchTerm, setSearchTerm] = useState('');
 const [fromDate, setFromDate] = useState('');
 const [toDate, setToDate] = useState('');
 const [showEnded, setShowEnded] = useState(false); // toggle view

 // Parse "yyyy-mm-dd" to JS Date (start of day)
 const parseDate = (dateStr) => {
 if (!dateStr) return null;
 const [year, month, day] = dateStr.split('-');
 const d = new Date(year, month - 1, day);
 d.setHours(0, 0, 0, 0);
 return d;
 };

 // Today's date at start of day
 const today = new Date();
 today.setHours(0, 0, 0, 0);

 // Filter reminders by search and date range
 const filteredReminders = reminderList.filter((reminder) => {
 const searchMatch =
 (reminder?.cremainder_content?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
 (reminder?.created_by?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
 (reminder?.assigned_to?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
 (reminder?.lead_name?.toLowerCase() || '').includes(searchTerm.toLowerCase());

 const reminderDate = new Date(reminder.dremainder_dt);
 const from = parseDate(fromDate);
 const to = parseDate(toDate);
 
 if (to) to.setHours(23, 59, 59, 999); // include whole day

 const dateMatch =
 (!from || reminderDate >= from) && (!to || reminderDate <= to);

 return searchMatch && dateMatch;
 });

 // Separate upcoming and ended reminders
 const upcomingReminders = filteredReminders.filter(reminder => {
 const reminderDate = new Date(reminder.dremainder_dt);
 reminderDate.setHours(0, 0, 0, 0);
 return reminderDate >= today;
 });

 const endedReminders = filteredReminders.filter(reminder => {
 const reminderDate = new Date(reminder.dremainder_dt);
 reminderDate.setHours(0, 0, 0, 0);
 return reminderDate < today;
 });

 // Choose which reminders to show based on toggle
 const remindersToShow = showEnded ? endedReminders : upcomingReminders;

 const [currentPage, setCurrentPage] = useState(1);
const remindersPerPage = 5;

const indexOfLastReminder = currentPage * remindersPerPage;
const indexOfFirstReminder = indexOfLastReminder - remindersPerPage;
const currentReminders = remindersToShow.slice(indexOfFirstReminder, indexOfLastReminder);
 useEffect(() => {
 fetchReminders();
 UserReminder();

 }, [selectedDate]);
 console.log("Reminder list",reminderList)
 return (
 <div>
<div className="flex w-full p-8  rounded-xl ">

  {/* Left Column - Calendar and Actions */}
  <div className="w-1/2 flex flex-col mb-1 mr-6">
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 transition-transform duration-300 hover:scale-[1.01]">

      {/* Calendar Header */}
      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        className="border-none w-full"
        navigationLabel={({ date }) => (
          <div className="flex items-center justify-between px-6 mb-2">
            <FaChevronLeft
              className="text-gray-600 hover:text-black cursor-pointer transition"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedDate(new Date(date.setMonth(date.getMonth() - 1)));
              }}
            />
            <span className="text-xl font-semibold text-gray-800">
              {date.toLocaleString('default', { month: 'long' })} {date.getFullYear()}
            </span>
            <FaChevronRight
              className="text-gray-600 hover:text-black cursor-pointer transition"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedDate(new Date(date.setMonth(date.getMonth() + 1)));
              }}
            />
          </div>
        )}
        prevLabel={null}
        nextLabel={null}
        tileClassName={({ date }) =>
          date.getDate() === selectedDate.getDate()
            ? 'bg-black text-white rounded-full'
            : 'hover:bg-gray-200 transition rounded-full'
        }
      />

      {/* Action Buttons */}
      <div className="flex gap-4 mt-6 justify-center">
        <button
          onClick={() => setOpenDrawer(true)}
          className="w-[180px] bg-black hover:bg-gray-800 text-white py-2 px-4 rounded-xl flex items-center justify-center shadow-md transition"
        >
          <FaPlus className="mr-2" />
          Create Reminder
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

  {/* Right Column - Reminders & Events */}
  <div className="max-h-[395px] overflow-y-auto bg-white rounded-2xl shadow-lg p-6 space-y-6 pr-2 w-1/2 transition-transform duration-300 hover:scale-[1.01]">

    {/* Reminders Header */}
    <h2 className="text-xl font-bold text-gray-800">Reminders</h2>

    {/* Legend */}
    <div className="flex gap-6 text-sm mb-4 text-gray-600">
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span> Reminder
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> Calendar Event
      </div>
    </div>

    {/* Reminders List */}
    {reminders.length > 0 ? (
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
              {new Date(reminder.dremainder_dt).toLocaleString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })}
            </div>
          </div>
        </div>
      ))
    ) : (
      <p className="text-gray-500">No reminders found for this date.</p>
    )}

    {/* Calendar Events */}
    <h2 className="text-xl font-bold text-gray-800 pt-2">Calendar Events</h2>
    {calendarEvents.length > 0 ? (
      calendarEvents.map(event => (
        <div key={event.icalender_event} className="border-b pb-4 last:border-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-md font-semibold text-gray-800">{event.ctitle}</h3>
              <p className="text-sm text-gray-600">{event.cdescription}</p>
            </div>
            <div className="text-xs text-white bg-blue-600 px-3 py-1 rounded-full flex items-center">
              <FaClock className="mr-1" />
              {new Date(event.devent_startdt).toLocaleString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })}
            </div>
          </div>
        </div>
      ))
    ) : (
      <p className="text-gray-500">No calendar events for this date.</p>
    )}
  </div>

  {/* Meet Form Drawer */}
  <MeetFormDrawer
    setOpenDrawer={setOpenDrawer}
    open={openDrawer}
    onClose={() => setOpenDrawer(false)}
    selectedDate={selectedDate}
    setSnackbar={setSnackbar}
  />

  {/* Snackbar for Notifications */}
  <Snackbar
    open={snackbar.open}
    autoHideDuration={6000}
    onClose={() => setSnackbar({ ...snackbar, open: false })}
  >
    <Alert severity={snackbar.severity}>
      {snackbar.message}
    </Alert>
  </Snackbar>

</div>
 
{/* All reminders of users */}
<div className="w-full rounded-xl p-5 bg-white shadow-sm border border-gray-200 mt-10">
  <h2 className="text-2xl font-semibold text-gray-900 mb-6 tracking-wide">
    📅 All Reminders
  </h2>

  {/* Controls */}
  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 mb-5">
    {/* Left: Search */}
    <div className="flex items-center gap-2 w-full md:w-auto">
      <label htmlFor="search" className="text-gray-700 font-medium text-sm">
        Search:
      </label>
      <input
        type="search"
        id="search"
        className="w-full md:w-60 px-3 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none placeholder-gray-400 text-gray-900 transition duration-150 shadow-sm"
        placeholder="Search reminder..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>

    {/* Right: Date Filters and Toggle */}
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
            setToDate(null);
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

  {/* Active Filters Display */}
  {fromDate && toDate && (
    <p className="text-xs text-blue-600 mb-4 font-medium tracking-wide">
      Filter: <strong>{new Date(fromDate).toISOString().slice(0, 10)}</strong> to{' '}
      <strong>{new Date(toDate).toISOString().slice(0, 10)}</strong>
    </p>
  )}

  {/* Reminder Table */}
  {remindersToShow.length > 0 ? (
   <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-xs">
  <table className="min-w-full text-sm text-gray-800 table-auto">
    <thead className="bg-gray-50 uppercase text-xs font-semibold tracking-wide">
      <tr>
        <th className="px-4 py-3 border-b text-center w-[60px]">S.no</th>
        <th className="px-4 py-3 border-b text-left w-[25%]">Reminder</th>
        <th className="px-4 py-3 border-b text-left w-[15%]">Created by</th>
        <th className="px-4 py-3 border-b text-left w-[15%]">Assigned to</th>
        <th className="px-4 py-3 border-b text-left w-[15%]">Lead</th>
        <th className="px-4 py-3 border-b text-left w-[20%] whitespace-nowrap">Date</th>
      </tr>
    </thead>
    <tbody>
      {currentReminders.map((reminder, index) => (
        <tr
          key={index}
          className="bg-white hover:bg-blue-50 transition duration-150 ease-in-out"
        >
          <td className="px-4 py-3 border-b text-center font-medium align-top">
            {(currentPage - 1) * remindersPerPage + index + 1}
          </td>
          <td className="px-4 py-3 border-b align-top break-words">
            {reminder.cremainder_content}
          </td>
          <td className="px-4 py-3 border-b align-top break-words">
            {reminder.created_by}
          </td>
          <td className="px-4 py-3 border-b align-top break-words">
            {reminder.assigned_to}
          </td>
          <td className="px-4 py-3 border-b align-top break-words">
            {reminder.lead_name}
          </td>
          <td className="px-4 py-3 border-b align-top whitespace-nowrap">
            {new Intl.DateTimeFormat('en-GB', {
              dateStyle: 'medium',
              timeStyle: 'short',
            }).format(new Date(reminder.dremainder_dt))}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
  ) : (
    <div className="min-h-[180px] flex items-center justify-center text-gray-400 text-base font-medium">
      <p>No {showEnded ? 'ended' : 'upcoming'} reminders found.</p>
    </div>
  )}
</div>

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
