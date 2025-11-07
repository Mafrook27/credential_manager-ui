// src/common/components/CredentialCard/CredentialCard.tsx

import React, { useState } from 'react';
import { MdDelete, MdVisibility, MdContentCopy, MdEdit, MdShare } from 'react-icons/md';
import { getInitials } from '../../utils/activityHelpers';
import { ActionCard } from '../ActionCard';
import type { User } from '../../../features/admin/types/user.types';

export interface CredentialCardProps {
  id: string;
  serviceName: string;
  credentialName?: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  sharedWith?: Array<{ _id: string; name: string; email: string }>;
  createdBy?: { _id: string; name: string; email: string };
  createdAt?: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onShare?: (credentialId: string, userId: string) => void;
  onRevoke?: (credentialId: string, userId: string) => void;
  onShowDetails?: (id: string) => void;
  onDecrypt?: (id: string) => Promise<{ username: string; password: string }>;
  availableUsers?: User[];
  onSearchUsers?: (query: string) => void;
  isLoadingUsers?: boolean;
}

/**
 * Reusable Credential Card Component - Modern Design matching the image
 */
export const CredentialCard: React.FC<CredentialCardProps> = ({
  id,
  serviceName,
  credentialName,
  username,
  url,
  notes,
  sharedWith,
  createdBy,
  onEdit,
  onDelete,
  onShare,
  onRevoke,
  onDecrypt,
  availableUsers = [],
  onSearchUsers,
  isLoadingUsers = false,
}) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [decryptedUsername, setDecryptedUsername] = useState<string | null>(null);
  const [decryptedPassword, setDecryptedPassword] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isDecrypted, setIsDecrypted] = useState(false);

  const initials = getInitials(serviceName);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // You can add toast notification here
  };

  // Decrypt credentials by calling API
  const handleDecrypt = async () => {
    if (isDecrypted) {
      // Hide decrypted values
      setIsDecrypted(false);
      setDecryptedUsername(null);
      setDecryptedPassword(null);
      return;
    }

    if (!onDecrypt) return;

    setIsDecrypting(true);
    try {
      const decrypted = await onDecrypt(id);
      setDecryptedUsername(decrypted.username);
      setDecryptedPassword(decrypted.password);
      setIsDecrypted(true);
    } catch (error) {
      console.error('Failed to decrypt credentials:', error);
      // You can add error toast notification here
    } finally {
      setIsDecrypting(false);
    }
  };

  return (
    <>
      {/* Card - Compact Square Design */}
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden w-full border border-blue-100">
        {/* Blue Header Bar */}
        <div className="h-1.5 bg-blue-600"></div>
        
        <div className="p-3">
          {/* Header with Service Name */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-md flex-shrink-0">
                <span className="text-white font-bold text-xs">{initials}</span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 text-sm truncate">{serviceName}</h3>
                {sharedWith && sharedWith.length > 0 && (
                  <div className="flex items-center gap-0.5 text-blue-600 text-xs font-medium">
                    <MdShare size={10} />
                    <span className="text-xs">{sharedWith.length}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Credential Name / Sub Instance */}
          {credentialName && (
            <div className="mb-2 pb-2 border-b border-gray-100">
              <p className="text-md text-bold  text-gray-600 truncate">{credentialName}</p>
            </div>
          )}

          {/* Credentials Section */}
          <div className="space-y-1.5">
            {/* Username */}
            <div>
              <p className="text-sm text-gray-500 font-medium mb-0.5">Username</p>
              <div className="bg-gray-50 rounded px-2 py-1 border border-gray-100">
                <p className="text-sm text-gray-900 font-medium truncate">
                  {isDecrypted && decryptedUsername ? decryptedUsername : username}
                </p>
              </div>
            </div>

            {/* Password - Flat Display */}
            <div>
              <p className="text-sm text-gray-500 font-medium mb-0.5">Password</p>
              <div className="bg-gray-50 rounded px-2 py-1 border border-gray-100">
                <p className="text-sm font-mono text-gray-900 truncate">
                  {isDecrypted && decryptedPassword ? decryptedPassword : '••••••••••••'}
                </p>
              </div>
            </div>

            {/* Decrypt Button on Card */}
            {onDecrypt && (
              <button
                onClick={handleDecrypt}
                disabled={isDecrypting}
                className="w-full py-1.5 px-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-200 font-medium text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDecrypting ? 'Decrypting...' : isDecrypted ? 'Hide' : 'Decrypt'}
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1.5 mt-2.5 pt-2.5 border-t border-gray-100">
            <button
              onClick={() => setShowDetailsModal(true)}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-200 font-medium text-sm shadow-sm"
            >
              <MdVisibility size={14} />
              <span>View</span>
            </button>
            {onEdit && (
              <button
                onClick={() => onEdit(id)}
                className="p-1.5 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                title="Edit"
              >
                <MdEdit size={14} />
              </button>
            )}
            {onShare && (
              <button
                onClick={() => setShowShareModal(true)}
                className="p-1.5 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                title="Share"
              >
                <MdShare size={14} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="p-1.5 border border-red-200 text-red-600 rounded-md hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                title="Delete"
              >
                <MdDelete size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4 sm:p-6 animate-fadeIn"
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="bg-white rounded-xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto animate-slideUp shadow-2xl border border-blue-100"
            onClick={(e) => e.stopPropagation()}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-200">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
                  <span className="text-white font-bold text-xs sm:text-sm">{initials}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate">{serviceName}</h2>
                  <p className="text-xs text-gray-500 truncate">{credentialName || 'Credential Details'}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 ml-2"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-3 sm:space-y-4">
              {credentialName && (
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1.5">Sub Instance Name</p>
                  <p className="text-sm text-gray-900 font-medium bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">{credentialName}</p>
                </div>
              )}

              {/* Decrypt Button - Calls API */}
              {onDecrypt && (
                <div className="flex justify-end">
                  <button
                    onClick={handleDecrypt}
                    disabled={isDecrypting}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDecrypting ? 'Decrypting...' : isDecrypted ? 'Hide' : 'Decrypt'}
                  </button>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs text-gray-500 font-medium">Username</p>
                  {isDecrypted && decryptedUsername && (
                    <button
                      onClick={() => handleCopy(decryptedUsername)}
                      className="text-blue-600 text-xs font-medium hover:text-blue-700 transition-colors flex items-center gap-1"
                    >
                      <MdContentCopy size={14} />
                      <span>Copy</span>
                    </button>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100">
                  <p className="text-sm text-gray-900 font-medium break-all">
                    {isDecrypted && decryptedUsername ? decryptedUsername : username}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs text-gray-500 font-medium">Password</p>
                  {isDecrypted && decryptedPassword && (
                    <button
                      onClick={() => handleCopy(decryptedPassword)}
                      className="text-blue-600 text-xs font-medium hover:text-blue-700 transition-colors flex items-center gap-1"
                    >
                      <MdContentCopy size={14} />
                      <span>Copy</span>
                    </button>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100">
                  <p className="text-sm font-mono text-gray-900 break-all">
                    {isDecrypted && decryptedPassword ? decryptedPassword : '•'.repeat(12)}
                  </p>
                </div>
              </div>

              {/* Notes Section - Above URL */}
              {notes && (
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1.5">Notes</p>
                  <div className="bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100">
                    <p className="text-sm text-gray-900 break-words whitespace-pre-wrap">{notes}</p>
                  </div>
                </div>
              )}

              {url && (
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1.5">URL</p>
                  <a
                    href={url.startsWith('http') ? url : `https://${url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 break-all bg-blue-50 px-3 py-2 rounded-lg border border-blue-100 block"
                  >
                    {url}
                  </a>
                </div>
              )}

              {/* Shared With Section - Between URL and Created By */}
              {sharedWith && sharedWith.length > 0 && (
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 font-semibold mb-2">Shared With ({sharedWith.length})</p>
                  <div className="space-y-2">
                    {sharedWith.map((user) => (
                      <div key={user._id} className="flex items-center gap-2 sm:gap-3 bg-gray-50 rounded-lg px-2.5 sm:px-3 py-2 sm:py-2.5 border border-gray-200">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm">
                          {getInitials(user.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {createdBy && (
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 font-semibold mb-2">Created By</p>
                  <div className="flex items-center gap-2 sm:gap-3 bg-gray-50 rounded-lg px-2.5 sm:px-3 py-2 sm:py-2.5 border border-gray-200">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                      {getInitials(createdBy.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{createdBy.name}</p>
                      <p className="text-xs text-gray-500 truncate">{createdBy.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200 flex gap-2 sm:gap-3 flex-wrap">
              {onEdit && (
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    onEdit(id);
                  }}
                  className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-3 sm:px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
                >
                  <MdEdit size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span>Edit</span>
                </button>
              )}
              {onShare && (
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setShowShareModal(true);
                  }}
                  className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-3 sm:px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
                >
                  <MdShare size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span>Share</span>
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setShowDeleteModal(true);
                  }}
                  className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-3 sm:px-4 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm sm:text-base"
                >
                  <MdDelete size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span>Delete</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Share Modal with ActionCard */}
      {showShareModal && onShare && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4 sm:p-6 animate-fadeIn"
          onClick={() => setShowShareModal(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <ActionCard
              title="Share Credential"
              mode="share"
              users={availableUsers}
              sharedUsers={sharedWith?.map(user => ({
                id: user._id,
                name: user.name,
                email: user.email,
                status: 'active',
                role: 'user',
                createdAt: '',
              })) || []}
              searchPlaceholder="Search users to share with"
              onSearch={onSearchUsers}
              onShare={(userId) => {
                onShare(id, userId);
                setShowShareModal(false);
              }}
              onRevoke={(userId) => {
                onRevoke?.(id, userId);
              }}
              onClose={() => setShowShareModal(false)}
              emptyStateMessage="No users available to share with"
              isLoading={isLoadingUsers}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4 sm:p-6 animate-fadeIn"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-white rounded-xl max-w-sm w-full p-4 sm:p-6 animate-slideUp shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MdDelete size={24} className="text-red-600" />
              </div>
              
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Delete Credential</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Are you sure you want to delete this credential? This action cannot be undone.
              </p>
              
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2 sm:py-2.5 px-3 sm:px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    if (onDelete) {
                      onDelete(id);
                    }
                  }}
                  className="flex-1 py-2 sm:py-2.5 px-3 sm:px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm sm:text-base"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};