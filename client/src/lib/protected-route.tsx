import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, RouteComponentProps } from "wouter";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType<any>;
  requiredRole?: "Administrador" | "Cadastrador";
}

// Componente de acesso negado
const AccessDenied = () => (
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
);

// Componente de carregamento
const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-border" />
  </div>
);

export function ProtectedRoute({
  path,
  component: Component,
  requiredRole
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  return (
    <Route path={path}>
      {(params) => {
        // Enquanto carrega o usuário, mostrar um indicador de carregamento
        if (isLoading) {
          return <Loading />;
        }

        // Se o usuário não estiver autenticado, redirecionar para a página de login
        if (!user) {
          return <Redirect to="/auth" />;
        }

        // Verificar as permissões baseadas em papéis
        if (requiredRole) {
          // Se for Administrador, tem acesso a tudo
          if (user.role?.name === "Administrador") {
            return <Component {...params} />;
          }
          
          // Se for Cadastrador e a rota requer Cadastrador, permitir acesso
          if (user.role?.name === "Cadastrador" && requiredRole === "Cadastrador") {
            return <Component {...params} />;
          }
          
          // Em outros casos, quando a função requer papel específico, negar acesso
          return <AccessDenied />;
        }

        // Se chegou aqui, o usuário está autenticado e não há requisito de papel ou tem o papel adequado
        return <Component {...params} />;
      }}
    </Route>
  );
}