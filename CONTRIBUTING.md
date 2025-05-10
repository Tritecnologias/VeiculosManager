# Guia de Contribuição

Obrigado por considerar contribuir para o Sistema de Gerenciamento de Veículos!

## Como Contribuir

1. Faça um fork do repositório
2. Clone seu fork: `git clone https://github.com/seu-usuario/nome-do-repositorio.git`
3. Crie uma branch para sua feature: `git checkout -b minha-nova-feature`
4. Faça suas alterações e teste-as localmente
5. Adicione os arquivos modificados: `git add .`
6. Faça commit das alterações: `git commit -m "Adiciona nova feature"`
7. Envie as alterações para seu fork: `git push origin minha-nova-feature`
8. Abra um Pull Request no repositório original

## Padrões de Código

- Utilize TypeScript para todo o código novo
- Mantenha a consistência com a estrutura de pastas existente
- Siga o estilo de código existente no projeto
- Adicione comentários em código complexo
- Mantenha os componentes pequenos e focados em uma única responsabilidade

## Banco de Dados

- Todas as alterações de esquema devem ser feitas em `shared/schema.ts`
- Use o Drizzle ORM para todas as operações de banco de dados
- Defina tipos para todas as estruturas de dados
- Execute `npm run db:push` após alterações no esquema

## Estrutura do Projeto

- `client/src/pages`: Páginas principais da aplicação
- `client/src/components`: Componentes reutilizáveis
- `client/src/hooks`: Hooks personalizados
- `client/src/lib`: Funções utilitárias
- `server`: API e lógica de backend

## Testes

- Teste suas alterações manualmente antes de enviar
- Certifique-se de que todas as funcionalidades existentes continuam funcionando
- Verifique se a interface é responsiva em diferentes tamanhos de tela

## Pull Requests

- Descreva claramente o que sua alteração faz
- Referencie qualquer issue relacionada
- Aguarde feedback e esteja aberto a fazer ajustes, se necessário