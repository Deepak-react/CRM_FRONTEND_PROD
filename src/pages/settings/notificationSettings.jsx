import React, { useState } from 'react';

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    email: true,
    sms: false,
    push: true,
    whatsapp: false,
  });

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    console.log('Saved settings:', settings);
    // Add API integration here
    alert("Notification settings saved successfully!");
  };

  const handleCancel = () => {
    // Reset or navigate away
    alert("Changes canceled.");
  };

  const iosToggle = (checked, onChange) => (
    <label className="inline-flex items-center cursor-pointer relative">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
      />
      <div className="w-12 h-7 bg-gray-300 rounded-full peer-checked:bg-blue-500 transition-all duration-300 ease-in-out"></div>
      <div className="absolute left-[2px] top-[2px] w-6 h-6 bg-white rounded-full shadow-md transform peer-checked:translate-x-5 transition-all duration-300 ease-in-out"></div>
    </label>
  );

  return (
    <div className=" mx-auto mt-10 bg-white/60 backdrop-blur-lg border border-gray-200 shadow-xl rounded-3xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Notification Settings</h2>
      <p className="text-gray-600 mb-6">
        Manage your notification preferences across different channels.
      </p>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-700">Email Notifications</p>
            <p className="text-sm text-gray-500">Receive updates via email.</p>
          </div>
          {iosToggle(settings.email, () => handleToggle("email"))}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-700">SMS Alerts</p>
            <p className="text-sm text-gray-500">Get alerts on your mobile number.</p>
          </div>
          {iosToggle(settings.sms, () => handleToggle("sms"))}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-700">Push Notifications</p>
            <p className="text-sm text-gray-500">Instant app notifications.</p>
          </div>
          {iosToggle(settings.push, () => handleToggle("push"))}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-700">WhatsApp Updates</p>
            <p className="text-sm text-gray-500">Receive updates via WhatsApp.</p>
          </div>
          {iosToggle(settings.whatsapp, () => handleToggle("whatsapp"))}
        </div>
      </div>

      <div className="flex justify-end space-x-4 mt-10">
        <button
          onClick={handleCancel}
          className="px-5 py-2 text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-100 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-5 py-2 text-white bg-blue-600 rounded-full hover:bg-blue-700 transition shadow"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;
