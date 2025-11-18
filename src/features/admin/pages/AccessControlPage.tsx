
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

  // Get unique root and sub instances for filters
  const [rootInstances, setRootInstances] = useState<string[]>([]);
  const [allSubInstances, setAllSubInstances] = useState<Map<string, string[]>>(new Map());
  const [subInstances, setSubInstances] = useState<string[]>([]);

  const [selectedUser, setSelectedUser] = useState<UserAccess | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

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

      const response = await adminApi.getUserAccess(params);
      
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

  const renderPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= Math.min(totalPages, 5); i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            currentPage === i
              ? 'bg-primary text-white'
              : 'hover:bg-gray-100'
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  const renderDetailContent = () => {
    if (!selectedUser) return null;
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-semibold text-lg">{selectedUser.userDetails.role}</p>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-semibold text-lg text-green-600">Active</p>
              </div>
            </div>
          </div>
        );
      case 'instances':
        return (
          <div>
             <ul className="space-y-1 text-sm text-gray-700">
              {selectedUser.myInstances && selectedUser.myInstances.length > 0 ? (
                selectedUser.myInstances.map((instance) => (
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
        );
      case 'owned_credentials':
        return (
          <div>
            <ul className="space-y-2">
              {selectedUser.myCredentials && selectedUser.myCredentials.length > 0 ? (
                selectedUser.myCredentials.map((cred) => (
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
        );
      case 'shared_with_user':
        return (
          <div>
            <ul className="space-y-2">
              {selectedUser.sharedAccess && selectedUser.sharedAccess.length > 0 ? (
                selectedUser.sharedAccess.map((access) => (
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
        );
      default:
        return null;
    }
  };


  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background-light font-display text-gray-800">
      <main className="w-full lg:flex-1 transition-all duration-300 ease-in-out">
        <div className="flex items-center p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold leading-tight tracking-tight flex-1 ml-2 lg:ml-0">Access Control</h1>
          <div className="flex items-center gap-2">
            <button className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-gray-200">
              <span className="material-symbols-outlined text-gray-600">notifications</span>
            </button>
            <img className="h-10 w-10 rounded-full object-cover" alt="User avatar" src="https://lh3.googleusercontent.com/a/ACg8ocJ_5_v-8-2-5-6-8-9-9-7-5-5-2-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-5-d" />
          </div>
        </div>

        <div className="p-4 space-y-4 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            <label className="flex flex-col w-full lg:flex-1">
              <div className="flex w-full flex-1 items-stretch rounded-lg h-12">
                <div className="text-gray-500 flex bg-gray-100 items-center justify-center pl-4 rounded-l-lg">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <input
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-gray-900 focus:outline-0 focus:ring-2 focus:ring-primary/50 border-0 bg-gray-100 h-full placeholder:text-gray-500 px-4 text-base font-normal leading-normal"
                  placeholder="Search by user, role, or credentials..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </label>
            <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white text-sm font-bold leading-normal tracking-wide gap-2 lg:hidden">
              <span className="material-symbols-outlined">filter_list</span>
              <span className="truncate">Filters</span>
            </button>
          </div>
          <div className="hidden lg:flex items-center gap-3 flex-wrap">
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

        <div className="p-4">
        {loading ? (
           <div className="text-center py-12">
           <div className="inline-block w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
           <p className="mt-4 text-gray-600 text-sm">Loading access data...</p>
         </div>
        ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                <p className="font-medium text-sm">{error}</p>
                <button onClick={fetchUserAccess} className="mt-2 text-sm underline hover:no-underline">
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
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                  <tr>
                    <th className="p-4 w-1/12" scope="col"><input className="form-checkbox rounded border-gray-300 bg-transparent checked:bg-primary focus:ring-primary/50" type="checkbox"/></th>
                    <th className="p-4" scope="col">User</th>
                    <th className="p-4" scope="col">Role</th>
                    <th className="p-4 whitespace-nowrap" scope="col">Roots / Subs</th>
                    <th className="p-4 whitespace-nowrap" scope="col">Owned Creds</th>
                    <th className="p-4 whitespace-nowrap" scope="col">Shared With Me</th>
                    <th className="p-4 whitespace-nowrap" scope="col">I Shared</th>
                    <th className="p-4" scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.userId}
                      className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedUser(user)}
                    >
                      <td className="p-4"><input className="form-checkbox rounded border-gray-300 bg-transparent checked:bg-primary focus:ring-primary/50" type="checkbox"/></td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img className="h-10 w-10 rounded-full object-cover" alt={`User avatar of ${user.userDetails.name}`} src={`https://i.pravatar.cc/150?u=${user.userId}`} />
                          <div>
                            <div className="font-semibold">{user.userDetails.name}</div>
                            <div className="text-xs text-gray-500">{user.userDetails.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4"><span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.userDetails.role)}`}>{user.userDetails.role}</span></td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5"><span className="material-symbols-outlined md-18 text-gray-500">folder_open</span> {user.summary.rootsCreated} <span className="text-gray-500">/</span> {user.summary.subsCreated}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5"><span className="material-symbols-outlined md-18 text-gray-500">key</span> {user.summary.credentialsOwned}</div>
                      </td>
                      <td className="p-4">{user.summary.credentialsSharedWithMe}</td>
                      <td className="p-4">{user.summary.credentialsIShared}</td>
                      <td className="p-4">
                        <button className="p-2 rounded-full hover:bg-gray-200">
                          <span className="material-symbols-outlined text-gray-600">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden space-y-4">
              {users.map((user) => (
                <div key={user.userId} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <img className="h-12 w-12 rounded-full object-cover" alt={`User avatar of ${user.userDetails.name}`} src={`https://i.pravatar.cc/150?u=${user.userId}`} />
                      <div>
                        <h3 className="font-bold">{user.userDetails.name}</h3>
                        <p className="text-sm text-gray-500">{user.userDetails.email}</p>
                        <span className={`mt-1 inline-block px-2 py-0.5 text-xs font-medium rounded-full ${getRoleBadgeColor(user.userDetails.role)}`}>{user.userDetails.role}</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center mt-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="font-semibold">{user.summary.rootsCreated}/{user.summary.subsCreated}</p>
                      <p className="text-xs text-gray-500">Roots/Subs</p>
                    </div>
                    <div>
                      <p className="font-semibold">{user.summary.credentialsOwned}</p>
                      <p className="text-xs text-gray-500">Owned</p>
                    </div>
                    <div>
                      <p className="font-semibold">{user.summary.credentialsSharedWithMe + user.summary.credentialsIShared}</p>
                      <p className="text-xs text-gray-500">Shared</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="mt-4 w-full flex items-center justify-center h-10 px-4 bg-gray-100 rounded-lg text-sm font-bold text-gray-800 hover:bg-gray-200">
                    View Details
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center lg:justify-between py-6">
              <div className="hidden lg:flex items-center gap-2">
                <span className="text-sm">Rows per page:</span>
                <select className="form-select bg-transparent border-gray-300 rounded-md h-9 text-sm focus:ring-primary/50 focus:border-primary">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
              </div>
              <div className="flex items-center space-x-4 text-sm">
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
          </div>
            </div>
          </>
        )}
        </div>
      </main>

      {selectedUser && (
        <aside className="fixed top-0 right-0 h-full w-[40%] max-w-2xl bg-background-light border-l border-gray-200 shadow-2xl transform translate-x-0 transition-transform duration-300 ease-in-out z-40">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img className="h-12 w-12 rounded-full object-cover" alt={`User avatar of ${selectedUser.userDetails.name}`} src={`https://i.pravatar.cc/150?u=${selectedUser.userId}`} />
              <div>
                <h2 className="text-lg font-bold">{selectedUser.userDetails.name}</h2>
                <p className="text-sm text-gray-500">{selectedUser.userDetails.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedUser(null)}
                className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-200">
                <span className="material-symbols-outlined text-gray-600">close</span>
              </button>
            </div>
          </div>
          <div className="border-b border-gray-200">
            <nav aria-label="Tabs" className="flex -mb-px px-4">
              <a href="#" onClick={() => setActiveTab('overview')} className={`shrink-0 border-b-2 px-1 py-3 text-sm font-medium ${activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>Overview</a>
              <a href="#" onClick={() => setActiveTab('instances')} className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium ${activeTab === 'instances' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>Instances</a>
              <a href="#" onClick={() => setActiveTab('owned_credentials')} className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium ${activeTab === 'owned_credentials' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>Owned Credentials</a>
              <a href="#" onClick={() => setActiveTab('shared_with_user')} className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium ${activeTab === 'shared_with_user' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>Shared With User</a>
            </nav>
          </div>
          <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-130px)]">
            {renderDetailContent()}
          </div>
        </aside>
      )}
    </div>
  );
};

export default AccessControlPage;
