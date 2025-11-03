import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  IoAddCircleOutline, IoTrashOutline, IoCreateOutline, IoFolderOutline,
  IoSaveOutline, IoClose, IoAppsOutline, IoChevronDownOutline, 
  IoArrowBackOutline, IoFolderOpenOutline,
} from 'react-icons/io5';
import { CircularProgress } from '@mui/material';
import { Modal } from '../../../../common/components/Modal';
import { instanceApi, type RootInstance, type SubInstance } from '../../../../common/api/instanceApi';
import { toast } from '../../../../common/utils/toast';

// ==================== TYPES ====================
interface InstanceManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// ==================== CONSTANTS ====================
const SERVICE_TYPES = [
  { value: 'banking', label: 'Banking' },
  { value: 'email', label: 'Email' },
  { value: 'cloud', label: 'Cloud' },
  { value: 'social', label: 'Social' },
  { value: 'development', label: 'Development' },
  { value: 'database', label: 'Database' },
  { value: 'payment', label: 'Payment' },
  { value: 'hosting', label: 'Hosting' },
  { value: 'communication', label: 'Communication' },
  { value: 'other', label: 'Other' },
] as const;

// ==================== SUB COMPONENTS ====================
const ServiceTypeIcon: React.FC<{ type: string }> = React.memo(({ type }) => {
  const typeInfo = SERVICE_TYPES.find(t => t.value === type);
  return (
    <div 
      className="w-7 h-7 sm:w-9 sm:h-9 flex-shrink-0 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center" 
      title={typeInfo?.label || type}
    >
      <IoAppsOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400" />
    </div>
  );
});
ServiceTypeIcon.displayName = 'ServiceTypeIcon';

