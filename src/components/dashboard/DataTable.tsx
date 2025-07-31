import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Search, 
  Filter,
  Download,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { CampaignData } from "@/services/mockData";
import { ExportService } from "@/services/exportService";
import { cn } from "@/lib/utils";

interface DataTableProps {
  data: CampaignData[];
  title?: string;
  pageSize?: number;
  onExport?: () => void;
}

type SortKey = keyof CampaignData;
type SortDirection = 'asc' | 'desc' | null;

export function DataTable({ data, title = "Campaign Performance", pageSize = 10, onExport }: DataTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('budget');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = pageSize;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => 
        prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'
      );
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) return <ArrowUpDown className="h-4 w-4" />;
    if (sortDirection === 'asc') return <ArrowUp className="h-4 w-4" />;
    if (sortDirection === 'desc') return <ArrowDown className="h-4 w-4" />;
    return <ArrowUpDown className="h-4 w-4" />;
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                           item.client.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    if (sortKey && sortDirection) {
      filtered.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          const comparison = aVal.localeCompare(bVal);
          return sortDirection === 'asc' ? comparison : -comparison;
        }
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          const comparison = aVal - bVal;
          return sortDirection === 'asc' ? comparison : -comparison;
        }
        
        return 0;
      });
    }

    return filtered;
  }, [data, search, statusFilter, sortKey, sortDirection]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedData, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const getStatusBadge = (status: CampaignData['status']) => {
    const variants = {
      active: "bg-success-light text-success border-success/20",
      paused: "bg-warning-light text-warning border-warning/20",
      completed: "bg-info-light text-info border-info/20"
    };
    
    return (
      <Badge 
        variant="secondary" 
        className={cn("border", variants[status])}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleExportCSV = () => {
    ExportService.exportToCSV(filteredAndSortedData, 'campaign-data.csv');
    onExport?.();
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full sm:w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExportCSV} className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead 
                  className="cursor-pointer hover:bg-muted transition-colors min-w-[200px]"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">Campaign</span>
                    {getSortIcon('name')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted transition-colors hidden sm:table-cell min-w-[120px]"
                  onClick={() => handleSort('client')}
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">Client</span>
                    {getSortIcon('client')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted transition-colors text-right min-w-[100px]"
                  onClick={() => handleSort('budget')}
                >
                  <div className="flex items-center justify-end space-x-2">
                    <span className="font-semibold">Budget</span>
                    {getSortIcon('budget')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted transition-colors text-right hidden md:table-cell min-w-[100px]"
                  onClick={() => handleSort('spent')}
                >
                  <div className="flex items-center justify-end space-x-2">
                    <span className="font-semibold">Spent</span>
                    {getSortIcon('spent')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted transition-colors text-right hidden lg:table-cell min-w-[100px]"
                  onClick={() => handleSort('conversions')}
                >
                  <div className="flex items-center justify-end space-x-2">
                    <span className="font-semibold">Conversions</span>
                    {getSortIcon('conversions')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted transition-colors text-right hidden xl:table-cell min-w-[80px]"
                  onClick={() => handleSort('ctr')}
                >
                  <div className="flex items-center justify-end space-x-2">
                    <span className="font-semibold">CTR</span>
                    {getSortIcon('ctr')}
                  </div>
                </TableHead>
                <TableHead className="min-w-[100px]">
                  <span className="font-semibold">Status</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((campaign) => (
                <TableRow key={campaign.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">{campaign.name}</div>
                      <div className="text-xs text-muted-foreground truncate sm:hidden">
                        {campaign.client}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">{campaign.id}</div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{campaign.client}</TableCell>
                  <TableCell className="text-right font-mono">
                    <div className="font-semibold">{formatCurrency(campaign.budget)}</div>
                    <div className="text-xs text-muted-foreground md:hidden">
                      Spent: {formatCurrency(campaign.spent)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono hidden md:table-cell">
                    <div>
                      <div className="font-semibold">{formatCurrency(campaign.spent)}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatPercentage((campaign.spent / campaign.budget) * 100)} of budget
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono hidden lg:table-cell">
                    <div className="font-semibold">{campaign.conversions.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground xl:hidden">
                      CTR: {formatPercentage(campaign.ctr)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono hidden xl:table-cell font-semibold">
                    {formatPercentage(campaign.ctr)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(campaign.status)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredAndSortedData.length)} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)} of{' '}
            {filteredAndSortedData.length} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
              {totalPages > 5 && (
                <>
                  <span className="text-muted-foreground">...</span>
                  <Button
                    variant={totalPages === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    className="w-8 h-8 p-0"
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}