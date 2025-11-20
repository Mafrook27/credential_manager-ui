// src/common/components/CredentialCard/CredentialCard.tsx

import React, { useState } from 'react';
import { MdDelete, MdVisibility, MdContentCopy, MdEdit, MdShare, MdMoreVert, MdVisibilityOff, MdKey, MdPerson } from 'react-icons/md';
import { ActionCard } from '../ActionCard';
import type { User } from '../../../features/admin/types/user.types';
import { toast } from 'react-toastify';

export interface CredentialField {
  id: string;
  key: string;
  value: string;
}

export interface CredentialCardProps {
  id: string;
  serviceName: string;
  credentialName?: string;
  fields?: CredentialField[];  // Dynamic fields array
  username?: string;  // Legacy support
  password?: string;  // Legacy support
  url?: string;
  notes?: string;
  sharedWith?: Array<{ _id: string; name: string; email: string }>;
  createdBy?: { _id: string; name: string; email: string };
  createdAt?: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onShare?: (credentialId: string, userId: string | string[]) => void;
  onRevoke?: (credentialId: string, userId: string) => void;
  onShowDetails?: (id: string) => void;
  onDecrypt?: (id: string) => Promise<{ fields?: CredentialField[]; username?: string; password?: string }>;
  availableUsers?: User[];
  onSearchUsers?: (query: string) => void;
  isLoadingUsers?: boolean;
  // State management for closing other cards
  onCardInteraction?: (cardId: string) => void;
  shouldResetState?: boolean;
}

/**
 * Reusable Credential Card Component - credential-manager (1) style with React icons
 */
