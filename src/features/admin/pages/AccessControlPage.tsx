
import React, { useEffect, useState } from 'react';
import { adminApi } from '../api/adminApi';
import { toast } from '../../../common/utils/toast';
import { getErrorMessage, shouldShowError } from '../../../common/utils/errorHandler';
import { IoChevronForward, IoChevronDown, IoSearch, IoFolderOutline, IoKeyOutline, IoShareSocialOutline } from 'react-icons/io5';
import { UserAvatar } from '../components/UserComponents/UserAvatar';

// Types based on backend response
interface UserDetails {
  name: string;
  email: string;
  role: string;
  lastLogin?: string;
}

interface Summary {
  rootsCreated: number;
  subsCreated: number;
  credentialsOwned: number;
  credentialsSharedWithMe: number;
  credentialsIShared: number;
}

interface SharedWithUser {
  userId: string;
  name: string;
  email: string;
  sharedAt: string;
}

interface Credential {
  _id: string;
  credentialId: string;
  username: string;
  url: string;
  notes: string;
  createdAt: string;
  sharedWithCount: number;
  sharedWith: SharedWithUser[];
}

interface SubInstance {
  _id: string;
  subId: string;
  subName: string;
  createdAt: string;
  credentialsCount: number;
  credentials: Credential[];
}

interface MyInstance {
  _id: string;
  rootId: string;
  rootName: string;
  type: string;
  createdAt: string;
  subInstances: SubInstance[];
}

interface MyCredential {
  _id: string;
  credentialId: string;
  rootInstance: {
    rootId: string;
    rootName: string;
  };
  subInstance: {
    subId: string;
    subName: string;
  };
  fields: any;
  notes: string;
  createdAt: string;
  sharedWithCount: number;
  sharedWith: SharedWithUser[];
}

interface SharedAccess {
  _id: string;
  credentialId: string;
  rootInstance: {
    rootId: string;
    rootName: string;
    type: string;
  };
  subInstance: {
    subId: string;
    subName: string;
  };
  credentialData: {
    username: string;
    url: string;
    notes: string;
  };
  sharedBy: {
    userId: string;
    name: string;
    email: string;
  };
  sharedAt: string;
}

interface UserAccess {
  userId: string;
  userDetails: UserDetails;
  summary: Summary;
  myInstances: MyInstance[];
  myCredentials: MyCredential[];
  sharedAccess: SharedAccess[];
}

