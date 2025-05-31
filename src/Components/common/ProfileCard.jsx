import React, { useEffect, useState } from "react";
import {
  FiEdit,
  FiPhone,
  FiMail,
  FiMapPin,
  FiUpload,
  FiSave,
  FiEye,
  FiX,
  FiMove,
  FiCodesandbox,
  FiCamera, // More appropriate for avatar upload
} from "react-icons/fi"; // Using Fi for consistency, but if there's a Cupertino icon set, that would be ideal.
import { TbWorld } from "react-icons/tb"; // Keeping TbWorld as it's general
import axios from "axios";
import { useParams } from "react-router-dom";
import Loader from "./Loader"; // Assuming Loader is already styled appropriately
import { Dialog } from "@headlessui/react";
import { useDropzone } from "react-dropzone";
import FilePreviewer from "./FilePreviewer";

const apiEndPoint = import.meta.env.VITE_API_URL;
const apiNoEndPoint = import.meta.env.VITE_NO_API_URL;

const EditProfileForm = ({ profile, onClose, onSave }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (profile) {
      setFormData({ ...profile });
    }
  }, [profile]);

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <FiX size={24} />
        </button>
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Edit Lead Profile</h3>
        <div className="space-y-5">
          <div>
            <label htmlFor="clead_name" className="block text-sm font-medium text-gray-700 mb-1">Name:</label>
            <input
              type="text"
              id="clead_name"
              name="clead_name"
              value={formData.clead_name || ""}
              onChange={handleFieldChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>
          <div>
            <label htmlFor="corganization" className="block text-sm font-medium text-gray-700 mb-1">Organization:</label>
            <input
              type="text"
              id="corganization"
              name="corganization"
              value={formData.corganization || ""}
              onChange={handleFieldChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>
          <div>
            <label htmlFor="iphone_no" className="block text-sm font-medium text-gray-700 mb-1">Phone:</label>
            <input
              type="text"
              id="iphone_no"
              name="iphone_no"
              value={formData.iphone_no || ""}
              onChange={handleFieldChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>
          <div>
            <label htmlFor="cemail" className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
            <input
              type="email"
              id="cemail"
              name="cemail"
              value={formData.cemail || ""}
              onChange={handleFieldChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>
            <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">Website:</label>
            <input
              type="text"
              id="cwebsite"
              name="cwebsite"
              value={formData.cwebsite || ""}
              onChange={handleFieldChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={handleSave}
              className="bg-blue-500 text-white px-5 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200"
            >
              <FiSave size={16} />
              Save
            </button>
            <button
              onClick={onClose}
              className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileCard = () => {
  const { leadId } = useParams();
  const [history, setHistory] = useState([]);
  const [profile, setProfile] = useState(null); // Initialize as null to handle loading state properly
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [users, setUsers] = useState([]);
  const [editSuccess, setEditSuccess] = useState(false);

  const [attachments, setAttachments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false); // Renamed for clarity

  useEffect(() => {
    const fetchLeadDetails = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      try {
        const response = await axios.get(`${apiEndPoint}/lead/${leadId}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        setProfile(response.data);
      } catch (err) {
        console.error("Failed to load lead details", err);
        setError("Failed to load lead details.");
      } finally {
        setLoading(false);
      }
    };

    

    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${apiEndPoint}/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to load users", err);
      }
    };

    if (leadId) {
      fetchLeadDetails();
      fetchUsers();
    }
  }, [leadId]);

  // Fetch attachments for the lead
 const fetchAttachments = async () => {
  const token = localStorage.getItem("token");

  try {
    const res = await axios.get(`${apiEndPoint}/lead-attachments/${leadId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Safely extract the data
    const fetched = Array.isArray(res.data.data) ? res.data.data : [];
    setAttachments(fetched);
  } catch (err) {
    console.error("Failed to fetch attachments", err);
    setAttachments([]); // fallback to avoid undefined issues
  }
};

  useEffect(() => {
    fetchAttachments();
  }, [leadId]);


  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditSuccess(false); // Reset success message on close
  };

  const handleSaveProfile = async (updatedFormData) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(`${apiEndPoint}/lead/${leadId}`, updatedFormData, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      setEditSuccess(true);
      setIsEditModalOpen(false);
      setProfile(updatedFormData);

      // Add to history after successful save (client-side update for immediate feedback)
      setHistory([
        {
          date: new Date().toLocaleString(),
          updatedProfile: updatedFormData,
        },
        ...history,
      ]);
    } catch (err) {
      console.error("Failed to save profile", err);
      alert("Failed to save profile.");
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfile((prev) => ({ ...prev, avatar: imageUrl }));

      const formData = new FormData();
      formData.append("avatar", file);
      const token = localStorage.getItem("token");

      try {
        await axios.post(
          `${apiEndPoint}/lead/${leadId}/upload-avatar`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          }
        );
        // In a real app, you'd re-fetch the profile to get the actual URL from the backend
        // For this example, we're using the client-side URL for immediate display
        alert("Profile picture updated.");
      } catch (err) {
        console.error("Failed to upload avatar", err);
        alert("Failed to upload avatar.");
      }
    }
  };

  const handleAssignLead = async (e) => {
    const userId = e.target.value;
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `${apiEndPoint}/assigned-to`,
        {
          iassigned_by: 6, // This seems like a hardcoded value, consider making it dynamic
          iassigned_to: Number(userId),
          ilead_id: Number(leadId),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Lead assigned successfully.");

    } catch (err) {
      console.error("Failed to assign lead", err);
      alert("Failed to assign lead.");
    }
  };


  // Dropzone onDrop handler
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
  accept: {
    'application/pdf': ['.pdf'],
    'image/png': ['.png'],
    'image/jpeg': ['.jpg', '.jpeg']
  },
  maxFiles: 1,
  onDrop: (acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }
});


  // Upload handler triggered on clicking Upload button in modal
  const handleFileUpload = async () => {
     const token = localStorage.getItem("token");

     let userId = null;
         if (token) {
        const base64Payload = token.split(".")[1];
        const decodedPayload = atob(base64Payload);
        const payloadObject = JSON.parse(decodedPayload);
        userId = payloadObject.user_id;
      }

    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("attachment", selectedFile);
    formData.append("created_by", userId);
    formData.append("lead_id", Number(leadId));
    setUploading(true);

    try {
      await axios.post(`${apiEndPoint}/lead-attachments`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      await fetchAttachments(); // Re-fetch attachments to update the list
      alert("File uploaded successfully.");
      setSelectedFile(null);
      setIsAttachmentModalOpen(false); // Close the modal
    } catch (err) {
      console.error("Failed to upload attachment", err);
      alert("Failed to upload file.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!profile) return <div className="p-4 text-gray-700">No profile data found.</div>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-lg space-y-6 font-sans">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800">Lead Details</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowDetails(true)}
            className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            aria-label="View Full Details"
          >
            <FiEye size={20} />
          </button>
          <button
            onClick={handleEditProfile}
            className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-md"
            aria-label="Edit Profile"
          >
            <FiEdit size={20} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-5 pt-4">
        <div className="relative w-20 h-20 flex-shrink-0">
          <img
            src={profile.avatar || "https://i.pravatar.cc/150?img=1"}
            alt="Avatar"
            className="w-full h-full rounded-full object-cover border-2 border-gray-100 shadow-sm"
          />
          <label className="absolute -bottom-1 -right-1 bg-white p-2 rounded-full shadow-md cursor-pointer border border-gray-200 hover:bg-gray-50 transition-colors">
            <FiCamera className="w-5 h-5 text-gray-600" />
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </label>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">{profile.clead_name || "N/A"}</h3>
          <p className="text-sm text-gray-500">{profile.corganization || "N/A"}</p>
        </div>
      </div>

      <div className="text-base text-gray-700 space-y-3 pt-4">
        <div className="flex items-center gap-3">
          <FiPhone className="text-gray-500 w-5 h-5" />
          <span>{profile.iphone_no || "N/A"}</span>
        </div>
        <div className="flex items-center gap-3">
          <FiMail className="text-gray-500 w-5 h-5" />
          <span>{profile.cemail || "N/A"}</span>
        </div>
        <div className="flex items-start gap-3">
          <FiMapPin className="text-gray-500 w-5 h-5 mt-1" />
          <span>{profile.caddress || "N/A"}</span>
        </div>
        <div className="flex items-start gap-3">
  <TbWorld className="text-gray-500 w-5 h-5 mt-1" />
  {profile.cwebsite ? (
    <a
      href={profile.cwebsite.startsWith('http') ? profile.cwebsite : `https://${profile.cwebsite}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline"
    >
      {profile.cwebsite}
    </a>
  ) : (
    <span>N/A</span>
  )}
</div>
        <div className="flex items-start gap-3">
          <FiMove className="text-gray-500 w-5 h-5 mt-1" />
          <span>{profile?.status || "N/A"}</span>
        </div>
        <div className="flex items-start gap-3">
          <FiCodesandbox className="text-gray-500 w-5 h-5 mt-1" />
          <span>{profile.dcreated_at || "N/A"}</span>
        </div>

        {profile.bactive === false && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-semibold text-center mt-4">
            LOST LEAD
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 p-4 bg-gray-50 border border-gray-200 rounded-xl shadow-sm mt-5">
          <label htmlFor="assignUser" className="text-sm font-semibold text-gray-700 min-w-[90px]">
            Assign to:
          </label>
          <div className="relative w-full sm:w-64">
            <select
              id="assignUser"
              className="appearance-none w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm text-gray-800 bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
              onChange={handleAssignLead}
              defaultValue=""
            >
              <option value="" disabled>
                Select User
              </option>
              {users.map((user) => (
                <option key={user.iUser_id} value={user.iUser_id}>
                  {user.cUser_name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
              <svg
                className="w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Attachment Upload Section */}
        <div className="p-6 bg-gray-50 border border-gray-200 rounded-2xl shadow-sm mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Manage Attachments
          </label>

          <button
            onClick={() => setIsAttachmentModalOpen(true)}
            className="inline-flex items-center px-6 py-2 bg-blue-500 text-white text-sm font-semibold rounded-full hover:bg-blue-600 transition-colors shadow-md"
          >
            <FiUpload className="mr-2" /> Upload New File
          </button>

          {/* Display attachments list below */}
          <div className="mt-5 space-y-3">
            {attachments.length === 0 && (
              <p className="text-sm text-gray-500 italic">No attachments uploaded yet.</p>
            )}
           
         
{attachments.map((file) => {
  const filePath = file?.cattechment_path;
  const filename = filePath?.split("/").pop();

  return (
    <div
      key={file.ilead_id || filename}
      className="text-sm text-gray-800 bg-white border border-gray-200 rounded-lg p-3 shadow-sm flex justify-between items-center"
    >
      <span className="font-medium truncate max-w-[80%]">{filename}</span>
      <FilePreviewer filePath={filePath} apiBaseUrl={apiNoEndPoint} />
    </div>
  );
})}


          </div>
        </div>

        <Dialog open={isAttachmentModalOpen} onClose={() => setIsAttachmentModalOpen(false)} className="relative z-50">
          <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg">
              <Dialog.Title className="text-lg font-semibold text-gray-800 mb-4">Upload File</Dialog.Title>

              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                  isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400 bg-gray-50"
                }`}
              >
                <input {...getInputProps()} />
                {selectedFile ? (
                  <p className="text-sm text-gray-700 font-medium">{selectedFile.name}</p>
                ) : (
                  <>
                  <p className="text-sm text-gray-500">
                    Drag & drop a file here, or <span className="text-blue-500 font-medium">click to select</span>
                  </p>
                  <p  className="text-xs text-gray-400">
                    Only PDF,PNG and JPEG files can be uploaded</p>
                  </>      
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => { setIsAttachmentModalOpen(false); setSelectedFile(null); }}
                  className="px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleFileUpload}
                  disabled={!selectedFile || uploading}
                  className={`px-5 py-2 text-sm font-semibold rounded-lg text-white shadow-md ${
                    uploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                  } transition-colors`}
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>


        {/* Attachment List with Previews */}
        {Array.isArray(attachments) && attachments.map((file, i) => {
  const filename = file?.filename;
  const extension = filename?.includes(".") ? filename.split(".").pop() : "unknown";

  return (
    <div
      key={file?.id || i}
      className="text-sm text-gray-800 bg-white border border-gray-200 rounded-lg p-3 shadow-sm flex justify-between items-center"
    >
      {/* <div>
        <span className="font-medium truncate max-w-[80%]">
          {filename || "Unnamed file"}
        </span>
        <span className="ml-2 text-xs text-gray-500">({extension})</span>
      </div> */}

     {file?.url && (
  <a
    href={file.url}
    target="_blank"
    rel="noopener noreferrer"
    className="text-blue-500 hover:underline text-xs sm:text-sm flex items-center gap-1"
  >
    <FiEye size={16} /> View
  </a>
)}

    </div>
  );
})}

      </div>

      {editSuccess && (
        <div className="text-green-600 bg-green-50 border border-green-200 rounded-lg p-3 text-center text-sm mt-5">
          Profile updated successfully!
        </div>
      )}

      {isEditModalOpen && profile && (
        <EditProfileForm
          profile={profile}
          onClose={handleCloseEditModal}
          onSave={handleSaveProfile}
        />
      )}

      {showDetails && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-lg relative">
            <button
              onClick={() => setShowDetails(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FiX size={24} />
            </button>
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Full Profile Details</h3>
            <div className="space-y-4 text-base text-gray-700">
              <div className="flex items-center gap-3">
                <FiPhone className="text-gray-500 w-5 h-5" />
                <span><span className="font-medium">Phone:</span> {profile.iphone_no || "N/A"}</span>
              </div>
              <div className="flex items-center gap-3">
                <FiMail className="text-gray-500 w-5 h-5" />
                <span><span className="font-medium">Email:</span> {profile.cemail || "N/A"}</span>
              </div>
              <div className="flex items-start gap-3">
                <FiMapPin className="text-gray-500 w-5 h-5 mt-1" />
                <span><span className="font-medium">Address:</span> {profile.caddress || "N/A"}</span>
              </div>
              <div className="flex items-start gap-3">
                <TbWorld className="text-gray-500 w-5 h-5 mt-1" />
                <span><span className="font-medium">Website:</span> {profile.cwebsite || "N/A"}</span>
              </div>
              <div className="flex items-start gap-3">
                <FiMove className="text-gray-500 w-5 h-5 mt-1" />
                <span><span className="font-medium">Status:</span> {profile?.status || "N/A"}</span>
              </div>
              <div className="flex items-start gap-3">
                <FiCodesandbox className="text-gray-500 w-5 h-5 mt-1" />
                <span><span className="font-medium">Created At:</span> {profile.dcreated_at || "N/A"}</span>
              </div>
              {/* Add any other detailed fields here that are not on the main card */}
            </div>

            {/* History Section - Optional, but good for "details" */}
            <h3 className="text-lg font-semibold text-gray-800 mt-8 mb-4 border-t pt-4 border-gray-100">Profile Update History</h3>
            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="text-gray-500 italic">No history available.</div>
              ) : (
                history.map((entry, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-100">
                    <p className="font-semibold text-sm text-gray-700 mb-2">
                      Updated on: {entry.date}
                    </p>
                    <div className="text-sm text-gray-600 space-y-1">
                      {entry.updatedProfile?.clead_name && <div><span className="font-medium">Name:</span> {entry.updatedProfile.clead_name}</div>}
                      {entry.updatedProfile?.cemail && <div><span className="font-medium">Email:</span> {entry.updatedProfile.cemail}</div>}
                      {entry.updatedProfile?.iphone_no && <div><span className="font-medium">Phone:</span> {entry.updatedProfile.iphone_no}</div>}
                      {entry.updatedProfile?.caddress && <div><span className="font-medium">Address:</span> {entry.updatedProfile.caddress}</div>}
                      {/* Add other updated fields to history display if needed */}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileCard;