// Format date
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Get status color
export const getStatusColor = (status) => {
  switch(status) {
    case 'available': return '#10b981';
    case 'assigned': return '#3b82f6';
    case 'maintenance': return '#f59e0b';
    default: return '#6b7280';
  }
};

// Get condition color
export const getConditionColor = (condition) => {
  switch(condition) {
    case 'new': return '#10b981';
    case 'good': return '#3b82f6';
    case 'damaged': return '#ef4444';
    default: return '#6b7280';
  }
};

// Validate email
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Truncate text
export const truncateText = (text, length = 50) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

// Generate random color
export const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};