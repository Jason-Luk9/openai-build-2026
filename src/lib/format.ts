const singaporeLocale = 'en-SG';

export function formatMoney(value: number) {
  return new Intl.NumberFormat(singaporeLocale, {
    style: 'currency',
    currency: 'SGD',
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat(singaporeLocale, {
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatWeek(week: number) {
  return `Week ${formatNumber(week)}`;
}

export function formatVerifiedDate(iso: string) {
  const [year, month] = iso.split('-').map(Number);
  if (!year || !month) return iso;

  return new Intl.DateTimeFormat(singaporeLocale, {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}
