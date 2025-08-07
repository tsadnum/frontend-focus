import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormControl
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }     from '@angular/material/input';
import { MatButtonModule }    from '@angular/material/button';
import { MatDatepickerModule }from '@angular/material/datepicker';
import { MatNativeDateModule }from '@angular/material/core';
import { MatSelectModule }    from '@angular/material/select';
import { EventRequestDTO, EventResponseDTO } from '../../../models/event';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule
  ],
  templateUrl: './event-form-component.html',
  styleUrls: ['./event-form-component.css']
})
export class EventFormComponent {
  fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef<EventFormComponent>);
  dialogData = inject<{ mode: 'create' | 'edit', event?: EventResponseDTO }>(MAT_DIALOG_DATA);

  hourOptions = Array.from({ length: 24 * 4 }, (_, i) => {
    const h = Math.floor(i / 4);
    const m = (i % 4) * 15;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  });

  form = this.fb.group({
    title: new FormControl<string>(
      this.dialogData.event?.title ?? '',
      { nonNullable: true, validators: [Validators.required] }
    ),
    description: new FormControl<string>(
      this.dialogData.event?.description ?? '',
      { nonNullable: true }
    ),
    location: new FormControl<string>(
      this.dialogData.event?.location ?? '',
      { nonNullable: true }
    ),
    startDate: new FormControl<Date | null>(
      this.dialogData.event ? new Date(this.dialogData.event.startDateTime) : null,
      { nonNullable: false, validators: [Validators.required] }
    ),
    startTime: new FormControl<string>(
      this.dialogData.event ? this.toTimeString(this.dialogData.event.startDateTime) : '',
      { nonNullable: true, validators: [Validators.required] }
    ),
    endDate: new FormControl<Date | null>(
      this.dialogData.event ? new Date(this.dialogData.event.endDateTime) : null,
      { nonNullable: false, validators: [Validators.required] }
    ),
    endTime: new FormControl<string>(
      this.dialogData.event ? this.toTimeString(this.dialogData.event.endDateTime) : '',
      { nonNullable: true, validators: [Validators.required] }
    )
  });

  private toTimeString(iso: string): string {
    const d = new Date(iso);
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    return `${hh}:${mm}`;
  }

  private combineDateTime(date: Date, time: string): string {
    const [hh, mm] = time.split(':').map(Number);
    const d = new Date(date);
    d.setHours(hh, mm, 0, 0);
    return d.toISOString();
  }

  save(): void {
    if (this.form.invalid) return;
    const v = this.form.value;

    const startISO = this.combineDateTime(v.startDate!, v.startTime!);
    const endISO   = this.combineDateTime(v.endDate!,   v.endTime!);

    const payload: EventRequestDTO = {
      title: v.title!,
      description: v.description!,
      location: v.location!,
      startDateTime: startISO,
      endDateTime: endISO
    };

    if (this.dialogData.mode === 'create') {
      this.dialogRef.close({ action: 'create', data: payload });
    } else if (this.dialogData.mode === 'edit') {
      this.dialogRef.close({ action: 'update', data: payload });
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

  delete(): void {
    this.dialogRef.close({ action: 'delete' });
  }
}
