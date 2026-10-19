export const moviesKeys = {
  all: ['movies'] as const,
  popular: () => [...moviesKeys.all, 'popular'] as const,
  search: (term: string) => [...moviesKeys.all, 'search', term] as const,
};
