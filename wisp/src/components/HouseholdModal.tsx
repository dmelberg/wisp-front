'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Tabs,
  Tab,
} from '@mui/material';
import axios from 'axios';

interface HouseholdModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`household-tabpanel-${index}`}
      aria-labelledby={`household-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function HouseholdModal({ open, onClose, onSuccess }: HouseholdModalProps) {
  const [tabValue, setTabValue] = useState(0);
  const [householdName, setHouseholdName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!householdName.trim()) {
      setError('Please enter a household name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No access token found');
      }

      if (tabValue === 0) {
        // Create new household
        await axios.post(
          'http://127.0.0.1:8000/api/households/',
          { name: householdName },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
      } else {
        // Join existing household
        await axios.post(
          'http://127.0.0.1:8000/api/households/join/',
          { name: householdName },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error handling household:', err);
      setError(
        tabValue === 0
          ? 'Failed to create household. Please try again.'
          : 'Failed to join household. Please check the name and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Set Up Your Household</DialogTitle>
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Create New Household" />
            <Tab label="Join Existing Household" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="body1" gutterBottom>
            Create a new household to start managing your finances.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Household Name"
            type="text"
            fullWidth
            value={householdName}
            onChange={(e) => setHouseholdName(e.target.value)}
            error={!!error}
            helperText={error}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="body1" gutterBottom>
            Join an existing household by entering its name.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Household Name"
            type="text"
            fullWidth
            value={householdName}
            onChange={(e) => setHouseholdName(e.target.value)}
            error={!!error}
            helperText={error}
          />
        </TabPanel>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Processing...' : tabValue === 0 ? 'Create' : 'Join'}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 