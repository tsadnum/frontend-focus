import { Component, computed, signal, inject } from '@angular/core';
import { DashboardDataService } from '../../../services/dashboard-data-service';
import { TaskService } from '../../../services/task-service';
import { TaskFormComponent } from '../../tasks/task-form-component/task-form-component';
import { TaskRequestDTO, TaskResponseDTO, TaskStatus } from '../../../models/task';
import { MatDialog } from '@angular/material/dialog';

import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardTitle
} from '@angular/material/card';
import { MatButton, MatIconButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-dashboard-task-card-component',
  standalone: true,
  templateUrl: './dashboard-task-card-component.html',
  styleUrls: ['./dashboard-task-card-component.css','../../../shared/styles/dashboard-cards.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatIconButton,
    MatIcon,
    RouterLink,
    MatCardContent,
    NgIf,
    NgForOf,
    MatCheckbox,
    MatProgressSpinner,
    MatButton,
    NgClass
  ]
})
export class DashboardTaskCardComponent {
  private readonly dashboardData = inject(DashboardDataService);
  private readonly taskService = inject(TaskService);
  private readonly dialog = inject(MatDialog);

  readonly tasks = computed(() => this.dashboardData.tasks());
  readonly updatingTaskIds = signal<Set<number>>(new Set());

  readonly stats = computed(() => {
    const tasks = this.tasks();
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'COMPLETED').length,
      inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      pending: tasks.filter(t => t.status === 'PENDING').length,
      cancelled: tasks.filter(t => t.status === 'CANCELLED').length
    };
  });

  openTaskDialog(): void {
    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: '800px',
      data: {}
    });

    dialogRef.afterClosed().subscribe((newTask: TaskResponseDTO | null) => {
      if (newTask && newTask.id) {
        const current = this.dashboardData.tasks();
        this.dashboardData.tasks.set([newTask, ...current]);
      }
    });
  }


  onStatusChange(task: TaskResponseDTO, checked: boolean): void {
    if (!task.id) return;

    const updating = new Set(this.updatingTaskIds());
    updating.add(task.id);
    this.updatingTaskIds.set(updating);

    const updatedTask: TaskRequestDTO = {
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
      type: task.type,
      status: checked ? TaskStatus.COMPLETED : TaskStatus.PENDING
    };

    this.taskService.update(task.id, updatedTask).subscribe({
      next: (updated) => {
        task.status = updated.status;
        this.dashboardData.loadDashboardData();
      },
      error: (err) => {
        console.error('Error updating task status', err);
      },
      complete: () => {
        const updatedSet = new Set(this.updatingTaskIds());
        updatedSet.delete(task.id);
        this.updatingTaskIds.set(updatedSet);
      }
    });
  }

  isOverdue(dueDate: string): boolean {
    const due = new Date(dueDate);
    const today = new Date();
    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return due < today;
  }

  formatTaskDate(dueDate: string): string {
    const due = new Date(dueDate);
    const today = new Date();
    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''}`;
    if (diffDays === 0) return 'Today';
    return `In ${diffDays} day${diffDays > 1 ? 's' : ''}`;
  }

  getPriorityIcon(priority: string): string {
    const icons: Record<string, string> = {
      LOW: 'arrow_downward',
      MEDIUM: 'drag_handle',
      HIGH: 'arrow_upward',
      URGENT: 'warning'
    };
    return icons[priority] || 'priority_high';
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      COMPLETED: 'check_circle',
      IN_PROGRESS: 'autorenew',
      PENDING: 'pending_actions',
      CANCELLED: 'cancel'
    };
    return icons[status] || 'help_outline';
  }

  getStatusText(status: string): string {
    const texts: Record<string, string> = {
      COMPLETED: 'Completed',
      IN_PROGRESS: 'In progress',
      PENDING: 'Pending',
      CANCELLED: 'Cancelled'
    };
    return texts[status] || 'Unknown';
  }
}