export const CredentialCard: React.FC<CredentialCardProps> = ({
  id,
  serviceName,
  credentialName,
  fields: propFields,
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
  onCardInteraction,
  shouldResetState = false,
}) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [areFieldsVisible, setAreFieldsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [decryptedFields, setDecryptedFields] = useState<CredentialField[]>([]);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [visibleFields, setVisibleFields] = useState<Set<string>>(new Set()); // Track which fields are visible

  // Reset state when shouldResetState changes
  React.useEffect(() => {
    if (shouldResetState) {
      setIsMenuOpen(false);
      setAreFieldsVisible(false);
    }
  }, [shouldResetState]);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('.credential-card-menu')) {
          setIsMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const COLLAPSE_THRESHOLD = 3;
  
  // Use provided fields or convert legacy username/password to fields array format
  const displayFields: CredentialField[] = propFields || [
    { id: 'username', key: 'username', value: username || '' },
    { id: 'password', key: 'password', value: '••••••••••••••••' }
  ];
  
  const fieldsToShow = isExpanded ? displayFields : displayFields.slice(0, COLLAPSE_THRESHOLD);
  const hiddenFieldsCount = displayFields.length - COLLAPSE_THRESHOLD;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!', {
      position: 'top-right',
      autoClose: 2000,
    });
  };

  // Decrypt credentials by calling API
  const handleDecrypt = async () => {
    if (isDecrypted) {
      // Hide decrypted values
      setIsDecrypted(false);
      setDecryptedFields([]);
      return;
    }

    if (!onDecrypt) return;

    setIsDecrypting(true);
    try {
      const decrypted = await onDecrypt(id);
      
      // Handle both new fields format and legacy username/password
      if (decrypted.fields) {
        setDecryptedFields(decrypted.fields);
      } else if (decrypted.username || decrypted.password) {
        // Convert legacy format to fields
        const legacyFields: CredentialField[] = [];
        if (decrypted.username) {
          legacyFields.push({ id: 'username', key: 'username', value: decrypted.username });
        }
        if (decrypted.password) {
          legacyFields.push({ id: 'password', key: 'password', value: decrypted.password });
        }
        setDecryptedFields(legacyFields);
      }
      
      setIsDecrypted(true);
      return decrypted;
    } catch (error) {
      console.error('Failed to decrypt credentials:', error);
      // You can add error toast notification here
      throw error;
    } finally {
      setIsDecrypting(false);
    }
  };

  // Copy field value - decrypt first if needed
  const handleCopyField = async (fieldKey: string) => {
    try {
      // If already decrypted, just copy
      if (isDecrypted) {
        const field = decryptedFields.find(f => f.key === fieldKey);
        if (field) {
          handleCopy(field.value);
        }
        return;
      }

      // Need to decrypt first
      if (!onDecrypt) return;

      const decrypted = await onDecrypt(id);
      
      // Find the field value from decrypted data
      let valueToCopy = '';
      if (decrypted.fields) {
        const field = decrypted.fields.find(f => f.key === fieldKey);
        valueToCopy = field?.value || '';
      } else if (fieldKey === 'username' && decrypted.username) {
        valueToCopy = decrypted.username;
      } else if (fieldKey === 'password' && decrypted.password) {
        valueToCopy = decrypted.password;
      }

      if (valueToCopy) {
        handleCopy(valueToCopy);
      }
    } catch (error) {
      console.error('Failed to copy field:', error);
    }
  };

  return (
    <>
      {/* Card - Professional Design */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md flex flex-col border border-gray-200">
        {/* Header */}
        <header className="mt-1 px-3 py-3 bg-white border-b border-gray-200 flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MdKey className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm m-auto font-bold text-gray-900 truncate leading-tight" title={serviceName}>{serviceName}</h3>
              <div className="flex items-center gap-2 mt-1 mb-3">
                {credentialName && (
                  <p className="text-xs mb-3 text-gray-500 truncate" title={credentialName}>{credentialName}</p>
                )}

                {sharedWith && sharedWith.length > 0 && (
                  <div className="flex mb-3 items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full flex-shrink-0" title={`Shared with ${sharedWith.length} user(s)`}>
                    <MdPerson className="w-3 h-3" />
                    <span className="font-medium">{sharedWith.length}</span>
                  </div>
                )}
              </div>
            </div>
          </div>


          {/* Only show menu if there are actions available */}
          {(onEdit || onShare || onDelete) && (
            <div className="relative flex-shrink-0 credential-card-menu">
              <button 
                onClick={() => {
                  onCardInteraction?.(id);
                  setIsMenuOpen(!isMenuOpen);
                }} 
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-50 rounded"
              >
                <MdMoreVert className="w-4 h-4"/>
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
                  <div className="py-1" role="menu">
                    {onEdit && (
                      <button
                        onClick={() => { onEdit(id); setIsMenuOpen(false); }}
                        className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                      >
                        <MdEdit className="w-3.5 h-3.5 text-gray-500"/>
                        <span>Edit</span>
                      </button>
                    )}
                    {onShare && (
                      <button
                        onClick={() => { setShowShareModal(true); setIsMenuOpen(false); }}
                        className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                      >
                        <MdShare className="w-3.5 h-3.5 text-gray-500"/>
                        <span>Share</span>
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                      >
                        <MdDelete className="w-3.5 h-3.5"/>
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </header>

        {/* Fields - Compact Table */}
        <div className="px-3 py-2 flex-grow">
          <table className="w-full table-fixed">
            <tbody>
              {fieldsToShow.map(field => {
                const decryptedField = decryptedFields.find(f => f.key === field.key);
                const displayValue = areFieldsVisible && isDecrypted && decryptedField 
                  ? decryptedField.value 
                  : '••••••••••••••••';  // Show dots instead of encrypted value (16 dots)
                
                return (
                  <tr key={field.id}>
                    <td className="py-1.5 pr-3 text-xs font-medium text-gray-600 w-[30%] align-middle">
                      <div className="truncate" title={field.key}>{field.key}</div>
                    </td>
                    <td className="py-1.5 px-2 text-xs text-gray-900 font-mono w-[52%] align-middle">
                      <div 
                        className={`${areFieldsVisible && isDecrypted ? '' : 'truncate'}`}
                        title={displayValue}
                        style={areFieldsVisible && isDecrypted ? { 
                          wordBreak: 'break-word', 
                          overflowWrap: 'break-word',
                          maxWidth: '100%'
                        } : {}}
                      >
                        {displayValue}
                      </div>
                    </td>
                    <td className="py-1.5 pl-2 w-[18%] align-middle">
                      <div className="flex items-center gap-1 justify-end">
                        <button 
                          onClick={async () => {
                            onCardInteraction?.(id);
                            if (!isDecrypted && onDecrypt) {
                              await handleDecrypt();
                            }
                            setAreFieldsVisible(!areFieldsVisible);
                          }} 
                          className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded"
                          title={areFieldsVisible ? "Hide" : "Show"}
                        >
                          {areFieldsVisible ? <MdVisibilityOff className="w-3.5 h-3.5"/> : <MdVisibility className="w-3.5 h-3.5"/>}
                        </button>
                        <button 
                          onClick={() => handleCopyField(field.key)}
                          className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded"
                          title="Copy"
                        >
                          <MdContentCopy className="w-3.5 h-3.5"/>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Expand/Collapse */}
        {displayFields.length > COLLAPSE_THRESHOLD && (
          <div className="px-3 pb-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full text-center text-xs font-medium text-blue-600 hover:text-blue-700 py-1.5 hover:bg-blue-50 rounded"
            >
              {isExpanded ? 'Show Less ▲' : `Show ${hiddenFieldsCount} more ▼`}
            </button>
          </div>
        )}
         
        {/* Footer */}
        <footer className="px-3 py-2 bg-gray-50 border-t border-gray-200">
          <button onClick={() => setShowDetailsModal(true)} className="text-xs font-medium text-blue-600 hover:text-blue-700">
            View Details
          </button>
        </footer>
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
            <div className="flex items-center justify-between mb-2 sm:mb-6 pb-2 sm:pb-4 border-b border-gray-200">
              <div className="min-w-0 flex-1">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate">{serviceName}</h2>
             
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 ml-2"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4">
              {/* Sub Instance Name - Professional Gray Box */}
              {credentialName && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-2">Sub Instance Name</h3>
                  <div className="bg-gray-50 px-2 py-2 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 font-medium m-auto">{credentialName}</p>
                  </div>
                </div>
              )}

              {/* Credential Fields - Professional Typography */}
              <div>
                <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-2">Credentials</h3>
                <div className="space-y-3.5">
                  {displayFields.map(field => {
                    const decryptedField = decryptedFields.find(f => f.key === field.key);
                    const isFieldVisible = visibleFields.has(field.key);
                    const displayValue = isFieldVisible && isDecrypted && decryptedField 
                      ? decryptedField.value 
                      : '••••••••••••••••';  // Show dots for all fields when not decrypted (16 dots)
                    
                    const toggleFieldVisibility = async () => {
                      if (!isDecrypted && onDecrypt) {
                        // Decrypt first if not already decrypted
                        await handleDecrypt();
                      }
                      
                      setVisibleFields(prev => {
                        const newSet = new Set(prev);
                        if (newSet.has(field.key)) {
                          newSet.delete(field.key);
                        } else {
                          newSet.add(field.key);
                        }
                        return newSet;
                      });
                    };
                    
                    return (
                      <div key={field.id}>
                        <h4 className="text-sm font-medium text-gray-440 capitalize mb-2">{field.key}</h4>
                       <div className="flex gap-2 relative  gap-2 ">
                        <div className="flex-1 relative bg-gray-50 rounded-lg px-2 py-2 border border-gray-200 flex items-center justify-between gap-2">
                          <p className={`text-sm m-auto text-gray-900 break-all flex-1 ${field.key.toLowerCase().includes('password') ? 'font-mono' : ''}`}>
                            {displayValue}
                          </p>
                          <div className="flex items-center gap-2 flex-shrink-0">
                        
                            <button
                              onClick={() => handleCopyField(field.key)}
                              className="text-blue-600 hover:text-blue-800 transition-colors p-0"
                              title="Copy"
                            >
                              <MdContentCopy size={14} />
                            </button>
                             
                          </div>
                          
                        </div>
                           <button
                              onClick={toggleFieldVisibility}
                              className="text-gray-600 hover:text-gray-900 transition-colors p-0"
                              title={isFieldVisible ? "Hide" : "Show"}
                              disabled={isDecrypting}
                            >
                              {isFieldVisible ? <MdVisibilityOff size={16} /> : <MdVisibility size={16} />}
                            </button>

                         </div>   
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* View Credentials button removed - use eye icons on each field instead */}

              {/* URL Field - Professional Display */}
              {url && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">URL</h3>
                  <div className="bg-gray-50 rounded-lg px-2 py-2 border border-gray-200">
                    <a
                      href={url.startsWith('http') ? url : `https://${url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm  m-auto text-blue-400 hover:text-blue-500 break-all hover:underline"
                    >
                      {url}
                    </a>
                  </div>
                </div>
              )}
     {/* Notes */}
              {notes && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-2">Notes</h3>
                  <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                    <p className="text-sm m-auto text-gray-900 break-words whitespace-pre-wrap">{notes}</p>
                  </div>
                </div>
              )}
              {/* Shared With Section - Improved Spacing & Revoke Button */}
              {sharedWith && sharedWith.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-2">Shared With ({sharedWith.length})</h3>
                  <div className="space-y-2.5">
                    {sharedWith.map((user) => (
                      <div key={user._id} className="flex items-center justify-between gap-3 bg-gray-50 rounded-lg px-2 py-2 border border-gray-200">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm  m-auto font-semibold text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs  m-auto text-gray-500 truncate mt-1">{user.email}</p>
                        </div>
                        {onRevoke && (
                          <button
                            onClick={() => onRevoke(id, user._id)}
                            className="px-3 py-1.5 text-xs font-medium text-red-700 bg-white border border-red-200 hover:bg-red-50 rounded-md transition-colors flex-shrink-0"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

         

              {/* Created By - Improved Spacing */}
              {createdBy && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-2">Created By</h3>
                  <div className="bg-gray-50 rounded-lg px-2 py-2 border border-gray-200">
                    <p className="text-sm m-auto font-semibold text-gray-900">{createdBy.name}</p>
                    <p className="text-xs m-auto text-gray-500 mt-1">{createdBy.email}</p>
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
              emptyStateMessage="This credential is not currently shared yet"
              isLoading={isLoadingUsers}
            />
          </div> 
        </div>
        // j
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