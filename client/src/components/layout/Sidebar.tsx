import { Link, useLocation } from "wouter";
import { Home, Car, Building, FileText, Palette, Settings, ListPlus, Menu, X, LogOut, User, Users, Shield } from "lucide-react";
import { useState } from "react";
import { useMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Componente para exibir o perfil do usuário logado
const UserProfile = () => {
  const { user, logoutMutation } = useAuth();
  
  if (!user) return null;
  
  // Obter as iniciais do nome para o avatar
  const getInitials = (name: string) => {
    return name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const userInitials = getInitials(user.name);
  
  return (
    <div className="mb-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center w-full justify-start p-2 hover:bg-gray-100 rounded-lg">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarFallback className="bg-primary text-white">{userInitials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium truncate max-w-[140px]">{user.name}</span>
              <span className="text-xs text-gray-500">{user.role?.name || "Usuário"}</span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Meus Dados</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <Link href="/user/profile">
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
          </Link>
          <Link href="/user/profile?tab=password">
            <DropdownMenuItem className="cursor-pointer">
              <FileText className="mr-2 h-4 w-4" />
              <span>Alterar Senha</span>
            </DropdownMenuItem>
          </Link>
          <Link href="/admin/permissions">
            <DropdownMenuItem className="cursor-pointer">
              <Shield className="mr-2 h-4 w-4" />
              <span>Permissões de Acesso</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator />
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
  );
};

export default function Sidebar() {
  const [location] = useLocation();
  const isMobile = useMobile();
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  
  const MenuItems = () => (
    <ul className="space-y-1">
      <li>
        <Link href="/" className={`sidebar-item ${location === '/' ? 'active' : ''}`}>
          <Home className="h-5 w-5 mr-2" />
          Dashboard
        </Link>
      </li>
      <li>
        <Link href="/vehicles" className={`sidebar-item ${location.startsWith('/vehicles') ? 'active' : ''}`}>
          <Car className="h-5 w-5 mr-2" />
          Veículos
        </Link>
      </li>
      <li>
        <Link href="/brands" className={`sidebar-item ${location.startsWith('/brands') ? 'active' : ''}`}>
          <Building className="h-5 w-5 mr-2" />
          Marcas
        </Link>
      </li>
      <li>
        <Link href="/models" className={`sidebar-item ${location.startsWith('/models') ? 'active' : ''}`}>
          <FileText className="h-5 w-5 mr-2" />
          Modelos
        </Link>
      </li>
      <li>
        <Link href="/versions" className={`sidebar-item ${location.startsWith('/versions') ? 'active' : ''}`}>
          <FileText className="h-5 w-5 mr-2" />
          Versões
        </Link>
      </li>
      <li>
        <Link href="/colors" className={`sidebar-item ${location.startsWith('/colors') ? 'active' : ''}`}>
          <Palette className="h-5 w-5 mr-2" />
          Cores/Pinturas
        </Link>
      </li>
      <li>
        <Link href="/paint-types" className={`sidebar-item ${location.startsWith('/paint-types') ? 'active' : ''}`}>
          <Palette className="h-5 w-5 mr-2" />
          Tipos de Pintura
        </Link>
      </li>
      <li>
        <Link href="/optionals" className={`sidebar-item ${location.startsWith('/optionals') ? 'active' : ''}`}>
          <ListPlus className="h-5 w-5 mr-2" />
          Opcionais
        </Link>
      </li>
      <li>
        <Link href="/configurator" className={`sidebar-item ${location.startsWith('/configurator') ? 'active' : ''}`}>
          <Car className="h-5 w-5 mr-2" />
          Configurador
        </Link>
      </li>
      <li>
        <Link href="/settings" className={`sidebar-item ${location.startsWith('/settings') ? 'active' : ''}`}>
          <Settings className="h-5 w-5 mr-2" />
          Configurações
        </Link>
      </li>
      
      {/* Link para gerenciamento de usuários - apenas para administradores */}
      {user?.role?.name === "Administrador" && (
        <li>
          <Link href="/admin/users" className={`sidebar-item ${location.startsWith('/admin/users') ? 'active' : ''}`}>
            <Users className="h-5 w-5 mr-2" />
            Usuários
          </Link>
        </li>
      )}
      
      {/* Link para visualização de permissões - acessível a todos os usuários */}
      <li>
        <Link href="/admin/permissions" className={`sidebar-item ${location.startsWith('/admin/permissions') ? 'active' : ''}`}>
          <Shield className="h-5 w-5 mr-2" />
          Permissões
        </Link>
      </li>
    </ul>
  );

  if (isMobile) {
    return (
      <div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="p-2 fixed top-16 left-4 z-40 bg-white rounded-md shadow-md">
              <Menu className="h-6 w-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Administração</h2>
                <button onClick={() => setOpen(false)} className="p-1">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Perfil do usuário */}
              {user && <UserProfile />}
              
              <nav>
                <MenuItems />
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  return (
    <aside className="w-64 bg-white shadow-md min-h-screen">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Administração</h2>
        
        {/* Perfil do usuário */}
        {user && <UserProfile />}
        
        <nav>
          <MenuItems />
        </nav>
      </div>
    </aside>
  );
}