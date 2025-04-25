import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brand, Model, Version, Color, Vehicle } from "@/lib/types";
import { formatCurrency } from "@/lib/formatters";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function Configurator() {
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [selectedModelId, setSelectedModelId] = useState("");
  const [selectedVersionId, setSelectedVersionId] = useState("");
  const [selectedColorId, setSelectedColorId] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [discountPercent, setDiscountPercent] = useState("0");
  const [discountAmount, setDiscountAmount] = useState("0");
  const [markupAmount, setMarkupAmount] = useState("0");
  const [quantity, setQuantity] = useState("1");
  const [selectedTab, setSelectedTab] = useState("equipamentos");

  // Fetch brands
  const { data: brands = [] } = useQuery<Brand[]>({
    queryKey: ["/api/brands"],
  });

  // Fetch models
  const { data: allModels = [] } = useQuery<Model[]>({
    queryKey: ["/api/models"],
  });

  // Fetch versions
  const { data: allVersions = [] } = useQuery<Version[]>({
    queryKey: ["/api/versions"],
  });

  // Fetch colors
  const { data: allColors = [] } = useQuery<Color[]>({
    queryKey: ["/api/colors"],
  });

  // Fetch vehicles
  const { data: allVehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  // Filtered models based on selected brand
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);
  
  // Filtered versions based on selected model
  const [filteredVersions, setFilteredVersions] = useState<Version[]>([]);
  
  // Filtered colors for the selected version
  const [availableColors, setAvailableColors] = useState<Color[]>([]);
  
  // Price calculations
  const [basePrice, setBasePrice] = useState(0);
  const [colorPrice, setColorPrice] = useState(0);
  const [pcdIpiIcmsPrice, setPcdIpiIcmsPrice] = useState(0);
  const [pcdIpiPrice, setPcdIpiPrice] = useState(0);
  const [taxiIpiIcmsPrice, setTaxiIpiIcmsPrice] = useState(0);
  const [taxiIpiPrice, setTaxiIpiPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  
  // Select a brand
  const handleBrandChange = (brandId: string) => {
    setSelectedBrandId(brandId);
    setSelectedModelId("");
    setSelectedVersionId("");
    setSelectedColorId("");
    setSelectedVehicle(null);
    
    if (brandId) {
      const brandModels = allModels.filter(model => model.brandId === parseInt(brandId));
      setFilteredModels(brandModels);
    } else {
      setFilteredModels([]);
    }
  };
  
  // Select a model
  const handleModelChange = (modelId: string) => {
    setSelectedModelId(modelId);
    setSelectedVersionId("");
    setSelectedColorId("");
    setSelectedVehicle(null);
    
    if (modelId) {
      const modelVersions = allVersions.filter(version => version.modelId === parseInt(modelId));
      setFilteredVersions(modelVersions);
    } else {
      setFilteredVersions([]);
    }
  };
  
  // Select a version
  const handleVersionChange = (versionId: string) => {
    setSelectedVersionId(versionId);
    setSelectedColorId("");
    
    if (versionId) {
      const parsedVersionId = parseInt(versionId);
      
      // Find vehicle with this version
      const vehicle = allVehicles.find(v => v.versionId === parsedVersionId);
      setSelectedVehicle(vehicle || null);
      
      if (vehicle) {
        setBasePrice(parseFloat(vehicle.publicPrice.toString()));
        setPcdIpiIcmsPrice(parseFloat(vehicle.pcdIpiIcms.toString()));
        setPcdIpiPrice(parseFloat(vehicle.pcdIpi.toString()));
        setTaxiIpiIcmsPrice(parseFloat(vehicle.taxiIpiIcms.toString()));
        setTaxiIpiPrice(parseFloat(vehicle.taxiIpi.toString()));
      }
      
      // Find available colors for this version
      const colors = allColors.filter(c => true); // In a real implementation, we would filter by version-specific colors
      setAvailableColors(colors);
    } else {
      setSelectedVehicle(null);
      setBasePrice(0);
      setPcdIpiIcmsPrice(0);
      setPcdIpiPrice(0);
      setTaxiIpiIcmsPrice(0);
      setTaxiIpiPrice(0);
      setAvailableColors([]);
    }
  };
  
  // Select a color
  const handleColorChange = (colorId: string) => {
    setSelectedColorId(colorId);
    
    if (colorId) {
      const color = allColors.find(c => c.id === parseInt(colorId));
      if (color) {
        setColorPrice(parseFloat(color.additionalPrice.toString()));
      } else {
        setColorPrice(0);
      }
    } else {
      setColorPrice(0);
    }
  };
  
  // Handle discount percent change
  const handleDiscountPercentChange = (value: string) => {
    setDiscountPercent(value);
    if (value && basePrice > 0) {
      const discountPercentValue = parseFloat(value);
      const newDiscountAmount = (basePrice * discountPercentValue / 100).toFixed(2);
      setDiscountAmount(newDiscountAmount);
    } else {
      setDiscountAmount("0");
    }
  };
  
  // Handle discount amount change
  const handleDiscountAmountChange = (value: string) => {
    setDiscountAmount(value);
    if (value && basePrice > 0) {
      const discountAmountValue = parseFloat(value);
      const newDiscountPercent = ((discountAmountValue / basePrice) * 100).toFixed(2);
      setDiscountPercent(newDiscountPercent);
    } else {
      setDiscountPercent("0");
    }
  };
  
  // Update total price whenever relevant inputs change
  useEffect(() => {
    if (basePrice > 0) {
      const discountAmountValue = parseFloat(discountAmount) || 0;
      const markupAmountValue = parseFloat(markupAmount) || 0;
      const quantityValue = parseInt(quantity) || 1;
      
      const subtotal = basePrice + colorPrice;
      const withDiscount = subtotal - discountAmountValue;
      const withMarkup = withDiscount + markupAmountValue;
      const total = withMarkup * quantityValue;
      
      setTotalPrice(subtotal);
      setFinalPrice(total);
    } else {
      setTotalPrice(0);
      setFinalPrice(0);
    }
  }, [basePrice, colorPrice, discountAmount, markupAmount, quantity]);
  
  // Get color card background style
  const getColorStyle = (hexCode: string) => {
    return {
      backgroundColor: hexCode,
      width: '100%',
      height: '60px',
      borderRadius: '4px',
      marginBottom: '8px'
    };
  };
  
  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader className="bg-primary text-white">
          <CardTitle className="text-xl">Configurador</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <Label htmlFor="brand-select">Marca</Label>
              <Select 
                value={selectedBrandId} 
                onValueChange={handleBrandChange}
              >
                <SelectTrigger id="brand-select">
                  <SelectValue placeholder="Selecione uma marca" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map(brand => (
                    <SelectItem key={brand.id} value={brand.id.toString()}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="model-select">Modelo</Label>
              <Select 
                value={selectedModelId} 
                onValueChange={handleModelChange}
                disabled={!selectedBrandId}
              >
                <SelectTrigger id="model-select">
                  <SelectValue placeholder="Selecione um modelo" />
                </SelectTrigger>
                <SelectContent>
                  {filteredModels.map(model => (
                    <SelectItem key={model.id} value={model.id.toString()}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="version-select">Versão</Label>
              <Select 
                value={selectedVersionId} 
                onValueChange={handleVersionChange}
                disabled={!selectedModelId}
              >
                <SelectTrigger id="version-select">
                  <SelectValue placeholder="Selecione uma versão" />
                </SelectTrigger>
                <SelectContent>
                  {filteredVersions.map(version => (
                    <SelectItem key={version.id} value={version.id.toString()}>
                      {version.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {selectedVehicle && (
            <>
              <h3 className="text-xl font-bold mb-4">
                {selectedBrandId && brands.find(b => b.id === parseInt(selectedBrandId))?.name} {" "}
                {selectedModelId && filteredModels.find(m => m.id === parseInt(selectedModelId))?.name} {" "}
                {selectedVersionId && filteredVersions.find(v => v.id === parseInt(selectedVersionId))?.name} {" "}
                FLEX MY{selectedVehicle.year}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <Card className="p-4">
                      <div className="text-xs mb-1">PREÇO PÚBLICO</div>
                      <div className="font-bold">{formatCurrency(basePrice)}</div>
                    </Card>
                    
                    <Card className="p-4 bg-slate-100">
                      <div className="text-xs mb-1">ZONA FRANCA</div>
                      <div className="font-bold">{formatCurrency(basePrice * 0.85)}</div>
                    </Card>
                    
                    <Card className="p-4 bg-slate-100">
                      <div className="text-xs mb-1">PCD IPI</div>
                      <div className="font-bold">{formatCurrency(pcdIpiPrice)}</div>
                    </Card>
                    
                    <Card className="p-4 bg-slate-100">
                      <div className="text-xs mb-1">TAXI IPI/ICMS</div>
                      <div className="font-bold">{formatCurrency(taxiIpiIcmsPrice)}</div>
                    </Card>
                    
                    <Card className="p-4 bg-slate-100">
                      <div className="text-xs mb-1">PCD IPI/ICMS</div>
                      <div className="font-bold">{formatCurrency(pcdIpiIcmsPrice)}</div>
                    </Card>
                    
                    <Card className="p-4 bg-slate-100">
                      <div className="text-xs mb-1">TAXI IPI</div>
                      <div className="font-bold">{formatCurrency(taxiIpiPrice)}</div>
                    </Card>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <Label htmlFor="discount-select">DESCONTOS VENDA DIRETA</Label>
                      <Select defaultValue="0">
                        <SelectTrigger id="discount-select">
                          <SelectValue placeholder="Selecione um desconto" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Nenhum</SelectItem>
                          <SelectItem value="5">5%</SelectItem>
                          <SelectItem value="10">10%</SelectItem>
                          <SelectItem value="15">15%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="discount-percent">DESC.%</Label>
                      <div className="relative">
                        <Input 
                          id="discount-percent"
                          type="number" 
                          value={discountPercent}
                          onChange={(e) => handleDiscountPercentChange(e.target.value)}
                          className="pl-6" 
                        />
                        <span className="absolute left-2 top-2">%</span>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="discount-amount">DESC. R$</Label>
                      <div className="relative">
                        <Input 
                          id="discount-amount"
                          type="number" 
                          value={discountAmount}
                          onChange={(e) => handleDiscountAmountChange(e.target.value)}
                          className="pl-6" 
                        />
                        <span className="absolute left-2 top-2">R$</span>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="markup-amount">ÁGIO R$</Label>
                      <div className="relative">
                        <Input 
                          id="markup-amount"
                          type="number" 
                          value={markupAmount}
                          onChange={(e) => setMarkupAmount(e.target.value)}
                          className="pl-6" 
                        />
                        <span className="absolute left-2 top-2">R$</span>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="quantity">QT.</Label>
                      <Input 
                        id="quantity"
                        type="number" 
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <Tabs defaultValue="equipamentos" value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
                    <TabsList className="w-full">
                      <TabsTrigger value="equipamentos" className="flex-1">Equipamentos</TabsTrigger>
                      <TabsTrigger value="diagrama" className="flex-1">Diagrama</TabsTrigger>
                    </TabsList>
                    <TabsContent value="equipamentos" className="p-4 border rounded-md mt-2">
                      <Accordion type="single" collapsible>
                        <AccordionItem value="opcionais">
                          <AccordionTrigger>OPCIONAIS</AccordionTrigger>
                          <AccordionContent>
                            <div className="py-2 text-center text-gray-500">
                              NÃO HÁ OPCIONAIS PARA ESSE MODELO!
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </TabsContent>
                    <TabsContent value="diagrama" className="p-4 border rounded-md mt-2">
                      <div className="flex justify-center items-center h-64">
                        {selectedVehicle && selectedVehicle.color && selectedVehicle.color.imageUrl ? (
                          <img 
                            src={selectedVehicle.color.imageUrl} 
                            alt="Vehicle diagram"
                            className="max-h-full object-contain"
                          />
                        ) : (
                          <div className="text-gray-500">Diagrama não disponível</div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold mb-4">Pinturas</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {availableColors.map(color => (
                      <button 
                        key={color.id} 
                        className={`p-2 border rounded ${selectedColorId === color.id.toString() ? 'border-primary ring-2 ring-primary ring-opacity-50' : 'border-gray-200'}`}
                        onClick={() => handleColorChange(color.id.toString())}
                      >
                        <div style={getColorStyle(color.hexCode)} />
                        <div className="text-sm font-medium">{color.name}</div>
                        <div className="text-xs text-gray-500">{color.paintType?.name || 'Sem tipo'}</div>
                        <div className="text-sm">{formatCurrency(parseFloat(color.additionalPrice.toString()))}</div>
                      </button>
                    ))}
                  </div>
                  
                  <div className="mt-auto">
                    <h4 className="text-lg font-semibold mb-4">Resumo e Valores Finais</h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <Card className="p-4">
                        <div className="text-xs mb-1">Preço Público</div>
                        <div className="font-bold">{formatCurrency(basePrice)}</div>
                      </Card>
                      
                      <Card className="p-4">
                        <div className="text-xs mb-1">Pintura + Opcionais</div>
                        <div className="font-bold">{formatCurrency(colorPrice)}</div>
                      </Card>
                      
                      <Card className="p-4">
                        <div className="text-xs mb-1">Total</div>
                        <div className="font-bold">{formatCurrency(totalPrice)}</div>
                      </Card>
                      
                      <Card className="p-4">
                        <div className="text-xs mb-1">Desc. {discountPercent}%</div>
                        <div className="font-bold">{formatCurrency(parseFloat(discountAmount))}</div>
                      </Card>
                    </div>
                    
                    <Card className="p-4 bg-primary text-white">
                      <div className="text-sm mb-1">Preço Final x{quantity}</div>
                      <div className="text-xl font-bold">{formatCurrency(finalPrice)}</div>
                    </Card>
                    
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold mb-2">Outras Informações</h4>
                      <textarea 
                        className="w-full p-2 border border-gray-300 rounded-md"
                        rows={4}
                        placeholder="Informações adicionais para serem inseridas nessa cotação"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
