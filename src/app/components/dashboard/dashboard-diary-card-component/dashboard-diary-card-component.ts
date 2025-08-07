import {
  Component,
  computed,
  inject
} from '@angular/core';
import {
  MatCard,
  MatCardHeader,
  MatCardTitle,
  MatCardContent
} from '@angular/material/card';
import {
  MatButton,
  MatIconButton
} from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { DatePipe, NgIf, NgForOf } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DiaryEntryFormComponent } from '../../diary/diary-entry-form-component/diary-entry-form-component';
import { DashboardDataService } from '../../../services/dashboard-data-service';
import { DiaryEntryResponseDTO } from '../../../models/diary-entry';

@Component({
  selector: 'app-dashboard-diary-card-component',
  standalone: true,
  templateUrl: './dashboard-diary-card-component.html',
  styleUrls: [
    './dashboard-diary-card-component.css',
    '../../../shared/styles/dashboard-cards.css'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatButton,
    MatIconButton,
    MatIcon,
    MatProgressSpinner,
    NgIf,
    NgForOf,
    DatePipe,
    RouterLink
  ]
})
export class DashboardDiaryCardComponent {
  private readonly dashboardDataService = inject(DashboardDataService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  readonly loading = computed(() => this.dashboardDataService.isLoading());

  readonly diaryEntries = computed(() =>
    (this.dashboardDataService.diaryEntries() ?? [])
      .filter(e => e.title || e.content)
      .sort((a, b) =>
        new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
      )
  );

  readonly topThreeEntries = computed(() =>
    this.diaryEntries().slice(0, 3)
  );

  openCreateEntry(): void {
    const dialogRef = this.dialog.open(DiaryEntryFormComponent, {
      width: '500px',
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe((newEntry: DiaryEntryResponseDTO | undefined) => {
      if (newEntry) {
        const current = this.dashboardDataService.diaryEntries();
        this.dashboardDataService.diaryEntries.set([newEntry, ...(current ?? [])]);
      }
    });
  }

  goToEntry(entryId: number): void {
    this.router.navigate(['/diary', entryId]);
  }
}
