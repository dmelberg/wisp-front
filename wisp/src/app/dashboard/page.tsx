'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Collapse,
} from '@mui/material';
import Link from 'next/link';
import axios from 'axios';
import HouseholdModal from '@/components/HouseholdModal';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';

interface Movement {
  id: number;
  amount: number;
  member: {
    id: number;
    name: string;
  };
  created_at: string;
  description: string | null;
  category: {
    id: number;
    name: string;
  };
  date: string;
}

interface Member {
  id: number;
  name: string;
  household: {
    id: number;
    name: string;
  } | null;
  balance: number;
  total_owed: number;
  total_paid: number;
}

interface Category {
  id: number;
  name: string;
}

interface DetailedBalance {
  member: {
    id: number;
    name: string;
  };
  you_owe: number;
  owes_you: number;
  net_balance: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHouseholdModal, setShowHouseholdModal] = useState(false);
  const [hasHousehold, setHasHousehold] = useState<boolean | null>(null);
  const [showMovementDialog, setShowMovementDialog] = useState(false);
  const [showEditMovementDialog, setShowEditMovementDialog] = useState(false);
  const [editingMovement, setEditingMovement] = useState<Movement | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [householdMembers, setHouseholdMembers] = useState<Member[]>([]);
  const [newMovement, setNewMovement] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category_id: '',
    description: '',
  });
  const [detailedBalances, setDetailedBalances] = useState<DetailedBalance[]>([]);
  const [expanded, setExpanded] = useState(false);

  const fetchMovements = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        router.push('/auth');
        return;
      }

      const response = await axios.get('http://127.0.0.1:8000/api/movements/', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setMovements(response.data);
      setError(null);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem('accessToken');
        router.push('/auth');
        return;
      }
      console.error('Error fetching movements:', err);
      setError('Failed to fetch movements. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHouseholdMembers = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return;

      const response = await axios.get<Member[]>('http://127.0.0.1:8000/api/members/', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setHouseholdMembers(response.data);
    } catch (err) {
      console.error('Error fetching household members:', err);
    }
  };

  const fetchDetailedBalances = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return;

      const response = await axios.get<DetailedBalance[]>('http://127.0.0.1:8000/api/members/detailed_balances/', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setDetailedBalances(response.data);
    } catch (err) {
      console.error('Error fetching detailed balances:', err);
    }
  };

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      router.push('/auth');
      return;
    }

    const checkHousehold = async () => {
      try {
        const response = await axios.get<Member>('http://127.0.0.1:8000/api/members/me/', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setCurrentMember(response.data);
        setHasHousehold(response.data.household !== null);
        if (response.data.household === null) {
          setShowHouseholdModal(true);
        }
      } catch (err) {
        console.error('Error checking household:', err);
        setError('Failed to check household status');
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/categories/', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    checkHousehold();
    if (hasHousehold) {
      fetchMovements();
      fetchCategories();
      fetchHouseholdMembers();
      fetchDetailedBalances();
    }
  }, [router, hasHousehold]);

  const handleHouseholdSuccess = () => {
    setHasHousehold(true);
    setShowHouseholdModal(false);
  };

  const handleCreateMovement = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return;

      await axios.post(
        'http://127.0.0.1:8000/api/movements/',
        {
          amount: parseFloat(newMovement.amount),
          date: newMovement.date,
          category_id: newMovement.category_id,
          description: newMovement.description,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Refresh movements
      const response = await axios.get('http://127.0.0.1:8000/api/movements/', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setMovements(response.data);
      setShowMovementDialog(false);
      setNewMovement({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category_id: '',
        description: '',
      });
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Error creating movement:', err);
      if (axios.isAxiosError(err) && err.response?.data) {
        // Display the specific error message from the backend
        setError(err.response.data.detail || 'Failed to create movement. Please try again.');
      } else {
        setError('Failed to create movement. Please try again.');
      }
    }
  };

  const handleEditMovement = async () => {
    if (!editingMovement) return;

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        router.push('/auth');
        return;
      }

      await axios.put(
        `http://127.0.0.1:8000/api/movements/${editingMovement.id}/`,
        {
          amount: parseFloat(newMovement.amount),
          date: newMovement.date,
          category_id: newMovement.category_id,
          description: newMovement.description,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      fetchMovements();
      setShowEditMovementDialog(false);
      setEditingMovement(null);
      setNewMovement({ amount: '', date: new Date().toISOString().split('T')[0], category_id: '', description: '' });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem('accessToken');
        router.push('/auth');
        return;
      }
      console.error('Error updating movement:', err);
      setError('Failed to update movement. Please try again.');
    }
  };

  const handleDeleteMovement = async (movementId: number) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        router.push('/auth');
        return;
      }

      await axios.delete(
        `http://127.0.0.1:8000/api/movements/${movementId}/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      fetchMovements();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem('accessToken');
        router.push('/auth');
        return;
      }
      console.error('Error deleting movement:', err);
      setError('Failed to delete movement. Please try again.');
    }
  };

  const handleEditClick = (movement: Movement) => {
    setEditingMovement(movement);
    setNewMovement({
      amount: movement.amount.toString(),
      date: movement.date,
      category_id: movement.category.id.toString(),
      description: movement.description || '',
    });
    setShowEditMovementDialog(true);
  };

  if (hasHousehold === null) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Home
      </Typography>
      
      {hasHousehold && currentMember && (
        <>
          <Box sx={{ mb: 4 }}>
            <Card>
              <CardContent>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => setExpanded(!expanded)}
                >
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Your Balance
                    </Typography>
                    <Typography variant="h4" color={currentMember.balance >= 0 ? 'success.main' : 'error.main'}>
                      ${Math.round(Math.abs(currentMember.balance))}
                      <Typography component="span" variant="body1" color="text.secondary">
                        {currentMember.balance >= 0 ? ' owed to you' : ' you owe'}
                      </Typography>
                    </Typography>
                  </Box>
                  <ExpandMoreIcon 
                    sx={{ 
                      transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s'
                    }} 
                  />
                </Box>
                <Collapse in={expanded}>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Detailed Balances
                    </Typography>
                    {detailedBalances.map((balance) => (
                      <Box 
                        key={balance.member.id}
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          py: 1,
                          borderBottom: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        <Typography>{balance.member.name}</Typography>
                        <Typography 
                          sx={{ 
                            color: balance.net_balance > 0 ? 'success.main' : 
                                  balance.net_balance < 0 ? 'error.main' : 'text.primary',
                            fontWeight: 'bold'
                          }}
                        >
                          ${Math.round(Math.abs(balance.net_balance))}
                          <Typography component="span" variant="body2" color="text.secondary">
                            {balance.net_balance > 0 ? ' owes you' : 
                             balance.net_balance < 0 ? ' you owe' : ''}
                          </Typography>
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          </Box>
        </>
      )}
      
      {hasHousehold && (
        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">
              Recent Movements
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setShowMovementDialog(true)}
            >
              Add Movement
            </Button>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {movements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>{new Date(movement.date).toLocaleDateString()}</TableCell>
                      <TableCell>{movement.category.name}</TableCell>
                      <TableCell align="right">${Math.round(movement.amount)}</TableCell>
                      <TableCell>{movement.description || '-'}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEditClick(movement)} size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteMovement(movement.id)} size="small">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      <HouseholdModal
        open={showHouseholdModal}
        onClose={() => setShowHouseholdModal(false)}
        onSuccess={handleHouseholdSuccess}
      />

      <Dialog open={showMovementDialog} onClose={() => setShowMovementDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Movement</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Amount"
              type="number"
              value={newMovement.amount}
              onChange={(e) => setNewMovement({ ...newMovement, amount: e.target.value })}
              fullWidth
            />
            <TextField
              label="Description"
              value={newMovement.description}
              onChange={(e) => setNewMovement({ ...newMovement, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              select
              label="Category"
              value={newMovement.category_id}
              onChange={(e) => setNewMovement({ ...newMovement, category_id: e.target.value })}
              fullWidth
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Date"
              type="date"
              value={newMovement.date}
              onChange={(e) => setNewMovement({ ...newMovement, date: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowMovementDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateMovement} 
            variant="contained" 
            disabled={!newMovement.amount || !newMovement.category_id}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showEditMovementDialog} onClose={() => setShowEditMovementDialog(false)}>
        <DialogTitle>Edit Movement</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Amount"
            type="number"
            value={newMovement.amount}
            onChange={(e) => setNewMovement({ ...newMovement, amount: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Date"
            type="date"
            value={newMovement.date}
            onChange={(e) => setNewMovement({ ...newMovement, date: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            select
            label="Category"
            value={newMovement.category_id}
            onChange={(e) => setNewMovement({ ...newMovement, category_id: e.target.value })}
            margin="normal"
          >
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Description"
            value={newMovement.description}
            onChange={(e) => setNewMovement({ ...newMovement, description: e.target.value })}
            margin="normal"
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditMovementDialog(false)}>Cancel</Button>
          <Button onClick={handleEditMovement} variant="contained" color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 