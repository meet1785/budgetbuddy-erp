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
import { useState } from "react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

const navigation = [
  {
    name: "Dashboard",
    href: "#",
    icon: LayoutDashboard,
    current: true,
  },
  {
    name: "Budgets",
    href: "#",
    icon: Target,
    current: false,
  },
  {
    name: "Expenses",
    href: "#",
    icon: Wallet,
    current: false,
  },
  {
    name: "Reports",
    href: "#",
    icon: BarChart3,
    current: false,
  },
  {
    name: "Transactions",
    href: "#",
    icon: CreditCard,
    current: false,
  },
  {
    name: "Categories",
    href: "#",
    icon: FileText,
    current: false,
  },
  {
    name: "Users",
    href: "#",
    icon: Users,
    current: false,
  },
  {
    name: "Settings",
    href: "#",
    icon: Settings,
    current: false,
  },
];

export function Sidebar({ className }: SidebarProps) {
  const [activeItem, setActiveItem] = useState("Dashboard");

  return (
    <div className={cn("pb-12 w-64 bg-card border-r border-border", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 px-3 py-2">
            <Building2 className="h-6 w-6 text-primary" />
            <h2 className="text-lg font-semibold tracking-tight">ERP Finance</h2>
          </div>
        </div>
        <div className="px-3">
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="space-y-1">
              {navigation.map((item) => (
                <Button
                  key={item.name}
                  variant={activeItem === item.name ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 font-normal",
                    activeItem === item.name && "bg-secondary font-medium"
                  )}
                  onClick={() => setActiveItem(item.name)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}