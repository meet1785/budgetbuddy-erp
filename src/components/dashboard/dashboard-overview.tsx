import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  Target,
  AlertCircle,
  PieChart
} from "lucide-react";

const DashboardOverview = () => {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Budget"
          value="$125,450"
          change="+12.5%"
          changeType="positive"
          variant="primary"
          icon={<DollarSign className="h-5 w-5 text-primary-foreground" />}
        />
        <StatCard
          title="Total Expenses"
          value="$89,320"
          change="+8.2%"
          changeType="positive"
          icon={<Wallet className="h-5 w-5 text-muted-foreground" />}
        />
        <StatCard
          title="Remaining Budget"
          value="$36,130"
          change="-4.3%"
          changeType="negative"
          variant="success"
          icon={<Target className="h-5 w-5 text-success-foreground" />}
        />
        <StatCard
          title="Savings Goal"
          value="$15,000"
          change="78%"
          changeType="positive"
          variant="accent"
          icon={<TrendingUp className="h-5 w-5 text-accent-foreground" />}
        />
      </div>

      {/* Budget Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Budget Categories
            </CardTitle>
            <CardDescription>
              Current month spending breakdown
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Operations</span>
                  <span className="text-muted-foreground">$45,200 / $50,000</span>
                </div>
                <Progress value={90} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Marketing</span>
                  <span className="text-muted-foreground">$12,500 / $20,000</span>
                </div>
                <Progress value={62} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Development</span>
                  <span className="text-muted-foreground">$28,300 / $35,000</span>
                </div>
                <Progress value={81} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Administration</span>
                  <span className="text-muted-foreground">$8,900 / $15,000</span>
                </div>
                <Progress value={59} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              Budget Alerts
            </CardTitle>
            <CardDescription>
              Items requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-warning-light border border-warning/20">
                <TrendingUp className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="font-medium text-sm">Operations Budget 90% Used</p>
                  <p className="text-xs text-muted-foreground">
                    Consider reallocating funds from other categories
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-success-light border border-success/20">
                <TrendingDown className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="font-medium text-sm">Marketing Under Budget</p>
                  <p className="text-xs text-muted-foreground">
                    $7,500 remaining in marketing budget
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-accent-light border border-accent/20">
                <Target className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="font-medium text-sm">Savings Goal on Track</p>
                  <p className="text-xs text-muted-foreground">
                    78% complete with 3 months remaining
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;