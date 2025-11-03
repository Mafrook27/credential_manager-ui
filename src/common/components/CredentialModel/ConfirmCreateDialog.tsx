// src/common/components/CredentialModal/ConfirmCreateDialog.tsx

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import { FaPlus, FaTimes } from 'react-icons/fa';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName: string;
  type: 'service' | 'subinstance';
}

export const ConfirmCreateDialog: React.FC<Props> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  type,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="flex items-center gap-2">
        <FaPlus className="text-green-600" />
        {title}
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1" className="mb-3">
          {message}
        </Typography>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <Typography variant="body2" className="font-medium text-blue-900">
            {type === 'service' ? 'Service Name:' : 'Sub-Instance Name:'}
          </Typography>
          <Typography variant="h6" className="text-blue-700">
            {itemName}
          </Typography>
        </div>
      </DialogContent>

      <DialogActions className="p-4">
        <Button
          onClick={onClose}
          variant="outlined"
          startIcon={<FaTimes />}
          color="inherit"
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          startIcon={<FaPlus />}
          color="primary"
          autoFocus
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};
