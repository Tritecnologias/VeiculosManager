export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  }).format(value);
}

export function parseCurrency(value: string): number {
  // Remove currency symbol, thousand separators, and convert comma to dot
  const numericValue = value
    .replace(/[^\d,]/g, '')
    .replace(',', '.');
  
  return parseFloat(numericValue) || 0;
}
