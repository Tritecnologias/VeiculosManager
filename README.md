# Sistema de Gerenciamento de Veículos

Um sistema completo para gerenciamento de veículos, marcas, modelos, versões, cores e opcionais, com recursos avançados de configuração de preços e descontos.

## Funcionalidades

- Gerenciamento de marcas, modelos, versões e veículos
- Sistema de cores e tipos de pintura associados a versões específicas
- Itens opcionais associados a versões
- Configurador de veículos com simulação de preços
- Descontos para vendas diretas por marca
- Isenções fiscais (PCD IPI, PCD IPI/ICMS, TAXI IPI, TAXI IPI/ICMS)
- Controle de usuários com três níveis de acesso (Administrador, Cadastrador, Usuário)
- Permissões personalizáveis por função
- Painéis estatísticos para administradores
- Interface responsiva para diversos dispositivos

## Tecnologias

- Frontend: React, TypeScript, Tailwind CSS, shadcn/ui
- Backend: Node.js, Express
- Banco de Dados: PostgreSQL com Drizzle ORM
- Autenticação: Passport.js com sessões
- Estado e Cache: TanStack Query (React Query)
- Roteamento: Wouter

## Instruções para Versionamento

Para versionar este projeto no GitHub:

1. Crie um novo repositório no GitHub (sem README, .gitignore ou licença)
2. Clone o repositório em sua máquina local:
   ```
   git clone https://github.com/seu-usuario/nome-do-repositorio.git
   ```
3. Extraia os arquivos do Replit e copie-os para a pasta do repositório
4. Adicione os arquivos ao Git:
   ```
   git add .
   ```
5. Faça o commit inicial:
   ```
   git commit -m "Versão inicial do Sistema de Gerenciamento de Veículos"
   ```
6. Envie para o GitHub:
   ```
   git push -u origin main
   ```

## Estrutura do Projeto

- `client/` - Frontend React
  - `src/` - Código fonte
    - `components/` - Componentes reutilizáveis
    - `hooks/` - Hooks personalizados
    - `lib/` - Funções utilitárias
    - `pages/` - Páginas da aplicação
- `server/` - Backend Express
  - `auth.ts` - Autenticação e controle de acesso
  - `routes.ts` - Rotas da API
  - `storage.ts` - Operações de banco de dados
- `shared/` - Código compartilhado entre frontend e backend
  - `schema.ts` - Definição do esquema do banco de dados
- `db/` - Scripts relacionados ao banco de dados
  - `seed.ts` - Dados para inicialização do banco

## Usuário Administrador

- Email: wanderson.martins.silva@gmail.com
