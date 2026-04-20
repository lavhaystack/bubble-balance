export const phpCurrencyFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPhpCurrency(value: number) {
  return phpCurrencyFormatter.format(value);
}

export function normalizePriceInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const parsed = Number(trimmed);
  if (Number.isNaN(parsed)) {
    return value;
  }

  return parsed.toFixed(2);
}
