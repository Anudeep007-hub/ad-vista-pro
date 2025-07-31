import { useState, useEffect } from "react";
import { DollarSign, Users, Target, TrendingUp } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { InteractiveChart } from "@/components/dashboard/InteractiveChart";
import { DataTable } from "@/components/dashboard/DataTable";
import { FilterPanel, FilterState } from "@/components/dashboard/FilterPanel";
import { MetricCardSkeleton, ChartSkeleton, TableSkeleton } from "@/components/ui/loading-skeleton";
import { 
  generateMetrics, 
  generateLineChartData, 
  generateBarChartData, 
  generatePieChartData,
  generateCampaignData,
  MockDataService,
  type MetricData,
  type ChartDataPoint,
  type CampaignData
} from "@/services/mockData";
import { ExportService } from "@/services/exportService";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  // Data states
  const [metrics, setMetrics] = useState<Record<string, MetricData>>({});
  const [lineChartData, setLineChartData] = useState<ChartDataPoint[]>([]);
  const [barChartData, setBarChartData] = useState<ChartDataPoint[]>([]);
  const [pieChartData, setPieChartData] = useState<ChartDataPoint[]>([]);
  const [campaignData, setCampaignData] = useState<CampaignData[]>([]);
  const [filteredCampaignData, setFilteredCampaignData] = useState<CampaignData[]>([]);

  // Initialize data
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      
      // Simulate loading delay for skeleton effect
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setMetrics(generateMetrics());
      setLineChartData(generateLineChartData());
      setBarChartData(generateBarChartData());
      setPieChartData(generatePieChartData());
      const campaigns = generateCampaignData();
      setCampaignData(campaigns);
      setFilteredCampaignData(campaigns);
      setLastUpdated(new Date());
      
      setIsLoading(false);
    };

    loadInitialData();
  }, []);

  // Real-time updates
  useEffect(() => {
    const dataService = MockDataService.getInstance();
    
    if (isRealTimeActive) {
      const cleanup = dataService.onUpdate(() => {
        setMetrics(generateMetrics());
        setLineChartData(generateLineChartData());
        setBarChartData(generateBarChartData());
        setPieChartData(generatePieChartData());
        setLastUpdated(new Date());
        
        toast({
          title: "Data Updated",
          description: "Dashboard refreshed with latest data",
          duration: 2000,
        });
      });
      
      dataService.startRealTimeUpdates(15000); // Update every 15 seconds
      
      return () => {
        cleanup();
        dataService.stopRealTimeUpdates();
      };
    } else {
      dataService.stopRealTimeUpdates();
    }
  }, [isRealTimeActive, toast]);

  const handleToggleRealTime = () => {
    setIsRealTimeActive(!isRealTimeActive);
    toast({
      title: isRealTimeActive ? "Real-time Disabled" : "Real-time Enabled",
      description: isRealTimeActive 
        ? "Data updates have been paused" 
        : "Dashboard will update automatically",
      duration: 3000,
    });
  };

  const handleFiltersChange = (filters: FilterState) => {
    let filtered = [...campaignData];
    
    // Apply client filter
    if (filters.clients.length > 0) {
      filtered = filtered.filter(campaign => 
        filters.clients.includes(campaign.client)
      );
    }
    
    // Apply status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(campaign => 
        filters.status.includes(campaign.status)
      );
    }
    
    // Apply budget range filter
    filtered = filtered.filter(campaign => 
      campaign.budget >= filters.budgetRange.min && 
      campaign.budget <= filters.budgetRange.max
    );
    
    // Apply date range filter
    filtered = filtered.filter(campaign => {
      const campaignStart = new Date(campaign.startDate);
      const filterStart = new Date(filters.dateRange.from);
      const filterEnd = new Date(filters.dateRange.to);
      return campaignStart >= filterStart && campaignStart <= filterEnd;
    });
    
    setFilteredCampaignData(filtered);
  };

  const handleExportPDF = async () => {
    try {
      toast({
        title: "Exporting PDF...",
        description: "Please wait while we generate your report",
      });
      
      await ExportService.exportToPDF('dashboard-container', 'ad-agency-dashboard.pdf');
      
      toast({
        title: "Export Successful",
        description: "Dashboard exported as PDF",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Unable to export PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportMetricsCSV = () => {
    try {
      ExportService.exportMetricsToCSV(metrics, 'dashboard-metrics.csv');
      toast({
        title: "Export Successful",
        description: "Metrics exported as CSV",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Unable to export CSV. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Header Skeleton */}
            <div className="col-span-full">
              <div className="flex justify-between items-center mb-8">
                <div className="space-y-2">
                  <div className="h-8 w-64 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-96 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-10 w-32 bg-muted rounded animate-pulse" />
              </div>
            </div>
            
            {/* Metrics Cards Skeleton */}
            <div className="col-span-full lg:col-span-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <MetricCardSkeleton key={i} />
                ))}
              </div>
              
              {/* Charts Skeleton */}
              <div className="space-y-6">
                <ChartSkeleton height="h-80" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ChartSkeleton height="h-64" />
                  <ChartSkeleton height="h-64" />
                </div>
              </div>
            </div>
            
            {/* Filter Panel Skeleton */}
            <div className="col-span-full lg:col-span-4">
              <div className="h-96 bg-muted rounded animate-pulse" />
            </div>
            
            {/* Table Skeleton */}
            <div className="col-span-full">
              <TableSkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <div id="dashboard-container" className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Dashboard Header */}
          <DashboardHeader
            isRealTimeActive={isRealTimeActive}
            onToggleRealTime={handleToggleRealTime}
            lastUpdated={lastUpdated}
          />

          {/* Main Content Area */}
          <div className="col-span-full lg:col-span-8 space-y-6">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Revenue"
                data={metrics.revenue}
                icon={<DollarSign className="h-5 w-5" />}
                format="currency"
              />
              <MetricCard
                title="Active Users"
                data={metrics.users}
                icon={<Users className="h-5 w-5" />}
                format="number"
              />
              <MetricCard
                title="Conversions"
                data={metrics.conversions}
                icon={<Target className="h-5 w-5" />}
                format="number"
              />
              <MetricCard
                title="Growth Rate"
                data={metrics.growth}
                icon={<TrendingUp className="h-5 w-5" />}
                format="percentage"
              />
            </div>

            {/* Primary Chart - Line Chart */}
            <InteractiveChart
              title="Revenue Trend (30 Days)"
              data={lineChartData}
              type="line"
              dataKeys={['revenue', 'users', 'conversions']}
              colors={['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))']}
              height={320}
            />

            {/* Secondary Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <InteractiveChart
                title="Performance by Channel"
                data={barChartData}
                type="bar"
                dataKeys={['value', 'conversions']}
                colors={['hsl(var(--primary))', 'hsl(var(--success))']}
                height={280}
              />
              <InteractiveChart
                title="Ad Type Distribution"
                data={pieChartData}
                type="pie"
                height={280}
              />
            </div>
          </div>

          {/* Sidebar - Filter Panel */}
          <FilterPanel
            onFiltersChange={handleFiltersChange}
            onExportPDF={handleExportPDF}
            onExportMetricsCSV={handleExportMetricsCSV}
          />

          {/* Data Table */}
          <DataTable
            data={filteredCampaignData}
            title="Campaign Performance Data"
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
