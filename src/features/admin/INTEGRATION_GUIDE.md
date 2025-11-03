# Backend API Integration Guide

Guide for integrating frontend components with backend API.

## Credential Card Component

### Backend API Structure

```json
{
  "success": true,
  "count": 5,
  "total": 6,
  "page": 1,
  "limit": 5,
  "totalPages": 2,
  "data": {
    "credentials": [
      {
        "_id": "68f24aca328b91be0da1ac2a",
        "rootInstance": {
          "_id": "68f24998328b91be0da1abee",
          "serviceName": "xyxyxyxyxyz company",
          "type": "other"
        },
        "subInstance": {
          "_id": "68f249ca328b91be0da1abfc",
          "name": "personal Environment account"
        },
        "credentialData": {
          "username": "j******************m",
          "password": "9d1608ebc150885e5859653b3b59f7a5:b56c9803d2bfb6556d80f3f7545a19efb473572084a266d40eabd3125c33aa3e",
          "url": "https://mail.google.com",
          "notes": "Primary work email account"
        },
        "sharedWith": [
          {
            "_id": "68ef9ee6e8e42a3b87f48389",
            "name": "Azarudheen",
            "email": "azarudheen@sparklms.com"
          }
        ],
        "createdBy": {
          "_id": "68ef6ec9af497da5b41444d4",
          "name": "Admin",
          "email": "admin@example.com"
        },
        "createdAt": "2025-10-17T13:55:22.923Z"
      }
    ]
  }
}
```

### Mapping to CredentialCard Props

```tsx
// Map backend credential to CredentialCard props
const credential = backendCredential;

<CredentialCard
  id={credential._id}
  serviceName={credential.rootInstance.serviceName}
  credentialName={credential.subInstance.name}
  type={credential.rootInstance.type}
  username={credential.credentialData.username}
  password={credential.credentialData.password}
  url={credential.credentialData.url}
  notes={credential.credentialData.notes}
  sharedWith={credential.sharedWith}
  createdBy={credential.createdBy}
  createdAt={credential.createdAt}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onShare={handleShare}
  onDecrypt={handleDecrypt}
/>
```

### API Endpoints to Implement

#### 1. Get All Credentials
```tsx
GET /api/admin/credentials?page=1&limit=10

const fetchCredentials = async (page: number, limit: number) => {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/credentials?page=${page}&limit=${limit}`
  );
  const data = await response.json();
  return data.data.credentials;
};
```

#### 2. Decrypt Credential
```tsx
GET /api/admin/credentials/{id}/decrypt

const decryptCredential = async (id: string) => {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/credentials/${id}/decrypt`
  );
  const data = await response.json();
  return data.data.decryptedPassword;
};
```

#### 3. Delete Credential
```tsx
DELETE /api/admin/credentials/{id}

const deleteCredential = async (id: string) => {
  await fetch(`${API_BASE_URL}/api/admin/credentials/${id}`, {
    method: 'DELETE',
  });
};
```

#### 4. Share Credential
```tsx
POST /api/users/credentials/{id}/share

const shareCredential = async (id: string, userId: string) => {
  await fetch(`${API_BASE_URL}/api/users/credentials/${id}/share`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
};
```

#### 5. Update Credential
```tsx
PUT /api/admin/credentials/{id}

const updateCredential = async (id: string, data: any) => {
  await fetch(`${API_BASE_URL}/api/admin/credentials/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};
```

### Password Encryption Format

Backend returns encrypted passwords in format: `iv:encryptedData`

Example: `9d1608ebc150885e5859653b3b59f7a5:b56c9803d2bfb6556d80f3f7545a19efb473572084a266d40eabd3125c33aa3e`

The CredentialCard component:
- Detects encrypted format by checking for `:` character
- Shows "Decrypt" button for encrypted passwords
- Calls `onDecrypt` callback when clicked
- Frontend should call `/api/admin/credentials/{id}/decrypt` to get plain text

### Complete Integration Example

```tsx
import React, { useState, useEffect } from 'react';
import { CredentialCard } from '@/common/components/CredentialCard';
import type { Credential } from '@/features/admin/types/credential.types';

export const AllCredentialsPage: React.FC = () => {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCredentials();
  }, [page]);

  const fetchCredentials = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/credentials?page=${page}&limit=10`
      );
      const data = await response.json();
      setCredentials(data.data.credentials);
    } catch (error) {
      console.error('Error fetching credentials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDecrypt = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/credentials/${id}/decrypt`);
      const data = await response.json();
      
      // Update the credential with decrypted password
      setCredentials(prev =>
        prev.map(cred =>
          cred._id === id
            ? {
                ...cred,
                credentialData: {
                  ...cred.credentialData,
                  password: data.data.decryptedPassword,
                },
              }
            : cred
        )
      );
    } catch (error) {
      console.error('Error decrypting:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    
    try {
      await fetch(`/api/admin/credentials/${id}`, { method: 'DELETE' });
      setCredentials(prev => prev.filter(cred => cred._id !== id));
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  return (
    <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
      {credentials.map((credential) => (
        <div key={credential._id} className="col">
          <CredentialCard
            id={credential._id}
            serviceName={credential.rootInstance.serviceName}
            credentialName={credential.subInstance.name}
            type={credential.rootInstance.type}
            username={credential.credentialData.username}
            password={credential.credentialData.password}
            url={credential.credentialData.url}
            notes={credential.credentialData.notes}
            sharedWith={credential.sharedWith}
            createdBy={credential.createdBy}
            createdAt={credential.createdAt}
            onDecrypt={handleDecrypt}
            onDelete={handleDelete}
          />
        </div>
      ))}
    </div>
  );
};
```

## TypeScript Types

All types are defined in `src/features/admin/types/credential.types.ts`:

- `Credential` - Main credential interface
- `RootInstance` - Service information
- `SubInstance` - Credential name
- `CredentialData` - Username, password, URL, notes
- `SharedUser` - User the credential is shared with
- `CreatedByUser` - User who created the credential
- `CredentialsResponse` - API response wrapper

## Next Steps

1. Create API service layer (`src/services/credentialService.ts`)
2. Add React Query or SWR for data fetching
3. Implement error handling and loading states
4. Add toast notifications for success/error
5. Create edit and share modals
6. Add search and filter functionality
7. Implement pagination controls
