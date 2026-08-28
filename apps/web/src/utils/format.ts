const moneyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
});

export function formatMoney(value: number): string {
  return moneyFormatter.format(value);
}

export function formatPriceWithUnit(
  precio: number,
  simbolo: string | null | undefined
): string {
  const price = formatMoney(precio);
  return simbolo ? `${price} / ${simbolo}` : price;
}
