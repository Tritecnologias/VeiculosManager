import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
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
import VehicleForm from "@/pages/vehicles/VehicleFormFixed";
import PaintTypeList from "@/pages/paint-types/PaintTypeList";
import PaintTypeForm from "@/pages/paint-types/PaintTypeForm";
import OptionalTabs from "@/pages/optionals/OptionalTabs";
import OptionalForm from "@/pages/optionals/OptionalForm";
//import DirectSaleForm from "./pages/direct-sales/DirectSaleForm";
import Configurator from "@/pages/configurator";
import Settings from "@/pages/settings/Settings";
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
        <Route path="/optionals" component={OptionalTabs} />
        <Route path="/optionals/new">
          {() => <OptionalForm />}
        </Route>
        <Route path="/optionals/:id/edit">
          {(params) => <OptionalForm id={parseInt(params.id)} />}
        </Route>
        <Route path="/vehicles" component={VehicleList} />
        <Route path="/vehicles/new" component={VehicleForm} />
        <Route path="/vehicles/:id/edit" component={VehicleForm} />
        {/* Direct sales routes disabled until component is fixed */}
        {/* <Route path="/direct-sales/new">
          {() => <DirectSaleForm />}
        </Route>
        <Route path="/direct-sales/:id/edit">
          {(params) => <DirectSaleForm id={parseInt(params.id)} />}
        </Route> */}
        <Route path="/configurator" component={Configurator} />
        <Route path="/settings" component={Settings} />
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
