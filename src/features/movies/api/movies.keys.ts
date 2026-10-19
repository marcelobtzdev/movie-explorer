export const moviesKeys = {
  all: ['movies'] as const,
  popular: () => [...moviesKeys.all, 'popular'] as const,
};
