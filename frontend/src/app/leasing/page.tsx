'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';
import { 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Box, 
  Chip,
  Button,
  Stack
} from '@mui/material';
import { ArrowBack, LocationOn, Schedule, Pets, LocalParking } from '@mui/icons-material';

interface Property {
  id: number;
  name: string;
  address: string;
  office_hours: string;
  pets_allowed: boolean;
  has_parking: boolean;
}

interface Unit {
  id: number;
  name: string;
  property: Property;
  available: boolean;
  current_lease?: {
    id: number;
    move_in_date: string;
    move_out_date: string;
    signed: boolean;
  };
}

export default function Leasing() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [units, setUnits] = useState<Unit[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchAvailableUnits();
    }
  }, [user]);

  const fetchAvailableUnits = async () => {
    try {
      setLoadingUnits(true);
      const data = await apiService.getUnits() as Unit[];
      setUnits(data);
      console.log('Fetched units:', data);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      console.error('Error fetching units:', err);
      // If authentication error, redirect to sign in
      if (err.message.includes('401') || err.message.includes('Authentication')) {
        console.error('Authentication required - redirecting to sign in');
        router.push('/signin');
      }
      setUnits([]);
    } finally {
      setLoadingUnits(false);
    }
  };

  const handleBack = () => {
    router.push('/welcome');
  };

  if (loading || loadingUnits) {
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
      className="min-h-screen relative"
      style={{
        backgroundColor: '#161748',
        padding: '2rem 1rem',
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={handleBack}
            sx={{
              color: '#D3D3D3',
              mb: 2,
              '&:hover': {
                color: '#FFFFFF',
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Back to Dashboard
          </Button>
          
          <Typography
            variant="h3"
            component="h1"
            sx={{
              color: '#f95d9b',
              fontFamily: 'var(--font-lora), serif',
              fontWeight: 'bold',
              mb: 2,
            }}
          >
            Available Units
          </Typography>
          
          <Typography
            variant="h6"
            sx={{
              color: '#D3D3D3',
              mb: 3,
            }}
          >
            Find your perfect home from our available units near you. 
          </Typography>
        </Box>

        {/* Units Grid */}
        {!loadingUnits && units.length === 0 ? (
          <Card 
            sx={{ 
              backgroundColor: '#39a0ca',
              borderRadius: 3,
              p: 4,
              textAlign: 'center'
            }}
          >
            <Typography
              variant="h5"
              sx={{
                color: '#FFFFFF',
                fontFamily: 'var(--font-lora), serif',
              }}
            >
              No available units at the moment
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#D3D3D3',
                mt: 1,
              }}
            >
              Check back later for new listings
            </Typography>
          </Card>
        ) : (
          <Box 
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)'
              },
              gap: 3
            }}
          >
            {units.map((unit) => (
              <Box key={unit.id}>
                <Card 
                  sx={{ 
                    backgroundColor: '#478559',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                      transition: 'all 0.3s ease-in-out'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    {/* Unit Header */}
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="h5"
                        component="h2"
                        sx={{
                          color: '#FFFFFF',
                          fontFamily: 'var(--font-lora), serif',
                          fontWeight: 'bold',
                          mb: 1
                        }}
                      >
                        {unit.name}
                      </Typography>
                      
                      <Chip
                        label="Available"
                        sx={{
                          backgroundColor: '#39a0ca',
                          color: '#FFFFFF',
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>

                    {/* Property Info */}
                    <Box sx={{ mb: 3 }}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                        <LocationOn sx={{ color: '#D3D3D3', fontSize: 20 }} />
                        <Typography
                          variant="h6"
                          sx={{
                            color: '#FFFFFF',
                            fontFamily: 'var(--font-lora), serif',
                            fontWeight: 'bold'
                          }}
                        >
                          {unit.property.name}
                        </Typography>
                      </Stack>
                      
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#D3D3D3',
                          mb: 1,
                          ml: 3
                        }}
                      >
                        {unit.property.address}
                      </Typography>
                    </Box>

                    {/* Property Features */}
                    <Box sx={{ mb: 3 }}>
                      <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                        {unit.property.pets_allowed && (
                          <Chip
                            icon={<Pets />}
                            label="Pets Allowed"
                            size="small"
                            sx={{
                              backgroundColor: '#f95d9b',
                              color: '#FFFFFF',
                              '& .MuiChip-icon': {
                                color: '#FFFFFF'
                              }
                            }}
                          />
                        )}
                        {unit.property.has_parking && (
                          <Chip
                            icon={<LocalParking />}
                            label="Parking Available"
                            size="small"
                            sx={{
                              backgroundColor: '#39a0ca',
                              color: '#FFFFFF',
                              '& .MuiChip-icon': {
                                color: '#FFFFFF'
                              }
                            }}
                          />
                        )}
                      </Stack>
                    </Box>

                    {/* Action Button */}
                    <Box sx={{ mt: 'auto', pt: 2 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => router.push(`/leasing/apply/${unit.id}`)}
                        sx={{
                          backgroundColor: '#f95d9b',
                          color: '#FFFFFF',
                          fontWeight: 'bold',
                          '&:hover': {
                            backgroundColor: '#e54a8a'
                          }
                        }}
                      >
                        Apply
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        )}
      </div>
    </div>
  );
}
