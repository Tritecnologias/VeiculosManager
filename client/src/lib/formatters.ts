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
export function formatBRCurrency(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return "0,00";
  
  return numValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).replace('R$', '').trim();
}

// Função para formatar valores monetários para exibição no formato brasileiro
export function formatBRCurrencyWithSymbol(value: number | string): string {
  // Se for string, converte para número primeiro
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.')) : value;
  
  // Se não for um número válido, retorna zero formatado
  if (isNaN(numericValue)) {
    return 'R$ 0,00';
  }
  
  // Retorna o valor formatado com símbolo
  return numericValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Função para converter valores monetários formatados em BR para strings
// que o backend aceita, mantendo como string para evitar problemas de precisão
export function parseBRCurrency(value: string): string {
  // Remove todos os caracteres que não são dígitos, vírgulas ou pontos
  const cleanValue = value.replace(/[^\d,\.]/g, '');
  
  // Se estiver com formato brasileiro (1.234,56), converte para formato API (1234.56)
  // Primeiro remove os pontos de milhar, depois troca vírgula decimal por ponto
  const formattedValue = cleanValue.replace(/\./g, '').replace(',', '.');
  
  // Retorna o valor como string
  return formattedValue || "0";
}
