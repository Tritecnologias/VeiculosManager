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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Brand, Model, Version, Color, FuelType, TransmissionType, VehicleSituation, Vehicle } from "@/lib/types";
import { formatBRCurrency, formatBRCurrencyWithSymbol, parseBRCurrency } from "@/lib/formatters";

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

// Schema de validação do formulário
const formSchema = z.object({
  brandId: z.string().min(1, "Selecione uma marca"),
  modelId: z.string().min(1, "Selecione um modelo"),
  versionId: z.string().min(1, "Selecione uma versão"),
  colorId: z.string().optional().default(""), // Tornando o campo cor opcional
  year: z.coerce.number().min(1900, "Ano inválido").max(new Date().getFullYear() + 5, "Ano muito avançado"),
  publicPrice: z.string().min(1, "Informe o preço público"),
  situation: z.enum(['available', 'unavailable', 'coming-soon']),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
  engine: z.string().min(2, "Informe o motor do veículo"),
  fuelType: z.enum(['flex', 'gasoline', 'diesel', 'electric', 'hybrid']),
  transmission: z.enum(['manual', 'automatic', 'cvt', 'dct']),
  isActive: z.boolean().default(true),
  pcdIpiIcms: z.string().default("0"),
  pcdIpi: z.string().default("0"),
  taxiIpiIcms: z.string().default("0"),
  taxiIpi: z.string().default("0")
});

type FormValues = z.infer<typeof formSchema>;

