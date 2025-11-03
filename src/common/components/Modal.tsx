
import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { IoClose } from'react-icons/io5';
// common/icons/index.ts
// export {
//     // === IONICONS (io5) ===
//     IoClose,
//     IoEyeOutline,
//     IoEyeOffOutline,
//     IoPersonAddOutline,
//     IoAddCircleOutline,
//     IoTrashOutline,
//     IoCreateOutline,
//     IoChevronDownOutline,
//     IoChevronForwardOutline,
//     IoFolderOutline,
//     IoFolderOpenOutline,
//     IoSaveOutline,
//     IoSearchOutline,
//     IoAppsOutline,
//   } from 'react-icons/io5';

  
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closeOnEscape]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  const maxWidthClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={`w-full ${maxWidthClasses[maxWidth]} bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden animate-slideUp flex flex-col max-h-[90vh]`}
      >
        {/* Header */}
        <div className="relative px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-8">
              <h2 className="text-gray-900 dark:text-white text-xl font-bold leading-tight">
                {title}
              </h2>
              {subtitle && (
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="absolute top-3.5 right-4 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg p-2 transition-colors"
              aria-label="Close modal"
            >
              <IoClose className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
