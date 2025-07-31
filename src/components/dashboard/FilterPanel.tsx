import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Filter, X, Download } from "lucide-react";
import { ExportService } from "@/services/exportService";

interface FilterPanelProps {
  onFiltersChange: (filters: FilterState) => void;
  onExportPDF?: () => void;
  onExportMetricsCSV?: () => void;
  availableClients?: string[];
  availableStatuses?: string[];
  initialDateRange?: { from: string; to: string };
}

export interface FilterState {
  dateRange: {
    from: string;
    to: string;
  };
  clients: string[];
  status: string[];
  budgetRange: {
    min: number;
    max: number;
  };
}

export function FilterPanel({ 
  onFiltersChange, 
  onExportPDF, 
  onExportMetricsCSV,
  availableClients = ['TechCorp', 'Fashion Plus', 'FoodieApp', 'TravelMax', 'HealthyLife', 'AutoDeals'],
  availableStatuses = ['active', 'paused', 'completed'],
  initialDateRange
}: FilterPanelProps) {
  const defaultDateRange = initialDateRange || {
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  };

  const [filters, setFilters] = useState<FilterState>({
    dateRange: defaultDateRange,
    clients: [],
    status: [],
    budgetRange: {
      min: 0,
      max: 100000
    }
  });

  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFiltersChange(updated);
    updateActiveFilters(updated);
  };

  const updateActiveFilters = (currentFilters: FilterState) => {
    const active: string[] = [];
    
    if (currentFilters.clients.length > 0) {
      active.push(`Clients: ${currentFilters.clients.join(', ')}`);
    }
    
    if (currentFilters.status.length > 0) {
      active.push(`Status: ${currentFilters.status.join(', ')}`);
    }
    
    if (currentFilters.budgetRange.min > 0 || currentFilters.budgetRange.max < 100000) {
      active.push(`Budget: $${currentFilters.budgetRange.min.toLocaleString()} - $${currentFilters.budgetRange.max.toLocaleString()}`);
    }
    
    setActiveFilters(active);
  };

  const clearFilters = () => {
    const resetFilters = {
      dateRange: defaultDateRange,
      clients: [],
      status: [],
      budgetRange: {
        min: 0,
        max: 100000
      }
    };
    setFilters(resetFilters);
    setActiveFilters([]);
    onFiltersChange(resetFilters);
  };

  const addClientFilter = (client: string) => {
    if (!filters.clients.includes(client)) {
      updateFilters({
        clients: [...filters.clients, client]
      });
    }
  };

  const removeClientFilter = (client: string) => {
    updateFilters({
      clients: filters.clients.filter(c => c !== client)
    });
  };

  const addStatusFilter = (status: string) => {
    if (!filters.status.includes(status)) {
      updateFilters({
        status: [...filters.status, status]
      });
    }
  };

  const removeStatusFilter = (status: string) => {
    updateFilters({
      status: filters.status.filter(s => s !== status)
    });
  };

  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Advanced Filters
        </CardTitle>
        {activeFilters.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Range */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Date Range
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="from-date" className="text-xs text-muted-foreground">From</Label>
              <Input
                id="from-date"
                type="date"
                value={filters.dateRange.from}
                onChange={(e) => updateFilters({
                  dateRange: { ...filters.dateRange, from: e.target.value }
                })}
                className="text-sm"
              />
            </div>
            <div>
              <Label htmlFor="to-date" className="text-xs text-muted-foreground">To</Label>
              <Input
                id="to-date"
                type="date"
                value={filters.dateRange.to}
                onChange={(e) => updateFilters({
                  dateRange: { ...filters.dateRange, to: e.target.value }
                })}
                className="text-sm"
              />
            </div>
          </div>
        </div>

        {/* Client Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Clients</Label>
          <Select onValueChange={addClientFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Add client filter" />
            </SelectTrigger>
            <SelectContent>
              {availableClients.filter(c => !filters.clients.includes(c)).map(client => (
                <SelectItem key={client} value={client}>{client}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filters.clients.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {filters.clients.map(client => (
                <Badge key={client} variant="secondary" className="text-xs">
                  {client}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => removeClientFilter(client)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Status</Label>
          <Select onValueChange={addStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Add status filter" />
            </SelectTrigger>
            <SelectContent>
              {availableStatuses.filter(s => !filters.status.includes(s)).map(status => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filters.status.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {filters.status.map(status => (
                <Badge key={status} variant="secondary" className="text-xs">
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => removeStatusFilter(status)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Budget Range */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Budget Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="min-budget" className="text-xs text-muted-foreground">Min ($)</Label>
              <Input
                id="min-budget"
                type="number"
                value={filters.budgetRange.min}
                onChange={(e) => updateFilters({
                  budgetRange: { ...filters.budgetRange, min: Number(e.target.value) }
                })}
                className="text-sm"
              />
            </div>
            <div>
              <Label htmlFor="max-budget" className="text-xs text-muted-foreground">Max ($)</Label>
              <Input
                id="max-budget"
                type="number"
                value={filters.budgetRange.max}
                onChange={(e) => updateFilters({
                  budgetRange: { ...filters.budgetRange, max: Number(e.target.value) }
                })}
                className="text-sm"
              />
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Active Filters</Label>
            <div className="space-y-1">
              {activeFilters.map((filter, index) => (
                <Badge key={index} variant="outline" className="text-xs block w-full justify-start">
                  {filter}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Export Actions */}
        {(onExportPDF || onExportMetricsCSV) && (
          <div className="space-y-2 pt-4 border-t">
            <Label className="text-sm font-medium">Export Data</Label>
            <div className="grid grid-cols-1 gap-2">
              {onExportPDF && (
                <Button variant="outline" size="sm" onClick={onExportPDF} className="justify-start gap-2">
                  <Download className="h-4 w-4" />
                  Export Dashboard PDF
                </Button>
              )}
              {onExportMetricsCSV && (
                <Button variant="outline" size="sm" onClick={onExportMetricsCSV} className="justify-start gap-2">
                  <Download className="h-4 w-4" />
                  Export Metrics CSV
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}