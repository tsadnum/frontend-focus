import {
  Component,
  computed,
  inject
} from '@angular/core';
import {
  MatCard, MatCardHeader, MatCardTitle, MatCardContent
} from '@angular/material/card';
import {
  MatIconButton, MatButton
} from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import {
  NgIf, NgForOf, NgClass, DatePipe
} from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { EventResponseDTO } from '../../../models/event';
import { EventFormComponent } from '../../events/event-form-component/event-form-component';
import { DashboardDataService } from '../../../services/dashboard-data-service';
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-dashboard-event-card-component',
  standalone: true,
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatIcon,
    MatIconButton,
    MatButton,
    RouterLink,
    NgIf,
    NgForOf,
    NgClass,
    MatSnackBarModule,
    DatePipe
  ],
  templateUrl: './dashboard-event-card-component.html',
  styleUrls: [
    './dashboard-event-card-component.css',
    '../../../shared/styles/dashboard-cards.css'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardEventCardComponent {
  private readonly dashboardDataService = inject(DashboardDataService);
  private readonly dialog = inject(MatDialog);

  readonly events = computed(() =>
    (this.dashboardDataService.events() ?? [])
      .sort((a, b) =>
        new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
      )
  );

  readonly card = {
    title: 'Upcoming Events',
    route: '/events',
    colorClass: 'event-color',
    emptyStateIcon: 'calendar_today',
    emptyStateMessage: 'No upcoming events. Schedule one!',
    emptyStateAction: 'Create New Event'
  };

  openCreateEventDialog(): void {
    const dialogRef = this.dialog.open(EventFormComponent, {
      width: '500px',
      data: {}
    });

    dialogRef.afterClosed().subscribe((createdEvent: EventResponseDTO | undefined) => {
      if (createdEvent) {
        const current = this.dashboardDataService.events();
        this.dashboardDataService.events.set([...(current ?? []), createdEvent]);
      }
    });
  }

  getDateLabel(iso: string): string {
    const eventDate = new Date(iso);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(eventDate);
    target.setHours(0, 0, 0, 0);

    const diff = (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff < 0) return 'Past';
    if (diff <= 7) return `In ${Math.round(diff)} days`;
    return eventDate.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  getLabelClass(iso: string): string {
    const daysDiff = Math.round(
      (new Date(iso).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 0) return 'label-today';
    if (daysDiff === 1) return 'label-tomorrow';
    if (daysDiff < 0) return 'label-past';
    if (daysDiff <= 3) return 'label-soon';
    return 'label-upcoming';
  }
}
