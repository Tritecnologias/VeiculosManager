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
  // Se for string vazia ou undefined/null, retorna "0,00"
  if (value === undefined || value === null || (typeof value === 'string' && !value.trim())) {
    return "0,00";
  }
  
  // Se for string, tenta converter para número
  const numValue = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
  
  // Se não for um número válido, retorna "0,00"
  if (isNaN(numValue)) return "0,00";
  
  // Formata o número no padrão brasileiro
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
  if (!value || value.trim() === '') {
    return "0";
  }
  
  try {
    // Remove símbolos de moeda e espaços
    let cleanValue = value.replace(/[R$\s]/g, '');
    
    // Verifica se o valor está no formato brasileiro (1.234,56)
    if (cleanValue.includes(',')) {
      // Primeiro remove os pontos de milhar, depois troca vírgula decimal por ponto
      cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
    }
    
    // Converte para número e então para string para ter certeza de um formato válido
    const numValue = parseFloat(cleanValue);
    
    // Se for um número válido, retorna com 2 casas decimais
    if (!isNaN(numValue)) {
      return numValue.toFixed(2);
    }
    
    // Se chegou aqui, algo deu errado na conversão
    console.warn("Falha ao converter valor:", value);
    return "0";
  } catch (error) {
    console.error("Erro ao processar valor monetário:", error);
    return "0";
  }
}