// ==================== MAIN COMPONENT ====================
export const InstanceManagementModal: React.FC<InstanceManagementModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  // ==================== STATE ====================
  const [instances, setInstances] = useState<RootInstance[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [leftPanelView, setLeftPanelView] = useState<'list' | 'add_service' | 'edit_service'>('list');
  const [editingSub, setEditingSub] = useState<{ id: string; name: string } | null>(null);
  const [addingSub, setAddingSub] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', type: 'cloud' });
  
  const [serviceError, setServiceError] = useState('');
  const [folderError, setFolderError] = useState('');
  
  const [inputValue, setInputValue] = useState('');

  // ==================== COMPUTED VALUES ====================

  const filteredInstances = useMemo(() => {
    if (!inputValue.trim()) {
      return instances;
    }
    
    const searchLower = inputValue.trim().toLowerCase();
    return instances.filter(instance => {
      const matchesService = instance.serviceName.toLowerCase().includes(searchLower);
      const matchesFolder = instance.subInstances?.some(sub => 
        sub.name.toLowerCase().includes(searchLower)
      );
      return matchesService || matchesFolder;
    });
  }, [inputValue, instances]);

  // ==================== API CALLS ====================
  const fetchInstances = useCallback(async () => {
    try {
      setLoading(true);
      const response = await instanceApi.listRootInstances();
      
      const instancesWithSubs = await Promise.all(
        response.data.map(async (instance) => {
          try {
            const subResponse = await instanceApi.getRootInstanceById(instance.rootInstanceId);
            return {
              ...instance,
              subInstances: subResponse.data.subInstances || []
            };
          } catch (error) {
            console.error(`Failed to load sub-instances for ${instance.serviceName}:`, error);
            return { ...instance, subInstances: [] };
          }
        })
      );
      
      setInstances(instancesWithSubs);
      
      if (instancesWithSubs.length > 0 && !selectedInstanceId && window.innerWidth >= 768) {
        setSelectedInstanceId(instancesWithSubs[0].rootInstanceId);
      }
    } catch (error: any) {
      console.error('Failed to load instances:', error);
      const errorData = error.response?.data;
      toast.error(errorData?.message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSubInstances = useCallback(async (instanceId: string) => {
    try {
      const response = await instanceApi.getRootInstanceById(instanceId);
      
      setInstances(prev => {
        return prev.map(inst => 
          inst.rootInstanceId === instanceId 
            ? { ...inst, subInstances: response.data.subInstances || [] }
            : inst
        );
      });
    } catch (error: any) {
      console.error('Failed to load sub-instances:', error);
      toast.error('Failed to load folders');
    }
  }, []);

  // ==================== EFFECTS ====================
  useEffect(() => {
    if (isOpen) {
      fetchInstances();
    } else {
      // Reset all state
      setInstances([]);
      setSelectedInstanceId(null);
      setLeftPanelView('list');
      setEditingSub(null);
      setAddingSub(false);
      setServiceError('');
      setFolderError('');
      setInputValue('');
    }

  }, [isOpen]);

  // ==================== VALIDATION ====================
  const validateServiceName = useCallback((name: string): string => {
    const trimmed = name.trim();
    if (!trimmed) return 'Service name is required';
    if (trimmed.length < 2) return 'Service name must be at least 2 characters';
    if (trimmed.length > 50) return 'Service name cannot exceed 50 characters';
    
    const isDuplicate = instances.some(
      inst => inst.serviceName.toLowerCase() === trimmed.toLowerCase() &&
              inst.rootInstanceId !== formData.id
    );
    
    if (isDuplicate) return 'A service with this name already exists';
    return '';
  }, [instances, formData.id]);

  const validateFolderName = useCallback((name: string): string => {
    const trimmed = name.trim();
    if (!trimmed) return 'Folder name is required';
    if (trimmed.length < 1) return 'Folder name must be at least 1 character';
    if (trimmed.length > 50) return 'Folder name cannot exceed 50 characters';
    
    const instance = instances.find(i => i.rootInstanceId === selectedInstanceId);
    
    if (instance && trimmed.toLowerCase() === instance.serviceName.toLowerCase()) {
      return 'Folder name cannot be the same as service name';
    }
    
    const isDuplicate = instance?.subInstances?.some(
      sub => sub.name.toLowerCase() === trimmed.toLowerCase() &&
             sub.subInstanceId !== editingSub?.id
    );
    
    if (isDuplicate) return 'A folder with this name already exists in this service';
    return '';
  }, [instances, selectedInstanceId, editingSub]);

  // ==================== HANDLERS ====================

  const handleSaveService = useCallback(async () => {
    const error = validateServiceName(formData.name);
    if (error) {
      setServiceError(error);
      return;
    }

    try {
      setActionLoading(true);
      setServiceError('');
      
      if (leftPanelView === 'add_service') {
        const response = await instanceApi.createRootInstance({
          serviceName: formData.name.trim(),
          type: formData.type,
        });
        toast.success(response.message || 'Service created successfully');
        await fetchInstances();
        setSelectedInstanceId(response.data.id);
      } else if (leftPanelView === 'edit_service') {
        const response = await instanceApi.updateRootInstance(formData.id, {
          serviceName: formData.name.trim(),
          type: formData.type,
        });
        toast.success(response.message || 'Service updated successfully');
        await fetchInstances();
      }
      
      setLeftPanelView('list');
      onSuccess?.();
    } catch (error: any) {
      console.error('Save service failed:', error);
      const errorData = error.response?.data;
      setServiceError(errorData?.message || 'Failed to save service');
      toast.error(errorData?.message || 'Failed to save service');
    } finally {
      setActionLoading(false);
    }
  }, [formData, leftPanelView, validateServiceName, fetchInstances, onSuccess]);

  const handleDeleteService = useCallback(async (instance: RootInstance) => {
    if (!window.confirm(`Delete service "${instance.serviceName}" and all its folders? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setActionLoading(true);
      const response = await instanceApi.deleteRootInstance(instance.rootInstanceId);
      toast.success(response.message || 'Service deleted successfully');
      await fetchInstances();
      
      if (selectedInstanceId === instance.rootInstanceId) {
        setSelectedInstanceId(null);
      }
      
      onSuccess?.();
    } catch (error: any) {
      console.error('Delete service failed:', error);
      const errorData = error.response?.data;
      toast.error(errorData?.message || 'Failed to delete service');
    } finally {
      setActionLoading(false);
    }
  }, [selectedInstanceId, fetchInstances, onSuccess]);
  
  const handleSaveSub = useCallback(async (name: string) => {
    const error = validateFolderName(name);
    if (error) {
      setFolderError(error);
      return;
    }

    if (!selectedInstanceId) {
      toast.error('No service selected');
      return;
    }

    try {
      setActionLoading(true);
      setFolderError('');
      
      if (addingSub) {
        const response = await instanceApi.createSubInstance(selectedInstanceId, {
          name: name.trim(),
        });
        toast.success(response.message || 'Folder created successfully');
        await fetchSubInstances(selectedInstanceId);
        setAddingSub(false);
      } else if (editingSub) {
        const response = await instanceApi.updateSubInstance(
          selectedInstanceId,
          editingSub.id,
          { name: name.trim() }
        );
        toast.success(response.message || 'Folder updated successfully');
        await fetchSubInstances(selectedInstanceId);
        setEditingSub(null);
      }
      
      onSuccess?.();
    } catch (error: any) {
      console.error('Save folder failed:', error);
      const errorData = error.response?.data;
      const errorMsg = errorData?.message || 'Failed to save folder';
      setFolderError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setActionLoading(false);
    }
  }, [selectedInstanceId, addingSub, editingSub, validateFolderName, fetchSubInstances, onSuccess]);

  const handleDeleteSub = useCallback(async (sub: SubInstance) => {
    if (!window.confirm(`Delete folder "${sub.name}"? This will also delete all credentials in this folder.`)) {
      return;
    }
    
    if (!selectedInstanceId) return;
    
    try {
      setActionLoading(true);
      const response = await instanceApi.deleteSubInstance(selectedInstanceId, sub.subInstanceId);
      toast.success(response.message || 'Folder deleted successfully');
      await fetchSubInstances(selectedInstanceId);
      onSuccess?.();
    } catch (error: any) {
      console.error('Delete folder failed:', error);
      const errorData = error.response?.data;
      toast.error(errorData?.message || 'Failed to delete folder');
    } finally {
      setActionLoading(false);
    }
  }, [selectedInstanceId, fetchSubInstances, onSuccess]);

  // ==================== MEMOIZED VALUES ====================
  const selectedInstance = useMemo(() => 
    instances.find(i => i.rootInstanceId === selectedInstanceId), 
    [instances, selectedInstanceId]
  );

  // ==================== SUB INSTANCE ROW ====================
  const SubInstanceRow: React.FC<{ 
    sub: SubInstance; 
    onSave: (name: string) => void; 
    onDelete: () => void;
  }> = React.memo(({ sub, onSave, onDelete }) => {
    const isEditing = editingSub?.id === sub.subInstanceId;
    const [name, setName] = useState(sub.name);

    useEffect(() => {
      if (isEditing) setName(editingSub?.name || '');
    }, [isEditing]);

    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSave(name);
      }
      if (e.key === 'Escape') {
        setEditingSub(null);
        setFolderError('');
      }
    }, [name, onSave]);

    return (
      <div className="flex items-center justify-between p-2 sm:p-3 group hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
        {isEditing ? (
          <div className="flex-1 mr-1.5 sm:mr-2">
            <input 
              type="text" 
              value={name} 
              onChange={e => {
                setName(e.target.value);
                setFolderError('');
              }}
              onKeyDown={handleKeyPress}
              placeholder="Enter folder name"
              className={`w-full px-2 py-1.5 text-sm rounded border ${
                folderError ? 'border-red-500 focus:ring-red-500' : 'border-indigo-400 focus:ring-indigo-500'
              } bg-white dark:bg-gray-700 focus:ring-2 focus:outline-none transition-all`}
              autoFocus
              disabled={actionLoading}
            />
            {folderError && (
              <p className="text-xs text-red-600 mt-1 font-medium">{folderError}</p>
            )}
          </div>
        ) : (
          <span className="font-medium text-gray-700 dark:text-gray-300 text-xs sm:text-sm break-words flex-1">
            {sub.name}
          </span>
        )}
        
        <div className={`flex items-center gap-0.5 sm:gap-1 transition-opacity ${!isEditing && 'opacity-100 sm:opacity-0 sm:group-hover:opacity-100'}`}>
          {isEditing ? (
            <>
              <button 
                onClick={() => onSave(name)}
                disabled={actionLoading}
                className="p-1.5 rounded-md text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 disabled:opacity-50 transition-colors" 
                title="Save"
              >
                {actionLoading ? <CircularProgress size={16} /> : <IoSaveOutline className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => {
                  setEditingSub(null);
                  setFolderError('');
                }}
                disabled={actionLoading}
                className="p-1.5 rounded-md text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" 
                title="Cancel"
              >
                <IoClose className="w-3 h-3" />
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setEditingSub({ id: sub.subInstanceId, name: sub.name })}
                disabled={actionLoading}
                className="p-1.5 rounded-md text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors" 
                title="Edit folder"
              >
                <IoCreateOutline className="w-4 h-4" />
              </button>
              <button 
                onClick={onDelete}
                disabled={actionLoading}
                className="p-1.5 rounded-md text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors" 
                title="Delete folder"
              >
                <IoTrashOutline className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    );
  });
  SubInstanceRow.displayName = 'SubInstanceRow';
  
  // ==================== ADD SUB INSTANCE ROW ====================
  const AddSubInstanceRow: React.FC<{ 
    onSave: (name: string) => void; 
    onCancel: () => void;
  }> = React.memo(({ onSave, onCancel }) => {
    const [name, setName] = useState('');
    
    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (name.trim()) onSave(name);
      }
      if (e.key === 'Escape') {
        onCancel();
      }
    }, [name, onSave, onCancel]);
    
    return (
      <div className="p-2 sm:p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border-2 border-indigo-200 dark:border-indigo-800">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <input 
            type="text" 
            value={name} 
            onChange={e => {
              setName(e.target.value);
              setFolderError('');
            }}
            onKeyDown={handleKeyPress}
            placeholder="Enter folder name..." 
            className={`flex-1 px-2 sm:px-3 py-1.5 text-sm rounded border ${
              folderError ? 'border-red-500 focus:ring-red-500' : 'border-indigo-300 focus:ring-indigo-500'
            } bg-white dark:bg-gray-700 focus:ring-2 focus:outline-none transition-all`}
            autoFocus
            disabled={actionLoading}
          />
          <button 
            onClick={() => name.trim() && onSave(name)}
            disabled={actionLoading || !name.trim()}
            className="p-1.5 sm:p-2 rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0" 
            title="Save folder"
          >
            {actionLoading ? <CircularProgress size={16} color="inherit" /> : <IoSaveOutline className="w-4 h-4" />}
          </button>
          <button 
            onClick={onCancel}
            disabled={actionLoading}
            className="p-1.5 sm:p-2 rounded-md text-gray-600 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors flex-shrink-0" 
            title="Cancel"
          >
            <IoClose className="w-4 h-4" />
          </button>
        </div>
        {folderError && (
          <p className="text-xs text-red-600 mt-2 font-medium">{folderError}</p>
        )}
      </div>
    );
  });
  AddSubInstanceRow.displayName = 'AddSubInstanceRow';

  // ==================== RENDER LEFT PANEL ====================
  const renderLeftPanel = () => {
    if (leftPanelView === 'add_service' || leftPanelView === 'edit_service') {
      return (
        <div className="p-4 space-y-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            {leftPanelView === 'add_service' ? 'Add New Service' : 'Edit Service'}
          </h3>
          
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Service Name <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              placeholder="e.g., AWS, GitHub, Azure" 
              value={formData.name} 
              onChange={e => {
                setFormData(d => ({ ...d, name: e.target.value }));
                setServiceError('');
              }}
              className={`w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md border ${
                serviceError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500'
              } bg-white dark:bg-gray-800 focus:ring-2 focus:outline-none transition-all`}
              autoFocus
              disabled={actionLoading}
            />
            {serviceError && (
              <p className="text-[10px] sm:text-xs text-red-600 mt-1 font-medium break-words">{serviceError}</p>
            )}
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select 
                value={formData.type} 
                onChange={e => setFormData(d => ({ ...d, type: e.target.value }))}
                disabled={actionLoading}
                className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 appearance-none focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all disabled:opacity-50"
              >
                {SERVICE_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <IoChevronDownOutline className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4 pointer-events-none" />
            </div>
          </div>
          
          <div className="flex justify-end gap-1.5 sm:gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <button 
              onClick={() => {
                setLeftPanelView('list');
                setServiceError('');
                setFormData({ id: '', name: '', type: 'cloud' });
              }}
              disabled={actionLoading}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium text-xs sm:text-sm transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveService} 
              disabled={actionLoading || !formData.name.trim()}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-xs sm:text-sm flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {actionLoading ? <CircularProgress size={14} color="inherit" /> : <IoSaveOutline className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              <span className="hidden xs:inline">{actionLoading ? 'Saving...' : 'Save Service'}</span>
              <span className="xs:hidden">{actionLoading ? 'Save...' : 'Save'}</span>
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="p-2 sm:p-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex-1 relative min-w-0">
              <input
                type="text"
                placeholder="Search..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full px-2.5 sm:px-3 py-2 pr-8 sm:pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
              {inputValue && (
                <button
                  onClick={() => setInputValue('')}
                  className="absolute p-0 right-2 sm:right-3 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full bg-gray-400 dark:bg-gray-500 hover:bg-gray-500 dark:hover:bg-gray-400 text-white transition-all hover:scale-110"
                  title="Clear search"
                >
                  <IoClose className="w-3 h-3 font-bold p-0" />
                </button>
              )}
            </div>
            
            <button 
              onClick={() => {
                setLeftPanelView('add_service');
                setFormData({ id: '', name: '', type: 'cloud' });
                setServiceError('');
              }}
              className="p-2 sm:p-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex-shrink-0 shadow-sm" 
              title="Add New Service"
            >
              <IoAddCircleOutline className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {loading ? (
            <div className="text-center py-10">
              <CircularProgress size={32} />
              <p className="text-sm text-gray-500 mt-3">Loading services...</p>
            </div>
          ) : filteredInstances.length > 0 ? (
            filteredInstances.map(instance => (
              <button 
                key={instance.rootInstanceId} 
                onClick={() => setSelectedInstanceId(instance.rootInstanceId)}
                className={`w-full text-left p-2 sm:p-2.5 rounded-lg flex items-start gap-2 sm:gap-3 transition-all ${
                  selectedInstanceId === instance.rootInstanceId 
                    ? 'bg-indigo-100 dark:bg-indigo-900/50 shadow-sm' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`}
              >
                <ServiceTypeIcon type={instance.type} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-xs sm:text-sm text-gray-800 dark:text-white break-words line-clamp-2">
                    {instance.serviceName}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {instance.subInstances?.length || 0} folder{instance.subInstances?.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-8 px-3">
              <IoFolderOutline className="w-12 h-12 sm:w-14 sm:h-14 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">
                {inputValue ? 'No results found' : 'No services created yet'}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1 break-words">
                {inputValue ? `Try a different search term` : 'Click the + button above to create your first service'}
              </p>
            </div>
          )}
        </div>
      </>
    );
  };

  // ==================== RENDER RIGHT PANEL ====================
  const renderRightPanel = () => {
    if (!selectedInstance) {
      return (
        <div className="hidden md:flex flex-col items-center justify-center h-full text-center p-6">
          <IoFolderOutline className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 dark:text-gray-600 mb-3" />
          <p className="font-semibold text-base sm:text-lg text-gray-700 dark:text-gray-300 mb-2">
            Select a Service
          </p>
          <p className="text-xs sm:text-sm text-gray-500 max-w-xs break-words">
            Choose a service from the left panel to view and manage its folders
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <button
                onClick={() => setSelectedInstanceId(null)}
                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 md:hidden transition-colors flex-shrink-0"
                title="Back to services"
              >
                <IoArrowBackOutline className="w-5 h-5" />
              </button>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 dark:text-white mb-1 break-words line-clamp-2">
                  {selectedInstance.serviceName}
                </h2>
                <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full capitalize inline-block">
                  {selectedInstance.type}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <button 
                onClick={() => {
                  setLeftPanelView('edit_service');
                  setFormData({
                    id: selectedInstance.rootInstanceId,
                    name: selectedInstance.serviceName,
                    type: selectedInstance.type
                  });
                  setServiceError('');
                }}
                disabled={actionLoading}
                className="p-1.5 sm:p-2 rounded-lg text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50" 
                title="Edit service"
              >
                <IoCreateOutline className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button 
                onClick={() => handleDeleteService(selectedInstance)}
                disabled={actionLoading}
                className="p-1.5 sm:p-2 rounded-lg text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50" 
                title="Delete service"
              >
                <IoTrashOutline className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
          
          <button 
            onClick={() => {
              setAddingSub(true);
              setFolderError('');
            }}
            disabled={actionLoading}
            className="w-full flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:py-2 rounded-lg bg-indigo-600 text-white text-xs sm:text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm" 
            title="Add new folder"
          >
            <IoAddCircleOutline className="w-4 h-4 sm:w-5 sm:h-5" /> 
            <span>Add  subinstance</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
          {addingSub && (
            <AddSubInstanceRow 
              onSave={handleSaveSub} 
              onCancel={() => {
                setAddingSub(false);
                setFolderError('');
              }}
            />
          )}
          
          {(selectedInstance.subInstances || []).map(sub => (
            <SubInstanceRow 
              key={sub.subInstanceId} 
              sub={sub} 
              onSave={handleSaveSub} 
              onDelete={() => handleDeleteSub(sub)} 
            />
          ))}
          
          {!addingSub && (!selectedInstance.subInstances || selectedInstance.subInstances.length === 0) && (
            <div className="text-center py-12 sm:py-16 px-3">
              <IoFolderOpenOutline className="w-12 h-12 sm:w-14 sm:h-14 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 text-xs sm:text-sm mb-2 font-medium break-words">No folders in this service yet</p>
              <button 
                onClick={() => {
                  setAddingSub(true);
                  setFolderError('');
                }}
                className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium underline transition-colors"
              >
                Create your first folder
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ==================== MAIN RENDER ====================
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Services & Folders"
      subtitle="Organize your credentials by services and associated folders"
      maxWidth="2xl"
    >
      <div className="flex flex-col md:flex-row border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 h-[70vh] sm:h-[65vh] max-h-[600px] overflow-hidden shadow-xl">
        <div className={`
          ${selectedInstanceId ? 'hidden md:flex' : 'flex'} 
          w-full md:w-1/3 border-r border-gray-200 dark:border-gray-700 flex-col bg-gray-50 dark:bg-gray-800/50
        `}>
          {renderLeftPanel()}
        </div>

        <div className={`
          ${selectedInstanceId ? 'flex' : 'hidden md:flex'}
          w-full md:w-2/3 flex-col bg-white dark:bg-gray-900
        `}>
          {renderRightPanel()}
        </div>
      </div>
    </Modal>
  );
};
