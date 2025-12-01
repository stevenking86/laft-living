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
  TextField,
  Button,
  Stack,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import { ArrowBack, LocationOn, Pets, LocalParking } from '@mui/icons-material';

interface Property {
  id: number;
  name: string;
  address: string;
  office_hours: string;
  pets_allowed: boolean;
  has_parking: boolean;
}

interface UnitMonthlyPrice {
  id: number;
  term: string;
  price: number;
}

interface Unit {
  id: number;
  name: string;
  property: Property;
  available: boolean;
  unit_monthly_prices: UnitMonthlyPrice[];
}

export default function ApplyForUnit() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const unitId = params?.id ? parseInt(params.id as string) : null;

  const [unit, setUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    move_in_date: '',
    unit_monthly_price_id: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && unitId) {
      fetchUnit();
    }
  }, [user, unitId]);

  const fetchUnit = async () => {
    if (!unitId) return;
    try {
      setLoading(true);
      const data = await apiService.getUnit(unitId) as Unit;
      setUnit(data);
      // Set default unit_monthly_price_id to first available price
      if (data.unit_monthly_prices && data.unit_monthly_prices.length > 0) {
        setFormData(prev => ({
          ...prev,
          unit_monthly_price_id: data.unit_monthly_prices[0].id.toString(),
        }));
      }
    } catch (error) {
      console.error('Error fetching unit:', error);
      setError('Failed to load unit information');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string } }) => {
    const name = e.target.name as string;
    const value = e.target.value as string;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unit || !user) return;

    setSubmitting(true);
    setError('');

    try {
      const application = await apiService.createRentalApplication({
        property_id: unit.property.id,
        unit_id: unit.id,
        unit_monthly_price_id: parseInt(formData.unit_monthly_price_id),
        move_in_date: formData.move_in_date,
        first_name: formData.first_name,
        middle_name: formData.middle_name || undefined,
        last_name: formData.last_name,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
      });
      // Redirect to ID verification page
      router.push(`/leasing/apply/${application.id}/verify`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
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

  if (!user || !unit) {
    return null;
  }

  const selectedPrice = unit.unit_monthly_prices.find(
    p => p.id.toString() === formData.unit_monthly_price_id
  );

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundColor: '#161748',
        padding: '2rem 1rem',
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push('/leasing')}
            sx={{
              color: '#D3D3D3',
              mb: 2,
              '&:hover': {
                color: '#FFFFFF',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Back to Units
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
            Rental Application
          </Typography>
        </Box>

        {/* Unit Details Card */}
        <Card
          sx={{
            backgroundColor: '#478559',
            borderRadius: 3,
            mb: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h4"
              sx={{
                color: '#FFFFFF',
                fontFamily: 'var(--font-lora), serif',
                fontWeight: 'bold',
                mb: 2,
              }}
            >
              {unit.name}
            </Typography>

            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <LocationOn sx={{ color: '#D3D3D3', fontSize: 24 }} />
              <Typography
                variant="h6"
                sx={{
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-lora), serif',
                  fontWeight: 'bold',
                }}
              >
                {unit.property.name}
              </Typography>
            </Stack>

            <Typography
              variant="body1"
              sx={{
                color: '#D3D3D3',
                mb: 2,
                ml: 3,
              }}
            >
              {unit.property.address}
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
              {unit.property.pets_allowed && (
                <Chip
                  icon={<Pets />}
                  label="Pets Allowed"
                  size="small"
                  sx={{
                    backgroundColor: '#f95d9b',
                    color: '#FFFFFF',
                    '& .MuiChip-icon': {
                      color: '#FFFFFF',
                    },
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
                      color: '#FFFFFF',
                    },
                  }}
                />
              )}
            </Stack>

            {selectedPrice && (
              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#D3D3D3',
                    mb: 1,
                  }}
                >
                  Selected Lease Term: {selectedPrice.term}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#FFFFFF',
                    fontFamily: 'var(--font-lora), serif',
                    fontWeight: 'bold',
                  }}
                >
                  ${selectedPrice.price.toFixed(2)}/month
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Application Form */}
        <Card
          sx={{
            backgroundColor: '#39a0ca',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h5"
              sx={{
                color: '#FFFFFF',
                fontFamily: 'var(--font-lora), serif',
                fontWeight: 'bold',
                mb: 3,
              }}
            >
              Application Information
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                {/* Email (read-only) */}
                <Box>
                  <TextField
                    name="email"
                    label="Email Address"
                    type="email"
                    value={user.email}
                    disabled
                    fullWidth
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: '#FFFFFF',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        '& fieldset': {
                          borderColor: '#478559',
                        },
                        '&.Mui-disabled': {
                          color: '#D3D3D3',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
                </Box>

                {/* First Name, Middle Name, Last Name */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                  <TextField
                    name="first_name"
                    label="First Name"
                    type="text"
                    value={formData.first_name}
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
                  </Box>

                  {/* Middle Name */}
                  <Box sx={{ flex: 1 }}>
                  <TextField
                    name="middle_name"
                    label="Middle Name (Optional)"
                    type="text"
                    value={formData.middle_name}
                    onChange={handleChange}
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
                  </Box>

                  {/* Last Name */}
                  <Box sx={{ flex: 1 }}>
                  <TextField
                    name="last_name"
                    label="Last Name"
                    type="text"
                    value={formData.last_name}
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
                  </Box>
                </Box>

                {/* Date of Birth and Gender */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                  <Box sx={{ flex: { xs: 1, sm: '0 0 33.333%' } }}>
                  <TextField
                    name="date_of_birth"
                    label="Date of Birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    required
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
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
                  </Box>

                  {/* Gender */}
                  <Box sx={{ flex: { xs: 1, sm: '0 0 66.666%' } }}>
                  <FormControl fullWidth required>
                    <InputLabel
                      sx={{
                        color: '#D3D3D3',
                        '&.Mui-focused': {
                          color: '#478559',
                        },
                      }}
                    >
                      Gender
                    </InputLabel>
                    <Select
                      name="gender"
                      value={formData.gender}
                      onChange={(e) => {
                        const target = { name: 'gender', value: e.target.value as string };
                        handleChange({ target } as React.ChangeEvent<HTMLInputElement>);
                      }}
                      label="Gender"
                      sx={{
                        color: '#FFFFFF',
                        minWidth: 200,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#478559',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#3d734c',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#478559',
                        },
                        '& .MuiSvgIcon-root': {
                          color: '#D3D3D3',
                        },
                      }}
                    >
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                      <MenuItem value="non-binary">Non-binary</MenuItem>
                      <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
                    </Select>
                  </FormControl>
                  </Box>
                </Box>

                {/* Move-in Date and Lease Term */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                  <TextField
                    name="move_in_date"
                    label="Move-in Date"
                    type="date"
                    value={formData.move_in_date}
                    onChange={handleChange}
                    required
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      min: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
                    }}
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
                  </Box>

                  {/* Lease Term Selection */}
                  <Box sx={{ flex: 1 }}>
                  <FormControl fullWidth required>
                    <InputLabel
                      sx={{
                        color: '#D3D3D3',
                        '&.Mui-focused': {
                          color: '#478559',
                        },
                      }}
                    >
                      Lease Term
                    </InputLabel>
                    <Select
                      name="unit_monthly_price_id"
                      value={formData.unit_monthly_price_id}
                      onChange={(e) => {
                        const target = { name: 'unit_monthly_price_id', value: e.target.value as string };
                        handleChange({ target } as React.ChangeEvent<HTMLInputElement>);
                      }}
                      label="Lease Term"
                      sx={{
                        color: '#FFFFFF',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#478559',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#3d734c',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#478559',
                        },
                        '& .MuiSvgIcon-root': {
                          color: '#D3D3D3',
                        },
                      }}
                    >
                      {unit.unit_monthly_prices.map((price) => (
                        <MenuItem key={price.id} value={price.id.toString()}>
                          {price.term} - ${price.price.toFixed(2)}/month
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  </Box>
                </Box>

                {/* Submit Button */}
                <Box>
                  <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={submitting}
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
                      {submitting ? 'Submitting...' : 'Submit Application'}
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => router.push('/leasing')}
                      sx={{
                        color: '#478559',
                        borderColor: '#478559',
                        '&:hover': {
                          borderColor: '#3d734c',
                          backgroundColor: 'rgba(71, 133, 89, 0.08)',
                        },
                      }}
                    >
                      Cancel
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

