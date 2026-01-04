import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Debounces a value, only updating after the specified delay
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Returns a debounced version of the callback function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * Debounced search hook with loading state
 */
export function useDebouncedSearch(
  searchFn: (query: string) => Promise<void>,
  delay: number = 300
) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const debouncedQuery = useDebounce(query, delay);

  useEffect(() => {
    if (debouncedQuery !== undefined) {
      setIsSearching(true);
      searchFn(debouncedQuery).finally(() => {
        setIsSearching(false);
      });
    }
  }, [debouncedQuery, searchFn]);

  return {
    query,
    setQuery,
    isSearching,
    debouncedQuery
  };
}
