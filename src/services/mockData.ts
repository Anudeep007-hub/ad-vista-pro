// Mock Data Service for Ad Agency Dashboard

export interface MetricData {
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}

export interface ChartDataPoint {
  name: string;
  value?: number;
  date?: string;
  revenue?: number;
  users?: number;
  conversions?: number;
  clicks?: number;
  impressions?: number;
}

export interface CampaignData {
  id: string;
  name: string;
  client: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  status: 'active' | 'paused' | 'completed';
  startDate: string;
  endDate: string;
}

// Generate realistic mock data
export const generateMetrics = (): Record<string, MetricData> => {
  const baseRevenue = 125000 + Math.random() * 25000;
  const baseUsers = 45000 + Math.random() * 10000;
  const baseConversions = 1250 + Math.random() * 250;
  
  return {
    revenue: {
      value: baseRevenue,
      change: (Math.random() - 0.3) * 20,
      trend: Math.random() > 0.3 ? 'up' : 'down'
    },
    users: {
      value: baseUsers,
      change: (Math.random() - 0.2) * 15,
      trend: Math.random() > 0.2 ? 'up' : 'down'
    },
    conversions: {
      value: baseConversions,
      change: (Math.random() - 0.4) * 25,
      trend: Math.random() > 0.4 ? 'up' : 'down'
    },
    growth: {
      value: 12.5 + (Math.random() - 0.5) * 10,
      change: (Math.random() - 0.5) * 5,
      trend: Math.random() > 0.5 ? 'up' : 'down'
    }
  };
};

export const generateLineChartData = (): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    const revenue = 3000 + Math.random() * 2000 + Math.sin(i / 7) * 500;
    data.push({
      name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      date: date.toISOString().split('T')[0],
      value: revenue,
      revenue,
      users: 800 + Math.random() * 400 + Math.sin(i / 5) * 200,
      conversions: 25 + Math.random() * 20 + Math.sin(i / 3) * 10
    });
  }
  
  return data;
};

export const generateBarChartData = (): ChartDataPoint[] => {
  const channels = ['Google Ads', 'Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'YouTube'];
  
  return channels.map(channel => ({
    name: channel,
    value: Math.floor(Math.random() * 50000) + 10000,
    conversions: Math.floor(Math.random() * 500) + 50,
    clicks: Math.floor(Math.random() * 5000) + 1000
  }));
};

export const generatePieChartData = (): ChartDataPoint[] => {
  const segments = [
    { name: 'Display Ads', value: 35 },
    { name: 'Search Ads', value: 28 },
    { name: 'Social Media', value: 22 },
    { name: 'Video Ads', value: 10 },
    { name: 'Native Ads', value: 5 }
  ];
  
  return segments.map(segment => ({
    ...segment,
    value: segment.value + (Math.random() - 0.5) * 10
  }));
};

export const generateCampaignData = (): CampaignData[] => {
  const clients = ['TechCorp', 'Fashion Plus', 'FoodieApp', 'TravelMax', 'HealthyLife', 'AutoDeals', 'EduLearn', 'HomeStyle'];
  const statuses: CampaignData['status'][] = ['active', 'paused', 'completed'];
  
  return Array.from({ length: 50 }, (_, i) => {
    const budget = Math.floor(Math.random() * 100000) + 10000;
    const spent = budget * (0.2 + Math.random() * 0.6);
    const impressions = Math.floor(Math.random() * 1000000) + 100000;
    const clicks = Math.floor(impressions * (0.01 + Math.random() * 0.05));
    const conversions = Math.floor(clicks * (0.02 + Math.random() * 0.08));
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 60));
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 30) + 14);
    
    return {
      id: `campaign-${i + 1}`,
      name: `Campaign ${i + 1} - ${['Holiday Sale', 'Brand Awareness', 'Product Launch', 'Retargeting', 'Lead Gen'][Math.floor(Math.random() * 5)]}`,
      client: clients[Math.floor(Math.random() * clients.length)],
      budget,
      spent,
      impressions,
      clicks,
      conversions,
      ctr: (clicks / impressions) * 100,
      cpc: spent / clicks,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  });
};

// Real-time data simulation
export class MockDataService {
  private static instance: MockDataService;
  private updateCallbacks: Array<() => void> = [];
  private intervalId: NodeJS.Timeout | null = null;

  static getInstance(): MockDataService {
    if (!MockDataService.instance) {
      MockDataService.instance = new MockDataService();
    }
    return MockDataService.instance;
  }

  startRealTimeUpdates(intervalMs: number = 10000): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    this.intervalId = setInterval(() => {
      this.updateCallbacks.forEach(callback => callback());
    }, intervalMs);
  }

  stopRealTimeUpdates(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  onUpdate(callback: () => void): () => void {
    this.updateCallbacks.push(callback);
    
    // Return cleanup function
    return () => {
      const index = this.updateCallbacks.indexOf(callback);
      if (index > -1) {
        this.updateCallbacks.splice(index, 1);
      }
    };
  }
}