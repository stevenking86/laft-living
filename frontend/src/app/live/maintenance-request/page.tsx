'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiService, MaintenanceRequest } from '@/lib/api';
import {
  Typography,
  Stack,
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Grid,
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';

const CATEGORIES = ['Plumbing', 'Electrical', 'Appliance', 'Heating/Cooling', 'Pest', 'General'];
const URGENCY_LEVELS = ['Emergency', 'Urgent', 'Routine'];
const STATUS_COLORS: Record<string, string> = {
  Submitted: '#39a0ca',
  Scheduled: '#478559',
  'In Progress': '#f95d9b',
  Completed: '#D3D3D3',
};

export default function MaintenanceRequestPage() {
  const { user, loading, isResident } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [newTicket, setNewTicket] = useState<MaintenanceRequest | null>(null);
  
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    preferred_entry_time: '',
    resident_must_be_home: false,
    urgency_level: '',
    photos: [] as File[],
  });

  useEffect(() => {
    if (!loading && (!user || !isResident())) {
      router.push('/');
    }
  }, [user, loading, isResident, router]);

  useEffect(() => {
    if (user && isResident()) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      setRequestsLoading(true);
      const data = await apiService.getMaintenanceRequests();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData((prev) => ({ ...prev, photos: [...prev.photos, ...files] }));
    }
  };

  const handleRemovePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category || !formData.description || !formData.urgency_level) {
      return;
    }

    try {
      setSubmitting(true);
      const newRequest = await apiService.createMaintenanceRequest({
        category: formData.category,
        description: formData.description,
        preferred_entry_time: formData.preferred_entry_time || undefined,
        resident_must_be_home: formData.resident_must_be_home,
        urgency_level: formData.urgency_level,
        photos: formData.photos.length > 0 ? formData.photos : undefined,
      });
      
      setNewTicket(newRequest);
      setSubmitted(true);
      
      // Reset form
      setFormData({
        category: '',
        description: '',
        preferred_entry_time: '',
        resident_must_be_home: false,
        urgency_level: '',
        photos: [],
      });
      
      // Refresh requests list
      await fetchRequests();
    } catch (error) {
      console.error('Error submitting maintenance request:', error);
      alert('Failed to submit maintenance request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push('/live');
  };

  if (loading || requestsLoading) {
    return (
      <div
        className="min-h-screen relative flex items-center justify-center"
        style={{ backgroundColor: '#161748' }}
      >
        <CircularProgress sx={{ color: '#FFFFFF' }} />
      </div>
    );
  }

  if (!user || !isResident()) {
    return null;
  }

  return (
    <div
      className="min-h-screen relative"
      style={{ backgroundColor: '#161748' }}
    >
      <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
        <Button
          onClick={handleBack}
          sx={{
            color: '#D3D3D3',
            mb: 3,
            '&:hover': {
              color: '#FFFFFF',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          ← Back
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
          Submit Maintenance Request
        </Typography>

        {submitted && newTicket && (
          <Alert
            severity="success"
            sx={{
              backgroundColor: 'rgba(71, 133, 89, 0.2)',
              color: '#FFFFFF',
              border: '1px solid #478559',
              borderRadius: 2,
              mb: 4,
              '& .MuiAlert-icon': {
                color: '#478559',
              },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'var(--font-lora), serif',
                fontWeight: 'bold',
                mb: 1,
              }}
            >
              Request Submitted Successfully!
            </Typography>
            <Typography sx={{ fontFamily: 'var(--font-lora), serif' }}>
              Ticket Number: <strong>{newTicket.ticket_number}</strong>
            </Typography>
            <Typography sx={{ fontFamily: 'var(--font-lora), serif', mt: 1 }}>
              Status: <strong>{newTicket.status}</strong>
            </Typography>
          </Alert>
        )}

        <Card
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 3,
            mb: 4,
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <FormControl fullWidth required>
                  <InputLabel sx={{ color: '#FFFFFF' }}>Category</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    label="Category"
                    sx={{
                      color: '#FFFFFF',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                      '& .MuiSvgIcon-root': {
                        color: '#FFFFFF',
                      },
                    }}
                  >
                    {CATEGORIES.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Description"
                  multiline
                  rows={4}
                  required
                  fullWidth
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  sx={{
                    '& .MuiInputLabel-root': { color: '#FFFFFF' },
                    '& .MuiOutlinedInput-root': {
                      color: '#FFFFFF',
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                      '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                    },
                  }}
                />

                <TextField
                  label="Preferred Entry Time"
                  fullWidth
                  value={formData.preferred_entry_time}
                  onChange={(e) => handleInputChange('preferred_entry_time', e.target.value)}
                  placeholder="e.g., Morning 9AM-12PM"
                  sx={{
                    '& .MuiInputLabel-root': { color: '#FFFFFF' },
                    '& .MuiOutlinedInput-root': {
                      color: '#FFFFFF',
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                      '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                    },
                  }}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.resident_must_be_home}
                      onChange={(e) => handleInputChange('resident_must_be_home', e.target.checked)}
                      sx={{
                        color: '#FFFFFF',
                        '&.Mui-checked': {
                          color: '#f95d9b',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ color: '#FFFFFF', fontFamily: 'var(--font-lora), serif' }}>
                      Resident must be home
                    </Typography>
                  }
                />

                <FormControl fullWidth required>
                  <InputLabel sx={{ color: '#FFFFFF' }}>Urgency Level</InputLabel>
                  <Select
                    value={formData.urgency_level}
                    onChange={(e) => handleInputChange('urgency_level', e.target.value)}
                    label="Urgency Level"
                    sx={{
                      color: '#FFFFFF',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                      '& .MuiSvgIcon-root': {
                        color: '#FFFFFF',
                      },
                    }}
                  >
                    {URGENCY_LEVELS.map((level) => (
                      <MenuItem key={level} value={level}>
                        {level}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="photo-upload"
                    multiple
                    type="file"
                    onChange={handlePhotoChange}
                  />
                  <label htmlFor="photo-upload">
                    <Button
                      component="span"
                      variant="outlined"
                      startIcon={<PhotoCamera />}
                      sx={{
                        color: '#FFFFFF',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        '&:hover': {
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      Upload Photos
                    </Button>
                  </label>
                  {formData.photos.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      {formData.photos.map((photo, index) => (
                        <Chip
                          key={index}
                          label={photo.name}
                          onDelete={() => handleRemovePhoto(index)}
                          sx={{ mr: 1, mb: 1, color: '#FFFFFF' }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={submitting || !formData.category || !formData.description || !formData.urgency_level}
                  sx={{
                    backgroundColor: '#478559',
                    color: '#FFFFFF',
                    fontFamily: 'var(--font-lora), serif',
                    fontSize: '1.1rem',
                    py: 2,
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: '#3a6d47',
                    },
                    '&:disabled': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </Stack>
            </form>
          </CardContent>
        </Card>

        {requests.length > 0 && (
          <Box>
            <Typography
              variant="h3"
              component="h2"
              sx={{
                color: '#f95d9b',
                fontFamily: 'var(--font-lora), serif',
                fontWeight: 'bold',
                mb: 3,
              }}
            >
              Your Maintenance Requests
            </Typography>

            <Stack spacing={2}>
              {requests.map((request) => (
                <Card
                  key={request.id}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 3,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography
                          variant="h6"
                          sx={{
                            color: '#39a0ca',
                            fontFamily: 'var(--font-lora), serif',
                            fontWeight: 'bold',
                          }}
                        >
                          {request.ticket_number}
                        </Typography>
                        <Chip
                          label={request.status}
                          sx={{
                            backgroundColor: STATUS_COLORS[request.status] || '#D3D3D3',
                            color: '#FFFFFF',
                            fontWeight: 'bold',
                          }}
                        />
                      </Box>

                      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography sx={{ color: '#39a0ca', fontFamily: 'var(--font-lora), serif', fontWeight: 'bold' }}>
                            Category:
                          </Typography>
                          <Typography sx={{ color: '#FFFFFF', fontFamily: 'var(--font-lora), serif' }}>
                            {request.category}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography sx={{ color: '#39a0ca', fontFamily: 'var(--font-lora), serif', fontWeight: 'bold' }}>
                            Urgency:
                          </Typography>
                          <Typography sx={{ color: '#FFFFFF', fontFamily: 'var(--font-lora), serif' }}>
                            {request.urgency_level}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography sx={{ color: '#39a0ca', fontFamily: 'var(--font-lora), serif', fontWeight: 'bold' }}>
                            Description:
                          </Typography>
                          <Typography sx={{ color: '#FFFFFF', fontFamily: 'var(--font-lora), serif' }}>
                            {request.description}
                          </Typography>
                        </Grid>
                        {request.resident_visible_notes && (
                          <Grid item xs={12}>
                            <Typography sx={{ color: '#39a0ca', fontFamily: 'var(--font-lora), serif', fontWeight: 'bold' }}>
                              Notes:
                            </Typography>
                            <Typography sx={{ color: '#FFFFFF', fontFamily: 'var(--font-lora), serif' }}>
                              {request.resident_visible_notes}
                            </Typography>
                          </Grid>
                        )}
                        <Grid item xs={12}>
                          <Typography sx={{ color: '#D3D3D3', fontFamily: 'var(--font-lora), serif', fontSize: '0.9rem' }}>
                            Submitted: {new Date(request.created_at).toLocaleDateString()}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        )}
      </Box>
    </div>
  );
}

