import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, RefreshCw } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
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

interface VersionColor {
  id: number;
  versionId: number;
  colorId: number;
  price: number;
  imageUrl: string | null;
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
  color: {
    id: number;
    name: string;
    hexCode: string;
    additionalPrice: number;
    imageUrl: string | null;
  };
}

interface VersionColorListProps {
  onEdit: (id: number) => void;
}

export default function VersionColorList({ onEdit }: VersionColorListProps) {
  const { toast } = useToast();
  const [selectedBrandId, setSelectedBrandId] = useState<string>("all");
  const [selectedModelId, setSelectedModelId] = useState<string>("all");
  const [selectedVersionId, setSelectedVersionId] = useState<string>("all");
  
  const { data: brands = [] } = useQuery<Brand[]>({
    queryKey: ["/api/brands"],
  });
  
  const { data: models = [] } = useQuery<Model[]>({
    queryKey: ["/api/models"],
  });
  
  const { data: versions = [] } = useQuery<Version[]>({
    queryKey: ["/api/versions"],
  });
  
  const { data: versionColors = [], isLoading } = useQuery({
    queryKey: ["/api/version-colors", selectedModelId, selectedVersionId],
    queryFn: async () => {
      let url = "/api/version-colors";
      const params = [];
      
      if (selectedModelId && selectedModelId !== "all") {
        params.push(`modelId=${selectedModelId}`);
      }
      
      if (selectedVersionId && selectedVersionId !== "all") {
        params.push(`versionId=${selectedVersionId}`);
      }
      
      if (params.length > 0) {
        url = `${url}?${params.join("&")}`;
      }
      
      console.log("Buscando version-colors:", url);
      const response = await apiRequest("GET", url);
      // Não usar .json() aqui porque apiRequest já retorna os dados JSON
      console.log("API Response:", response);
      return response;
    },
    enabled: true,
  });
  
  const filteredModels = selectedBrandId && selectedBrandId !== "all"
    ? models.filter(model => model.brandId === parseInt(selectedBrandId))
    : models;
    
  const filteredVersions = selectedModelId && selectedModelId !== "all"
    ? versions.filter(version => version.modelId === parseInt(selectedModelId))
    : versions;
    
  const handleDeleteVersionColor = async (id: number) => {
    if (confirm("Tem certeza que deseja remover esta associação de cor?")) {
      try {
        await apiRequest("DELETE", `/api/version-colors/${id}`);
        
        toast({
          title: "Associação removida",
          description: "A associação de cor foi removida com sucesso.",
        });
        
        queryClient.invalidateQueries({ queryKey: ["/api/version-colors"] });
      } catch (error) {
        console.error("Error deleting version color:", error);
        toast({
          title: "Erro ao remover associação",
          description: "Não foi possível remover a associação de cor.",
          variant: "destructive",
        });
      }
    }
  };
  
  // Verificar dados recebidos para debugging
  useEffect(() => {
    console.log("VersionColors recebidos:", versionColors);
  }, [versionColors]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pinturas Associadas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <Select
              value={selectedBrandId} 
              onValueChange={(value) => {
                setSelectedBrandId(value);
                setSelectedModelId("all");
                setSelectedVersionId("all");
              }}
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
            <Select
              value={selectedModelId}
              onValueChange={(value) => {
                setSelectedModelId(value);
                setSelectedVersionId("all");
              }}
              disabled={!selectedBrandId}
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
            <Select
              value={selectedVersionId}
              onValueChange={setSelectedVersionId}
              disabled={!selectedModelId}
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
        
        <Button 
          variant="outline" 
          className="mb-4"
          onClick={() => {
            // Forçar atualização dos dados
            queryClient.invalidateQueries({ queryKey: ["/api/version-colors"] });
          }}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
        
        {isLoading ? (
          <div>Carregando...</div>
        ) : Array.isArray(versionColors) && versionColors.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Modelo</TableHead>
                <TableHead>Versão</TableHead>
                <TableHead>Pintura</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Imagem</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {versionColors.map((versionColor: any) => (
                <TableRow key={versionColor.id}>
                  <TableCell>{versionColor.version?.model?.name || "N/A"}</TableCell>
                  <TableCell>{versionColor.version?.name || "N/A"}</TableCell>
                  <TableCell>
                    {versionColor.color?.name || "N/A"}
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(versionColor.price) || 0)}
                  </TableCell>
                  <TableCell>
                    {versionColor.imageUrl ? (
                      <img 
                        src={versionColor.imageUrl} 
                        alt={`${versionColor.version?.name || ""} - ${versionColor.color?.name || ""}`} 
                        className="w-16 h-12 object-cover rounded"
                      />
                    ) : (
                      "Sem imagem"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onEdit(versionColor.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteVersionColor(versionColor.id)}
                        className="ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-4">
            Nenhuma associação de pintura encontrada.
          </div>
        )}
      </CardContent>
    </Card>
  );
}