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
  Link as MuiLink,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import StoreIcon from '@mui/icons-material/Store';
import ExternalLinkIcon from '@mui/icons-material/OpenInNew';
import { vendorService, type Vendor, type VendorInsert } from "../services";
import { useApi, useApiMutation } from "../hooks/useApi";

export function meta() {
  return [
    { title: "Vendors - Inventorus" },
    { name: "description", content: "Manage component vendors" },
  ];
}

export default function Vendors() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [sortBy, setSortBy] = useState<keyof Vendor>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [formData, setFormData] = useState<VendorInsert>({
    name: '',
    description: '',
    url: '',
  });

  const vendors = useApi<Vendor[]>(() => vendorService.getAllVendors(), []);
  const addVendor = useApiMutation((data: VendorInsert) => vendorService.addVendor(data));

  useEffect(() => {
    vendors.execute();
    
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
      await addVendor.mutate(formData);
      setOpen(false);
      setFormData({ name: '', description: '', url: '' });
      vendors.execute(); // Refresh list
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const handleInputChange = (field: keyof VendorInsert, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSort = (column: keyof Vendor) => {
    const isAsc = sortBy === column && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortBy(column);
  };

  const sortedVendors = vendors.data ? [...vendors.data].sort((a, b) => {
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
            Vendors
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your component suppliers and vendors
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
          size="large"
        >
          Add Vendor
        </Button>
      </Box>

      {/* Vendors Table */}
      <Card>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
            <StoreIcon />
            <Typography variant="h6">
              Vendor Directory ({vendors.data?.length || 0} vendors)
            </Typography>
          </Stack>

          {vendors.loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : vendors.error ? (
            <Alert severity="error">
              Error loading vendors: {vendors.error}
            </Alert>
          ) : !vendors.data || vendors.data.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <StoreIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No vendors found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Add vendors to track where you source your components
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpen(true)}
              >
                Add First Vendor
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
                        Name
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
                    <TableCell>
                      <TableSortLabel
                        active={sortBy === 'url'}
                        direction={sortBy === 'url' ? sortOrder : 'asc'}
                        onClick={() => handleSort('url')}
                      >
                        Website
                      </TableSortLabel>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedVendors.map((vendor) => (
                    <TableRow key={vendor.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {vendor.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {vendor.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {vendor.url ? (
                          <MuiLink
                            href={vendor.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                          >
                            Visit Website
                            <ExternalLinkIcon fontSize="small" />
                          </MuiLink>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No website
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Add Vendor Dialog */}
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>Add New Vendor</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label="Vendor Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                fullWidth
                placeholder="e.g., Digikey, Mouser, LCSC"
              />
              
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                fullWidth
                multiline
                rows={3}
                placeholder="Brief description of the vendor..."
              />
              
              <TextField
                label="Website URL"
                value={formData.url}
                onChange={(e) => handleInputChange('url', e.target.value)}
                fullWidth
                placeholder="https://www.example.com"
                type="url"
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
              disabled={addVendor.loading}
              startIcon={addVendor.loading ? <CircularProgress size={16} /> : <AddIcon />}
            >
              {addVendor.loading ? 'Adding...' : 'Add Vendor'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Floating Action Button for mobile */}
      <Fab
        color="primary"
        aria-label="add vendor"
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
