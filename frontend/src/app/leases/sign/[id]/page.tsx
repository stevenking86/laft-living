'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';
import {
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  Stack,
  Alert,
  CircularProgress,
  TextField,
  Divider,
} from '@mui/material';
import { ArrowBack, CheckCircle } from '@mui/icons-material';

interface RentalApplication {
  id: number;
  move_in_date: string;
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
  first_name: string;
  last_name: string;
}

export default function SignLease() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const applicationId = params?.id ? parseInt(params.id as string) : null;

  const [application, setApplication] = useState<RentalApplication | null>(null);
  const [signature, setSignature] = useState('');
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (applicationId && user) {
      loadApplication();
    }
  }, [applicationId, user]);

  const loadApplication = async () => {
    if (!applicationId) return;
    
    try {
      setLoading(true);
      const applications = await apiService.getRentalApplications();
      const app = applications.find((a: RentalApplication) => a.id === applicationId);
      
      if (!app) {
        setError('Application not found');
        return;
      }
      
      if (app.status !== 'approved') {
        setError('This application is not approved');
        return;
      }
      
      if (app.has_lease) {
        setError('Lease already exists for this application');
        return;
      }
      
      setApplication(app);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error.message || 'Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async () => {
    if (!signature.trim() || !applicationId) {
      setError('Please enter your full name to sign');
      return;
    }

    setSigning(true);
    setError('');

    try {
      await apiService.createLease(applicationId);
      setSigned(true);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error.message || 'Failed to sign lease');
    } finally {
      setSigning(false);
    }
  };

  const handleBack = () => {
    router.push('/welcome');
  };

  const handleContinue = () => {
    router.push('/welcome');
  };

  if (authLoading || loading) {
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
    return null;
  }

  if (signed) {
    return (
      <div 
        className="min-h-screen relative"
        style={{
          backgroundColor: '#161748',
        }}
      >
        <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
          <Card
            sx={{
              backgroundColor: 'rgba(71, 133, 89, 0.2)',
              border: '1px solid #478559',
              borderRadius: 3,
              p: 4,
            }}
          >
            <Stack spacing={3} alignItems="center" textAlign="center">
              <CheckCircle sx={{ fontSize: 64, color: '#478559' }} />
              <Typography
                variant="h4"
                sx={{
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-lora), serif',
                  fontWeight: 'bold',
                }}
              >
                Lease Signed Successfully!
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#D3D3D3',
                  fontFamily: 'var(--font-lora), serif',
                  fontSize: '1.1rem',
                }}
              >
                Your lease has been signed and you can now access your living section.
              </Typography>
              <Button
                variant="contained"
                onClick={handleContinue}
                sx={{
                  backgroundColor: '#478559',
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-lora), serif',
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: '#3a6d47',
                  },
                }}
              >
                Continue
              </Button>
            </Stack>
          </Card>
        </Box>
      </div>
    );
  }

  if (!application) {
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
            <ArrowBack sx={{ mr: 1 }} /> Back
          </Button>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
        </Box>
      </div>
    );
  }

  const moveInDate = new Date(application.move_in_date);
  const formattedDate = moveInDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundColor: '#161748',
      }}
    >
      <Box sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
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
          <ArrowBack sx={{ mr: 1 }} /> Back
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
          Sign Your Lease
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={4}>
          {/* Lease Details Review */}
          <Card
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 3,
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography
                variant="h5"
                sx={{
                  color: '#39a0ca',
                  fontFamily: 'var(--font-lora), serif',
                  fontWeight: 'bold',
                  mb: 3,
                }}
              >
                Lease Details
              </Typography>
              
              <Stack spacing={2}>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#D3D3D3',
                      fontFamily: 'var(--font-lora), serif',
                      mb: 0.5,
                    }}
                  >
                    Property
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#FFFFFF',
                      fontFamily: 'var(--font-lora), serif',
                      fontSize: '1.1rem',
                    }}
                  >
                    {application.property.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#D3D3D3',
                      fontFamily: 'var(--font-lora), serif',
                    }}
                  >
                    {application.property.address}
                  </Typography>
                </Box>

                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />

                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#D3D3D3',
                      fontFamily: 'var(--font-lora), serif',
                      mb: 0.5,
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
                    {application.unit.name}
                  </Typography>
                </Box>

                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />

                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#D3D3D3',
                      fontFamily: 'var(--font-lora), serif',
                      mb: 0.5,
                    }}
                  >
                    Move-In Date
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#FFFFFF',
                      fontFamily: 'var(--font-lora), serif',
                      fontSize: '1.1rem',
                    }}
                  >
                    {formattedDate}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Terms Section */}
          <Card
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 3,
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography
                variant="h5"
                sx={{
                  color: '#39a0ca',
                  fontFamily: 'var(--font-lora), serif',
                  fontWeight: 'bold',
                  mb: 3,
                }}
              >
                Lease Terms
              </Typography>
              
              <Box
                sx={{
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: 2,
                  p: 3,
                  maxHeight: 300,
                  overflowY: 'auto',
                  mb: 3,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: '#D3D3D3',
                    fontFamily: 'var(--font-lora), serif',
                    whiteSpace: 'pre-line',
                    lineHeight: 1.8,
                  }}
                >
                  {`By signing this lease, you agree to the following terms:

1. You will pay rent on time each month as specified in your rental agreement.

2. You will maintain the property in good condition and report any maintenance issues promptly.

3. You will comply with all property rules and regulations.

4. You understand that this lease is binding and you are responsible for the full term of the lease.

5. Any violations of the lease terms may result in termination of the lease agreement.

Please review all terms carefully before signing.`}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Signature Section */}
          <Card
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 3,
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography
                variant="h5"
                sx={{
                  color: '#39a0ca',
                  fontFamily: 'var(--font-lora), serif',
                  fontWeight: 'bold',
                  mb: 3,
                }}
              >
                Sign Lease
              </Typography>
              
              <Typography
                variant="body1"
                sx={{
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-lora), serif',
                  mb: 2,
                }}
              >
                By entering your full name below, you are electronically signing this lease agreement.
              </Typography>

              <TextField
                fullWidth
                label="Full Name"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder={`${application.first_name} ${application.last_name}`}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    color: '#FFFFFF',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#39a0ca',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#D3D3D3',
                    '&.Mui-focused': {
                      color: '#39a0ca',
                    },
                  },
                }}
              />

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleSign}
                disabled={!signature.trim() || signing}
                sx={{
                  backgroundColor: '#478559',
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-lora), serif',
                  fontSize: '1.1rem',
                  py: 2,
                  '&:hover': {
                    backgroundColor: '#3a6d47',
                  },
                  '&:disabled': {
                    backgroundColor: 'rgba(71, 133, 89, 0.3)',
                    color: 'rgba(255, 255, 255, 0.5)',
                  },
                }}
              >
                {signing ? <CircularProgress size={24} sx={{ color: '#FFFFFF' }} /> : 'Sign Lease'}
              </Button>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </div>
  );
}

