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
  Grid,
} from '@mui/material';
import { ArrowBack, CloudUpload, CheckCircle, Error } from '@mui/icons-material';

interface Verification {
  id: number;
  verification_status: 'pending' | 'verified' | 'failed';
  name_match?: boolean;
  failure_reason?: string;
  debug_info?: {
    app_first: string;
    app_middle?: string;
    app_last: string;
    id_first: string;
    id_middle?: string;
    id_last: string;
    first_match: boolean;
    last_match: boolean;
    middle_match: boolean;
    id_valid: boolean;
  };
}

export default function VerifyId() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const rentalApplicationId = params?.id ? parseInt(params.id as string) : null;

  const [idImage, setIdImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verification, setVerification] = useState<Verification | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (rentalApplicationId && user) {
      loadVerification();
    }
  }, [rentalApplicationId, user]);

  const loadVerification = async () => {
    if (!rentalApplicationId) return;
    
    try {
      setLoading(true);
      const data = await apiService.getVerification(rentalApplicationId);
      setVerification(data);
      
      // If verification is pending, start polling
      if (data.verification_status === 'pending') {
        pollVerificationStatus();
      }
    } catch (err) {
      // Verification might not exist yet, which is fine
      setVerification(null);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Image must be less than 10MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      setIdImage(file);
      setError('');
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!idImage || !rentalApplicationId) return;

    setUploading(true);
    setError('');

    try {
      const result = await apiService.uploadIdVerification(rentalApplicationId, idImage);
      setVerification(result);
      
      // Poll for verification status
      if (result.verification_status === 'pending') {
        pollVerificationStatus();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload ID');
    } finally {
      setUploading(false);
    }
  };

  const pollVerificationStatus = async () => {
    if (!rentalApplicationId) return;
    
    setVerifying(true);
    const maxAttempts = 30;
    let attempts = 0;

    const interval = setInterval(async () => {
      attempts++;
      try {
        const data = await apiService.getVerification(rentalApplicationId);
        setVerification(data);
        
        if (data.verification_status !== 'pending' || attempts >= maxAttempts) {
          clearInterval(interval);
          setVerifying(false);
        }
      } catch (err) {
        clearInterval(interval);
        setVerifying(false);
      }
    }, 2000); // Poll every 2 seconds
  };

  if (authLoading || loading) {
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
    return null;
  }

  const isVerified = verification?.verification_status === 'verified';
  const isFailed = verification?.verification_status === 'failed';

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundColor: '#161748',
        padding: '2rem 1rem',
      }}
    >
      <div className="max-w-4xl mx-auto">
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push('/welcome')}
            sx={{
              color: '#D3D3D3',
              mb: 2,
              '&:hover': {
                color: '#FFFFFF',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Back
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
            ID Verification
          </Typography>
        </Box>

        <Card
          sx={{
            backgroundColor: '#39a0ca',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {isVerified && (
              <Alert
                severity="success"
                icon={<CheckCircle />}
                sx={{ mb: 3 }}
              >
                ID verified successfully! Your name matches the application.
              </Alert>
            )}

            {isFailed && (
              <>
                <Alert
                  severity="error"
                  icon={<Error />}
                  sx={{ mb: 3 }}
                >
                  Verification failed.{' '}
                  {verification?.name_match === false
                    ? 'Name on ID does not match application.'
                    : 'ID could not be verified as valid.'}
                  {verification?.failure_reason && (
                    <Box sx={{ mt: 1, fontSize: '0.875rem' }}>
                      Reason: {verification.failure_reason}
                    </Box>
                  )}
                </Alert>

                {verification?.debug_info && (
                  <Card
                    sx={{
                      backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      mb: 3,
                      p: 2,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ color: '#FFFFFF', mb: 1, fontWeight: 'bold' }}
                    >
                      Debug Information:
                    </Typography>
                    <Box sx={{ color: '#D3D3D3', fontSize: '0.875rem' }}>
                      <Box sx={{ mb: 1 }}>
                        <strong>Application Name:</strong>{' '}
                        {verification.debug_info.app_first}{' '}
                        {verification.debug_info.app_middle && `${verification.debug_info.app_middle} `}
                        {verification.debug_info.app_last}
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <strong>ID Extracted Name:</strong>{' '}
                        {verification.debug_info.id_first}{' '}
                        {verification.debug_info.id_middle && `${verification.debug_info.id_middle} `}
                        {verification.debug_info.id_last}
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <strong>Matches:</strong>
                        <Box component="span" sx={{ ml: 1 }}>
                          First: {verification.debug_info.first_match ? '✓' : '✗'},{' '}
                          Last: {verification.debug_info.last_match ? '✓' : '✗'},{' '}
                          Middle: {verification.debug_info.middle_match ? '✓' : '✗'}
                        </Box>
                      </Box>
                      <Box>
                        <strong>ID Valid:</strong>{' '}
                        {verification.debug_info.id_valid ? 'Yes' : 'No'}
                      </Box>
                    </Box>
                  </Card>
                )}
              </>
            )}

            {verifying && (
              <Alert sx={{ mb: 3 }}>
                <CircularProgress size={20} sx={{ mr: 2 }} />
                Verifying your ID...
              </Alert>
            )}

            {!isVerified && (
              <>
                <Typography
                  variant="h5"
                  sx={{
                    color: '#FFFFFF',
                    fontFamily: 'var(--font-lora), serif',
                    fontWeight: 'bold',
                    mb: 2,
                  }}
                >
                  Upload a photo of your government-issued ID
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    color: '#D3D3D3',
                    mb: 3,
                  }}
                >
                  Please upload a clear photo of your driver&apos;s license, passport, or other
                  government-issued ID. The name on the ID must match the name on your
                  application.
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="id-image-upload"
                    type="file"
                    onChange={handleImageSelect}
                    disabled={uploading || verifying}
                  />
                  <label htmlFor="id-image-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUpload />}
                      disabled={uploading || verifying}
                      sx={{
                        color: '#478559',
                        borderColor: '#478559',
                        mb: 2,
                        '&:hover': {
                          borderColor: '#3d734c',
                          backgroundColor: 'rgba(71, 133, 89, 0.08)',
                        },
                      }}
                    >
                      Select ID Image
                    </Button>
                  </label>

                  {preview && (
                    <Box sx={{ mt: 2 }}>
                      <img
                        src={preview}
                        alt="ID preview"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '400px',
                          borderRadius: '8px',
                          border: '2px solid #478559',
                        }}
                      />
                    </Box>
                  )}
                </Box>

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    onClick={handleUpload}
                    disabled={!idImage || uploading || verifying}
                    sx={{
                      backgroundColor: '#f95d9b',
                      color: '#FFFFFF',
                      fontWeight: 'bold',
                      '&:hover': {
                        backgroundColor: '#e54a8a',
                      },
                      '&:disabled': {
                        backgroundColor: 'rgba(249, 93, 155, 0.5)',
                        color: 'rgba(255, 255, 255, 0.5)',
                      },
                    }}
                  >
                    {uploading ? 'Uploading...' : 'Upload & Verify'}
                  </Button>
                </Stack>
              </>
            )}

            {isVerified && (
              <Button
                variant="contained"
                onClick={() => router.push('/welcome')}
                sx={{
                  backgroundColor: '#478559',
                  color: '#FFFFFF',
                  fontWeight: 'bold',
                  mt: 2,
                  '&:hover': {
                    backgroundColor: '#3d734c',
                  },
                }}
              >
                Continue
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

