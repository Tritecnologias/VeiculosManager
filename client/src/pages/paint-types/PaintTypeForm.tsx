import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
});

type FormValues = z.infer<typeof formSchema>;

interface PaintTypeFormProps {
  id?: number;
  initialData?: any;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export default function PaintTypeForm({
  id,
  initialData,
  onCancel,
  onSuccess,
}: PaintTypeFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      if (id) {
        await apiRequest("PATCH", `/api/paint-types/${id}`, values);
        toast({
          title: "Tipo de pintura atualizado",
          description: "O tipo de pintura foi atualizado com sucesso.",
        });
      } else {
        await apiRequest("POST", "/api/paint-types", values);
        toast({
          title: "Tipo de pintura criado",
          description: "O tipo de pintura foi criado com sucesso.",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["/api/paint-types"] });
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error saving paint type:", error);
      toast({
        title: "Erro ao salvar tipo de pintura",
        description: "Ocorreu um erro ao salvar o tipo de pintura.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome do tipo de pintura" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? "Salvando..."
              : id
              ? "Atualizar"
              : "Criar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}