import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppContext } from "@/context/AppContext";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Calendar, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { format } from "date-fns";

export const ReportGenerator = () => {
  const { state } = useAppContext();
  const [reportType, setReportType] = useState<'budget' | 'expense' | 'transaction' | 'summary'>('summary');
  const [period, setPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [reportFormat, setReportFormat] = useState<'pdf' | 'excel'>('pdf');

  const generateReport = () => {
    const data = getReportData();
    
    if (reportFormat === 'excel') {
      generateExcelReport(data);
    } else {
      generatePDFReport(data);
    }
    
    toast({
      title: "Report Generated",
      description: `${reportType} report has been downloaded successfully.`,
    });
  };

  const getReportData = () => {
    switch (reportType) {
      case 'budget':
        return state.budgets.map(budget => ({
          Name: budget.name,
          Category: budget.category,
          Allocated: budget.allocated,
          Spent: budget.spent,
          Remaining: budget.remaining,
          Utilization: `${((budget.spent / budget.allocated) * 100).toFixed(1)}%`,
          Status: budget.status,
          Period: budget.period
        }));
      case 'expense':
        return state.expenses.map(expense => ({
          Description: expense.description,
          Amount: expense.amount,
          Category: expense.category,
          Vendor: expense.vendor,
          Department: expense.department,
          Date: format(expense.date, 'yyyy-MM-dd'),
          Status: expense.status
        }));
      case 'transaction':
        return state.transactions.map(transaction => ({
          Type: transaction.type,
          Description: transaction.description,
          Amount: transaction.amount,
          Category: transaction.category,
          Account: transaction.account,
          Date: format(transaction.date, 'yyyy-MM-dd'),
          Status: transaction.status,
          Reference: transaction.reference
        }));
      default:
        return [
          { Metric: 'Total Budget', Value: `$${state.metrics.totalBudget.toLocaleString()}` },
          { Metric: 'Total Expenses', Value: `$${state.metrics.totalExpenses.toLocaleString()}` },
          { Metric: 'Remaining Budget', Value: `$${state.metrics.remainingBudget.toLocaleString()}` },
          { Metric: 'Budget Utilization', Value: `${state.metrics.budgetUtilization.toFixed(1)}%` },
          { Metric: 'Monthly Burn Rate', Value: `$${state.metrics.monthlyBurnRate.toLocaleString()}` }
        ];
    }
  };

  const generateExcelReport = (data: any[]) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, reportType.toUpperCase());
    XLSX.writeFile(wb, `${reportType}-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const generatePDFReport = (data: any[]) => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text(`${reportType.toUpperCase()} REPORT`, 20, 20);
    
    // Date
    doc.setFontSize(12);
    doc.text(`Generated: ${format(new Date(), 'PPP')}`, 20, 35);
    
    // Data
    let yPos = 50;
    data.forEach((item, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      Object.entries(item).forEach(([key, value], i) => {
        doc.text(`${key}: ${value}`, 20 + (i % 2) * 90, yPos);
        if (i % 2 === 1) yPos += 10;
      });
      yPos += 15;
    });
    
    doc.save(`${reportType}-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const getReportStats = () => {
    switch (reportType) {
      case 'budget':
        return {
          total: state.budgets.length,
          active: state.budgets.filter(b => b.status === 'on-track').length,
          warning: state.budgets.filter(b => b.status === 'warning').length,
          overBudget: state.budgets.filter(b => b.status === 'over-budget').length
        };
      case 'expense':
        return {
          total: state.expenses.length,
          approved: state.expenses.filter(e => e.status === 'approved').length,
          pending: state.expenses.filter(e => e.status === 'pending').length,
          rejected: state.expenses.filter(e => e.status === 'rejected').length
        };
      case 'transaction':
        return {
          total: state.transactions.length,
          completed: state.transactions.filter(t => t.status === 'completed').length,
          pending: state.transactions.filter(t => t.status === 'pending').length,
          failed: state.transactions.filter(t => t.status === 'failed').length
        };
      default:
        return {
          budgets: state.budgets.length,
          expenses: state.expenses.length,
          transactions: state.transactions.length,
          categories: state.categories.length
        };
    }
  };

  const stats = getReportStats();

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Advanced Report Generator
        </CardTitle>
        <CardDescription>
          Generate detailed reports with multiple formats and comprehensive analytics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Report Type</label>
            <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Executive Summary</SelectItem>
                <SelectItem value="budget">Budget Analysis</SelectItem>
                <SelectItem value="expense">Expense Details</SelectItem>
                <SelectItem value="transaction">Transaction History</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Period</label>
            <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Format</label>
            <Select value={reportFormat} onValueChange={(value: any) => setReportFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Report</SelectItem>
                <SelectItem value="excel">Excel Spreadsheet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Report Preview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} className="bg-gradient-card p-4 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground capitalize">{key}</p>
                  <p className="text-2xl font-bold">{value}</p>
                </div>
                <div className="text-primary opacity-60">
                  {key.includes('budget') || key === 'budgets' ? <DollarSign className="h-6 w-6" /> :
                   key.includes('expense') || key === 'expenses' ? <TrendingDown className="h-6 w-6" /> :
                   key.includes('transaction') || key === 'transactions' ? <TrendingUp className="h-6 w-6" /> :
                   <Calendar className="h-6 w-6" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Status Badges for Current Report Type */}
        {reportType !== 'summary' && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Status Breakdown</h4>
            <div className="flex flex-wrap gap-2">
              {reportType === 'budget' && (
                <>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    On Track: {stats.active}
                  </Badge>
                  <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                    Warning: {stats.warning}
                  </Badge>
                  <Badge variant="destructive">
                    Over Budget: {stats.overBudget}
                  </Badge>
                </>
              )}
              {reportType === 'expense' && (
                <>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Approved: {stats.approved}
                  </Badge>
                  <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                    Pending: {stats.pending}
                  </Badge>
                  <Badge variant="destructive">
                    Rejected: {stats.rejected}
                  </Badge>
                </>
              )}
              {reportType === 'transaction' && (
                <>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Completed: {stats.completed}
                  </Badge>
                  <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                    Pending: {stats.pending}
                  </Badge>
                  <Badge variant="destructive">
                    Failed: {stats.failed}
                  </Badge>
                </>
              )}
            </div>
          </div>
        )}

        {/* Generate Button */}
        <Button onClick={generateReport} className="w-full" size="lg">
          <Download className="h-4 w-4 mr-2" />
          Generate {reportFormat.toUpperCase()} Report
        </Button>
      </CardContent>
    </Card>
  );
};