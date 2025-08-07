import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { GoalRequestDTO, GoalResponseDTO } from '../../../models/goal';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';

@Component({
  selector: 'app-goal-form-component',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSliderModule,
    MatButtonModule,
    MatIcon,
    MatTooltip
  ],
  templateUrl: './goal-form-component.html',
  styleUrls: ['./goal-form-component.css']
})
export class GoalFormComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<GoalFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: GoalResponseDTO | null
  ) {
    this.form = this.fb.group({
      title: [this.data?.title ?? '', Validators.required],
      description: [this.data?.description ?? ''],
      progress: [
        this.data?.progress ?? 0,
        [Validators.required, Validators.min(0), Validators.max(100)]
      ],
      targetDate: [
        this.data?.targetDate ? new Date(this.data.targetDate) : new Date(),
        Validators.required
      ]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const { title, description, progress, targetDate } = this.form.value;

    const dto: GoalRequestDTO = {
      title,
      description,
      progress,
      targetDate: targetDate.toISOString().split('T')[0]
    };

    this.dialogRef.close(dto);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
