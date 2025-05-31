import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ENDPOINTS } from '../../api/constraints';

const ToggleSwitch = ({ label, description, enabled, onToggle }) => (
  <div className="flex items-center justify-between border-b py-4">
    <div className="flex items-center">
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={onToggle}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-black transition-all duration-300"></div>
        <div className="absolute left-[2px] top-[2px] w-5 h-5 bg-white rounded-full border peer-checked:translate-x-full peer-checked:border-black transition-transform duration-300"></div>
      </label>
      <span className="ml-3 text-sm font-medium text-gray-700">{label}</span>
    </div>
    {description && <p className="text-sm text-gray-500 ml-4">{description}</p>}
  </div>
);

const AccountSettings = () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const companyId = user?.iCompany_id;

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    companyName: "",
    email: "",
    phone: "",
    gst: "",
    website: "",
    address1: "",
    address2: "",
    address3: "",
    // cin: "",
    cityId: "",
  });

  const [toggles, setToggles] = useState({
    email: false,
    contacts: false,
    whatsapp: false,
  });

  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [showCreatePanel, setShowCreatePanel] = useState(false);

  // Load profile data
  useEffect(() => {
    if (!token || !companyId) {
      ////console.warn("Missing token or company ID.");
      return;
    }

    setLoading(true);
    axios
      .get(`${ENDPOINTS.BASE_URL_IS}/company/${companyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data;

        if (data && data.cCompany_name) {
          setIsProfileLoaded(true);
          setProfile({
            companyName: data.cCompany_name || "",
            email: data.cemail_address || "",
            phone: data.iPhone_no ? String(data.iPhone_no) : "",
            gst: data.cGst_no || "",
            website: data.cWebsite || "",
            address1: data.caddress1 || "",
            address2: data.caddress2 || "",
            address3: data.caddress3 || "",
            // cin: data.icin_no ? String(data.icin_no) : "",
            cityId: data.city.cCity_name || 1,
          });

          setToggles({
            email: data.enableEmail || false,
            contacts: data.enableContacts || false,
            whatsapp: data.enableWhatsapp || false,
          });
        } else {
          setIsProfileLoaded(false);
        }
      })
      .catch((err) => {
        ////console.error("Error fetching company profile:", err);
        setIsProfileLoaded(false);
      })
      .finally(() => setLoading(false));
  }, [token, companyId]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // Handle toggles
  const handleToggleChange = (key) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (profile.gst && isNaN(profile.gst)) {
  throw new Error("Invalid GST number. Must be a number.");
}

  // Build payload for POST & PUT
  const buildPayload = () => {
    return {
      cCompany_name: profile.companyName.trim(),
      cLogo_link: "https://xcodefix.com/logo.png", // or empty string as needed
      iUser_no: Number(user?.iUser_no) || 2,
      iPhone_no: profile.phone ,
      cWebsite: profile.website.trim(),
      caddress1: profile.address1.trim(),
      caddress2: profile.address2.trim(),
      caddress3: profile.address3.trim(),
      cGst_no: profile.gst ? parseInt(String(profile.gst).trim()) : null,
      // icin_no: profile.cin ? parseInt(profile.cin) : null,
      cemail_address: profile.email.trim() || null
    };
  };

  // Save changes (PUT)
  const handleSaveChanges = useCallback(async () => {
    if (!companyId) {
      alert("Company ID missing, cannot update profile.");
      return;
    }

    setLoading(true);
    const payload = buildPayload();

    ////console.log("Saving profile with payload:", payload); 

    try {
      const response = await axios.put(
        `${ENDPOINTS.BASE_URL_IS}/company/${companyId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Changes saved!");
      ////console.log("Profile updated:", response.data);
    } 
    catch (err) {
      ////console.error("Error saving profile:", err?.response?.data || err.message);
      alert("Failed to save changes.");
    } finally {
      setLoading(false);
    }
  }, [profile, toggles, token, companyId]);
  

  // Create profile (POST)
  const handleCreateProfile = useCallback(async () => {
    setLoading(true);
    const payload = buildPayload();

    try {
      const res = await axios.post(
        `${ENDPOINTS.BASE_URL_IS}/company`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      ////console.log("Created profile:", res.data);
      alert("Profile created!");
      setIsProfileLoaded(true);
      setShowCreatePanel(false);
    } catch (err) {
      ////console.error("Error creating profile:", err.response?.data || err.message);
      alert("Failed to create profile.");
    } finally {
      setLoading(false);
    }
  }, [profile, toggles, token]);

  // Delete profile (DELETE)
  const handleDeleteProfile = useCallback(async () => {
    if (!companyId) {
      alert("Company ID missing, cannot delete profile.");
      return;
    }

    setLoading(true);
    try {
      await axios.delete(
        `${ENDPOINTS.BASE_URL_IS}/company/${companyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile({
        companyName: "",
        email: "",
        phone: "",
        gst: "",
        website: "",
        address1: "",
        address2: "",
        address3: "",
        // cin: "",
        cityId: "",
      });
      setToggles({ email: false, contacts: false, whatsapp: false });
      setIsProfileLoaded(false);
      alert("Profile deleted!");
    } catch (err) {
      ////console.error("Error deleting profile:", err);
      alert("Failed to delete profile.");
    } finally {
      setLoading(false);
    }
  }, [companyId, token]);

  return (
    <div className="relative w-full bg-[#f9f9f9] rounded-3xl shadow-md p-6 mt-4 border border-gray-200">
    {/* Loading Spinner */}
    {loading && (
      <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-50 rounded-3xl">
        <div className="w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )}

    {/* Header */}
    <div className="mb-6 flex items-center gap-4">
      <h1 className="text-[22px] font-semibold text-gray-900">Profile Settings</h1>
      {/* <p className="text-sm text-gray-500">Company ID: {companyId || "N/A"}</p> */}
      {!isProfileLoaded && (
        <button
          onClick={() => setShowCreatePanel(true)}
          className="ml-auto px-4 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition"
        >
          + Create
        </button>
      )}
    </div>

    {/* Inputs */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {[
        ["Company Name", "companyName"],
        ["Email", "email"],
        ["Phone", "phone"],
        ["GST No", "gst"],
        ["Website", "website"],
        ["Address 1", "address1"],
        ["Address 2", "address2"],
        ["Address 3", "address3"],
      ].map(([label, name]) => (
        <div key={name} className="flex flex-col">
          <label className="text-xs text-gray-600 mb-1">{label}</label>
          <input
            type="text"
            name={name}
            value={profile[name] || ""}
            onChange={handleInputChange}
            className="px-3 py-2 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            disabled={loading}
          />
        </div>
      ))}

      <div className="flex flex-col">
        <label className="text-xs text-gray-600 mb-1">City ID</label>
        <input
          type="number"
          name="cityId"
          value={profile.cityId}
          onChange={handleInputChange}
          className="px-3 py-2 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          disabled={loading}
          min={1}
        />
      </div>
    </div>

    {/* Toggles */}
    <div className="border-t pt-4 mb-6 space-y-3">
      {["email", "contacts", "whatsapp"].map((key) => (
        <div key={key} className="flex justify-between items-center">
          <div>
            <p className="text-gray-800 font-medium capitalize">{key}</p>
            <p className="text-xs text-gray-500">Toggle {key} notifications</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={toggles[key]}
              onChange={() => handleToggleChange(key)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-400 rounded-full peer peer-checked:bg-blue-500 transition-all duration-300"></div>
            <div className="absolute left-[2px] top-[2px] w-5 h-5 bg-white border border-gray-300 rounded-full peer-checked:translate-x-full peer-checked:border-blue-600 transition-transform duration-300"></div>
          </label>
        </div>
      ))}
    </div>

    {/* Action Buttons */}
    <div className="flex justify-end gap-3">
      {isProfileLoaded ? (
        <button
          onClick={handleSaveChanges}
          disabled={loading}
          className="px-5 py-2 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700 transition"
        >
          Save Changes
        </button>
      ) : (
        <button
          onClick={handleCreateProfile}
          disabled={loading}
          className="px-5 py-2 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700 transition"
        >
          Create Profile
        </button>
      )}
    </div>

    {/* Modal */}
    <AnimatePresence>
      {showCreatePanel && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50"
        >
          <motion.div className="bg-white rounded-2xl p-6 w-96 shadow-xl border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Create New Profile</h2>
            <div className="grid grid-cols-1 gap-4 max-h-[60vh] overflow-auto mb-4">
              {[
                ["Company Name", "companyName"],
                ["Email", "email"],
                ["Phone", "phone"],
                ["GST No", "gst"],
                ["Website", "website"],
                ["Address 1", "address1"],
                ["Address 2", "address2"],
                ["Address 3", "address3"],
                ["City ID", "cityId"],
              ].map(([label, name]) => (
                <div key={name} className="flex flex-col">
                  <label className="text-xs text-gray-600 mb-1">{label}</label>
                  <input
                    type={name === "cityId" ? "number" : "text"}
                    name={name}
                    value={profile[name] || ""}
                    onChange={handleInputChange}
                    className="px-3 py-2 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    disabled={loading}
                    min={name === "cityId" ? 1 : undefined}
                  />
                </div>
              ))}
            </div>

            <div className="mb-4 space-y-2">
              {["email", "contacts", "whatsapp"].map((key) => (
                <div key={key} className="flex justify-between items-center">
                  <p className="text-gray-800 text-sm capitalize">{key}</p>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={toggles[key]}
                      onChange={() => handleToggleChange(key)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-400 rounded-full peer peer-checked:bg-blue-500 transition-all duration-300"></div>
                    <div className="absolute left-[2px] top-[2px] w-5 h-5 bg-white border border-gray-300 rounded-full peer-checked:translate-x-full peer-checked:border-blue-600 transition-transform duration-300"></div>
                  </label>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setShowCreatePanel(false)}
                className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-full hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProfile}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
  );
};

export default AccountSettings;