// src/common/components/CredentialCard/CredentialGrid.tsx

import React from 'react';

export interface CredentialGridProps {
  children: React.ReactNode;
}

/**
 * Grid container for credential cards with proper spacing and responsive layout
 */
export const CredentialGrid: React.FC<CredentialGridProps> = ({ children }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 p-4">
      {children}
    </div>
  );
};
