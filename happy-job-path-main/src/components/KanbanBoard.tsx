import { useState, useMemo } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { KanbanColumn } from './KanbanColumn';
import { DetailPanel } from './DetailPanel';
import { SearchFilter } from './SearchFilter';
import { AddApplicationDialog } from './AddApplicationDialog';
import { useApplications, useUpdateStatus } from '@/hooks/useApplications';
import { JobApplication, ApplicationStatus, STAGE_ORDER } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface KanbanBoardProps {
  addDialogOpen: boolean;
  setAddDialogOpen: (open: boolean) => void;
}

export function KanbanBoard({ addDialogOpen, setAddDialogOpen }: KanbanBoardProps) {
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<ApplicationStatus[]>([]);

  const { data: applications = [], isLoading } = useApplications();
  const updateStatus = useUpdateStatus();

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        app.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.role_title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilters.length === 0 || activeFilters.includes(app.status);
      return matchesSearch && matchesFilter;
    });
  }, [applications, searchQuery, activeFilters]);

  const applicationsByStatus = useMemo(() => {
    const grouped: Record<ApplicationStatus, JobApplication[]> = {
      applied: [],
      phone_screen: [],
      onsite: [],
      offer: [],
      rejected: [],
    };
    filteredApplications.forEach((app) => {
      grouped[app.status].push(app);
    });
    return grouped;
  }, [filteredApplications]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStatus = destination.droppableId as ApplicationStatus;

    updateStatus.mutate({ id: draggableId, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilters={activeFilters}
        onFilterChange={setActiveFilters}
      />
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto p-4">
          <div className="flex gap-4 min-w-max">
            {STAGE_ORDER.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                applications={applicationsByStatus[status]}
                onCardClick={setSelectedApplication}
              />
            ))}
          </div>
        </div>
      </DragDropContext>

      <DetailPanel
        application={selectedApplication}
        onClose={() => setSelectedApplication(null)}
      />

      <AddApplicationDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />
    </div>
  );
}
