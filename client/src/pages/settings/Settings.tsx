import * as React from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
// import DirectSaleList from "../../pages/direct-sales/DirectSaleList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save } from "lucide-react";

type Setting = {
  id: number;
  key: string;
  value: string;
  label: string;
  type: string;
  createdAt: string;
  updatedAt: string;
};

export default function Settings() {
  const { toast } = useToast();
  const [saving, setSaving] = React.useState(false);
  const [formData, setFormData] = React.useState<Record<string, string | boolean>>({});
  
  // Buscar configurações do servidor
  const { data: settings = [], isLoading, error } = useQuery<Setting[]>({
    queryKey: ["/api/settings"],
  });
  
  // Inicializa o formulário quando as configurações são carregadas
  React.useEffect(() => {
    if (settings.length > 0) {
      const initialFormData: Record<string, string | boolean> = {};
      settings.forEach(setting => {
        if (setting.type === "boolean") {
          initialFormData[setting.key] = setting.value.toLowerCase() === "true";
        } else {
          initialFormData[setting.key] = setting.value;
        }
      });
      setFormData(initialFormData);
    }
  }, [settings]);
  
  // Manipulador para campos de texto
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Manipulador para campos booleanos (switches)
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  // Função para salvar as configurações
  const handleSave = async () => {
    setSaving(true);
    
    try {
      // Para cada configuração, atualizar no servidor
      for (const setting of settings) {
        const value = formData[setting.key];
        // Converte valor para string se for boolean, ou usa string vazia se for undefined
        const valueStr = typeof value === "boolean" 
          ? value.toString() 
          : (value === undefined || value === null ? "" : value as string);
        
        try {
          await apiRequest("PATCH", `/api/settings/key/${setting.key}`, { 
            value: valueStr
          });
        } catch (err) {
          console.error(`Erro ao atualizar configuração ${setting.key}:`, err);
          // Se uma configuração falhar, continua com as demais
        }
      }
      
      // Mostrar mensagem de sucesso
      toast({
        title: "Configurações salvas",
        description: "As configurações foram atualizadas com sucesso.",
      });
      
      // Atualizar o cache para que os dados sejam recarregados
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as configurações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
        <span className="ml-2">Carregando configurações...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
        <p className="font-medium">Erro ao carregar configurações</p>
        <p className="text-sm mt-1">Por favor, tente novamente mais tarde.</p>
      </div>
    );
  }
  
  // Agrupar configurações por tipo
  const generalSettings = settings.filter(s => ["admin_email", "default_currency"].includes(s.key));
  const taxSettings = settings.filter(s => ["tax_rate", "enable_pcd_discounts"].includes(s.key));
  const companySettings = settings.filter(s => ["company_name", "company_logo_url"].includes(s.key));
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Configurações do Sistema</h1>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Configurações
            </>
          )}
        </Button>
      </div>
      
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="direct-sales">Vendas Diretas</TabsTrigger>
          <TabsTrigger value="company">Empresa</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Gerais</CardTitle>
              <CardDescription>
                Configurações gerais do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {generalSettings.map(setting => (
                <div key={setting.id} className="grid gap-2">
                  <Label htmlFor={setting.key}>{setting.label}</Label>
                  <Input
                    id={setting.key}
                    name={setting.key}
                    type={setting.type === "email" ? "email" : "text"}
                    value={formData[setting.key] as string || ""}
                    onChange={handleTextChange}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="direct-sales" className="space-y-4">
          {/* <DirectSaleList /> */}
          <Card>
            <CardHeader>
              <CardTitle>Vendas Diretas</CardTitle>
              <CardDescription>
                Gerencie as vendas diretas com descontos específicos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Funcionalidade de Vendas Diretas em desenvolvimento.</p>
              <Button onClick={() => window.location.href = "/direct-sales/new"} disabled>
                Nova Venda Direta
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Empresa</CardTitle>
              <CardDescription>
                Configure o nome e o logo da empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Campo para nome da empresa */}
              <div className="grid gap-2">
                <Label htmlFor="company_name">Nome da empresa</Label>
                <Input
                  id="company_name"
                  name="company_name"
                  value={formData["company_name"] as string || ""}
                  onChange={handleTextChange}
                  placeholder="Nome da empresa"
                />
              </div>
              
              {/* Campo para URL do logo */}
              <div className="grid gap-2">
                <Label htmlFor="company_logo_url">URL do logo</Label>
                <Input
                  id="company_logo_url"
                  name="company_logo_url"
                  value={formData["company_logo_url"] as string || ""}
                  onChange={handleTextChange}
                  placeholder="URL da imagem do logo (opcional)"
                />
              </div>
              

            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
