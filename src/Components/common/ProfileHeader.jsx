import { useEffect, useRef, useState, useCallback } from 'react';
import { Bell, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LeadForm from '../LeadForm';
import logo from './favicon.png';
import axios from 'axios';

const LAST_UNREAD_COUNT_KEY = 'lastUnreadCountForBell';
const POLLING_INTERVAL_MS = 30000;

export default function ProfileHeader() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: '',
    companyName: '',
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [displayedNotifications, setDisplayedNotifications] = useState([]);
  const [bellNotificationCount, setBellNotificationCount] = useState(0);
  const [showLeadForm, setShowLeadForm] = useState(false);

  const lastAcknowledgedUnreadCount = useRef(0);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    const persistedCount = parseInt(localStorage.getItem(LAST_UNREAD_COUNT_KEY) || '0', 10);
    lastAcknowledgedUnreadCount.current = persistedCount;

    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        const userObject = JSON.parse(userString);
        setProfile({
          name: userObject.cFull_name || '',
          email: userObject.cEmail || '',
          role: userObject.cRole_name || userObject.irole_id || 'N/A',
          companyName: userObject.cCompany_name || 'N/A',
        });
      } catch (e) {
        setProfile({ name: '', email: '', role: '', companyName: '' });
      }
    }
  }, []);

  const isToday = useCallback((dateString) => {
    if (!dateString) return false;
    const today = new Date();
    const notificationDate = new Date(dateString);

    return (
      notificationDate.getDate() === today.getDate() &&
      notificationDate.getMonth() === today.getMonth() &&
      notificationDate.getFullYear() === today.getFullYear()
    );
  }, []);

  const fetchUnreadTodayNotifications = useCallback(async () => {
    const currentUserString = localStorage.getItem('user');
    let currentUserId = null;
    if (currentUserString) {
      try {
        const userObject = JSON.parse(currentUserString);
        currentUserId = userObject.iUser_id;
      } catch (e) {
        console.error("Error parsing user object for notifications:", e);
      }
    }

    const currentToken = localStorage.getItem('token');
    if (!currentUserId || !currentToken) {
      // If no user or token, reset all notification states EXCEPT the acknowledged count in localStorage
      setDisplayedNotifications([]);
      setBellNotificationCount(0);
      lastAcknowledgedUnreadCount.current = parseInt(localStorage.getItem(LAST_UNREAD_COUNT_KEY) || '0', 10); // Re-read persisted count
      // DO NOT localStorage.setItem(LAST_UNREAD_COUNT_KEY, '0'); here
      return;
    }

    try {
      const res = await axios.get(`http://192.168.0.134:3000/api/notifications`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      const data = res.data;

      const unreadTodayNotifications = data
        .filter((n) => {
          const notificationUserId = n.userId || n.user_id;
          return (
            String(notificationUserId) === String(currentUserId) &&
            isToday(n.created_at) &&
            !n.read
          );
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setDisplayedNotifications(unreadTodayNotifications);

      if (!showNotifications) {
        const currentUnreadTotal = unreadTodayNotifications.length;
        const newNotifications = currentUnreadTotal - lastAcknowledgedUnreadCount.current;
        setBellNotificationCount(Math.max(0, newNotifications));
      }

    } catch (err) {
      console.error('Error fetching notifications:', err);
      setDisplayedNotifications([]);
      setBellNotificationCount(0);
    }
  }, [isToday, showNotifications]);

  useEffect(() => {
    fetchUnreadTodayNotifications();
    const intervalId = setInterval(fetchUnreadTodayNotifications, POLLING_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [fetchUnreadTodayNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLeadFormOpen = () => setShowLeadForm(true);
  const handleLeadFormClose = () => setShowLeadForm(false);

  const toggleNotificationsPanel = () => {
    setShowNotifications((prev) => {
      if (!prev) {
        const currentUnread = displayedNotifications.length;
        lastAcknowledgedUnreadCount.current = currentUnread;
        localStorage.setItem(LAST_UNREAD_COUNT_KEY, String(currentUnread));
        setBellNotificationCount(0);
      } else {
        fetchUnreadTodayNotifications();
      }
      return !prev;
    });
  };

  // const markNotificationAsRead = async (notificationId) => {
  //   const currentToken = localStorage.getItem('token');
  //   if (!currentToken) return;

  //   try {
  //     setDisplayedNotifications((prev) => prev.filter((n) => n.id !== notificationId));

  //     lastAcknowledgedUnreadCount.current = Math.max(0, lastAcknowledgedUnreadCount.current - 1);
  //     localStorage.setItem(LAST_UNREAD_COUNT_KEY, String(lastAcknowledgedUnreadCount.current));

  //     await axios.put(
  //       `http://192.168.0.134:3000/api/notifications/mark-read`,
  //       { notificationIds: [notificationId] },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${currentToken}`,
  //         },
  //       }
  //     );

  //     fetchUnreadTodayNotifications();
  //   } catch (err) {
  //     console.error(`Error marking notification ${notificationId} as read:`, err);
  //     fetchUnreadTodayNotifications();
  //   }
  // };

  const handleLogout = () => {
    // Only clear the user and token from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // Do NOT clear LAST_UNREAD_COUNT_KEY here to preserve it across sessions.
    // Do NOT call localStorage.clear();

    // Immediately reset notification-related states for visual feedback on the current component
    setBellNotificationCount(0);
    setDisplayedNotifications([]);
    // lastAcknowledgedUnreadCount.current is not reset here as it's meant to persist in localStorage

    // Navigate to the login page
    navigate('/');
  };

  const createUser = () => {
    navigate('/create-user');
  };

  return (
     <div className="flex justify-end items-center gap-4 mb-6 relative font-[San Francisco, -apple-system, BlinkMacSystemFont]">
    <button
      onClick={handleLeadFormOpen}
      className="px-5 py-2 rounded-full text-blue-600 font-medium bg-white border border-gray-300 shadow-sm hover:bg-gray-100 transition"
    >
      + Create Lead
    </button>

    {showLeadForm && (
      <div className="fixed inset-0 z-40 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center">
        <div className="bg-white p-6 rounded-3xl shadow-2xl w-11/12 md:w-3/4 max-h-[80vh] overflow-y-auto transition-all duration-300">
          <LeadForm onClose={handleLeadFormClose} />
        </div>
      </div>
    )}

    {profile.role && String(profile.role).toLowerCase() === 'reseller' && (
      <button
        onClick={createUser}
        className="px-5 py-2 rounded-full text-blue-600 font-medium bg-white border border-gray-300 shadow-sm hover:bg-gray-100 transition"
      >
        + User
      </button>
    )}

    <div className="relative" ref={notificationRef}>
      <Bell
        onClick={toggleNotificationsPanel}
        className="w-10 h-10 border border-gray-300 rounded-full p-2 text-blue-600 cursor-pointer bg-white shadow hover:bg-gray-100 transition"
      />
      {bellNotificationCount > 0 && (
        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow">
          {bellNotificationCount}
        </span>
      )}

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 max-h-60 overflow-y-auto bg-white shadow-2xl rounded-2xl p-4 text-sm z-20 border border-gray-200 transition-all duration-300">
          <div className="flex justify-between items-center mb-2">
            <div className="font-semibold text-gray-700">Today's Notifications</div>
            <X
              className="w-5 h-5 cursor-pointer text-gray-400 hover:text-gray-600"
              onClick={() => setShowNotifications(false)}
            />
          </div>
          {displayedNotifications.length === 0 ? (
            <div className="text-gray-400">No new notifications for today.</div>
          ) : (
            <ul className="space-y-3">
              {displayedNotifications.map((note) => (
                <li
                  key={note.id}
                  className="flex justify-between items-start bg-blue-50 p-3 rounded-2xl shadow-sm text-gray-700"
                >
                  <span>{note.message || note.title || 'New Notification'}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>

    {/* Profile Dropdown */}
    <div className="relative" ref={dropdownRef}>
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <label htmlFor="profile-upload">
          <img
            src={profile.cProfile_pic || logo}
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover border border-gray-300 shadow"
          />
        </label>
        <input
          type="file"
          accept="image/*"
          id="profile-upload"
          onChange={() => { }}
          className="hidden"
        />
        <div className="text-xl text-gray-600">▾</div>
      </div>

      {showDropdown && (
        <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 text-sm z-50 transition-all duration-300">
          <div className="font-semibold text-gray-900">{profile.name}</div>
          <div className="text-gray-500">{profile.email}</div>
          <div className="text-gray-500">Role: {profile.role}</div>
          {profile.companyName && (
            <div className="text-gray-500">Company: {profile.companyName}</div>
          )}
          <button
            onClick={handleLogout}
            className="w-full text-center mt-5 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-xl transition"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  </div>
  );
}