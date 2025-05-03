// Tipos de papéis de usuário disponíveis no sistema
export type UserRole = "Administrador" | "Cadastrador" | "Usuário";

// Interface para mapear as permissões de cada rota
export interface RoutePermission {
  path: string;
  allowedRoles: UserRole[];
  description: string; // Descrição do que a rota permite fazer
}

// Matriz de permissões para todas as rotas do sistema
export const ROUTE_PERMISSIONS: RoutePermission[] = [
  // Rotas acessíveis a todos os usuários autenticados
  { path: "/", allowedRoles: ["Administrador", "Cadastrador", "Usuário"], description: "Dashboard" },
  { path: "/configurator", allowedRoles: ["Administrador", "Cadastrador", "Usuário"], description: "Configurador de veículos" },
  { path: "/user/profile", allowedRoles: ["Administrador", "Cadastrador", "Usuário"], description: "Perfil de usuário" },
  
  // Rotas de visualização (somente leitura) - acessíveis a todos os usuários autenticados
  { path: "/brands", allowedRoles: ["Administrador", "Cadastrador", "Usuário"], description: "Visualizar marcas" },
  { path: "/models", allowedRoles: ["Administrador", "Cadastrador", "Usuário"], description: "Visualizar modelos" },
  { path: "/versions", allowedRoles: ["Administrador", "Cadastrador", "Usuário"], description: "Visualizar versões" },
  { path: "/colors", allowedRoles: ["Administrador", "Cadastrador", "Usuário"], description: "Visualizar cores/pinturas" },
  { path: "/paint-types", allowedRoles: ["Administrador", "Cadastrador", "Usuário"], description: "Visualizar tipos de pintura" },
  { path: "/optionals", allowedRoles: ["Administrador", "Cadastrador", "Usuário"], description: "Visualizar opcionais" },
  { path: "/vehicles", allowedRoles: ["Administrador", "Cadastrador", "Usuário"], description: "Visualizar veículos" },
  
  // Rotas de cadastro - acessíveis a Cadastradores e Administradores
  { path: "/brands/new", allowedRoles: ["Administrador", "Cadastrador"], description: "Cadastrar novas marcas" },
  { path: "/brands/:id/edit", allowedRoles: ["Administrador", "Cadastrador"], description: "Editar marcas existentes" },
  { path: "/models/new", allowedRoles: ["Administrador", "Cadastrador"], description: "Cadastrar novos modelos" },
  { path: "/models/:id/edit", allowedRoles: ["Administrador", "Cadastrador"], description: "Editar modelos existentes" },
  { path: "/versions/new", allowedRoles: ["Administrador", "Cadastrador"], description: "Cadastrar novas versões" },
  { path: "/versions/:id/edit", allowedRoles: ["Administrador", "Cadastrador"], description: "Editar versões existentes" },
  { path: "/paint-types/new", allowedRoles: ["Administrador", "Cadastrador"], description: "Cadastrar novos tipos de pintura" },
  { path: "/paint-types/:id/edit", allowedRoles: ["Administrador", "Cadastrador"], description: "Editar tipos de pintura existentes" },
  { path: "/optionals/new", allowedRoles: ["Administrador", "Cadastrador"], description: "Cadastrar novos opcionais" },
  { path: "/optionals/:id/edit", allowedRoles: ["Administrador", "Cadastrador"], description: "Editar opcionais existentes" },
  { path: "/vehicles/new", allowedRoles: ["Administrador", "Cadastrador"], description: "Cadastrar novos veículos" },
  { path: "/vehicles/:id/edit", allowedRoles: ["Administrador", "Cadastrador"], description: "Editar veículos existentes" },
  { path: "/direct-sales/new", allowedRoles: ["Administrador", "Cadastrador"], description: "Cadastrar novas vendas diretas" },
  { path: "/direct-sales/edit/:id", allowedRoles: ["Administrador", "Cadastrador"], description: "Editar vendas diretas existentes" },
  
  // Rotas exclusivas para Administradores
  { path: "/settings", allowedRoles: ["Administrador"], description: "Configurações do sistema" },
  { path: "/admin/users", allowedRoles: ["Administrador"], description: "Gerenciamento de usuários" },
  // Página de permissões - visível a todos os usuários para consulta
  { path: "/admin/permissions", allowedRoles: ["Administrador", "Cadastrador", "Usuário"], description: "Visualizar permissões do sistema" }
];

/**
 * Verifica se um usuário tem permissão para acessar uma determinada rota
 * @param path Caminho da rota a ser verificada
 * @param userRole Papel do usuário atual
 * @returns true se o usuário tem permissão, false caso contrário
 */
export function hasPermission(path: string, userRole?: string): boolean {
  if (!userRole) return false;
  
  // Converter para o tipo UserRole (com verificação de tipo)
  const role = userRole as UserRole;
  
  // Encontrar a definição de permissão para o caminho exato
  const exactPathPermission = ROUTE_PERMISSIONS.find(p => p.path === path);
  if (exactPathPermission) {
    return exactPathPermission.allowedRoles.includes(role);
  }
  
  // Verificar caminhos com parâmetros (ex: /brands/:id/edit)
  for (const permission of ROUTE_PERMISSIONS) {
    if (permission.path.includes(':')) {
      const regex = new RegExp(
        '^' + permission.path.replace(/:[^\/]+/g, '[^/]+') + '$'
      );
      if (regex.test(path)) {
        return permission.allowedRoles.includes(role);
      }
    }
  }
  
  // Verificar o prefixo mais próximo (para caminhos que começam com o mesmo prefixo)
  // Por exemplo, /models/something deve herdar as permissões de /models
  const basePathPermission = ROUTE_PERMISSIONS
    .filter(p => !p.path.includes(':') && path.startsWith(p.path))
    .sort((a, b) => b.path.length - a.path.length)[0]; // Pegar o prefixo mais longo
  
  if (basePathPermission) {
    return basePathPermission.allowedRoles.includes(role);
  }
  
  // Se não encontrou nenhuma regra, negar o acesso
  return false;
}

/**
 * Obtém uma lista de todas as rotas que um usuário pode acessar
 * @param userRole Papel do usuário atual
 * @returns Array de rotas permitidas com suas descrições
 */
export function getAccessibleRoutes(userRole?: string): { path: string, description: string }[] {
  if (!userRole) return [];
  
  const role = userRole as UserRole;
  return ROUTE_PERMISSIONS
    .filter(permission => permission.allowedRoles.includes(role))
    .map(({ path, description }) => ({ path, description }));
}