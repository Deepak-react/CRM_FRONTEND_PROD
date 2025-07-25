import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  Autocomplete,
} from '@mui/material';
import { useToast } from '../context/ToastContext';
import Confetti from 'react-confetti';
import axios from 'axios';
import { ENDPOINTS } from '../api/constraints';

// Import from @mui/x-date-pickers
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';


const mandatoryInputStages = ['Proposal', 'Won'];

const StatusBar = ({ leadId, leadData, isLost, isWon }) => {
  const [stages, setStages] = useState([]);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [statusRemarks, setStatusRemarks] = useState([]);
  const [error, setError] = useState(null);
  const [stageStatuses, setStageStatuses] = useState({});

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogValue, setDialogValue] = useState({
    demoSessionType: '',
    demoSessionStartTime: null, // Change to null for initial state with DateTimePicker
    demoSessionEndTime: null,   // Change to null
    notes: '',
    place: '',
    demoSessionAttendees: [],
  });
  const [dialogStageIndex, setDialogStageIndex] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [users, setUsers] = useState([]);
  const { showToast } = useToast();
  const [showRemarkDialog, setShowRemarkDialog] = useState(false);
  const [remarkData, setRemarkData] = useState({ remark: '', projectValue: '' });
  const [remarkStageId, setRemarkStageId] = useState(null);
  const [selectedRemark, setSelectedRemark] = useState(null);

  const fetchStages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${ENDPOINTS.LEAD_STATUS}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (!response.ok) throw new Error('Failed to fetch stages');
      const data = await response.json();

      const statusMap = {};
      const formattedStages = Array.isArray(data.response)
        ? data.response
            .map(item => {
              statusMap[item.ilead_status_id] = item.bactive;
              return {
                id: item.ilead_status_id,
                name: item.clead_name,
                order: item.orderId || 9999,
                bactive: item.bactive
              };
            })
            .sort((a, b) => a.order - b.order)
        : [];

      setStages(formattedStages);
      setStageStatuses(statusMap);
    } catch (err) {
      setError(err.message || 'Unable to fetch stage data');
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${ENDPOINTS.USERS}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error.message);
    }
  };

  useEffect(() => {
    fetchStages();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (stages.length && leadData) {
      const index = stages.findIndex(stage => stage.id === leadData.ileadstatus_id);
      if (index !== -1) setCurrentStageIndex(index);
    }
  }, [stages, leadData]);

  // Helper function to format date to DD/MM/YYYY
  const formatDateOnly = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleStageClick = (clickedIndex, statusId) => {
    if (stageStatuses[statusId] === false) {
      showToast('error', 'This status is currently inactive and cannot be selected');
      return;
    }

    if (isLost || isWon) {
      showToast('info', 'Cannot change status for a lost or won lead.');
      return;
    }

    if (clickedIndex <= currentStageIndex) {
      showToast('info', 'Cannot go back or re-select current stage.');
      return;
    }

    const stageName = stages[clickedIndex]?.name;
    setDialogStageIndex(clickedIndex);

    if (stageName?.toLowerCase().includes('demo')) {
      setDialogValue({
        demoSessionType: '',
        demoSessionStartTime: new Date(), // Initialize with current Date object
        demoSessionEndTime: null,       // Initialize as null
        notes: '',
        place: '',
        demoSessionAttendees: [],
      });
      setOpenDialog(true);
      return;
    }

    if (mandatoryInputStages.map(i => i.toLowerCase()).includes(stageName?.toLowerCase())) {
      setDialogValue('');
      setOpenDialog(true);
      return;
    }

    setRemarkStageId(statusId);
    setRemarkData({ remark: '', projectValue: '' });
    setShowRemarkDialog(true);
  };

  const updateStage = async (newIndex, statusId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${ENDPOINTS.LEAD_STATUS_UPDATE}/${leadId}/status/${statusId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) throw new Error('Failed to update status');

      setCurrentStageIndex(newIndex);

      if (stages[newIndex].name?.toLowerCase() === 'won') {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    } catch (e) {
      showToast('error', e.message || 'Error updating status');
    }
  };

  const handleDialogSave = async () => {
    const token = localStorage.getItem('token');
    const userId = JSON.parse(localStorage.getItem('user'));
    const stageName = stages[dialogStageIndex]?.name;
    const statusId = stages[dialogStageIndex]?.id;

    try {
      if (stageName?.toLowerCase().includes('demo')) {
        const {
          demoSessionType,
          demoSessionStartTime,
          demoSessionEndTime,
          notes,
          place,
          demoSessionAttendees,
        } = dialogValue;

        if (
          !demoSessionType ||
          !demoSessionStartTime ||
          !demoSessionEndTime ||
          !notes ||
          !place ||
          !demoSessionAttendees.length
        ) {
          showToast('error', 'Please fill all mandatory demo session fields');
          return;
        }

        // demoSessionStartTime and demoSessionEndTime are now Date objects
        if (demoSessionStartTime >= demoSessionEndTime) {
          showToast('error', 'Start time must be earlier than end time');
          return;
        }

        const body = {
          demoSessionType,
          demoSessionStartTime: demoSessionStartTime.toISOString(), // Convert to ISO string for API
          demoSessionEndTime: demoSessionEndTime.toISOString(),     // Convert to ISO string for API
          notes,
          place,
          leadId: parseInt(leadId),
          demoSessionAttendees: demoSessionAttendees.map(u => ({ attendeeId: u.iUser_id })),
        };

        await axios.post(`${ENDPOINTS.DEMO_SESSION_DETAILS}`, body, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        showToast('success', 'Demo session details saved!');
      } else {
        const amount = parseFloat(dialogValue);
        if (isNaN(amount) || amount <= 0) {
          showToast('error', 'Please enter a valid amount');
          return;
        }

        const body = {
          caction: stageName,
          iaction_doneby: userId.iUser_id,
          iamount: amount,
          ilead_id: parseInt(leadId),
        };

        await axios.post(`${ENDPOINTS.LEAD_STATUS_ACTION}`, body, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        showToast('success', `${stageName} details saved!`);
      }

      setRemarkStageId(statusId);
      setRemarkData({ remark: '', projectValue: '' });
      setShowRemarkDialog(true);
      setOpenDialog(false);
    } catch (e) {
      showToast('error', e?.response?.data?.message || e.message || 'Something went wrong');
    }
  };

  const handleRemarkSubmit = async () => {
    if (!remarkData.remark.trim()) {
      showToast('error', 'Remark is required');
      return;
    }

    const token = localStorage.getItem('token');
    const userId = JSON.parse(localStorage.getItem('user'));
    const payload = {
      remark: remarkData.remark.trim(),
      leadId: parseInt(leadId),
      leadStatusId: remarkStageId,
      createBy: userId.iUser_id,
      ...(remarkData.projectValue && { projectValue: parseFloat(remarkData.projectValue) }),
    };

    try {
      await axios.post(ENDPOINTS.STATUS_REMARKS, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      showToast('success', 'Remark submitted!');
      const newIndex = stages.findIndex(s => s.id === remarkStageId);
      await updateStage(newIndex, remarkStageId);
      setShowRemarkDialog(false);
      await getStatusRemarks();
    } catch (err) {
      const serverMsg = err.response?.data?.Message;
      const issues = Array.isArray(serverMsg?.issues)
        ? serverMsg.issues.join(', ')
        : serverMsg?.message || 'Failed to submit remark';

      showToast('error', issues);
    }
  };

  const getStatusRemarks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${ENDPOINTS.STATUS_REMARKS}/${leadId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (Array.isArray(response.data?.Response)) {
        setStatusRemarks(response.data.Response);
      }
    } catch (e) {
      console.error('Error fetching remarks:', e.message);
    }
  };

  useEffect(() => {
    getStatusRemarks();
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}> {/* Wrap with LocalizationProvider */}
      <div className="w-full px-2 py-6">
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}

        <div className="flex items-center justify-between relative">
          {stages.map((stage, index) => {
            const isCompleted = index < currentStageIndex;
            const isActive = index === currentStageIndex;
            const isClickable = index > currentStageIndex && !isLost && !isWon && stage.bactive;
            const matchedRemark = statusRemarks.find((r) => r.lead_status_id === stage.id);

            return (
              <div key={stage.id} className="flex flex-col items-center flex-1">
                <div
                  onClick={() => isClickable ? handleStageClick(index, stage.id) : null}
                  className={`relative flex items-center justify-center w-10 h-10 rounded-full
                    ${isCompleted
                      ? 'bg-green-600 text-white'
                      : isActive
                      ? 'bg-blue-600 text-white'
                      : isClickable
                      ? 'bg-gray-300 hover:bg-gray-400 cursor-pointer'
                      : stage.bactive === false
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'}
                    transition-colors duration-200`}
                  title={stage.bactive === false
                    ? 'This status is inactive'
                    : matchedRemark ? matchedRemark.lead_status_remarks : ''}
                >
                  {isCompleted ? <CheckCircle size={20} /> : <Circle size={20} />}
                </div>
                <span className={`mt-2 text-sm text-center ${
                  stage.bactive === false ? 'text-gray-400' : ''
                }`}>
                  {stage.name}
                  {stage.bactive === false && (
                    <span className="block text-xs text-red-500">(Inactive)</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>

        {isWon && (
          <div className="flex justify-center mt-4">
            <div className="flex items-center gap-2 text-green-600 text-lg font-semibold bg-green-50 px-4 py-2 rounded-full shadow">
              <span role="img" aria-label="deal">🎉</span> WON
            </div>
          </div>
        )}

        {/* Dialogs for stage info and remarks */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Enter Details</DialogTitle>
          <DialogContent>
            {stages[dialogStageIndex]?.name?.toLowerCase().includes('demo') ? (
              <>
                <Autocomplete
                  fullWidth
                  options={['online', 'offline']}
                  value={dialogValue.demoSessionType || ''}
                  onChange={(e, newValue) =>
                    setDialogValue(prev => ({ ...prev, demoSessionType: newValue }))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={<span>Session Type <span className="text-red-600">*</span></span>}
                      sx={{ mt: 2 }}
                      // required
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
                <DateTimePicker
                  label={<span>Start Time <span className="text-red-600">*</span></span>}
                  value={dialogValue.demoSessionStartTime}
                  onChange={(newValue) =>
                    setDialogValue(prev => ({ ...prev, demoSessionStartTime: newValue }))
                  }
                  format="dd/MM/yyyy hh:mm a" // Explicitly set display format
                  slotProps={{ textField: { fullWidth: true, sx: { mt: 2 }, InputLabelProps: { shrink: true } } }}
                />
                <DateTimePicker
                  label={<span>End Time <span className="text-red-600">*</span></span>}
                  value={dialogValue.demoSessionEndTime}
                  onChange={(newValue) =>
                    setDialogValue(prev => ({ ...prev, demoSessionEndTime: newValue }))
                  }
                  format="dd/MM/yyyy hh:mm a" // Explicitly set display format
                  slotProps={{ textField: { fullWidth: true, sx: { mt: 2 }, InputLabelProps: { shrink: true } } }}
                />
                <TextField
                  label={<span>Notes <span className="text-red-600">*</span></span>}
                  fullWidth
                  multiline
                  rows={2}
                  sx={{ mt: 2 }}
                  value={dialogValue.notes || ''}
                  onChange={(e) =>
                    setDialogValue(prev => ({ ...prev, notes: e.target.value }))
                  }
                  // required
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label={<span>Place / Link <span className="text-red-600">*</span></span>}
                  fullWidth
                  sx={{ mt: 2 }}
                  value={dialogValue.place || ''}
                  onChange={(e) =>
                    setDialogValue(prev => ({ ...prev, place: e.target.value }))
                  }
                  // required
                  InputLabelProps={{ shrink: true }}
                />
                <Autocomplete
                  multiple
                  options={users}
                  getOptionLabel={(option) => option?.cFull_name || ''}
                  isOptionEqualToValue={(option, value) => option.iUser_id === value.iUser_id}
                  value={dialogValue.demoSessionAttendees || []}
                  onChange={(e, newValue) =>
                    setDialogValue(prev => ({ ...prev, demoSessionAttendees: newValue }))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={<span>Attendees <span className="text-red-600">*</span></span>}
                      sx={{ mt: 2 }}
                      // required
                    />
                  )}
                />
              </>
            ) : (
              <TextField
                label={<span>Enter Value <span className="text-red-600">*</span></span>}
                fullWidth
                type="number"
                value={dialogValue}
                onChange={(e) => setDialogValue(e.target.value)}
                sx={{ mt: 2 }}
                // required
                InputLabelProps={{ shrink: true }}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleDialogSave} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={showRemarkDialog} onClose={() => setShowRemarkDialog(false)}>
          <DialogTitle>Enter Remark</DialogTitle>
          <DialogContent>
            <TextField
              label={<span>Remark <span className="text-red-600">*</span></span>}
              fullWidth
              multiline
              rows={3}
              // required
              value={remarkData.remark}
              onChange={(e) => setRemarkData(prev => ({ ...prev, remark: e.target.value }))}
              sx={{ mt: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Project Value (optional)"
              type="number"
              fullWidth
              value={remarkData.projectValue}
              onChange={(e) => setRemarkData(prev => ({ ...prev, projectValue: e.target.value }))}
              sx={{ mt: 2 }}
              InputLabelProps={{ shrink: true }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowRemarkDialog(false)}>Cancel</Button>
            <Button onClick={handleRemarkSubmit} variant="contained">Submit</Button>
          </DialogActions>
        </Dialog>

        {statusRemarks.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Remarks Timeline</h3>
            <div className="flex w-full overflow-x-scroll space-x-4 px-2 py-4 relative">
              {statusRemarks.map((remark, index) => (
                <div key={remark.ilead_status_remarks_id} className="relative flex-shrink-0">
                  {index !== statusRemarks.length - 1 && (
                    <div className="absolute top-1/2 left-full w-6 h-1 bg-gray-400 transform -translate-y-1/2 z-0"></div>
                  )}
                  <div
                    className="font-sans bg-white w-[200px] shadow-xxl border border-blue-700 border-l-4 border-r-blue-800 rounded-3xl p-4 space-y-2 min-h-40 max-h-40 overflow-hidden z-10 cursor-pointer transition"
                    onClick={() => setSelectedRemark(remark)}
                  >
                    <div className="space-y-2 text-sm">
                      <p className="text-sm break-words line-clamp-2">
                        <strong>Remark:</strong> {remark.lead_status_remarks}
                      </p>
                      <p className="text-sm">
                        <strong>Created By:</strong> {remark.createdBy || '-'}
                      </p>
                      <p className="text-sm">
                        <strong>Date:</strong> {formatDateOnly(remark.dcreated_dt)}
                      </p>
                      <p className="text-sm">
                        <strong>Status:</strong> {remark.status_name}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Dialog open={!!selectedRemark} onClose={() => setSelectedRemark(null)}>
          <DialogTitle>Remark Details</DialogTitle>
          <DialogContent dividers sx={{ borderRadius: '12px' }}>
            {selectedRemark && (
              <div className="space-y-2 text-sm">
                <p className="text-sm break-words"><strong>Remark:</strong> {selectedRemark.lead_status_remarks}</p>
                <p className="text-sm"><strong>Created By:</strong> {selectedRemark.createdBy || '-'}</p>
                <p className="text-sm">
                  <strong>Date:</strong> {formatDateOnly(selectedRemark.dcreated_dt)}
                </p>
                <p className="text-sm"><strong>Status:</strong> {selectedRemark.status_name}</p>
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedRemark(null)}>Close</Button>
          </DialogActions>
        </Dialog>

        {showConfetti && <Confetti />}
      </div>
    </LocalizationProvider>
  );
};

export default StatusBar;