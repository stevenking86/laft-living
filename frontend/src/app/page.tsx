'use client';

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

export default function Home() {
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