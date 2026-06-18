import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

export const useTimeAgo = (dateString) => {
  const [timeAgo, setTimeAgo] = useState(() =>
    dateString ? formatDistanceToNow(new Date(dateString), { addSuffix: true }) : ''
  );

  useEffect(() => {
    if (!dateString) return;

    setTimeAgo(formatDistanceToNow(new Date(dateString), { addSuffix: true }));

    const timer = setInterval(() => {
      setTimeAgo(formatDistanceToNow(new Date(dateString), { addSuffix: true }));
    }, 60000);

    return () => clearInterval(timer);
  }, [dateString]);

  return timeAgo;
};
