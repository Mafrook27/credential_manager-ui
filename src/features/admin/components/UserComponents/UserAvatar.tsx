// src/features/users/components/UserAvatar.tsx

import React from 'react';
import {getInitials} from '../../../../common/utils/activityHelpers';
interface UserAvatarProps {
  name: string;
  size?: number;
  backgroundColor?: string;
  textColor?: string;
}

/**
 * User Avatar Component
 * Displays user initials in a circle
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  size = 36,
  backgroundColor = '#3b82f6',
  textColor = '#ffffff',
}) => {
  const initials = getInitials(name);

  return (
    <div
      className="rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor,
        color: textColor,
        fontSize: `${size * 0.4}px`,
      }}
    >
      {initials}
    </div>
  );
};
