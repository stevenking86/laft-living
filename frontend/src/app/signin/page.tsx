'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Button,
  TextField,
  Container,
  Stack,
  Typography,
  Alert,
  Box,
} from '@mui/material';

export default function SignIn() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isResident, isPropertyAdmin, isMaintenance, isSuperAdmin } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login(formData.email, formData.password);
      // Redirect based on role from the login response
      const role = response.user?.role;
      if (role === 'super_admin') {
        router.push('/admin/super');
      } else if (role === 'property_admin') {
        router.push('/admin/property');
      } else if (role === 'maintenance') {
        router.push('/admin/maintenance');
      } else {
        // Resident or default
        router.push('/welcome');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen relative flex items-center justify-center"
      style={{
        backgroundColor: '#161748',
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 2,
            padding: 4,
            backdropFilter: 'blur(10px)',
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            align="center"
            sx={{
              color: '#f95d9b',
              fontFamily: 'var(--font-lora), serif',
              fontWeight: 'bold',
              mb: 4,
            }}
          >
            Sign In
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#FFFFFF',
                    '& fieldset': {
                      borderColor: '#478559',
                    },
                    '&:hover fieldset': {
                      borderColor: '#3d734c',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#478559',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#D3D3D3',
                    '&.Mui-focused': {
                      color: '#478559',
                    },
                  },
                }}
              />

              <TextField
                name="password"
                label="Password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#FFFFFF',
                    '& fieldset': {
                      borderColor: '#478559',
                    },
                    '&:hover fieldset': {
                      borderColor: '#3d734c',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#478559',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#D3D3D3',
                    '&.Mui-focused': {
                      color: '#478559',
                    },
                  },
                }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                fullWidth
                sx={{
                  backgroundColor: '#478559',
                  color: '#FFFFFF',
                  '&:hover': { backgroundColor: '#3d734c' },
                  '&:disabled': {
                    backgroundColor: 'rgba(71, 133, 89, 0.5)',
                    color: 'rgba(255, 255, 255, 0.5)',
                  },
                }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>

              <Button
                variant="outlined"
                size="large"
                fullWidth
                onClick={() => router.push('/')}
                sx={{
                  color: '#478559',
                  borderColor: '#478559',
                  '&:hover': {
                    borderColor: '#3d734c',
                    backgroundColor: 'rgba(71, 133, 89, 0.08)',
                  },
                }}
              >
                Back to Home
              </Button>
            </Stack>
          </form>
        </Box>
      </Container>
    </div>
  );
}
