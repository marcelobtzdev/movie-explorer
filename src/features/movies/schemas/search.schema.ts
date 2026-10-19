import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MOVIES_STRINGS } from '../constants/strings';

export const SEARCH_MAX_LENGTH = 100;

export const SearchSchema = z.object({
  query: z.string().trim().max(SEARCH_MAX_LENGTH, MOVIES_STRINGS.searchMaxLengthMessage),
});

export type SearchFormData = z.infer<typeof SearchSchema>;

export const resolver = zodResolver(SearchSchema);

export const SearchFormDefaults: SearchFormData = { query: '' };
