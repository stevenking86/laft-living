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

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirmation: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
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
      await signup(
        formData.name,
        formData.email,
        formData.password,
        formData.passwordConfirmation
      );
      router.push('/welcome');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during sign up');
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
            Sign Up
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                name="name"
                label="Name"
                type="text"
                value={formData.name}
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

              <TextField
                name="passwordConfirmation"
                label="Confirm Password"
                type="password"
                value={formData.passwordConfirmation}
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
                {loading ? 'Creating Account...' : 'Sign Up'}
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
