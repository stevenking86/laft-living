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
  CircularProgress,
  LinearProgress,
  Alert
} from '@mui/material';

interface LoyaltyStatus {
  tier: string;
  on_time_payments_count: number;
  next_tier: string | null;
  payments_needed_for_next_tier: number;
  discount_percentage: number;
  property: {
    id: number;
    name: string;
  };
}

export default function Rewards() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [loyaltyStatus, setLoyaltyStatus] = useState<LoyaltyStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchLoyaltyStatus = async () => {
      if (!user) return;

      try {
        setLoadingStatus(true);
        const status = await apiService.getLoyaltyStatus();
        setLoyaltyStatus(status);
      } catch (error: any) {
        console.error('Error fetching loyalty status:', error);
        setError(error.message || 'Failed to load loyalty status');
      } finally {
        setLoadingStatus(false);
      }
    };

    if (user) {
      fetchLoyaltyStatus();
    }
  }, [user]);

  const handleBack = () => {
    router.push('/welcome');
  };

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'bronze':
        return '#D3D3D3'; // Grey
      case 'silver':
        return '#C0C0C0'; // Silver
      case 'gold':
        return '#FFD700'; // Gold
      default:
        return '#D3D3D3';
    }
  };

  const getTierBenefits = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'bronze':
        return 'Welcome to our rewards program! Start earning benefits by paying rent on time.';
      case 'silver':
        return '3% discount on all rent payments. Keep paying on time to reach Gold tier!';
      case 'gold':
        return '5% discount on all rent payments. You\'re at the highest tier!';
      default:
        return '';
    }
  };

  const getProgressPercentage = () => {
    if (!loyaltyStatus) return 0;
    
    const current = loyaltyStatus.on_time_payments_count;
    const nextTier = loyaltyStatus.next_tier;
    
    if (!nextTier) return 100; // Already at highest tier
    
    if (nextTier === 'silver') {
      return Math.min(100, (current / 3) * 100);
    } else if (nextTier === 'gold') {
      return Math.min(100, (current / 6) * 100);
    }
    
    return 0;
  };

  if (loading || loadingStatus) {
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

  if (error && !loyaltyStatus) {
    return (
      <div
        className="min-h-screen relative"
        style={{
          backgroundColor: '#161748',
        }}
      >
        <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
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
          <Alert
            severity="error"
            sx={{
              backgroundColor: 'rgba(244, 67, 54, 0.2)',
              color: '#FFFFFF',
              border: '1px solid #f44336',
              borderRadius: 2,
            }}
          >
            {error}
          </Alert>
        </Box>
      </div>
    );
  }

  if (!loyaltyStatus) {
    return null;
  }

  const progressPercentage = getProgressPercentage();

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
          Rewards
        </Typography>

        {/* Current Tier Card */}
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
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="h4"
                  sx={{
                    color: getTierColor(loyaltyStatus.tier),
                    fontFamily: 'var(--font-lora), serif',
                    fontWeight: 'bold',
                    mb: 1,
                    textTransform: 'capitalize',
                  }}
                >
                  {loyaltyStatus.tier} Tier
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#FFFFFF',
                    fontFamily: 'var(--font-lora), serif',
                    fontSize: '1.1rem',
                  }}
                >
                  {getTierBenefits(loyaltyStatus.tier)}
                </Typography>
              </Box>

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
                  On-Time Payments: {loyaltyStatus.on_time_payments_count}
                </Typography>

                {loyaltyStatus.next_tier && (
                  <>
                    <Typography
                      variant="body1"
                      sx={{
                        color: '#FFFFFF',
                        fontFamily: 'var(--font-lora), serif',
                        fontSize: '1rem',
                        mb: 2,
                      }}
                    >
                      {loyaltyStatus.payments_needed_for_next_tier} more on-time payment{loyaltyStatus.payments_needed_for_next_tier !== 1 ? 's' : ''} needed for {loyaltyStatus.next_tier} tier
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={progressPercentage}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#f95d9b',
                          borderRadius: 5,
                        },
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#D3D3D3',
                        fontFamily: 'var(--font-lora), serif',
                        fontSize: '0.9rem',
                        mt: 1,
                        textAlign: 'center',
                      }}
                    >
                      {Math.round(progressPercentage)}% to {loyaltyStatus.next_tier} tier
                    </Typography>
                  </>
                )}

                {!loyaltyStatus.next_tier && (
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#478559',
                      fontFamily: 'var(--font-lora), serif',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                    }}
                  >
                    You've reached the highest tier! 🎉
                  </Typography>
                )}
              </Box>

              {loyaltyStatus.discount_percentage > 0 && (
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: 'rgba(71, 133, 89, 0.2)',
                    borderRadius: 2,
                    border: '1px solid #478559',
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#478559',
                      fontFamily: 'var(--font-lora), serif',
                      fontWeight: 'bold',
                      mb: 1,
                    }}
                  >
                    Active Discount: {loyaltyStatus.discount_percentage}%
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#FFFFFF',
                      fontFamily: 'var(--font-lora), serif',
                    }}
                  >
                    You're saving {loyaltyStatus.discount_percentage}% on all rent payments!
                  </Typography>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Tier Benefits Info */}
        <Card
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 3,
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h6"
              sx={{
                color: '#39a0ca',
                fontFamily: 'var(--font-lora), serif',
                fontWeight: 'bold',
                mb: 3,
              }}
            >
              Tier Benefits
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: '#D3D3D3',
                    fontFamily: 'var(--font-lora), serif',
                    fontWeight: 'bold',
                  }}
                >
                  Bronze
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#FFFFFF',
                    fontFamily: 'var(--font-lora), serif',
                  }}
                >
                  Starting tier - No discount
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: '#C0C0C0',
                    fontFamily: 'var(--font-lora), serif',
                    fontWeight: 'bold',
                  }}
                >
                  Silver
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#FFFFFF',
                    fontFamily: 'var(--font-lora), serif',
                  }}
                >
                  3% discount on rent - Requires 3 on-time payments and no unpaid late payments
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: '#FFD700',
                    fontFamily: 'var(--font-lora), serif',
                    fontWeight: 'bold',
                  }}
                >
                  Gold
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#FFFFFF',
                    fontFamily: 'var(--font-lora), serif',
                  }}
                >
                  5% discount on rent - Requires 6 on-time payments and no unpaid late payments
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </div>
  );
}

