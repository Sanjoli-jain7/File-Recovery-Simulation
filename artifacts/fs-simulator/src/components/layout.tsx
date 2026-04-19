import React from "react";
import { Link, useLocation } from "wouter";
import { 
  Terminal, 
  HardDrive, 
  Activity, 
  AlertTriangle, 
  LifeBuoy, 
  Wrench, 
  List, 
  RefreshCcw,
  ShieldCheck,
  ShieldAlert,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHealthCheck, useResetFilesystem } from "@workspace/api-client-react";
import { useInvalidateAll } from "@/hooks/use-invalidate-all";
import { useToast } from "@/hooks/use-toast";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: Terminal },
  { name: "File System", href: "/filesystem", icon: HardDrive },
  { name: "Access Simulation", href: "/access", icon: Activity },
  { name: "Crash Simulation", href: "/crash", icon: AlertTriangle },
  { name: "Recovery", href: "/recovery", icon: LifeBuoy },
  { name: "Optimization", href: "/optimization", icon: Wrench },
  { name: "Logs", href: "/logs", icon: List },
];

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { data: health } = useHealthCheck();
  const resetFilesystem = useResetFilesystem();
  const invalidateAll = useInvalidateAll();
  const { toast } = useToast();

  const handleReset = () => {
    if (confirm("Are you sure you want to reset the filesystem to its initial state? All data will be lost.")) {
      resetFilesystem.mutate(undefined, {
        onSuccess: () => {
          invalidateAll();
          toast({
            title: "System Reset",
            description: "File system has been restored to factory settings.",
          });
        }
      });
    }
  };

  const isHealthy = health?.status === "ok";

  return (
    <SidebarProvider defaultOpen>
      <div className="flex h-screen overflow-hidden bg-background text-foreground dark w-full">
        <Sidebar className="border-r border-border bg-sidebar">
          <SidebarHeader className="border-b border-border p-4">
            <div className="flex items-center gap-2 font-mono font-bold text-primary">
              <Terminal className="h-5 w-5" />
              <span>OS_SIM_V1</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Simulation Controls</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigation.map((item) => {
                    const isActive = location === item.href;
                    return (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton asChild isActive={isActive} tooltip={item.name}>
                          <Link href={item.href} className="flex items-center gap-2">
                            <item.icon className="h-4 w-4" />
                            <span>{item.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-border p-4 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono bg-card p-2 rounded-md border border-border">
              <span className="text-muted-foreground">STATUS</span>
              <div className="flex items-center gap-1.5">
                {isHealthy ? (
                  <>
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    <span className="text-primary">ONLINE</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="h-3.5 w-3.5 text-destructive" />
                    <span className="text-destructive">OFFLINE</span>
                  </>
                )}
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start font-mono text-xs"
              onClick={handleReset}
              disabled={resetFilesystem.isPending}
            >
              <RefreshCcw className={`mr-2 h-3.5 w-3.5 ${resetFilesystem.isPending ? 'animate-spin' : ''}`} />
              SYS_RESET
            </Button>
          </SidebarFooter>
        </Sidebar>
        
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-14 border-b border-border flex items-center px-4 lg:px-6 bg-background/95 backdrop-blur shrink-0 z-10 sticky top-0">
            <SidebarTrigger className="mr-4 lg:hidden" />
            <div className="flex-1" />
            <div className="font-mono text-xs text-muted-foreground flex items-center gap-4">
              <span>SYS_TIME: {new Date().toISOString().split('T')[1].split('.')[0]}</span>
              <span className="hidden sm:inline">KERNEL: 5.15.0</span>
            </div>
          </header>
          <div className="flex-1 overflow-auto p-4 lg:p-6 lg:pt-8">
            <div className="max-w-7xl mx-auto h-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
