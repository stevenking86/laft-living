'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';
import { 
  Typography, 
  Stack, 
  Box, 
  Button, 
  Card, 
  CardContent,
  Alert,
  CircularProgress
} from '@mui/material';

interface Lease {
  id: number;
  move_in_date: string;
  move_out_date: string | null;
  signed: boolean;
  signed_date: string | null;
  property: {
    id: number;
    name: string;
    address: string;
    office_hours: string | null;
  };
  unit: {
    id: number;
    name: string;
  };
  rental_application: {
    id: number;
    status: string;
  };
}

interface OutstandingPayment {
  id: number;
  amount: number;
  payment_month: string;
  due_date: string;
  status: string;
  paid_date: string | null;
  overdue: boolean;
}

interface OutstandingPaymentsResponse {
  outstanding_payments: OutstandingPayment[];
  total_amount: number;
  has_overdue: boolean;
  overdue_payments: OutstandingPayment[];
}

export default function Live() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [leases, setLeases] = useState<Lease[]>([]);
  const [leasesLoading, setLeasesLoading] = useState(true);
  const [activeLease, setActiveLease] = useState<Lease | null>(null);
  const [paymentsData, setPaymentsData] = useState<OutstandingPaymentsResponse | null>(null);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchLeases = async () => {
      if (!user) return;
      
      try {
        setLeasesLoading(true);
        const fetchedLeases = await apiService.getLeases();
        setLeases(fetchedLeases);
        
        // Find active lease based on logic:
        // 1. Approved lease that hasn't started yet (move_in_date > today)
        // 2. OR currently living there (move_in_date <= today AND (move_out_date is null OR move_out_date >= today))
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const active = fetchedLeases.find((lease: Lease) => {
          const moveInDate = new Date(lease.move_in_date);
          moveInDate.setHours(0, 0, 0, 0);
          
          // Check if approved
          if (lease.rental_application.status !== 'approved') {
            return false;
          }
          
          // Case 1: Approved but hasn't started yet
          if (moveInDate > today) {
            return true;
          }
          
          // Case 2: Currently living there
          if (moveInDate <= today) {
            if (lease.move_out_date === null) {
              return true; // No move out date means still active
            }
            const moveOutDate = new Date(lease.move_out_date);
            moveOutDate.setHours(0, 0, 0, 0);
            return moveOutDate >= today;
          }
          
          return false;
        });
        
        setActiveLease(active || null);
      } catch (error) {
        console.error('Error fetching leases:', error);
      } finally {
        setLeasesLoading(false);
      }
    };

    if (user) {
      fetchLeases();
    }
  }, [user]);

  // Fetch payment data when active lease is available
  useEffect(() => {
    const fetchPayments = async () => {
      if (!activeLease || !user) return;

      try {
        setPaymentsLoading(true);
        const data = await apiService.getOutstandingPayments();
        setPaymentsData(data);
      } catch (error) {
        console.error('Error fetching payments:', error);
        // Don't show error to user, just log it
      } finally {
        setPaymentsLoading(false);
      }
    };

    fetchPayments();
  }, [activeLease, user]);

  const handleBack = () => {
    router.push('/welcome');
  };

  const handleLeasingClick = () => {
    router.push('/leasing');
  };

  const handlePayRent = () => {
    router.push('/live/pay-rent');
  };

  const formatMonth = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handleMaintenanceRequest = () => {
    // TODO: Implement maintenance request functionality
    console.log('Maintenance request clicked');
  };

  if (loading || leasesLoading) {
    return (
      <div 
        className="min-h-screen relative flex items-center justify-center"
        style={{
          backgroundColor: '#161748',
        }}
      >
        <CircularProgress sx={{ color: '#FFFFFF' }} />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundColor: '#161748',
      }}
    >
      <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
        {/* Back Button */}
        <Button
          onClick={handleBack}
          sx={{
            color: '#D3D3D3',
            mb: 3,
            '&:hover': {
              color: '#FFFFFF',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }
          }}
        >
          ← Back
        </Button>

        {!activeLease ? (
          // Empty State
          <Box 
            sx={{ 
              textAlign: 'center',
              mt: 8,
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            <Typography
              variant="h3"
              component="h1"
              sx={{
                color: '#f95d9b',
                fontFamily: 'var(--font-lora), serif',
                fontWeight: 'bold',
                mb: 4,
              }}
            >
              Live
            </Typography>
            
            <Alert
              severity="info"
              sx={{
                backgroundColor: 'rgba(57, 160, 202, 0.2)',
                color: '#FFFFFF',
                border: '1px solid #39a0ca',
                borderRadius: 2,
                mb: 4,
                '& .MuiAlert-icon': {
                  color: '#39a0ca',
                },
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  fontFamily: 'var(--font-lora), serif',
                  fontSize: '1.1rem',
                  mb: 2,
                }}
              >
                Looks like you need somewhere to live! Visit our leasing section to view available apartments.
              </Typography>
              <Button
                variant="contained"
                onClick={handleLeasingClick}
                sx={{
                  backgroundColor: '#39a0ca',
                  color: '#FFFFFF',
                  '&:hover': {
                    backgroundColor: '#2d7fa0',
                  },
                }}
              >
                View Available Apartments
              </Button>
            </Alert>
          </Box>
        ) : (
          // Active Lease Content
          <Box>
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
              Welcome to {activeLease.property.name}
            </Typography>

            {/* Overdue Payment Warning */}
            {paymentsData && paymentsData.has_overdue && paymentsData.overdue_payments.length > 0 && (
              <Alert
                severity="warning"
                sx={{
                  backgroundColor: 'rgba(255, 152, 0, 0.2)',
                  color: '#FFFFFF',
                  border: '1px solid #ff9800',
                  borderRadius: 2,
                  mb: 4,
                  '& .MuiAlert-icon': {
                    color: '#ff9800',
                  },
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: 'var(--font-lora), serif',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                  }}
                >
                  {paymentsData.overdue_payments.map((payment, index) => (
                    <span key={payment.id}>
                      Rent is overdue for {formatMonth(payment.payment_month)}
                      {index < paymentsData.overdue_payments.length - 1 && ', '}
                    </span>
                  ))}
                </Typography>
              </Alert>
            )}

            <Card
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 3,
                mb: 4,
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Stack spacing={3}>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        color: '#39a0ca',
                        fontFamily: 'var(--font-lora), serif',
                        fontWeight: 'bold',
                        mb: 1,
                      }}
                    >
                      Address
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: '#FFFFFF',
                        fontFamily: 'var(--font-lora), serif',
                        fontSize: '1.1rem',
                      }}
                    >
                      {activeLease.property.address}
                    </Typography>
                  </Box>

                  {activeLease.property.office_hours && (
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          color: '#39a0ca',
                          fontFamily: 'var(--font-lora), serif',
                          fontWeight: 'bold',
                          mb: 1,
                        }}
                      >
                        Office Hours
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: '#FFFFFF',
                          fontFamily: 'var(--font-lora), serif',
                          fontSize: '1.1rem',
                        }}
                      >
                        {activeLease.property.office_hours}
                      </Typography>
                    </Box>
                  )}

                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        color: '#39a0ca',
                        fontFamily: 'var(--font-lora), serif',
                        fontWeight: 'bold',
                        mb: 1,
                      }}
                    >
                      Unit
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: '#FFFFFF',
                        fontFamily: 'var(--font-lora), serif',
                        fontSize: '1.1rem',
                      }}
                    >
                      {activeLease.unit.name}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={3}
              sx={{ mt: 4 }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={handlePayRent}
                sx={{
                  flex: 1,
                  backgroundColor: '#478559',
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-lora), serif',
                  fontSize: '1.1rem',
                  py: 2,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: '#3a6d47',
                  },
                }}
              >
                Pay Rent
              </Button>

              <Button
                variant="contained"
                size="large"
                onClick={handleMaintenanceRequest}
                sx={{
                  flex: 1,
                  backgroundColor: '#39a0ca',
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-lora), serif',
                  fontSize: '1.1rem',
                  py: 2,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: '#2d7fa0',
                  },
                }}
              >
                Submit Maintenance Request
              </Button>
            </Stack>
          </Box>
        )}
      </Box>
    </div>
  );
}

