import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Pencil, Trash } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { VersionWithModel } from "@/lib/types";

export default function VersionList() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: versions = [], isLoading } = useQuery<VersionWithModel[]>({
    queryKey: ["/api/versions"],
  });
  
  const handleDelete = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/versions/${id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/versions"] });
    } catch (error) {
      console.error("Failed to delete version:", error);
    }
  };
  
  const filteredVersions = versions.filter(version => 
    version.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    version.model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    version.model.brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Versões</h1>
        <Link href="/versions/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Versão
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Lista de Versões</CardTitle>
          <CardDescription>
            Gerencie as versões de veículos disponíveis
          </CardDescription>
          <div className="flex mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Buscar versões..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <p>Carregando...</p>
            </div>
          ) : filteredVersions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma versão encontrada</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVersions.map((version) => (
                  <TableRow key={version.id}>
                    <TableCell>{version.id}</TableCell>
                    <TableCell>{version.name}</TableCell>
                    <TableCell>{version.model.name}</TableCell>
                    <TableCell>{version.model.brand.name}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/versions/${version.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir a versão "{version.name}"? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(version.id)}>
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
