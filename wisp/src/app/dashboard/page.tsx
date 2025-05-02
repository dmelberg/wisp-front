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
} from '@mui/material';
import Link from 'next/link';
import axios from 'axios';
import HouseholdModal from '@/components/HouseholdModal';
import { Add as AddIcon } from '@mui/icons-material';

interface Movement {
  id: number;
  amount: number;
  member: {
    id: number;
    name: string;
  };
  created_at: string;
  description: string | null;
}

interface Member {
  id: number;
  name: string;
  household: {
    id: number;
    name: string;
  } | null;
}

interface Category {
  id: number;
  name: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHouseholdModal, setShowHouseholdModal] = useState(false);
  const [hasHousehold, setHasHousehold] = useState<boolean | null>(null);
  const [showMovementDialog, setShowMovementDialog] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newMovement, setNewMovement] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    description: '',
  });

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
        setHasHousehold(response.data.household !== null);
        if (response.data.household === null) {
          setShowHouseholdModal(true);
        }
      } catch (err) {
        console.error('Error checking household:', err);
        setError('Failed to check household status');
      }
    };

    const fetchMovements = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/movements/', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setMovements(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching movements:', err);
        setError('Failed to fetch movements. Please try again later.');
      } finally {
        setLoading(false);
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
          category_id: newMovement.category,
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
        category: '',
        description: '',
      });
    } catch (err) {
      console.error('Error creating movement:', err);
      setError('Failed to create movement. Please try again.');
    }
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
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Movements
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                View and manage all financial movements
              </Typography>
              <Button
                component={Link}
                href="/movements"
                variant="contained"
                color="primary"
              >
                Go to Movements
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Salaries
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Manage salary distributions and calculations
              </Typography>
              <Button
                component={Link}
                href="/salaries"
                variant="contained"
                color="primary"
              >
                Go to Salaries
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Analytics
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                View financial analytics and reports
              </Typography>
              <Button
                component={Link}
                href="/analytics"
                variant="contained"
                color="primary"
              >
                Go to Analytics
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
                    <TableCell>Member</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {movements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>{movement.member.name}</TableCell>
                      <TableCell align="right">${Math.round(movement.amount)}</TableCell>
                      <TableCell>{movement.description || '-'}</TableCell>
                      <TableCell>{new Date(movement.created_at).toLocaleDateString()}</TableCell>
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
              value={newMovement.category}
              onChange={(e) => setNewMovement({ ...newMovement, category: e.target.value })}
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
            disabled={!newMovement.amount || !newMovement.category}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 