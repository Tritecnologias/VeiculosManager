import { Link, useLocation } from "wouter";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Header() {
  const [location] = useLocation();
  
  // Buscar o nome da empresa nas configurações
  const { data: settings = [] } = useQuery({
    queryKey: ["/api/settings"],
  });
  
  // Encontrar a configuração de nome da empresa
  const companyName = settings.find((setting: any) => setting.key === "company_name")?.value || "Vendas Corporativas";
  
  return (
    <header className="bg-white shadow">
      <div className="flex justify-between items-center px-4 py-2">
        <div className="flex items-center">
          <div className="text-primary flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
            <span className="ml-2 text-xl font-semibold text-primary">{companyName}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Olá Rodrigo (9640-59), seu último acesso foi em 25/02/2025 18:06h</span>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-800">
              <span>Meus dados</span>
              <ChevronDown className="ml-1 h-5 w-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Perfil</DropdownMenuItem>
              <DropdownMenuItem>Alterar senha</DropdownMenuItem>
              <DropdownMenuItem>Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <nav className="bg-primary">
        <div className="max-w-full mx-auto px-4">
          <div className="flex">
            <div className="flex space-x-1">
              <Link href="/" className={`nav-link ${location === '/' ? 'active' : ''}`}>
                INÍCIO
              </Link>
              <Link href="/vehicles" className={`nav-link ${location.startsWith('/vehicles') ? 'active' : ''}`}>
                CONFIGURADOR
              </Link>
              <Link href="/exemptions" className={`nav-link ${location.startsWith('/exemptions') ? 'active' : ''}`}>
                ISENÇÕES
              </Link>
              <Link href="/quotes" className={`nav-link ${location.startsWith('/quotes') ? 'active' : ''}`}>
                COTAÇÕES
              </Link>
              <Link href="/clients" className={`nav-link ${location.startsWith('/clients') ? 'active' : ''}`}>
                CLIENTES
              </Link>
              <Link href="/support" className={`nav-link ${location.startsWith('/support') ? 'active' : ''}`}>
                SUPORTE
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
