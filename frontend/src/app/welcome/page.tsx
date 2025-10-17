'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Typography, Stack, Card, CardContent, CardActionArea, Box } from '@mui/material';

export default function Welcome() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

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
