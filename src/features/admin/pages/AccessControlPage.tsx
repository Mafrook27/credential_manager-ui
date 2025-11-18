// src/features/admin/pages/AccessControlPage.tsx
import React, { useEffect, useState } from 'react';
import { adminApi } from '../api/adminApi';
import { toast } from '../../../common/utils/toast';
import { getErrorMessage, shouldShowError } from '../../../common/utils/errorHandler';
import { IoSearch, IoChevronForward, IoChevronDown } from 'react-icons/io5';

// Types based on backend response
interface UserDetails {
  name: string;
  email: string;
  role: string;
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
  const limit = 10;

  // Filters
  const [search, setSearch] = useState('');
  const [rootFilter, setRootFilter] = useState('');
  const [subFilter, setSubFilter] = useState('');

  // Expanded states
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  // Get unique root and sub instances for filters
  const [rootInstances, setRootInstances] = useState<string[]>([]);
  const [allSubInstances, setAllSubInstances] = useState<Map<string, string[]>>(new Map());
  const [subInstances, setSubInstances] = useState<string[]>([]);

  useEffect(() => {
    fetchUserAccess();
  }, [currentPage, search, rootFilter, subFilter]);

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

  const toggleUserExpanded = (userId: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const getRoleBadgeColor = (role: string) => {
    return role === 'admin' 
      ? 'bg-red-600 text-white' 
      : role === 'editor'
      ? 'bg-gray-500 text-white'
      : 'bg-gray-400 text-white';
  };

  const renderPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= Math.min(totalPages, 5); i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            currentPage === i
              ? 'bg-blue-600 text-white'
              : 'hover:bg-gray-100'
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Filter Container */}
      <div className="mb-6 rounded-lg bg-white p-5">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-auto md:flex-1 md:min-w-[360px]">
            <IoSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="h-[44px] w-full rounded border border-gray-300 bg-transparent pl-10 pr-4 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              placeholder="Search by name, email, root, or sub instance..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Root Instance Dropdown */}
          <div className="relative w-full sm:w-auto md:w-[240px]">
            <select
              className="h-[44px] w-full appearance-none rounded border border-gray-300 bg-transparent pl-4 pr-10 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              value={rootFilter}
              onChange={(e) => {
                const newRoot = e.target.value;
                setRootFilter(newRoot);
                // Reset sub filter when root changes
                setSubFilter('');
                // Update available sub instances
                if (newRoot && allSubInstances.has(newRoot)) {
                  setSubInstances(allSubInstances.get(newRoot) || []);
                } else {
                  // Show all subs if no root filter
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

          {/* Sub Instance Dropdown */}
          <div className="relative w-full sm:w-auto md:w-[240px]">
            <select
              className="h-[44px] w-full appearance-none rounded border border-gray-300 bg-transparent pl-4 pr-10 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 text-sm">Loading access data...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-medium text-sm">Error loading access data</p>
          <p className="text-sm">{error}</p>
          <button onClick={fetchUserAccess} className="mt-2 text-sm underline hover:no-underline">
            Try again
          </button>
        </div>
      )}

      {/* Data Table */}
      {!loading && !error && users.length > 0 && (
        <div className="overflow-x-auto rounded-lg bg-white shadow">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="w-12 p-4 text-center text-sm font-bold text-gray-700">
                  <IoChevronDown className="text-base align-middle inline-block" />
                </th>
                <th className="min-w-[280px] p-4 text-sm font-bold text-gray-700">USER & EMAIL</th>
                <th className="w-[100px] p-4 text-center text-sm font-bold text-gray-700">ROLE</th>
                <th className="hidden p-4 text-center text-sm font-bold text-gray-700 md:table-cell">ROOTS</th>
                <th className="hidden p-4 text-center text-sm font-bold text-gray-700 md:table-cell">CREDENTIALS</th>
                <th className="w-[90px] p-4 text-center text-sm font-bold text-gray-700">SHARED</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => {
                const isExpanded = expandedUsers.has(user.userId);
                const totalCredentials = user.summary.credentialsOwned;
                const sharedToMeCount = user.summary.credentialsSharedWithMe;

                return (
                  <React.Fragment key={user.userId}>
                    {/* Main Row */}
                    <tr className={`${isExpanded ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                      <td className="p-4 text-center">
                        <button onClick={() => toggleUserExpanded(user.userId)}>
                          {isExpanded ? (
                            <IoChevronDown className="cursor-pointer text-blue-600" />
                          ) : (
                            <IoChevronForward className="cursor-pointer text-gray-500" />
                          )}
                        </button>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-bold text-gray-900">{user.userDetails.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{user.userDetails.email}</p>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getRoleBadgeColor(user.userDetails.role)}`}>
                          {user.userDetails.role.charAt(0).toUpperCase() + user.userDetails.role.slice(1)}
                        </span>
                      </td>
                      <td className="hidden p-4 text-center text-blue-600 font-bold md:table-cell">
                        {user.summary.rootsCreated}
                      </td>
                      <td className="hidden p-4 text-center text-blue-600 font-bold md:table-cell">
                        {totalCredentials}
                      </td>
                      <td className={`p-4 text-center font-bold ${sharedToMeCount > 0 ? 'text-blue-600' : 'text-gray-500'}`}>
                        {sharedToMeCount}
                      </td>
                    </tr>

                    {/* Expanded Accordion Content */}
                    {isExpanded && (
                      <tr>
                        <td className="p-0" colSpan={6}>
                          <div className="bg-gray-50 p-6">
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 md:grid-cols-2">
                              {/* Column 1 - My Instances (Root + Sub created by user) */}
                              <div>
                                <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-700">
                                  INSTANCES CREATED ({user.myInstances?.length || 0})
                                </h3>
                                <ul className="space-y-1 text-sm text-gray-700">
                                  {user.myInstances && user.myInstances.length > 0 ? (
                                    user.myInstances.map((instance) => (
                                      <li key={instance.rootId}>
                                        {instance.subInstances && instance.subInstances.length > 0 ? (
                                          instance.subInstances.map((sub) => (
                                            <div key={sub.subId} className="flex items-start py-0.5">
                                              <span className="mr-2 text-gray-400 mt-0.5">•</span>
                                              <span className="flex-1">
                                                <span className="text-gray-900">{instance.rootName}</span>
                                                <span className="text-gray-500"> - </span>
                                                <span className="text-gray-700">{sub.subName}</span>
                                              </span>
                                            </div>
                                          ))
                                        ) : (
                                          <div className="flex items-start py-0.5">
                                            <span className="mr-2 text-gray-400 mt-0.5">•</span>
                                            <span className="flex-1">
                                              <span className="text-gray-900">{instance.rootName}</span>
                                            </span>
                                          </div>
                                        )}
                                      </li>
                                    ))
                                  ) : (
                                    <li className="text-gray-500 italic">No instances created</li>
                                  )}
                                </ul>
                              </div>

                              {/* Column 2 - My Credentials (Credentials created by user) */}
                              <div>
                                <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-700">
                                  CREDENTIALS CREATED ({user.myCredentials?.length || 0})
                                </h3>
                                <ul className="space-y-2">
                                  {user.myCredentials && user.myCredentials.length > 0 ? (
                                    user.myCredentials.map((cred) => (
                                      <li key={cred.credentialId}>
                                        <div className="flex items-start py-0.5">
                                          <span className="mr-2 text-gray-400 mt-0.5">•</span>
                                          <div className="flex-1">
                                            <p className="text-sm">
                                              <span className="text-gray-900">{cred.rootInstance.rootName}</span>
                                              <span className="text-gray-500"> - </span>
                                              <span className="text-gray-700">{cred.subInstance.subName}</span>
                                            </p>
                                            {cred.sharedWithCount > 0 && (
                                              <p className="text-xs italic text-blue-600 mt-0.5">
                                                Shared with {cred.sharedWithCount} user{cred.sharedWithCount > 1 ? 's' : ''}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      </li>
                                    ))
                                  ) : (
                                    <li className="text-gray-500 italic">No credentials created</li>
                                  )}
                                </ul>
                              </div>

                              {/* Column 3 - Shared Access (Credentials shared WITH user) */}
                              <div>
                                <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-700">
                                  SHARED WITH ME ({user.sharedAccess?.length || 0})
                                </h3>
                                <ul className="space-y-2">
                                  {user.sharedAccess && user.sharedAccess.length > 0 ? (
                                    user.sharedAccess.map((access) => (
                                      <li key={access.credentialId}>
                                        <div className="flex items-start py-0.5">
                                          <span className="mr-2 text-gray-400 mt-0.5">•</span>
                                          <div className="flex-1">
                                            <p className="text-sm">
                                              <span className="text-gray-900">{access.rootInstance.rootName}</span>
                                              <span className="text-gray-500"> - </span>
                                              <span className="text-gray-700">{access.subInstance.subName}</span>
                                            </p>
                                            <p className="text-xs italic text-gray-500 mt-0.5">
                                              Shared by: {access.sharedBy.name}
                                            </p>
                                          </div>
                                        </div>
                                      </li>
                                    ))
                                  ) : (
                                    <li className="text-gray-500 italic">No shared access</li>
                                  )}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && users.length === 0 && (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Access Data Found</h3>
          <p className="text-gray-600 text-sm">No users match your current filters</p>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && users.length > 0 && (
        <div className="mt-6 flex h-[64px] items-center justify-between rounded-lg border-t border-gray-200 bg-white px-6">
          <p className="text-sm text-gray-600">
            Showing {users.length} of {totalUsers} users
          </p>
          <nav className="flex items-center space-x-4 text-sm">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="text-gray-600 hover:text-blue-600 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IoChevronForward className="text-lg rotate-180" /> Previous
            </button>
            
            {renderPageNumbers()}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="text-gray-600 hover:text-blue-600 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <IoChevronForward className="text-lg" />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default AccessControlPage;
