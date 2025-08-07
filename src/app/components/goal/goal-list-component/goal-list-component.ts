import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { GoalFormComponent } from '../goal-form-component/goal-form-component';
import { GoalRequestDTO, GoalResponseDTO } from '../../../models/goal';
import { GoalService } from '../../../services/goal-service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-goal-list-component',
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    MatCardModule,
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule,
    DatePipe,
    MatTooltipModule,
    MatProgressSpinner,
    RouterLink
  ],
  templateUrl: './goal-list-component.html',
  styleUrls: ['./goal-list-component.css']
})
export class GoalListComponent implements OnInit {
  goals: GoalResponseDTO[] = [];
  loading = true;

  constructor(
    private goalService: GoalService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadGoals();
  }

  loadGoals() {
    this.loading = true;
    this.goalService.getGoals().subscribe({
      next: (res) => {
        this.goals = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to load goals', 'Close', { duration: 3000 });
      }
    });
  }

  addGoal() {
    const ref = this.dialog.open(GoalFormComponent, {});
    ref.afterClosed().subscribe((dto: GoalRequestDTO) => {
      if (dto) {
        this.goalService.createGoal(dto).subscribe({
          next: () => {
            this.snackBar.open('Goal created', 'Close', { duration: 2000 });
            this.loadGoals();
          },
          error: () => {
            this.snackBar.open('Failed to create goal', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  editGoal(goal: GoalResponseDTO) {
    const ref = this.dialog.open(GoalFormComponent, { data: goal });
    ref.afterClosed().subscribe((dto: GoalRequestDTO) => {
      if (dto) {
        this.goalService.updateGoal(goal.id, dto).subscribe({
          next: () => {
            this.snackBar.open('Goal updated', 'Close', { duration: 2000 });
            this.loadGoals();
          },
          error: () => {
            this.snackBar.open('Failed to update goal', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  deleteGoal(goal: GoalResponseDTO) {
    if (!confirm(`Are you sure you want to delete "${goal.title}"?`)) return;
    this.goalService.deleteGoal(goal.id).subscribe({
      next: () => {
        this.snackBar.open('Goal deleted', 'Close', { duration: 2000 });
        this.loadGoals();
      },
      error: () => {
        this.snackBar.open('Failed to delete goal', 'Close', { duration: 3000 });
      }
    });
  }
}
