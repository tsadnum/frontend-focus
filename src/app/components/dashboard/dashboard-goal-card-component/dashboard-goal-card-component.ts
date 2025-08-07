import {
  Component,
  computed,
  inject,
  signal,
  effect,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  MatCard,
  MatCardHeader,
  MatCardTitle,
  MatCardContent
} from '@angular/material/card';
import {
  MatButton,
  MatIconButton
} from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIf, NgForOf } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { GoalFormComponent } from '../../goal/goal-form-component/goal-form-component';
import { GoalService } from '../../../services/goal-service';
import { DashboardDataService } from '../../../services/dashboard-data-service';
import { GoalRequestDTO, GoalResponseDTO } from '../../../models/goal';

@Component({
  selector: 'app-dashboard-goal-card-component',
  standalone: true,
  templateUrl: './dashboard-goal-card-component.html',
  styleUrls: [
    './dashboard-goal-card-component.css',
    '../../../shared/styles/dashboard-cards.css'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatIcon,
    MatIconButton,
    MatButton,
    RouterLink,
    NgIf,
    NgForOf,
    MatSliderModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class DashboardGoalCardComponent {
  private readonly dialog = inject(MatDialog);
  private readonly goalService = inject(GoalService);
  private readonly dashboardDataService = inject(DashboardDataService);

  private readonly _goals = signal<GoalResponseDTO[]>([]);

  constructor() {
    // ✅ Reacciona a cambios del DashboardDataService
    effect(() => {
      const newGoals = this.dashboardDataService.goals() ?? [];
      this._goals.set(newGoals);
    });
  }

  readonly goals = computed(() =>
    [...this._goals()].sort((a, b) =>
      (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt)
    )
  );

  readonly stats = computed(() => {
    const list = this._goals();
    return {
      total: list.length,
      completed: list.filter(g => g.progress >= 100).length
    };
  });

  readonly card = {
    title: 'Goals',
    route: '/goals',
    colorClass: 'goal-color',
    emptyStateIcon: 'flag',
    emptyStateMessage: 'You have no goals yet.',
    emptyStateAction: 'Create New Goal'
  };

  openAddGoalDialog(): void {
    const dialogRef = this.dialog.open(GoalFormComponent, {
      width: '400px',
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe((newGoalDto: GoalRequestDTO | undefined) => {
      if (newGoalDto) {
        this.goalService.createGoal(newGoalDto).subscribe({
          next: (createdGoal) => {
            this._goals.update(goals => [createdGoal, ...goals]);
          },
          error: err => console.error('Failed to create goal', err)
        });
      }
    });
  }

  handleSliderInput(event: Event, goal: GoalResponseDTO): void {
    const newValue = (event.target as HTMLInputElement).valueAsNumber;
    this.updateGoalProgress(goal, newValue);
  }

  updateGoalProgress(goal: GoalResponseDTO, newValue: number | null): void {
    if (newValue === null || goal.progress === newValue) return;

    const updatedGoal: GoalRequestDTO = {
      title: goal.title,
      description: goal.description,
      progress: newValue,
      targetDate: goal.targetDate
    };

    this.goalService.updateGoal(goal.id, updatedGoal).subscribe({
      next: (updated) => {
        this._goals.update(goals =>
          goals.map(g =>
            g.id === goal.id
              ? { ...g, progress: updated.progress, updatedAt: updated.updatedAt }
              : g
          )
        );
      },
      error: err => console.error(`Failed to update goal ${goal.id}`, err)
    });
  }
}
