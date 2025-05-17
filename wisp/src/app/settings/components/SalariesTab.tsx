import { useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Divider, IconButton } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import { Salary, Member } from '../types';
import axios from 'axios';

interface SalariesTabProps {
  salaries: Salary[];
  members: Member[];
  periods: { id: number; period: string }[];
  onCreate: (amount: string, period: string, member: string) => Promise<void>;
  onUpdate: (id: number, amount: string, period: string, member: string) => Promise<void>;
  onPeriodCreated?: (newPeriod: string) => void;
}

export default function SalariesTab({
  salaries,
  members,
  periods,
  onCreate,
  onUpdate,
  onPeriodCreated,
}: SalariesTabProps) {
  const [showSalaryDialog, setShowSalaryDialog] = useState(false);
  const [showNewPeriodDialog, setShowNewPeriodDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newSalary, setNewSalary] = useState({
    id: 0,
    amount: '',
    period: '',
    member: '',
  });
  const [newPeriod, setNewPeriod] = useState('');
  const [isCreatingPeriod, setIsCreatingPeriod] = useState(false);

  const handleSalaryDialogClose = () => {
    setShowSalaryDialog(false);
    setIsEditing(false);
    setNewSalary({ id: 0, amount: '', period: '', member: '' });
  };

  const handleCreateSalary = async () => {
    if (isEditing) {
      await onUpdate(newSalary.id, newSalary.amount, newSalary.period, newSalary.member);
    } else {
      await onCreate(newSalary.amount, newSalary.period, newSalary.member);
    }
    handleSalaryDialogClose();
  };

  const handleEditClick = (salary: Salary) => {
    setIsEditing(true);
    setNewSalary({
      id: salary.id,
      amount: salary.amount.toString(),
      period: salary.period.period,
      member: salary.member.id.toString(),
    });
    setShowSalaryDialog(true);
  };

  const handleCreateNewPeriod = () => {
    setShowNewPeriodDialog(true);
  };

  const handleNewPeriodDialogClose = () => {
    setShowNewPeriodDialog(false);
    setNewPeriod('');
  };

  const handleNewPeriodSubmit = async () => {
    if (newPeriod && /^\d{4}-\d{2}$/.test(newPeriod)) {
      try {
        // Check if period already exists
        if (periods.some(p => p.period === newPeriod)) {
          console.error('Period already exists');
          return;
        }

        setIsCreatingPeriod(true);
        // Create the period in the backend
        const response = await axios.post('http://127.0.0.1:8000/api/periods/', {
          period: newPeriod
        });
        
        // Update the salary form with the new period
        setNewSalary(prev => ({ ...prev, period: newPeriod }));
        
        // Notify parent component about the new period
        if (onPeriodCreated) {
          onPeriodCreated(newPeriod);
        }
        
        handleNewPeriodDialogClose();
      } catch (error) {
        console.error('Error creating period:', error);
        // You might want to show an error message to the user here
      } finally {
        setIsCreatingPeriod(false);
      }
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          Salary History
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setShowSalaryDialog(true)}
        >
          Add Salary
        </Button>
      </Box>
      {salaries.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No salaries have been added yet. Click the &quot;Add Salary&quot; button to create one.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Member</TableCell>
                <TableCell>Period</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {salaries.map((salary) => (
                <TableRow key={salary.id}>
                  <TableCell>{salary.member?.name || 'Unknown'}</TableCell>
                  <TableCell>{salary.period?.period || 'Unknown'}</TableCell>
                  <TableCell align="right">${Math.round(salary.amount)}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleEditClick(salary)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={showSalaryDialog} onClose={handleSalaryDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Salary' : 'Add New Salary'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Amount"
              type="number"
              value={newSalary.amount}
              onChange={(e) => setNewSalary({ ...newSalary, amount: e.target.value })}
              fullWidth
            />
            <TextField
              select
              label="Member"
              value={newSalary.member}
              onChange={(e) => setNewSalary({ ...newSalary, member: e.target.value })}
              fullWidth
            >
              {members.map((member) => (
                <MenuItem key={member.id} value={member.id}>
                  {member.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Period"
              value={newSalary.period}
              onChange={(e) => {
                if (e.target.value === 'new') {
                  handleCreateNewPeriod();
                } else {
                  setNewSalary({ ...newSalary, period: e.target.value });
                }
              }}
              fullWidth
            >
              {periods.map((period) => (
                <MenuItem key={period.id} value={period.period}>
                  {period.period}
                </MenuItem>
              ))}
              <Divider />
              <MenuItem value="new">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AddIcon fontSize="small" />
                  Create New Period
                </Box>
              </MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSalaryDialogClose}>Cancel</Button>
          <Button
            onClick={handleCreateSalary}
            variant="contained"
            disabled={!newSalary.amount || !newSalary.member || !newSalary.period}
          >
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showNewPeriodDialog} onClose={handleNewPeriodDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Period</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Period (YYYY-MM)"
              value={newPeriod}
              onChange={(e) => setNewPeriod(e.target.value)}
              fullWidth
              placeholder="e.g., 2024-03"
              helperText="Enter the period in YYYY-MM format"
              disabled={isCreatingPeriod}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleNewPeriodDialogClose} disabled={isCreatingPeriod}>Cancel</Button>
          <Button
            onClick={handleNewPeriodSubmit}
            variant="contained"
            disabled={!newPeriod || !/^\d{4}-\d{2}$/.test(newPeriod) || isCreatingPeriod}
          >
            {isCreatingPeriod ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 