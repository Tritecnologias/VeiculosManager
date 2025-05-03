import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type UserWithRole = {
  id: number;
  name: string;
  email: string;
  roleId: number;
  isActive: boolean;
  role?: {
    id: number;
    name: string;
    description?: string | null;
  };
};

type AuthContextType = {
  user: UserWithRole | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<UserWithRole, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<UserWithRole, Error, RegisterData>;
};

type LoginData = {
  email: string;
  password: string;
};

type RegisterData = {
  name: string;
  email: string;
  password: string;
  roleId: number;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<UserWithRole | null, Error>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/user");
        
        // Se não estiver autenticado, retornar null
        if (res.status === 401) {
          return null;
        }
        
        // Se a resposta não for OK, lançar erro
        if (!res.ok) {
          const errorText = await res.text();
          let errorMessage = "Erro ao obter dados do usuário";
          
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            errorMessage = errorText || errorMessage;
          }
          
          throw new Error(errorMessage);
        }
        
        // Processar a resposta
        const responseText = await res.text();
        
        if (!responseText) {
          return null;
        }
        
        try {
          return JSON.parse(responseText);
        } catch (e) {
          console.error("Erro ao analisar resposta JSON:", e);
          throw new Error("Erro ao processar resposta do servidor");
        }
      } catch (err) {
        console.error("Erro ao obter usuário:", err);
        return null;
      }
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      try {
        const res = await apiRequest("POST", "/api/login", credentials);
        
        // Verificar se a resposta foi bem sucedida
        if (!res.ok) {
          const errorText = await res.text();
          let errorMessage = "Falha na autenticação";
          
          try {
            // Tentar analisar o texto como JSON
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            // Se não for JSON, usar o texto diretamente ou mensagem padrão
            errorMessage = errorText || errorMessage;
          }
          
          throw new Error(errorMessage);
        }
        
        // Obter o texto da resposta
        const responseText = await res.text();
        
        // Se a resposta estiver vazia, retornar um objeto vazio
        if (!responseText) {
          return {};
        }
        
        // Tentar analisar a resposta como JSON
        try {
          return JSON.parse(responseText);
        } catch (e) {
          console.error("Erro ao analisar resposta JSON:", e);
          throw new Error("Erro ao processar resposta do servidor");
        }
      } catch (error) {
        console.error("Erro na autenticação:", error);
        throw error;
      }
    },
    onSuccess: (user: UserWithRole) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login realizado com sucesso",
        description: `Bem-vindo, ${user.name}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Falha no login",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      try {
        const res = await apiRequest("POST", "/api/register", data);
        
        if (!res.ok) {
          const errorText = await res.text();
          let errorMessage = "Falha no registro";
          
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            errorMessage = errorText || errorMessage;
          }
          
          throw new Error(errorMessage);
        }
        
        const responseText = await res.text();
        
        if (!responseText) {
          return {};
        }
        
        try {
          return JSON.parse(responseText);
        } catch (e) {
          console.error("Erro ao analisar resposta JSON:", e);
          throw new Error("Erro ao processar resposta do servidor");
        }
      } catch (error) {
        console.error("Erro no registro:", error);
        throw error;
      }
    },
    onSuccess: (user: UserWithRole) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registro realizado com sucesso",
        description: `Bem-vindo, ${user.name}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Falha no registro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        const res = await apiRequest("POST", "/api/logout");
        
        if (!res.ok) {
          const errorText = await res.text();
          let errorMessage = "Falha ao realizar logout";
          
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            errorMessage = errorText || errorMessage;
          }
          
          throw new Error(errorMessage);
        }
        
        return;
      } catch (error) {
        console.error("Erro no logout:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logout realizado com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Falha no logout",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}