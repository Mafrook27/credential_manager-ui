// src/features/user/pages/CredentialPage.user.tsx

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { CredentialCard } from '../../../common/components/CredentialCard';
import { CredentialFormModal } from '../../../common/components/CredentialModel';
import { toast } from '../../../common/utils/toast';
import { IoSearch } from 'react-icons/io5';
import { useDebounce } from '../../../common/hooks/useDebounce';
import { Autocomplete, TextField, Pagination } from '@mui/material';
import { userCredentialApi } from '../api/user.credential.api';
import { instanceApi } from '../../../common/api/instanceApi';
import type { RootInstance, SubInstance } from '../../../common/api/instanceApi';
import type { User, UserRole } from '../../admin/types/user.types';

// ========== TYPES ==========
interface ApiCredential {
  _id: string;
  serviceName: string;
  type: string;
  subInstanceName: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  credentialData?: {  
    username?: string;
    password?: string;
    url?: string;
    notes?: string;
  };
  sharedWith?: Array<{ _id: string; name: string; email: string }>;
  createdBy?: { _id: string; name: string; email: string };
  createdAt: string;
  isOwner: boolean;
}

interface ApiError {
  response?: { data?: { message?: string } };
}

// ========== COMPONENT ==========
export const UserCredentialPage: React.FC = () => {
  // State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRootInstance, setSelectedRootInstance] = useState<RootInstance | null>(null);
  const [selectedSubInstance, setSelectedSubInstance] = useState<SubInstance | null>(null);
  const [ownershipFilter, setOwnershipFilter] = useState<'all' | 'owned' | 'shared'>('all');

  const [credentials, setCredentials] = useState<ApiCredential[]>([]);
  const [rootInstances, setRootInstances] = useState<RootInstance[]>([]);
  const [subInstances, setSubInstances] = useState<SubInstance[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);

  // // ✅ User pagination state
  // const [userPage, setUserPage] = useState<number>(1);
  // const [userLimit, setUserLimit] = useState<number>(10);

  // ✅ ONE MODAL STATE - NOT TWO
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingCredential, setEditingCredential] = useState<ApiCredential | null>(null);

  const debouncedSearchQuery = useDebounce<string>(searchQuery, 500);
  const isDebouncing = searchQuery !== debouncedSearchQuery;

  // ========== MEMOIZED LOGIC ==========
  const credentialsByOwnership = useMemo<ApiCredential[]>(() => {
    if (!credentials.length) return credentials;

    if (ownershipFilter === 'owned') {
      return credentials.filter((c) => c.isOwner === true);
    }
    if (ownershipFilter === 'shared') {
      return credentials.filter((c) => c.isOwner === false);
    }
    return credentials;
  }, [credentials, ownershipFilter]);

  const filteredCredentials = useMemo<ApiCredential[]>(() => {
    return credentialsByOwnership.filter((cred) => {



      
      const credServiceName =
        (cred as unknown as { rootInstance?: { serviceName: string } })?.rootInstance?.serviceName ||
        cred.serviceName;
      const credSubName =
        (cred as unknown as { subInstance?: { name: string } })?.subInstance?.name ||
        cred.subInstanceName;

      if (selectedRootInstance && credServiceName !== selectedRootInstance.serviceName) return false;
      if (selectedSubInstance && credSubName !== selectedSubInstance.name) return false;

      return true;
    });
  }, [credentialsByOwnership, selectedRootInstance, selectedSubInstance]);

  // ========== API CALLS ==========
  const fetchCredentials = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await userCredentialApi.getCredentials({
        search: debouncedSearchQuery || undefined,
        page: currentPage,
        limit,
      });

      setCredentials((response.data.credentials as unknown as ApiCredential[]) || []);
      setTotalPages(response.totalPages);
      setTotalItems(response.total);
      setCurrentPage(response.page);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      const errorMessage = apiError.response?.data?.message || 'Failed to fetch credentials';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchQuery, currentPage, limit]);

  const fetchRootInstances = useCallback(async () => {
    try {
      const response = await instanceApi.listRootInstances();
      const instances = response.data.map((instance: unknown) => {
        const inst = instance as { rootInstanceId: string; serviceName: string; createdAt: string };
        return {
          rootInstanceId: inst.rootInstanceId,
          serviceName: inst.serviceName,
          createdAt: inst.createdAt,
        };
      });
      setRootInstances(instances);
    } catch (err: unknown) {
      console.error('Error fetching root instances:', err);
      toast.error('Failed to fetch services');
    }
  }, []);

  const fetchSubInstances = useCallback(async (rootId: string) => {
    try {
      const response = await instanceApi.listSubInstances(rootId);
      const subInsts = response.data.map((sub: unknown) => {
        const s = sub as { id: string; name: string; createdAt: string };
        return {
          subInstanceId: s.id,
          name: s.name,
          createdAt: s.createdAt,
        };
      });
      setSubInstances(subInsts);
    } catch (err: unknown) {
      console.error('Error fetching sub-instances:', err);
      toast.error('Failed to fetch sub-instances');
    }
  }, []);

  // ✅ FIXED - Added pagination params
  const fetchUsers = useCallback(async (query?: string) => {
    try {
      // ✅ PASS pagination params
      const response = await userCredentialApi.getShareableUsers(query,1,10);

      const users = response?.data?.users || [];

      // ✅ Filter with null checks
      const filteredUsers = query
        ? users.filter((user: unknown) => {
            if (!user) return false;
            const u = user as { name?: string; email?: string };
            const lowerQuery = query.toLowerCase();
            return (
              (u.name?.toLowerCase().includes(lowerQuery) || 
               u.email?.toLowerCase().includes(lowerQuery)) ?? false
            );
          })
        : users;

      // ✅ Map with type casting
      const mappedUsers: User[] = filteredUsers.map((user: unknown) => {
        if (!user) return null as unknown as User;

        const u = user as {
          _id?: string;
          id?: string;
          name?: string;
          email?: string;
          role?: string;
          isVerified?: boolean;
          isActive?: boolean;
          createdAt?: string;
        };

        return {
          id: u._id || u.id || '',
          name: u.name || '',
          email: u.email || '',
          role: (u.role as UserRole) || 'user',
          status: !u.isActive ? ('inactive' as const) : (u.isVerified ? ('active' as const) : ('pending' as const)),
          isVerified: u.isVerified,
          isActive: u.isActive,
          createdAt: u.createdAt || new Date().toISOString(),
        } satisfies User;
      });

      setAvailableUsers(mappedUsers);
    } catch (err: unknown) {
      console.error('Error fetching users:', err);
      toast.error('Failed to fetch users');
      setAvailableUsers([]);
    }
  }, []); 

  // ========== EFFECTS ==========
  useEffect(() => {
    fetchCredentials();
  }, [debouncedSearchQuery, currentPage, limit, fetchCredentials]);

  useEffect(() => {
    fetchRootInstances();
    fetchUsers();
  }, [fetchRootInstances, fetchUsers]);

  useEffect(() => {
    if (selectedRootInstance) {
      fetchSubInstances(selectedRootInstance.rootInstanceId);
    } else {
      setSubInstances([]);
      setSelectedSubInstance(null);
    }
  }, [selectedRootInstance, fetchSubInstances]);

  // ========== HANDLERS ==========
  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await userCredentialApi.deleteCredential(id);
        toast.success('Credential deleted successfully');
        fetchCredentials();
      } catch (err: unknown) {
        const apiError = err as ApiError;
        toast.error(apiError.response?.data?.message || 'Failed to delete');
      }
    },
    [fetchCredentials]
  );

  const handleDecrypt = useCallback(async (id: string): Promise<{ username: string; password: string }> => {
    try {
      const response = await userCredentialApi.getCredentialDecrypted(id);
      const credential = response.data.credential as unknown as { username?: string; password?: string };
      return {
        username: credential?.username || '',
        password: credential?.password || '',
      };
    } catch (err: unknown) {
      const apiError = err as ApiError;
      toast.error(apiError.response?.data?.message || 'Failed to decrypt');
      throw err;
    }
  }, []);

  const handleShare = useCallback(
    async (credentialId: string, userId: string) => {
      try {
        await userCredentialApi.shareCredential(credentialId, { userId });
        toast.success('Credential shared successfully');
        fetchCredentials();
      } catch (err: unknown) {
        const apiError = err as ApiError;
        toast.error(apiError.response?.data?.message || 'Failed to share');
      }
    },
    [fetchCredentials]
  );

  const handleRevoke = useCallback(
    async (credentialId: string, userId: string) => {
      try {
        await userCredentialApi.revokeAccess(credentialId, userId);
        toast.success('Access revoked successfully');
        fetchCredentials();
      } catch (err: unknown) {
        const apiError = err as ApiError;
        toast.error(apiError.response?.data?.message || 'Failed to revoke');
      }
    },
    [fetchCredentials]
  );

  const handleOpenCreateModal = useCallback(() => {
    setModalMode('create');
    setEditingCredential(null);
    setModalOpen(true);
  }, []);
