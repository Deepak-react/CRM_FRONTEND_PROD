import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, X, Calendar, User } from 'lucide-react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  Autocomplete,
  IconButton,
} from '@mui/material';
import { useToast } from '../context/ToastContext';
import Confetti from 'react-confetti';
import axios from 'axios';
import { ENDPOINTS } from '../api/constraints';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

const mandatoryInputStages = ['Proposal', 'Won'];
const MAX_REMARK_LENGTH = 500;
const MAX_NOTES_LENGTH = 200;
const MAX_PLACE_LENGTH = 200;

const StatusBar = ({ leadId, leadData, isLost, isWon }) => {
  const [stages, setStages] = useState([]);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [statusRemarks, setStatusRemarks] = useState([]);
  const [error, setError] = useState(null);
  const [stageStatuses, setStageStatuses] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogValue, setDialogValue] = useState({
    demoSessionType: '',
    demoSessionStartTime: null,
    demoSessionEndTime: null,
    notes: '',
    place: '',
    demoSessionAttendees: [],
    presentedByUsers: [],
  });
  const [dialogErrors, setDialogErrors] = useState({
    demoSessionType: '',
    demoSessionStartTime: '',
    demoSessionEndTime: '',
    notes: '',
    place: '',
    demoSessionAttendees: '',
    presentedByUsers: '',
    amount: '',
  });
  const [dialogStageIndex, setDialogStageIndex] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [users, setUsers] = useState([]);
  const { showToast } = useToast();
  const [showRemarkDialog, setShowRemarkDialog] = useState(false);
  const [remarkData, setRemarkData] = useState({ remark: '', projectValue: '' });
  const [remarkErrors, setRemarkErrors] = useState({
    remark: '',
    projectValue: '',
  });
  const [remarkStageId, setRemarkStageId] = useState(null);
  const [selectedRemark, setSelectedRemark] = useState(null);
  const [demoSessions, setDemoSessions] = useState([]);

  const validateDemoSession = () => {
    let isValid = true;
    const newErrors = {
      demoSessionType: '',
      demoSessionStartTime: '',
      demoSessionEndTime: '',
      notes: '',
      place: '',
      demoSessionAttendees: '',
      presentedByUsers: '',
    };

    if (!dialogValue.demoSessionType) {
      newErrors.demoSessionType = 'Session type is required';
      isValid = false;
    } else if (!['online', 'offline'].includes(dialogValue.demoSessionType.toLowerCase())) {
      newErrors.demoSessionType = 'Invalid session type (must be online or offline)';
      isValid = false;
    }

    if (!dialogValue.demoSessionStartTime) {
      newErrors.demoSessionStartTime = 'Start time is required';
      isValid = false;
    } else if (new Date(dialogValue.demoSessionStartTime) < new Date()) {
      newErrors.demoSessionStartTime = 'Start time cannot be in the past';
      isValid = false;
    }

    if (!dialogValue.demoSessionEndTime) {
      newErrors.demoSessionEndTime = 'End time is required';
      isValid = false;
    } else if (dialogValue.demoSessionStartTime && 
               new Date(dialogValue.demoSessionEndTime) <= new Date(dialogValue.demoSessionStartTime)) {
      newErrors.demoSessionEndTime = 'End time must be after start time';
      isValid = false;
    }

    if (!dialogValue.notes.trim()) {
      newErrors.notes = 'Notes are required';
      isValid = false;
    } else if (dialogValue.notes.length > MAX_NOTES_LENGTH) {
      newErrors.notes = `Notes cannot exceed ${MAX_NOTES_LENGTH} characters`;
      isValid = false;
    }

    if (!dialogValue.place.trim()) {
      newErrors.place = 'Place/link is required';
      isValid = false;
    } else if (dialogValue.place.length > MAX_PLACE_LENGTH) {
      newErrors.place = `Place/link cannot exceed ${MAX_PLACE_LENGTH} characters`;
      isValid = false;
    }

    if (dialogValue.demoSessionAttendees.length === 0) {
      newErrors.demoSessionAttendees = 'At least one attendee is required';
      isValid = false;
    }

    if (dialogValue.presentedByUsers.length === 0) {
      newErrors.presentedByUsers = 'At least one presenter is required';
      isValid = false;
    }

    setDialogErrors(newErrors);
    return isValid;
  };

  const validateAmount = (amount) => {
    if (!amount) {
      setDialogErrors({ ...dialogErrors, amount: 'Amount is required' });
      return false;
    }
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
      setDialogErrors({ ...dialogErrors, amount: 'Amount must be a valid number' });
      return false;
    }
    
    if (numAmount <= 0) {
      setDialogErrors({ ...dialogErrors, amount: 'Amount must be greater than 0' });
      return false;
    }
    
    setDialogErrors({ ...dialogErrors, amount: '' });
    return true;
  };

  const validateRemark = () => {
    let isValid = true;
    const newErrors = {
      remark: '',
      projectValue: '',
    };

    if (!remarkData.remark.trim()) {
      newErrors.remark = 'Remark is required';
      isValid = false;
    } else if (remarkData.remark.length > MAX_REMARK_LENGTH) {
      newErrors.remark = `Remark cannot exceed ${MAX_REMARK_LENGTH} characters`;
      isValid = false;
    }

    if (remarkData.projectValue && isNaN(parseFloat(remarkData.projectValue))) {
      newErrors.projectValue = 'Project value must be a valid number';
      isValid = false;
    } else if (remarkData.projectValue && parseFloat(remarkData.projectValue) < 0) {
      newErrors.projectValue = 'Project value cannot be negative';
      isValid = false;
    }

    setRemarkErrors(newErrors);
    return isValid;
  };

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
                bactive: item.bactive,
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

  const fetchDemoSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${ENDPOINTS.DEMO_SESSION}?leadId=${leadId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      setDemoSessions(response.data.Message || []);
    } catch (error) {
      console.error('Error fetching demo sessions:', error.message);
    }
  };

  useEffect(() => {
    fetchStages();
    fetchUsers();
    fetchDemoSessions();
  }, []);

  useEffect(() => {
    if (stages.length && leadData) {
      const index = stages.findIndex(stage => stage.id === leadData.ileadstatus_id);
      if (index !== -1) setCurrentStageIndex(index);
    }
  }, [stages, leadData]);

  const formatDateOnly = dateString => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
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
        demoSessionStartTime: new Date(),
        demoSessionEndTime: null,
        notes: '',
        place: '',
        demoSessionAttendees: [],
        presentedByUsers: [],
      });
      setDialogErrors({
        demoSessionType: '',
        demoSessionStartTime: '',
        demoSessionEndTime: '',
        notes: '',
        place: '',
        demoSessionAttendees: '',
        presentedByUsers: '',
      });
      setOpenDialog(true);
      return;
    }

    if (mandatoryInputStages.map(i => i.toLowerCase()).includes(stageName?.toLowerCase())) {
      setDialogValue('');
      setDialogErrors({ ...dialogErrors, amount: '' });
      setOpenDialog(true);
      return;
    }

    setRemarkStageId(statusId);
    setRemarkData({ remark: '', projectValue: '' });
    setRemarkErrors({ remark: '', projectValue: '' });
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
        if (!validateDemoSession()) return;

        const {
          demoSessionType,
          demoSessionStartTime,
          demoSessionEndTime,
          notes,
          place,
          demoSessionAttendees,
          presentedByUsers,
        } = dialogValue;

        const body = {
          demoSessionType,
          demoSessionStartTime: demoSessionStartTime.toISOString(),
          demoSessionEndTime: demoSessionEndTime.toISOString(),
          notes,
          place,
          leadId: parseInt(leadId),
          demoSessionAttendees: demoSessionAttendees.map(u => ({ attendeeId: u.iUser_id })),
          presentedByUsers: presentedByUsers.map(u => ({ presenetedUserId: u.iUser_id })),
        };

        await axios.post(`${ENDPOINTS.DEMO_SESSION_DETAILS}`, body, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        showToast('success', 'Demo session details saved!');
      } else {
        if (!validateAmount(dialogValue)) return;

        const amount = parseFloat(dialogValue);
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
      setRemarkErrors({ remark: '', projectValue: '' });
      setShowRemarkDialog(true);
      setOpenDialog(false);
    } catch (e) {
      showToast('error', e?.response?.data?.message || e.message || 'Something went wrong');
    }
  };

  const handleRemarkSubmit = async () => {
    if (!validateRemark()) return;

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
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="w-11/12 md:w-5/6 lg:w-4/5 xl:w-[90%] mx-auto px-4 py-6">
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}

        <div className="flex items-center justify-between w-full">
          {stages.map((stage, index) => {
            const isCompleted = index < currentStageIndex;
            const isActive = index === currentStageIndex;
            const isClickable = index > currentStageIndex && !isLost && !isWon && stage.bactive;
            const matchedRemark = statusRemarks.find(r => r.lead_status_id === stage.id);

            return (
              <React.Fragment key={stage.id}>
                <div className="flex flex-col items-center flex-1">
                  <div
                    onClick={() => (isClickable ? handleStageClick(index, stage.id) : null)}
                    className={`relative flex items-center justify-center w-10 h-10 rounded-full
                      ${
                        isCompleted
                          ? 'bg-green-600 text-white'
                          : isActive
                          ? 'bg-blue-600 text-white'
                          : isClickable
                          ? 'bg-gray-300 hover:bg-gray-400 cursor-pointer'
                          : stage.bactive === false
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }
                      transition-colors duration-200`}
                    title={
                      stage.bactive === false
                        ? 'This status is inactive'
                        : matchedRemark
                        ? matchedRemark.lead_status_remarks
                        : ''
                    }
                  >
                    {isCompleted ? <CheckCircle size={20} /> : <Circle size={20} />}
                  </div>
                  <span
                    className={`mt-2 text-sm text-center ${
                      stage.bactive === false ? 'text-gray-400' : ''
                    }`}
                  >
                    {stage.name}
                    {stage.bactive === false && (
                      <span className="block text-xs text-red-500">(Inactive)</span>
                    )}
                  </span>
                </div>
                {index < stages.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 -mt-12 z-0
                      ${
                        isCompleted
                          ? 'border-t-2 border-dotted border-green-600'
                          : 'border-t-2 border-dotted border-gray-300'
                      }`}
                  ></div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {isWon && (
          <div className="flex justify-center mt-4">
            <div className="flex items-center gap-2 text-green-600 text-lg font-semibold bg-green-50 px-4 py-2 rounded-full shadow">
              <span role="img" aria-label="deal">
                🎉
              </span>{' '}
              WON
            </div>
          </div>
        )}

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
                  renderInput={params => (
                    <TextField
                      {...params}
                      label="Session Type *"
                      sx={{ mt: 2 }}
                      error={!!dialogErrors.demoSessionType}
                      helperText={dialogErrors.demoSessionType}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
                <DateTimePicker
                  label="Start Time *"
                  value={dialogValue.demoSessionStartTime}
                  onChange={newValue =>
                    setDialogValue(prev => ({ ...prev, demoSessionStartTime: newValue }))
                  }
                  format="dd/MM/yyyy hh:mm a"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: { mt: 2 },
                      error: !!dialogErrors.demoSessionStartTime,
                      helperText: dialogErrors.demoSessionStartTime,
                      InputLabelProps: { shrink: true },
                    },
                  }}
                />
                <DateTimePicker
                  label="End Time *"
                  value={dialogValue.demoSessionEndTime}
                  onChange={newValue =>
                    setDialogValue(prev => ({ ...prev, demoSessionEndTime: newValue }))
                  }
                  format="dd/MM/yyyy hh:mm a"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: { mt: 2 },
                      error: !!dialogErrors.demoSessionEndTime,
                      helperText: dialogErrors.demoSessionEndTime,
                      InputLabelProps: { shrink: true },
                    },
                  }}
                />
                <TextField
                  label="Notes *"
                  fullWidth
                  multiline
                  rows={2}
                  sx={{ mt: 2 }}
                  value={dialogValue.notes || ''}
                  onChange={e => {
                    if (e.target.value.length <= MAX_NOTES_LENGTH) {
                      setDialogValue(prev => ({ ...prev, notes: e.target.value }));
                    }
                  }}
                  error={!!dialogErrors.notes}
                  helperText={
                    dialogErrors.notes || 
                    `${dialogValue.notes.length}/${MAX_NOTES_LENGTH} characters`
                  }
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Place / Link *"
                  fullWidth
                  sx={{ mt: 2 }}
                  value={dialogValue.place || ''}
                  onChange={e => {
                    if (e.target.value.length <= MAX_PLACE_LENGTH) {
                      setDialogValue(prev => ({ ...prev, place: e.target.value }));
                    }
                  }}
                  error={!!dialogErrors.place}
                  helperText={
                    dialogErrors.place || 
                    `${dialogValue.place.length}/${MAX_PLACE_LENGTH} characters`
                  }
                  InputLabelProps={{ shrink: true }}
                />
                <Autocomplete
                  multiple
                  options={users}
                  getOptionLabel={option => option?.cFull_name || ''}
                  isOptionEqualToValue={(option, value) => option.iUser_id === value.iUser_id}
                  value={dialogValue.demoSessionAttendees || []}
                  onChange={(e, newValue) =>
                    setDialogValue(prev => ({ ...prev, demoSessionAttendees: newValue }))
                  }
                  renderInput={params => (
                    <TextField
                      {...params}
                      label="Attendees *"
                      sx={{ mt: 2 }}
                      error={!!dialogErrors.demoSessionAttendees}
                      helperText={dialogErrors.demoSessionAttendees}
                    />
                  )}
                />
                <Autocomplete
                  multiple
                  options={users}
                  getOptionLabel={option => option?.cFull_name || ''}
                  isOptionEqualToValue={(option, value) => option.iUser_id === value.iUser_id}
                  value={dialogValue.presentedByUsers || []}
                  onChange={(e, newValue) =>
                    setDialogValue(prev => ({ ...prev, presentedByUsers: newValue }))
                  }
                  renderInput={params => (
                    <TextField
                      {...params}
                      label="Presented By *"
                      sx={{ mt: 2 }}
                      error={!!dialogErrors.presentedByUsers}
                      helperText={dialogErrors.presentedByUsers}
                    />
                  )}
                />
              </>
            ) : (
              <TextField
                label="Enter Value *"
                fullWidth
                type="number"
                value={dialogValue}
                onChange={e => {
                  setDialogValue(e.target.value);
                  if (dialogErrors.amount) {
                    validateAmount(e.target.value);
                  }
                }}
                sx={{ mt: 2 }}
                error={!!dialogErrors.amount}
                helperText={dialogErrors.amount}
                InputLabelProps={{ shrink: true }}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleDialogSave} variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={showRemarkDialog} onClose={() => setShowRemarkDialog(false)}>
          <DialogTitle>Enter Remark</DialogTitle>
          <DialogContent>
            <TextField
              label="Remark *"
              fullWidth
              multiline
              rows={3}
              value={remarkData.remark}
              onChange={e => {
                if (e.target.value.length <= MAX_REMARK_LENGTH) {
                  setRemarkData(prev => ({ ...prev, remark: e.target.value }));
                }
              }}
              error={!!remarkErrors.remark}
              helperText={
                remarkErrors.remark || 
                `${remarkData.remark.length}/${MAX_REMARK_LENGTH} characters`
              }
              sx={{ mt: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Project Value (optional)"
              type="number"
              fullWidth
              value={remarkData.projectValue}
              onChange={e => setRemarkData(prev => ({ ...prev, projectValue: e.target.value }))}
              error={!!remarkErrors.projectValue}
              helperText={remarkErrors.projectValue}
              sx={{ mt: 2 }}
              InputLabelProps={{ shrink: true }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowRemarkDialog(false)}>Cancel</Button>
            <Button onClick={handleRemarkSubmit} variant="contained">
              Submit
            </Button>
          </DialogActions>
        </Dialog>

        {statusRemarks.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Remarks Timeline</h3>
            <div className="flex overflow-x-auto space-x-4 px-2 py-4 relative custom-scrollbar">
              {statusRemarks.map((remark, index) => (
                <div key={remark.ilead_status_remarks_id} className="relative flex-shrink-0">
                  {index !== statusRemarks.length - 1 && (
                    <div className="absolute top-1/2 left-full w-6 h-1 bg-gray-400 transform -translate-y-1/2 z-0"></div>
                  )}
                  <div
                    className="font-sans bg-white w-[calc((90vw*0.9)/5)] min-w-[200px] max-w-[350px] shadow-xxl rounded-3xl p-4 space-y-2 flex flex-col justify-between min-h-40 max-h-40 overflow-hidden z-10 cursor-pointer transition"
                    onClick={() => setSelectedRemark(remark)}
                  >
                    <div className="space-y-2 text-sm">
                      <p className="text-sm break-words line-clamp-3">
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

        <Dialog
          open={!!selectedRemark}
          onClose={() => setSelectedRemark(null)}
          PaperProps={{
            sx: {
              borderRadius: '18px',
              overflow: 'hidden',
            },
          }}
        >
          <DialogTitle
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '16px 24px 0',
              position: 'relative',
              color: '#333',
              fontSize: '1.25rem',
              fontWeight: 'bold',
            }}
          >
            Timeline Detail
            <IconButton
              aria-label="close"
              onClick={() => setSelectedRemark(null)}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: theme => theme.palette.grey[500],
                backgroundColor: 'rgba(0,0,0,0.05)',
                borderRadius: '0%',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.1)',
                },
              }}
            >
              <X size={15} />
            </IconButton>
          </DialogTitle>
          <DialogContent
            sx={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              minWidth: { xs: '90%', sm: '350px', md: '400px' },
              maxWidth: '450px',
            }}
          >
            {selectedRemark && (
              <>
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center mb-4"
                  style={{
                    backgroundColor: '#4CAF50',
                    boxShadow: '0px 5px 15px rgba(0,0,0,0.1)',
                  }}
                >
                  <span className="text-white text-base font-semibold">
                    {selectedRemark.status_name || '-'}
                  </span>
                </div>

                <p className="text-xl font-bold text-gray-900 mb-4">
                  {selectedRemark.status_name || '-'}
                </p>

                <p className="text-sm text-gray-700 break-words w-3/4 p-6 leading-relaxed mb-6">
                  {selectedRemark.lead_status_remarks}
                </p>

                <div className="w-full flex justify-between items-center text-gray-600 text-xs">
                  <div className="flex items-center gap-1">
                    <Calendar size={16} className="text-gray-900" />
                    <span className="text-red-600">
                      {formatDateOnly(selectedRemark.dcreated_dt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User size={16} className="text-gray-900" />
                    <span className="text-red-600">{selectedRemark.createdBy || '-'}</span>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {showConfetti && <Confetti />}
      </div>
    </LocalizationProvider>
  );
};

export default StatusBar;