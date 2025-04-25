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
import { PaintType } from "@/lib/types";

const formSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
});

type FormValues = z.infer<typeof formSchema>;

interface PaintTypeFormProps {
  id?: number | null;
  initialData?: PaintType;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export default function PaintTypeForm({ id, initialData, onCancel, onSuccess }: PaintTypeFormProps) {
  const params = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isEditing = Boolean(id || params.id);
  const paintTypeId = id || params.id;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
    },
  });
  
  const { data: paintType, isLoading: isLoadingPaintType } = useQuery<PaintType>({
    queryKey: [isEditing && !initialData ? `/api/paint-types/${paintTypeId}` : null],
    queryFn: async () => {
      try {
        const response = await fetch(`api/paint-types/${paintTypeId}`);
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        console.log("Paint Type Detail API Response:", data);
        return data;
      } catch (error) {
        console.error(`Failed to fetch paint type ${paintTypeId}:`, error);
        return null;
      }
    },
    enabled: isEditing && !initialData,
  });
  
  useEffect(() => {
    if (paintType) {
      form.reset({
        name: paintType.name,
      });
    }
  }, [paintType, form]);
  
  const handleSubmit = async (values: FormValues) => {
    try {
      if (isEditing) {
        const response = await fetch(`api/paint-types/${paintTypeId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(values)
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        toast({
          title: "Tipo de pintura atualizado",
          description: "O tipo de pintura foi atualizado com sucesso!",
        });
      } else {
        const response = await fetch('api/paint-types', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(values)
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Novo tipo de pintura criado:', data);
        
        toast({
          title: "Tipo de pintura cadastrado",
          description: "O tipo de pintura foi cadastrado com sucesso!",
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/paint-types"] });
      
      if (onSuccess) {
        onSuccess();
      } else if (onCancel) {
        // Se estivermos dentro de outro componente
        onCancel();
      } else {
        // Se estivermos na página standalone
        navigate("/paint-types");
      }
    } catch (error) {
      console.error("Failed to save paint type:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar o tipo de pintura.",
        variant: "destructive",
      });
    }
  };
  
  if (isEditing && isLoadingPaintType) {
    return <div>Carregando...</div>;
  }
  
  return (
    <div>
      {!onCancel && (
        <div className="flex items-center mb-6">
          <Link href="/paint-types" className="mr-4">
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold text-gray-800">
            {isEditing ? "Editar Tipo de Pintura" : "Novo Tipo de Pintura"}
          </h1>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Editar Tipo de Pintura" : "Cadastrar Novo Tipo de Pintura"}</CardTitle>
          <CardDescription>
            {isEditing 
              ? "Atualize as informações do tipo de pintura"
              : "Preencha os campos para adicionar um novo tipo de pintura"
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
                    <FormLabel>Nome do Tipo de Pintura</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Perolizada" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2">
                {onCancel ? (
                  <Button variant="outline" type="button" onClick={onCancel}>
                    Cancelar
                  </Button>
                ) : (
                  <Link href="/paint-types">
                    <Button variant="outline" type="button">
                      Cancelar
                    </Button>
                  </Link>
                )}
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