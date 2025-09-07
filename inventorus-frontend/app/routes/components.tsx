import { useEffect, useState } from "react";
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
  Chip,
  Stack,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import BuildIcon from '@mui/icons-material/Build';
import { componentService, vendorService, typeService, type Component, type Vendor, type Type, type ComponentInsert } from "../services";
import { useApi, useApiMutation } from "../hooks/useApi";

export function meta() {
  return [
    { title: "Components - Inventorus" },
    { name: "description", content: "Manage electronic components" },
  ];
}

export default function Components() {
  const [open, setOpen] = useState(false);
  const [priceInput, setPriceInput] = useState('0.00'); // Separate state for price input
  const [sortBy, setSortBy] = useState<keyof Component>('description');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [formData, setFormData] = useState<ComponentInsert>({
    description: '',
    value: '',
    quantity: 0,
    footprint: '',
    vendor_id: 0,
    type_id: 0,
    vendor_part_number: '',
    price: 0,
  });

  const components = useApi<Component[]>(() => componentService.getAllComponents(), []);
  const vendors = useApi<Vendor[]>(() => vendorService.getAllVendors(), []);
  const types = useApi<Type[]>(() => typeService.getAllTypes(), []);
  const addComponent = useApiMutation((data: ComponentInsert) => componentService.addComponent(data));

  useEffect(() => {
    // Load initial data
    components.execute();
    vendors.execute();
    types.execute();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addComponent.mutate(formData);
      setOpen(false);
      setFormData({ 
        description: '', 
        value: '', 
        quantity: 0, 
        footprint: '',
        vendor_id: 0, 
        type_id: 0,
        vendor_part_number: '',
        price: 0
      });
      setPriceInput('0.00'); // Reset price input
      components.execute(); // Refresh list
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const handleInputChange = (field: keyof ComponentInsert, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getVendorName = (vendorId: number) => {
    const vendor = vendors.data?.find(v => v.id === vendorId);
    return vendor?.name || "Unknown Vendor";
  };

  const getTypeName = (typeId: number) => {
    const type = types.data?.find(t => t.id === typeId);
    return type?.name || "Unknown Type";
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: 'Out of Stock', color: 'error' as const };
    if (quantity < 10) return { label: 'Low Stock', color: 'warning' as const };
    return { label: 'In Stock', color: 'success' as const };
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const handlePriceChange = (value: string) => {
    // Update the input field state immediately for responsive typing
    setPriceInput(value);
    
    // Convert dollars to cents and update form data
    const dollars = parseFloat(value) || 0;
    const cents = Math.round(dollars * 100);
    handleInputChange('price', cents);
  };

  const handleSort = (column: keyof Component) => {
    const isAsc = sortBy === column && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortBy(column);
  };

  const sortedComponents = components.data ? [...components.data].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    // Handle vendor and type names for sorting
    if (sortBy === 'vendor_id') {
      aValue = getVendorName(a.vendor_id) as any;
      bValue = getVendorName(b.vendor_id) as any;
    } else if (sortBy === 'type_id') {
      aValue = getTypeName(a.type_id) as any;
      bValue = getTypeName(b.type_id) as any;
    }
    
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
            Components
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your electronic component inventory
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setOpen(true);
            setPriceInput('0.00');
          }}
          size="large"
        >
          Add Component
        </Button>
      </Box>

      {/* Components Table */}
      <Card>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
            <BuildIcon />
            <Typography variant="h6">
              Component Inventory ({components.data?.length || 0} items)
            </Typography>
          </Stack>

          {components.loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : components.error ? (
            <Alert severity="error">
              Error loading components: {components.error}
            </Alert>
          ) : !components.data || components.data.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <BuildIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No components found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Start building your inventory by adding your first component
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setOpen(true);
                  setPriceInput('0.00');
                }}
              >
                Add First Component
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
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
                        active={sortBy === 'value'}
                        direction={sortBy === 'value' ? sortOrder : 'asc'}
                        onClick={() => handleSort('value')}
                      >
                        Value
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortBy === 'quantity'}
                        direction={sortBy === 'quantity' ? sortOrder : 'asc'}
                        onClick={() => handleSort('quantity')}
                      >
                        Quantity
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortBy === 'price'}
                        direction={sortBy === 'price' ? sortOrder : 'asc'}
                        onClick={() => handleSort('price')}
                      >
                        Price
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortBy === 'vendor_id'}
                        direction={sortBy === 'vendor_id' ? sortOrder : 'asc'}
                        onClick={() => handleSort('vendor_id')}
                      >
                        Vendor
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortBy === 'type_id'}
                        direction={sortBy === 'type_id' ? sortOrder : 'asc'}
                        onClick={() => handleSort('type_id')}
                      >
                        Type
                      </TableSortLabel>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedComponents.map((component) => {
                    const status = getStockStatus(component.quantity);
                    return (
                      <TableRow key={component.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {component.description}
                          </Typography>
                        </TableCell>
                        <TableCell>{component.value}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {component.quantity}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {formatPrice(component.price)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={status.label}
                            color={status.color}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{getVendorName(component.vendor_id)}</TableCell>
                        <TableCell>{getTypeName(component.type_id)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Add Component Dialog */}
      <Dialog 
        open={open} 
        onClose={() => {
          setOpen(false);
          setPriceInput('0.00');
        }}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>Add New Component</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
                fullWidth
                placeholder="e.g., 10kΩ Resistor, 0.25W"
              />
              
              <TextField
                label="Value"
                value={formData.value}
                onChange={(e) => handleInputChange('value', e.target.value)}
                required
                fullWidth
                placeholder="e.g., 10kΩ, 100µF, BC547"
              />
              
              <TextField
                label="Footprint"
                value={formData.footprint}
                onChange={(e) => handleInputChange('footprint', e.target.value)}
                required
                fullWidth
                placeholder="e.g., 0805, TO-92, DIP-8"
              />
              
              <TextField
                label="Quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                required
                fullWidth
                inputProps={{ min: 0 }}
              />
              
              <TextField
                label="Vendor Part Number"
                value={formData.vendor_part_number}
                onChange={(e) => handleInputChange('vendor_part_number', e.target.value)}
                fullWidth
                placeholder="e.g., RC0805FR-0710KL"
              />
              
              <TextField
                label="Price"
                type="number"
                value={priceInput}
                onChange={(e) => handlePriceChange(e.target.value)}
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
                placeholder="0.00"
                helperText={`Price in dollars (stored as ${formData.price} cents)`}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
              
              <TextField
                select
                label="Vendor"
                value={formData.vendor_id}
                onChange={(e) => handleInputChange('vendor_id', parseInt(e.target.value))}
                required
                fullWidth
                disabled={vendors.loading}
              >
                {vendors.data?.map((vendor) => (
                  <MenuItem key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </MenuItem>
                ))}
              </TextField>
              
              <TextField
                select
                label="Type"
                value={formData.type_id}
                onChange={(e) => handleInputChange('type_id', parseInt(e.target.value))}
                required
                fullWidth
                disabled={types.loading}
              >
                {types.data?.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setOpen(false);
              setPriceInput('0.00');
            }}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              disabled={addComponent.loading}
              startIcon={addComponent.loading ? <CircularProgress size={16} /> : <AddIcon />}
            >
              {addComponent.loading ? 'Adding...' : 'Add Component'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Floating Action Button for mobile */}
      <Fab
        color="primary"
        aria-label="add component"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', sm: 'none' }
        }}
        onClick={() => {
          setOpen(true);
          setPriceInput('0.00');
        }}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
}
