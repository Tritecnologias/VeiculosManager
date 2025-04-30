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
import { Brand, Model } from "@/lib/types";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  brandId: z.string().min(1, "Selecione uma marca"),
});

type FormValues = z.infer<typeof formSchema>;

export default function ModelForm() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isEditing = Boolean(id);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      brandId: "",
    },
  });
  
  const { data: brands = [] } = useQuery<Brand[]>({
    queryKey: ["/api/brands"],
  });
  
  const { data: models = [] } = useQuery<Model[]>({
    queryKey: ["/api/models"],
  });
  
  const { data: model, isLoading: isLoadingModel } = useQuery<Model>({
    queryKey: [isEditing ? `/api/models/${id}` : null],
    enabled: isEditing,
  });
  
  useEffect(() => {
    if (model) {
      form.reset({
        name: model.name,
        brandId: model.brandId.toString(),
      });
    }
  }, [model, form]);
  
  // Converter para maiúsculas ao digitar e verificar duplicatas
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'name' && value.name) {
        // Converter para maiúsculas
        const upperCaseName = value.name.toUpperCase();
        if (upperCaseName !== value.name) {
          form.setValue('name', upperCaseName);
        }
        
        // Verificar se o modelo já existe para a marca selecionada
        setDuplicateError(null);
        const normalizedName = upperCaseName.trim();
        const selectedBrandId = value.brandId ? parseInt(value.brandId) : null;
        
        if (normalizedName && selectedBrandId) {
          const existingModel = models.find(m => 
            m.name.toUpperCase() === normalizedName && 
            m.brandId === selectedBrandId &&
            (!isEditing || m.id !== Number(id))
          );
          
          if (existingModel) {
            const brandName = brands.find(b => b.id === selectedBrandId)?.name || '';
            setDuplicateError(`Já existe o modelo: ${existingModel.name} para a marca ${brandName}`);
          }
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, models, brands, isEditing, id]);
  
  const handleSubmit = async (values: FormValues) => {
    // Verificar novamente se há duplicatas antes de salvar
    const normalizedName = values.name.toUpperCase().trim();
    const selectedBrandId = parseInt(values.brandId);
    
    const existingModel = models.find(m => 
      m.name.toUpperCase() === normalizedName && 
      m.brandId === selectedBrandId &&
      (!isEditing || m.id !== Number(id))
    );

    if (existingModel) {
      const brandName = brands.find(b => b.id === selectedBrandId)?.name || '';
      const errorMessage = `Já existe o modelo: ${existingModel.name} para a marca ${brandName}`;
      setDuplicateError(errorMessage);
      toast({
        title: "Modelo duplicado",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    try {
      const modelData = {
        ...values,
        name: normalizedName, // Garante que vai em maiúsculas
        brandId: selectedBrandId,
      };
      
      if (isEditing) {
        await apiRequest("PATCH", `/api/models/${id}`, modelData);
        toast({
          title: "Modelo atualizado",
          description: "O modelo foi atualizado com sucesso!",
        });
      } else {
        await apiRequest("POST", "/api/models", modelData);
        toast({
          title: "Modelo cadastrado",
          description: "O modelo foi cadastrado com sucesso!",
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/models"] });
      navigate("/models");
    } catch (error: any) {
      console.error("Failed to save model:", error);
      // Verificar se o erro é por causa de duplicação
      if (error?.message?.includes("duplicate key") || error?.message?.includes("already exists")) {
        const errorMessage = `Já existe um modelo com esse nome para esta marca.`;
        setDuplicateError(errorMessage);
        toast({
          title: "Modelo duplicado",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao salvar",
          description: "Ocorreu um erro ao salvar o modelo.",
          variant: "destructive",
        });
      }
    }
  };
  
  if (isEditing && isLoadingModel) {
    return <div>Carregando...</div>;
  }
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <Link href="/models" className="mr-4">
          <Button variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold text-gray-800">
          {isEditing ? `Editar Modelo: ${model?.name}` : "Novo Modelo"}
        </h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? `Editar Modelo: ${model?.name}` : "Cadastrar Novo Modelo"}</CardTitle>
          <CardDescription>
            {isEditing 
              ? `Atualize as informações do modelo ${model?.name} da marca ${brands.find(b => b.id === model?.brandId)?.name || ''}` 
              : "Preencha os campos para adicionar um novo modelo"
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
                      onValueChange={field.onChange}
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
                    {isEditing && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Marca atual: {brands.find(b => b.id === model?.brandId)?.name}. Você pode selecionar outra marca se desejar.
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Modelo</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Polo" 
                        {...field} 
                      />
                    </FormControl>
                    {isEditing && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Este é o nome atual do modelo. Você pode alterá-lo se desejar.
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
                <Link href="/models">
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
