const SPANISH_MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
] as const;

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

// Builds the Spanish long form ("1 de marzo de 2024") without relying on the device locale.
export const formatReleaseDate = (isoDate: string | null): string | null => {
  if (!isoDate) {
    return null;
  }

  const match = ISO_DATE_PATTERN.exec(isoDate);
  if (!match) {
    return null;
  }

  const [, year, month, day] = match;
  const monthName = SPANISH_MONTHS[Number(month) - 1];
  if (!monthName) {
    return null;
  }

  return `${Number(day)} de ${monthName} de ${year}`;
};
