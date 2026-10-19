export const getGenreNames = (
  genreIds: readonly number[],
  lookup: ReadonlyMap<number, string>,
  limit?: number,
): readonly string[] => {
  const names = genreIds.map((id) => lookup.get(id)).filter((name): name is string => name !== undefined);

  return limit === undefined ? names : names.slice(0, limit);
};
