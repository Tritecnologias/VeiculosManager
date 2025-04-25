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
import { Brand, Model, Version, Color } from "@/lib/types";

const formSchema = z.object({
  modelId: z.string().min(1, "Selecione um modelo"),
  versionId: z.string().min(1, "Selecione uma versão"),
  colorId: z.string().min(1, "Selecione uma cor"),
  price: z.coerce.number().min(0, "O preço não pode ser negativo"),
  imageUrl: z.string().url("Informe uma URL válida").optional().or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;

export default function VersionColorForm() {
  const { toast } = useToast();
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);
  const [filteredVersions, setFilteredVersions] = useState<Version[]>([]);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      modelId: "",
      versionId: "",
      colorId: "",
      price: 0,
      imageUrl: "",
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
  
  const { data: colors = [] } = useQuery<Color[]>({
    queryKey: ["/api/colors"],
  });
  
  // Get selected brand from the model
  const [selectedBrandId, setSelectedBrandId] = useState<string>("");
  
  // Update filtered models when brand changes
  const handleBrandChange = (brandId: string) => {
    setSelectedBrandId(brandId);
    form.setValue("modelId", ""); // Reset model selection
    form.setValue("versionId", ""); // Reset version selection
    
    if (brandId) {
      const parsedBrandId = parseInt(brandId);
      setFilteredModels(models.filter(model => model.brandId === parsedBrandId));
    } else {
      setFilteredModels([]);
    }
    
    setFilteredVersions([]);
  };
  
  // Update filtered versions when model changes
  const handleModelChange = (modelId: string) => {
    form.setValue("modelId", modelId);
    form.setValue("versionId", ""); // Reset version selection
    
    if (modelId) {
      const parsedModelId = parseInt(modelId);
      setFilteredVersions(versions.filter(version => version.modelId === parsedModelId));
    } else {
      setFilteredVersions([]);
    }
  };
  
  const handleSubmit = async (values: FormValues) => {
    try {
      // Convert string IDs to numbers
      const data = {
        versionId: parseInt(values.versionId),
        colorId: parseInt(values.colorId),
        price: values.price,
        imageUrl: values.imageUrl || null,
      };
      
      await apiRequest("POST", "/api/version-colors", data);
      
      toast({
        title: "Cores associadas com sucesso",
        description: "A cor foi associada à versão selecionada.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/version-colors"] });
      
      // Reset form
      form.reset({
        modelId: "",
        versionId: "",
        colorId: "",
        price: 0,
        imageUrl: "",
      });
      setSelectedBrandId("");
      setFilteredModels([]);
      setFilteredVersions([]);
      
    } catch (error) {
      console.error("Failed to associate color with version:", error);
      toast({
        title: "Erro ao associar cor",
        description: "Ocorreu um erro ao associar a cor à versão.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Associar Pintura à Versão</CardTitle>
        <CardDescription>
          Escolha um modelo, versão e cor para associar uma pintura específica a uma versão de veículo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="modelId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <Select 
                      value={selectedBrandId} 
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
                      onValueChange={handleModelChange}
                      disabled={!selectedBrandId}
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
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="versionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Versão</FormLabel>
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
                      disabled={!form.getValues("modelId")}
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
                name="colorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pintura</FormLabel>
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma pintura" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {colors.map((color) => (
                          <SelectItem key={color.id} value={color.id.toString()}>
                            <div className="flex items-center">
                              <span className="w-4 h-4 mr-2 rounded-full" style={{ backgroundColor: color.hexCode }}></span>
                              {color.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
                        <Input 
                          className="pl-8" 
                          type="number"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL da Imagem</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="URL da imagem específica para esta combinação"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}