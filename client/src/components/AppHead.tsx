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

  // Remover completamente qualquer texto "Auto+" que possa ter sido definido
  useEffect(() => {
    // Forçar a remoção de qualquer referência ao "Auto+"
    if (document.title.includes("Auto+")) {
      document.title = "Cota Zero KM";
    }
  }, []);

  useEffect(() => {
    if (settings.length === 0) return; // Não faz nada se as configurações não foram carregadas

    // Encontrar as configurações de nome da aplicação e favicon
    const appName = settings.find(s => s.key === "app_name")?.value;
    const appFavicon = settings.find(s => s.key === "app_favicon")?.value;
    const companyName = settings.find(s => s.key === "company_name")?.value;

    // Salvar o nome da aplicação no localStorage para uso durante o carregamento da página
    if (appName && appName.trim() !== "") {
      localStorage.setItem('app_name', appName);
      // Garantir que o título seja atualizado
      document.title = appName;
    } else if (companyName && companyName.trim() !== "") {
      localStorage.setItem('app_name', companyName);
      document.title = companyName;
    } else {
      // Se não tiver nome da aplicação nem da empresa, usar um nome padrão
      document.title = "Cota Zero KM";
    }

    // Atualizar o favicon se estiver definido
    if (appFavicon && appFavicon.trim() !== "") {
      // Armazenar o favicon no localStorage
      localStorage.setItem('app_favicon', appFavicon);
      
      try {
        // Procurar por links de favicon existentes
        const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
        
        // Remover favicons existentes
        existingFavicons.forEach(favicon => {
          favicon.remove();
        });

        // Criar um novo link para o favicon
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/x-icon';
        link.href = appFavicon;
        
        // Adicionar o link ao <head>
        document.head.appendChild(link);
      } catch (error) {
        console.error("Erro ao atualizar o favicon:", error);
      }
    }
  }, [settings]);

  // Executar periodicamente para garantir que o título esteja correto
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.title.includes("Auto+")) {
        const savedName = localStorage.getItem('app_name');
        if (savedName) {
          document.title = savedName;
        } else {
          document.title = "Cota Zero KM";
        }
      }
    }, 500);
    
    return () => clearInterval(interval);
  }, []);

  // Este componente não renderiza nada visível
  return null;
}