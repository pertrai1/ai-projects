import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ApplicationStatus, STAGE_CONFIG, STAGE_ORDER } from '@/lib/types';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilters: ApplicationStatus[];
  onFilterChange: (filters: ApplicationStatus[]) => void;
}

export function SearchFilter({
  searchQuery,
  onSearchChange,
  activeFilters,
  onFilterChange,
}: SearchFilterProps) {
  const toggleFilter = (status: ApplicationStatus) => {
    if (activeFilters.includes(status)) {
      onFilterChange(activeFilters.filter((f) => f !== status));
    } else {
      onFilterChange([...activeFilters, status]);
    }
  };

  return (
    <div className="bg-card border-b border-border p-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by company or role..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {STAGE_ORDER.map((status) => (
            <Button
              key={status}
              variant="outline"
              size="sm"
              onClick={() => toggleFilter(status)}
              className={cn(
                'transition-all',
                activeFilters.includes(status) && STAGE_CONFIG[status].color
              )}
            >
              {STAGE_CONFIG[status].label}
            </Button>
          ))}
          {activeFilters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFilterChange([])}
              className="text-muted-foreground"
            >
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