export const AccessControlPage: React.FC = () => {
  const [users, setUsers] = useState<UserAccess[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [limit, setLimit] = useState(10);

  // Filters
  const [search, setSearch] = useState('');
  const [rootFilter, setRootFilter] = useState('');
  const [subFilter, setSubFilter] = useState('');

  // Get unique root and sub instances for filters
  const [rootInstances, setRootInstances] = useState<string[]>([]);
  const [allSubInstances, setAllSubInstances] = useState<Map<string, string[]>>(new Map());
  const [subInstances, setSubInstances] = useState<string[]>([]);

  const [selectedUser, setSelectedUser] = useState<UserAccess | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchUserAccess();
  }, [currentPage, limit, search, rootFilter, subFilter]);

  const fetchUserAccess = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params: any = {
        page: currentPage,
        limit: limit,
      };

      if (search) params.search = search;
      if (rootFilter) params.rootName = rootFilter;
      if (subFilter) params.subName = subFilter;

      console.log('=== FRONTEND: Fetching with filters ===');
      console.log('rootFilter:', rootFilter);
      console.log('subFilter:', subFilter);
      console.log('params:', params);

      const response = await adminApi.getUserAccess(params);
      
      console.log('Response users count:', response.data.users.length);
      
      setUsers(response.data.users);
      setTotalPages(response.pagination.totalPages);
      setTotalUsers(response.pagination.totalUsers);
      setCurrentPage(response.pagination.page);

      // Extract unique root and sub instances with mapping
      const roots = new Set<string>();
      const rootToSubsMap = new Map<string, Set<string>>();
      
      response.data.users.forEach((user: UserAccess) => {
        user.myInstances?.forEach((instance) => {
          roots.add(instance.rootName);
          if (!rootToSubsMap.has(instance.rootName)) {
            rootToSubsMap.set(instance.rootName, new Set<string>());
          }
          instance.subInstances?.forEach((sub) => {
            rootToSubsMap.get(instance.rootName)?.add(sub.subName);
          });
        });
        user.myCredentials?.forEach((cred) => {
          roots.add(cred.rootInstance.rootName);
          if (!rootToSubsMap.has(cred.rootInstance.rootName)) {
            rootToSubsMap.set(cred.rootInstance.rootName, new Set<string>());
          }
          rootToSubsMap.get(cred.rootInstance.rootName)?.add(cred.subInstance.subName);
        });
        user.sharedAccess?.forEach((access) => {
          roots.add(access.rootInstance.rootName);
          if (!rootToSubsMap.has(access.rootInstance.rootName)) {
            rootToSubsMap.set(access.rootInstance.rootName, new Set<string>());
          }
          rootToSubsMap.get(access.rootInstance.rootName)?.add(access.subInstance.subName);
        });
      });

      setRootInstances(Array.from(roots).sort());
      
      // Convert Map<string, Set<string>> to Map<string, string[]>
      const subsMap = new Map<string, string[]>();
      rootToSubsMap.forEach((subs, root) => {
        subsMap.set(root, Array.from(subs).sort());
      });
      setAllSubInstances(subsMap);
      
      // Update sub instances based on current root filter
      if (rootFilter && subsMap.has(rootFilter)) {
        setSubInstances(subsMap.get(rootFilter) || []);
      } else {
        // Show all subs if no root filter
        const allSubs = new Set<string>();
        subsMap.forEach((subs) => subs.forEach((sub) => allSubs.add(sub)));
        setSubInstances(Array.from(allSubs).sort());
      }
    } catch (err) {
      if (shouldShowError(err)) {
        const errorMessage = getErrorMessage(err, 'Failed to fetch user access');
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    return role === 'admin' 
      ? 'bg-red-100 text-red-800'
      : role === 'editor'
      ? 'bg-green-100 text-green-800'
      : 'bg-blue-100 text-blue-800';
  };

  const renderDetailContent = () => {
    if (!selectedUser) return null;
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
                <p className="text-xs sm:text-sm text-gray-500 mb-1">Role</p>
                <p className="font-semibold text-base sm:text-lg text-gray-900 capitalize">{selectedUser.userDetails.role}</p>
              </div>
              <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
                <p className="text-xs sm:text-sm text-gray-500 mb-1">Status</p>
                <p className="font-semibold text-base sm:text-lg text-green-600">Active</p>
              </div>
            </div>

            {selectedUser.userDetails.lastLogin && (
              <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
                <p className="text-xs sm:text-sm text-gray-500 mb-1">Last Login</p>
                <p className="font-semibold text-sm text-gray-900">
                  {new Date(selectedUser.userDetails.lastLogin).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}
            
            <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Root Instances Created</span>
                  <span className="text-sm font-semibold text-gray-900">{selectedUser.summary.rootsCreated}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Sub Instances Created</span>
                  <span className="text-sm font-semibold text-gray-900">{selectedUser.summary.subsCreated}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Credentials Owned</span>
                  <span className="text-sm font-semibold text-gray-900">{selectedUser.summary.credentialsOwned}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Credentials Shared With Me</span>
                  <span className="text-sm font-semibold text-gray-900">{selectedUser.summary.credentialsSharedWithMe}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Credentials I Shared</span>
                  <span className="text-sm font-semibold text-gray-900">{selectedUser.summary.credentialsIShared}</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'instances':
        return (
          <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Created Instances</h3>
            <div className="space-y-2">
              {selectedUser.myInstances && selectedUser.myInstances.length > 0 ? (
                selectedUser.myInstances.map((instance) => (
                  <div key={instance.rootId} className="border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                    {instance.subInstances && instance.subInstances.length > 0 ? (
                      instance.subInstances.map((sub) => (
                        <div key={sub.subId} className="py-1.5 text-sm">
                          <span className="font-medium text-gray-900">{instance.rootName}</span>
                          <span className="text-gray-400"> → </span>
                          <span className="text-gray-700">{sub.subName}</span>
                        </div>
                      ))
                    ) : (
                      <div className="py-1.5 text-sm font-medium text-gray-900">{instance.rootName}</div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic py-2">No instances created</p>
              )}
            </div>
          </div>
        );
      case 'owned_credentials':
        return (
          <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Owned Credentials</h3>
            <div className="space-y-2">
              {selectedUser.myCredentials && selectedUser.myCredentials.length > 0 ? (
                selectedUser.myCredentials.map((cred) => (
                  <div key={cred.credentialId} className="border-b border-gray-100 last:border-0 pb-2 last:pb-0 py-1.5">
                    <p className="text-sm">
                      <span className="font-medium text-gray-900">{cred.rootInstance.rootName}</span>
                      <span className="text-gray-400"> → </span>
                      <span className="text-gray-700">{cred.subInstance.subName}</span>
                    </p>
                    {cred.sharedWithCount > 0 && (
                      <p className="text-xs text-blue-600 mt-1">
                        Shared with {cred.sharedWithCount} user{cred.sharedWithCount > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic py-2">No credentials created</p>
              )}
            </div>
          </div>
        );
      case 'shared_with_user':
        return (
          <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Shared With User</h3>
            <div className="space-y-2">
              {selectedUser.sharedAccess && selectedUser.sharedAccess.length > 0 ? (
                selectedUser.sharedAccess.map((access) => (
                  <div key={access.credentialId} className="border-b border-gray-100 last:border-0 pb-2 last:pb-0 py-1.5">
                    <p className="text-sm">
                      <span className="font-medium text-gray-900">{access.rootInstance.rootName}</span>
                      <span className="text-gray-400"> → </span>
                      <span className="text-gray-700">{access.subInstance.subName}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Shared by: {access.sharedBy.name}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic py-2">No shared access</p>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full">
        {/* Header */}
        <div className="mb-3 sm:mb-4 md:mb-6 mt-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 mb-2">
            <div className="w-full sm:w-auto">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">Access Control</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                Monitor user access and credential management
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filter Container */}
        <div className="mb-3 sm:mb-4 md:mb-6 bg-white border border-gray-200 rounded-lg p-2 sm:p-3 md:p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search - Always visible */}
            <div className="flex-1">
              <div className="relative">
                <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by user, role, or credentials..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>

          {/* Filters - Desktop only */}
          <div className="hidden lg:flex items-center gap-3 flex-wrap mt-3">
            <div className="relative w-full sm:w-auto md:w-[240px]">
              <select
                className="h-[44px] w-full appearance-none rounded border border-gray-300 bg-white pl-4 pr-10 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm"
                value={rootFilter}
                onChange={(e) => {
                  const newRoot = e.target.value;
                  setRootFilter(newRoot);
                  setSubFilter('');
                  if (newRoot && allSubInstances.has(newRoot)) {
                    setSubInstances(allSubInstances.get(newRoot) || []);
                  } else {
                    const allSubs = new Set<string>();
                    allSubInstances.forEach((subs) => subs.forEach((sub) => allSubs.add(sub)));
                    setSubInstances(Array.from(allSubs).sort());
                  }
                }}
              >
                <option value="">Root Instance: All</option>
                {rootInstances.map((root) => (
                  <option key={root} value={root}>
                    Root Instance: {root}
                  </option>
                ))}
              </select>
              <IoChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <div className="relative w-full sm:w-auto md:w-[240px]">
              <select
                className="h-[44px] w-full appearance-none rounded border border-gray-300 bg-white pl-4 pr-10 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                value={subFilter}
                onChange={(e) => setSubFilter(e.target.value)}
                disabled={!rootFilter}
              >
                <option value="">Sub Instance: All</option>
                {subInstances.map((sub) => (
                  <option key={sub} value={sub}>
                    Sub Instance: {sub}
                  </option>
                ))}
              </select>
              <IoChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600 text-sm">Loading access data...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-3 rounded-lg mb-4 sm:mb-6">
            <p className="font-medium text-sm">Error loading access data</p>
            <p className="text-xs sm:text-sm">{error}</p>
            <button onClick={fetchUserAccess} className="mt-2 text-xs sm:text-sm underline hover:no-underline">
              Try again
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Access Data Found</h3>
            <p className="text-gray-600 text-sm">No users match your current filters</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 pb-4">Displaying {users.length} of {totalUsers} users</p>
            
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto bg-white border border-gray-200 rounded-lg">
              <table className="w-full text-sm">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold" scope="col">User</th>
                    <th className="px-4 py-3 text-left font-semibold" scope="col">Role</th>
                    <th className="px-4 py-3 text-center font-semibold whitespace-nowrap" scope="col">Roots / Subs</th>
                    <th className="px-4 py-3 text-center font-semibold whitespace-nowrap" scope="col">Owned Creds</th>
                    <th className="px-4 py-3 text-center font-semibold whitespace-nowrap" scope="col">Shared With Me</th>
                    <th className="px-4 py-3 text-center font-semibold whitespace-nowrap" scope="col">I Shared</th>
                    <th className="px-4 py-3 text-center font-semibold" scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr
                      key={user.userId}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedUser(user)}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar name={user.userDetails.name} size={40} />
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 truncate">{user.userDetails.name}</div>
                            <div className="text-xs text-gray-500 truncate">{user.userDetails.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-middle">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.userDetails.role)}`}>
                          {user.userDetails.role}
                        </span>
                      </td>
                      <td className="px-4 py-4 align-middle text-center">
                        <div className="inline-flex items-center gap-1.5 text-gray-700">
                          <IoFolderOutline className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span>{user.summary.rootsCreated}</span>
                          <span className="text-gray-400">/</span>
                          <span>{user.summary.subsCreated}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-middle text-center">
                        <div className="inline-flex items-center gap-1.5 text-gray-700">
                          <IoKeyOutline className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span>{user.summary.credentialsOwned}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-middle text-center">
                        <div className="inline-flex items-center gap-1.5 text-gray-700">
                          <IoShareSocialOutline className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span>{user.summary.credentialsSharedWithMe}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-middle text-center">
                        <div className="inline-flex items-center gap-1.5 text-gray-700">
                          <IoShareSocialOutline className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span>{user.summary.credentialsIShared}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-middle text-center">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(user);
                          }}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {users.map((user) => (
                <div key={user.userId} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={user.userDetails.name} size={48} />
                      <div>
                        <h3 className="font-bold text-gray-900">{user.userDetails.name}</h3>
                        <p className="text-sm text-gray-500">{user.userDetails.email}</p>
                        <span className={`mt-1 inline-block px-2 py-0.5 text-xs font-medium rounded-full ${getRoleBadgeColor(user.userDetails.role)}`}>
                          {user.userDetails.role}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center py-3 border-t border-gray-200">
                    <div>
                      <p className="font-semibold text-gray-900">{user.summary.rootsCreated}/{user.summary.subsCreated}</p>
                      <p className="text-xs text-gray-500">Roots/Subs</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{user.summary.credentialsOwned}</p>
                      <p className="text-xs text-gray-500">Owned</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{user.summary.credentialsSharedWithMe + user.summary.credentialsIShared}</p>
                      <p className="text-xs text-gray-500">Shared</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="mt-3 w-full flex items-center justify-center py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {!loading && !error && users.length > 0 && (
              <div className="mt-6 rounded-lg border-t border-gray-200 bg-white">
                {/* Mobile View */}
                <div className="sm:hidden px-4 py-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">Rows:</span>
                      <select
                        value={limit}
                        onChange={(e) => {
                          setLimit(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="border border-gray-300 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                    </div>
                    <span className="text-xs text-gray-600">
                      {(currentPage - 1) * limit + 1}-{Math.min(currentPage * limit, totalUsers)} of {totalUsers}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 text-xs border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1.5 text-xs font-medium">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 text-xs border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>

                {/* Desktop View */}
                <div className="hidden sm:flex h-[64px] items-center justify-between px-6">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">Rows per page:</span>
                    <select
                      value={limit}
                      onChange={(e) => {
                        setLimit(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                    <span className="text-sm text-gray-600">
                      Showing {(currentPage - 1) * limit + 1}-{Math.min(currentPage * limit, totalUsers)} of {totalUsers}
                    </span>
                  </div>

                  <nav className="flex items-center space-x-4 text-sm">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="text-gray-600 hover:text-blue-600 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <IoChevronForward className="text-lg rotate-180" /> Previous
                    </button>
                    
                    <div className="flex items-center space-x-2">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="text-gray-600 hover:text-blue-600 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next <IoChevronForward className="text-lg" />
                    </button>
                  </nav>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* User Details Sidebar */}
      {selectedUser && (
        <aside className="fixed top-0 right-0 h-full w-full sm:w-[90%] md:w-[60%] lg:w-[40%] max-w-2xl bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col">
          {/* Header - Sticky */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <UserAvatar name={selectedUser.userDetails.name} size={48} />
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-gray-900 truncate">{selectedUser.userDetails.name}</h2>
                <p className="text-sm text-gray-500 truncate">{selectedUser.userDetails.email}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedUser(null)}
              className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900 flex-shrink-0 ml-2"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>

          {/* Tabs - No Scroll */}
          <div className="border-b border-gray-200 bg-white flex-shrink-0">
            <nav aria-label="Tabs" className="flex">
              <button 
                onClick={() => setActiveTab('overview')} 
                className={`flex-1 border-b-2 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'overview' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Overview
              </button>
              <button 
                onClick={() => setActiveTab('instances')} 
                className={`flex-1 border-b-2 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'instances' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Instances
              </button>
              <button 
                onClick={() => setActiveTab('owned_credentials')} 
                className={`flex-1 border-b-2 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'owned_credentials' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Owned
              </button>
              <button 
                onClick={() => setActiveTab('shared_with_user')} 
                className={`flex-1 border-b-2 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'shared_with_user' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Shared
              </button>
            </nav>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6">
            {renderDetailContent()}
          </div>
        </aside>
      )}
    </div>
  );
};

export default AccessControlPage;
