import { Link, useLocation } from "wouter";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut, User, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/use-auth";
import { hasPermission } from "@/lib/permissions";
import { useEffect, useState } from "react";

export default function Header() {
  const [location] = useLocation();
  const isMobile = useMobile();
  const { user, logoutMutation } = useAuth();
  
  // Buscar todas as configurações
  const { data: settings = [] } = useQuery<Array<{key: string, value: string}>>({
    queryKey: ["/api/settings"],
  });
  
  // Encontrar configurações da empresa
  const companyName = settings.find(setting => setting.key === "company_name")?.value || "Auto+";
  const companyLogoUrl = settings.find(setting => setting.key === "company_logo_url")?.value;
  
  // Estrutura de menu dinâmica baseada em permissões
  const menuItems = [
    { path: "/", label: "INÍCIO", permission: "Dashboard" },
    { path: "/vehicles", label: "VEÍCULOS", permission: "Visualizar veículos" },
    { path: "/configurator", label: "CONFIGURADOR", permission: "Configurador de veículos" },
    { path: "/brands", label: "MARCAS", permission: "Visualizar marcas" },
    { path: "/models", label: "MODELOS", permission: "Visualizar modelos" },
    { path: "/versions", label: "VERSÕES", permission: "Visualizar versões" }
  ];
  
  // Filtrar os itens do menu com base nas permissões do usuário
  const [filteredMenuItems, setFilteredMenuItems] = useState<Array<{path: string, label: string}>>([]);
  
  // Atualizar os menus quando o usuário mudar
  useEffect(() => {
    if (user) {
      const filtered = menuItems.filter(item => 
        hasPermission(item.path, user?.role?.name)
      );
      setFilteredMenuItems(filtered);
    } else {
      setFilteredMenuItems([]);
    }
  }, [user]);
  
  // Função para realizar logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <header className="bg-white shadow">
      <div className="flex justify-between items-center px-4 py-2">
        <div className="flex items-center">
          <div className="text-primary flex items-center">
            {companyLogoUrl ? (
              <img src={companyLogoUrl} alt="Logo" className="h-8 w-auto" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
            )}
            <span className="ml-2 text-xl font-semibold text-primary">
              {isMobile ? companyName.substring(0, 12) + (companyName.length > 12 ? '...' : '') : companyName}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {!isMobile && user && (
            <span className="text-sm text-gray-600">
              Olá {user.name} ({user.id}), 
              {user.lastLogin 
                ? ` seu último acesso foi em ${new Date(user.lastLogin).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}h` 
                : " bem-vindo ao sistema"
              }
            </span>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-800">
              <span>{isMobile ? "Conta" : "Meus dados"}</span>
              <ChevronDown className="ml-1 h-5 w-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link href="/user/profile">
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/user/profile?tab=password">
                <DropdownMenuItem className="cursor-pointer">
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Alterar senha</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem className="cursor-pointer text-red-600" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
                {logoutMutation.isPending && (
                  <span className="ml-2 animate-spin">⋯</span>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <nav className="bg-primary">
        <div className="max-w-full mx-auto px-4">
          {!isMobile && (
            <div className="flex">
              <div className="flex space-x-1">
                {/* Renderizar apenas os links que o usuário tem permissão */}
                {filteredMenuItems.map((item, index) => (
                  <Link 
                    key={index} 
                    href={item.path} 
                    className={`nav-link ${location.startsWith(item.path) || 
                      (item.path !== '/' && location === item.path) ? 'active' : ''}`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
