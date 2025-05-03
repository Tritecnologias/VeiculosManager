import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, RefreshCw } from "lucide-react";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Brand, Model, Version } from "@/lib/types";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { formatBRCurrency } from "@/lib/formatters";

interface VersionOptional {
  id: number;
  versionId: number;
  optionalId: number;
  price: number;
  version: {
    id: number;
    name: string;
    modelId: number;
    model: {
      id: number;
      name: string;
      brandId: number;
      brand: {
        id: number;
        name: string;
      }
    }
  };
  optional: {
    id: number;
    name: string;
    description: string;
    additionalPrice: number;
    imageUrl: string | null;
  };
}

export default function VersionOptionalList() {
  const { toast } = useToast();
  const [selectedBrandId, setSelectedBrandId] = useState<string>("all");
  const [selectedModelId, setSelectedModelId] = useState<string>("all");
  const [selectedVersionId, setSelectedVersionId] = useState<string>("all");
  
  const [filteredVersionOptionals, setFilteredVersionOptionals] = useState<VersionOptional[]>([]);

  const { data: brands = [] } = useQuery<Brand[]>({
    queryKey: ["/api/brands"],
    queryFn: getQueryFn(),
  });
  
  const { data: models = [] } = useQuery<Model[]>({
    queryKey: ["/api/models"],
    queryFn: getQueryFn(),
  });
  
  const { data: versions = [] } = useQuery<Version[]>({
    queryKey: ["/api/versions"],
    queryFn: getQueryFn(),
  });
  
  const { data: versionOptionals = [], isLoading, refetch } = useQuery<VersionOptional[]>({
    queryKey: ["/api/version-optionals"],
    queryFn: getQueryFn(),
  });

  // Filter models based on selected brand
  const filteredModels = selectedBrandId !== "all"
    ? models.filter(m => m.brandId === parseInt(selectedBrandId))
    : models;

  // Filter versions based on selected model
  const filteredVersions = selectedModelId !== "all"
    ? versions.filter(v => v.modelId === parseInt(selectedModelId))
    : versions;

  useEffect(() => {
    // Reset downstream filters when parent filter changes
    if (selectedBrandId === "all") {
      setSelectedModelId("all");
    }
    if (selectedModelId === "all") {
      setSelectedVersionId("all");
    }
  }, [selectedBrandId, selectedModelId]);

  useEffect(() => {
    let filtered = [...versionOptionals];
    
    // Apply brand filter if selected
    if (selectedBrandId !== "all") {
      filtered = filtered.filter(vc => 
        vc.version.model.brand.id === parseInt(selectedBrandId)
      );
    }
    
    // Apply model filter if selected
    if (selectedModelId !== "all") {
      filtered = filtered.filter(vc => 
        vc.version.model.id === parseInt(selectedModelId)
      );
    }
    
    // Apply version filter if selected
    if (selectedVersionId !== "all") {
      filtered = filtered.filter(vc => 
        vc.version.id === parseInt(selectedVersionId)
      );
    }
    
    setFilteredVersionOptionals(filtered);
  }, [versionOptionals, selectedBrandId, selectedModelId, selectedVersionId]);

  const handleDelete = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/version-optionals/${id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/version-optionals"] });
      
      toast({
        title: "Associação removida",
        description: "A associação entre o opcional e a versão foi removida com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao remover associação:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao remover a associação.",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Lista atualizada",
      description: "A lista de associações foi atualizada.",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Opcionais Associados às Versões</CardTitle>
        <Button variant="outline" size="icon" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Marca
            </label>
            <Select
              value={selectedBrandId}
              onValueChange={setSelectedBrandId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por marca" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as marcas</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id.toString()}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Modelo
            </label>
            <Select
              value={selectedModelId}
              onValueChange={setSelectedModelId}
              disabled={selectedBrandId === "all"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por modelo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os modelos</SelectItem>
                {filteredModels.map((model) => (
                  <SelectItem key={model.id} value={model.id.toString()}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Versão
            </label>
            <Select
              value={selectedVersionId}
              onValueChange={setSelectedVersionId}
              disabled={selectedModelId === "all"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por versão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as versões</SelectItem>
                {filteredVersions.map((version) => (
                  <SelectItem key={version.id} value={version.id.toString()}>
                    {version.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">Carregando...</div>
        ) : filteredVersionOptionals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhuma associação encontrada</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Versão</TableHead>
                <TableHead>Opcional</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVersionOptionals.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.version.model.brand.name}</TableCell>
                  <TableCell>{item.version.model.name}</TableCell>
                  <TableCell>{item.version.name}</TableCell>
                  <TableCell>{item.optional.name}</TableCell>
                  <TableCell>{formatBRCurrency(item.price)}</TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja remover a associação entre o opcional 
                            "{item.optional.name}" e a versão "{item.version.name}"?
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(item.id)}>
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}