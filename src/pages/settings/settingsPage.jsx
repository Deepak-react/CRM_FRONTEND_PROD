import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import ProfileHeader from '../../Components/common/ProfileHeader';

const navLinkClass = ({ isActive }) =>
  `block px-4 py-2 rounded-lg transition-colors duration-200 ${
    isActive
      ? 'bg-white/10 text-white font-semibold shadow-md'
      : 'hover:bg-white/10 hover:text-white text-gray-300'
  }`;

const SettingsPage = () => {
  return (
    <>
      <ProfileHeader />
      
      {/* <h1 className="text-3xl text-black font-medium mb-2 ms-[20px] mt-[-10px]">Profile</h1> */}

      <div className="flex h-[90vh]">
        {/* Dark Sidebar */}
<aside className="w-72 m-4 p-6 bg-[#164CA1] border border-blue-900 rounded-2xl shadow-xl text-white space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3">GENERAL SETTINGS</h2>
            <ul className="space-y-2">
              <li><NavLink to="account" className={navLinkClass}>Account</NavLink></li>
              <li><NavLink to="notification" className={navLinkClass}>Notification</NavLink></li>
              <li><NavLink to="smtpsettings" className={navLinkClass}>SMTP Settings</NavLink></li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">WORKSPACE</h2>
            <ul className="space-y-2">
              <li><NavLink to="billing" className={navLinkClass}>Billing & Subscription</NavLink></li>
              <li><NavLink to="members" className={navLinkClass}>Members</NavLink></li>
              <li><NavLink to="support" className={navLinkClass}>Support & Services</NavLink></li>
            </ul>
          </div>
        </aside>

        {/* Light Main Content Area */}
        <main className="flex-1 p-6 bg-gray-50 overflow-y-scroll rounded-xl shadow-inner">
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default SettingsPage;
