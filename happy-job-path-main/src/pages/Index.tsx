import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/AuthForm';
import { Navbar } from '@/components/Navbar';
import { KanbanBoard } from '@/components/KanbanBoard';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar onAddApplication={() => setAddDialogOpen(true)} />
      <main className="flex-1">
        <KanbanBoard addDialogOpen={addDialogOpen} setAddDialogOpen={setAddDialogOpen} />
      </main>
    </div>
  );
};

export default Index;
