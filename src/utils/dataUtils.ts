export function formatDateToDDMMYYYY(isoDate: string): string {
  if (!isoDate) return "";
  const [yyyy, mm, dd] = isoDate.split("-");
  if (!yyyy || !mm || !dd) return "";
  return `${dd}/${mm}/${yyyy}`;
}