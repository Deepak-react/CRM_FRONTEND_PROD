import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle } from 'lucide-react'; // Install lucide-react if not already

import {
  Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button,
} from '@mui/material';
import { useToast } from '../context/ToastContext';
import Confetti from 'react-confetti';
import axios from "axios";
import { ENDPOINTS } from '../api/constraints';

const mandatoryInputStages = ['Proposal', 'Demo', 'Won'];

const StatusBar = ({ leadId, leadData }) => {
  const [stages, setStages] = useState([]);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [error, setError] = useState(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogValue, setDialogValue] = useState('');
  const [dialogStageIndex, setDialogStageIndex] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const { showToast } = useToast();

  const fetchStages = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${ENDPOINTS.LEAD_STATUS}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch stages");
      }

      const data = await response.json();
      const formattedStages = Array.isArray(data)
        ? data.map(item => ({
            id: item.ilead_status_id,
            name: item.clead_name,
          }))
        : [];

      setStages(formattedStages);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to fetch stage data");
    }
  };

  const fetchCurrentStage = async () => {
    const currentStatusId = leadData.ileadstatus_id;
    const index = stages.findIndex(stage => stage.id === currentStatusId);
    if (index !== -1) {
      setCurrentStageIndex(index);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchStages();
    };
    init();
  }, []);

  useEffect(() => {
    if (stages.length > 0) {
      fetchCurrentStage();
    }
  }, [stages]);

  const handleStageClick = async (clickedIndex, statusId) => {
    if (clickedIndex <= currentStageIndex) return;

    const stageName = stages[clickedIndex].name;

    if (mandatoryInputStages.includes(stageName)) {
      setDialogStageIndex(clickedIndex);
      setOpenDialog(true);
      return;
    }

    await updateStage(clickedIndex, statusId);
    showToast('success', 'Status changed!');
  };

  const updateStage = async (newIndex, statusId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${ENDPOINTS.LEAD_STATUS_UPDATE}/${leadId}/status/${statusId}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        alert("Failed to update status");
        return;
      }

      setCurrentStageIndex(newIndex);
      if (stages[newIndex].name === 'Won') {
        setShowConfetti(true);
      }
    } catch (e) {
      console.error(e);
      alert("Error updating status");
    }
  };

  const handleDialogSave = async () => {
    if (!dialogValue) {
      alert("Please enter a value before continuing.");
      return;
    }

    const stageName = stages[dialogStageIndex]?.name;
    const statusId = stages[dialogStageIndex].id;

    await updateStage(dialogStageIndex, statusId);

    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("user");
      const userData = JSON.parse(userId);

      let requestBody;

      if (stageName === 'Demo') {
        requestBody = {
          caction: dialogValue,
          iaction_doneby: userData.iUser_id,
          iamount: null,
          ilead_id: parseInt(leadId),
        };
      } else if (['Proposal', 'Won'].includes(stageName)) {
        requestBody = {
          caction: stageName,
          iaction_doneby: userData.iUser_id,
          iamount: Number(dialogValue),
          ilead_id: parseInt(leadId),
        };
      } else {
        requestBody = {
          caction: stageName,
          iaction_doneby: userData.iUser_id,
          iamount: dialogValue,
          ilead_id: parseInt(leadId),
        };
      }

      const response = await axios.post(`${ENDPOINTS.LEAD_STATUS_ACTION}`, requestBody, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      console.log("POST Success:", response.data);
    } catch (error) {
      console.error("POST Error:", error?.response?.data?.message || error.message);
    }

    setOpenDialog(false);
    setDialogValue('');
    setDialogStageIndex(null);
  };

// Inside your component return
return (
  <div className="w-full px-4 py-6">
    <div className="flex items-center justify-between relative">
      {stages.map((stage, index) => {
        const isCompleted = index < currentStageIndex;
        const isActive = index === currentStageIndex;
        const isClickable = index > currentStageIndex;

        return (
          <div key={stage.id} className="flex flex-col items-center flex-1">
            <div
              onClick={() => handleStageClick(index, stage.id)}
              className={`relative flex items-center justify-center w-10 h-10 rounded-full 
                ${isCompleted ? 'bg-green-600 text-white' :
                isActive ? 'bg-blue-600 text-white' :
                isClickable ? 'bg-gray-300 hover:bg-gray-400 cursor-pointer' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}
                transition-colors duration-200`}
            >
              {isCompleted ? <CheckCircle size={20} /> : <Circle size={20} />}
            </div>
            <span className="mt-2 text-sm text-center">{stage.name}</span>

            {/* Connector line */}
            {index !== stages.length - 1 && (
              <div className="absolute top-5 left-1/2 w-full h-1 -z-10">
                <div className={`h-full transition-all duration-300
                  ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}
                `} />
              </div>
            )}
          </div>
        );
      })}
    </div>

    {/* Dialog */}
<Dialog
  open={openDialog}
  onClose={() => setOpenDialog(false)}
  PaperProps={{
    sx: {
      borderRadius: 3,
      padding: 2,
      minWidth: 360,
    },
  }}
>
  <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
    {stages[dialogStageIndex]?.name} – Enter Value
  </DialogTitle>

  <DialogContent>
    <TextField
      fullWidth
      variant="outlined"
      value={dialogValue}
      onChange={(e) => setDialogValue(e.target.value)}
      label="Required Value"
      type={
        ['Proposal', 'Won'].includes(stages[dialogStageIndex]?.name)
          ? 'number'
          : 'text'
      }
      sx={{
        mt: 1,
        '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
          WebkitAppearance: 'none',
          margin: 0,
        },
      }}
    />
  </DialogContent>

  <DialogActions>
    <Button onClick={() => setOpenDialog(false)} color="inherit">
      Cancel
    </Button>
    <Button onClick={handleDialogSave} variant="contained">
      Save
    </Button>
  </DialogActions>
</Dialog>
    {/* Confetti for "Won" */}
    {showConfetti && <Confetti />}
  </div>
);
};

export default StatusBar;