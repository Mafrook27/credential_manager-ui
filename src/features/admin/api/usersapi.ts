
import axios from '../../../services/axios';

// Get all users with pagination and search
export const getAllUsers = async (params?: {page?: number;limit?: number;search?: string;}) => {
  console.log('📡 [API] Fetching users with params:', params);
  
  try {
    const response = await axios.get('/api/admin/users', { 
      params,
      withCredentials: true // Important for cookie auth
    });
    
    console.log('✅ [API] Users fetched successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ [API] Failed to fetch users:', error.response?.data || error.message);
    throw error;
  }
};

// Create new user
export const createUser = async (userData: {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
}) => {
  console.log('📡 [API] Creating user:', userData);
  
  try {
    const response = await axios.post('/api/admin/users', userData, {
      withCredentials: true
    });
    
    console.log('✅ [API] User created successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ [API] Failed to create user:', error.response?.data || error.message);
    throw error;
  }
};

// Update user
export const updateUser = async (userId: string, userData: {
  name?: string;
  email?: string;
}) => {
  console.log('📡 [API] Updating user:', userId, userData);
  
  try {
    const response = await axios.put(`/api/admin/users/${userId}`, userData, {
      withCredentials: true
    });
    
    console.log('✅ [API] User updated successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ [API] Failed to update user:', error.response?.data || error.message);
    throw error;
  }
};

// Delete user
export const deleteUser = async (userId: string) => {
  console.log('📡 [API] Deleting user:', userId);
  
  try {
    const response = await axios.delete(`/api/admin/users/${userId}`, {
      withCredentials: true
    });
    
    console.log('✅ [API] User deleted successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ [API] Failed to delete user:', error.response?.data || error.message);
    throw error;
  }
};

// Approve user
export const approveUser = async (userId: string) => {
  console.log('📡 [API] Approving user:', userId);
  
  try {
    const response = await axios.get(`/api/admin/users/permission/${userId}`, {
      withCredentials: true
    });
    
    console.log('✅ [API] User approved successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ [API] Failed to approve user:', error.response?.data || error.message);
    throw error;
  }
};
