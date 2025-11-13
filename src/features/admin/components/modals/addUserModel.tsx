import React, { useState } from 'react';
import { Modal } from '../../../../common/components/Modal';
import { ConfirmModal } from '../../../../common/components/ConfirmModal';
import { IoEyeOutline, IoEyeOffOutline, IoPersonAddOutline } from 'react-icons/io5';
import { toast } from '../../../../common/utils/toast';
import { adminApi } from '../../api/adminApi';
import { shouldShowError, getErrorMessage } from '../../../../utils/errorHandler';

  
interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (userData: FormData) => void;
}

interface FormData {
  name: string;
  email: string;
  password: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showConfirm, setShowConfirm] = useState(false);

  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateField = (name: keyof FormData, value: string): string | undefined => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        break;
      case 'email':
        if (!value.trim()) return 'Email address is required';
        if (!validateEmail(value)) return 'Invalid email address';
        break;
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        break;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validateField(name as keyof FormData, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name as keyof FormData, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: FormErrors = {};
    (Object.keys(formData) as Array<keyof FormData>).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({ name: true, email: true, password: true });
      return;
    }

    // Show confirmation modal
    setShowConfirm(true);
  };

  const handleConfirmCreate = async () => {
    setLoading(true);

    try {
      await adminApi.createUser({
        name: formData.name,
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        role: 'user',
      });

      toast.success('User created successfully!');
      
      if (onSuccess) {
        onSuccess(formData);
      }
      
      handleClose();
    } catch (error: any) {
      console.error('Failed to create user:', error);
      if (shouldShowError(error)) {
        toast.error(getErrorMessage(error, 'Failed to create user'));
      }
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', password: '' });
    setErrors({});
    setTouched({});
    setShowPassword(false);
    onClose();
  };

  const isFormValid =
    !Object.values(errors).some(Boolean) &&
    formData.name &&
    formData.email &&
    formData.password;

  return (
    <>
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New User"
      subtitle="Create a new user account for the system"
      maxWidth="sm"
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-2.5 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isFormValid || loading}
            className="px-6 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            <IoPersonAddOutline className="w-4 h-4" />
            Create User
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter full name"
            className={`w-full px-4 py-3 rounded-lg border ${
              touched.name && errors.name
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            } bg-white text-gray-900 focus:ring-2 focus:border-transparent outline-none transition-all`}
          />
          {touched.name && errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter email address"
            className={`w-full px-4 py-3 rounded-lg border ${
              touched.email && errors.email
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            } bg-white text-gray-900 focus:ring-2 focus:border-transparent outline-none transition-all`}
          />
          {touched.email && errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter password"
              className={`w-full px-4 py-3 pr-12 rounded-lg border ${
                touched.password && errors.password
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              } bg-white text-gray-900 focus:ring-2 focus:border-transparent outline-none transition-all`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <IoEyeOffOutline className="w-5 h-5" />
              ) : (
                <IoEyeOutline className="w-5 h-5" />
              )}
            </button>
          </div>
          {touched.password && errors.password && (
            <p className="text-xs text-red-500 mt-1">{errors.password}</p>
          )}
        </div>

      </form>
    </Modal>

    {/* Confirmation Modal */}
    <ConfirmModal
      isOpen={showConfirm}
      onClose={() => setShowConfirm(false)}
      onConfirm={handleConfirmCreate}
      title="Confirm User Creation"
      message={`Are you sure you want to create a new user account for ${formData.name}?`}
      confirmText="Yes, Create User"
      cancelText="Cancel"
      type="info"
      loading={loading}
    />
    </>
  );
};
