import { useState, useCallback } from 'react';
import { format } from 'date-fns';

const useFilters = (initialState = {}) => {
  const [filters, setFilters] = useState(initialState);
  const [isDirty, setIsDirty] = useState(false);

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };
      // Check if it's actually different from initial state if needed, but for now just mark dirty
      return newFilters;
    });
    setIsDirty(true);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialState);
    setIsDirty(false);
  }, [initialState]);

  const getQueryParams = useCallback(() => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (!value) return;

      if (Array.isArray(value)) {
        if (value.length > 0) {
          params.append(key, value.join(','));
        }
      } else if (value instanceof Date) {
        params.append(key, format(value, "yyyy-MM-dd"));
      } else if (typeof value === 'object' && value !== null) {
        // Handle date range specifically if it matches the structure { from, to }
        if (value.from) {
          params.append(`${key}_after`, format(value.from, "yyyy-MM-dd"));
        }
        if (value.to) {
          params.append(`${key}_before`, format(value.to, "yyyy-MM-dd"));
        }
      } else {
        params.append(key, value);
      }
    });

    return params.toString();
  }, [filters]);

  return {
    filters,
    setFilter,
    resetFilters,
    getQueryParams,
    isDirty
  };
};

export default useFilters;
