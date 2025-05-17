'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import axios from 'axios';
import GeneralTab from './components/GeneralTab';
import CategoriesTab from './components/CategoriesTab';
import SalariesTab from './components/SalariesTab';
import { Category, DistributionType, Member, User, Salary } from './types';

export default function SettingsPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [distributionTypes, setDistributionTypes] = useState<DistributionType[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [periods, setPeriods] = useState<{ id: number; period: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasHousehold, setHasHousehold] = useState<boolean | null>(null);
  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      router.push('/auth');
      return;
    }

    checkHousehold();
  }, [router]);

  const checkHousehold = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return;

      const response = await axios.get<Member>('http://127.0.0.1:8000/api/members/me/', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setHasHousehold(response.data.household !== null);
      if (response.data.household) {
        fetchCategories();
        fetchMembers();
        fetchUser();
        fetchSalaries();
        fetchDistributionTypes();
        fetchPeriods();
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem('accessToken');
        router.push('/auth');
        return;
      }
      console.error('Error checking household:', err);
      setError('Failed to check household status');
    }
  };

  const fetchUser = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return;

      const response = await axios.get<User>('http://127.0.0.1:8000/api/users/me/', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setUser(response.data);
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  };

  const fetchMembers = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return;

      const response = await axios.get<Member[]>('http://127.0.0.1:8000/api/members/', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setMembers(response.data);
    } catch (err) {
      console.error('Error fetching members:', err);
    }
  };

  const fetchSalaries = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return;

      const response = await axios.get<Salary[]>('http://127.0.0.1:8000/api/salaries/', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setSalaries(response.data);
    } catch (err) {
      console.error('Error fetching salaries:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        router.push('/auth');
        return;
      }

      const response = await axios.get('http://127.0.0.1:8000/api/categories/', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setCategories(response.data);
      setError(null);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem('accessToken');
        router.push('/auth');
        return;
      }
      console.error('Error fetching categories:', err);
      setError('Failed to fetch categories. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDistributionTypes = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return;

      const response = await axios.get('http://127.0.0.1:8000/api/distribution-types/', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setDistributionTypes(response.data);
    } catch (err) {
      console.error('Error fetching distribution types:', err);
    }
  };

  const fetchPeriods = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return;

      const response = await axios.get('http://127.0.0.1:8000/api/periods/', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const sortedPeriods = response.data
        .sort((a: { period: string }, b: { period: string }) => b.period.localeCompare(a.period));
      setPeriods(sortedPeriods);
    } catch (err) {
      console.error('Error fetching periods:', err);
    }
  };

  const handleCreateCategory = async (name: string, distributionType: string) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        router.push('/auth');
        return;
      }

      await axios.post(
        'http://127.0.0.1:8000/api/categories/',
        {
          name,
          distribution_type: distributionType,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      fetchCategories();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem('accessToken');
        router.push('/auth');
        return;
      }
      console.error('Error creating category:', err);
      setError('Failed to create category. Please try again.');
    }
  };

  const handleUpdateCategory = async (category: Category, name: string, distributionType: string) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        router.push('/auth');
        return;
      }

      await axios.put(
        `http://127.0.0.1:8000/api/categories/${category.id}/`,
        {
          name,
          distribution_type: distributionType,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      fetchCategories();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem('accessToken');
        router.push('/auth');
        return;
      }
      console.error('Error updating category:', err);
      setError('Failed to update category. Please try again.');
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        router.push('/auth');
        return;
      }

      await axios.delete(
        `http://127.0.0.1:8000/api/categories/${categoryId}/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      fetchCategories();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem('accessToken');
        router.push('/auth');
        return;
      }
      console.error('Error deleting category:', err);
      setError('Failed to delete category. Please try again.');
    }
  };

  const handleCreateSalary = async (amount: string, period: string, member: string) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        router.push('/auth');
        return;
      }

      // Find the period ID from the periods array
      const periodObj = periods.find(p => p.period === period);
      if (!periodObj) {
        throw new Error('Period not found');
      }

      // Create the salary with the period ID
      await axios.post(
        'http://127.0.0.1:8000/api/salaries/',
        {
          amount: parseFloat(amount),
          period_id: periodObj.id,
          member_id: member,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      fetchSalaries();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem('accessToken');
        router.push('/auth');
        return;
      }
      console.error('Error creating salary:', err);
      setError('Failed to create salary. Please try again.');
    }
  };

  const handleUpdateSalary = async (id: number, amount: string, period: string, member: string) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        router.push('/auth');
        return;
      }

      // Find the period ID from the periods array
      const periodObj = periods.find(p => p.period === period);
      if (!periodObj) {
        throw new Error('Period not found');
      }

      // Update the salary with the period ID
      await axios.put(
        `http://127.0.0.1:8000/api/salaries/${id}/`,
        {
          amount: parseFloat(amount),
          period_id: periodObj.id,
          member_id: member,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      fetchSalaries();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem('accessToken');
        router.push('/auth');
        return;
      }
      console.error('Error updating salary:', err);
      setError('Failed to update salary. Please try again.');
    }
  };

  const handlePeriodCreated = (newPeriod: string) => {
    fetchPeriods();
  };

  const renderSalariesTab = () => (
    <SalariesTab
      salaries={salaries}
      members={members}
      periods={periods}
      onCreate={handleCreateSalary}
      onUpdate={handleUpdateSalary}
      onPeriodCreated={handlePeriodCreated}
    />
  );

  if (hasHousehold === null) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!hasHousehold) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="info">
          You need to belong to a household to access settings. Please join or create a household first.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
          <Tab key="general" label="General" />
          <Tab key="categories" label="Categories" />
          <Tab key="salaries" label="Salaries" />
        </Tabs>
      </Box>

      {currentTab === 0 && <GeneralTab user={user} members={members} />}
      {currentTab === 1 && (
        <CategoriesTab
          categories={categories}
          distributionTypes={distributionTypes}
          loading={loading}
          error={error}
          onEdit={() => {}}
          onDelete={handleDeleteCategory}
          onCreate={handleCreateCategory}
          onUpdate={handleUpdateCategory}
        />
      )}
      {currentTab === 2 && renderSalariesTab()}
    </Container>
  );
}
