'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Typography,
  Stack,
  Box,
  Button,
  Card,
  CardContent,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import PropertyAdminDashboard from '../property/page';
import MaintenanceDashboard from '../maintenance/page';

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
      id={`super-admin-tabpanel-${index}`}
      aria-labelledby={`super-admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function SuperAdminDashboard() {
  const { user, loading, isSuperAdmin } = useAuth();
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (!loading && (!user || !isSuperAdmin())) {
      router.push('/');
    }
  }, [user, loading, isSuperAdmin, router]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <div
        className="min-h-screen relative flex items-center justify-center"
        style={{ backgroundColor: '#161748' }}
      >
        <CircularProgress sx={{ color: '#FFFFFF' }} />
      </div>
    );
  }

  if (!user || !isSuperAdmin()) {
    return null;
  }

  return (
    <div
      className="min-h-screen relative"
      style={{ backgroundColor: '#161748' }}
    >
      <Box sx={{ p: 4, maxWidth: 1400, mx: 'auto' }}>
        <Typography
          variant="h2"
          component="h1"
          sx={{
            color: '#f95d9b',
            fontFamily: 'var(--font-lora), serif',
            fontWeight: 'bold',
            mb: 4,
          }}
        >
          Super Admin Dashboard
        </Typography>

        <Card
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 3,
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <Box sx={{ borderBottom: 1, borderColor: 'rgba(255, 255, 255, 0.2)' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': {
                  color: '#D3D3D3',
                  fontFamily: 'var(--font-lora), serif',
                  '&.Mui-selected': {
                    color: '#f95d9b',
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#f95d9b',
                },
              }}
            >
              <Tab label="Property Admin View" />
              <Tab label="Maintenance View" />
            </Tabs>
          </Box>

          <CardContent>
            <TabPanel value={tabValue} index={0}>
              <PropertyAdminDashboard />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <MaintenanceDashboard />
            </TabPanel>
          </CardContent>
        </Card>
      </Box>
    </div>
  );
}

