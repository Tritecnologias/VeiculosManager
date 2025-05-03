import React, { useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient, apiRequest } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import AdminLayout from "@/components/layout/AdminLayout";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { AppHead } from "@/components/AppHead";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { setCustomPermissions } from "@/lib/permissions";

// Pages
import Dashboard from "@/pages/dashboard/Dashboard";
import BrandList from "@/pages/brands/BrandList";
import BrandForm from "@/pages/brands/BrandForm";
import ModelList from "@/pages/models/ModelList";
import ModelForm from "@/pages/models/ModelForm";
import VersionList from "@/pages/versions/VersionList";
import VersionForm from "@/pages/versions/VersionForm";
import ColorTabs from "@/pages/colors/ColorTabs";
import ColorList from "@/pages/colors/ColorList";
import ColorForm from "@/pages/colors/ColorForm";
import VehicleList from "@/pages/vehicles/VehicleList";
import VehicleForm from "@/pages/vehicles/VehicleFormFixed";
import PaintTypeList from "@/pages/paint-types/PaintTypeList";
import PaintTypeForm from "@/pages/paint-types/PaintTypeForm";
import OptionalTabs from "@/pages/optionals/OptionalTabs";
import OptionalForm from "@/pages/optionals/OptionalForm";
import DirectSaleForm from "./pages/direct-sales/DirectSaleForm";
import Configurator from "@/pages/configurator";
import Settings from "@/pages/settings/Settings";
import ProfilePage from "@/pages/user/profile";
import UserManagement from "@/pages/admin/UserManagement";
import AccessPermissions from "@/pages/admin/AccessPermissions";
import PermissionSettings from "@/pages/admin/PermissionSettings";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";

function Router() {
  return (
    <Switch>
      {/* Rota de autenticação - acessível a todos */}
      <Route path="/auth" component={AuthPage} />
      
      {/* Rotas protegidas - só podem ser acessadas por usuários autenticados */}
      <ProtectedRoute path="/" component={Dashboard} />
      
      {/* Lista de marcas e configurador - acessível por todos os usuários autenticados */}
      <ProtectedRoute path="/brands" component={BrandList} />
      <ProtectedRoute path="/configurator" component={Configurator} />
      
      {/* Funcionalidades de cadastro - requer papel de Cadastrador ou Admin */}
      <ProtectedRoute path="/brands/new" component={BrandForm} requiredRole="Cadastrador" />
      <ProtectedRoute path="/brands/:id/edit" component={BrandForm} requiredRole="Cadastrador" />
      <ProtectedRoute path="/models" component={ModelList} />
      <ProtectedRoute path="/models/new" component={ModelForm} requiredRole="Cadastrador" />
      <ProtectedRoute path="/models/:id/edit" component={ModelForm} requiredRole="Cadastrador" />
      <ProtectedRoute path="/versions" component={VersionList} />
      <ProtectedRoute path="/versions/new" component={VersionForm} requiredRole="Cadastrador" />
      <ProtectedRoute path="/versions/:id/edit" component={VersionForm} requiredRole="Cadastrador" />
      <ProtectedRoute path="/colors" component={ColorTabs} />
      <ProtectedRoute path="/paint-types" component={PaintTypeList} />
      <ProtectedRoute path="/paint-types/new" component={PaintTypeForm} requiredRole="Cadastrador" />
      <ProtectedRoute path="/paint-types/:id/edit" component={PaintTypeForm} requiredRole="Cadastrador" />
      <ProtectedRoute path="/optionals" component={OptionalTabs} />
      <ProtectedRoute path="/optionals/new" component={OptionalForm} requiredRole="Cadastrador" />
      <ProtectedRoute path="/optionals/:id/edit" component={OptionalForm} requiredRole="Cadastrador" />
      <ProtectedRoute path="/vehicles" component={VehicleList} />
      <ProtectedRoute path="/vehicles/new" component={VehicleForm} requiredRole="Cadastrador" />
      <ProtectedRoute path="/vehicles/:id/edit" component={VehicleForm} requiredRole="Cadastrador" />
      
      {/* Direct sales routes */}
      <ProtectedRoute path="/direct-sales/new" component={DirectSaleForm} requiredRole="Cadastrador" />
      <ProtectedRoute path="/direct-sales/edit/:id" component={DirectSaleForm} requiredRole="Cadastrador" />
      
      {/* Configurações - acessível apenas para Administradores */}
      <ProtectedRoute path="/settings" component={Settings} requiredRole="Administrador" />
      
      {/* Gerenciamento de usuários - acessível apenas para Administradores */}
      <ProtectedRoute path="/admin/users" component={UserManagement} requiredRole="Administrador" />
      <ProtectedRoute path="/admin/permissions" component={AccessPermissions} />
      <ProtectedRoute path="/admin/permission-settings" component={PermissionSettings} requiredRole="Administrador" />

      {/* Perfil de usuário - acessível por todos os usuários autenticados */}
      <ProtectedRoute path="/user/profile" component={ProfilePage} />
      
      {/* Rota para página não encontrada */}
      <Route component={NotFound} />
    </Switch>
  );
}

// Componente para envolver as rotas protegidas no layout de administração
function ProtectedContent() {
  const { user } = useAuth();
  
  // Carregar as permissões personalizadas
  const { data: customPermissions } = useQuery({
    queryKey: ['/api/permissions'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/permissions');
        return await response.json();
      } catch (error) {
        console.error('Erro ao carregar permissões:', error);
        return {};
      }
    },
    // Só carregar se o usuário estiver autenticado
    enabled: !!user,
    // Não precisa recarregar com frequência
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
  
  // Configurar as permissões personalizadas quando carregadas
  useEffect(() => {
    if (customPermissions) {
      setCustomPermissions(customPermissions);
    }
  }, [customPermissions]);
  
  return (
    <AdminLayout>
      <Router />
    </AdminLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SidebarProvider>
          {/* Componente para gerenciar o título e favicon da aplicação */}
          <AppHead />
          <ProtectedContent />
          <Toaster />
        </SidebarProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
