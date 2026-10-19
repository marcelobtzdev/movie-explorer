export const formatCardFooter = (releaseYear: number | null, genreNames: readonly string[]): string => {
  const yearLabel = releaseYear === null ? '–' : String(releaseYear);

  if (genreNames.length === 0) {
    return yearLabel;
  }

  return `${yearLabel} • ${genreNames.join(' / ')}`;
};
