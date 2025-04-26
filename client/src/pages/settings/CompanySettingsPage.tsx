import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const formSchema = z.object({
  company_name: z.string().min(1, "O nome da empresa é obrigatório"),
  company_logo_url: z.string().optional(),
  remove_dealer_text: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

type Setting = {
  id: number;
  key: string;
  value: string;
  label: string;
  type: string;
  createdAt: string;
  updatedAt: string;
};

export default function CompanySettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Consulta configurações
  const { data: settings = [], isLoading: isLoadingSettings } = useQuery<Setting[]>({
    queryKey: ["/api/settings"],
  });
  
  // Extrair valores das configurações
  const companyName = settings.find(s => s.key === "company_name")?.value || "";
  const companyLogoUrl = settings.find(s => s.key === "company_logo_url")?.value || "";
  const removeDealerText = settings.find(s => s.key === "remove_dealer_text")?.value === "true";
  
  // Inicializa formulário
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_name: companyName,
      company_logo_url: companyLogoUrl,
      remove_dealer_text: removeDealerText,
    },
  });
  
  // Atualiza o formulário quando as configurações forem carregadas
  useEffect(() => {
    if (settings.length > 0) {
      form.reset({
        company_name: companyName,
        company_logo_url: companyLogoUrl,
        remove_dealer_text: removeDealerText,
      });
    }
  }, [settings, form, companyName, companyLogoUrl, removeDealerText]);
  
  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      
      // Atualizar o nome da empresa
      await apiRequest("PATCH", "/api/settings/company_name", { 
        value: data.company_name 
      });
      
      // Atualizar a URL do logo se fornecida
      if (data.company_logo_url) {
        await apiRequest("PATCH", "/api/settings/company_logo_url", { 
          value: data.company_logo_url 
        });
      }
      
      // Atualizar a configuração de remover texto do logo
      await apiRequest("PATCH", "/api/settings/remove_dealer_text", { 
        value: data.remove_dealer_text.toString() 
      });
      
      toast({
        title: "Configurações salvas",
        description: "As configurações da empresa foram atualizadas com sucesso.",
      });
      
      // Recarregar as configurações
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (isLoadingSettings) {
    return <div>Carregando...</div>;
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Configurações da Empresa</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Informações da Empresa</CardTitle>
          <CardDescription>
            Configure as informações de identificação da empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Empresa</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nome da empresa" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="company_logo_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL do Logo</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="URL da imagem do logo (opcional)" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="remove_dealer_text"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Remover texto "Dealers" do logo</FormLabel>
                      <FormDescription className="text-xs">
                        Quando ativado, o texto "Dealers" não será exibido no logo padrão
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configurações
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}