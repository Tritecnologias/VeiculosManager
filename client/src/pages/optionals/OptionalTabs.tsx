import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import OptionalList from "./OptionalList";
import OptionalForm from "./OptionalForm";
import VersionOptionalForm from "./VersionOptionalForm";
import VersionOptionalList from "./VersionOptionalList";

export default function OptionalTabs() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("list");
  const [editId, setEditId] = useState<number | null>(null);

  const handleNewOptional = () => {
    setEditId(null);
    setActiveTab("form");
  };

  const handleEditOptional = (id: number) => {
    setEditId(id);
    setActiveTab("form");
  };

  const handleCancel = () => {
    setEditId(null);
    setActiveTab("list");
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Gerenciamento de Opcionais</h1>
        <div className="flex gap-2">
          {activeTab === "list" && (
            <Button onClick={handleNewOptional}>
              <Plus className="h-4 w-4 mr-1" />
              Novo Opcional
            </Button>
          )}
          {activeTab === "form" && (
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="list">Lista de Opcionais</TabsTrigger>
          <TabsTrigger value="associate">Associar Versão</TabsTrigger>
          <TabsTrigger value="associations">Opcionais Associados</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <OptionalList onEdit={handleEditOptional} />
        </TabsContent>
        
        <TabsContent value="form" className="space-y-6">
          <OptionalForm 
            id={editId} 
            onCancel={handleCancel} 
          />
        </TabsContent>

        <TabsContent value="associate" className="space-y-6">
          <VersionOptionalForm />
        </TabsContent>

        <TabsContent value="associations" className="space-y-6">
          <VersionOptionalList />
        </TabsContent>
      </Tabs>
    </div>
  );
}