import {
  Component,
  inject,
  computed,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  MatCard,
  MatCardHeader,
  MatCardTitle,
  MatCardContent
} from '@angular/material/card';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatCheckbox } from '@angular/material/checkbox';
import { NgIf, NgForOf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { HabitFormComponent } from '../../habit/habit-form-component/habit-form-component';
import { HabitService } from '../../../services/habit-service';
import { DashboardDataService } from '../../../services/dashboard-data-service';
import { DashboardHabit, HabitLogRequest } from '../../../models/habit';

@Component({
  selector: 'app-dashboard-habit-card-component',
  standalone: true,
  templateUrl: './dashboard-habit-card-component.html',
  styleUrls: ['./dashboard-habit-card-component.css',
    '../../../shared/styles/dashboard-cards.css' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatButton,
    MatIconButton,
    MatIcon,
    MatCheckbox,
    NgIf,
    NgForOf,
    RouterLink
  ]
})
export class DashboardHabitCardComponent {
  private readonly dashboardDataService = inject(DashboardDataService);
  private readonly habitService = inject(HabitService);
  private readonly dialog = inject(MatDialog);

  habits = computed(() => this.dashboardDataService.habits());
  currentProcessingHabitId: number | null = null;
  isLoading = false;

  toggleHabitCompletion(habit: DashboardHabit): void {
    if (this.isHabitLoading(habit.id!)) return;

    const newCompleted = !habit.completedToday;
    habit.completedToday = newCompleted;
    this.createHabitLog(habit, newCompleted);
  }

  private createHabitLog(habit: DashboardHabit, completed: boolean): void {
    if (!habit.id) return;

    this.isLoading = true;
    this.currentProcessingHabitId = habit.id;

    const logRequest: HabitLogRequest = {
      habitId: habit.id,
      completed,
      completionTime: new Date().toISOString()
    };

    this.habitService.logHabit(logRequest).subscribe({
      next: () => {
        habit.currentStreak = completed
          ? (habit.currentStreak || 0) + 1
          : Math.max(0, (habit.currentStreak || 0) - 1);

        this.currentProcessingHabitId = null;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to log habit:', err);
        habit.completedToday = !completed;
        alert('Failed to log habit. Please try again.');
        this.currentProcessingHabitId = null;
        this.isLoading = false;
      }
    });
  }

  openCreateHabit(): void {
    const dialogRef = this.dialog.open(HabitFormComponent);

    dialogRef.afterClosed().subscribe((newHabit: DashboardHabit | null) => {
      if (newHabit && newHabit.id) {
        const current = this.dashboardDataService.habits();
        this.dashboardDataService.habits.set([newHabit, ...current]);
      }
    });
  }

  isHabitLoading(habitId: number): boolean {
    return this.isLoading && this.currentProcessingHabitId === habitId;
  }

  trackByHabitId(index: number, habit: DashboardHabit): number {
    return habit.id!;
  }
}
