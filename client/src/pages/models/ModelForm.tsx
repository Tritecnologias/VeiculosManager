import { useEffect } from "react";
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
import { ChevronLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Brand, Model } from "@/lib/types";

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
  
  const handleSubmit = async (values: FormValues) => {
    try {
      const modelData = {
        ...values,
        brandId: parseInt(values.brandId),
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
    } catch (error) {
      console.error("Failed to save model:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar o modelo.",
        variant: "destructive",
      });
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
          {isEditing ? "Editar Modelo" : "Novo Modelo"}
        </h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Editar Modelo" : "Cadastrar Novo Modelo"}</CardTitle>
          <CardDescription>
            {isEditing 
              ? "Atualize as informações do modelo"
              : "Preencha os campos para adicionar um novo modelo"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
                      <Input placeholder="Ex: Polo" {...field} />
                    </FormControl>
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
