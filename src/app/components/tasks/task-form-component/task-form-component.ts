import {  Component,  OnInit,  inject} from '@angular/core';
import { FormBuilder,  ReactiveFormsModule, Validators} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule }      from '@angular/material/form-field';
import { MatInputModule }          from '@angular/material/input';
import { MatSelectModule }         from '@angular/material/select';
import { MatDatepickerModule }     from '@angular/material/datepicker';
import { MatButtonModule }         from '@angular/material/button';
import { MatIconModule }           from '@angular/material/icon';
import { MatNativeDateModule }     from '@angular/material/core';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import { TaskService }             from '../../../services/task-service';
import { EnumLabelPipe }           from '../../../shared/pipes/enum-label-pipe';
import {TaskPriority, TaskRequestDTO, TaskResponseDTO, TaskStatus, TaskType} from '../../../models/task';
import {MatTooltip} from '@angular/material/tooltip';

@Component({
  selector: 'app-task-form-component',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    NgForOf,
    EnumLabelPipe,
    NgClass,
    MatTooltip,
    NgIf
  ],
  templateUrl: './task-form-component.html',
  styleUrls: ['./task-form-component.css']
})
export class TaskFormComponent implements OnInit {
  private fb      = inject(FormBuilder);
  private taskSvc = inject(TaskService);
  private dialogRef = inject<MatDialogRef<TaskFormComponent>>(MatDialogRef);

  readonly data = inject<Partial<TaskResponseDTO>>(MAT_DIALOG_DATA);

  isSubmitting = false;

  form = this.fb.group({
    title:       this.fb.control<string>('', Validators.required),
    description: this.fb.control<string>(''),
    type:        this.fb.control<TaskType | null>(null, Validators.required),
    status:      this.fb.control<TaskStatus | null>(null, Validators.required),
    priority:    this.fb.control<TaskPriority | null>(null, Validators.required),
    startDate:   this.fb.control<Date | null>(null),
    dueDate:     this.fb.control<Date | null>(null)
  });

  types      = (Object.values(TaskType)   .filter(v => typeof 'string') as TaskType[]);
  statuses   = (Object.values(TaskStatus) .filter(v => typeof 'string') as TaskStatus[]);
  priorities = (Object.values(TaskPriority).filter(v => typeof 'string') as TaskPriority[]);

  ngOnInit(): void {
    if (this.data) {
      this.form.patchValue({
        title:       this.data.title,
        description: this.data.description,
        type:        this.data.type,
        status:      this.data.status,
        priority:    this.data.priority,
        startDate:   this.data.startDate ? new Date(this.data.startDate) : null,
        dueDate:     this.data.dueDate   ? new Date(this.data.dueDate)   : null
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.isSubmitting = true;

    const dto = this.form.value as TaskRequestDTO;

    if (this.data.id != null) {
      this.taskSvc.update(this.data.id, dto).subscribe({
        next: () => this.dialogRef.close('updated'),
        error: () => this.isSubmitting = false,
        complete: () => this.isSubmitting = false
      });
    } else {
      this.taskSvc.create(dto).subscribe({
        next: (createdTask: TaskResponseDTO) => {
          this.dialogRef.close(createdTask);
        },
        error: () => this.isSubmitting = false,
        complete: () => this.isSubmitting = false
      });
    }
  }


  cancel(): void {
    this.dialogRef.close();
  }


  getTypeIcon(type: TaskType): string {
    switch (type) {
      case 'PERSONAL': return 'person';
      case 'WORK': return 'work';
      case 'STUDY': return 'study';
      case 'OTHER': return 'other';
      default: return 'task';
    }
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

  getPriorityClass(priority: TaskPriority): string {
    switch (priority) {
      case 'URGENT': return 'priority-urgent';
      case 'HIGH': return 'priority-high';
      case 'MEDIUM': return 'priority-medium';
      case 'LOW': return 'priority-low';
      default: return '';
    }
  }

  getTaskDuration(): string {
    const startDate = this.form.get('startDate')?.value;
    const dueDate = this.form.get('dueDate')?.value;

    if (!startDate || !dueDate) return '';

    const start = new Date(startDate);
    const due = new Date(dueDate);
    const diffTime = Math.abs(due.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day';
    if (diffDays < 7) return `${diffDays} days`;
    if (diffDays < 30) {
      const weeks = Math.round(diffDays / 7);
      return weeks === 1 ? '1 week' : `${weeks} weeks`;
    }

    const months = Math.round(diffDays / 30);
    return months === 1 ? '1 month' : `${months} months`;
  }
}
