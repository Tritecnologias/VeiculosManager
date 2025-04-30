import { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, ChevronLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Brand, Model, Version } from "@/lib/types";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  brandId: z.string().min(1, "Selecione uma marca"),
  modelId: z.string().min(1, "Selecione um modelo"),
});

type FormValues = z.infer<typeof formSchema>;

export default function VersionForm() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isEditing = Boolean(id);
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      brandId: "",
      modelId: "",
    },
  });
  
  const { data: brands = [] } = useQuery<Brand[]>({
    queryKey: ["/api/brands"],
  });
  
  const { data: models = [] } = useQuery<Model[]>({
    queryKey: ["/api/models"],
  });
  
  const { data: versions = [] } = useQuery<(Version & { model: Model })[]>({
    queryKey: ["/api/versions"],
  });
  
  const { data: version, isLoading: isLoadingVersion } = useQuery<Version & { model: Model }>({
    queryKey: [isEditing ? `/api/versions/${id}` : null],
    enabled: isEditing,
  });
  
  useEffect(() => {
    if (version && version.model) {
      form.reset({
        name: version.name,
        brandId: version.model.brandId.toString(),
        modelId: version.modelId.toString(),
      });
      
      setFilteredModels(
        models.filter(model => model.brandId === version.model.brandId)
      );
    }
  }, [version, form, models]);
  
  // Converter para maiúsculas ao digitar e verificar duplicatas
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'name' && value.name) {
        // Converter para maiúsculas
        const upperCaseName = value.name.toUpperCase();
        if (upperCaseName !== value.name) {
          form.setValue('name', upperCaseName);
        }
        
        // Verificar se a versão já existe para o modelo selecionado
        setDuplicateError(null);
        const normalizedName = upperCaseName.trim();
        const selectedModelId = value.modelId ? parseInt(value.modelId) : null;
        
        if (normalizedName && selectedModelId) {
          const existingVersion = versions.find(v => 
            v.name.toUpperCase() === normalizedName && 
            v.modelId === selectedModelId &&
            (!isEditing || v.id !== Number(id))
          );
          
          if (existingVersion) {
            const modelName = models.find(m => m.id === selectedModelId)?.name || '';
            const brandName = brands.find(b => b.id === models.find(m => m.id === selectedModelId)?.brandId)?.name || '';
            setDuplicateError(`Já existe a versão: ${existingVersion.name} para o modelo ${modelName} da marca ${brandName}`);
          }
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, versions, models, brands, isEditing, id]);

  // Update filtered models when brand changes
  const handleBrandChange = (brandId: string) => {
    form.setValue("brandId", brandId);
    form.setValue("modelId", ""); // Reset model selection
    setDuplicateError(null); // Limpar erro ao mudar a marca
    
    if (brandId) {
      const parsedBrandId = parseInt(brandId);
      setFilteredModels(models.filter(model => model.brandId === parsedBrandId));
    } else {
      setFilteredModels([]);
    }
  };
  
  const handleSubmit = async (values: FormValues) => {
    // Verificar novamente se há duplicatas antes de salvar
    const normalizedName = values.name.toUpperCase().trim();
    const selectedModelId = parseInt(values.modelId);
    
    const existingVersion = versions.find(v => 
      v.name.toUpperCase() === normalizedName && 
      v.modelId === selectedModelId &&
      (!isEditing || v.id !== Number(id))
    );

    if (existingVersion) {
      const modelName = models.find(m => m.id === selectedModelId)?.name || '';
      const brandName = brands.find(b => b.id === models.find(m => m.id === selectedModelId)?.brandId)?.name || '';
      const errorMessage = `Já existe a versão: ${existingVersion.name} para o modelo ${modelName} da marca ${brandName}`;
      setDuplicateError(errorMessage);
      toast({
        title: "Versão duplicada",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    try {
      const versionData = {
        name: normalizedName, // Garante que vai em maiúsculas
        modelId: selectedModelId,
      };
      
      if (isEditing) {
        await apiRequest("PATCH", `/api/versions/${id}`, versionData);
        toast({
          title: "Versão atualizada",
          description: "A versão foi atualizada com sucesso!",
        });
      } else {
        await apiRequest("POST", "/api/versions", versionData);
        toast({
          title: "Versão cadastrada",
          description: "A versão foi cadastrada com sucesso!",
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/versions"] });
      navigate("/versions");
    } catch (error: any) {
      console.error("Failed to save version:", error);
      // Verificar se o erro é por causa de duplicação
      if (error?.message?.includes("duplicate key") || error?.message?.includes("already exists")) {
        const errorMessage = `Já existe uma versão com esse nome para este modelo.`;
        setDuplicateError(errorMessage);
        toast({
          title: "Versão duplicada",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao salvar",
          description: "Ocorreu um erro ao salvar a versão.",
          variant: "destructive",
        });
      }
    }
  };
  
  if (isEditing && isLoadingVersion) {
    return <div>Carregando...</div>;
  }
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <Link href="/versions" className="mr-4">
          <Button variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold text-gray-800">
          {isEditing ? "Editar Versão" : "Nova Versão"}
        </h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Editar Versão" : "Cadastrar Nova Versão"}</CardTitle>
          <CardDescription>
            {isEditing 
              ? "Atualize as informações da versão"
              : "Preencha os campos para adicionar uma nova versão"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {duplicateError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <AlertDescription>{duplicateError}</AlertDescription>
                </Alert>
              )}
              
              <FormField
                control={form.control}
                name="brandId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <Select 
                      value={field.value} 
                      onValueChange={handleBrandChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma marca" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id.toString()}>
                            {brand.name}
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
                name="modelId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo</FormLabel>
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
                      disabled={!form.getValues("brandId")}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um modelo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredModels.map((model) => (
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Versão</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Sense TSI 116CV" {...field} />
                    </FormControl>
                    {isEditing && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Este é o nome atual da versão. Você pode alterá-lo se desejar.
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      O nome será automaticamente convertido para maiúsculas.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2">
                <Link href="/versions">
                  <Button variant="outline" type="button">
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