const handleOpenEditModal = useCallback((credential: ApiCredential) => {
  setModalMode('edit');
  setEditingCredential(credential);  // ✅ PASS COMPLETE OBJECT - NO EXTRACTION!
  setModalOpen(true);
}, []);


  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setEditingCredential(null);
  }, []);

  const handleCreateCredential = useCallback(
    async (data: unknown) => {
      try {
        const formData = data as {
          rootId: string;
          subId: string;
          username: string;
          password: string;
          url?: string;
          notes?: string;
        };
        await userCredentialApi.createCredential(formData.rootId, formData.subId, {
          username: formData.username,
          password: formData.password,
          url: formData.url,
          notes: formData.notes,
        });
        toast.success('Credential created successfully');
        handleCloseModal();
        fetchCredentials();
      } catch (err: unknown) {
        const apiError = err as ApiError;
        toast.error(apiError.response?.data?.message || 'Failed to create credential');
        throw err;
      }
    },
    [fetchCredentials, handleCloseModal]
  );

  const handleUpdateCredential = useCallback(
    async (data: unknown) => {
      try {
        if (!editingCredential) return;
        const formData = data as { username: string; password: string; url?: string; notes?: string };
        await userCredentialApi.updateCredential(editingCredential._id, {
          username: formData.username,
          password: formData.password,
          url: formData.url,
          notes: formData.notes,
        });
        toast.success('Credential updated successfully');
        handleCloseModal();
        fetchCredentials();
      } catch (err: unknown) {
        const apiError = err as ApiError;
        toast.error(apiError.response?.data?.message || 'Failed to update credential');
        throw err;
      }
    },
    [editingCredential, fetchCredentials, handleCloseModal]
  );

  // ========== RENDER ==========
  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-6">
      <div className="mx-2 mt-2">
        {/* Header */}
        <div className="mb-3 sm:mb-4 md:mb-6 mt-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 mb-2">
            <div className="w-full sm:w-auto">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                My Credentials
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                Manage your credentials and shared access
              </p>
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium whitespace-nowrap"
            >
              + Add Credential
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-3 sm:mb-4 md:mb-6 bg-white border border-gray-200 rounded-lg p-2 sm:p-3 md:p-4">
          <div className="mb-3">
            <div className="relative">
              <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search credentials..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <Autocomplete
                options={rootInstances}
                getOptionLabel={(option) => option.serviceName}
                value={selectedRootInstance}
                onChange={(_, newValue) => {
                  setSelectedRootInstance(newValue as RootInstance | null);
                  setCurrentPage(1);
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Filter by Service" placeholder="Select service" size="small" />
                )}
                className="w-full"
              />
            </div>

            <div className="flex-1">
              <Autocomplete
                options={subInstances}
                getOptionLabel={(option) => option.name}
                value={selectedSubInstance}
                onChange={(_, newValue) => {
                  setSelectedSubInstance(newValue as SubInstance | null);
                  setCurrentPage(1);
                }}
                disabled={!selectedRootInstance}
                renderInput={(params) => (
                  <TextField {...params} label="Filter by Folder" placeholder="Select folder" size="small" />
                )}
                className="w-full"
              />
            </div>

            <div className="flex-1">
              <select
                value={ownershipFilter}
                onChange={(e) => {
                  setOwnershipFilter(e.target.value as 'all' | 'owned' | 'shared');
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm h-10"
              >
                <option value="all">All Credentials</option>
                <option value="owned">Owned by Me</option>
                <option value="shared">Shared with Me</option>
              </select>
            </div>
          </div>
        </div>

        {/* Debounce */}
        {isDebouncing && !loading && (
          <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span>Searching...</span>
          </div>
        )}

        {/* Loading */}
        {loading && !isDebouncing && (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-gray-600 text-sm">Loading credentials...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-3 rounded-lg mb-4 sm:mb-6">
            <p className="font-medium text-sm">Error loading credentials</p>
            <p className="text-xs sm:text-sm">{error}</p>
            <button onClick={fetchCredentials} className="mt-2 text-xs sm:text-sm underline hover:no-underline">
              Try again
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {filteredCredentials.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
             {filteredCredentials.map((cred) => {
  // ✅ ADD THIS - Extract data like admin does
const credData = cred.credentialData || cred;

  const username = credData.username || cred.username || 'No username';
  const password = credData.password || cred.password || '';
  const url = credData.url || cred.url;
  const notes = credData.notes || cred.notes;

  return (
    <CredentialCard
      key={cred._id}
      id={cred._id}
      serviceName={
        (cred as unknown as { rootInstance?: { serviceName: string } })?.rootInstance?.serviceName ||
        cred.serviceName
      }
      credentialName={
        (cred as unknown as { subInstance?: { name: string } })?.subInstance?.name ||
        cred.subInstanceName
      }
      username={username}        // ✅ Use extracted
      password={password}        // ✅ Use extracted
      url={url}                  // ✅ Use extracted
      notes={notes}              // ✅ Use extracted
      sharedWith={cred.sharedWith}
      createdBy={cred.createdBy}
      createdAt={cred.createdAt}
      onEdit={cred.isOwner ? () => handleOpenEditModal(cred) : undefined}
      onDelete={cred.isOwner ? handleDelete : undefined}
      onShare={cred.isOwner ? handleShare : undefined}
      onRevoke={cred.isOwner ? handleRevoke : undefined}
      onDecrypt={handleDecrypt}
      onShowDetails={() => {}}
      onSearchUsers={fetchUsers}
      availableUsers={availableUsers}
      isLoadingUsers={false}
    />
  );
})}

              </div>
            ) : (
              <div className="text-center py-16 bg-white border border-gray-200 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchQuery || selectedRootInstance || selectedSubInstance || ownershipFilter !== 'all'
                    ? 'No Results Found'
                    : 'No Credentials Yet'}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  {searchQuery || selectedRootInstance || selectedSubInstance || ownershipFilter !== 'all'
                    ? 'No credentials found matching your filters'
                    : 'Get started by creating your first credential'}
                </p>
              </div>
            )}

            {/* Pagination */}
            {filteredCredentials.length > 0 && (
              <div className="mt-4 sm:mt-6 bg-white border border-gray-200 rounded-lg px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span>Rows per page:</span>
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <span className="text-sm text-gray-700 whitespace-nowrap">
                  {(currentPage - 1) * limit + 1}–{Math.min(currentPage * limit, totalItems)} of {totalItems}
                </span>
                {totalPages > 1 && (
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(_, page) => {
                      setCurrentPage(page);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    color="primary"
                    size="medium"
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ✅ ONE MODAL - Handles BOTH create and edit */}
      <CredentialFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={modalMode === 'create' ? handleCreateCredential : handleUpdateCredential}
        mode={modalMode}
        initialData={editingCredential}
        decryptFn={(id) => userCredentialApi.getCredentialDecrypted(id)}
      />
    </div>
  );
};

export default UserCredentialPage;