export default function VehicleFormFixed() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isEditing = Boolean(id);
  
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);
  const [filteredVersions, setFilteredVersions] = useState<Version[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
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
      pcdIpiIcms: "",
      pcdIpi: "",
      taxiIpiIcms: "",
      taxiIpi: ""
    },
  });
  
  // Consultas para buscar dados
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
  
  // Preencher o formulário com os dados do veículo quando estiver editando
  useEffect(() => {
    if (vehicle) {
      // Primeiro definimos a marca para disparar a filtragem
      form.setValue("brandId", vehicle.version.model.brandId.toString());
      
      // Filtra modelos pela marca
      const modelsForBrand = models.filter(
        model => model.brandId === vehicle.version.model.brandId
      );
      setFilteredModels(modelsForBrand);
      
      // Define o modelo
      form.setValue("modelId", vehicle.version.modelId.toString());
      
      // Filtra versões pelo modelo
      const versionsForModel = versions.filter(
        version => version.modelId === vehicle.version.modelId
      );
      setFilteredVersions(versionsForModel);
      
      // Define todos os valores restantes com formatação adequada
      form.reset({
        brandId: vehicle.version.model.brandId.toString(),
        modelId: vehicle.version.modelId.toString(),
        versionId: vehicle.versionId.toString(),
        colorId: vehicle.colorId ? vehicle.colorId.toString() : "",
        year: vehicle.year,
        publicPrice: formatBRCurrency(Number(vehicle.publicPrice)),
        situation: vehicle.situation,
        description: vehicle.description,
        engine: vehicle.engine,
        fuelType: vehicle.fuelType,
        transmission: vehicle.transmission,
        isActive: vehicle.isActive,
        pcdIpiIcms: formatBRCurrency(Number(vehicle.pcdIpiIcms)),
        pcdIpi: formatBRCurrency(Number(vehicle.pcdIpi)),
        taxiIpiIcms: formatBRCurrency(Number(vehicle.taxiIpiIcms)),
        taxiIpi: formatBRCurrency(Number(vehicle.taxiIpi))
      });
    }
  }, [vehicle, form, models, versions]);
  
  // Atualiza modelos filtrados quando a marca muda
  const handleBrandChange = (brandId: string) => {
    form.setValue("brandId", brandId);
    form.setValue("modelId", ""); // Reseta a seleção de modelo
    form.setValue("versionId", ""); // Reseta a seleção de versão
    
    if (brandId) {
      const parsedBrandId = parseInt(brandId);
      setFilteredModels(models.filter(model => model.brandId === parsedBrandId));
    } else {
      setFilteredModels([]);
    }
    
    setFilteredVersions([]);
  };
  
  // Atualiza versões filtradas quando o modelo muda
  const handleModelChange = (modelId: string) => {
    form.setValue("modelId", modelId);
    form.setValue("versionId", ""); // Reseta a seleção de versão
    
    if (modelId) {
      const parsedModelId = parseInt(modelId);
      setFilteredVersions(versions.filter(version => version.modelId === parsedModelId));
    } else {
      setFilteredVersions([]);
    }
  };
  
  // Formata um valor de entrada como moeda brasileira e retorna o valor formatado
  const formatCurrencyInput = (value: string): string => {
    // Remove tudo exceto números
    let numericValue = value.replace(/\D/g, '');
    
    // Converte para centavos (divide por 100 para manter decimais)
    const cents = parseInt(numericValue) / 100;
    
    // Formata como moeda brasileira sem o símbolo
    if (cents === 0) return '';
    
    return formatBRCurrency(cents);
  };
  
  // Calcula preços de isenção com base no preço público
  const handlePublicPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    
    // Remove o símbolo R$ e espaço, se presente
    const cleanValue = rawValue.replace(/^R\$\s?/, '');
    
    // Formata o valor
    const formattedValue = formatCurrencyInput(cleanValue);
    
    // Define o valor formatado no campo
    form.setValue("publicPrice", formattedValue);
    
    // Converte para número para cálculos
    const numericValue = parseFloat(formattedValue.replace(/\./g, "").replace(",", "."));
    
    if (!isNaN(numericValue)) {
      const pcdIpiIcms = numericValue * 0.88; // 12% desconto
      const pcdIpi = numericValue * 0.96; // 4% desconto
      const taxiIpiIcms = numericValue * 0.85; // 15% desconto
      const taxiIpi = numericValue * 0.96; // 4% desconto
      
      form.setValue("pcdIpiIcms", formatBRCurrency(pcdIpiIcms));
      form.setValue("pcdIpi", formatBRCurrency(pcdIpi));
      form.setValue("taxiIpiIcms", formatBRCurrency(taxiIpiIcms));
      form.setValue("taxiIpi", formatBRCurrency(taxiIpi));
    }
  };
  
  // Função de submissão do formulário simplificada e robusta
  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      console.log("Form submitted with values:", data);
      
      // Preparar dados para o backend
      const vehicleData = {
        brandId: parseInt(data.brandId),
        modelId: parseInt(data.modelId),
        versionId: parseInt(data.versionId),
        colorId: data.colorId && data.colorId !== "0" ? parseInt(data.colorId) : null,
        year: data.year,
        publicPrice: parseBRCurrency(data.publicPrice),
        situation: data.situation,
        description: data.description,
        engine: data.engine,
        fuelType: data.fuelType,
        transmission: data.transmission,
        isActive: data.isActive,
        pcdIpiIcms: parseBRCurrency(data.pcdIpiIcms),
        pcdIpi: parseBRCurrency(data.pcdIpi),
        taxiIpiIcms: parseBRCurrency(data.taxiIpiIcms),
        taxiIpi: parseBRCurrency(data.taxiIpi)
      };
      
      console.log("Preparando para enviar dados para a API:", vehicleData);
      
      // Tentativa de submissão direta com fetch para diagnóstico
      try {
        const endpoint = isEditing ? `/api/vehicles/${id}` : "/api/vehicles";
        const method = isEditing ? "PATCH" : "POST";
        
        console.log(`Enviando requisição ${method} para ${endpoint}`);
        
        const response = await fetch(endpoint, {
          method: method,
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(vehicleData),
          credentials: "include"
        });
        
        console.log("Resposta da API:", response.status, response.statusText);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Erro da API (${response.status}): ${errorText}`);
          throw new Error(`Erro ao salvar: ${response.status} ${errorText || response.statusText}`);
        }
        
        const responseData = await response.json();
        console.log("Dados da resposta:", responseData);
        
        // Feedback de sucesso
        toast({
          title: isEditing ? "Veículo atualizado" : "Veículo criado",
          description: isEditing 
            ? "As alterações foram salvas com sucesso." 
            : "O novo veículo foi cadastrado com sucesso."
        });
        
        // Invalidar cache
        queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
        
        if (isEditing) {
          // Se estiver editando, navegue de volta para a lista
          navigate("/vehicles");
        } else {
          // Se estiver criando um novo, limpe o formulário
          form.reset({
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
            pcdIpiIcms: "",
            pcdIpi: "",
            taxiIpiIcms: "",
            taxiIpi: ""
          });
          
          // Limpar os modelos e versões filtrados
          setFilteredModels([]);
          setFilteredVersions([]);
          
          // Rolar para o topo do formulário
          window.scrollTo({ top: 0, behavior: 'smooth' });
          
          toast({
            title: "Formulário limpo",
            description: "O formulário foi limpo para um novo cadastro.",
          });
        }
        
      } catch (fetchError) {
        console.error("Erro na requisição fetch:", fetchError);
        throw fetchError;
      }
      
    } catch (error) {
      console.error("Erro ao salvar veículo:", error);
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error 
          ? error.message 
          : "Falha ao comunicar com o servidor. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
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
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <TabsContent value="basic" className="space-y-6">
                  {/* Conteúdo da aba Informações Básicas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Campo: Marca */}
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
                    
                    {/* Campo: Modelo */}
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
                    
                    {/* Campo: Versão */}
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
                    
                    {/* Campo de cor removido - será null por padrão */}
                    
                    {/* Campo: Ano */}
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
                    
                    {/* Campo: Preço Público */}
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
                    
                    {/* Campo: Situação */}
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
                  
                  {/* Campo: Descrição */}
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
                  
                  {/* Campo: Status Ativo */}
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
                  {/* Conteúdo da aba Detalhes Técnicos */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Campo: Motor */}
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
                    
                    {/* Campo: Combustível */}
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
                    
                    {/* Campo: Câmbio */}
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
                </TabsContent>
                
                <TabsContent value="pricing" className="space-y-6">
                  {/* Conteúdo da aba Preços Especiais */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Campo: PCD (IPI+ICMS) */}
                    <FormField
                      control={form.control}
                      name="pcdIpiIcms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PCD (IPI+ICMS)</FormLabel>
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
                    
                    {/* Campo: PCD (IPI) */}
                    <FormField
                      control={form.control}
                      name="pcdIpi"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PCD (IPI)</FormLabel>
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
                    
                    {/* Campo: Taxi (IPI+ICMS) */}
                    <FormField
                      control={form.control}
                      name="taxiIpiIcms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Taxi (IPI+ICMS)</FormLabel>
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
                    
                    {/* Campo: Taxi (IPI) */}
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
                    <Button variant="outline" type="button" disabled={isSubmitting}>
                      Cancelar
                    </Button>
                  </Link>
                  <Button 
                    type="button" 
                    disabled={isSubmitting}
                    onClick={(e) => {
                      e.preventDefault();
                      console.log("Botão Salvar clicado manualmente");
                      form.handleSubmit(onSubmit)(e);
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        {isEditing ? "Salvando..." : "Cadastrando..."}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar
                      </>
                    )}
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