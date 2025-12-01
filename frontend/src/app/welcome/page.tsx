'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';
import { Button, Typography, Stack, Card, CardContent, CardActionArea, Box, Alert } from '@mui/material';

interface RentalApplication {
  id: number;
  status: string;
  move_in_date: string;
  has_lease: boolean;
  property: {
    id: number;
    name: string;
    address: string;
  };
  unit: {
    id: number;
    name: string;
  };
}

export default function Welcome() {
  const { user, logout, loading, isResident, isPropertyAdmin, isMaintenance, isSuperAdmin } = useAuth();
  const router = useRouter();
  const [relevantApplications, setRelevantApplications] = useState<RentalApplication[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    } else if (!loading && user) {
      // Redirect non-residents to their appropriate dashboards
      if (isSuperAdmin()) {
        router.push('/admin/super');
      } else if (isPropertyAdmin()) {
        router.push('/admin/property');
      } else if (isMaintenance()) {
        router.push('/admin/maintenance');
      }
    }
  }, [user, loading, isResident, isPropertyAdmin, isMaintenance, isSuperAdmin, router]);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) return;
      
      try {
        setApplicationsLoading(true);
        const applications = await apiService.getRentalApplications();
        
        // Filter for applications that are:
        // 1. pending, OR
        // 2. approved but move_in_date is in the future (hasn't moved in yet)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const relevant = applications.filter((app: RentalApplication) => {
          if (app.status === 'pending') {
            return true;
          }
          if (app.status === 'approved') {
            const moveInDate = new Date(app.move_in_date);
            moveInDate.setHours(0, 0, 0, 0);
            return moveInDate > today;
          }
          return false;
        });
        
        setRelevantApplications(relevant);
      } catch (error) {
        console.error('Error fetching rental applications:', error);
      } finally {
        setApplicationsLoading(false);
      }
    };

    if (user) {
      fetchApplications();
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if logout fails, redirect to home
      router.push('/');
    }
  };

  const handleLeaseClick = () => {
    router.push('/leasing');
  };

  const handleRewardsClick = () => {
    router.push('/rewards');
  };

  const handleLiveClick = () => {
    router.push('/live');
  };

  const handleSignLease = (applicationId: number) => {
    router.push(`/leases/sign/${applicationId}`);
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen relative flex items-center justify-center"
        style={{
          backgroundColor: '#161748',
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: '#FFFFFF',
            fontFamily: 'var(--font-lora), serif',
          }}
        >
          Loading...
        </Typography>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div 
      className="min-h-screen relative flex items-center justify-center"
      style={{
        backgroundColor: '#161748',
      }}
    >
      <div className="text-center w-full max-w-6xl px-4">
        <Typography
          variant="h3"
          component="h2"
          sx={{
            color: '#FFFFFF',
            fontFamily: 'var(--font-lora), serif',
            fontWeight: 'bold',
            mb: 3,
          }}
        >
          👋 Hi
        </Typography>
        <Typography
          variant="h2"
          component="h1"
          sx={{
            color: '#f95d9b',
            fontFamily: 'var(--font-lora), serif',
            fontWeight: 'bold',
            mb: 6,
          }}
        >
          What do you want to do?
        </Typography>

        {/* Application Status Section */}
        {!applicationsLoading && relevantApplications.length > 0 && (
          <Box sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
            <Stack spacing={2}>
              {relevantApplications.map((application) => (
                <Alert
                  key={application.id}
                  severity={application.status === 'pending' ? 'info' : 'success'}
                  sx={{
                    backgroundColor: application.status === 'pending' 
                      ? 'rgba(57, 160, 202, 0.2)' 
                      : 'rgba(71, 133, 89, 0.2)',
                    color: '#FFFFFF',
                    border: `1px solid ${application.status === 'pending' ? '#39a0ca' : '#478559'}`,
                    borderRadius: 2,
                    '& .MuiAlert-icon': {
                      color: application.status === 'pending' ? '#39a0ca' : '#478559',
                    },
                  }}
                >
                  <Stack spacing={2}>
                    <Typography
                      variant="body1"
                      sx={{
                        fontFamily: 'var(--font-lora), serif',
                        fontSize: '1.1rem',
                      }}
                    >
                      {application.status === 'pending' 
                        ? `Your application for ${application.property.name} ${application.unit.name} is pending. Check here for updates.`
                        : `You've been approved for ${application.unit.name} at ${application.property.name}. Visit your living section to get started in your new home.`}
                    </Typography>
                    {application.status === 'approved' && !application.has_lease && (
                      <Button
                        variant="contained"
                        onClick={() => handleSignLease(application.id)}
                        sx={{
                          backgroundColor: '#478559',
                          color: '#FFFFFF',
                          fontFamily: 'var(--font-lora), serif',
                          '&:hover': {
                            backgroundColor: '#3a6d47',
                          },
                          alignSelf: 'flex-start',
                        }}
                      >
                        Sign Lease
                      </Button>
                    )}
                  </Stack>
                </Alert>
              ))}
            </Stack>
          </Box>
        )}
        
        {/* Three large card-style buttons */}
        <Stack 
          direction={{ xs: 'column', md: 'row' }} 
          spacing={4} 
          sx={{ 
            justifyContent: 'center',
            alignItems: 'stretch',
            mb: 4
          }}
        >
          {/* Leasing Card */}
          <Card 
            sx={{ 
              flex: 1,
              maxWidth: 300,
              backgroundColor: '#478559',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                transition: 'all 0.3s ease-in-out'
              }
            }}
          >
            <CardActionArea 
              onClick={handleLeaseClick}
              sx={{ 
                height: '100%',
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 200
              }}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography
                  variant="h4"
                  component="h2"
                  sx={{
                    color: '#FFFFFF',
                    fontFamily: 'var(--font-lora), serif',
                    fontWeight: 'bold',
                    mb: 2
                  }}
                >
                  Lease
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#D3D3D3',
                    fontSize: '1.1rem'
                  }}
                >
                  Find an apartment
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>

          {/* Live Card */}
          <Card 
            sx={{ 
              flex: 1,
              maxWidth: 300,
              backgroundColor: '#39a0ca',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                transition: 'all 0.3s ease-in-out'
              }
            }}
          >
            <CardActionArea 
              onClick={handleLiveClick}
              sx={{ 
                height: '100%',
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 200
              }}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography
                  variant="h4"
                  component="h2"
                  sx={{
                    color: '#FFFFFF',
                    fontFamily: 'var(--font-lora), serif',
                    fontWeight: 'bold',
                    mb: 2
                  }}
                >
                  Live
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#D3D3D3',
                    fontSize: '1.1rem'
                  }}
                >
                  Connect with your community
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>

          {/* Rewards Card */}
          <Card 
            sx={{ 
              flex: 1,
              maxWidth: 300,
              backgroundColor: '#f95d9b',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                transition: 'all 0.3s ease-in-out'
              }
            }}
          >
            <CardActionArea 
              onClick={handleRewardsClick}
              sx={{ 
                height: '100%',
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 200
              }}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography
                  variant="h4"
                  component="h2"
                  sx={{
                    color: '#FFFFFF',
                    fontFamily: 'var(--font-lora), serif',
                    fontWeight: 'bold',
                    mb: 2
                  }}
                >
                  Rewards
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#D3D3D3',
                    fontSize: '1.1rem'
                  }}
                >
                  earn points, get benefits
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Stack>

        {/* Sign Out Button */}
        <Box sx={{ mt: 4 }}>
          {user && (
            <Typography
              variant="body2"
              sx={{
                color: '#D3D3D3',
                fontFamily: 'var(--font-lora), serif',
                fontSize: '0.9rem',
                mb: 2,
              }}
            >
              You&apos;re logged in as {user.email.toLowerCase()}
            </Typography>
          )}
          <Button
            variant="outlined"
            size="large"
            onClick={handleSignOut}
            sx={{
              color: '#D3D3D3',
              borderColor: '#D3D3D3',
              '&:hover': {
                borderColor: '#FFFFFF',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#FFFFFF'
              }
            }}
          >
            Sign Out
          </Button>
        </Box>
      </div>
    </div>
  );
}
