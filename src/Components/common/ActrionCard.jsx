import React, { useState, useEffect } from "react";
import { ENDPOINTS } from '../../api/constraints';
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Paper,
  Divider,
} from '@mui/material';

const ActionCard = ({ leadId, onActionClick = () => {} }) => {
  const [actions, setActions] = useState([]);
  const [error, setError] = useState(null);

  const fetchLeadAction = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${ENDPOINTS.LEAD_STATUS_ACTION}/${leadId}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch actions");
      }

      const data = await response.json();
      setActions(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to fetch actions");
      setActions([]);
    }
  };

  useEffect(() => {
    if (leadId) {
      fetchLeadAction();
    }
  }, [leadId]);

  return (
    <Box sx={{ px: { xs: 2, sm: 4 }, py: 3 }}>
      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 2, fontSize: 14 }}>
          {error}
        </Typography>
      )}

      {actions.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            textAlign: 'center',
            borderRadius: 3,
            backgroundColor: '#f0f0f5',
            color: '#8e8e93',
            fontSize: '16px',
          }}
        >
          No actions available for this lead.
        </Paper>
      ) : (
        <Box
          sx={{
            borderRadius: 3,
            backgroundColor: '#ffffff',
            boxShadow: '0px 2px 10px rgba(0,0,0,0.05)',
            overflow: 'hidden',
          }}
        >
          <List disablePadding>
            {actions.map((action, index) => (
              <React.Fragment key={index}>
                <ListItem
                  sx={{
                    px: 3,
                    py: 2,
                    backgroundColor: '#ffffff',
                    '&:not(:last-child)': {
                      borderBottom: '1px solid #e0e0e0',
                    },
                  }}
                  button
                  onClick={() => onActionClick(action)}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography sx={{ fontSize: 16, fontWeight: 500 }}>
                          {action.caction}
                        </Typography>
                        {!['Won', 'Proposal'].includes(action.caction) && (
                          <Typography
                            component="span"
                            sx={{
                              ml: 1,
                              px: 1.5,
                              py: 0.2,
                              fontSize: 11,
                              backgroundColor: '#ffeaa7',
                              borderRadius: '10px',
                              color: '#8e44ad',
                            }}
                          >
                            Demo
                          </Typography>
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography
                        variant="caption"
                        sx={{ fontSize: 13, color: '#6e6e73' }}
                      >
                        {['Won', 'Proposal'].includes(action.caction)
                          ? action.iamount && !isNaN(action.iamount)
                            ? `Amount: ₹ ${new Intl.NumberFormat('en-IN').format(action.iamount)}`
                            : 'Amount not available'
                          : 'Demo action – no billing applicable'}
                      </Typography>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default ActionCard;
