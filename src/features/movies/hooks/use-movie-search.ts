import { SEARCH_DEBOUNCE_MS } from '@/src/constants/list';
import { useDebouncedValue } from '@/src/hooks/use-debounced-value';
import { useCallback, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { resolver, SearchFormDefaults, type SearchFormData } from '../schemas/search.schema';
import { useMoviesStore } from '../stores/movies-store';

// The typed text is debounced; only the trimmed committed term is stored and feeds the list query.
export const useMovieSearch = () => {
  const setSearchTerm = useMoviesStore((state) => state.setSearchTerm);
  const { control, setValue } = useForm<SearchFormData>({ defaultValues: SearchFormDefaults, resolver });
  const query = useWatch({ control, name: 'query' });
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);

  // Runs on mount too, so a remounted screen starts from the empty form and an empty committed term.
  useEffect(() => {
    setSearchTerm(debouncedQuery.trim());
  }, [debouncedQuery, setSearchTerm]);

  // Clearing does not wait for the debounce pause.
  const clear = useCallback(() => {
    setValue('query', '');
    setSearchTerm('');
  }, [setSearchTerm, setValue]);

  return { clear, control };
};
