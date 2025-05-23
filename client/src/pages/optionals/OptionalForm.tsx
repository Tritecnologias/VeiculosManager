import { useEffect } from "react";
import { Link, useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChevronLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Optional } from "@/lib/types";

const formSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  description: z.string().min(5, "A descrição deve ter pelo menos 5 caracteres"),
});

type FormValues = z.infer<typeof formSchema>;

interface OptionalFormProps {
  id?: number | null;
  onCancel?: () => void;
}

export default function OptionalForm({ id, onCancel }: OptionalFormProps) {
  const params = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  console.log("Params recebidos:", params);
  console.log("ID recebido:", id);
  
  const isEditing = Boolean(id || params.id);
  const optionalId = id || params.id;
  
  console.log("isEditing:", isEditing);
  console.log("optionalId:", optionalId);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const { data: optional, isLoading } = useQuery({
    queryKey: ["/api/optionals", optionalId],
    enabled: Boolean(optionalId) && isEditing,
    onSuccess: (data) => {
      console.log("Opcional carregado:", data);
    },
    queryFn: async () => {
      if (!optionalId) return null;
      console.log("Fazendo requisição para:", `/api/optionals/${optionalId}`);
      const response = await fetch(`/api/optionals/${optionalId}`);
      if (!response.ok) {
        throw new Error("Erro ao buscar opcional");
      }
      const data = await response.json();
      console.log("Dados recebidos:", data);
      return data as Optional;
    }
  });

  useEffect(() => {
    if (optional) {
      form.reset({
        name: optional.name,
        description: optional.description,
      });
    }
  }, [optional, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      const method = isEditing ? "PATCH" : "POST";
      const url = isEditing ? `/api/optionals/${optionalId}` : "/api/optionals";
      
      await apiRequest(method, url, data);
      
      queryClient.invalidateQueries({ queryKey: ["/api/optionals"] });
      
      toast({
        title: isEditing ? "Opcional atualizado" : "Opcional criado",
        description: isEditing 
          ? `O opcional "${data.name}" foi atualizado com sucesso.` 
          : `O opcional "${data.name}" foi criado com sucesso.`,
      });
      
      if (onCancel) {
        onCancel();
      } else {
        navigate("/optionals");
      }
      
    } catch (error) {
      console.error("Erro ao salvar opcional:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o opcional.",
        variant: "destructive",
      });
    }
  };


  
  if (isLoading && isEditing) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          {isEditing ? "Editar Opcional" : "Novo Opcional"}
        </h1>
        {!onCancel && (
          <Link href="/optionals">
            <Button variant="outline">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Editar Opcional" : "Novo Opcional"}</CardTitle>
          <CardDescription>
            {isEditing ? "Edite as informações do opcional" : "Preencha as informações para criar um novo opcional"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nome do opcional" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Descrição do opcional" 
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2">
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Cancelar
                  </Button>
                )}
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? "Atualizar" : "Salvar"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}