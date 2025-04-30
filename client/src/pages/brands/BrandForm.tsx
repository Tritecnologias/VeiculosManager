import { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, ChevronLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Brand } from "@/lib/types";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
});

type FormValues = z.infer<typeof formSchema>;

export default function BrandForm() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isEditing = Boolean(id);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });
  
  const { data: brands = [] } = useQuery<Brand[]>({
    queryKey: ["/api/brands"],
  });
  
  const { data: brand, isLoading: isLoadingBrand } = useQuery<Brand>({
    queryKey: [isEditing ? `/api/brands/${id}` : null],
    enabled: isEditing,
  });
  
  useEffect(() => {
    if (brand) {
      // Garantir que o nome esteja em maiúsculas ao carregar
      const upperCaseName = brand.name.toUpperCase();
      form.reset({
        name: upperCaseName,
      });
      
      // Se o nome na base de dados não estiver em maiúsculas, atualizar
      if (upperCaseName !== brand.name && isEditing) {
        apiRequest("PATCH", `/api/brands/${id}`, { name: upperCaseName })
          .then(() => {
            console.log("Nome da marca convertido para maiúsculas no banco de dados");
            queryClient.invalidateQueries({ queryKey: ["/api/brands"] });
            queryClient.invalidateQueries({ queryKey: [`/api/brands/${id}`] });
          })
          .catch(error => {
            console.error("Erro ao atualizar nome da marca para maiúsculas:", error);
          });
      }
    }
  }, [brand, form, id, isEditing]);
  
  // Converter para maiúsculas ao digitar e verificar duplicatas
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'name' && value.name) {
        // Converter para maiúsculas
        const upperCaseName = value.name.toUpperCase();
        if (upperCaseName !== value.name) {
          form.setValue('name', upperCaseName);
        }
        
        // Verificar se a marca já existe
        setDuplicateError(null);
        const normalizedName = upperCaseName.trim();
        if (normalizedName) {
          const existingBrand = brands.find(b => 
            b.name.toUpperCase() === normalizedName && 
            (!isEditing || b.id !== Number(id))
          );
          
          if (existingBrand) {
            setDuplicateError(`Já existe a marca: ${existingBrand.name}`);
          }
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, brands, isEditing, id]);
  
  const handleSubmit = async (values: FormValues) => {
    // Verificar novamente se há duplicatas antes de salvar
    const normalizedName = values.name.toUpperCase().trim();
    const existingBrand = brands.find(b => 
      b.name.toUpperCase() === normalizedName && 
      (!isEditing || b.id !== Number(id))
    );

    if (existingBrand) {
      setDuplicateError(`Já existe a marca: ${existingBrand.name}`);
      toast({
        title: "Nome duplicado",
        description: `Já existe a marca: ${existingBrand.name}`,
        variant: "destructive",
      });
      return;
    }

    try {
      if (isEditing) {
        await apiRequest("PATCH", `/api/brands/${id}`, values);
        toast({
          title: "Marca atualizada",
          description: "A marca foi atualizada com sucesso!",
        });
      } else {
        await apiRequest("POST", "/api/brands", values);
        toast({
          title: "Marca cadastrada",
          description: "A marca foi cadastrada com sucesso!",
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/brands"] });
      navigate("/brands");
    } catch (error: any) {
      console.error("Failed to save brand:", error);
      // Verificar se o erro é por causa de duplicação
      if (error?.message?.includes("duplicate key") || error?.message?.includes("already exists")) {
        setDuplicateError(`Já existe uma marca com esse nome.`);
        toast({
          title: "Nome duplicado",
          description: `Já existe uma marca com esse nome.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao salvar",
          description: "Ocorreu um erro ao salvar a marca.",
          variant: "destructive",
        });
      }
    }
  };
  
  if (isEditing && isLoadingBrand) {
    return <div>Carregando...</div>;
  }
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <Link href="/brands" className="mr-4">
          <Button variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold text-gray-800">
          {isEditing ? `Editar Marca: ${brand?.name}` : "Nova Marca"}
        </h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? `Editar Marca: ${brand?.name}` : "Cadastrar Nova Marca"}</CardTitle>
          <CardDescription>
            {isEditing 
              ? `Atualize as informações da marca ${brand?.name}`
              : "Preencha os campos para adicionar uma nova marca"
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Marca</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Volkswagen" {...field} />
                    </FormControl>
                    {isEditing && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Este é o nome atual da marca ({brand?.name}). Você pode modificá-lo se desejar.
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
                <Link href="/brands">
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
