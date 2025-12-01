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
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from '@mui/material';

const URGENCY_LEVELS = ['Emergency', 'Urgent', 'Routine'];
const STATUSES = ['Submitted', 'Scheduled', 'In Progress', 'Completed'];
const STATUS_COLORS: Record<string, string> = {
  Submitted: '#39a0ca',
  Scheduled: '#478559',
  'In Progress': '#f95d9b',
  Completed: '#D3D3D3',
};

interface MaintenanceUser {
  id: number;
  email: string;
}

export default function PropertyAdminDashboard() {
  const { user, loading, isPropertyAdmin, isSuperAdmin } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
  const [properties, setProperties] = useState<{ id: number; name: string }[]>([]);
  const [editingRequest, setEditingRequest] = useState<MaintenanceRequest | null>(null);
  const [editData, setEditData] = useState({
    urgency_level: '',
    status: '',
    assigned_maintenance_user_id: null as number | null,
    admin_notes: '',
    resident_visible_notes: '',
  });
  const [maintenanceUsers, setMaintenanceUsers] = useState<MaintenanceUser[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && (!user || (!isPropertyAdmin() && !isSuperAdmin()))) {
      router.push('/');
    }
  }, [user, loading, isPropertyAdmin, isSuperAdmin, router]);

  useEffect(() => {
    if (user && (isPropertyAdmin() || isSuperAdmin())) {
      fetchRequests();
    }
  }, [user]);

  useEffect(() => {
    if (editingRequest && editingRequest.property) {
      fetchMaintenanceUsers(editingRequest.property.id);
    }
  }, [editingRequest]);

  const fetchRequests = async () => {
    try {
      setRequestsLoading(true);
      const data = await apiService.getMaintenanceRequests();
      setRequests(data);
      
      // Extract unique properties
      const uniqueProperties = Array.from(
        new Map(data.map((r) => [r.property.id, { id: r.property.id, name: r.property.name }])).values()
      );
      setProperties(uniqueProperties);
      
      if (uniqueProperties.length > 0 && !selectedProperty) {
        setSelectedProperty(uniqueProperties[0].id);
      }
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
    } finally {
      setRequestsLoading(false);
    }
  };

  const fetchMaintenanceUsers = async (propertyId: number) => {
    try {
      const users = await apiService.getMaintenanceUsers(propertyId);
      setMaintenanceUsers(users);
    } catch (error) {
      console.error('Error fetching maintenance users:', error);
    }
  };

  const filteredRequests = selectedProperty
    ? requests.filter((r) => r.property.id === selectedProperty)
    : requests;

  // Sort: new requests first (by created_at desc), then by urgency
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    // First by status (Submitted first)
    if (a.status === 'Submitted' && b.status !== 'Submitted') return -1;
    if (a.status !== 'Submitted' && b.status === 'Submitted') return 1;
    
    // Then by urgency
    const urgencyOrder = { Emergency: 0, Urgent: 1, Routine: 2 };
    const urgencyDiff = urgencyOrder[a.urgency_level as keyof typeof urgencyOrder] - urgencyOrder[b.urgency_level as keyof typeof urgencyOrder];
    if (urgencyDiff !== 0) return urgencyDiff;
    
    // Then by created date (newest first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const handleEdit = (request: MaintenanceRequest) => {
    setEditingRequest(request);
    setEditData({
      urgency_level: request.urgency_level,
      status: request.status,
      assigned_maintenance_user_id: request.assigned_maintenance_user?.id || null,
      admin_notes: request.admin_notes || '',
      resident_visible_notes: request.resident_visible_notes || '',
    });
  };

  const handleSave = async () => {
    if (!editingRequest) return;

    try {
      setSaving(true);
      // Convert null to undefined for API compatibility
      const apiData = {
        ...editData,
        assigned_maintenance_user_id: editData.assigned_maintenance_user_id ?? undefined,
      };
      await apiService.updateMaintenanceRequest(editingRequest.id, apiData);
      await fetchRequests();
      setEditingRequest(null);
    } catch (error) {
      console.error('Error updating maintenance request:', error);
      alert('Failed to update maintenance request. Please try again.');
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

  if (!user || (!isPropertyAdmin() && !isSuperAdmin())) {
    return null;
  }

  return (
    <div
      className="min-h-screen relative"
      style={{ backgroundColor: '#161748' }}
    >
      <Box sx={{ p: 4, maxWidth: 1400, mx: 'auto' }}>
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
          Property Admin Dashboard
        </Typography>

        {properties.length > 1 && (
          <FormControl sx={{ mb: 4, minWidth: 200 }}>
            <InputLabel sx={{ color: '#FFFFFF' }}>Filter by Property</InputLabel>
            <Select
              value={selectedProperty || ''}
              onChange={(e) => setSelectedProperty(e.target.value as number)}
              label="Filter by Property"
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
              <MenuItem value="">All Properties</MenuItem>
              {properties.map((prop) => (
                <MenuItem key={prop.id} value={prop.id}>
                  {prop.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <Typography
          variant="h4"
          sx={{
            color: '#39a0ca',
            fontFamily: 'var(--font-lora), serif',
            fontWeight: 'bold',
            mb: 3,
          }}
        >
          Inbox ({sortedRequests.filter((r) => r.status === 'Submitted').length} new)
        </Typography>

        <Stack spacing={3}>
          {sortedRequests.map((request) => (
            <Card
              key={request.id}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 3,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderLeft: request.status === 'Submitted' ? '4px solid #f95d9b' : 'none',
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
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Chip
                        label={request.urgency_level}
                        size="small"
                        sx={{
                          backgroundColor: request.urgency_level === 'Emergency' ? '#f95d9b' : '#39a0ca',
                          color: '#FFFFFF',
                        }}
                      />
                      <Chip
                        label={request.status}
                        sx={{
                          backgroundColor: STATUS_COLORS[request.status] || '#D3D3D3',
                          color: '#FFFFFF',
                          fontWeight: 'bold',
                        }}
                      />
                    </Box>
                  </Box>

                  <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />

                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ color: '#39a0ca', fontFamily: 'var(--font-lora), serif', fontWeight: 'bold' }}>
                          Property:
                        </Typography>
                        <Typography sx={{ color: '#FFFFFF', fontFamily: 'var(--font-lora), serif' }}>
                          {request.property.name}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ color: '#39a0ca', fontFamily: 'var(--font-lora), serif', fontWeight: 'bold' }}>
                          Category:
                        </Typography>
                        <Typography sx={{ color: '#FFFFFF', fontFamily: 'var(--font-lora), serif' }}>
                          {request.category}
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Typography sx={{ color: '#39a0ca', fontFamily: 'var(--font-lora), serif', fontWeight: 'bold' }}>
                        Description:
                      </Typography>
                      <Typography sx={{ color: '#FFFFFF', fontFamily: 'var(--font-lora), serif' }}>
                        {request.description}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ color: '#39a0ca', fontFamily: 'var(--font-lora), serif', fontWeight: 'bold' }}>
                          Resident:
                        </Typography>
                        <Typography sx={{ color: '#FFFFFF', fontFamily: 'var(--font-lora), serif' }}>
                          {request.user.email}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ color: '#39a0ca', fontFamily: 'var(--font-lora), serif', fontWeight: 'bold' }}>
                          Assigned Maintenance User:
                        </Typography>
                        <Typography sx={{ color: '#FFFFFF', fontFamily: 'var(--font-lora), serif' }}>
                          {request.assigned_maintenance_user?.email || 'Not assigned'}
                        </Typography>
                      </Box>
                    </Box>
                    {request.admin_notes && (
                      <Box>
                        <Typography sx={{ color: '#39a0ca', fontFamily: 'var(--font-lora), serif', fontWeight: 'bold' }}>
                          Admin Notes:
                        </Typography>
                        <Typography sx={{ color: '#FFFFFF', fontFamily: 'var(--font-lora), serif' }}>
                          {request.admin_notes}
                        </Typography>
                      </Box>
                    )}
                  </Stack>

                  <Button
                    variant="contained"
                    onClick={() => handleEdit(request)}
                    sx={{
                      backgroundColor: '#39a0ca',
                      color: '#FFFFFF',
                      '&:hover': {
                        backgroundColor: '#2d7fa0',
                      },
                    }}
                  >
                    Edit
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
            No maintenance requests found.
          </Alert>
        )}
      </Box>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingRequest}
        onClose={() => setEditingRequest(null)}
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
          Edit Maintenance Request: {editingRequest?.ticket_number}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#FFFFFF' }}>Urgency Level</InputLabel>
              <Select
                value={editData.urgency_level}
                onChange={(e) => setEditData({ ...editData, urgency_level: e.target.value })}
                label="Urgency Level"
                sx={{
                  color: '#FFFFFF',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
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

            <FormControl fullWidth>
              <InputLabel sx={{ color: '#FFFFFF' }}>Status</InputLabel>
              <Select
                value={editData.status}
                onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                label="Status"
                sx={{
                  color: '#FFFFFF',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '& .MuiSvgIcon-root': {
                    color: '#FFFFFF',
                  },
                }}
              >
                {STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {maintenanceUsers.length > 0 && (
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#FFFFFF' }}>Assigned Maintenance User</InputLabel>
                <Select
                  value={editData.assigned_maintenance_user_id || ''}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      assigned_maintenance_user_id: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  label="Assigned Maintenance User"
                  sx={{
                    color: '#FFFFFF',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '& .MuiSvgIcon-root': {
                      color: '#FFFFFF',
                    },
                  }}
                >
                  <MenuItem value="">None</MenuItem>
                  {maintenanceUsers.map((mu) => (
                    <MenuItem key={mu.id} value={mu.id}>
                      {mu.email}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <TextField
              label="Admin Notes (for maintenance user)"
              multiline
              rows={4}
              fullWidth
              value={editData.admin_notes}
              onChange={(e) => setEditData({ ...editData, admin_notes: e.target.value })}
              sx={{
                '& .MuiInputLabel-root': { color: '#FFFFFF' },
                '& .MuiOutlinedInput-root': {
                  color: '#FFFFFF',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                },
              }}
            />

            <TextField
              label="Resident Visible Notes"
              multiline
              rows={4}
              fullWidth
              value={editData.resident_visible_notes}
              onChange={(e) => setEditData({ ...editData, resident_visible_notes: e.target.value })}
              sx={{
                '& .MuiInputLabel-root': { color: '#FFFFFF' },
                '& .MuiOutlinedInput-root': {
                  color: '#FFFFFF',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                },
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setEditingRequest(null)}
            sx={{ color: '#D3D3D3' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
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

