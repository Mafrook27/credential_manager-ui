// src/common/components/CredentialModal/ServiceAutocomplete.tsx

import React, { useState } from 'react';
import {
  Autocomplete,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
} from '@mui/material';
// Icons removed for cleaner UI

interface ServiceOption {
  serviceName: string;
  type: string;
  id?: string;
}

interface Props {
  value: ServiceOption | null;
  onChange: (value: ServiceOption | null) => void;
  onRequestCreate: (serviceName: string, type: string) => void;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  existingServices: ServiceOption[];
}

const SERVICE_TYPES = [
  'cloud',
  'banking',
  'development',
  'email',
  'social',
  'payment',
  'other',
];

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
  const [selectedType, setSelectedType] = useState('cloud');

  return (
    <Box className="space-y-3">
      {/* Type Dropdown */}
      <FormControl fullWidth size="small">
        <InputLabel>Type</InputLabel>
        <Select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          label="Type"
          disabled={disabled}
        >
          {SERVICE_TYPES.map((type) => (
            <MenuItem key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Service Name Autocomplete */}
      <Autocomplete
        freeSolo
        value={value}
        onChange={(_, newValue) => {
          if (typeof newValue === 'string') {
            // User pressed Enter on free text
            onRequestCreate(newValue, selectedType);
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
        options={existingServices.filter((s) => s.type === selectedType)}
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
            s.serviceName.toLowerCase() === inputValue.toLowerCase() &&
            s.type === selectedType
        ) && (
          <p className="text-xs text-gray-500">
            Press Enter to add "{inputValue}" as a new service
          </p>
        )}
    </Box>
  );
};
export default ServiceAutocomplete;