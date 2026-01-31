import { useState, useEffect } from 'react';
import { JobApplication, ApplicationContact, STAGE_CONFIG } from '@/lib/types';
import { useContacts, useUpdateApplication, useDeleteApplication, useCreateContact, useDeleteContact } from '@/hooks/useApplications';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, Trash2, Plus, User, Mail, Phone, Briefcase, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DetailPanelProps {
  application: JobApplication | null;
  onClose: () => void;
}

export function DetailPanel({ application, onClose }: DetailPanelProps) {
  const [notes, setNotes] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [nextStepsDate, setNextStepsDate] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', title: '', email: '', phone: '' });

  const { data: contacts = [], isLoading: loadingContacts } = useContacts(application?.id ?? null);
  const updateApplication = useUpdateApplication();
  const deleteApplication = useDeleteApplication();
  const createContact = useCreateContact();
  const deleteContact = useDeleteContact();

  useEffect(() => {
    if (application) {
      setNotes(application.notes || '');
      setNextSteps(application.next_steps || '');
      setNextStepsDate(application.next_steps_date || '');
    }
  }, [application]);

  if (!application) return null;

  const handleSave = () => {
    updateApplication.mutate({
      id: application.id,
      notes,
      next_steps: nextSteps,
      next_steps_date: nextStepsDate || null,
    });
    toast.success('Changes saved');
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this application?')) {
      deleteApplication.mutate(application.id);
      onClose();
    }
  };

  const handleAddContact = () => {
    if (!newContact.name.trim()) {
      toast.error('Contact name is required');
      return;
    }
    createContact.mutate({
      application_id: application.id,
      name: newContact.name,
      title: newContact.title || null,
      email: newContact.email || null,
      phone: newContact.phone || null,
    });
    setNewContact({ name: '', title: '', email: '', phone: '' });
    setShowAddContact(false);
  };

  const config = STAGE_CONFIG[application.status];

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/20 z-40 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-card border-l border-border z-50 slide-panel animate-slide-in-right overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium mb-2 inline-block', config.color)}>
                {config.label}
              </span>
              <h2 className="text-xl font-semibold">{application.role_title}</h2>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Briefcase className="w-4 h-4" />
                {application.company_name}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Applied Date */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
            <Calendar className="w-4 h-4" />
            Applied {format(new Date(application.date_applied), 'MMMM d, yyyy')}
          </div>

          {/* Notes */}
          <div className="mb-6">
            <Label htmlFor="notes" className="text-sm font-medium mb-2 block">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add notes about this application..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Next Steps */}
          <div className="mb-6">
            <Label htmlFor="nextSteps" className="text-sm font-medium mb-2 block">Next Steps</Label>
            <Textarea
              id="nextSteps"
              placeholder="What's the next action to take?"
              value={nextSteps}
              onChange={(e) => setNextSteps(e.target.value)}
              className="min-h-[80px] resize-none mb-2"
            />
            <div className="flex items-center gap-2">
              <Label htmlFor="nextStepsDate" className="text-sm text-muted-foreground">Due:</Label>
              <Input
                id="nextStepsDate"
                type="date"
                value={nextStepsDate}
                onChange={(e) => setNextStepsDate(e.target.value)}
                className="w-auto"
              />
            </div>
          </div>

          {/* Contacts */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium">Contacts</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddContact(!showAddContact)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>

            {showAddContact && (
              <div className="bg-secondary/50 rounded-lg p-4 mb-3 space-y-3 animate-fade-in">
                <Input
                  placeholder="Name *"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                />
                <Input
                  placeholder="Title (e.g., Recruiter)"
                  value={newContact.title}
                  onChange={(e) => setNewContact({ ...newContact, title: e.target.value })}
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                />
                <Input
                  placeholder="Phone"
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddContact} disabled={createContact.isPending}>
                    {createContact.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                    Add Contact
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowAddContact(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {loadingContacts ? (
              <div className="text-sm text-muted-foreground">Loading contacts...</div>
            ) : contacts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No contacts added yet</p>
            ) : (
              <div className="space-y-2">
                {contacts.map((contact) => (
                  <div key={contact.id} className="bg-secondary/50 rounded-lg p-3 group">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 font-medium">
                          <User className="w-4 h-4 text-muted-foreground" />
                          {contact.name}
                        </div>
                        {contact.title && (
                          <p className="text-sm text-muted-foreground mt-1">{contact.title}</p>
                        )}
                        <div className="flex flex-wrap gap-3 mt-2">
                          {contact.email && (
                            <a href={`mailto:${contact.email}`} className="flex items-center gap-1 text-sm text-primary hover:underline">
                              <Mail className="w-3 h-3" />
                              {contact.email}
                            </a>
                          )}
                          {contact.phone && (
                            <a href={`tel:${contact.phone}`} className="flex items-center gap-1 text-sm text-primary hover:underline">
                              <Phone className="w-3 h-3" />
                              {contact.phone}
                            </a>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                        onClick={() => deleteContact.mutate({ id: contact.id, applicationId: application.id })}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
            <Button onClick={handleSave} disabled={updateApplication.isPending}>
              {updateApplication.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
