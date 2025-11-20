'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  CircularProgress,
  Divider
} from '@mui/material';

interface OutstandingPayment {
  id: number;
  amount: number;
  payment_month: string;
  due_date: string;
  status: string;
  paid_date: string | null;
  overdue: boolean;
  stripe_payment_intent_id: string | null;
}

interface OutstandingPaymentsResponse {
  outstanding_payments: OutstandingPayment[];
  total_amount: number;
  has_overdue: boolean;
  overdue_payments: OutstandingPayment[];
}

export default function PayRent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentsData, setPaymentsData] = useState<OutstandingPaymentsResponse | null>(null);
  const [lastPaidDate, setLastPaidDate] = useState<string | null>(null);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoadingPayments(true);
        const [payments, lastPaid] = await Promise.all([
          apiService.getOutstandingPayments(),
          apiService.getLastPayment()
        ]);
        setPaymentsData(payments);
        setLastPaidDate(lastPaid.last_paid_date);
      } catch (error: any) {
        console.error('Error fetching payment data:', error);
        setError(error.message || 'Failed to load payment information');
      } finally {
        setLoadingPayments(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  // Handle Stripe redirect after payment
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const canceled = searchParams.get('canceled');
    
    if (sessionId) {
      handlePaymentConfirmation(sessionId);
    } else if (canceled) {
      setError('Payment was canceled');
    }
  }, [searchParams]);

  const handlePaymentConfirmation = async (sessionId: string) => {
    try {
      setProcessing(true);
      await apiService.confirmPayment(sessionId);
      // Refresh payment data
      const [payments, lastPaid] = await Promise.all([
        apiService.getOutstandingPayments(),
        apiService.getLastPayment()
      ]);
      setPaymentsData(payments);
      setLastPaidDate(lastPaid.last_paid_date);
      // Show success message
      setError(null);
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/live');
      }, 2000);
    } catch (error: any) {
      console.error('Error confirming payment:', error);
      setError(error.message || 'Failed to confirm payment');
    } finally {
      setProcessing(false);
    }
  };

  const handlePayNow = async () => {
    if (!paymentsData || paymentsData.outstanding_payments.length === 0) {
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const { url } = await apiService.createPaymentIntent();
      
      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Error initiating payment:', error);
      setError(error.message || 'Failed to initiate payment');
      setProcessing(false);
    }
  };

  const handleBack = () => {
    router.push('/live');
  };

  const formatMonth = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  if (loading || loadingPayments) {
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

  const hasOutstandingPayments = paymentsData && paymentsData.outstanding_payments.length > 0;

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundColor: '#161748',
      }}
    >
      <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
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
          Pay Rent
        </Typography>

        {error && (
          <Alert
            severity="error"
            sx={{
              backgroundColor: 'rgba(244, 67, 54, 0.2)',
              color: '#FFFFFF',
              border: '1px solid #f44336',
              borderRadius: 2,
              mb: 4,
              '& .MuiAlert-icon': {
                color: '#f44336',
              },
            }}
          >
            {error}
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
            {!hasOutstandingPayments ? (
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#39a0ca',
                    fontFamily: 'var(--font-lora), serif',
                    fontWeight: 'bold',
                    mb: 2,
                  }}
                >
                  No payment required at this time
                </Typography>
                {lastPaidDate && (
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#FFFFFF',
                      fontFamily: 'var(--font-lora), serif',
                      fontSize: '1.1rem',
                    }}
                  >
                    Rent last paid on {formatDate(lastPaidDate)}
                  </Typography>
                )}
              </Box>
            ) : (
              <Stack spacing={3}>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#39a0ca',
                      fontFamily: 'var(--font-lora), serif',
                      fontWeight: 'bold',
                      mb: 2,
                    }}
                  >
                    Amount Owed
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      color: '#FFFFFF',
                      fontFamily: 'var(--font-lora), serif',
                      fontWeight: 'bold',
                    }}
                  >
                    ${paymentsData.total_amount.toFixed(2)}
                  </Typography>
                </Box>

                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />

                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#39a0ca',
                      fontFamily: 'var(--font-lora), serif',
                      fontWeight: 'bold',
                      mb: 2,
                    }}
                  >
                    Payment Due For
                  </Typography>
                  <Stack spacing={1}>
                    {paymentsData.outstanding_payments.map((payment) => (
                      <Box
                        key={payment.id}
                        sx={{
                          p: 2,
                          backgroundColor: payment.overdue
                            ? 'rgba(244, 67, 54, 0.1)'
                            : 'rgba(255, 255, 255, 0.05)',
                          borderRadius: 1,
                          border: payment.overdue
                            ? '1px solid rgba(244, 67, 54, 0.3)'
                            : '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            color: '#FFFFFF',
                            fontFamily: 'var(--font-lora), serif',
                            fontSize: '1.1rem',
                          }}
                        >
                          {formatMonth(payment.payment_month)} - ${payment.amount.toFixed(2)}
                          {payment.overdue && (
                            <Typography
                              component="span"
                              sx={{
                                color: '#f44336',
                                ml: 1,
                                fontWeight: 'bold',
                              }}
                            >
                              (Overdue)
                            </Typography>
                          )}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>

                {lastPaidDate && (
                  <>
                    <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#D3D3D3',
                        fontFamily: 'var(--font-lora), serif',
                        fontSize: '0.9rem',
                      }}
                    >
                      Last payment: {formatDate(lastPaidDate)}
                    </Typography>
                  </>
                )}

                <Button
                  variant="contained"
                  size="large"
                  onClick={handlePayNow}
                  disabled={processing}
                  fullWidth
                  sx={{
                    backgroundColor: '#478559',
                    color: '#FFFFFF',
                    fontFamily: 'var(--font-lora), serif',
                    fontSize: '1.1rem',
                    py: 2,
                    borderRadius: 2,
                    mt: 2,
                    '&:hover': {
                      backgroundColor: '#3a6d47',
                    },
                    '&:disabled': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: 'rgba(255, 255, 255, 0.5)',
                    },
                  }}
                >
                  {processing ? 'Processing...' : `Pay $${paymentsData.total_amount.toFixed(2)}`}
                </Button>
              </Stack>
            )}
          </CardContent>
        </Card>
      </Box>
    </div>
  );
}

