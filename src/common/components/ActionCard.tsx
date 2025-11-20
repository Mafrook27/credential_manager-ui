import React, { useState, useEffect } from 'react';
import type { User } from './../../features/admin/types/user.types'
import { IoSearch, IoClose, IoPerson, IoArrowBack } from 'react-icons/io5';
import { useDebounce } from '../hooks/useDebounce';

interface ActionCardProps {
  title: string;
  mode: 'share' | 'approve';
  users: User[];
  sharedUsers?: User[];
  rejectedUsers?: Set<string>; // Track rejected users in this session
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  onShare?: (userId: string | string[]) => void;  // Support both single and multiple
  onRevoke?: (userId: string) => void;
  onApprove?: (userId: string) => void;
  onReject?: (userId: string) => void;
  onUndo?: (userId: string) => void; // Undo rejection
  onClose?: () => void;
  emptyStateMessage?: string;
  isLoading?: boolean;
  loadingUserId?: string;
  validationError?: string;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  title,
  mode,
  users,
  sharedUsers = [],
  rejectedUsers = new Set(),
  searchPlaceholder = 'Search users by name or email',
  onSearch,
  onShare,
  onRevoke,
  onApprove,
  onReject,
  onUndo,
  onClose,
  emptyStateMessage,
  isLoading = false,
  loadingUserId,
  validationError,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'view' | 'select'>('view');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set()); // For share mode (multiple)
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  useEffect(() => {
    if (debouncedSearchQuery !== undefined) {
      onSearch?.(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(true);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleUserSelection = (userId: string, userName?: string) => {
    if (mode === 'approve' && userName) {
      setSearchQuery(userName);
      setShowSuggestions(false);
    } else if (mode === 'share') {
      // Multiple selection for share mode
      setSelectedUsers(prev => {
        const newSet = new Set(prev);
        if (newSet.has(userId)) {
          newSet.delete(userId);
        } else {
          newSet.add(userId);
        }
        return newSet;
      });
    }
  };

  const handleShareClick = () => {
    setViewMode('select');
    setSelectedUsers(new Set());
  };

  const handleBackToView = () => {
    setViewMode('view');
    setSelectedUsers(new Set());
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleConfirmShare = () => {
    if (selectedUsers.size > 0 && onShare) {
      // Share with all selected users in a single call
      const userIds = Array.from(selectedUsers);
      onShare(userIds);
      handleBackToView();
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    const statusConfig = {
      active: 'bg-green-100 text-green-800 ',
      inactive: 'bg-gray-100 text-gray-80',
      pending: 'bg-yellow-100 text-yellow-800 ',
    };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] sm:text-xs md:text-sm font-medium ${statusConfig[status as keyof typeof statusConfig]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const availableUsers = users.filter(user => !sharedUsers.some(shared => shared.id === user.id) && 
    (searchQuery === '' || user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase())));
  
  const displayedSharedUsers = sharedUsers.filter(user => searchQuery === '' || user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase()));
  const displayedApproveUsers = users.filter(user => searchQuery === '' || user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase()));

  const renderUser = (user: User, isApproveMode: boolean = false) => {
    const isRejected = rejectedUsers.has(user.id);
    
    return (
      <div key={user.id} className={`flex items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-3.5 transition-colors border-b border-gray-100 last:border-b-0 ${isRejected ? 'bg-red-50/50' : 'hover:bg-gray-50'}`}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`h-10 w-10 sm:h-11 sm:w-11 rounded-full flex items-center justify-center shrink-0 ${isRejected ? 'bg-red-100' : 'bg-primary/10'}`}>
            <span className={`font-semibold text-sm sm:text-base ${isRejected ? 'text-red-600' : 'text-primary'}`}>{user.name.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <p className={`text-sm mb-0 sm:text-base font-medium truncate leading-snug ${isRejected ? 'text-gray-500' : 'text-gray-900'}`}>{user.name}</p>
            <p className="text-gray-500 text-xs sm:text-sm break-words overflow-hidden leading-snug mt-0.5" style={{ wordBreak: 'break-word', maxHeight: '2.5em' }}>{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Only show status badge if NOT in approve mode (since all users are pending) */}
          {!isApproveMode && user.status && getStatusBadge(user.status)}
          {isApproveMode && user.status === 'pending' && (
            <>
              {isRejected ? (
                <>
                  <span className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg bg-red-100 text-red-700 whitespace-nowrap">
                    Rejected
                  </span>
                  <button
                    onClick={() => onUndo?.(user.id)}
                    disabled={loadingUserId === user.id}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg border border-blue-300 hover:bg-blue-50 text-blue-600 disabled:opacity-50 transition-all shadow-sm whitespace-nowrap"
                  >
                    {loadingUserId === user.id ? 'Loading...' : 'Undo'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onReject?.(user.id)}
                    disabled={loadingUserId === user.id}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 disabled:opacity-50 transition-all whitespace-nowrap"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => onApprove?.(user.id)}
                    disabled={loadingUserId === user.id}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-all shadow-sm whitespace-nowrap"
                  >
                    {loadingUserId === user.id ? 'Loading...' : 'Approve'}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (mode === 'approve') {
      return displayedApproveUsers.length > 0 ? (
        displayedApproveUsers.map(user => renderUser(user, true))
      ) : (
        <div className="flex flex-col items-center justify-center py-8 sm:py-10 md:py-12 px-4">
          <IoPerson className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-gray-300 mb-3" />
          <p className="text-sm sm:text-base text-gray-500">{emptyStateMessage || 'No pending users to approve'}</p>
        </div>
      );
    }
    
    if (mode === 'share') {
      if (viewMode === 'view') {
        // Show shared users with revoke option
        return displayedSharedUsers.length > 0 ? (
          <div>
            {displayedSharedUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-3.5 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary font-semibold text-sm sm:text-base">{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <p className="text-gray-900 text-sm sm:text-base font-medium truncate leading-snug">{user.name}</p>
                    <p className="text-gray-500 text-xs sm:text-sm break-words overflow-hidden leading-snug mt-0.5" style={{ wordBreak: 'break-word', maxHeight: '2.5em' }}>{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => onRevoke?.(user.id)}
                  disabled={loadingUserId === user.id}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg border border-red-300 hover:bg-red-50 text-red-600 disabled:opacity-50 transition-all shrink-0 whitespace-nowrap"
                >
                  {loadingUserId === user.id ? 'Revoking...' : 'Revoke'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 sm:py-10 md:py-12 px-4">
            <IoPerson className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-gray-300 mb-3" />
            <p className="text-sm sm:text-base text-gray-500">This credential is not currently shared yet</p>
          </div>
        );
      } else {
        // viewMode === 'select' - Show available users to share with
        return availableUsers.length > 0 ? (
          <div>
            {availableUsers.map(user => {
              const isSelected = selectedUsers.has(user.id);
              return (
                <div
                  key={user.id}
                  onClick={() => handleUserSelection(user.id)}
                  className={`flex items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-3.5 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 cursor-pointer ${
                    isSelected ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-primary font-semibold text-sm sm:text-base">{user.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className="text-gray-900 text-sm sm:text-base font-medium truncate leading-snug">{user.name}</p>
                      <p className="text-gray-500 text-xs sm:text-sm break-words overflow-hidden leading-snug mt-0.5" style={{ wordBreak: 'break-word', maxHeight: '2.5em' }}>{user.email}</p>
                    </div>
                  </div>
                  <div className={`h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? 'bg-primary border-primary' : 'border-gray-300'
                  }`}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 sm:py-10 md:py-12 px-4">
            <IoPerson className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-gray-300 mb-3" />
            <p className="text-sm sm:text-base text-gray-500">No users available to share</p>
          </div>
        );
      }
    }
    
    return null;
  };
  
  const renderAutocompleteSuggestions = () => {
    if (!showSuggestions || searchQuery.length < 2 || mode !== 'approve') return null;
    const suggestions = displayedApproveUsers.slice(0, 5);
    if (suggestions.length === 0) return null;
    
    return (
      <div className="absolute top-full left-0 right-0 mt-0.5 bg-white  border border-gray-200  rounded-md shadow-lg max-h-40 overflow-y-auto z-50">
        {suggestions.map(user => (
          <div
            key={user.id}
            onClick={() => handleUserSelection(user.id, user.name)}
            className="flex items-center gap-1 px-1.5 py-1 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-primary font-semibold text-[9px]">{user.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 text-[10px] font-medium truncate">{user.name}</p>
              <p className="text-gray-500 text-[8px] truncate">{user.email}</p>
            </div>
            {user.status && getStatusBadge(user.status)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="relative flex flex-col bg-white rounded-2xl shadow-2xl w-[92vw] sm:w-[80vw] md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto my-3 sm:my-4 max-h-[90vh] sm:max-h-[85vh] overflow-hidden">
      <div className="px-4 py-3 sm:px-5 sm:py-4 border-b border-gray-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          {mode === 'share' && viewMode === 'select' && (
            <button onClick={handleBackToView} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors shrink-0">
              <IoArrowBack className="text-gray-600 w-5 h-5" />
            </button>
          )}
          <h1 className="text-gray-900 text-base sm:text-lg font-semibold truncate">
            {mode === 'share' && viewMode === 'select' ? 'Select Users to Share' : title}
          </h1>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors shrink-0">
          <IoClose className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500"/>
        </button>
      </div>

      {(mode === 'approve' || viewMode === 'select') && (
        <div className="px-4 sm:px-5 py-3 sm:py-3.5 border-b border-gray-200 bg-gray-50/50">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
              <IoSearch className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setShowSuggestions(true)}
              className="w-full h-10 sm:h-11 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary border border-gray-300 bg-white placeholder:text-gray-400 pl-10 sm:pl-11 pr-10 text-sm sm:text-base shadow-sm transition-all"
              placeholder={searchPlaceholder}
            />
            {searchQuery && (
              <button onClick={clearSearch} className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-400 hover:text-gray-700 transition-colors">
                <IoClose className="w-5 h-5" />
              </button>
            )}
            {renderAutocompleteSuggestions()}
          </div>
          {validationError && (
            <p className="text-xs sm:text-sm text-red-600 mt-2 ml-1">{validationError}</p>
          )}
        </div>
      )}

      <div className="flex-grow overflow-y-auto">
        {isLoading && !loadingUserId ? (
          <div className="d-flex flex-column align-items-center justify-content-center py-5">
            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mt-3 mb-0 small">Loading users...</p>
          </div>
        ) : (
          renderContent()
        )}
      </div>

      <div className="flex justify-end gap-2 sm:gap-3 px-4 py-3 sm:px-5 sm:py-4 border-t border-gray-200 bg-gray-50/50">
        <button
          onClick={viewMode === 'select' ? handleBackToView : onClose}
          className="px-5 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-medium rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 transition-all shadow-sm"
        >
          {viewMode === 'select' ? 'Cancel' : 'Close'}
        </button>
        {mode === 'share' && viewMode === 'view' && (
          <button
            onClick={handleShareClick}
            className="px-5 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-medium rounded-lg bg-primary text-white hover:bg-primary/90 transition-all shadow-sm"
          >
            Share with User
          </button>
        )}
        {mode === 'share' && viewMode === 'select' && (
          <button
            onClick={handleConfirmShare}
            disabled={selectedUsers.size === 0 || isLoading}
            className="px-5 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-medium rounded-lg bg-primary text-white hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            Share {selectedUsers.size > 0 && `(${selectedUsers.size})`}
          </button>
        )}
      </div>
    </div>
  );
};
