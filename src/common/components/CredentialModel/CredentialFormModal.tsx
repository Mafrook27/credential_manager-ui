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

interface CredentialField {
  id: string;
  key: string;
  value: string;
  showValue?: boolean;
}

interface FormData {
  serviceId: string | null;
  serviceName: string;
  subInstanceId: string | null;
  subInstanceName: string;
  fields: CredentialField[];
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
    fields: [{ id: Date.now().toString(), key: '', value: '', showValue: false }],
    notes: '',
  });

  // UI state
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
          
          // Convert backend fields array to form fields with UI state
          const fieldsArray: CredentialField[] = decryptedCred.fields?.map((field: any, index: number) => ({
            id: `field-${index}`,
            key: field.key,
            value: field.value,
            showValue: false
          })) || [];
          
          // If no fields, add empty one
          if (fieldsArray.length === 0) {
            fieldsArray.push({ id: Date.now().toString(), key: '', value: '', showValue: false });
          }
          
          setFormData({
            serviceId: initialData.rootInstance?._id || initialData.rootInstance?.rootInstanceId || null,
            serviceName: initialData.rootInstance?.serviceName || '',
            subInstanceId: initialData.subInstance?._id || initialData.subInstance?.subInstanceId || null,
            subInstanceName: initialData.subInstance?.name || '',
            fields: fieldsArray,
            notes: decryptedCred.notes || '',
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
    
    // Validate fields
    const hasEmptyFields = formData.fields.some(field => !field.key.trim() || !field.value.trim());
    if (formData.fields.length === 0 || hasEmptyFields) {
      newErrors.fields = 'All credential fields must have both key and value';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      // Convert fields array to backend format (array of {key, value})
      const fieldsArray = formData.fields
        .filter(field => field.key.trim() && field.value.trim())
        .map(field => ({
          key: field.key.trim(),
          value: field.value
        }));
      
      // Different payload for create vs edit
      const payload = isEditMode 
        ? {
            // Edit mode: only send credential fields (no rootId/subId)
            fields: fieldsArray,
            notes: formData.notes,
          }
        : {
            // Create mode: send everything including rootId/subId
            rootId: formData.serviceId,
            subId: formData.subInstanceId,
            fields: fieldsArray,
            notes: formData.notes,
          };

      await onSubmit(payload);
      handleClose();
    } catch (err: any) {
      // Handle API validation errors
      if (err.response?.data?.message) {
        const errorMessage = err.response.data.message;
        
        // Map backend errors to form fields
        if (errorMessage.toLowerCase().includes('field')) {
          setErrors((prev) => ({ ...prev, fields: errorMessage }));
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
      fields: [{ id: Date.now().toString(), key: '', value: '', showValue: false }],
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

        <DialogContent 
          className="p-4 sm:p-6"
          sx={{
            '&::-webkit-scrollbar': {
              display: 'none'
            },
            '-ms-overflow-style': 'none',
            'scrollbarWidth': 'none'
          }}
        >
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

            {/* Dynamic Credential Fields */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Credential Fields</label>
                <Button
                  size="small"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      fields: [...prev.fields, { id: Date.now().toString(), key: '', value: '', showValue: false }]
                    }));
                  }}
                  variant="outlined"
                  sx={{ textTransform: 'none' }}
                >
                  + Add Field
                </Button>
              </div>
              
              {formData.fields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-start">
                  <TextField
                    label="Key"
                    value={field.key}
                    onChange={(e) => {
                      const newFields = [...formData.fields];
                      newFields[index].key = e.target.value;
                      setFormData({ ...formData, fields: newFields });
                    }}
                    size="small"
                    sx={{ flex: 1 }}
                    placeholder="e.g., username, api_key"
                  />
                  <TextField
                    label="Value"
                    type={field.showValue ? 'text' : 'password'}
                    value={field.value}
                    onChange={(e) => {
                      const newFields = [...formData.fields];
                      newFields[index].value = e.target.value;
                      setFormData({ ...formData, fields: newFields });
                    }}
                    size="small"
                    sx={{ flex: 1 }}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          onClick={() => {
                            const newFields = [...formData.fields];
                            newFields[index].showValue = !newFields[index].showValue;
                            setFormData({ ...formData, fields: newFields });
                          }}
                          edge="end"
                          size="small"
                        >
                          {field.showValue ? <FaEyeSlash /> : <FaEye />}
                        </IconButton>
                      ),
                    }}
                  />
                  {formData.fields.length > 1 && (
                    <IconButton
                      onClick={() => {
                        const newFields = formData.fields.filter((_, i) => i !== index);
                        setFormData({ ...formData, fields: newFields });
                      }}
                      size="small"
                      color="error"
                    >
                      <FaTimes />
                    </IconButton>
                  )}
                </div>
              ))}
              
              {errors.fields && (
                <p className="text-sm text-red-600 mt-1">{errors.fields}</p>
              )}
            </div>



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
