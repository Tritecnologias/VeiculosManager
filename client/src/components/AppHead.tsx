import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

type Setting = {
  id: number;
  key: string;
  value: string;
  label: string;
  type: string;
  createdAt: string;
  updatedAt: string;
};

export function AppHead() {
  // Buscar configurações da aplicação com prioridade máxima
  const { data: settings = [] } = useQuery<Setting[]>({
    queryKey: ["/api/settings"],
    staleTime: 60 * 1000, // 1 minuto antes de considerar os dados obsoletos
    refetchOnWindowFocus: true, // Recarregar quando a janela ganhar foco
  });

  useEffect(() => {
    // Inicialização - remove título padrão imediatamente, antes mesmo da consulta terminar
    if (document.title === "Auto+" || document.title === "Configurando...") {
      // Se ainda tiver o título padrão, defina um título temporário até que as configurações sejam carregadas
      const companyName = localStorage.getItem('company_name');
      if (companyName) {
        document.title = companyName; // Usa o nome da empresa como fallback temporário
      }
    }
  }, []);

  useEffect(() => {
    if (settings.length === 0) return; // Não faz nada se as configurações não foram carregadas

    // Encontrar as configurações de nome da aplicação e favicon
    const appName = settings.find(s => s.key === "app_name")?.value;
    const appFavicon = settings.find(s => s.key === "app_favicon")?.value;
    const companyName = settings.find(s => s.key === "company_name")?.value;

    // Armazenar o nome da empresa no localStorage para uso futuro como fallback
    if (companyName) {
      localStorage.setItem('company_name', companyName);
    }

    // Atualizar o título da página de acordo com a ordem de prioridade:
    // 1. Nome da aplicação configurado
    // 2. Nome da empresa
    // 3. Manter o título atual se os dois acima estiverem vazios
    if (appName && appName.trim() !== "") {
      document.title = appName;
    } else if (companyName && companyName.trim() !== "") {
      document.title = companyName;
    }

    // Atualizar o favicon se estiver definido
    if (appFavicon && appFavicon.trim() !== "") {
      // Procurar por links de favicon existentes
      const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
      
      // Remover favicons existentes
      existingFavicons.forEach(favicon => {
        document.head.removeChild(favicon);
      });

      // Criar um novo link para o favicon
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/x-icon';
      link.href = appFavicon;
      
      // Adicionar o link ao <head>
      document.head.appendChild(link);
    }
  }, [settings]);

  // Este componente não renderiza nada visível
  return null;
}