import { JobApplication, ApplicationStatus, STAGE_CONFIG } from '@/lib/types';
import { Droppable } from '@hello-pangea/dnd';
import { KanbanCard } from './KanbanCard';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  status: ApplicationStatus;
  applications: JobApplication[];
  onCardClick: (application: JobApplication) => void;
}

export function KanbanColumn({ status, applications, onCardClick }: KanbanColumnProps) {
  const config = STAGE_CONFIG[status];

  return (
    <div className="kanban-column flex-1 min-w-[280px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', config.color)}>
            {config.label}
          </span>
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          {applications.length}
        </span>
      </div>
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'min-h-[400px] rounded-lg transition-colors',
              snapshot.isDraggingOver && 'bg-primary/5'
            )}
          >
            {applications.map((application, index) => (
              <KanbanCard
                key={application.id}
                application={application}
                index={index}
                onClick={() => onCardClick(application)}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
