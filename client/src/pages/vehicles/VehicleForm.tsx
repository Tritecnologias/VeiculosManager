import { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Brand, Model, Version, Color, FuelType, TransmissionType, VehicleSituation, Vehicle } from "@/lib/types";

const FUEL_TYPES = [
  { value: 'flex', label: 'Flex' },
  { value: 'gasoline', label: 'Gasolina' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Elétrico' },
  { value: 'hybrid', label: 'Híbrido' }
];

const TRANSMISSION_TYPES = [
  { value: 'manual', label: 'Manual' },
  { value: 'automatic', label: 'Automático' },
  { value: 'cvt', label: 'CVT' },
  { value: 'dct', label: 'DCT (Dupla Embreagem)' }
];

const SITUATIONS = [
  { value: 'available', label: 'Disponível' },
  { value: 'unavailable', label: 'Indisponível' },
  { value: 'coming-soon', label: 'Em breve' }
];

// Função para converter valores monetários em formato brasileiro para números
const parseBRCurrency = (value: string): number => {
  if (!value) return 0;
  
  // Remove 'R$', pontos e substitui vírgula por ponto para que o JavaScript possa transformar em float
  const numericValue = value.replace('R$', '').replace(/\./g, '').replace(',', '.');
  const parsed = parseFloat(numericValue);
  
  return isNaN(parsed) ? 0 : parsed;
};

const formSchema = z.object({
  brandId: z.string().min(1, "Selecione uma marca"),
  modelId: z.string().min(1, "Selecione um modelo"),
  versionId: z.string().min(1, "Selecione uma versão"),
  colorId: z.string().min(1, "Selecione uma cor"),
  year: z.coerce.number().min(1900, "Ano inválido").max(new Date().getFullYear() + 5, "Ano muito avançado"),
  publicPrice: z.string()
    .transform((val) => parseBRCurrency(val))
    .refine((val) => val >= 0, "O preço deve ser um valor numérico positivo"),
  situation: z.enum(['available', 'unavailable', 'coming-soon']),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
  engine: z.string().min(2, "Informe o motor do veículo"),
  fuelType: z.enum(['flex', 'gasoline', 'diesel', 'electric', 'hybrid']),
  transmission: z.enum(['manual', 'automatic', 'cvt', 'dct']),
  isActive: z.boolean(),
  pcdIpiIcms: z.string()
    .transform((val) => parseBRCurrency(val))
    .refine((val) => val >= 0, "O valor deve ser um valor numérico positivo"),
  pcdIpi: z.string()
    .transform((val) => parseBRCurrency(val))
    .refine((val) => val >= 0, "O valor deve ser um valor numérico positivo"),
  taxiIpiIcms: z.string()
    .transform((val) => parseBRCurrency(val))
    .refine((val) => val >= 0, "O valor deve ser um valor numérico positivo"),
  taxiIpi: z.string()
    .transform((val) => parseBRCurrency(val))
    .refine((val) => val >= 0, "O valor deve ser um valor numérico positivo")
});

type FormValues = {
  brandId: string;
  modelId: string;
  versionId: string;
  colorId: string;
  year: number;
  publicPrice: string;
  situation: 'available' | 'unavailable' | 'coming-soon';
  description: string;
  engine: string;
  fuelType: 'flex' | 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  transmission: 'manual' | 'automatic' | 'cvt' | 'dct';
  isActive: boolean;
  pcdIpiIcms: string;
  pcdIpi: string;
  taxiIpiIcms: string;
  taxiIpi: string;
};

export default function VehicleForm() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isEditing = Boolean(id);
  
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);
  const [filteredVersions, setFilteredVersions] = useState<Version[]>([]);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brandId: "",
      modelId: "",
      versionId: "",
      colorId: "",
      year: new Date().getFullYear(),
      publicPrice: "0",
      situation: "available",
      description: "",
      engine: "",
      fuelType: "flex",
      transmission: "automatic",
      isActive: true,
      pcdIpiIcms: "0",
      pcdIpi: "0",
      taxiIpiIcms: "0",
      taxiIpi: "0"
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
  
  const { data: vehicle, isLoading: isLoadingVehicle } = useQuery<Vehicle>({
    queryKey: [isEditing ? `/api/vehicles/${id}` : null],
    enabled: isEditing,
  });
  
  useEffect(() => {
    if (vehicle) {
      // First set the brand to trigger the filtering
      form.setValue("brandId", vehicle.version.model.brandId.toString());
      
      // Filter models based on brand
      const modelsForBrand = models.filter(
        model => model.brandId === vehicle.version.model.brandId
      );
      setFilteredModels(modelsForBrand);
      
      // Then set the model
      form.setValue("modelId", vehicle.version.modelId.toString());
      
      // Filter versions based on model
      const versionsForModel = versions.filter(
        version => version.modelId === vehicle.version.modelId
      );
      setFilteredVersions(versionsForModel);
      
      // Set all remaining values
      form.reset({
        brandId: vehicle.version.model.brandId.toString(),
        modelId: vehicle.version.modelId.toString(),
        versionId: vehicle.versionId.toString(),
        colorId: vehicle.colorId ? vehicle.colorId.toString() : "",
        year: vehicle.year,
        publicPrice: vehicle.publicPrice.toString(),
        situation: vehicle.situation,
        description: vehicle.description,
        engine: vehicle.engine,
        fuelType: vehicle.fuelType,
        transmission: vehicle.transmission,
        isActive: vehicle.isActive,
        pcdIpiIcms: vehicle.pcdIpiIcms.toString(),
        pcdIpi: vehicle.pcdIpi.toString(),
        taxiIpiIcms: vehicle.taxiIpiIcms.toString(),
        taxiIpi: vehicle.taxiIpi.toString()
      });
    }
  }, [vehicle, form, models, versions]);
  
  // Update filtered models when brand changes
  const handleBrandChange = (brandId: string) => {
    form.setValue("brandId", brandId);
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
  
  // Função para formatar números em formato monetário brasileiro
  const formatBRCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Calculate tax exemption prices based on public price
  const handlePublicPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Aplica o valor não formatado no campo de entrada
    form.setValue("publicPrice", value);
    
    // Converte para float para cálculos
    const publicPriceStr = parseBRCurrency(value);
    const publicPrice = parseFloat(publicPriceStr);
    
    if (!isNaN(publicPrice)) {
      // These are just example calculations, adjust according to actual rules
      const pcdIpiIcms = publicPrice * 0.88; // 12% discount
      const pcdIpi = publicPrice * 0.96; // 4% discount
      const taxiIpiIcms = publicPrice * 0.85; // 15% discount
      const taxiIpi = publicPrice * 0.96; // 4% discount
      
      // Define valores formatados nos campos respectivos
      form.setValue("pcdIpiIcms", formatBRCurrency(pcdIpiIcms));
      form.setValue("pcdIpi", formatBRCurrency(pcdIpi));
      form.setValue("taxiIpiIcms", formatBRCurrency(taxiIpiIcms));
      form.setValue("taxiIpi", formatBRCurrency(taxiIpi));
    }
  };
  
  const handleSubmit = async (values: FormValues) => {
    try {
      console.log("Form values:", values);
      
      // Verifica se os campos obrigatórios estão preenchidos
      if (!values.brandId || !values.modelId || !values.versionId) {
        console.error("Campos obrigatórios não preenchidos", { 
          brandId: values.brandId, 
          modelId: values.modelId, 
          versionId: values.versionId 
        });
        toast({
          title: "Campos obrigatórios",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive",
        });
        return;
      }
      
      // Convert string values to appropriate types for the backend
      const vehicleData = {
        ...values,
        // Convert string IDs to numbers
        brandId: parseInt(values.brandId),
        modelId: parseInt(values.modelId),
        versionId: parseInt(values.versionId),
        colorId: values.colorId ? parseInt(values.colorId) : undefined,
        // Convert string currency values to numbers
        publicPrice: parseBRCurrency(values.publicPrice),
        pcdIpiIcms: parseBRCurrency(values.pcdIpiIcms),
        pcdIpi: parseBRCurrency(values.pcdIpi),
        taxiIpiIcms: parseBRCurrency(values.taxiIpiIcms),
        taxiIpi: parseBRCurrency(values.taxiIpi)
      };
      
      console.log("Vehicle data to send:", vehicleData);
      
      if (isEditing) {
        console.log("Updating vehicle with ID:", id);
        const response = await apiRequest("PATCH", `/api/vehicles/${id}`, vehicleData);
        console.log("Update response:", response);
        toast({
          title: "Veículo atualizado",
          description: "O veículo foi atualizado com sucesso!",
        });
      } else {
        console.log("Creating new vehicle");
        const response = await apiRequest("POST", "/api/vehicles", vehicleData);
        console.log("Create response:", response);
        toast({
          title: "Veículo cadastrado",
          description: "O veículo foi cadastrado com sucesso!",
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      navigate("/vehicles");
    } catch (error) {
      console.error("Failed to save vehicle:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar o veículo.",
        variant: "destructive",
      });
    }
  };
  
  if (isEditing && isLoadingVehicle) {
    return <div>Carregando...</div>;
  }
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <Link href="/vehicles" className="mr-4">
          <Button variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold text-gray-800">
          {isEditing ? "Editar Veículo" : "Novo Veículo"}
        </h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Editar Veículo" : "Cadastrar Novo Veículo"}</CardTitle>
          <CardDescription>
            {isEditing 
              ? "Atualize as informações do veículo"
              : "Preencha os campos para adicionar um novo veículo"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic">
            <TabsList className="mb-6">
              <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
              <TabsTrigger value="details">Detalhes Técnicos</TabsTrigger>
              <TabsTrigger value="pricing">Preços Especiais</TabsTrigger>
            </TabsList>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <TabsContent value="basic" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                            onValueChange={handleModelChange}
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
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ano</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="publicPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preço Público</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
                              <Input 
                                className="pl-8" 
                                {...field} 
                                onChange={(e) => {
                                  field.onChange(e);
                                  handlePublicPriceChange(e);
                                }}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="situation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Situação</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a situação" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {SITUATIONS.map((situation) => (
                                <SelectItem key={situation.value} value={situation.value}>
                                  {situation.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descreva as características do veículo" 
                            className="min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Status Ativo/Inativo</FormLabel>
                          <FormDescription>
                            {field.value ? 'O veículo está ativo e será exibido no sistema.' : 'O veículo está inativo e não será exibido no sistema.'}
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </TabsContent>
                
                <TabsContent value="details" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="engine"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Motor</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 1.0 TSI" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="fuelType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Combustível</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo de combustível" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {FUEL_TYPES.map((fuel) => (
                                <SelectItem key={fuel.value} value={fuel.value}>
                                  {fuel.label}
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
                      name="transmission"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Câmbio</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo de câmbio" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {TRANSMISSION_TYPES.map((transmission) => (
                                <SelectItem key={transmission.value} value={transmission.value}>
                                  {transmission.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Seção de "Cores Disponíveis" foi removida conforme solicitado */}
                </TabsContent>
                
                <TabsContent value="pricing" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="pcdIpiIcms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Def. Físico (IPI/ICMS)</FormLabel>
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
                    
                    <FormField
                      control={form.control}
                      name="pcdIpi"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Def. Físico (IPI)</FormLabel>
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
                    
                    <FormField
                      control={form.control}
                      name="taxiIpiIcms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Taxi (IPI/ICMS)</FormLabel>
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
                    
                    <FormField
                      control={form.control}
                      name="taxiIpi"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Taxi (IPI)</FormLabel>
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
                </TabsContent>
                
                <div className="flex justify-end space-x-2">
                  <Link href="/vehicles">
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
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
