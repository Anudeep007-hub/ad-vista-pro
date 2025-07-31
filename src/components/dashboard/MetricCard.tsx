import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Minus, TrendingUp, TrendingDown, Download } from "lucide-react";
import { MetricData } from "@/services/mockData";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface MetricCardProps {
  title: string;
  data: MetricData;
  icon: React.ReactNode;
  format?: 'currency' | 'number' | 'percentage';
  onExport?: () => void;
}

export function MetricCard({ title, data, icon, format = 'number', onExport }: MetricCardProps) {
  const { toast } = useToast();
  const formatValue = (value: number): string => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      default:
        return new Intl.NumberFormat('en-US').format(Math.floor(value));
    }
  };

  const getTrendIcon = () => {
    switch (data.trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-danger" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getChangeIcon = () => {
    if (data.change > 0) {
      return <ArrowUp className="h-3 w-3" />;
    } else if (data.change < 0) {
      return <ArrowDown className="h-3 w-3" />;
    }
    return <Minus className="h-3 w-3" />;
  };

  const getChangeColor = () => {
    if (data.change > 0) {
      return "bg-success-light text-success border-success/20";
    } else if (data.change < 0) {
      return "bg-danger-light text-danger border-danger/20";
    }
    return "bg-muted text-muted-foreground";
  };

  const handleExport = () => {
    const csvData = `Metric,Value,Change,Trend\n"${title}","${formatValue(data.value)}","${data.change.toFixed(1)}%","${data.trend}"`;
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-metric.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Successful",
      description: `${title} metric exported as CSV`,
      duration: 2000,
    });
    
    onExport?.();
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-200 border-border/50 bg-gradient-to-br from-card to-card/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Download className="h-4 w-4" />
          </Button>
          <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-foreground">
              {formatValue(data.value)}
            </div>
            <div className="flex items-center space-x-2">
              <Badge 
                variant="secondary" 
                className={cn("flex items-center space-x-1 text-xs border", getChangeColor())}
              >
                {getChangeIcon()}
                <span>{Math.abs(data.change).toFixed(1)}%</span>
              </Badge>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1">
            {getTrendIcon()}
            <span className="text-xs text-muted-foreground">trend</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}