import {
  Component,
  OnInit,
  inject
} from '@angular/core';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
  DragDropModule
} from '@angular/cdk/drag-drop';
import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { TaskService } from '../../../services/task-service';
import {TaskFormComponent} from '../task-form-component/task-form-component';
import {TaskResponseDTO, TaskStatus} from '../../../models/task';
import {RouterLink} from '@angular/router';
import {MatTooltip} from '@angular/material/tooltip';

@Component({
  selector: 'app-task-kanban-component',
  standalone: true,
  imports: [
    CdkDropListGroup,
    NgForOf,
    CdkDropList,
    CdkDrag,
    MatDialogModule,
    MatButton,
    MatIconButton,
    MatIcon,
    NgClass,
    DragDropModule,
    RouterLink,
    MatTooltip,
    DatePipe,
    NgIf
  ],
  templateUrl: './task-kanban-component.html',
  styleUrl: './task-kanban-component.css'
})
export class TaskKanbanComponent implements OnInit {
  private taskSvc = inject(TaskService);
  private dialog = inject(MatDialog);

  tasksByStatus: Record<TaskStatus, TaskResponseDTO[]> = {
    PENDING: [],
    IN_PROGRESS: [],
    COMPLETED: [],
    CANCELLED: []
  };

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskSvc.getKanban().subscribe((data) => {
      this.tasksByStatus = {
        PENDING: data['PENDING'] || [],
        IN_PROGRESS: data['IN_PROGRESS'] || [],
        COMPLETED: data['COMPLETED'] || [],
        CANCELLED: data['CANCELLED'] || []
      };
    });
  }

  drop(event: CdkDragDrop<TaskResponseDTO[]>, newStatus: TaskStatus): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const task = event.previousContainer.data[event.previousIndex];
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      const updatedTask: TaskResponseDTO = { ...task, status: newStatus };
      this.taskSvc.update(task.id!, updatedTask).subscribe();
    }
  }

  openCreateTaskDialog(): void {
    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: '800px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'saved') {
        this.loadTasks();
      }
    });
  }

  openEditTaskDialog(task: TaskResponseDTO): void {
    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: '800px',
      data: task,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'saved') {
        this.loadTasks();
      }
    });
  }

  deleteTask(task: TaskResponseDTO): void {
    const confirmed = confirm(`Delete task "${task.title}"?`);
    if (confirmed) {
      this.taskSvc.delete(task.id!).subscribe(() => this.loadTasks());
    }
  }

  getTaskLabel(status: TaskStatus): string {
    return status
      .toLowerCase()
      .split('_')
      .map(w => w[0].toUpperCase() + w.slice(1))
      .join(' ');
  }

  get statuses(): TaskStatus[] {
    return Object.values(TaskStatus).filter(v => typeof 'string') as TaskStatus[];
  }

  sanitizeId(status: string): string {
    return status.toLowerCase().replace(/_/g, '-');
  }

  get dropListIds(): string[] {
    return this.statuses.map(status => this.sanitizeId(status));
  }

  getConnectedIds(status: TaskStatus): string[] {
    const id = this.sanitizeId(status);
    return this.dropListIds.filter(x => x !== id);
  }

  getPriorityClass(priority: TaskResponseDTO['priority']): string {
    switch (priority) {
      case 'URGENT': return 'priority-urgent';
      case 'HIGH':   return 'priority-high';
      case 'MEDIUM': return 'priority-medium';
      case 'LOW':    return 'priority-low';
      default:       return '';
    }
  }

  trackByTaskId(_index: number, task: TaskResponseDTO): number {
    return task.id!;
  }

  getTotalTasksCount(): number {
    return Object.values(this.tasksByStatus).reduce((total, tasks) => total + tasks.length, 0);
  }

  getStatusClass(status: TaskStatus): string {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'IN_PROGRESS': return 'status-in-progress';
      case 'COMPLETED': return 'status-completed';
      case 'CANCELLED': return 'status-cancelled';
      default: return '';
    }
  }

  getColumnEmptyIcon(status: TaskStatus): string {
    switch (status) {
      case 'PENDING': return 'inbox';
      case 'IN_PROGRESS': return 'hourglass_empty';
      case 'COMPLETED': return 'check_circle_outline';
      case 'CANCELLED': return 'cancel';
      default: return 'task';
    }
  }

  getColumnEmptyMessage(status: TaskStatus): string {
    switch (status) {
      case 'PENDING': return 'No pending tasks';
      case 'IN_PROGRESS': return 'No tasks in progress';
      case 'COMPLETED': return 'No completed tasks';
      case 'CANCELLED': return 'No cancelled tasks';
      default: return 'No tasks';
    }
  }
}
