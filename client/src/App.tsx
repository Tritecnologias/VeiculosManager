import React from "react";
import { Switch, Route } from "wouter";
import { queryClient, apiRequest } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import AdminLayout from "@/components/layout/AdminLayout";

// Pages
import Dashboard from "@/pages/dashboard/Dashboard";
import BrandList from "@/pages/brands/BrandList";
import BrandForm from "@/pages/brands/BrandForm";
import ModelList from "@/pages/models/ModelList";
import ModelForm from "@/pages/models/ModelForm";
import VersionList from "@/pages/versions/VersionList";
import VersionForm from "@/pages/versions/VersionForm";
import ColorTabs from "@/pages/colors/ColorTabs";
import ColorList from "@/pages/colors/ColorList";
import ColorForm from "@/pages/colors/ColorForm";
import VehicleList from "@/pages/vehicles/VehicleList";
import VehicleForm from "@/pages/vehicles/VehicleForm";
import PaintTypeList from "@/pages/paint-types/PaintTypeList";
import PaintTypeForm from "@/pages/paint-types/PaintTypeForm";
import Configurator from "@/pages/configurator";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <AdminLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/brands" component={BrandList} />
        <Route path="/brands/new" component={BrandForm} />
        <Route path="/brands/:id/edit" component={BrandForm} />
        <Route path="/models" component={ModelList} />
        <Route path="/models/new" component={ModelForm} />
        <Route path="/models/:id/edit" component={ModelForm} />
        <Route path="/versions" component={VersionList} />
        <Route path="/versions/new" component={VersionForm} />
        <Route path="/versions/:id/edit" component={VersionForm} />
        <Route path="/colors" component={ColorTabs} />
        <Route path="/paint-types" component={PaintTypeList} />
        <Route path="/paint-types/new">
          {() => <PaintTypeForm />}
        </Route>
        <Route path="/paint-types/:id/edit">
          {(params) => <PaintTypeForm id={parseInt(params.id)} />}
        </Route>
        <Route path="/vehicles" component={VehicleList} />
        <Route path="/vehicles/new" component={VehicleForm} />
        <Route path="/vehicles/:id/edit" component={VehicleForm} />
        <Route path="/configurator" component={Configurator} />
        <Route path="/settings">
          {() => {
            // Usando React Hook para estado local
            const [formData, setFormData] = React.useState({
              title: '',
              logo: '',
              supportEmail: ''
            });
            const [loading, setLoading] = React.useState(true);
            const [saving, setSaving] = React.useState(false);
            const [message, setMessage] = React.useState({ type: '', text: '' });
            
            // Função para obter as configurações
            React.useEffect(() => {
              const fetchSettings = async () => {
                try {
                  const response = await apiRequest('/api/settings');
                  if (response) {
                    const titleSetting = response.find((s: any) => s.key === 'title');
                    const logoSetting = response.find((s: any) => s.key === 'logo');
                    const emailSetting = response.find((s: any) => s.key === 'supportEmail');
                    
                    setFormData({
                      title: titleSetting?.value || '',
                      logo: logoSetting?.value || '',
                      supportEmail: emailSetting?.value || ''
                    });
                  }
                } catch (error) {
                  console.error('Erro ao carregar configurações:', error);
                  setMessage({ 
                    type: 'error', 
                    text: 'Não foi possível carregar as configurações.' 
                  });
                } finally {
                  setLoading(false);
                }
              };
              
              fetchSettings();
            }, []);
            
            // Função para atualizar o estado do formulário
            const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
              const { name, value } = e.target;
              setFormData(prev => ({ ...prev, [name]: value }));
            };
            
            // Função para salvar as configurações
            const handleSave = async () => {
              setSaving(true);
              setMessage({ type: '', text: '' });
              
              try {
                // Buscar configurações existentes
                const settings = await apiRequest('/api/settings');
                
                // Para cada campo, atualizar ou criar
                const fieldUpdates = [
                  { key: 'title', value: formData.title, label: 'Título do Sistema' },
                  { key: 'logo', value: formData.logo, label: 'URL do Logo' },
                  { key: 'supportEmail', value: formData.supportEmail, label: 'E-mail de Suporte' }
                ];
                
                for (const field of fieldUpdates) {
                  const existingSetting = settings?.find((s: any) => s.key === field.key);
                  
                  if (existingSetting) {
                    // Atualizar configuração existente
                    await apiRequest(`/api/settings/key/${field.key}`, 'PATCH', { 
                      value: field.value 
                    });
                  } else {
                    // Criar nova configuração
                    await apiRequest('/api/settings', 'POST', {
                      key: field.key,
                      value: field.value,
                      label: field.label,
                      type: field.key === 'supportEmail' ? 'email' : 'text'
                    });
                  }
                }
                
                setMessage({ 
                  type: 'success', 
                  text: 'Configurações salvas com sucesso!' 
                });
                
                // Invalidar o cache para atualizar os dados
                queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
              } catch (error) {
                console.error('Erro ao salvar configurações:', error);
                setMessage({ 
                  type: 'error', 
                  text: 'Ocorreu um erro ao salvar as configurações.' 
                });
              } finally {
                setSaving(false);
              }
            };
            
            return (
              <div className="container mx-auto py-6">
                <h1 className="text-3xl font-bold mb-6">Configurações do Sistema</h1>
                
                {loading ? (
                  <div className="bg-white shadow-md rounded-lg p-6 flex justify-center items-center">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <p className="mt-2">Carregando configurações...</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="col-span-1 md:col-span-3">
                      <div className="bg-white shadow-md rounded-lg p-6">
                        <h2 className="text-2xl font-semibold mb-4">Informações gerais</h2>
                        <p className="text-gray-500 mb-6">
                          Configure as informações básicas do sistema, como título, logo e email de suporte.
                        </p>
                        
                        {message.text && (
                          <div className={`p-4 mb-6 rounded-md ${
                            message.type === 'error' ? 'bg-red-50 border border-red-200 text-red-700' : 
                            'bg-green-50 border border-green-200 text-green-700'
                          }`}>
                            {message.text}
                          </div>
                        )}
                        
                        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                          <div className="space-y-2">
                            <label htmlFor="title" className="text-sm font-medium">Título do Sistema</label>
                            <input 
                              id="title"
                              name="title"
                              type="text"
                              value={formData.title}
                              onChange={handleChange}
                              className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                              placeholder="Vendas Corporativas"
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="logo" className="text-sm font-medium">URL do Logo</label>
                            <input 
                              id="logo"
                              name="logo"
                              type="text"
                              value={formData.logo}
                              onChange={handleChange}
                              className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                              placeholder="https://exemplo.com/logo.png"
                            />
                            {formData.logo && (
                              <div className="mt-2 p-2 border rounded-md">
                                <p className="text-xs font-medium mb-1">Prévia:</p>
                                <div className="flex justify-center">
                                  <img 
                                    src={formData.logo}
                                    alt="Logo Preview"
                                    className="max-h-12 object-contain"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = "https://placehold.co/200x60?text=Logo+Inválido";
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="supportEmail" className="text-sm font-medium">Email de Suporte</label>
                            <input 
                              id="supportEmail"
                              name="supportEmail"
                              type="email"
                              value={formData.supportEmail}
                              onChange={handleChange}
                              className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
                              placeholder="suporte@exemplo.com" 
                            />
                          </div>
                          <button 
                            type="submit"
                            disabled={saving}
                            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {saving ? 'Salvando...' : 'Salvar Configurações'}
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          }}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </AdminLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
