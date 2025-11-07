// src/common/components/CredentialModal/CredentialFormModal.tsx

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { FaTimes, FaSave, FaEye, FaEyeSlash } from 'react-icons/fa';
import { ServiceAutocomplete } from './ServiceAutocomplete';
import { SubInstanceAutocomplete } from './SubInstanceAutocomplete';
import { ConfirmCreateDialog } from './ConfirmCreateDialog';
import { instanceApi } from '../../api/instanceApi';
import { toast } from '../../utils/toast';
import GlobalLoader from '../GlobalLoader';

interface FormData {
  serviceId: string | null;
  serviceName: string;
  subInstanceId: string | null;
  subInstanceName: string;
  username: string;
  password: string;
  url: string;
  notes: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  mode: 'create' | 'edit';
  initialData?: any;
  decryptFn?: (id: string) => Promise<any>;
}

export const CredentialFormModal: React.FC<Props> = ({
  open,
  onClose,
  onSubmit,
  mode,
  initialData,
  decryptFn,
}) => {
  const isEditMode = mode === 'edit';

  // Form data
  const [formData, setFormData] = useState<FormData>({
    serviceId: null,
    serviceName: '',
    subInstanceId: null,
    subInstanceName: '',
    username: '',
    password: '',
    url: '',
    notes: '',
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Autocomplete data
  const [rootInstances, setRootInstances] = useState<any[]>([]);
  const [subInstances, setSubInstances] = useState<any[]>([]);
  const [loadingSubInstances, setLoadingSubInstances] = useState(false);

  // Confirm dialogs
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'service' | 'subinstance';
    name: string;
  }>({
    open: false,
    type: 'service',
    name: '',
  });

  // Load root instances on mount
  useEffect(() => {
    if (open) {
      fetchRootInstances();
    }
  }, [open]);

  // Load sub-instances when service selected
  useEffect(() => {
    if (formData.serviceId) {
      fetchSubInstances(formData.serviceId);
    } else {
      setSubInstances([]);
    }
  }, [formData.serviceId]);

  // Populate form in edit mode - fetch decrypted data
  useEffect(() => {
    const fetchDecryptedData = async () => {
      if (isEditMode && initialData && open) {
        setLoading(true);
        try {
          // Use provided decrypt function or fallback to admin API
          const response = decryptFn 
            ? await decryptFn(initialData._id)
            : await (await import('../../../features/admin/api/credentialApi')).decryptCredential(initialData._id);
          const decryptedCred = response.data.credential || (response.data as any).displaycred;
          
          if (!decryptedCred) {
            throw new Error('No credential data received from server');
          }
          
          // Handle both direct fields and nested credentialData
          const credData = decryptedCred.credentialData || decryptedCred;
          
          setFormData({
            serviceId: initialData.rootInstance?._id || initialData.rootInstance?.rootInstanceId || null,
            serviceName: initialData.rootInstance?.serviceName || '',
            subInstanceId: initialData.subInstance?._id || initialData.subInstance?.subInstanceId || null,
            subInstanceName: initialData.subInstance?.name || '',
            username: credData.username || '',
            password: credData.password||'', 
            url: credData.url || '',
            notes: credData.notes || '',
          });
        } catch (err: any) {
          console.error('Failed to decrypt credential:', err);
          toast.error('Failed to load credential data');
          onClose();
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchDecryptedData();
  }, [isEditMode, initialData, open, onClose]);

  const fetchRootInstances = async () => {
    try {
      const response = await instanceApi.listRootInstances();
      setRootInstances(response.data || []);
    } catch (err) {
      console.error('Error fetching root instances:', err);
    }
  };

  const fetchSubInstances = async (instanceId: string) => {
    setLoadingSubInstances(true);
    try {
      const response = await instanceApi.listSubInstances(instanceId);
      setSubInstances(response.data || []);
    } catch (err) {
      console.error('Error fetching sub-instances:', err);
    } finally {
      setLoadingSubInstances(false);
    }
  };

  const handleServiceChange = (value: any) => {
  
    setErrors((prev) => ({ ...prev, service: '' }));
    
    if (value) {
      // Handle multiple possible ID field names from API
      const serviceId = value.rootInstanceId || value.id || value._id;
      setFormData((prev) => ({
        ...prev,
        serviceId: serviceId,
        serviceName: value.serviceName,
        subInstanceId: null, // Reset sub-instance
        subInstanceName: '',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        serviceId: null,
        serviceName: '',
        subInstanceId: null,
        subInstanceName: '',
      }));
    }
  };

  const handleSubInstanceChange = (value: any) => {
    // Clear sub-instance error when user selects/changes
    setErrors((prev) => ({ ...prev, subInstance: '' }));
    
    if (value) {
      // Handle multiple possible ID field names from API
      const subId = value.subInstanceId || value.id || value._id;
      setFormData((prev) => ({
        ...prev,
        subInstanceId: subId,
        subInstanceName: value.name,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        subInstanceId: null,
        subInstanceName: '',
      }));
    }
  };

  const handleRequestCreateService = (serviceName: string) => {
    // Check if exists
    const exists = rootInstances.some(
      (s) =>
        s.serviceName.toLowerCase() === serviceName.toLowerCase()
    );

    if (exists) {
      setErrors((prev) => ({ ...prev, service: 'Service already exists. Please select from the list.' }));
      return;
    }

    // Clear any previous errors
    setErrors((prev) => ({ ...prev, service: '' }));

    // Show confirm dialog
    setConfirmDialog({
      open: true,
      type: 'service',
      name: serviceName,
    });
  };

  const handleRequestCreateSubInstance = (name: string) => {
    // Check if sub-instance name matches service name
    if (formData.serviceName && name.toLowerCase() === formData.serviceName.toLowerCase()) {
      setErrors((prev) => ({ ...prev, subInstance: 'Sub-instance name cannot be the same as service name.' }));
      return;
    }

    // Check if exists
    const exists = subInstances.some(
      (s) => s.name.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
      setErrors((prev) => ({ ...prev, subInstance: 'Sub-instance already exists. Please select from the list.' }));
      return;
    }

    // Clear any previous errors
    setErrors((prev) => ({ ...prev, subInstance: '' }));

    // Show confirm dialog
    setConfirmDialog({
      open: true,
      type: 'subinstance',
      name,
    });
  };

  const handleConfirmCreate = async () => {
    try {
      if (confirmDialog.type === 'service') {
        const response = await instanceApi.createRootInstance({
          serviceName: confirmDialog.name,
        });

        const newService = response.data;
        setRootInstances((prev) => [...prev, newService]);

        setFormData((prev) => ({
          ...prev,
          serviceId: newService.id,
          serviceName: newService.serviceName,
        }));

        toast.success(
          response.data.isNew
            ? 'Service created successfully'
            : 'Using existing service'
        );
      } else {
        // Create sub-instance
        const response = await instanceApi.createSubInstance(formData.serviceId!, {
          name: confirmDialog.name,
        });

        const newSubInstance = response.data;
        setSubInstances((prev) => [...prev, newSubInstance]);

        setFormData((prev) => ({
          ...prev,
          subInstanceId: newSubInstance.id,
          subInstanceName: newSubInstance.name,
        }));

        toast.success(
          response.data.isNew
            ? 'Sub-instance created successfully'
            : 'Using existing sub-instance'
        );
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || 'Failed to create'
      );
    } finally {
      setConfirmDialog({ open: false, type: 'service', name: '' });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.serviceId) newErrors.service = 'Service is required';
    if (!formData.subInstanceId) newErrors.subInstance = 'Sub-instance is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!isEditMode && !formData.password.trim())
      newErrors.password = 'Password is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      // Different payload for create vs edit
      const payload = isEditMode 
        ? {
            // Edit mode: only send credential fields (no rootId/subId)
            username: formData.username,
            password: formData.password,
            url: formData.url,
            notes: formData.notes,
          }
        : {
            // Create mode: send everything including rootId/subId
            rootId: formData.serviceId,
            subId: formData.subInstanceId,
            username: formData.username,
            password: formData.password,
            url: formData.url,
            notes: formData.notes,
          };

      await onSubmit(payload);
      handleClose();
    } catch (err: any) {
      // Handle API validation errors
      if (err.response?.data?.message) {
        const errorMessage = err.response.data.message;
        
        // Map backend errors to form fields
        if (errorMessage.toLowerCase().includes('username')) {
          setErrors((prev) => ({ ...prev, username: errorMessage }));
        } else if (errorMessage.toLowerCase().includes('password')) {
          setErrors((prev) => ({ ...prev, password: errorMessage }));
        } else if (errorMessage.toLowerCase().includes('root instance') || errorMessage.toLowerCase().includes('service')) {
          setErrors((prev) => ({ ...prev, service: errorMessage }));
        } else if (errorMessage.toLowerCase().includes('sub-instance') || errorMessage.toLowerCase().includes('folder')) {
          setErrors((prev) => ({ ...prev, subInstance: errorMessage }));
        } else {
          // Generic error - show as toast
          toast.error(errorMessage);
        }
      } else if (err.response?.data?.errors) {
        // Handle validation errors array
        const errors = err.response.data.errors;
        errors.forEach((error: string) => {
          toast.error(error);
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      serviceId: null,
      serviceName: '',
      subInstanceId: null,
      subInstanceName: '',
      username: '',
      password: '',
      url: '',
      notes: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        fullScreen={false}
        sx={{
          '& .MuiDialog-paper': {
            margin: { xs: '16px', sm: '32px' },
            maxHeight: { xs: 'calc(100% - 32px)', sm: 'calc(100% - 64px)' },
            width: { xs: 'calc(100% - 32px)', sm: '100%' }
          }
        }}
      >
        <DialogTitle className="flex items-center justify-between border-b px-4 py-3 sm:px-6 sm:py-4">
          <span className="text-base sm:text-xl font-semibold">
            {isEditMode ? 'Edit Credential' : 'Create New Credential'}
          </span>
          <IconButton onClick={handleClose} size="small">
            <FaTimes />
          </IconButton>
        </DialogTitle>

        <DialogContent className="p-4 sm:p-6">
          {loading && isEditMode ? (
            <div className="flex items-center justify-center py-8">
                       <GlobalLoader/>
            </div>
          ) : (
          <div className="space-y-4">
            {/* Service Name */}
            <ServiceAutocomplete
              value={
                formData.serviceId
                  ? {
                      serviceName: formData.serviceName,
                      id: formData.serviceId,
                    }
                  : null
              }
              onChange={handleServiceChange}
              onRequestCreate={handleRequestCreateService}
              disabled={isEditMode}
              error={!!errors.service}
              helperText={errors.service}
              existingServices={rootInstances.map((r) => ({
                serviceName: r.serviceName,
                id: r.rootInstanceId || r._id || r.id,
              }))}
            />

            {/* Sub-Instance Name */}
            <SubInstanceAutocomplete
              value={
                formData.subInstanceId
                  ? {
                      name: formData.subInstanceName,
                      id: formData.subInstanceId,
                    }
                  : null
              }
              onChange={handleSubInstanceChange}
              onRequestCreate={handleRequestCreateSubInstance}
              serviceId={formData.serviceId}
              disabled={isEditMode}
              error={!!errors.subInstance}
              helperText={errors.subInstance}
              existingSubInstances={subInstances.map((s) => ({
                name: s.name,
                id: s.subInstanceId || s._id || s.id,
              }))}
              loading={loadingSubInstances}
            />

            {/* Username */}
            <TextField
              fullWidth
              label="Username"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              error={!!errors.username}
              helperText={errors.username}
              size="small"
            />

            {/* Password */}
            <TextField
              fullWidth
              label={isEditMode ? 'New Password (leave same to keep current)' : 'Password'}
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              error={!!errors.password}
              helperText={errors.password}
              size="small"
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </IconButton>
                ),
              }}
            />

            {/* URL */}
            <TextField
              fullWidth
              label="URL (Optional)"
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
              placeholder="https://example.com"
              size="small"
            />

            {/* Notes */}
            <TextField
              fullWidth
              label="Notes (Optional)"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              multiline
              rows={3}
              placeholder="Additional notes..."
              size="small"
            />
          </div>
          )}
        </DialogContent>

        <DialogActions className="p-3 sm:p-4 border-t gap-2 flex-col sm:flex-row">
          <Button 
            onClick={handleClose} 
            variant="outlined" 
            color="inherit"
            fullWidth
            sx={{ order: { xs: 2, sm: 1 } }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={16} /> : <FaSave />}
            disabled={loading}
            fullWidth
            sx={{ order: { xs: 1, sm: 2 } }}
          >
            {isEditMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Create Dialog */}
      <ConfirmCreateDialog
        open={confirmDialog.open}
        onClose={() =>
          setConfirmDialog({ open: false, type: 'service', name: '' })
        }
        onConfirm={handleConfirmCreate}
        title={
          confirmDialog.type === 'service'
            ? 'Create New Service?'
            : 'Create New Sub-Instance?'
        }
        message={
          confirmDialog.type === 'service'
            ? 'This service does not exist. Would you like to create it?'
            : 'This sub-instance does not exist. Would you like to create it?'
        }
        itemName={confirmDialog.name}
        type={confirmDialog.type}
      />
    </>
  );
};
