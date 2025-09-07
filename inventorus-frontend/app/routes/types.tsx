import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Box,
  CircularProgress,
  Alert,
  Stack,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CategoryIcon from '@mui/icons-material/Category';
import { typeService, type Type, type TypeInsert } from "../services";
import { useApi, useApiMutation } from "../hooks/useApi";

export function meta() {
  return [
    { title: "Types - Inventorus" },
    { name: "description", content: "Manage component types" },
  ];
}

export default function Types() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [sortBy, setSortBy] = useState<keyof Type>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [formData, setFormData] = useState<TypeInsert>({
    name: '',
    description: '',
    unit: '',
  });

  const types = useApi<Type[]>(() => typeService.getAllTypes(), []);
  const addType = useApiMutation((data: TypeInsert) => typeService.addType(data));

  useEffect(() => {
    types.execute();
    
    // Check if we should open the form from navigation state
    if (location.state?.openForm) {
      setOpen(true);
      // Clear the state to prevent reopening on subsequent renders
      window.history.replaceState({}, document.title);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addType.mutate(formData);
      setOpen(false);
      setFormData({ name: '', description: '', unit: '' });
      types.execute(); // Refresh list
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const handleInputChange = (field: keyof TypeInsert, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSort = (column: keyof Type) => {
    const isAsc = sortBy === column && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortBy(column);
  };

  const sortedTypes = types.data ? [...types.data].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  }) : [];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom>
            Component Types
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Organize your components by category and type
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
          size="large"
        >
          Add Type
        </Button>
      </Box>

      {/* Types Table */}
      <Card>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
            <CategoryIcon />
            <Typography variant="h6">
              Component Categories ({types.data?.length || 0} types)
            </Typography>
          </Stack>

          {types.loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : types.error ? (
            <Alert severity="error">
              Error loading types: {types.error}
            </Alert>
          ) : !types.data || types.data.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <CategoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No component types found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create categories to organize your electronic components
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpen(true)}
              >
                Add First Type
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <TableSortLabel
                        active={sortBy === 'name'}
                        direction={sortBy === 'name' ? sortOrder : 'asc'}
                        onClick={() => handleSort('name')}
                      >
                        Type Name
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortBy === 'unit'}
                        direction={sortBy === 'unit' ? sortOrder : 'asc'}
                        onClick={() => handleSort('unit')}
                      >
                        Unit
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortBy === 'description'}
                        direction={sortBy === 'description' ? sortOrder : 'asc'}
                        onClick={() => handleSort('description')}
                      >
                        Description
                      </TableSortLabel>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedTypes.map((type) => (
                    <TableRow key={type.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {type.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {type.unit || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {type.description}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Add Type Dialog */}
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>Add New Component Type</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label="Type Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                fullWidth
                placeholder="e.g., Resistor, Capacitor, IC, Transistor"
              />
              
              <TextField
                label="Unit"
                value={formData.unit}
                onChange={(e) => handleInputChange('unit', e.target.value)}
                fullWidth
                placeholder="e.g., Ω, F, V, A"
              />
              
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                fullWidth
                multiline
                rows={3}
                placeholder="Brief description of this component type..."
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              disabled={addType.loading}
              startIcon={addType.loading ? <CircularProgress size={16} /> : <AddIcon />}
            >
              {addType.loading ? 'Adding...' : 'Add Type'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Floating Action Button for mobile */}
      <Fab
        color="primary"
        aria-label="add type"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', sm: 'none' }
        }}
        onClick={() => setOpen(true)}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
}
