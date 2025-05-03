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
  }

  return fetch(url, options);
}

// Função auxiliar para obter dados de uma API com suporte para comportamento em 401
export function getQueryFn({
  on401 = "throw",
}: {
  on401?: "throw" | "returnNull";
} = {}) {
  return async ({ queryKey }: { queryKey: string[] }) => {
    const url = queryKey[0];
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