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
  // Buscar configurações da aplicação
  const { data: settings = [] } = useQuery<Setting[]>({
    queryKey: ["/api/settings"],
  });

  useEffect(() => {
    // Encontrar as configurações de nome da aplicação e favicon
    const appName = settings.find(s => s.key === "app_name")?.value;
    const appFavicon = settings.find(s => s.key === "app_favicon")?.value;

    // Atualizar o título da página se o nome da aplicação estiver definido
    if (appName) {
      document.title = appName;
    }

    // Atualizar o favicon se estiver definido
    if (appFavicon) {
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