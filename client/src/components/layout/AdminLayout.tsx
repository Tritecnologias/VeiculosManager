import { ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useMobile } from "@/hooks/use-mobile";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const isMobile = useMobile();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className={`flex-1 ${isMobile ? 'p-3' : 'p-6'} overflow-auto`}>
          {children}
        </main>
      </div>
    </div>
  );
}
