import axiosInstance from "../../services/axios";

// ==================== TYPE DEFINITIONS ====================

export interface SubInstance {
  subInstanceId: string;
  name: string;
  createdAt: string;
}

export interface RootInstance {
  rootInstanceId: string;
  serviceName: string;
  createdAt: string;
  subInstances?: SubInstance[];
}

export interface CreateRootInstanceData {
  serviceName: string;
}

export interface UpdateRootInstanceData {
  serviceName?: string;
}

export interface CreateSubInstanceData {
  name: string;
}

export interface UpdateSubInstanceData {
  name: string;
}

// Backend response types
interface CreateInstanceResponse {
  success: boolean;
  data: {
    id: string;
    serviceName: string;
    subInstancesCount: number;
    createdAt: string;
    isNew: boolean;
  };
  message: string;
}

interface ListInstancesResponse {
  success: boolean;
  data: RootInstance[];
  count: number;
}

interface GetInstanceByIdResponse {
  success: boolean;
  data: RootInstance;
}

interface UpdateInstanceResponse {
  success: boolean;
  data: {
    id: string;
    serviceName: string;
    createdAt: string;
  };
  message: string;
}

interface DeleteInstanceResponse {
  success: boolean;
  message: string;
  deleted: {
    rootInstance: number;
    subInstances: number;
    credentials: number;
  };
}

interface CreateSubInstanceResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    rootInstanceId: string;
    credentialsCount: number;
    createdAt: string;
    isNew: boolean;
  };
  message: string;
}

interface ListSubInstancesResponse {
  success: boolean;
  rootInstance: {
    id: string;
    serviceName: string;
    createdBy: {
      id: string;
      name: string;
      email: string;
    };
  };
  data: Array<{
    id: string;
    name: string;
    credentialsCount: number;
    createdBy: {
      id: string;
      name: string;
      email: string;
    };
    createdAt: string;
  }>;
  count: number;
}

interface UpdateSubInstanceResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    rootInstanceId: string;
    createdAt: string;
  };
  message: string;
}

interface DeleteSubInstanceResponse {
  success: boolean;
  message: string;
  deleted: {
    subInstance: number;
    credentials: number;
  };
}

// ==================== API FUNCTIONS ====================

export const instanceApi = {
  // ==================== ROOT INSTANCE OPERATIONS ====================

  /**
   * Create a new root instance (service)
   * POST /api/instances
   */
  createRootInstance: async (
    data: CreateRootInstanceData
  ): Promise<CreateInstanceResponse> => {
    const response = await axiosInstance.post("/instances", data);
    return response.data;
  },

  /**
   * List all root instances
   * GET /api/instances
   */
  listRootInstances: async (): Promise<ListInstancesResponse> => {
    const response = await axiosInstance.get("/instances");
    return response.data;
  },

  /**
   * Get a specific root instance by ID with its sub-instances
   * GET /api/instances?rootId={instanceId}
   */
  getRootInstanceById: async (
    instanceId: string
  ): Promise<GetInstanceByIdResponse> => {
    const response = await axiosInstance.get(
      `/instances?rootId=${instanceId}`
    );
    return response.data;
  },

  /**
   * Search instances by name
   * GET /api/instances?rootName={serviceName}
   */
  searchRootInstancesByName: async (
    serviceName: string
  ): Promise<ListInstancesResponse> => {
    const response = await axiosInstance.get(
      `/instances?rootName=${serviceName}`
    );
    return response.data;
  },

  /**
   * Search across root instances and sub-instances
   * GET /api/instances?search={searchTerm}
   */
  searchInstances: async (searchTerm: string): Promise<any> => {
    const response = await axiosInstance.get(
      `/instances?search=${searchTerm}`
    );
    return response.data;
  },

  /**
   * Update a root instance
   * PUT /api/instances/{instanceId}
   */
  updateRootInstance: async (
    instanceId: string,
    data: UpdateRootInstanceData
  ): Promise<UpdateInstanceResponse> => {
    const response = await axiosInstance.put(`/instances/${instanceId}`, data);
    return response.data;
  },

  /**
   * Delete a root instance and all related data
   * DELETE /api/instances/{instanceId}
   */
  deleteRootInstance: async (
    instanceId: string
  ): Promise<DeleteInstanceResponse> => {
    const response = await axiosInstance.delete(`/instances/${instanceId}`);
    return response.data;
  },

  // ==================== SUB-INSTANCE OPERATIONS ====================

  /**
   * Create a new sub-instance under a root instance
   * POST /api/instances/{instanceId}/sub-instances
   */
  createSubInstance: async (
    instanceId: string,
    data: CreateSubInstanceData
  ): Promise<CreateSubInstanceResponse> => {
    const response = await axiosInstance.post(
      `/instances/${instanceId}/sub-instances`,
      data
    );
    return response.data;
  },

  /**
   * List all sub-instances under a root instance
   * GET /api/instances/{instanceId}/sub-instances
   */
  listSubInstances: async (
    instanceId: string
  ): Promise<ListSubInstancesResponse> => {
    const response = await axiosInstance.get(
      `/instances/${instanceId}/sub-instances`
    );
    return response.data;
  },

  /**
   * Update a sub-instance
   * PUT /api/instances/{instanceId}/sub-instances/{subId}
   */
  updateSubInstance: async (
    instanceId: string,
    subId: string,
    data: UpdateSubInstanceData
  ): Promise<UpdateSubInstanceResponse> => {
    const response = await axiosInstance.put(
      `/instances/${instanceId}/sub-instances/${subId}`,
      data
    );
    return response.data;
  },

  /**
   * Delete a sub-instance and all related credentials
   * DELETE /api/instances/{instanceId}/sub-instances/{subId}
   */
  deleteSubInstance: async (
    instanceId: string,
    subId: string
  ): Promise<DeleteSubInstanceResponse> => {
    const response = await axiosInstance.delete(
      `/instances/${instanceId}/sub-instances/${subId}`
    );
    return response.data;
  },
};
