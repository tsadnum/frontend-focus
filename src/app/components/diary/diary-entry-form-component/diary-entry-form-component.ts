import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { DiaryEntryRequestDTO, DiaryEntryResponseDTO } from '../../../models/diary-entry';
import { DiaryEntryService } from '../../../services/diary-entry-service';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-diary-form-component',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIcon,
    MatTooltip,
    NgIf
  ],
  templateUrl: './diary-entry-form-component.html',
  styleUrl: './diary-entry-form-component.css'
})
export class DiaryEntryFormComponent implements OnInit {
  form!: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DiaryEntryFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DiaryEntryResponseDTO | null,
    private diaryService: DiaryEntryService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      title: [this.data?.title ?? '', Validators.required],
      content: [this.data?.content ?? '', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isSubmitting = true;

    const dto: DiaryEntryRequestDTO = {
      title: this.form.value.title,
      content: this.form.value.content,
      entryDate: new Date().toISOString().split('T')[0]
    };

    const request$ = this.data?.id
      ? this.diaryService.update(this.data.id, dto)
      : this.diaryService.create(dto);

    request$.subscribe({
      next: (entry) => this.dialogRef.close(entry),
      error: (err) => {
        console.error('Failed to save diary entry', err);
        this.isSubmitting = false;
      },
      complete: () => this.isSubmitting = false
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
