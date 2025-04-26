import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Brand, Model, Version, Optional } from "@/lib/types";
import { formatBRCurrency, parseBRCurrency } from "@/lib/formatters";

const formSchema = z.object({
  modelId: z.string().min(1, "Selecione um modelo"),
  versionId: z.string().min(1, "Selecione uma versão"),
  optionalId: z.string().min(1, "Selecione um opcional"),
  price: z.string().default("0"),
});

type FormValues = z.infer<typeof formSchema>;

export default function VersionOptionalForm() {
  const { toast } = useToast();
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);
  const [filteredVersions, setFilteredVersions] = useState<Version[]>([]);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      modelId: "",
      versionId: "",
      optionalId: "",
      price: "0",
    },
  });
  
  const { data: brands = [] } = useQuery<Brand[]>({
    queryKey: ["/api/brands"],
  });
  
  const { data: models = [] } = useQuery<Model[]>({
    queryKey: ["/api/models"],
  });
  
  const { data: versions = [] } = useQuery<Version[]>({
    queryKey: ["/api/versions"],
  });
  
  const { data: optionals = [] } = useQuery<Optional[]>({
    queryKey: ["/api/optionals"],
  });
  
  const modelId = form.watch("modelId");
  
  useEffect(() => {
    if (modelId) {
      setFilteredVersions(versions.filter(v => v.modelId === parseInt(modelId)));
    } else {
      setFilteredVersions([]);
    }
  }, [modelId, versions]);
  
  const onSubmit = async (data: FormValues) => {
    try {
      const payload = {
        versionId: parseInt(data.versionId),
        optionalId: parseInt(data.optionalId),
        price: data.price,
      };
      
      await apiRequest("POST", "/api/version-optionals", payload);
      
      queryClient.invalidateQueries({ queryKey: ["/api/version-optionals"] });
      
      toast({
        title: "Associação criada",
        description: "O opcional foi associado à versão com sucesso.",
      });
      
      form.reset({
        modelId: "",
        versionId: "",
        optionalId: "",
        price: "0",
      });
    } catch (error) {
      console.error("Erro ao associar opcional à versão:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao associar o opcional à versão.",
        variant: "destructive",
      });
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove caracteres inválidos, mantendo apenas números, vírgulas e pontos
    let inputValue = e.target.value.replace(/[^\d,\.]/g, '');
    
    // Converte para o formato esperado pela API (com ponto decimal)
    const formattedValue = parseBRCurrency(inputValue);
    
    // Define o valor no formulário como string
    form.setValue("price", formattedValue);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Associar Opcional à Versão</CardTitle>
        <CardDescription>
          Associe opcionais às versões dos veículos, definindo o preço para cada associação
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="modelId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modelo</FormLabel>
                  <Select 
                    value={field.value} 
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um modelo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {models.map((model) => (
                        <SelectItem key={model.id} value={model.id.toString()}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="versionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Versão</FormLabel>
                  <Select 
                    value={field.value} 
                    onValueChange={field.onChange}
                    disabled={!form.getValues().modelId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma versão" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredVersions.map((version) => (
                        <SelectItem key={version.id} value={version.id.toString()}>
                          {version.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="optionalId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opcional</FormLabel>
                  <Select 
                    value={field.value} 
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um opcional" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {optionals.map((optional) => (
                        <SelectItem key={optional.id} value={optional.id.toString()}>
                          {optional.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço</FormLabel>
                  <FormControl>
                    <Input 
                      value={formatBRCurrency(field.value)} 
                      onChange={handlePriceChange} 
                      placeholder="Preço do opcional para esta versão" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end">
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                Associar
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}