import {
  Component,
  HostListener,
  computed,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { DashboardProfileCardComponent } from '../dashboard-profile-card-component/dashboard-profile-card-component';
import { DashboardTaskCardComponent } from '../dashboard-task-card-component/dashboard-task-card-component';
import { DashboardGoalCardComponent } from '../dashboard-goal-card-component/dashboard-goal-card-component';
import { DashboardHabitCardComponent } from '../dashboard-habit-card-component/dashboard-habit-card-component';
import { DashboardEventCardComponent } from '../dashboard-event-card-component/dashboard-event-card-component';
import { DashboardDiaryCardComponent } from '../dashboard-diary-card-component/dashboard-diary-card-component';
import { DashboardTimerCardComponent } from '../dashboard-timer-card-component/dashboard-timer-card-component';
import { DashboardDataService } from '../../../services/dashboard-data-service';
import { ChangeDetectionStrategy } from '@angular/core';

export interface DashboardTile {
  cols: number;
  rows: number;
  type: DashboardTileType;
}

type DashboardTileType =
  | 'profile'
  | 'task'
  | 'timer'
  | 'goal'
  | 'habit'
  | 'event'
  | 'diary';

@Component({
  selector: 'app-dashboard-component',
  standalone: true,
  imports: [
    CommonModule,
    MatGridListModule
  ],
  templateUrl: './dashboard-component.html',
  styleUrl: './dashboard-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  private readonly dashboardDataService = inject(DashboardDataService);

  readonly initialTiles: DashboardTile[] = [
    { type: 'profile', cols: 1, rows: 1 },
    { type: 'task', cols: 1, rows: 2 },
    { type: 'timer', cols: 1, rows: 1 },
    { type: 'goal', cols: 1, rows: 1 },
    { type: 'habit', cols: 1, rows: 1 },
    { type: 'event', cols: 1, rows: 1 },
    { type: 'diary', cols: 1, rows: 1 }
  ];

  readonly componentMap: Record<DashboardTileType, any> = {
    profile: DashboardProfileCardComponent,
    task: DashboardTaskCardComponent,
    timer: DashboardTimerCardComponent,
    goal: DashboardGoalCardComponent,
    habit: DashboardHabitCardComponent,
    event: DashboardEventCardComponent,
    diary: DashboardDiaryCardComponent
  };

  private readonly screenWidth = signal(window.innerWidth);

  readonly cols = computed(() => {
    const width = this.screenWidth();
    if (width < 768) return 1;
    if (width < 1024) return 2;
    return 4;
  });

  readonly tiles = computed(() =>
    this.initialTiles.map(tile => ({
      ...tile,
      cols: this.cols() === 2 && tile.type === 'event' ? 2 : 1
    }))
  );

  constructor() {
    this.dashboardDataService.loadDashboardData();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.screenWidth.set(window.innerWidth);
  }

  getComponent(type: DashboardTileType) {
    return this.componentMap[type];
  }
}
