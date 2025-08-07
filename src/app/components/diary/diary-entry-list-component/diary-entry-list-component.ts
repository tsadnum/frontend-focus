import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { DiaryEntryService } from '../../../services/diary-entry-service';
import { groupByDateLabel } from '../../../shared/utils/group-by-date-util';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DiaryEntryFormComponent } from '../diary-entry-form-component/diary-entry-form-component';
import { DatePipe, NgForOf, NgIf, SlicePipe } from '@angular/common';
import { MatButton, MatFabButton, MatIconButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { DiaryEntryResponseDTO } from '../../../models/diary-entry';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-diary-entry-list-component',
  standalone: true,
  imports: [
    MatIcon,
    NgIf,
    NgForOf,
    MatButton,
    MatFabButton,
    DatePipe,
    SlicePipe,
    MatTooltip,
    MatIconButton,
    RouterLink,
    MatProgressSpinner
  ],
  templateUrl: './diary-entry-list-component.html',
  styleUrl: './diary-entry-list-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DiaryEntryListComponent implements OnInit {
  groupedEntries: { label: string; entries: DiaryEntryResponseDTO[] }[] = [];
  loading = true;

  constructor(
    private diaryService: DiaryEntryService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadEntries();
  }

  loadEntries(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.diaryService.getAll().subscribe({
      next: (entries) => {
        console.log('Loaded diary entries:', entries);
        this.groupedEntries = groupByDateLabel(entries, 'entryDate');
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
        this.snackBar.open('Failed to load diary entries. Please try again later.', 'Close', {
          duration: 4000
        });
      }
    });
  }

  onEdit(entry: DiaryEntryResponseDTO | null): void {
    const dialogRef = this.dialog.open(DiaryEntryFormComponent, {
      width: '800px',
      data: entry ? { ...entry } : null,
      disableClose: true,
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      const { id, ...dto } = result;

      (id
          ? this.diaryService.update(id, dto)
          : this.diaryService.create(dto)
      ).subscribe({
        next: (entry) => {
          const flat = this.groupedEntries.flatMap(g => g.entries);
          const updatedList = id
            ? flat.map(e => e.id === entry.id ? entry : e)
            : [...flat, entry];

          this.groupedEntries = groupByDateLabel(updatedList, 'entryDate');
          this.snackBar.open(
            `Diary entry ${id ? 'updated' : 'created'} successfully.`,
            'Close',
            { duration: 3000 }
          );
          this.cdr.markForCheck();
        },
        error: () => {
          this.snackBar.open(
            `Failed to ${id ? 'update' : 'create'} diary entry.`,
            'Close',
            { duration: 4000 }
          );
        }
      });
    });
  }

  onDelete(entry: DiaryEntryResponseDTO): void {
    const confirmed = confirm(`Are you sure you want to delete the entry "${entry.title}"?`);
    if (!confirmed) return;

    this.diaryService.delete(entry.id).subscribe({
      next: () => {
        this.groupedEntries = this.groupedEntries
          .map(group => ({
            ...group,
            entries: group.entries.filter(e => e.id !== entry.id)
          }))
          .filter(group => group.entries.length > 0);

        this.snackBar.open('Diary entry deleted successfully.', 'Close', { duration: 3000 });
        this.cdr.markForCheck();
      },
      error: () => {
        this.snackBar.open('Failed to delete the diary entry. Please try again.', 'Close', {
          duration: 4000
        });
      }
    });
  }

  getTotalEntriesCount(): number {
    return this.groupedEntries.reduce((total, group) => total + group.entries.length, 0);
  }
}
