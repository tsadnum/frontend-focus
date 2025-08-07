export interface DashboardCard {
  title: string;
  type: 'task' | 'habit' | 'goal' | 'session' | 'event' | 'profile';
  data: any[];
  cols: number;
  rows: number;
  route: string;
  colorClass: string;
  emptyStateIcon: string;
  emptyStateMessage: string;
  emptyStateAction: string;
  stats: {
    total?: number;
    completed?: number;
    inProgress?: number;
    pending?: number;
    cancelled?: number;
  };
}
