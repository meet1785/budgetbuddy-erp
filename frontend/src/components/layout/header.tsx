import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect, useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Search, 
  Plus, 
  User, 
  LogOut, 
  Settings,
  Wallet,
  Receipt,
  CreditCard,
  Users,
  DollarSign,
  Calendar
} from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";
import { formatCurrency } from "@/utils/currency";
import { useSearch } from "@/hooks/use-search";

export function Header() {
  const { state, logout } = useAppContext();
  const navigate = useNavigate();
  const user = state.currentUser;
  
  // Search functionality
  const { searchQuery, setSearchQuery, searchResults, hasResults } = useSearch();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Update search open state when results change
  useEffect(() => {
    setIsSearchOpen(hasResults && searchQuery.trim() !== "");
  }, [hasResults, searchQuery]);
  
  // Handle search result selection
  const handleSelectResult = (result: any) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    
    // Navigate based on result type
    switch (result.type) {
      case 'budget':
        navigate(`/budgets?highlight=${result.id}`);
        break;
      case 'expense':
        navigate(`/expenses?highlight=${result.id}`);
        break;
      case 'transaction':
        navigate(`/transactions?highlight=${result.id}`);
        break;
      case 'user':
        navigate(`/users?highlight=${result.id}`);
        break;
      case 'category':
        navigate(`/categories?highlight=${result.id}`);
        break;
      default:
        navigate(result.path);
    }
    
    toast({
      title: "Navigated to result",
      description: `Opened ${result.title}`,
    });
  };
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setSearchQuery("");
        searchInputRef.current?.blur();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been signed out successfully.",
      });
      navigate("/");
    } catch (error: unknown) {
      toast({
        title: "Logout failed",
        description: getErrorMessage(error, "Something went wrong while logging out."),
        variant: "destructive",
      });
    }
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "BB";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-6">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <PopoverTrigger asChild>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search transactions, budgets... (Ctrl+K)"
                  className="pl-10 bg-muted/50 border-0 focus-visible:bg-background"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery && setIsSearchOpen(true)}
                />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="start">
              <Command>
                <CommandList>
                  {searchResults.length === 0 && searchQuery && (
                    <CommandEmpty>No results found for "{searchQuery}"</CommandEmpty>
                  )}
                  {searchResults.length > 0 && (
                    <>
                      <CommandGroup heading="Search Results">
                        {searchResults.map((result) => {
                          const IconComponent = result.icon;
                          return (
                            <CommandItem
                              key={`${result.type}-${result.id}`}
                              onSelect={() => handleSelectResult(result)}
                              className="flex items-center gap-3 p-3 cursor-pointer"
                            >
                              <IconComponent className="h-4 w-4 text-muted-foreground" />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">
                                  {result.title}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {result.subtitle}
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs capitalize">
                                {result.type}
                              </Badge>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                      {searchResults.length === 10 && (
                        <div className="p-3 text-xs text-muted-foreground text-center border-t">
                          Showing first 10 results. Refine your search for more specific results.
                        </div>
                      )}
                    </>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="gap-2"
            onClick={() => navigate({ pathname: "/expenses", search: "?modal=expense" })}
          >
            <Plus className="h-4 w-4" />
            Add Expense
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ pathname: "/budgets", search: "?modal=budget" })}
          >
            <Plus className="h-4 w-4" />
            New Budget
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  {user?.avatar ? (
                    <AvatarImage src={user.avatar} alt={user.name} />
                  ) : null}
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name ?? "BudgetBuddy User"}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email ?? "your.email@company.com"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}