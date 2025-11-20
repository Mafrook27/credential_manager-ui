// src/features/admin/pages/AllCredentialsPage.tsx

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CredentialCard } from '../../../common/components/CredentialCard';
import type { Credential } from '../types/credential.types';
import type { User, UserStatus } from '../types/user.types';
import { selectSearchQuery, selectIsSearchActive } from '../redux/selectors';
import { setSearchQuery } from '../redux/actions';
import { toast } from '../../../common/utils/toast';
import { getErrorMessage, shouldShowError } from '../../../common/utils/errorHandler';
import { IoSearch } from 'react-icons/io5';
import { useDebounce } from '../../../common/hooks/useDebounce';
import { useAuth } from '../../../common/hooks/useAuth';

interface UserData {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
}

interface CredentialFormData {
  fields: Array<{ key: string; value: string }>;
  notes?: string;
  rootId: string;
  subId: string;
}

import {
  getAllCredentials,
  createCredential,
  updateCredential,
  deleteCredential,
  decryptCredential,
  shareCredential,
  revokeSharedAccess,
} from '../api/credentialApi';

import { adminApi } from '../api/adminApi';
import { CredentialFormModal } from '../../../common/components/CredentialModel';

export const AllCredentialsPage: React.FC = () => {
  const dispatch = useDispatch();
  const searchQuery = useSelector(selectSearchQuery);
  const isSearchActive = useSelector(selectIsSearchActive);
  const { user } = useAuth();

  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit, setLimit] = useState(10);


  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingCredential, setEditingCredential] = useState<Credential | null>(null);
  
  // Card interaction state
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  
  // Track if we're actively searching (more reliable than Redux isSearchActive)
  const isActuallySearching = searchQuery.trim().length > 0;
  
  // Track if search is being debounced (prevents flicker)
  const isDebouncing = searchQuery !== debouncedSearchQuery;

  // Fetch credentials when debounced search or other params change
  useEffect(() => {
    fetchCredentials();
  }, [debouncedSearchQuery, currentPage, limit]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchCredentials = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        search: debouncedSearchQuery,
        page: currentPage,
        limit: limit,
      };
      
      // console.log('🔍 Fetching credentials with params:', params);
      
      const response = await getAllCredentials(params);

      // console.log('✅ API Response:', {
      //   count: response.data.credentials.length,
      //   total: response.total,
      //   search: debouncedSearchQuery
      // });

      // Debug: Check first credential structure
      // if (response.data.credentials.length > 0) {
      //   console.log('📋 Sample credential:', response.data.credentials[0]);
      // }

      setCredentials(response.data.credentials);
      setTotalPages(response.totalPages);
      setTotalItems(response.total);
      setCurrentPage(response.page);
    } catch (err) {
      if (shouldShowError(err)) {
        const errorMessage = getErrorMessage(err, 'Failed to fetch credentials');
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (query?: string) => {
    try {
      const response = await adminApi.getAllUsers(1, 100);
      let users = response.data.users || [];
      
      // Filter by query if provided
      if (query) {
        const lowerQuery = query.toLowerCase();
        users = users.filter(
          (user: UserData) =>
            user.name.toLowerCase().includes(lowerQuery) ||
            user.email.toLowerCase().includes(lowerQuery)
        );
      }
      
      // Map to User type format expected by ActionCard
      const mappedUsers: User[] = users
        .filter((userData: UserData) => {
          const userId = userData._id || userData.id;
          const currentUserId = user?.id || user?._id;  // Fix: user object has 'id' not '_id'
          // Only show verified, active, non-deleted users
          // Exclude admin users and current logged-in user
          return userData.isVerified === true && 
            userData.isActive === true && 
            userData.isDeleted !== true &&
            userData.role !== 'admin' &&
            userId !== currentUserId;
        })
        .map((userData: UserData) => ({
          id: userData._id || userData.id || '',
          name: userData.name,
          email: userData.email,
          role: userData.role as 'admin' | 'user',
          status: (!userData.isActive ? 'inactive' : (userData.isVerified ? 'active' : 'pending')) as UserStatus,
          isVerified: userData.isVerified,
          isActive: userData.isActive,
          createdAt: userData.createdAt,
        }));
      setAvailableUsers(mappedUsers);
    } catch (err) {
      // console.error('Error fetching users:', err);
      if (shouldShowError(err)) {
        toast.error(getErrorMessage(err, 'Failed to fetch users'));
      }
    }
  };



  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1);
  };

  const handleMobileSearchChange = (value: string) => {
    // Directly update Redux search query (no need for local state)
    dispatch(setSearchQuery(value));
    setCurrentPage(1); // Reset to first page on search
  };

  const handleMobileSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Already handled by onChange, but prevent form submission
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCredential(id);
      toast.success('Credential deleted successfully');
      fetchCredentials();
    } catch (err) {
      if (shouldShowError(err)) {
        toast.error(getErrorMessage(err, 'Failed to delete'));
      }
    }
  };

  const handleDecrypt = async (id: string): Promise<{ fields?: any[]; username?: string; password?: string }> => {
    try {
      const response = await decryptCredential(id);
      const credential = response.data.credential || response.data.displaycred;
      
      // Return fields array if available, otherwise return legacy format
      if (credential?.fields && Array.isArray(credential.fields)) {
        return { fields: credential.fields };
      } else {
        // Fallback to legacy structure
        return { 
          username: credential?.username || '', 
          password: credential?.password || '' 
        };
      }
    } catch (err) {
      if (shouldShowError(err)) {
        toast.error(getErrorMessage(err, 'Failed to decrypt'));
      }
      throw err;
    }
  };

  const handleShare = async (credentialId: string, userIdOrIds: string | string[]) => {
    try {
      // Support both single and multiple user IDs
      const userIds = Array.isArray(userIdOrIds) ? userIdOrIds : [userIdOrIds];
      
      await shareCredential(credentialId, { userIds });
      
      const message = userIds.length > 1 
        ? `Credential shared with ${userIds.length} users successfully`
        : 'Credential shared successfully';
      toast.success(message);
      fetchCredentials();
    } catch (err) {
      if (shouldShowError(err)) {
        toast.error(getErrorMessage(err, 'Failed to share'));
      }
    }
  };

  const handleRevoke = async (credentialId: string, userId: string) => {
    try {
      await revokeSharedAccess(credentialId, userId);
      toast.success('Access revoked successfully');
      fetchCredentials();
    } catch (err) {
      if (shouldShowError(err)) {
        toast.error(getErrorMessage(err, 'Failed to revoke'));
      }
    }
  };

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setEditingCredential(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (credential: Credential) => {
    setModalMode('edit');
    setEditingCredential(credential);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingCredential(null);
  };

  const handleCreateCredential = async (data: CredentialFormData) => {
    try {
      await createCredential(data, data.rootId, data.subId);
      toast.success('Credential created successfully');
      fetchCredentials();
    } catch (err) {
      if (shouldShowError(err)) {
        toast.error(getErrorMessage(err, 'Failed to create credential'));
      }
      throw err;
    }
  };

  const handleUpdateCredential = async (data: Partial<CredentialFormData>) => {
    try {
      if (!editingCredential) return;
      await updateCredential(editingCredential._id, data);
      toast.success('Credential updated successfully');
      fetchCredentials();
    } catch (err) {
      if (shouldShowError(err)) {
        toast.error(getErrorMessage(err, 'Failed to update credential'));
      }
      throw err;
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full">
        {/* Header */}
        <div className="mb-3 sm:mb-4 md:mb-6 mt-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 mb-2">
            <div className="w-full sm:w-auto">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">All Credentials</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                {isSearchActive ? (
                  <>
                    Search: <span className="font-semibold">"{searchQuery}"</span>
                  </>
                ) : (
                  'Manage all stored credentials'
                )}
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

        {/* Search and Filter Container - Always visible on both mobile and desktop */}
        <div className="mb-3 sm:mb-4 md:mb-6 bg-white border border-gray-200 rounded-lg p-2 sm:p-3 md:p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search - Always visible on both mobile and desktop */}
            <form onSubmit={handleMobileSearchSubmit} className="flex-1">
              <div className="relative">
                <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleMobileSearchChange(e.target.value)}
                  placeholder="Search credentials..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </form>


          </div>
        </div>

        {/* Debouncing Indicator */}
        {isDebouncing && !loading && (
          <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Searching...</span>
          </div>
        )}

        {/* Bootstrap-style Loader */}
        {loading && !isDebouncing && (
          <div className="text-center py-12">
            <div className="spinner-border inline-block w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600 text-sm">Loading credentials...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-3 rounded-lg mb-4 sm:mb-6">
            <p className="font-medium text-sm">Error loading credentials</p>
            <p className="text-xs sm:text-sm">{error}</p>
            <button onClick={fetchCredentials} className="mt-2 text-xs sm:text-sm underline hover:no-underline">
              Try again
            </button>
          </div>
        )}

        {/* Credentials Grid */}
        {!loading && !error && (
          <>
            {credentials.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {credentials.map((credential: Credential) => {
                
                  const credData = credential.credentialData || credential;
                  
                  // Get fields array or convert legacy username/password to fields
                  let fields;
                  if (credData.fields && Array.isArray(credData.fields)) {
                    // Map backend fields to display format with masked values
                    fields = credData.fields.map((f, idx) => ({
                      id: `field-${idx}`,
                      key: f.key,
                      value: f.key.toLowerCase().includes('password') || f.key.toLowerCase().includes('secret') 
                        ? '••••••••••••' 
                        : f.value
                    }));
                  } else {
                    // Fallback to legacy structure
                    const username = credData.username || credential.username || 'No username';
                    fields = [
                      { id: 'username', key: 'username', value: username },
                      { id: 'password', key: 'password', value: '••••••••••••' }
                    ];
                  }
                  
                  const url = credData.url || credential.url;
                  const notes = credData.notes || credential.notes;
                  
                  return (
                    <CredentialCard
                      key={credential._id}
                      id={credential._id}
                      serviceName={credential.rootInstance.serviceName}
                      credentialName={credential.subInstance.name}
                      fields={fields}
                      url={url}
                      notes={notes}
                      sharedWith={credential.sharedWith}
                      createdBy={credential.createdBy}
                      createdAt={credential.createdAt}
                      onEdit={() => handleOpenEditModal(credential)}
                      onDelete={handleDelete}
                      onShare={handleShare}
                      onRevoke={handleRevoke}
                      onDecrypt={handleDecrypt}
                      onShowDetails={() => {}}
                      onSearchUsers={fetchUsers}
                      availableUsers={availableUsers}
                      isLoadingUsers={false}
                      onCardInteraction={(cardId) => setActiveCardId(cardId)}
                      shouldResetState={activeCardId !== credential._id}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-white border border-gray-200 rounded-lg">
                {/* Icon */}
                <div className="mb-4">
                  {isActuallySearching ? (
                    <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  ) : (
                    <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  )}
                </div>

                {/* Message */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {isActuallySearching ? 'No Results Found' : 'No Credentials Yet'}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base mb-4">
                  {isActuallySearching  ? (
                    <>
                      No credentials found
                      {isActuallySearching && (
                        <> matching <span className="font-semibold text-gray-900">"{searchQuery}"</span></>
                      )}
                      <br />
                      <span className="text-xs text-gray-500 mt-1 inline-block">Try adjusting your search</span>
                    </>
                  ) : (
                    'Get started by creating your first credential'
                  )}
                </p>

                {/* Action Buttons */}
                {isActuallySearching ? (
                  <div className="flex gap-2 justify-center">
                    <button 
                      onClick={() => dispatch(setSearchQuery(''))}
                      className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      Clear Search
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleOpenCreateModal}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm transition-colors"
                  >
                    + Create Credential
                  </button>
                )}
              </div>
            )}

            {/* Responsive Pagination - Show when there are credentials */}
            {credentials.length > 0 && (
              <div className="mt-4 sm:mt-6">
                {/* Mobile Layout */}
                <div className="sm:hidden bg-white border border-gray-200 rounded-lg p-3">
                  {/* Top Row: Rows per page + Count */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">Rows:</span>
                      <select
                        value={limit}
                        onChange={(e) => handleLimitChange(Number(e.target.value))}
                        className="border border-gray-300 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                    </div>
                    <span className="text-xs text-gray-700 font-medium">
                      {credentials.length > 0 ? (currentPage - 1) * limit + 1 : 0}–{(currentPage - 1) * limit + credentials.length} of {totalItems}
                    </span>
                  </div>
                  
                  {/* Bottom Row: Navigation (only if multiple pages) */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded text-xs font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Previous
                      </button>
                      
                      <span className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 rounded">
                        {currentPage} / {totalPages}
                      </span>
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded text-xs font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
                      >
                        Next
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:flex items-center justify-between gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3">
                  {/* Rows per page */}
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="whitespace-nowrap">Rows per page:</span>
                    <select
                      value={limit}
                      onChange={(e) => handleLimitChange(Number(e.target.value))}
                      className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      
                   
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>

                  {/* Page info and navigation */}
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-700">
                      {credentials.length > 0 ? (currentPage - 1) * limit + 1 : 0}–{(currentPage - 1) * limit + credentials.length} of {totalItems}
                    </span>
                    
                    {/* Only show navigation buttons if there are multiple pages */}
                    {totalPages > 1 && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          aria-label="Previous page"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          aria-label="Next page"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Credential Form Modal */}
      <CredentialFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={modalMode === 'create' ? handleCreateCredential : handleUpdateCredential}
        mode={modalMode}
        initialData={editingCredential}
        decryptFn={(id) => decryptCredential(id)}
      />
    </div>
  );
};

export default AllCredentialsPage;
