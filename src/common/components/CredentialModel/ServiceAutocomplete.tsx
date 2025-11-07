// src/common/components/CredentialModal/ServiceAutocomplete.tsx

import React, { useState } from 'react';
import {
  Autocomplete,
  TextField,
  Box,
} from '@mui/material';
// Icons removed for cleaner UI

interface ServiceOption {
  serviceName: string;
  id?: string;
}

interface Props {
  value: ServiceOption | null;
  onChange: (value: ServiceOption | null) => void;
  onRequestCreate: (serviceName: string) => void;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  existingServices: ServiceOption[];
}

export const ServiceAutocomplete: React.FC<Props> = ({
  value,
  onChange,
  onRequestCreate,
  disabled = false,
  error = false,
  helperText,
  existingServices,
}) => {
  const [inputValue, setInputValue] = useState('');

  return (
    <Box className="space-y-3">
      {/* Service Name Autocomplete */}
      <Autocomplete
        freeSolo
        value={value}
        onChange={(_, newValue) => {
          if (typeof newValue === 'string') {
            // User pressed Enter on free text
            onRequestCreate(newValue);
          } else if (newValue && 'serviceName' in newValue) {
            // User selected existing option
            onChange(newValue);
          } else {
            onChange(null);
          }
        }}
        inputValue={inputValue}
        onInputChange={(_, newInputValue) => {
          setInputValue(newInputValue);
        }}
        options={existingServices}
        getOptionLabel={(option) =>
          typeof option === 'string' ? option : option.serviceName
        }
        renderOption={(props, option) => (
          <li {...props}>
            {option.serviceName}
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Service Name"
            placeholder="Type to search or add new..."
            error={error}
            helperText={helperText}
            disabled={disabled}
            size="small"
          />
        )}
        disabled={disabled}
      />

      {inputValue &&
        !existingServices.some(
          (s) =>
            s.serviceName.toLowerCase() === inputValue.toLowerCase()
        ) && (
          <p className="text-xs text-gray-500">
            Press Enter to add "{inputValue}" as a new service
          </p>
        )}
    </Box>
  );
};
export default ServiceAutocomplete;