import { useEffect } from "react";
import { Link, useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChevronLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Brand } from "@/lib/types";

const formSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
});

type FormValues = z.infer<typeof formSchema>;

export default function BrandForm() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isEditing = Boolean(id);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });
  
  const { data: brand, isLoading: isLoadingBrand } = useQuery<Brand>({
    queryKey: [isEditing ? `/api/brands/${id}` : null],
    enabled: isEditing,
  });
  
  useEffect(() => {
    if (brand) {
      form.reset({
        name: brand.name,
      });
    }
  }, [brand, form]);
  
  const handleSubmit = async (values: FormValues) => {
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
    } catch (error) {
      console.error("Failed to save brand:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar a marca.",
        variant: "destructive",
      });
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
