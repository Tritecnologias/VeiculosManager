import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { RoutePermission, ROUTE_PERMISSIONS, UserRole } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { InfoIcon, Save, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest, getQueryFn } from "@/lib/queryClient";

export default function PermissionSettings() {
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<UserRole>("Cadastrador");
  const [permissions, setPermissions] = useState<{ [key: string]: boolean }>({});
  
  // Buscar permissões personalizadas do banco de dados
  const { data: customPermissions, isLoading } = useQuery({
    queryKey: ["/api/permissions"],
    queryFn: getQueryFn(),
  });
  
  // Inicializar permissões quando os dados forem carregados
  useEffect(() => {
    if (customPermissions && Object.keys(customPermissions).length > 0) {
      // Se temos permissões personalizadas, usá-las
      if (customPermissions[selectedRole]) {
        setPermissions(customPermissions[selectedRole]);
      } else {
        // Caso contrário, usar as permissões padrão
        initializeDefaultPermissions();
      }
    } else {
      // Se não há dados do banco, usar as permissões padrão
      initializeDefaultPermissions();
    }
  }, [customPermissions, selectedRole]);
  
  const initializeDefaultPermissions = () => {
    // Inicializar com as permissões padrão baseadas em ROUTE_PERMISSIONS
    const initialPermissions: { [key: string]: boolean } = {};
    
    // Para cada permissão, verificar se o papel selecionado tem acesso
    ROUTE_PERMISSIONS.forEach(permission => {
      const descriptionKey = permission.description;
      initialPermissions[descriptionKey] = permission.allowedRoles.includes(selectedRole);
    });
    
    setPermissions(initialPermissions);
  };
  
  // Função para alternar um valor de permissão
  const togglePermission = (description: string) => {
    setPermissions(prevPermissions => ({
      ...prevPermissions,
      [description]: !prevPermissions[description]
    }));
  };
  
  // Função para salvar as permissões personalizadas
  const savePermissionsMutation = useMutation({
    mutationFn: async () => {
      // Montar objeto de permissões para enviar ao servidor
      const permissionsData = {
        role: selectedRole,
        permissions: permissions
      };
      
      const response = await apiRequest("POST", "/api/permissions", permissionsData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/permissions"] });
      toast({
        title: "Permissões salvas",
        description: `As permissões para ${selectedRole} foram atualizadas com sucesso.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao salvar permissões",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Função para restaurar as permissões padrão
  const resetToDefaultsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/permissions/${selectedRole}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/permissions"] });
      initializeDefaultPermissions();
      toast({
        title: "Permissões resetadas",
        description: `As permissões para ${selectedRole} foram restauradas para o padrão.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao resetar permissões",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Configuração de Permissões</h1>
      
      <Alert className="mb-6">
        <InfoIcon className="h-5 w-5" />
        <AlertTitle>Informação</AlertTitle>
        <AlertDescription>
          Aqui você pode personalizar as permissões para cada papel de usuário no sistema.
          O papel de Administrador sempre terá acesso completo e não pode ser modificado.
        </AlertDescription>
      </Alert>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5 text-blue-600" />
            Gerenciar Permissões
          </CardTitle>
          <CardDescription>
            Selecione um papel de usuário para configurar suas permissões
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Papel de Usuário</label>
              <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um papel" />
                </SelectTrigger>
                <SelectContent>
                  {/* Não incluir Administrador pois sempre tem acesso total */}
                  <SelectItem value="Cadastrador">Cadastrador</SelectItem>
                  <SelectItem value="Usuário">Usuário</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-3 flex items-end gap-2">
              <Button 
                onClick={() => savePermissionsMutation.mutate()}
                disabled={savePermissionsMutation.isPending}
                className="flex items-center"
              >
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
                {savePermissionsMutation.isPending && <span className="ml-2 animate-spin">⋯</span>}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => resetToDefaultsMutation.mutate()}
                disabled={resetToDefaultsMutation.isPending}
              >
                Restaurar Padrão
                {resetToDefaultsMutation.isPending && <span className="ml-2 animate-spin">⋯</span>}
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center py-8">Carregando permissões...</div>
          ) : (
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">Todas as Permissões</TabsTrigger>
                <TabsTrigger value="view">Visualização</TabsTrigger>
                <TabsTrigger value="edit">Edição</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-4 py-3 text-left">Funcionalidade</th>
                        <th className="px-4 py-3 text-left">Acesso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ROUTE_PERMISSIONS
                        .filter((p, i, arr) => arr.findIndex(r => r.description === p.description) === i)
                        .sort((a, b) => a.description.localeCompare(b.description))
                        .map((permission, index) => {
                          // Pular funcionalidades exclusivas de Administrador
                          if (permission.allowedRoles.includes("Administrador") && 
                              permission.allowedRoles.length === 1) {
                            return null;
                          }
                          
                          return (
                            <tr 
                              key={index} 
                              className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                            >
                              <td className="px-4 py-3">{permission.description}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center space-x-2">
                                  <Checkbox 
                                    id={`permission-${index}`}
                                    checked={permissions[permission.description] || false}
                                    onCheckedChange={() => togglePermission(permission.description)}
                                  />
                                  <label htmlFor={`permission-${index}`} className="text-sm cursor-pointer">
                                    Permitir
                                  </label>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
              
              <TabsContent value="view">
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-4 py-3 text-left">Funcionalidade de Visualização</th>
                        <th className="px-4 py-3 text-left">Acesso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ROUTE_PERMISSIONS
                        .filter(p => p.description.toLowerCase().includes('visualizar'))
                        .sort((a, b) => a.description.localeCompare(b.description))
                        .map((permission, index) => (
                          <tr 
                            key={index} 
                            className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                          >
                            <td className="px-4 py-3">{permission.description}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-2">
                                <Checkbox 
                                  id={`view-permission-${index}`}
                                  checked={permissions[permission.description] || false}
                                  onCheckedChange={() => togglePermission(permission.description)}
                                />
                                <label htmlFor={`view-permission-${index}`} className="text-sm cursor-pointer">
                                  Permitir
                                </label>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
              
              <TabsContent value="edit">
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-4 py-3 text-left">Funcionalidade de Edição</th>
                        <th className="px-4 py-3 text-left">Acesso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ROUTE_PERMISSIONS
                        .filter(p => 
                          p.description.toLowerCase().includes('cadastrar') || 
                          p.description.toLowerCase().includes('editar')
                        )
                        .sort((a, b) => a.description.localeCompare(b.description))
                        .map((permission, index) => (
                          <tr 
                            key={index} 
                            className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                          >
                            <td className="px-4 py-3">{permission.description}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-2">
                                <Checkbox 
                                  id={`edit-permission-${index}`}
                                  checked={permissions[permission.description] || false}
                                  onCheckedChange={() => togglePermission(permission.description)}
                                />
                                <label htmlFor={`edit-permission-${index}`} className="text-sm cursor-pointer">
                                  Permitir
                                </label>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}