import React, { useState, useEffect } from 'react';
import type { User } from './../../features/admin/types/user.types'
import { IoSearch, IoClose, IoPerson, IoArrowBack } from 'react-icons/io5';
import { useDebounce } from '../hooks/useDebounce';

interface ActionCardProps {
  title: string;
  mode: 'share' | 'approve';
  users: User[];
  sharedUsers?: User[];
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  onShare?: (userId: string) => void;
  onRevoke?: (userId: string) => void;
  onApprove?: (userId: string) => void;
  onReject?: (userId: string) => void;
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
  searchPlaceholder = 'Search users by name or email',
  onSearch,
  onShare,
  onRevoke,
  onApprove,
  onReject,
  onClose,
  emptyStateMessage,
  isLoading = false,
  loadingUserId,
  validationError,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'view' | 'select'>('view');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
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
    setSelectedUser(null);
  };

  const handleUserSelection = (userId: string, userName?: string) => {
    if (mode === 'approve' && userName) {
      setSearchQuery(userName);
      setSelectedUser(userId);
      setShowSuggestions(false);
    } else {
      setSelectedUser(prev => (prev === userId ? null : userId));
    }
  };

  const handleShareClick = () => {
    setViewMode('select');
    setSelectedUser(null);
  };

  const handleBackToView = () => {
    setViewMode('view');
    setSelectedUser(null);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleConfirmShare = () => {
    if (selectedUser && onShare) {
      onShare(selectedUser);
      handleBackToView();
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    const statusConfig = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
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

  const renderUser = (user: User, isApproveMode: boolean = false) => (
    <div key={user.id} className="flex items-center justify-between gap-2 sm:gap-3 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-lg border-b border-gray-100 dark:border-gray-800 last:border-b-0">
      <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 flex-1 min-w-0">
        <div className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-primary font-semibold text-xs sm:text-sm md:text-base">{user.name.charAt(0).toUpperCase()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-gray-900 dark:text-white text-xs sm:text-sm md:text-base font-medium truncate">{user.name}</p>
          <p className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs md:text-sm truncate">{user.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {user.status && getStatusBadge(user.status)}
        {isApproveMode && user.status === 'pending' && (
          <>
            <button
              onClick={() => onReject?.(user.id)}
              disabled={loadingUserId === user.id}
              className="px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs md:text-sm font-medium rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 transition-colors"
            >
              Reject
            </button>
            <button
              onClick={() => onApprove?.(user.id)}
              disabled={loadingUserId === user.id}
              className="px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs md:text-sm font-medium rounded-full bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
            >
              {loadingUserId === user.id ? 'Loading...' : 'Approve'}
            </button>
          </>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    if (mode === 'approve') {
      return displayedApproveUsers.length > 0 ? (
        displayedApproveUsers.map(user => renderUser(user, true))
      ) : (
        <div className="text-center py-4 sm:py-6 px-2">
          <IoPerson className="text-2xl sm:text-3xl md:text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-1.5" />
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm md:text-base">{emptyStateMessage || 'No pending users to approve.'}</p>
        </div>
      );
    }
    
    if (mode === 'share') {
      if (viewMode === 'view') {
        // Show shared users with revoke option
        return displayedSharedUsers.length > 0 ? (
          <div className="space-y-1">
            {displayedSharedUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between gap-2 sm:gap-3 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-lg border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 flex-1 min-w-0">
                  <div className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary font-semibold text-xs sm:text-sm md:text-base">{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 dark:text-white text-xs sm:text-sm md:text-base font-medium truncate">{user.name}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs md:text-sm truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => onRevoke?.(user.id)}
                  disabled={loadingUserId === user.id}
                  className="px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs md:text-sm font-medium rounded-full border border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 disabled:opacity-50 transition-colors"
                >
                  {loadingUserId === user.id ? 'Revoking...' : 'Revoke'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 sm:py-6 px-2">
            <IoPerson className="text-2xl sm:text-3xl md:text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-1.5" />
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm md:text-base">{emptyStateMessage || 'Not shared with anyone yet.'}</p>
          </div>
        );
      } else {
        // viewMode === 'select' - Show available users to share with
        return availableUsers.length > 0 ? (
          <div className="space-y-1">
            {availableUsers.map(user => (
              <div
                key={user.id}
                onClick={() => handleUserSelection(user.id)}
                className={`flex items-center justify-between gap-2 sm:gap-3 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-lg border-b border-gray-100 dark:border-gray-800 last:border-b-0 cursor-pointer ${
                  selectedUser === user.id ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' : ''
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 flex-1 min-w-0">
                  <div className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary font-semibold text-xs sm:text-sm md:text-base">{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 dark:text-white text-xs sm:text-sm md:text-base font-medium truncate">{user.name}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-xs md:text-sm truncate">{user.email}</p>
                  </div>
                </div>
                {selectedUser === user.id && (
                  <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 sm:py-6 px-2">
            <IoPerson className="text-2xl sm:text-3xl md:text-4xl text-gray-300 dark:text-gray-600 mx-auto mb-1.5" />
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm md:text-base">{emptyStateMessage || 'No users available to share with.'}</p>
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
      <div className="absolute top-full left-0 right-0 mt-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-40 overflow-y-auto z-50">
        {suggestions.map(user => (
          <div
            key={user.id}
            onClick={() => handleUserSelection(user.id, user.name)}
            className="flex items-center gap-1 px-1.5 py-1 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
          >
            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-primary font-semibold text-[9px]">{user.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 dark:text-white text-[10px] font-medium truncate">{user.name}</p>
              <p className="text-gray-500 dark:text-gray-400 text-[8px] truncate">{user.email}</p>
            </div>
            {user.status && getStatusBadge(user.status)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="relative flex flex-col bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-[280px] sm:max-w-[420px] md:max-w-[520px] lg:max-w-[580px] mx-auto my-1 sm:my-2 max-h-[90vh] sm:max-h-[80vh] overflow-hidden">
      <div className="px-3 py-2.5 sm:px-4 sm:py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {mode === 'share' && viewMode === 'select' && (
            <button onClick={handleBackToView} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors shrink-0">
              <IoArrowBack className="text-gray-600 dark:text-gray-300 w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}
          <h1 className="text-gray-900 dark:text-white text-xs sm:text-sm md:text-base font-semibold truncate">
            {mode === 'share' && viewMode === 'select' ? 'Select a User to Share' : title}
          </h1>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors shrink-0">
          <IoClose className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400"/>
        </button>
      </div>

      {(mode === 'approve' || viewMode === 'select') && (
        <div className="px-3 sm:px-4 py-2 sm:py-2.5 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-3.5 pointer-events-none">
              <IoSearch className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setShowSuggestions(true)}
              className="w-full h-9 sm:h-10 md:h-11 rounded-full text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 placeholder:text-gray-500 dark:placeholder:text-gray-400 pl-9 sm:pl-10 md:pl-11 pr-9 sm:pr-10 text-xs sm:text-sm md:text-base"
              placeholder={searchPlaceholder}
            />
            {searchQuery && (
              <button onClick={clearSearch} className="absolute inset-y-0 right-0 flex items-center pr-2.5 sm:pr-3 cursor-pointer text-gray-500 hover:text-gray-800 dark:hover:text-gray-300">
                <IoClose className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </button>
            )}
            {renderAutocompleteSuggestions()}
          </div>
          {validationError && (
            <p className="text-[10px] sm:text-xs md:text-sm text-red-600 dark:text-red-400 mt-1.5 ml-1">{validationError}</p>
          )}
        </div>
      )}

      <div className="flex-grow overflow-y-auto">
        {isLoading && !loadingUserId ? (
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
          </div>
        ) : (
          renderContent()
        )}
      </div>

      <div className="flex justify-end gap-2 sm:gap-2.5 px-3 py-2.5 sm:px-4 sm:py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50/75 dark:bg-gray-800/50">
        <button
          onClick={viewMode === 'select' ? handleBackToView : onClose}
          className="px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base font-medium rounded-full text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm"
        >
          {viewMode === 'select' ? 'Cancel' : 'Close'}
        </button>
        {mode === 'share' && viewMode === 'view' && (
          <button
            onClick={handleShareClick}
            className="px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base font-medium rounded-full bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm"
          >
            Share with User
          </button>
        )}
        {mode === 'share' && viewMode === 'select' && (
          <button
            onClick={handleConfirmShare}
            disabled={!selectedUser || isLoading}
            className="px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base font-medium rounded-full bg-primary text-white hover:bg-primary/90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            Share
          </button>
        )}
      </div>
    </div>
  );
};
