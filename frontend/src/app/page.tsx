'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/welcome');
    }
  }, [user, loading, router]);

  const handleSignUp = () => {
    router.push('/signup');
  };

  const handleSignIn = () => {
    router.push('/signin');
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen relative flex items-center justify-center"
        style={{
          backgroundColor: '#161748',
        }}
      >
        <div className="text-center">
          <h1 
            className="text-8xl font-bold text-center"
            style={{
              color: '#f95d9b',
              fontFamily: 'var(--font-lora), serif'
            }}
          >
            Laft Living
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen relative flex items-center justify-center"
      style={{
        backgroundColor: '#161748',
      }}
    >
      <div className="text-center">
        <h1 
          className="text-8xl font-bold text-center"
          style={{
            color: '#f95d9b',
            fontFamily: 'var(--font-lora), serif'
          }}
        >
          Laft Living
        </h1>
        <Stack direction="row" spacing={2} sx={{ mt: 4, justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            size="large"
            onClick={handleSignUp}
            sx={{
              backgroundColor: '#478559',
              color: '#FFFFFF',
              '&:hover': { backgroundColor: '#3d734c' },
            }}
          >
            Sign up
          </Button>
          <Button 
            variant="outlined" 
            size="large"
            onClick={handleSignIn}
            sx={{
              color: '#478559',
              borderColor: '#478559',
              '&:hover': {
                borderColor: '#3d734c',
                backgroundColor: 'rgba(71, 133, 89, 0.08)'
              }
            }}
          >
            Sign in
          </Button>
        </Stack>
      </div>
    </div>
  );
}