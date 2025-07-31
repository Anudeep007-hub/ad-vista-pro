import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, BarChart3, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  isRealTimeActive: boolean;
  onToggleRealTime: () => void;
  lastUpdated: Date;
}

export function DashboardHeader({ 
  isRealTimeActive, 
  onToggleRealTime, 
  lastUpdated 
}: DashboardHeaderProps) {
  return (
    <div className="col-span-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            Ad Agency Analytics
          </h1>
          <p className="text-muted-foreground">
            Comprehensive dashboard for campaign performance and business insights
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right text-sm">
            <div className="text-muted-foreground">Last Updated</div>
            <div className="font-medium">
              {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
          
          <Button
            variant={isRealTimeActive ? "default" : "outline"}
            onClick={onToggleRealTime}
            className={cn(
              "gap-2 transition-all duration-200",
              isRealTimeActive && "bg-gradient-to-r from-primary to-primary-glow"
            )}
          >
            <Activity className={cn(
              "h-4 w-4",
              isRealTimeActive && "animate-pulse"
            )} />
            Real-time
          </Button>
          
          <Badge 
            variant="secondary" 
            className={cn(
              "gap-1 transition-colors",
              isRealTimeActive 
                ? "bg-success-light text-success border-success/20" 
                : "bg-muted text-muted-foreground"
            )}
          >
            <div className={cn(
              "h-2 w-2 rounded-full",
              isRealTimeActive ? "bg-success animate-pulse" : "bg-muted-foreground"
            )} />
            {isRealTimeActive ? "Live" : "Paused"}
          </Badge>
        </div>
      </div>
    </div>
  );
}