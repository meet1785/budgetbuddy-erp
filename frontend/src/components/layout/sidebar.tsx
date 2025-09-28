import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutDashboard,
  Wallet,
  Target,
  BarChart3,
  Settings,
  FileText,
  CreditCard,
  Users,
  Building2
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

interface SidebarProps {
  className?: string;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Budgets",
    href: "/budgets",
    icon: Target,
  },
  {
    name: "Expenses",
    href: "/expenses",
    icon: Wallet,
  },
  {
    name: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    name: "Transactions",
    href: "/transactions",
    icon: CreditCard,
  },
  {
    name: "Categories",
    href: "/categories",
    icon: FileText,
  },
  {
    name: "Users",
    href: "/users",
    icon: Users,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();

  return (
    <div className={cn("pb-12 w-64 bg-card border-r border-border", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 px-3 py-2">
            <Building2 className="h-6 w-6 text-primary animate-pulse-glow" />
            <h2 className="text-lg font-semibold tracking-tight">ERP Finance</h2>
          </div>
        </div>
        <div className="px-3">
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href || 
                  (item.href === "/" && location.pathname === "/");
                
                return (
                  <NavLink key={item.name} to={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3 font-normal transition-all hover:scale-105",
                        isActive && "bg-secondary font-medium shadow-sm"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Button>
                  </NavLink>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}