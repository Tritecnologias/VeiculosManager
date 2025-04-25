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

// Função para formatar valores monetários no formato brasileiro
export function formatBRCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Função para converter valores monetários formatados em BR para strings
// que o backend aceita, mantendo como string para evitar problemas de precisão
export function parseBRCurrency(value: string): string {
  // Remove todos os caracteres que não são dígitos ou vírgula
  const cleanValue = value.replace(/[^\d,]/g, '');
  
  // Substitui vírgula por ponto para formato de API
  const formattedValue = cleanValue.replace(',', '.');
  
  // Retorna o valor como string
  return formattedValue || "0";
}
