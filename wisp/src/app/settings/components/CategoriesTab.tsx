import { useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, MenuItem } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Category, DistributionType } from '../types';

interface CategoriesTabProps {
  categories: Category[];
  distributionTypes: DistributionType[];
  loading: boolean;
  error: string | null;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: number) => void;
  onCreate: (name: string, distributionType: string) => Promise<void>;
  onUpdate: (category: Category, name: string, distributionType: string) => Promise<void>;
}

export default function CategoriesTab({
  categories,
  distributionTypes,
  loading,
  error,
  onDelete,
  onCreate,
  onUpdate,
}: CategoriesTabProps) {
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    distribution_type: '',
  });

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      distribution_type: category.distribution_type.id.toString(),
    });
    setShowCategoryDialog(true);
  };

  const handleDialogClose = () => {
    setShowCategoryDialog(false);
    setEditingCategory(null);
    setNewCategory({ name: '', distribution_type: '' });
  };

  const handleSubmit = async () => {
    if (editingCategory) {
      await onUpdate(editingCategory, newCategory.name, newCategory.distribution_type);
    } else {
      await onCreate(newCategory.name, newCategory.distribution_type);
    }
    handleDialogClose();
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          Categories
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setShowCategoryDialog(true)}
        >
          Add Category
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
                <TableCell>Name</TableCell>
                <TableCell>Distribution Type</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.distribution_type.name}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleEditClick(category)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => onDelete(category.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={showCategoryDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Category Name"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              fullWidth
            />
            <TextField
              select
              label="Distribution Type"
              value={newCategory.distribution_type}
              onChange={(e) => setNewCategory({ ...newCategory, distribution_type: e.target.value })}
              fullWidth
            >
              {distributionTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!newCategory.name || !newCategory.distribution_type}
          >
            {editingCategory ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 