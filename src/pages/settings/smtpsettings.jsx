import React, { useState, useEffect } from 'react';
import { ENDPOINTS } from '../../api/constraints';

export default function SmtpSettings() {
  const [form, setForm] = useState({
    host: '',
    port: '',
    server: '',
    name: '',
    email: '',
    password: '',
    isActive: false,
  });

  const [, setSmtpId] = useState(null);

  // Fetch SMTP settings from backend
  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      console.log('📡 Sending GET request to backend with token...');
      const res = await fetch(`${ENDPOINTS.BASE_URL_IS}/smtp-settings/company-smtp`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        
      });

      if (!res.ok) {
        throw new Error(`GET request failed with status ${res.status}`);
      }

      const responseData = await res.json();
      //console.log('📥 Received SMTP settings:', responseData);

      const smtp = responseData.data || {};

      setSmtpId(smtp.iSMTP_id);
      setForm({
        smtp_id: smtp.iSMTP_id ,
        host: smtp.csmtp_host || '',
        port: smtp.ismtp_port?.toString() || '',
        server: smtp.csmtp_server || '',
        name: smtp.csmtp_name || '',
        email: smtp.csmtp_email || '',
        password: smtp.csmtp_password || '',
        isActive: smtp.is_active || true,
      });
    } catch (error) {
      console.error('Error loading SMTP settings:', error);
      alert('Failed to load SMTP settings from server.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('token');

  // Decode the token to get companyId
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const tokenpayload = JSON.parse(atob(base64));
  const companyId = tokenpayload.company_id;

  // Construct the payload
  const payload = {
    smtp_host: form.host,
    smtp_port: Number(form.port),
    smtp_server: form.server,
    smtp_name: form.name,
    smtp_email: form.email,
    smtp_password: form.password,
    active: form.isActive,
  };


  const isUpdate = !!form.smtp_id; 
  const url = isUpdate
    ? `${ENDPOINTS.BASE_URL_IS}/smtp-settings/${companyId}`
    : `${ENDPOINTS.BASE_URL_IS}/smtp-settings/${companyId}`;
  const method = isUpdate ? 'PUT' : 'POST';

  if (isUpdate) {
    payload.smtp_id = form.smtp_id; 
  }

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log(`✅ SMTP settings ${isUpdate ? 'updated' : 'created'}:`, result);
    alert(`SMTP settings ${isUpdate ? 'updated' : 'created'} successfully!`);
    await loadData(); 
  } catch (error) {
    console.error(`❌ Failed to ${isUpdate ? 'update' : 'create'} SMTP settings:`, error);
    alert('Failed to save SMTP settings. See console for error.');
  }
};


  return (
    <form
      onSubmit={handleSubmit}
      className=" mx-auto p-6 bg-white rounded-2xl shadow-xl"
    >
      <div className="grid grid-cols-1 py-10 sm:grid-cols-2 gap-4">
        {/* Host */}
        <div>
          <label className="block text-sm rounded font-medium text-gray-700">Host</label>
          <input
            type="text"
            name="host"
            placeholder="Host name"
            autoComplete="off"
            value={form.host}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md p-2 border-gray-300 shadow-sm focus:ring-black focus:border-black"
          />
        </div>

        {/* Port */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Port</label>
          <input
            type="text"
            name="port"
            placeholder="Port number"
            autoComplete="off"
            value={form.port}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:ring-black focus:border-black"
          />
        </div>

        {/* Server */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Server</label>
          <input
            type="text"
            name="server"
            placeholder="Server name"
            autoComplete="off"
            value={form.server}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:ring-black focus:border-black"
          />
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            autoComplete="name"
            value={form.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:ring-black focus:border-black"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700">E-mail</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:ring-black focus:border-black"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:ring-black focus:border-black"
          />
        </div>
      </div>

      {/* Toggle Active */}
      <div className="flex items-center justify-between mt-6">
        <label className="inline-flex relative items-center cursor-pointer">
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-black transition-all duration-300"></div>
          <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full peer-checked:translate-x-full peer-checked:border-black transition-transform duration-300 border"></div>
          <span className="ml-3 text-sm font-medium text-gray-700">Active / Inactive</span>
        </label>

        <button
          type="submit"
          className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}