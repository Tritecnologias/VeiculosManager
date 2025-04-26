import { Link, useLocation } from "wouter";
import { Home, Car, Building, FileText, Palette, Settings, ListPlus, Menu, X } from "lucide-react";
import { useState } from "react";
import { useMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Sidebar() {
  const [location] = useLocation();
  const isMobile = useMobile();
  const [open, setOpen] = useState(false);
  
  const MenuItems = () => (
    <ul className="space-y-1">
      <li>
        <Link href="/" className={`sidebar-item ${location === '/' ? 'active' : ''}`}>
          <Home className="h-5 w-5 mr-2" />
          Dashboard
        </Link>
      </li>
      <li>
        <Link href="/vehicles" className={`sidebar-item ${location.startsWith('/vehicles') ? 'active' : ''}`}>
          <Car className="h-5 w-5 mr-2" />
          Veículos
        </Link>
      </li>
      <li>
        <Link href="/brands" className={`sidebar-item ${location.startsWith('/brands') ? 'active' : ''}`}>
          <Building className="h-5 w-5 mr-2" />
          Marcas
        </Link>
      </li>
      <li>
        <Link href="/models" className={`sidebar-item ${location.startsWith('/models') ? 'active' : ''}`}>
          <FileText className="h-5 w-5 mr-2" />
          Modelos
        </Link>
      </li>
      <li>
        <Link href="/versions" className={`sidebar-item ${location.startsWith('/versions') ? 'active' : ''}`}>
          <FileText className="h-5 w-5 mr-2" />
          Versões
        </Link>
      </li>
      <li>
        <Link href="/colors" className={`sidebar-item ${location.startsWith('/colors') ? 'active' : ''}`}>
          <Palette className="h-5 w-5 mr-2" />
          Cores/Pinturas
        </Link>
      </li>
      <li>
        <Link href="/paint-types" className={`sidebar-item ${location.startsWith('/paint-types') ? 'active' : ''}`}>
          <Palette className="h-5 w-5 mr-2" />
          Tipos de Pintura
        </Link>
      </li>
      <li>
        <Link href="/optionals" className={`sidebar-item ${location.startsWith('/optionals') ? 'active' : ''}`}>
          <ListPlus className="h-5 w-5 mr-2" />
          Opcionais
        </Link>
      </li>
      <li>
        <Link href="/configurator" className={`sidebar-item ${location.startsWith('/configurator') ? 'active' : ''}`}>
          <Car className="h-5 w-5 mr-2" />
          Configurador
        </Link>
      </li>
      <li>
        <Link href="/settings" className={`sidebar-item ${location.startsWith('/settings') ? 'active' : ''}`}>
          <Settings className="h-5 w-5 mr-2" />
          Configurações
        </Link>
      </li>
    </ul>
  );

  if (isMobile) {
    return (
      <div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="p-2 fixed top-16 left-4 z-40 bg-white rounded-md shadow-md">
              <Menu className="h-6 w-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Administração</h2>
                <button onClick={() => setOpen(false)} className="p-1">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav>
                <MenuItems />
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  return (
    <aside className="w-64 bg-white shadow-md min-h-screen">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Administração</h2>
        <nav>
          <MenuItems />
        </nav>
      </div>
    </aside>
  );
}