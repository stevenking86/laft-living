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
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';

const STATUSES = ['Submitted', 'Scheduled', 'In Progress', 'Completed'];
const STATUS_COLORS: Record<string, string> = {
  Submitted: '#39a0ca',
  Scheduled: '#478559',
  'In Progress': '#f95d9b',
  Completed: '#D3D3D3',
};

export default function MaintenanceDashboard() {
  const { user, loading, isMaintenance, isSuperAdmin } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [resolutionData, setResolutionData] = useState({
    resolution_notes: '',
    status: '',
    photos: [] as File[],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && (!user || (!isMaintenance() && !isSuperAdmin()))) {
      router.push('/');
    }
  }, [user, loading, isMaintenance, isSuperAdmin, router]);

  useEffect(() => {
    if (user && (isMaintenance() || isSuperAdmin())) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      setRequestsLoading(true);
      const data = await apiService.getMaintenanceRequests();
      // Filter to only assigned requests for maintenance users (super admins see all)
      const filtered = isSuperAdmin()
        ? data
        : data.filter((r) => r.assigned_maintenance_user?.id === user?.id);
      setRequests(filtered);
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
    } finally {
      setRequestsLoading(false);
    }
  };

  // Sort by priority: Emergency > Urgent > Routine, then by status
  const sortedRequests = [...requests].sort((a, b) => {
    const urgencyOrder = { Emergency: 0, Urgent: 1, Routine: 2 };
    const urgencyDiff =
      urgencyOrder[a.urgency_level as keyof typeof urgencyOrder] -
      urgencyOrder[b.urgency_level as keyof typeof urgencyOrder];
    if (urgencyDiff !== 0) return urgencyDiff;

    const statusOrder = { Submitted: 0, Scheduled: 1, 'In Progress': 2, Completed: 3 };
    const statusDiff =
      statusOrder[a.status as keyof typeof statusOrder] -
      statusOrder[b.status as keyof typeof statusOrder];
    return statusDiff;
  });

  const handleOpenResolution = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    setResolutionData({
      resolution_notes: request.resolution_notes || '',
      status: request.status,
      photos: [],
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setResolutionData((prev) => ({ ...prev, photos: [...prev.photos, ...files] }));
    }
  };

  const handleSaveResolution = async () => {
    if (!selectedRequest) return;

    try {
      setSaving(true);
      await apiService.updateMaintenanceRequestResolution(selectedRequest.id, {
        resolution_notes: resolutionData.resolution_notes,
        status: resolutionData.status,
        photos: resolutionData.photos.length > 0 ? resolutionData.photos : undefined,
      });
      await fetchRequests();
      setSelectedRequest(null);
      setResolutionData({ resolution_notes: '', status: '', photos: [] });
    } catch (error) {
      console.error('Error updating resolution:', error);
      alert('Failed to update resolution. Please try again.');
    } finally {
      setSaving(false);
    }
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

  if (!user || (!isMaintenance() && !isSuperAdmin())) {
    return null;
  }

  return (
    <div
      className="min-h-screen relative"
      style={{ backgroundColor: '#161748' }}
    >
      <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 1200, mx: 'auto' }}>
        <Typography
          variant="h2"
          component="h1"
          sx={{
            color: '#f95d9b',
            fontFamily: 'var(--font-lora), serif',
            fontWeight: 'bold',
            mb: 4,
            fontSize: { xs: '1.75rem', sm: '2.5rem' },
          }}
        >
          Maintenance Dashboard
        </Typography>

        <Stack spacing={2}>
          {sortedRequests.map((request) => (
            <Card
              key={request.id}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 3,
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        color: '#39a0ca',
                        fontFamily: 'var(--font-lora), serif',
                        fontWeight: 'bold',
                        fontSize: { xs: '1rem', sm: '1.25rem' },
                      }}
                    >
                      {request.ticket_number}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={request.urgency_level}
                        size="small"
                        sx={{
                          backgroundColor:
                            request.urgency_level === 'Emergency' ? '#f95d9b' : '#39a0ca',
                          color: '#FFFFFF',
                          fontSize: { xs: '0.7rem', sm: '0.875rem' },
                        }}
                      />
                      <Chip
                        label={request.status}
                        size="small"
                        sx={{
                          backgroundColor: STATUS_COLORS[request.status] || '#D3D3D3',
                          color: '#FFFFFF',
                          fontWeight: 'bold',
                          fontSize: { xs: '0.7rem', sm: '0.875rem' },
                        }}
                      />
                    </Box>
                  </Box>

                  <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />

                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          sx={{
                            color: '#39a0ca',
                            fontFamily: 'var(--font-lora), serif',
                            fontWeight: 'bold',
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                          }}
                        >
                          Property:
                        </Typography>
                        <Typography
                          sx={{
                            color: '#FFFFFF',
                            fontFamily: 'var(--font-lora), serif',
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                          }}
                        >
                          {request.property.name}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          sx={{
                            color: '#39a0ca',
                            fontFamily: 'var(--font-lora), serif',
                            fontWeight: 'bold',
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                          }}
                        >
                          Category:
                        </Typography>
                        <Typography
                          sx={{
                            color: '#FFFFFF',
                            fontFamily: 'var(--font-lora), serif',
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                          }}
                        >
                          {request.category}
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Typography
                        sx={{
                          color: '#39a0ca',
                          fontFamily: 'var(--font-lora), serif',
                          fontWeight: 'bold',
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                        }}
                      >
                        Description:
                      </Typography>
                      <Typography
                        sx={{
                          color: '#FFFFFF',
                          fontFamily: 'var(--font-lora), serif',
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                        }}
                      >
                        {request.description}
                      </Typography>
                    </Box>
                    {request.admin_notes && (
                      <Box>
                        <Typography
                          sx={{
                            color: '#39a0ca',
                            fontFamily: 'var(--font-lora), serif',
                            fontWeight: 'bold',
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                          }}
                        >
                          Admin Notes:
                        </Typography>
                        <Typography
                          sx={{
                            color: '#FFFFFF',
                            fontFamily: 'var(--font-lora), serif',
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                          }}
                        >
                          {request.admin_notes}
                        </Typography>
                      </Box>
                    )}
                    {request.photos && request.photos.length > 0 && (
                      <Box>
                        <Typography
                          sx={{
                            color: '#39a0ca',
                            fontFamily: 'var(--font-lora), serif',
                            fontWeight: 'bold',
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                          }}
                        >
                          Photos:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                          {request.photos.map((photo, index) => (
                            <Box
                              key={index}
                              component="img"
                              src={photo}
                              alt={`Photo ${index + 1}`}
                              sx={{
                                maxWidth: { xs: '100px', sm: '150px' },
                                maxHeight: { xs: '100px', sm: '150px' },
                                borderRadius: 1,
                                objectFit: 'cover',
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Stack>

                  <Button
                    variant="contained"
                    onClick={() => handleOpenResolution(request)}
                    fullWidth
                    sx={{
                      backgroundColor: '#478559',
                      color: '#FFFFFF',
                      fontFamily: 'var(--font-lora), serif',
                      '&:hover': {
                        backgroundColor: '#3a6d47',
                      },
                    }}
                  >
                    {request.status === 'Completed' ? 'View/Update Resolution' : 'Add Resolution'}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>

        {sortedRequests.length === 0 && (
          <Alert
            severity="info"
            sx={{
              backgroundColor: 'rgba(57, 160, 202, 0.2)',
              color: '#FFFFFF',
              border: '1px solid #39a0ca',
            }}
          >
            No assigned maintenance requests.
          </Alert>
        )}
      </Box>

      {/* Resolution Dialog */}
      <Dialog
        open={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#161748',
            color: '#FFFFFF',
          },
        }}
      >
        <DialogTitle sx={{ fontFamily: 'var(--font-lora), serif', color: '#f95d9b' }}>
          Resolution: {selectedRequest?.ticket_number}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Status"
              select
              fullWidth
              value={resolutionData.status}
              onChange={(e) => setResolutionData({ ...resolutionData, status: e.target.value })}
              SelectProps={{
                native: true,
              }}
              sx={{
                '& .MuiInputLabel-root': { color: '#FFFFFF' },
                '& .MuiOutlinedInput-root': {
                  color: '#FFFFFF',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                },
              }}
            >
              {STATUSES.map((status) => (
                <option key={status} value={status} style={{ backgroundColor: '#161748', color: '#FFFFFF' }}>
                  {status}
                </option>
              ))}
            </TextField>

            <TextField
              label="Resolution Notes"
              multiline
              rows={6}
              fullWidth
              value={resolutionData.resolution_notes}
              onChange={(e) =>
                setResolutionData({ ...resolutionData, resolution_notes: e.target.value })
              }
              sx={{
                '& .MuiInputLabel-root': { color: '#FFFFFF' },
                '& .MuiOutlinedInput-root': {
                  color: '#FFFFFF',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                },
              }}
            />

            <Box>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="resolution-photo-upload"
                multiple
                type="file"
                onChange={handlePhotoChange}
              />
              <label htmlFor="resolution-photo-upload">
                <Button
                  component="span"
                  variant="outlined"
                  startIcon={<PhotoCamera />}
                  fullWidth
                  sx={{
                    color: '#FFFFFF',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  Add Photos
                </Button>
              </label>
              {resolutionData.photos.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography sx={{ color: '#FFFFFF', mb: 1, fontFamily: 'var(--font-lora), serif' }}>
                    {resolutionData.photos.length} photo(s) selected
                  </Typography>
                </Box>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedRequest(null)} sx={{ color: '#D3D3D3' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveResolution}
            disabled={saving}
            variant="contained"
            sx={{
              backgroundColor: '#478559',
              color: '#FFFFFF',
              '&:hover': {
                backgroundColor: '#3a6d47',
              },
            }}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

