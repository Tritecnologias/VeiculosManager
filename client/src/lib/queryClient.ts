import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function apiRequest(
  method: Method,
  url: string,
  data?: unknown
): Promise<Response> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  const options: RequestInit = {
    method,
    headers,
    credentials: "include",
  };

  if (data) {
    options.body = JSON.stringify(data);
    console.log(`[API ${method}] ${url}`, data);
  } else {
    console.log(`[API ${method}] ${url}`);
  }

  try {
    const response = await fetch(url, options);
    
    // Logar resultado básico
    console.log(`[API Response] ${url} - Status: ${response.status}`);
    
    return response;
  } catch (error) {
    console.error(`[API Error] ${url}:`, error);
    throw error;
  }
}

// Função auxiliar para obter dados de uma API com suporte para comportamento em 401
export function getQueryFn({
  on401 = "throw",
  queryKey = [],
  params = {},
}: {
  on401?: "throw" | "returnNull";
  queryKey?: string[];
  params?: Record<string, any>;
} = {}) {
  return async ({ queryKey: reactQueryKey }: { queryKey: string[] }) => {
    // Se temos uma override de queryKey, use-a, caso contrário, use a fornecida pelo React Query
    const baseUrl = queryKey.length > 0 ? queryKey[0] : reactQueryKey[0];
    
    // Construir URL com parâmetros de consulta
    let url = baseUrl;
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      }
      const queryString = searchParams.toString();
      if (queryString) {
        url = `${baseUrl}?${queryString}`;
      }
    }
    
    console.log(`Fazendo requisição para: ${url}`);
    
    const response = await apiRequest("GET", url);

    if (response.status === 401) {
      if (on401 === "returnNull") {
        return null;
      }
      throw new Error("Não autenticado");
    }

    if (!response.ok) {
      throw new Error(`Erro ao obter dados: ${response.statusText}`);
    }

    return response.json();
  };
}