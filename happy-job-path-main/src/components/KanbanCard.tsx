import { JobApplication, STAGE_CONFIG } from '@/lib/types';
import { Draggable } from '@hello-pangea/dnd';
import { format } from 'date-fns';
import { Building2, Calendar, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KanbanCardProps {
  application: JobApplication;
  index: number;
  onClick: () => void;
}

export function KanbanCard({ application, index, onClick }: KanbanCardProps) {
  return (
    <Draggable draggableId={application.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={cn(
            'kanban-card mb-3 group',
            snapshot.isDragging && 'dragging'
          )}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-medium text-foreground line-clamp-1">
              {application.role_title}
            </h4>
            <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span className="line-clamp-1">{application.company_name}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{format(new Date(application.date_applied), 'MMM d, yyyy')}</span>
          </div>
          {application.next_steps && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground line-clamp-2">
                <span className="font-medium">Next:</span> {application.next_steps}
              </p>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}
