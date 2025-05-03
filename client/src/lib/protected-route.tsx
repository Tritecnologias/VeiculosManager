import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
  requiredRole?: "Administrador" | "Cadastrador";
}

export function ProtectedRoute({
  path,
  component: Component,
  requiredRole
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Verificar se o usuário tem o papel necessário para acessar a rota
  if (requiredRole && user.role?.name !== requiredRole) {
    // Se um papel específico for necessário e o usuário não tiver esse papel
    // Permitir acesso se o usuário for administrador (sempre tem acesso total)
    if (requiredRole === "Cadastrador" && user.role?.name === "Administrador") {
      return <Route path={path} component={Component} />;
    }
    
    // Redirecionar para acesso negado
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
          <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-primary text-white rounded-md"
          >
            Voltar
          </button>
        </div>
      </Route>
    );
  }

  // Se chegou aqui, o usuário está autenticado e tem permissão
  return <Route path={path} component={Component} />;
}