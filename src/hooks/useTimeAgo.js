import { useState, useEffect } from 'react';

const calculateTimeAgo = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  // Prevent future dates or invalid dates from breaking logic
  if (isNaN(date.getTime()) || seconds < 0) return 'Just now';

  const minute = 60;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;
  const year = 365 * day;

  let interval = Math.floor(seconds / year);
  if (interval >= 1) {
    return `${interval} year${interval > 1 ? 's' : ''} ago`;
  }

  interval = Math.floor(seconds / month);
  if (interval >= 1) {
    return `${interval} month${interval > 1 ? 's' : ''} ago`;
  }

  interval = Math.floor(seconds / day);
  if (interval >= 1) {
    return `${interval} day${interval > 1 ? 's' : ''} ago`;
  }

  interval = Math.floor(seconds / hour);
  if (interval >= 1) {
    return `${interval} hour${interval > 1 ? 's' : ''} ago`;
  }

  interval = Math.floor(seconds / minute);
  if (interval >= 1) {
    return `${interval} min${interval > 1 ? 's' : ''} ago`;
  }

  return 'Just now';
};

export const useTimeAgo = (dateString) => {
  const [timeAgo, setTimeAgo] = useState(() => calculateTimeAgo(dateString));
  const [prevDateString, setPrevDateString] = useState(dateString);

  if (dateString !== prevDateString) {
    setPrevDateString(dateString);
    setTimeAgo(calculateTimeAgo(dateString));
  }

  useEffect(() => {
    // Update every minute
    const timer = setInterval(() => {
      setTimeAgo(calculateTimeAgo(dateString));
    }, 60000);

    return () => clearInterval(timer);
  }, [dateString]);

  return timeAgo;
};