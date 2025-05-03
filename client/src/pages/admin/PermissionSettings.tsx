import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Info, Shield, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ROUTE_PERMISSIONS, getCustomPermissions, UserRole } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function PermissionSettings() {
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<string>("Cadastrador");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});

  // Buscar as permissões personalizadas
  const { data: customPermissions, isLoading } = useQuery({
    queryKey: ['/api/permissions'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/permissions');
        return await response.json();
      } catch (error) {
        console.error('Erro ao carregar permissões:', error);
        return {};
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Agrupar permissões por categoria para melhor organização
  const categories = {
    "Visualização": ROUTE_PERMISSIONS.filter(p => 
      !p.path.includes('new') && 
      !p.path.includes('edit') && 
      !p.path.includes('admin') &&
      p.path !== "/" && 
      p.path !== "/configurator" && 
      p.path !== "/settings" && 
      p.path !== "/user/profile"
    ),
    "Dashboard e Configurador": ROUTE_PERMISSIONS.filter(p => 
      p.path === "/" || 
      p.path === "/configurator"
    ),
    "Cadastro e Edição": ROUTE_PERMISSIONS.filter(p => 
      p.path.includes('new') || 
      p.path.includes('edit')
    ),
    "Perfil de Usuário": ROUTE_PERMISSIONS.filter(p => 
      p.path === "/user/profile"
    ),
    "Gerencial": ROUTE_PERMISSIONS.filter(p => 
      p.path.includes('admin') || 
      p.path === "/settings"
    )
  };

  // Mutação para salvar permissões personalizadas
  const saveMutation = useMutation({
    mutationFn: async ({ role, permissions }: { role: string, permissions: Record<string, boolean> }) => {
      const response = await apiRequest('POST', '/api/permissions', { role, permissions });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Permissões atualizadas",
        description: "As permissões foram atualizadas com sucesso.",
        variant: "default",
      });
      queryClient.invalidateQueries({queryKey: ['/api/permissions']});
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar permissões",
        description: error.message || "Ocorreu um erro ao atualizar as permissões.",
        variant: "destructive",
      });
    }
  });

  // Mutação para resetar permissões para o padrão
  const resetMutation = useMutation({
    mutationFn: async (role: string) => {
      const response = await apiRequest('DELETE', `/api/permissions/${role}`);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Permissões resetadas",
        description: "As permissões foram resetadas para os valores padrão.",
        variant: "default",
      });
      queryClient.invalidateQueries({queryKey: ['/api/permissions']});
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao resetar permissões",
        description: error.message || "Ocorreu um erro ao resetar as permissões.",
        variant: "destructive",
      });
    }
  });

  // Carrega as permissões corretas quando a role selecionada muda ou quando as permissões são atualizadas
  useEffect(() => {
    if (customPermissions && selectedRole) {
      // Se existem permissões personalizadas para a role, use-as
      if (customPermissions[selectedRole]) {
        setPermissions(customPermissions[selectedRole]);
      } else {
        // Caso contrário, use as permissões padrão
        const defaultPermissions: Record<string, boolean> = {};
        ROUTE_PERMISSIONS.forEach(permission => {
          defaultPermissions[permission.description] = permission.allowedRoles.includes(selectedRole as UserRole);
        });
        setPermissions(defaultPermissions);
      }
    }
  }, [customPermissions, selectedRole]);

  const handlePermissionChange = (key: string, value: boolean) => {
    if (!isEditing) setIsEditing(true);
    setPermissions(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    saveMutation.mutate({ role: selectedRole, permissions });
  };

  const handleReset = () => {
    if (window.confirm(`Tem certeza que deseja restaurar as permissões padrão para ${selectedRole}?`)) {
      resetMutation.mutate(selectedRole);
    }
  };

  const handleSelectAll = (category: string, value: boolean) => {
    const newPermissions = { ...permissions };
    categories[category as keyof typeof categories].forEach(permission => {
      newPermissions[permission.description] = value;
    });
    setPermissions(newPermissions);
    setIsEditing(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Carregando permissões...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Configurações de Permissões</h1>
      
      <Alert className="mb-6">
        <Info className="h-5 w-5" />
        <AlertTitle>Personalize as permissões por papel</AlertTitle>
        <AlertDescription>
          Configure quais funcionalidades cada papel de usuário pode acessar no sistema.
          O papel de Administrador sempre terá acesso total e não pode ser modificado.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Papel de Usuário</CardTitle>
              <CardDescription>Selecione o papel que deseja configurar</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs 
                defaultValue="Cadastrador" 
                value={selectedRole} 
                onValueChange={setSelectedRole}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="Cadastrador">Cadastrador</TabsTrigger>
                  <TabsTrigger value="Usuário">Usuário</TabsTrigger>
                </TabsList>

                <div className="flex justify-between mt-6">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleReset}
                          disabled={resetMutation.isPending}
                        >
                          {resetMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Resetando...
                            </>
                          ) : (
                            <>
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Restaurar Padrão
                            </>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Restaurar as permissões padrão para este papel</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={handleSave}
                    disabled={!isEditing || saveMutation.isPending}
                  >
                    {saveMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-4 w-4" />
                        Salvar Permissões
                      </>
                    )}
                  </Button>
                </div>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Status das Permissões</CardTitle>
              <CardDescription>Informações sobre as permissões atuais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge variant={customPermissions && customPermissions[selectedRole] ? "default" : "outline"}>
                    {customPermissions && customPermissions[selectedRole] ? "Personalizado" : "Padrão"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {customPermissions && customPermissions[selectedRole] 
                      ? "Este papel tem permissões personalizadas" 
                      : "Este papel usa as permissões padrão do sistema"}
                  </span>
                </div>

                {isEditing && (
                  <Alert variant="warning">
                    <Info className="h-4 w-4" />
                    <AlertTitle className="text-sm">Alterações não salvas</AlertTitle>
                    <AlertDescription className="text-xs">
                      Clique em "Salvar Permissões" para aplicar as mudanças
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Permissões por Categoria</CardTitle>
              <CardDescription>Ative ou desative funcionalidades específicas</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="Visualização" className="w-full">
                <TabsList className="grid grid-cols-5 mb-6">
                  <TabsTrigger value="Visualização">Visualização</TabsTrigger>
                  <TabsTrigger value="Cadastro e Edição">Cadastro</TabsTrigger>
                  <TabsTrigger value="Dashboard e Configurador">Dashboard</TabsTrigger>
                  <TabsTrigger value="Perfil de Usuário">Perfil</TabsTrigger>
                  <TabsTrigger value="Gerencial">Gerencial</TabsTrigger>
                </TabsList>

                {Object.entries(categories).map(([category, categoryPermissions]) => (
                  <TabsContent key={category} value={category} className="p-0">
                    <div className="flex justify-between mb-4">
                      <h3 className="text-lg font-medium">Permissões de {category}</h3>
                      <div className="flex items-center space-x-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleSelectAll(category, true)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Selecionar Todos
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleSelectAll(category, false)}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Desmarcar Todos
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categoryPermissions.map((permission) => (
                        <div key={permission.path} className="flex items-center justify-between p-3 border rounded-md">
                          <div className="space-y-1">
                            <Label htmlFor={`permission-${permission.path}`}>
                              {permission.description}
                            </Label>
                            <p className="text-sm text-muted-foreground">{permission.path}</p>
                          </div>
                          <Switch
                            id={`permission-${permission.path}`}
                            checked={permissions[permission.description] || false}
                            onCheckedChange={(value) => handlePermissionChange(permission.description, value)}
                            className="data-[state=checked]:bg-primary"
                          />
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}