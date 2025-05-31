import React, { useState } from 'react';

const allPermissions = [
  'View Dashboard',
  'Edit Content',
  'Delete Content',
  'Manage Users',
  'Access Reports',
];

const rolePermissionsMap = {
  Admin: ['View Dashboard', 'Edit Content', 'Delete Content', 'Manage Users', 'Access Reports'],
  Editor: ['View Dashboard', 'Edit Content', 'Access Reports'],
  Viewer: ['View Dashboard'],
};

const MembersSettings = () => {
  const [role, setRole] = useState('Editor');
  const [permissions, setPermissions] = useState(rolePermissionsMap[role]);
  const [message, setMessage] = useState(null);

  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    setRole(selectedRole);
    setPermissions(rolePermissionsMap[selectedRole]);
    setMessage(null);
  };

  const togglePermission = (perm) => {
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
    setMessage(null);
  };

  const handleSave = (e) => {
    e.preventDefault();
    // Here, you’d send `role` and `permissions` to your backend or state management
    setMessage({ type: 'success', text: `Permissions updated for role "${role}".` });
  };

  return (
    <div className=" mx-auto mt-10 bg-white/90 backdrop-blur-md border border-gray-200 shadow-lg rounded-2xl p-8">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Member Settings</h2>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Role Selection */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            User Role
          </label>
          <select
            id="role"
            value={role}
            onChange={handleRoleChange}
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {Object.keys(rolePermissionsMap).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Permissions */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Permissions</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {allPermissions.map((perm) => (
              <label key={perm} className="inline-flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={permissions.includes(perm)}
                  onChange={() => togglePermission(perm)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="text-gray-700">{perm}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Message */}
        {message && (
          <p
            className={`text-sm ${
              message.type === 'success' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {message.text}
          </p>
        )}

        {/* Save Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition"
        >
          Save Permissions
        </button>
      </form>
    </div>
  );
};

export default MembersSettings;
