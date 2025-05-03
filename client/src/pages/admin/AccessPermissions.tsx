import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTE_PERMISSIONS, UserRole, getAccessibleRoutes } from "@/lib/permissions";
import { Check, Info, Lock, Shield, X } from "lucide-react";

export default function AccessPermissions() {
  const roles: UserRole[] = ["Administrador", "Cadastrador", "Usuário"];
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Permissões de Acesso</h1>
      
      <Alert className="mb-6">
        <Info className="h-5 w-5" />
        <AlertTitle>Informação</AlertTitle>
        <AlertDescription>
          Esta página exibe as permissões de acesso para cada papel de usuário no sistema.
          Use essas informações para entender o que cada tipo de usuário pode fazer.
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue="comparison">
        <TabsList className="grid grid-cols-2 max-w-[400px] mb-4">
          <TabsTrigger value="comparison">Comparação</TabsTrigger>
          <TabsTrigger value="byRole">Por Papel</TabsTrigger>
        </TabsList>
        
        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>Comparação de Permissões</CardTitle>
              <CardDescription>
                Veja quais papéis têm acesso a cada funcionalidade do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-4 text-left">Funcionalidade</th>
                      {roles.map(role => (
                        <th key={role} className="py-2 px-4 text-center">{role}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ROUTE_PERMISSIONS
                      .filter((p, i, arr) => arr.findIndex(r => r.description === p.description) === i) // Remove duplicados
                      .sort((a, b) => a.description.localeCompare(b.description))
                      .map((permission, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-muted/50' : ''}>
                          <td className="py-2 px-4">{permission.description}</td>
                          {roles.map(role => {
                            const hasAccess = permission.allowedRoles.includes(role);
                            return (
                              <td key={role} className="py-2 px-4 text-center">
                                {hasAccess ? (
                                  <Check className="inline-block text-green-500 h-5 w-5" />
                                ) : (
                                  <X className="inline-block text-red-500 h-5 w-5" />
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="byRole">
          <div className="grid md:grid-cols-3 gap-6">
            {roles.map(role => {
              const accessibleRoutes = getAccessibleRoutes(role);
              return (
                <Card key={role} className={
                  role === "Administrador" ? "border-green-200" : 
                  role === "Cadastrador" ? "border-blue-200" : "border-gray-200"
                }>
                  <CardHeader className={
                    role === "Administrador" ? "bg-green-50" : 
                    role === "Cadastrador" ? "bg-blue-50" : "bg-gray-50"
                  }>
                    <CardTitle className="flex items-center">
                      {role === "Administrador" && <Shield className="mr-2 h-5 w-5 text-green-600" />}
                      {role === "Cadastrador" && <Shield className="mr-2 h-5 w-5 text-blue-600" />}
                      {role === "Usuário" && <Lock className="mr-2 h-5 w-5 text-gray-600" />}
                      {role}
                    </CardTitle>
                    <CardDescription>
                      {role === "Administrador" && "Acesso completo ao sistema, incluindo gerenciamento de usuários"}
                      {role === "Cadastrador" && "Pode criar e editar registros, mas não gerenciar usuários"}
                      {role === "Usuário" && "Acesso de visualização apenas"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-medium mb-2">Funções permitidas:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {accessibleRoutes
                        .filter((r, i, arr) => arr.findIndex(route => route.description === r.description) === i)
                        .sort((a, b) => a.description.localeCompare(b.description))
                        .map((route, index) => (
                          <li key={index}>{route.description}</li>
                        ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}