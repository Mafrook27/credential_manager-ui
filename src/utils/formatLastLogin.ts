/**
 * Format ISO datetime to readable format
 * Example: "2025-10-31T12:33:18.677Z" → "Oct 31, 2025 at 12:33 PM"
 */
export const formatLastLogin = (isoDate: string): string => {
  if (!isoDate) return 'Never logged in';

  const date = new Date(isoDate);
  
  // Check if date is today
  const today = new Date();
  const isToday = 
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const time = timeFormatter.format(date);
  
  if (isToday) {
    return `Today at ${time}`;
  }
  
  return `${dateFormatter.format(date)} at ${time}`;
};
