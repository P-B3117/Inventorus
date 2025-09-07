import type { Route } from "./+types/home";
import { useEffect } from "react";
import { useNavigate, Link } from "react-router";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Avatar,
  Stack,
  Chip,
} from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import StoreIcon from '@mui/icons-material/Store';
import CategoryIcon from '@mui/icons-material/Category';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import { componentService, vendorService, typeService, type Component, type Vendor, type Type } from "../services";
import { useApi } from "../hooks/useApi";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard - Inventorus" },
    { name: "description", content: "Electronic component inventory management dashboard" },
  ];
}

export default function Home() {
  const navigate = useNavigate();
  const components = useApi<Component[]>(() => componentService.getAllComponents(), []);
  const vendors = useApi<Vendor[]>(() => vendorService.getAllVendors(), []);
  const types = useApi<Type[]>(() => typeService.getAllTypes(), []);

  useEffect(() => {
    // Load initial data
    components.execute();
    vendors.execute();
    types.execute();
  }, []);

  const stats = [
    {
      name: "Components",
      value: components.data?.length || 0,
      icon: <BuildIcon />,
      color: "primary",
      link: "/components",
      loading: components.loading,
      error: components.error,
    },
    {
      name: "Vendors",
      value: vendors.data?.length || 0,
      icon: <StoreIcon />,
      color: "success",
      link: "/vendors",
      loading: vendors.loading,
      error: vendors.error,
    },
    {
      name: "Types",
      value: types.data?.length || 0,
      icon: <CategoryIcon />,
      color: "secondary",
      link: "/types",
      loading: types.loading,
      error: types.error,
    },
  ] as const;

  const recentComponents = components.data?.slice(0, 5) || [];
  const lowStockComponents = components.data?.filter(c => c.quantity < 10) || [];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Overview of your electronic component inventory
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Card
            key={stat.name}
            component={Link}
            to={stat.link}
            sx={{
              flex: 1,
              textDecoration: 'none',
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 4,
              },
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  sx={{
                    bgcolor: `${stat.color}.main`,
                    width: 56,
                    height: 56,
                  }}
                >
                  {stat.icon}
                </Avatar>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    {stat.name}
                  </Typography>
                  {stat.loading ? (
                    <CircularProgress size={24} />
                  ) : stat.error ? (
                    <Typography variant="h5" color="error">
                      Error
                    </Typography>
                  ) : (
                    <Typography variant="h4" component="div">
                      {stat.value}
                    </Typography>
                  )}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} sx={{ mb: 4 }}>
        {/* Recent Components */}
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <TrendingUpIcon />
              <Typography variant="h6">Recent Components</Typography>
            </Stack>
            {components.loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : components.error ? (
              <Alert severity="error">Error loading components</Alert>
            ) : recentComponents.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary" gutterBottom>
                  No components found.
                </Typography>
                <Button
                  component={Link}
                  to="/components"
                  variant="contained"
                  startIcon={<AddIcon />}
                >
                  Add your first component
                </Button>
              </Box>
            ) : (
              <Stack spacing={2}>
                {recentComponents.map((component) => (
                  <Stack
                    key={component.id}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {component.description}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {component.value}
                      </Typography>
                    </Box>
                    <Chip
                      label={`Qty: ${component.quantity}`}
                      variant="outlined"
                      size="small"
                    />
                  </Stack>
                ))}
                <Button
                  component={Link}
                  to="/components"
                  size="small"
                  endIcon={<BuildIcon />}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  View all components
                </Button>
              </Stack>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <WarningIcon sx={{ color: 'warning.main' }} />
              <Typography variant="h6">Low Stock Alert</Typography>
            </Stack>
            {components.loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : components.error ? (
              <Alert severity="error">Error loading components</Alert>
            ) : lowStockComponents.length === 0 ? (
              <Alert severity="success">
                ✅ All components are well stocked!
              </Alert>
            ) : (
              <Stack spacing={2}>
                {lowStockComponents.sort((a, b) => a.quantity - b.quantity).slice(0, 5).map((component) => (
                  <Stack
                    key={component.id}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {component.description}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {component.value}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${component.quantity} left`}
                      color={component.quantity === 0 ? 'error' : 'warning'}
                      size="small"
                    />
                  </Stack>
                ))}
                {lowStockComponents.length > 5 && (
                  <Typography variant="body2" color="text.secondary">
                    And {lowStockComponents.length - 5} more components with low stock
                  </Typography>
                )}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Stack>

      {/* Quick Actions */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            {[
              {
                title: "Add Component",
                description: "Add new electronic components",
                icon: <BuildIcon />,
                color: "primary",
                action: () => navigate('/components', { state: { openForm: true } }),
              },
              {
                title: "Add Vendor",
                description: "Register new suppliers",
                icon: <StoreIcon />,
                color: "success",
                action: () => navigate('/vendors', { state: { openForm: true } }),
              },
              {
                title: "Add Type",
                description: "Create component categories",
                icon: <CategoryIcon />,
                color: "secondary",
                action: () => navigate('/types', { state: { openForm: true } }),
              },
            ].map((action) => (
              <Card
                key={action.title}
                variant="outlined"
                sx={{
                  flex: 1,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: 2,
                    transform: 'translateY(-1px)',
                  },
                }}
                onClick={action.action}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar
                      sx={{
                        bgcolor: `${action.color}.main`,
                      }}
                    >
                      {action.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {action.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {action.description}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
