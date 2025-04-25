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
import { Color, PaintType } from "@/lib/types";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  hexCode: z.string().min(4, "Código de cor inválido"),
  additionalPrice: z.coerce.number().min(0, "O preço não pode ser negativo"),
  imageUrl: z.string().optional(),
  paintTypeId: z.number().nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ColorFormProps {
  id?: number | null;
  onCancel?: () => void;
}

export default function ColorForm({ id, onCancel }: ColorFormProps) {
  const params = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isEditing = Boolean(id || params.id);
  const colorId = id || params.id;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      hexCode: "#000000",
      additionalPrice: 0,
      imageUrl: "",
      paintTypeId: null,
    },
  });
  
  const { data: color, isLoading: isLoadingColor } = useQuery<Color>({
    queryKey: [isEditing ? `/api/colors/${colorId}` : null],
    enabled: isEditing,
  });
  
  const { data: paintTypes = [], isLoading: isLoadingPaintTypes } = useQuery<PaintType[]>({
    queryKey: ["/api/paint-types"],
    queryFn: async () => {
      const response = await apiRequest<PaintType[]>("GET", "/api/paint-types");
      return response || [];
    },
  });
  
  useEffect(() => {
    if (color) {
      form.reset({
        name: color.name,
        hexCode: color.hexCode,
        additionalPrice: color.additionalPrice,
        imageUrl: color.imageUrl || "",
        paintTypeId: color.paintTypeId || null,
      });
    }
  }, [color, form]);
  
  const handleSubmit = async (values: FormValues) => {
    try {
      if (isEditing) {
        await apiRequest("PATCH", `/api/colors/${colorId}`, values);
        toast({
          title: "Cor atualizada",
          description: "A cor foi atualizada com sucesso!",
        });
      } else {
        await apiRequest("POST", "/api/colors", values);
        toast({
          title: "Cor cadastrada",
          description: "A cor foi cadastrada com sucesso!",
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/colors"] });
      
      if (onCancel) {
        // If we're inside the ColorTabs component
        onCancel();
      } else {
        // If we're on the standalone page
        navigate("/colors");
      }
    } catch (error) {
      console.error("Failed to save color:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar a cor.",
        variant: "destructive",
      });
    }
  };
  
  if (isEditing && isLoadingColor) {
    return <div>Carregando...</div>;
  }
  
  return (
    <div>
      {!onCancel && (
        <div className="flex items-center mb-6">
          <Link href="/colors" className="mr-4">
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold text-gray-800">
            {isEditing ? "Editar Cor" : "Nova Cor"}
          </h1>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Editar Cor" : "Cadastrar Nova Cor"}</CardTitle>
          <CardDescription>
            {isEditing 
              ? "Atualize as informações da cor"
              : "Preencha os campos para adicionar uma nova cor"
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
                    <FormLabel>Nome da Cor</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Preto Ninja" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="hexCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código Hexadecimal</FormLabel>
                      <div className="flex items-center gap-2">
                        <Input type="color" {...field} className="w-12 h-10 p-1" />
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="additionalPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço Adicional</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
                          <Input className="pl-8" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL da Imagem (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="URL da imagem da cor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="paintTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Pintura</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                        value={field.value ? field.value.toString() : undefined}
                        defaultValue={field.value ? field.value.toString() : undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de pintura" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Nenhum tipo selecionado</SelectItem>
                          {paintTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id.toString()}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                {onCancel ? (
                  <Button variant="outline" type="button" onClick={onCancel}>
                    Cancelar
                  </Button>
                ) : (
                  <Link href="/colors">
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
