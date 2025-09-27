import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Download, FileText, PieChart, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/context/AppContext";
import { toast } from "@/hooks/use-toast";

export const ReportGenerator = () => {
  const { state } = useAppContext();
  const [reportType, setReportType] = useState<string>("");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTypes = [
    { value: "budget-performance", label: "Budget Performance", icon: BarChart3 },
    { value: "expense-analysis", label: "Expense Analysis", icon: PieChart },
    { value: "variance-report", label: "Variance Report", icon: FileText },
    { value: "cash-flow", label: "Cash Flow Statement", icon: Download },
    { value: "department-summary", label: "Department Summary", icon: BarChart3 },
    { value: "vendor-analysis", label: "Vendor Analysis", icon: PieChart }
  ];

  const handleGenerateReport = async () => {
    if (!reportType) {
      toast({
        title: "Select Report Type",
        description: "Please select a report type to continue.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const selectedReport = reportTypes.find(r => r.value === reportType);
    
    toast({
      title: "Report Generated Successfully",
      description: `${selectedReport?.label} has been generated and is ready for download.`,
    });
    
    setIsGenerating(false);
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Report Generator
        </CardTitle>
        <CardDescription>
          Generate custom financial reports with advanced filtering options
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="report-type">Report Type</Label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger>
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              {reportTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? format(dateRange.from, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange.from}
                  onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange.to && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.to ? format(dateRange.to, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange.to}
                  onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div>
          <Label>Categories (Optional)</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {state.categories.map((category) => (
              <Badge
                key={category.id}
                variant={selectedCategories.includes(category.id) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/80 transition-colors"
                onClick={() => toggleCategory(category.id)}
              >
                <div 
                  className="w-2 h-2 rounded-full mr-2" 
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
              </Badge>
            ))}
          </div>
          {selectedCategories.length === 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              All categories will be included
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleGenerateReport} 
            disabled={isGenerating}
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        </div>

        {reportType && (
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Report Preview</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Total Budgets: {state.budgets.length}</p>
              <p>• Total Expenses: {state.expenses.length}</p>
              <p>• Date Range: {dateRange.from && dateRange.to ? 
                `${format(dateRange.from, "MMM dd, yyyy")} - ${format(dateRange.to, "MMM dd, yyyy")}` : 
                "All time"
              }</p>
              <p>• Categories: {selectedCategories.length || "All"}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};