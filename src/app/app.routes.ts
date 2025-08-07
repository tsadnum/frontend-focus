import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout-component/layout-component';
import { DashboardComponent } from './components/dashboard/dashboard-component/dashboard-component';
import { UserListComponent } from './components/user/user-list-component/user-list-component';
import { HabitListComponent } from './components/habit/habit-list-component/habit-list-component';
import { GoalListComponent } from './components/goal/goal-list-component/goal-list-component';
import { EventCalendarComponent } from './components/events/event-calendar-component/event-calendar-component';
import { TaskKanbanComponent } from './components/tasks/task-kanban-component/task-kanban-component';
import { DiaryEntryListComponent } from './components/diary/diary-entry-list-component/diary-entry-list-component';

import { authGuard } from './security/auth-guard';
import { adminGuard } from './security/admin-guard';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'habits', component: HabitListComponent },
      { path: 'goals', component: GoalListComponent },
      { path: 'events', component: EventCalendarComponent },
      { path: 'tasks', component: TaskKanbanComponent },
      { path: 'diary', component: DiaryEntryListComponent },
      {
        path: 'admin/users',
        component: UserListComponent,
        canActivate: [adminGuard]
      }
    ]
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./security/auth.routes').then((m) => m.routes)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
