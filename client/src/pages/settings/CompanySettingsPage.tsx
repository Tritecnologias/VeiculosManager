import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const formSchema = z.object({
  company_name: z.string().min(1, "O nome da empresa é obrigatório"),
  company_logo_url: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CompanySettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_name: "",
      company_logo_url: "",
    },
  });
  
  const { data: settings = [], isLoading: isLoadingSettings } = useQuery({
    queryKey: ["/api/settings"],
    onSuccess: (data) => {
      const companyName = data.find((setting: any) => setting.key === "company_name")?.value || "";
      const companyLogoUrl = data.find((setting: any) => setting.key === "company_logo_url")?.value || "";
      
      form.reset({
        company_name: companyName,
        company_logo_url: companyLogoUrl,
      });
    },
  });
  
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