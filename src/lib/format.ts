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
