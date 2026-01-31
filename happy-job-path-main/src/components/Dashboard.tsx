import { useMemo } from 'react';
import { useApplications } from '@/hooks/useApplications';
import { STAGE_CONFIG, STAGE_ORDER, ApplicationStatus } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { startOfWeek, isAfter, parseISO } from 'date-fns';
import { Loader2, TrendingUp, Send, Percent, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const CHART_COLORS: Record<ApplicationStatus, string> = {
  applied: '#3b82f6',
  phone_screen: '#f59e0b',
  onsite: '#a855f7',
  offer: '#22c55e',
  rejected: '#ef4444',
};

export function Dashboard() {
  const { data: applications = [], isLoading } = useApplications();

  const stats = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    
    const thisWeekApplications = applications.filter((app) =>
      isAfter(parseISO(app.date_applied), weekStart)
    );

    const movedPastApplied = applications.filter(
      (app) => app.status !== 'applied'
    ).length;

    const responseRate = applications.length > 0
      ? Math.round((movedPastApplied / applications.length) * 100)
      : 0;

    const byStatus = STAGE_ORDER.map((status) => ({
      name: STAGE_CONFIG[status].label,
      value: applications.filter((app) => app.status === status).length,
      status,
    }));

    return {
      thisWeek: thisWeekApplications.length,
      total: applications.length,
      responseRate,
      byStatus,
    };
  }, [applications]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Send className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">This Week</span>
          </div>
          <p className="text-3xl font-bold">{stats.thisWeek}</p>
          <p className="text-sm text-muted-foreground">applications</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-sm text-muted-foreground">Total</span>
          </div>
          <p className="text-3xl font-bold">{stats.total}</p>
          <p className="text-sm text-muted-foreground">applications</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Percent className="w-5 h-5 text-purple-500" />
            </div>
            <span className="text-sm text-muted-foreground">Response Rate</span>
          </div>
          <p className="text-3xl font-bold">{stats.responseRate}%</p>
          <p className="text-sm text-muted-foreground">moved past applied</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-sm text-muted-foreground">Active</span>
          </div>
          <p className="text-3xl font-bold">
            {applications.filter((a) => a.status !== 'rejected' && a.status !== 'offer').length}
          </p>
          <p className="text-sm text-muted-foreground">in progress</p>
        </div>
      </div>

      {/* Pipeline Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="stat-card">
          <h3 className="font-medium mb-4">Pipeline Overview</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byStatus} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {stats.byStatus.map((entry) => (
                    <Cell key={entry.status} fill={CHART_COLORS[entry.status]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stage Cards */}
        <div className="stat-card">
          <h3 className="font-medium mb-4">Stage Breakdown</h3>
          <div className="space-y-3">
            {stats.byStatus.map((stage) => (
              <div key={stage.status} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: CHART_COLORS[stage.status] }}
                  />
                  <span className="font-medium">{stage.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold">{stage.value}</span>
                  {stats.total > 0 && (
                    <span className="text-sm text-muted-foreground">
                      ({Math.round((stage.value / stats.total) * 100)}%)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
