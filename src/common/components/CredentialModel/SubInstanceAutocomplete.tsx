// src/common/components/CredentialModal/SubInstanceAutocomplete.tsx

import React, { useState } from 'react';
import {
  Autocomplete,
  TextField,
  CircularProgress,
} from '@mui/material';
// Icons removed for cleaner UI

interface SubInstanceOption {
  name: string;
  id?: string;
}

interface Props {
  value: SubInstanceOption | null;
  onChange: (value: SubInstanceOption | null) => void;
  onRequestCreate: (name: string) => void;
  serviceId: string | null;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  existingSubInstances: SubInstanceOption[];
  loading?: boolean;
}

export const SubInstanceAutocomplete: React.FC<Props> = ({
  value,
  onChange,
  onRequestCreate,
  serviceId,
  disabled = false,
  error = false,
  helperText,
  existingSubInstances,
  loading = false,
}) => {
  const [inputValue, setInputValue] = useState('');

  return (
    <div>
      <Autocomplete
        freeSolo
        value={value}
        onChange={(_, newValue) => {
          if (typeof newValue === 'string') {
            // User pressed Enter on free text
            onRequestCreate(newValue);
          } else if (newValue && 'name' in newValue) {
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
        options={existingSubInstances}
        getOptionLabel={(option) =>
          typeof option === 'string' ? option : option.name
        }
        renderOption={(props, option) => (
          <li {...props}>
            {option.name}
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Sub-Instance Name"
            placeholder="Type to search or add new..."
            error={error}
            helperText={helperText}
            disabled={disabled || !serviceId}
            size="small"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        disabled={disabled || !serviceId}
      />

      {!serviceId && (
        <p className="text-xs text-red-500 mt-1">
          Please select a service first
        </p>
      )}

      {inputValue &&
        serviceId &&
        !existingSubInstances.some(
          (s) => s.name.toLowerCase() === inputValue.toLowerCase()
        ) && (
          <p className="text-xs text-gray-500 mt-1">
            Press Enter to add "{inputValue}" as a new folder
          </p>
        )}
    </div>
  );
};
