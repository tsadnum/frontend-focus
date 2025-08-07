import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions
} from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Habit } from '../../../models/habit';
import { HabitService } from '../../../services/habit-service';
import { NgForOf } from '@angular/common';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-habit-form-component',
  standalone: true,
  templateUrl: './habit-form-component.html',
  styleUrl: './habit-form-component.css',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    MatSlideToggle,
    MatButton,
    MatIcon,
    MatIconModule,
    MatIconButton,
    MatChipsModule,
    NgForOf
  ]
})
export class HabitFormComponent implements OnInit {
  form!: FormGroup;
  days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  reminderTimes: string[] = [];
  newReminderTime: string = '';

  constructor(
    private fb: FormBuilder,
    private habitService: HabitService,
    private dialogRef: MatDialogRef<HabitFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data?: Habit
  ) {}

  ngOnInit(): void {
    this.reminderTimes = this.data?.reminderTimes || [];

    this.form = this.fb.group({
      name: [this.data?.name || '', Validators.required],
      description: [this.data?.description || ''],
      activeDays: [this.data?.activeDays || []],
      isActive: [this.data?.active ?? true],
    });
  }

  addReminderTime() {
    if (!this.newReminderTime || this.reminderTimes.includes(this.newReminderTime)) return;
    this.reminderTimes.push(this.newReminderTime);
    this.newReminderTime = '';
  }

  removeReminderTime(index: number) {
    this.reminderTimes.splice(index, 1);
  }

  onSubmit() {
    if (this.form.invalid) return;

    const formValue = this.form.value;

    const payload: Habit = {
      name: formValue.name,
      description: formValue.description,
      activeDays: formValue.activeDays,
      reminderTimes: this.reminderTimes,
      active: formValue.isActive,
      icon: this.data?.icon ?? 'default-icon' // o lo que uses como fallback
    };

    const request$ = this.data
      ? this.habitService.updateHabit(this.data.id!, payload)
      : this.habitService.createHabit(payload);

    request$.subscribe((createdOrUpdatedHabit: Habit) => {
      this.dialogRef.close(createdOrUpdatedHabit);
    });
  }

  onCancel() {
    this.dialogRef.close();
  }
}
